// Browser-side attribution capture (no server imports — used by client components).
//
// On every page view we look for UTM parameters and ad click ids (gclid, gbraid,
// wbraid, fbclid). The first touch is stored once; the last touch is replaced
// whenever a new campaign visit arrives. Both expire after 90 days (Google's
// click-id lookback). Values live in this browser's localStorage only and are
// sent with a form submission; the server re-validates everything and only
// forwards anything to ad platforms if the visitor ticks the ad-measurement
// consent box. No contact details are ever stored here.

const FIRST_KEY = 'ezy_attr_first';
const LAST_KEY = 'ezy_attr_last';
const FBC_KEY = 'ezy_attr_fbc';
const EVENT_KEY = 'ezy_lead_event_id';
const TTL_MS = 90 * 86_400_000;
const PARAMS = { utm_source: 'utmSource', utm_medium: 'utmMedium', utm_campaign: 'utmCampaign', utm_content: 'utmContent', utm_term: 'utmTerm', gclid: 'gclid', gbraid: 'gbraid', wbraid: 'wbraid', fbclid: 'fbclid' } as const;

type Touch = Record<string, string>;

function read(key: string): Touch | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const v = JSON.parse(raw) as Touch & { _exp?: string };
    if (v._exp && Number(v._exp) < Date.now()) {
      localStorage.removeItem(key);
      return null;
    }
    delete v._exp;
    return v;
  } catch {
    return null;
  }
}

function write(key: string, t: Touch) {
  try {
    localStorage.setItem(key, JSON.stringify({ ...t, _exp: String(Date.now() + TTL_MS) }));
  } catch {
    /* storage blocked — attribution is best effort */
  }
}

function cookie(name: string): string | undefined {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return m ? decodeURIComponent(m[1]) : undefined;
}

/** Record the current page view as a touch (call on every client navigation). */
export function captureAttribution(): void {
  if (typeof window === 'undefined') return;
  const sp = new URLSearchParams(window.location.search);
  const t: Touch = {};
  for (const [param, key] of Object.entries(PARAMS)) {
    const v = sp.get(param);
    if (v) t[key] = v.slice(0, 500);
  }
  const campaignVisit = Object.keys(t).length > 0;
  const externalReferrer = (() => {
    try {
      return document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : '';
    } catch {
      return '';
    }
  })();
  if (!campaignVisit && !externalReferrer && read(FIRST_KEY)) return; // internal navigation: nothing new

  const touch: Touch = { ...t, landingPage: window.location.href, at: new Date().toISOString() };
  if (externalReferrer) touch.referrer = externalReferrer;
  if (!read(FIRST_KEY)) write(FIRST_KEY, touch);
  if (campaignVisit || externalReferrer) write(LAST_KEY, touch);
  if (t.fbclid && !cookie('_fbc')) write(FBC_KEY, { fbc: `fb.1.${Date.now()}.${t.fbclid}` });
}

/** Attribution payload to attach to a lead form submission. */
export function getAttributionPayload(pixelEventId?: string) {
  if (typeof window === 'undefined') return {};
  return {
    firstTouch: read(FIRST_KEY) || undefined,
    lastTouch: read(LAST_KEY) || undefined,
    fbp: cookie('_fbp'),
    fbc: cookie('_fbc') || read(FBC_KEY)?.fbc,
    pixelEventId,
    eventSourceUrl: window.location.href,
  };
}

/** A fresh event id shared by the browser Pixel and the server-side Conversions API (deduplication). */
export function newLeadEventId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const id = `lead_${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`;
  try {
    sessionStorage.setItem(EVENT_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}

/** The event id of the lead just submitted in this tab (used by the thank-you page's Pixel call). */
export function lastLeadEventId(): string | undefined {
  try {
    return sessionStorage.getItem(EVENT_KEY) || undefined;
  } catch {
    return undefined;
  }
}
