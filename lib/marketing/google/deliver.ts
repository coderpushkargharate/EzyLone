import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import { buildDataManagerRequest, buildRetractionRequest, interpretRequestStatus, parsePartialFailure } from './payload';
import { ingestEvents, retrieveRequestStatus, uploadConversionAdjustments } from './api';
import { getConnection, recordConnectionError, recordConnectionSuccess } from '../connections';
import { loadDeliveryContext } from '../delivery';
import type { DeliveryOutcome } from '../delivery';
import { PlatformError } from '../types';

// Google Ads conversion delivery through the Data Manager API, plus status
// verification and retraction. Status vocabulary is deliberately conservative:
//   submitted  = Google accepted the request (requestId); outcome unknown yet
//   accepted   = requestStatus SUCCESS — Google processed the row
// Neither means the conversion was attributed to an ad or is visible in reports.

function failure(e: PlatformError, prefix: string): DeliveryOutcome {
  return {
    status: e.retryable ? 'retry' : e.kind === 'auth' || e.kind === 'permission' || e.kind === 'config' ? 'failed' : 'rejected',
    errorKind: e.kind,
    rateLimited: e.kind === 'rate_limit',
    message: `${prefix} ${e.kind} error: ${e.message}`,
  };
}

export async function deliverGoogleEvent(ev: IConversionEvent): Promise<DeliveryOutcome> {
  const ctx = await loadDeliveryContext(ev);
  if (!ctx.decision.allowed || ctx.decision.mode !== 'full') {
    return { status: 'blocked_consent', message: ctx.decision.allowed ? 'Google requires explicit consent (lead_id-only mode is Meta-only).' : ctx.decision.reason };
  }
  if (!ctx.mapping?.google.enabled) return { status: 'skipped', message: 'Google mapping for this CRM event is now disabled.' };
  const conn = await getConnection('google');
  if (!conn?.google?.customerId || conn.status === 'disconnected') {
    return { status: 'failed', errorKind: 'config', message: 'Google Ads is not connected or no customer account is selected.' };
  }

  const last = ctx.attr?.lastTouch;
  const first = ctx.attr?.firstTouch;
  const click = ctx.attr?.lastAdClick;
  const built = buildDataManagerRequest({
    operatingCustomerId: conn.google.customerId,
    loginCustomerId: conn.google.loginCustomerId,
    conversionActionId: ev.platformEventName || '',
    eventTime: new Date(ev.eventTime),
    transactionId: ev.eventId,
    // Most recent Google click wins; fall back to the stored touches for older rows.
    gclid: click?.gclid || last?.gclid || first?.gclid,
    gbraid: click?.gbraid || last?.gbraid || first?.gbraid,
    wbraid: click?.wbraid || last?.wbraid || first?.wbraid,
    email: ctx.lead?.email,
    phone: ctx.lead?.phone,
    value: ev.value,
    currency: ev.currency,
    enhanced: ctx.mapping.google.enhanced === true,
    eventSource: ctx.attr?.eventSourceUrl ? 'WEB' : 'OTHER',
    validateOnly: ev.testMode,
  });
  if (!built.ok) return { status: 'skipped', message: built.reason || 'Event could not be built.' };

  try {
    const res = await ingestEvents(built.body!);
    await recordConnectionSuccess('google');
    const warn = res.fieldWarnings?.length ? ` Field warnings: ${JSON.stringify(res.fieldWarnings).slice(0, 300)}` : '';
    if (ev.testMode) {
      return { status: 'skipped', message: `TEST (validateOnly): Google validated the request; nothing was ingested.${warn}` };
    }
    if (!res.requestId) return { status: 'unverified', message: `Google returned no requestId — outcome cannot be verified.${warn}` };
    return {
      status: 'submitted',
      requestId: res.requestId,
      message: `Google accepted the upload (identifiers: ${(built.identifiers || []).join(', ')}). Awaiting processing status.${warn}`,
    };
  } catch (e) {
    if (!(e instanceof PlatformError)) throw e;
    if (e.kind === 'auth' || e.kind === 'permission') await recordConnectionError('google', `Data Manager: ${e.message}`, e.kind);
    return failure(e, 'Google');
  }
}

export const MAX_VERIFY_ATTEMPTS = 12;

/** Poll requestStatus:retrieve for a submitted event. */
export async function verifyGoogleEvent(ev: IConversionEvent): Promise<DeliveryOutcome> {
  if (!ev.platformRequestId) return { status: 'unverified', message: 'No requestId stored.' };
  try {
    const body = await retrieveRequestStatus(ev.platformRequestId);
    const r = interpretRequestStatus(body);
    if (r.status === 'accepted') return { status: 'accepted', message: `${r.detail} (Processed ≠ attributed.)` };
    if (r.status === 'rejected') return { status: 'rejected', message: r.detail };
    if (ev.verifyAttempts + 1 >= MAX_VERIFY_ATTEMPTS) return { status: 'unverified', message: `Still ${r.detail} after ${MAX_VERIFY_ATTEMPTS} checks.` };
    return { status: 'submitted', message: r.detail };
  } catch (e) {
    if (!(e instanceof PlatformError)) throw e;
    if (ev.verifyAttempts + 1 >= MAX_VERIFY_ATTEMPTS) return { status: 'unverified', message: `Status check failed: ${e.message}` };
    return { status: 'submitted', message: `Status check failed (will retry): ${e.message}` };
  }
}

/** Retract an uploaded Google conversion (Google Ads API ConversionAdjustmentUploadService, by order id). */
export async function retractGoogleEvent(ev: IConversionEvent): Promise<DeliveryOutcome> {
  const conn = await getConnection('google');
  if (!conn?.google?.customerId) return { status: 'failed', message: 'Google Ads account not selected.' };
  const built = buildRetractionRequest({
    customerId: conn.google.customerId,
    conversionActionId: ev.platformEventName || '',
    orderId: ev.eventId,
    at: new Date(),
  });
  if (!built.ok) return { status: 'failed', message: built.reason || 'Invalid retraction.' };
  try {
    const res = await uploadConversionAdjustments(conn.google.customerId, built.body!, conn.google.loginCustomerId);
    const errors = parsePartialFailure(res);
    if (errors.length) return { status: 'failed', message: `Retraction rejected: ${errors.map((x) => `${x.code || ''} ${x.message}`).join('; ')}` };
    return { status: 'retracted', message: 'Google accepted the retraction.' };
  } catch (e) {
    if (!(e instanceof PlatformError)) throw e;
    return { status: 'failed', message: `Retraction failed: ${e.message}` };
  }
}
