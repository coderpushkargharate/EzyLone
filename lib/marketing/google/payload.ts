import { googleHash } from '../normalize';
import type { ClassifiedError } from '../types';

// Pure builders/parsers for Google conversion uploads.
//
// Uploads use the Data Manager API (POST https://datamanager.googleapis.com/v1/events:ingest).
// Google's offline-conversion guide states that from 15 June 2026
// ConversionUploadService.UploadClickConversions fails for developer tokens with
// no prior upload history and directs new integrations to the Data Manager API.
// Retractions use the Google Ads API ConversionAdjustmentUploadService.
// Docs: https://developers.google.com/data-manager/api/devguides/events/google-ads/offline/send-events
//       https://developers.google.com/data-manager/api/reference/rest/v1/events/ingest
//       https://developers.google.com/google-ads/api/docs/conversions/upload-adjustments

export const CUSTOMER_ID_RE = /^\d{10}$/;
const ACTION_ID_RE = /^\d{1,20}$/;
const CLICK_RE = /^[A-Za-z0-9_\-.]{8,512}$/;

export function cleanCustomerId(v: unknown): string | null {
  const d = String(v ?? '').replace(/-/g, '').trim();
  return CUSTOMER_ID_RE.test(d) ? d : null;
}

/** RFC 3339 timestamp in IST (Asia/Kolkata has no DST, so a fixed +05:30 is exact). */
export function toIstRfc3339(d: Date): string {
  const ist = new Date(d.getTime() + 330 * 60_000);
  return ist.toISOString().replace(/\.\d{3}Z$/, '+05:30');
}

/** Google Ads API date-time format "yyyy-mm-dd hh:mm:ss+05:30". */
export function toIstAdsDateTime(d: Date): string {
  return toIstRfc3339(d).replace('T', ' ');
}

export interface GoogleConversionInput {
  operatingCustomerId: string;
  loginCustomerId?: string | null;
  conversionActionId: string;
  eventTime: Date;
  transactionId: string;
  gclid?: string | null;
  gbraid?: string | null;
  wbraid?: string | null;
  email?: string | null;
  phone?: string | null;
  value?: number;
  currency?: string;
  /** Enhanced conversions for leads: attach hashed email/phone. */
  enhanced: boolean;
  eventSource: 'WEB' | 'PHONE' | 'OTHER';
  validateOnly?: boolean;
}

export interface GoogleBuildResult {
  ok: boolean;
  body?: Record<string, unknown>;
  reason?: string;
  identifiers?: string[];
}

/** Google accepts click conversions up to 90 days after the click by default. */
export const GOOGLE_MAX_AGE_DAYS = 90;

export function buildDataManagerRequest(i: GoogleConversionInput, now = new Date()): GoogleBuildResult {
  const op = cleanCustomerId(i.operatingCustomerId);
  if (!op) return { ok: false, reason: 'Google Ads customer ID must be 10 digits.' };
  const login = i.loginCustomerId ? cleanCustomerId(i.loginCustomerId) : null;
  if (i.loginCustomerId && !login) return { ok: false, reason: 'Manager (login) customer ID must be 10 digits.' };
  if (!ACTION_ID_RE.test(String(i.conversionActionId || ''))) return { ok: false, reason: 'Conversion action ID must be numeric.' };
  if (!i.transactionId || i.transactionId.length > 64) return { ok: false, reason: 'Transaction id missing or longer than 64 chars.' };
  if (i.eventTime.getTime() > now.getTime() + 60_000) return { ok: false, reason: 'Conversion time is in the future.' };
  if (now.getTime() - i.eventTime.getTime() > GOOGLE_MAX_AGE_DAYS * 86_400_000) {
    return { ok: false, reason: `Conversion is older than ${GOOGLE_MAX_AGE_DAYS} days.` };
  }

  const identifiers: string[] = [];
  const adIdentifiers: Record<string, string> = {};
  // One click identifier, most specific first.
  if (i.gclid && CLICK_RE.test(i.gclid)) {
    adIdentifiers.gclid = i.gclid;
    identifiers.push('gclid');
  } else if (i.gbraid && CLICK_RE.test(i.gbraid)) {
    adIdentifiers.gbraid = i.gbraid;
    identifiers.push('gbraid');
  } else if (i.wbraid && CLICK_RE.test(i.wbraid)) {
    adIdentifiers.wbraid = i.wbraid;
    identifiers.push('wbraid');
  }

  const userIdentifiers: Record<string, string>[] = [];
  if (i.enhanced) {
    const em = googleHash.email(i.email);
    const ph = googleHash.phone(i.phone);
    if (em) userIdentifiers.push({ emailAddress: em });
    if (ph) userIdentifiers.push({ phoneNumber: ph });
    if (em) identifiers.push('email');
    if (ph) identifiers.push('phone');
  }
  if (!Object.keys(adIdentifiers).length && !userIdentifiers.length) {
    return { ok: false, reason: 'No GCLID/GBRAID/WBRAID and no enhanced-conversion identifier — nothing Google could match.' };
  }

  const event: Record<string, unknown> = {
    eventTimestamp: toIstRfc3339(i.eventTime),
    transactionId: i.transactionId,
    eventSource: i.eventSource,
    // Only consented customers reach this builder; ad personalization is not requested.
    consent: { adUserData: 'CONSENT_GRANTED', adPersonalization: 'CONSENT_DENIED' },
  };
  if (Object.keys(adIdentifiers).length) event.adIdentifiers = adIdentifiers;
  if (userIdentifiers.length) event.userData = { userIdentifiers };
  if (typeof i.value === 'number' && Number.isFinite(i.value) && i.value > 0) {
    event.conversionValue = Math.round(i.value * 100) / 100;
    event.currency = (i.currency || 'INR').toUpperCase();
  }

  const destination: Record<string, unknown> = {
    operatingAccount: { accountType: 'GOOGLE_ADS', accountId: op },
    productDestinationId: String(i.conversionActionId),
  };
  if (login) destination.loginAccount = { accountType: 'GOOGLE_ADS', accountId: login };

  const body: Record<string, unknown> = { destinations: [destination], events: [event] };
  if (userIdentifiers.length) body.encoding = 'HEX';
  if (i.validateOnly) body.validateOnly = true;
  return { ok: true, body, identifiers };
}

