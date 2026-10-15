import type { ConsentRecord, ConsentState, Touch } from './types';

// Server-side validation of the attribution payload the website forms send,
// plus channel derivation. Everything from the browser is untrusted: values are
// type-checked, length-capped and format-validated; unknown keys are dropped.
// Pure module — unit-tested.

export interface SanitizedAttribution {
  firstTouch?: Touch;
  lastTouch?: Touch;
  fbp?: string;
  fbc?: string;
  /** Browser-generated Meta event id, shared with the Pixel for deduplication. */
  pixelEventId?: string;
  eventSourceUrl?: string;
}

const CLICK_ID_RE = /^[A-Za-z0-9_\-.]{8,512}$/;
const FBP_RE = /^fb\.\d\.\d{10,16}\.\d{1,20}$/;
const FBC_RE = /^fb\.\d\.\d{10,16}\.[A-Za-z0-9_\-.]{8,512}$/;
const EVENT_ID_RE = /^[A-Za-z0-9_-]{8,64}$/;

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== 'string') return undefined;
  const s = v.trim().replace(/[\u0000-\u001f]/g, '');
  return s ? s.slice(0, max) : undefined;
}

function clickId(v: unknown): string | undefined {
  const s = str(v, 512);
  return s && CLICK_ID_RE.test(s) ? s : undefined;
}

function date(v: unknown): string | undefined {
  if (typeof v !== 'string' && typeof v !== 'number') return undefined;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return undefined;
  // Reject timestamps from the future or more than a year back — client clocks lie.
  const now = Date.now();
  if (d.getTime() > now + 5 * 60_000 || d.getTime() < now - 366 * 86_400_000) return undefined;
  return d.toISOString();
}

/** Keep scheme, host, path and only the marketing query params — no stray PII in stored URLs. */
const KEEP_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid', 'fbclid'];
export function cleanUrl(v: unknown, allowedHosts?: string[]): string | undefined {
  const s = str(v, 2048);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return undefined;
    if (allowedHosts && allowedHosts.length && !allowedHosts.includes(u.hostname.toLowerCase())) return undefined;
    const out = new URL(u.origin + u.pathname);
    for (const k of KEEP_PARAMS) {
      const val = u.searchParams.get(k);
      if (val) out.searchParams.set(k, val.slice(0, 512));
    }
    return out.toString().slice(0, 1024);
  } catch {
    return undefined;
  }
}

function touch(v: unknown, allowedHosts?: string[]): Touch | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const t = v as Record<string, unknown>;
  const out: Touch = {
    utmSource: str(t.utmSource, 200),
    utmMedium: str(t.utmMedium, 200),
    utmCampaign: str(t.utmCampaign, 200),
    utmContent: str(t.utmContent, 200),
    utmTerm: str(t.utmTerm, 200),
    gclid: clickId(t.gclid),
    gbraid: clickId(t.gbraid),
    wbraid: clickId(t.wbraid),
    fbclid: clickId(t.fbclid),
    landingPage: cleanUrl(t.landingPage, allowedHosts),
    // Referrer can be any site; keep only its origin.
    referrer: (() => {
      const r = str(t.referrer, 1024);
      try {
        return r ? new URL(r).origin : undefined;
      } catch {
        return undefined;
      }
    })(),
    at: date(t.at),
  };
  for (const k of Object.keys(out) as (keyof Touch)[]) if (out[k] === undefined) delete out[k];
  return Object.keys(out).length ? out : undefined;
}

export function sanitizeAttribution(input: unknown, allowedHosts?: string[]): SanitizedAttribution {
  if (!input || typeof input !== 'object') return {};
  const a = input as Record<string, unknown>;
  const out: SanitizedAttribution = {};
  const ft = touch(a.firstTouch, allowedHosts);
  const lt = touch(a.lastTouch, allowedHosts);
  if (ft) out.firstTouch = ft;
  if (lt) out.lastTouch = lt;
  const fbp = str(a.fbp, 128);
  if (fbp && FBP_RE.test(fbp)) out.fbp = fbp;
  const fbc = str(a.fbc, 600);
  if (fbc && FBC_RE.test(fbc)) out.fbc = fbc;
  const eid = str(a.pixelEventId, 64);
  if (eid && EVENT_ID_RE.test(eid)) out.pixelEventId = eid;
  const url = cleanUrl(a.eventSourceUrl, allowedHosts);
  if (url) out.eventSourceUrl = url;
  return out;
}

/** The ad-measurement consent the visitor gave on a website form. Only an explicit boolean counts. */
export function consentFromForm(v: unknown, source: string, textVersion?: string): ConsentRecord {
  const state: ConsentState = v === true ? 'granted' : v === false ? 'denied' : 'unknown';
  return { adMeasurement: state, source, collectedAt: new Date(), textVersion };
}

export function isValidPixelEventId(v: unknown): v is string {
  return typeof v === 'string' && EVENT_ID_RE.test(v);
}

const PAID_MEDIUMS = /^(cpc|ppc|paid|paidsocial|paid_social|paid-social|cpm|display|ads?)$/i;
const META_SOURCES = /^(facebook|fb|instagram|ig|meta|an|messenger)$/i;
const GOOGLE_SOURCES = /^(google|adwords|youtube|gdn)$/i;

/**
 * Marketing channel of a touch. Click ids are authoritative; otherwise UTMs;
 * otherwise the referrer origin; otherwise direct.
 */
export function deriveChannel(t: Touch | undefined, crmSource?: string): string {
  const src = (crmSource || '').toLowerCase();
  if (src.includes('facebook lead ads') || src.includes('instagram lead')) return 'meta_lead_ads';
  if (!t) {
    if (src.includes('whatsapp')) return 'whatsapp';
    if (src.includes('email')) return 'email';
    if (src.includes('manual')) return 'manual';
    return src ? 'other' : 'unknown';
  }
  if (t.gclid || t.gbraid || t.wbraid) return 'google_ads';
  if (t.fbclid) return t.utmMedium && PAID_MEDIUMS.test(t.utmMedium) ? 'meta_ads' : 'meta_click';
  const us = t.utmSource || '';
  const um = t.utmMedium || '';
  if (us) {
    if (GOOGLE_SOURCES.test(us) && PAID_MEDIUMS.test(um)) return 'google_ads';
    if (META_SOURCES.test(us)) return PAID_MEDIUMS.test(um) ? 'meta_ads' : 'social';
    if (/email|newsletter/i.test(um) || /email/i.test(us)) return 'email';
    if (/whatsapp/i.test(us)) return 'whatsapp';
    return PAID_MEDIUMS.test(um) ? 'other_paid' : 'campaign';
  }
  if (t.referrer) {
    if (/google\.|bing\.|duckduckgo\.|yahoo\./i.test(t.referrer)) return 'organic_search';
    if (/facebook\.|instagram\.|t\.co|twitter\.|linkedin\.|youtube\./i.test(t.referrer)) return 'social';
    return 'referral';
  }
  return 'direct';
}

/** Campaign label used for grouping in the dashboard (Meta campaign name/id beats UTM). */
export function campaignKey(meta?: { campaignId?: string; campaignName?: string }, t?: Touch): string | undefined {
  if (meta?.campaignId) return meta.campaignName ? `${meta.campaignName}` : `meta:${meta.campaignId}`;
  return t?.utmCampaign;
}
