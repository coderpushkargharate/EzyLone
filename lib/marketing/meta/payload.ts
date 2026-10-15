import { metaHash, splitName } from '../normalize';
import type { ClassifiedError } from '../types';
import type { SendMode } from '../consent';

// Pure builders/parsers for the Meta Conversions API.
//   POST https://graph.facebook.com/{version}/{dataset_or_pixel_id}/events
// Docs: https://developers.facebook.com/docs/marketing-api/conversions-api/parameters
//       https://developers.facebook.com/docs/marketing-api/conversions-api/conversion-leads-integration

/** Meta rejects events whose event_time is more than 7 days in the past. */
export const META_MAX_EVENT_AGE_S = 7 * 86_400;

export const META_STANDARD_EVENTS = new Set([
  'AddPaymentInfo', 'AddToCart', 'AddToWishlist', 'CompleteRegistration', 'Contact', 'CustomizeProduct',
  'Donate', 'FindLocation', 'InitiateCheckout', 'Lead', 'Purchase', 'Schedule', 'Search', 'StartTrial',
  'SubmitApplication', 'Subscribe', 'ViewContent',
]);

export interface MetaCustomer {
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  city?: string | null;
  zip?: string | null;
  country?: string | null; // ISO-3166 alpha-2
  externalId?: string | null; // CRM lead id (hashed before sending)
  fbc?: string | null;
  fbp?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  metaLeadId?: string | null; // 15–17 digit Lead Ads id — sent as-is, never hashed
}

export interface MetaEventInput {
  eventName: string;
  eventTime: number; // unix seconds — when the CRM condition actually occurred
  eventId: string;
  actionSource: 'website' | 'system_generated' | 'phone_call' | 'other';
  eventSourceUrl?: string;
  customer: MetaCustomer;
  mode: SendMode;
  value?: number;
  currency?: string;
  /** For Conversion Leads (CRM) events: name of the CRM. */
  leadEventSource?: string;
}

export interface BuildResult {
  ok: boolean;
  event?: Record<string, unknown>;
  reason?: string;
}

const EVENT_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,49}$/;

export function buildMetaEvent(input: MetaEventInput, nowS = Math.floor(Date.now() / 1000)): BuildResult {
  if (!EVENT_NAME_RE.test(input.eventName)) return { ok: false, reason: `Invalid Meta event name "${input.eventName}".` };
  if (!input.eventId) return { ok: false, reason: 'Missing event_id.' };
  if (input.eventTime > nowS + 60) return { ok: false, reason: 'event_time is in the future.' };
  if (nowS - input.eventTime > META_MAX_EVENT_AGE_S) {
    return { ok: false, reason: 'event_time is older than 7 days — Meta would reject it.' };
  }

  const c = input.customer;
  const user: Record<string, unknown> = {};
  if (input.mode === 'lead_id_only') {
    if (!c.metaLeadId) return { ok: false, reason: 'lead_id-only mode requires a Meta lead id.' };
    user.lead_id = c.metaLeadId;
  } else {
    const em = metaHash.email(c.email);
    const ph = metaHash.phone(c.phone);
    const { first, last } = splitName(c.name);
    const fn = metaHash.firstName(first);
    const ln = metaHash.lastName(last);
    const ct = metaHash.city(c.city);
    const zp = metaHash.zip(c.zip);
    const country = metaHash.country(c.country);
    const ext = metaHash.externalId(c.externalId);
    if (em) user.em = [em];
    if (ph) user.ph = [ph];
    if (fn) user.fn = [fn];
    if (ln) user.ln = [ln];
    if (ct) user.ct = [ct];
    if (zp) user.zp = [zp];
    if (country) user.country = [country];
    if (ext) user.external_id = [ext];
    if (c.metaLeadId) user.lead_id = c.metaLeadId;
    if (c.fbc) user.fbc = c.fbc;
    if (c.fbp) user.fbp = c.fbp;
    if (input.actionSource === 'website') {
      if (c.clientIp) user.client_ip_address = c.clientIp;
      if (c.userAgent) user.client_user_agent = c.userAgent;
    }
    const matchable = ['em', 'ph', 'external_id', 'lead_id', 'fbc', 'fbp'].some((k) => k in user);
    if (!matchable) return { ok: false, reason: 'No usable customer identifier (email, phone, lead id or browser id).' };
  }

  if (input.actionSource === 'website') {
    if (!input.eventSourceUrl) return { ok: false, reason: 'Website events require event_source_url.' };
    if (!user.client_user_agent && input.mode === 'full') {
      return { ok: false, reason: 'Website events require client_user_agent.' };
    }
  }

  const custom: Record<string, unknown> = {};
  if (typeof input.value === 'number' && Number.isFinite(input.value) && input.value > 0) {
    custom.value = Math.round(input.value * 100) / 100;
    custom.currency = (input.currency || 'INR').toUpperCase();
  }
  if (input.actionSource === 'system_generated') {
    custom.event_source = 'crm';
    custom.lead_event_source = input.leadEventSource || 'EzyLoan CRM';
  }

  const event: Record<string, unknown> = {
    event_name: input.eventName,
    event_time: input.eventTime,
    event_id: input.eventId,
    action_source: input.actionSource,
    user_data: user,
  };
  if (input.eventSourceUrl && input.actionSource === 'website') event.event_source_url = input.eventSourceUrl;
  if (Object.keys(custom).length) event.custom_data = custom;
  return { ok: true, event };
}

