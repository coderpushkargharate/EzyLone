import { connectDB } from '@/lib/db';
import { DEFAULT_MAPPINGS, MarketingSettings } from '@/lib/models/MarketingSettings';
import type { IEventMapping, IMarketingSettings } from '@/lib/models/MarketingSettings';
import { CRM_EVENTS } from './types';
import type { CrmEvent } from './types';

// Load the singleton settings row (created with safe defaults on first use).
// Cached briefly per process; saveSettings() invalidates the cache.

let cache: { at: number; value: IMarketingSettings } | null = null;
const TTL_MS = 15_000;

export async function getSettings(fresh = false): Promise<IMarketingSettings> {
  if (!fresh && cache && Date.now() - cache.at < TTL_MS) return cache.value;
  await connectDB();
  const doc = await MarketingSettings.findOneAndUpdate(
    { key: 'default' },
    { $setOnInsert: { key: 'default' } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean<IMarketingSettings>();
  const value = withAllMappings(doc as IMarketingSettings);
  cache = { at: Date.now(), value };
  return value;
}

export function invalidateSettingsCache(): void {
  cache = null;
}

/** Guarantee one mapping per CRM event (older rows may predate a new event). */
function withAllMappings(s: IMarketingSettings): IMarketingSettings {
  const byEvent = new Map((s.eventMappings || []).map((m) => [m.crmEvent, m]));
  const eventMappings = CRM_EVENTS.map((e) => byEvent.get(e) || DEFAULT_MAPPINGS.find((d) => d.crmEvent === e)!);
  return { ...s, eventMappings };
}

export function mappingFor(s: IMarketingSettings, event: CrmEvent): IEventMapping | undefined {
  return s.eventMappings.find((m) => m.crmEvent === event);
}

const META_EVENT_NAME_RE = /^[A-Za-z][A-Za-z0-9_]{0,49}$/;

/** Validate + whitelist an admin settings update. Returns an error string or the clean update. */
export function sanitizeSettingsUpdate(body: unknown): { error: string } | { update: Partial<IMarketingSettings> } {
  if (!body || typeof body !== 'object') return { error: 'Invalid body' };
  const b = body as Record<string, unknown>;
  const update: Partial<IMarketingSettings> = {};

  if (b.eventMappings !== undefined) {
    if (!Array.isArray(b.eventMappings)) return { error: 'eventMappings must be an array' };
    const out: IEventMapping[] = [];
    for (const raw of b.eventMappings as Record<string, unknown>[]) {
      const crmEvent = raw?.crmEvent as CrmEvent;
      if (!CRM_EVENTS.includes(crmEvent)) return { error: `Unknown CRM event ${String(crmEvent)}` };
      const meta = (raw.meta || {}) as Record<string, unknown>;
      const google = (raw.google || {}) as Record<string, unknown>;
      const eventName = String(meta.eventName || crmEvent).trim();
      if (!META_EVENT_NAME_RE.test(eventName)) return { error: `Invalid Meta event name for ${crmEvent}` };
      const actionId = google.conversionActionId ? String(google.conversionActionId).trim() : undefined;
      if (actionId && !/^\d{1,20}$/.test(actionId)) return { error: `Google conversion action for ${crmEvent} must be a numeric ID` };
      if (google.enabled === true && !actionId) return { error: `Pick a Google conversion action for ${crmEvent} before enabling it` };
      let value: number | undefined;
      if (raw.value !== undefined && raw.value !== null && raw.value !== '') {
        value = Number(raw.value);
        if (!Number.isFinite(value) || value < 0 || value > 10_000_000) return { error: `Invalid value for ${crmEvent}` };
      }
      out.push({
        crmEvent,
        meta: { enabled: meta.enabled === true, eventName },
        google: { enabled: google.enabled === true, conversionActionId: actionId, enhanced: google.enhanced === true },
        value,
      });
    }
    update.eventMappings = out;
  }

  if (b.qualifiedStatuses !== undefined) {
    if (!Array.isArray(b.qualifiedStatuses)) return { error: 'qualifiedStatuses must be an array' };
    update.qualifiedStatuses = (b.qualifiedStatuses as unknown[]).map(String).map((s) => s.slice(0, 40)).slice(0, 10);
  }
  if (b.currency !== undefined) {
    const c = String(b.currency).toUpperCase();
    if (!/^[A-Z]{3}$/.test(c)) return { error: 'Currency must be a 3-letter ISO code' };
    update.currency = c;
  }
  if (b.consent !== undefined) {
    const c = (b.consent || {}) as Record<string, unknown>;
    const key = c.metaLeadFormConsentKey ? String(c.metaLeadFormConsentKey).trim().slice(0, 100) : undefined;
    update.consent = {
      allowLeadIdOnlyForLeadAds: c.allowLeadIdOnlyForLeadAds === true,
      metaLeadFormConsentKey: key,
      websiteConsentTextVersion: String(c.websiteConsentTextVersion || 'ad-measurement-v1').slice(0, 40),
    };
  }
  if (b.testMode !== undefined) {
    const t = (b.testMode || {}) as Record<string, unknown>;
    const code = t.metaTestEventCode ? String(t.metaTestEventCode).trim() : undefined;
    if (code && !/^[A-Za-z0-9_-]{3,40}$/.test(code)) return { error: 'Invalid Meta test event code' };
    update.testMode = { meta: t.meta === true, metaTestEventCode: code, google: t.google === true };
  }
  if (b.leadEventSourceName !== undefined) {
    update.leadEventSourceName = String(b.leadEventSourceName).trim().slice(0, 60) || 'EzyLoan CRM';
  }
  return { update };
}
