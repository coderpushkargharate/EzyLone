import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import { graph } from './graph';
import { buildMetaEvent, parseMetaResponse } from './payload';
import { getCapiCredentials, recordConnectionError, recordConnectionSuccess } from '../connections';
import { loadDeliveryContext } from '../delivery';
import type { DeliveryOutcome } from '../delivery';
import { PlatformError } from '../types';
import { MarketingConnection } from '@/lib/models/MarketingConnection';

// Send one ledger event to the Meta Conversions API.

export async function deliverMetaEvent(ev: IConversionEvent): Promise<DeliveryOutcome> {
  const ctx = await loadDeliveryContext(ev);
  if (!ctx.decision.allowed) return { status: 'blocked_consent', message: ctx.decision.reason };
  if (!ctx.mapping?.meta.enabled) return { status: 'skipped', message: 'Meta mapping for this CRM event is now disabled.' };

  const creds = await getCapiCredentials();
  if (!creds) {
    return { status: 'failed', errorKind: 'config', message: 'Meta dataset (Pixel) ID or Conversions API access token is not configured.' };
  }
  const testCode = ctx.settings.testMode?.metaTestEventCode;
  if (ev.testMode && !testCode) {
    return { status: 'skipped', message: 'Meta test mode is on but no test event code is configured — nothing was sent.' };
  }

  const mode = ctx.decision.mode || 'full';
  const built = buildMetaEvent({
    eventName: ev.platformEventName || ev.crmEvent,
    eventTime: Math.floor(new Date(ev.eventTime).getTime() / 1000),
    eventId: ev.eventId,
    actionSource: (ev.actionSource as 'website' | 'system_generated') || 'system_generated',
    eventSourceUrl: ctx.attr?.eventSourceUrl,
    mode,
    value: ev.value,
    currency: ev.currency,
    leadEventSource: ctx.settings.leadEventSourceName,
    customer: {
      email: ctx.lead?.email,
      phone: ctx.lead?.phone,
      name: ctx.lead?.name,
      city: ctx.loan?.city,
      zip: ctx.loan?.pincode,
      country: 'in',
      externalId: ctx.lead ? String(ctx.lead._id) : undefined,
      fbc: ctx.attr?.fbc,
      fbp: ctx.attr?.fbp,
      clientIp: ctx.attr?.clientIp,
      userAgent: ctx.attr?.userAgent,
      metaLeadId: ctx.attr?.meta?.leadgenId,
    },
  });
  if (!built.ok) return { status: 'skipped', message: built.reason || 'Event could not be built.' };

  try {
    const body = await graph.postNoProof(`/${creds.datasetId}/events`, creds.token, {
      data: JSON.stringify([built.event]),
      test_event_code: ev.testMode ? testCode : undefined,
    });
    const parsed = parseMetaResponse(body, 1);
    if (!parsed.ok) {
      return { status: 'retry', errorKind: 'transient', message: parsed.reason || 'Unexpected Meta response.', traceId: parsed.fbtraceId };
    }
    await recordConnectionSuccess('meta');
    await MarketingConnection.updateOne({ provider: 'meta' }, { $set: { 'meta.capiVerifiedAt': new Date() } });
    return {
      status: 'sent',
      traceId: parsed.fbtraceId,
      message: `${ev.testMode ? 'TEST event — ' : ''}Meta received the event (events_received=1, ${mode === 'lead_id_only' ? 'lead_id only' : 'hashed identifiers'}). Receipt is not proof of attribution.`,
    };
  } catch (e) {
    if (!(e instanceof PlatformError)) throw e;
    if (e.kind === 'auth' || e.kind === 'permission') await recordConnectionError('meta', `Conversions API: ${e.message}`, e.kind);
    return {
      // Credential problems are "failed" (fix the connection, then retry); a refused payload is "rejected".
      status: e.retryable ? 'retry' : e.kind === 'auth' || e.kind === 'permission' || e.kind === 'config' ? 'failed' : 'rejected',
      errorKind: e.kind,
      rateLimited: e.kind === 'rate_limit',
      message: `Meta ${e.kind} error${e.code ? ` (code ${e.code})` : ''}: ${e.message}`,
    };
  }
}