/** Validate a CAPI response: success only when Meta counted every event we sent. */
export function parseMetaResponse(
  body: unknown,
  sent: number
): { ok: boolean; eventsReceived?: number; fbtraceId?: string; messages?: string[]; reason?: string } {
  const b = (body || {}) as Record<string, unknown>;
  const received = typeof b.events_received === 'number' ? b.events_received : undefined;
  const messages = Array.isArray(b.messages) ? (b.messages as unknown[]).map(String) : undefined;
  const fbtraceId = typeof b.fbtrace_id === 'string' ? b.fbtrace_id : undefined;
  if (received === undefined) return { ok: false, fbtraceId, messages, reason: 'Response did not include events_received.' };
  if (received !== sent) return { ok: false, eventsReceived: received, fbtraceId, messages, reason: `Meta received ${received} of ${sent} events.` };
  return { ok: true, eventsReceived: received, fbtraceId, messages };
}

/**
 * Classify a Graph API error. Codes per
 * https://developers.facebook.com/docs/graph-api/guides/error-handling
 */
export function classifyMetaError(httpStatus: number, body: unknown): ClassifiedError {
  const err = ((body || {}) as { error?: Record<string, unknown> }).error || {};
  const code = typeof err.code === 'number' ? err.code : undefined;
  const sub = typeof err.error_subcode === 'number' ? err.error_subcode : undefined;
  const message = String(err.error_user_msg || err.message || `HTTP ${httpStatus}`).slice(0, 500);
  const transient = err.is_transient === true;

  if (code === 190 || code === 102 || sub === 463 || sub === 467 || sub === 460) {
    return { kind: 'auth', retryable: false, message, code };
  }
  if (code === 4 || code === 17 || code === 32 || code === 613 || code === 80004 || (code !== undefined && code >= 80000 && code <= 80014)) {
    return { kind: 'rate_limit', retryable: true, message, code };
  }
  if (code === 10 || (code !== undefined && code >= 200 && code <= 299)) {
    return { kind: 'permission', retryable: false, message, code };
  }
  if (code === 803) return { kind: 'not_found', retryable: false, message, code };
  if (code === 1 || code === 2 || transient || httpStatus >= 500 || httpStatus === 0) {
    return { kind: 'transient', retryable: true, message, code };
  }
  if (code === 100 || httpStatus === 400) return { kind: 'invalid', retryable: false, message, code };
  if (httpStatus === 429) return { kind: 'rate_limit', retryable: true, message, code };
  return { kind: 'transient', retryable: httpStatus >= 500, message, code };
}