export type GoogleProcessingStatus = 'accepted' | 'rejected' | 'pending' | 'unknown';

/** Map requestStatus:retrieve to a ledger outcome. */
export function interpretRequestStatus(body: unknown): { status: GoogleProcessingStatus; detail: string } {
  const list = ((body || {}) as { requestStatusPerDestination?: Record<string, unknown>[] }).requestStatusPerDestination;
  if (!Array.isArray(list) || !list.length) return { status: 'unknown', detail: 'No per-destination status returned.' };
  const d = list[0];
  const s = String(d.requestStatus || 'REQUEST_STATUS_UNKNOWN');
  const errs = ((d.errorInfo as { errorCounts?: { reason?: string; recordCount?: string }[] } | undefined)?.errorCounts || [])
    .map((e) => `${e.reason || 'UNKNOWN'} ×${e.recordCount || '?'}`)
    .join(', ');
  const warns = ((d.warningInfo as { warningCounts?: { reason?: string; recordCount?: string }[] } | undefined)?.warningCounts || [])
    .map((w) => `${w.reason || 'UNKNOWN'} ×${w.recordCount || '?'}`)
    .join(', ');
  if (s === 'SUCCESS') return { status: 'accepted', detail: warns ? `Processed with warnings: ${warns}` : 'Processed by Google.' };
  if (s === 'PROCESSING') return { status: 'pending', detail: 'Google is still processing the upload.' };
  if (s === 'FAILED' || s === 'PARTIAL_SUCCESS') return { status: 'rejected', detail: `${s}: ${errs || 'no error detail returned'}` };
  return { status: 'unknown', detail: s };
}

export function buildRetractionRequest(i: {
  customerId: string;
  conversionActionId: string;
  orderId: string;
  at: Date;
}): { ok: boolean; body?: Record<string, unknown>; reason?: string } {
  const cid = cleanCustomerId(i.customerId);
  if (!cid) return { ok: false, reason: 'Invalid customer ID.' };
  if (!ACTION_ID_RE.test(i.conversionActionId)) return { ok: false, reason: 'Invalid conversion action ID.' };
  return {
    ok: true,
    body: {
      conversionAdjustments: [
        {
          conversionAction: `customers/${cid}/conversionActions/${i.conversionActionId}`,
          adjustmentType: 'RETRACTION',
          orderId: i.orderId,
          adjustmentDateTime: toIstAdsDateTime(i.at),
        },
      ],
      partialFailure: true,
    },
  };
}

/** Extract per-row errors from a Google Ads API partial-failure response. */
export function parsePartialFailure(body: unknown): { index: number | null; message: string; code?: string }[] {
  const pf = ((body || {}) as { partialFailureError?: { message?: string; details?: unknown[] } }).partialFailureError;
  if (!pf) return [];
  const out: { index: number | null; message: string; code?: string }[] = [];
  for (const d of pf.details || []) {
    const errors = ((d || {}) as { errors?: Record<string, unknown>[] }).errors || [];
    for (const e of errors) {
      const path = ((e.location as { fieldPathElements?: { fieldName?: string; index?: number }[] } | undefined)?.fieldPathElements || []);
      const idx = path.find((p) => typeof p.index === 'number')?.index;
      const codeObj = (e.errorCode || {}) as Record<string, string>;
      const code = Object.entries(codeObj).map(([k, v]) => `${k}.${v}`)[0];
      out.push({ index: typeof idx === 'number' ? idx : null, message: String(e.message || 'Unknown error'), code });
    }
  }
  if (!out.length) out.push({ index: null, message: String(pf.message || 'Partial failure') });
  return out;
}

/** Classify a Google API (Ads or Data Manager) error response. */
export function classifyGoogleError(httpStatus: number, body: unknown): ClassifiedError {
  const err = ((body || {}) as { error?: { status?: string; message?: string; details?: unknown[] } }).error || {};
  const status = String(err.status || '');
  const raw = JSON.stringify(err.details || []);
  const message = String(err.message || `HTTP ${httpStatus}`).slice(0, 500);
  if (/DEVELOPER_TOKEN_NOT_APPROVED|DEVELOPER_TOKEN_PROHIBITED|DEVELOPER_TOKEN_INVALID/.test(raw)) {
    return { kind: 'permission', retryable: false, message: `Developer token problem: ${message}`, code: status };
  }
  if (httpStatus === 401 || status === 'UNAUTHENTICATED') return { kind: 'auth', retryable: false, message, code: status };
  if (httpStatus === 403 || status === 'PERMISSION_DENIED') return { kind: 'permission', retryable: false, message, code: status };
  if (httpStatus === 404 || status === 'NOT_FOUND') return { kind: 'not_found', retryable: false, message, code: status };
  if (httpStatus === 429 || status === 'RESOURCE_EXHAUSTED') return { kind: 'rate_limit', retryable: true, message, code: status };
  if (httpStatus >= 500 || httpStatus === 0 || status === 'UNAVAILABLE' || status === 'DEADLINE_EXCEEDED' || status === 'INTERNAL') {
    return { kind: 'transient', retryable: true, message, code: status };
  }
  return { kind: 'invalid', retryable: false, message, code: status || httpStatus };
}
