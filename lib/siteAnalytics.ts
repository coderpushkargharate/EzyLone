import { createHash, randomUUID } from 'node:crypto';
import { connectDB } from './db';

// First-party website analytics for the admin "SEO & Health" tab (same as the
// Mappingg super-admin): page views, clicks, searches, active visitors, top
// pages, traffic sources, devices and where visitors are (country / state / city).
//
// Cookieless and anonymous: a visitor is a hash of (secret salt + India date +
// IP + browser), so the same person counts once per day, can't be followed
// across days, and no personal data is stored. Location comes from an offline
// IP database (fast-geoip) at the moment of the visit; the IP itself is never
// stored. Bots and signed-in staff are never recorded. Events older than
// RETENTION_DAYS are removed by a TTL index.

export type EventKind = 'pv' | 'click' | 'hb' | 'search';
export interface SiteEvent {
  at: string; kind: EventKind; path: string; vid: string;
  label?: string; href?: string; source?: string; device?: string;
  country?: string; region?: string; city?: string; lat?: number; lng?: number;
}

const COLLECTION = 'site_events';
const RETENTION_DAYS = 180;
const ACTIVE_MINUTES = 5;
/** The realtime map / per-minute chart look back this far (like Google Analytics' realtime view). */
export const REALTIME_MINUTES = 30;
const IST_OFFSET_MS = 330 * 60_000;
const istDate = (d = new Date()) => new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);

async function events() {
  const db = (await connectDB()).connection.db;
  if (!db) throw new Error('Database not connected');
  return db.collection(COLLECTION);
}

let ready: Promise<void> | null = null;
function ensureIndexes(): Promise<void> {
  ready ??= events().then(async (c) => {
    await c.createIndex({ at: -1 });
    // Mongo deletes old events by itself.
    await c.createIndex({ at: 1 }, { expireAfterSeconds: RETENTION_DAYS * 86_400, name: 'ttl_at' });
  }).catch((e) => { ready = null; throw e; });
  return ready;
}

/** Anonymous per-day visitor id. */
export function visitorId(ip: string, ua: string): string {
  const salt = process.env.JWT_SECRET || 'ezy';
  return createHash('sha256').update(`${salt}|${istDate()}|${ip}|${ua}`).digest('hex').slice(0, 20);
}

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegram|curl|wget|python|axios|node-fetch|go-http|postman|monitor|uptime/i;
export const isBot = (ua: string) => !ua || BOT.test(ua);

export function deviceOf(ua: string, width?: number): string {
  if (/ipad|tablet/i.test(ua) || (width && width >= 600 && width < 1024 && /mobile|android/i.test(ua))) return 'Tablet';
  if (/mobi|android|iphone/i.test(ua) || (width && width < 600)) return 'Mobile';
  return 'Desktop';
}

/** Group a referrer / utm_source into a readable channel. */
export function sourceOf(referrer: string, utm: string, ownHost: string): string {
  const u = (utm || '').toLowerCase().trim();
  const NAMED: Record<string, string> = { google: 'Google', whatsapp: 'WhatsApp', facebook: 'Facebook', fb: 'Facebook', instagram: 'Instagram', ig: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', twitter: 'X / Twitter', x: 'X / Twitter' };
  if (u) return NAMED[u] || u.slice(0, 40);
  if (!referrer) return 'Direct';
  let host = '';
  try { host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase(); } catch { return 'Direct'; }
  if (!host || host === ownHost.replace(/^www\./, '')) return '';
  if (/google\./.test(host)) return 'Google';
  if (/bing\.com|duckduckgo|yahoo\./.test(host)) return 'Other search';
  if (/whatsapp|wa\.me|l\.wl\.co/.test(host)) return 'WhatsApp';
  if (/facebook|fb\.com|fb\.me/.test(host)) return 'Facebook';
  if (/instagram/.test(host)) return 'Instagram';
  if (/linkedin|lnkd\.in/.test(host)) return 'LinkedIn';
  if (/t\.co|twitter|x\.com/.test(host)) return 'X / Twitter';
  if (/youtube|youtu\.be/.test(host)) return 'YouTube';
  return host.slice(0, 60);
}

// ---------------------------------------------------------------- location

/** Indian states / UTs by ISO 3166-2 code (what the IP database returns). */
const IN_STATES: Record<string, string> = {
  AN: 'Andaman & Nicobar', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh',
  CT: 'Chhattisgarh', CG: 'Chhattisgarh', DN: 'Dadra & Nagar Haveli and Daman & Diu', DH: 'Dadra & Nagar Haveli and Daman & Diu',
  DD: 'Dadra & Nagar Haveli and Daman & Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh',
  JK: 'Jammu & Kashmir', JH: 'Jharkhand', KA: 'Karnataka', KL: 'Kerala', LA: 'Ladakh', LD: 'Lakshadweep', MP: 'Madhya Pradesh',
  MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', OD: 'Odisha', PY: 'Puducherry',
  PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TG: 'Telangana', TS: 'Telangana', TR: 'Tripura',
  UP: 'Uttar Pradesh', UT: 'Uttarakhand', UK: 'Uttarakhand', WB: 'West Bengal',
};
let countryNames: Intl.DisplayNames | null = null;
export function countryName(code: string): string {
  try { countryNames ??= new Intl.DisplayNames(['en'], { type: 'region' }); return countryNames.of(code) || code; } catch { return code; }
}
export const regionName = (country: string, code: string) => (country === 'IN' && IN_STATES[code]) || code;

/** Rough centre of each Indian state / UT — a map position for visits saved without city coordinates. */
const IN_STATE_CENTRE: Record<string, [number, number]> = {
  AN: [11.7, 92.7], AP: [15.9, 79.7], AR: [28.2, 94.7], AS: [26.2, 92.9], BR: [25.1, 85.3], CH: [30.7, 76.8], CT: [21.3, 81.9], CG: [21.3, 81.9],
  DN: [20.4, 73.0], DH: [20.4, 73.0], DD: [20.4, 72.8], DL: [28.6, 77.2], GA: [15.3, 74.1], GJ: [22.3, 71.2], HR: [29.1, 76.1], HP: [31.1, 77.2],
  JK: [33.8, 75.0], JH: [23.6, 85.3], KA: [15.3, 75.7], KL: [10.5, 76.3], LA: [34.2, 77.6], LD: [10.6, 72.6], MP: [22.9, 78.7], MH: [19.7, 75.7],
  MN: [24.7, 93.9], ML: [25.5, 91.4], MZ: [23.2, 92.9], NL: [26.2, 94.6], OR: [20.9, 85.1], OD: [20.9, 85.1], PY: [11.9, 79.8], PB: [31.1, 75.3],
  RJ: [27.0, 74.2], SK: [27.5, 88.5], TN: [11.1, 78.7], TG: [18.1, 79.0], TS: [18.1, 79.0], TR: [23.9, 91.9], UP: [26.8, 80.9], UT: [30.1, 79.0],
  UK: [30.1, 79.0], WB: [22.99, 87.9],
};

type Geo = { country?: string; region?: string; city?: string; lat?: number; lng?: number };
const geoCache = new Map<string, Geo>();
const PRIVATE_IP = /^(::1|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|fc|fd|fe80|unknown$)/i;
export async function locate(ip: string): Promise<Geo> {
  const key = ip.replace(/^::ffff:/, '');
  if (!key || PRIVATE_IP.test(key)) return {};
  const hit = geoCache.get(key);
  if (hit) return hit;
  let out: Geo = {};
  try {
    const geoip = (await import('fast-geoip')).default as { lookup(ip: string): Promise<{ country?: string; region?: string; city?: string; ll?: [number, number] } | null> };
    const g = await geoip.lookup(key);
    // ll is the city's centre point (for the visitors map), not the visitor's own position.
    if (g?.country) out = { country: g.country, region: g.region || undefined, city: g.city || undefined, lat: g.ll?.[0], lng: g.ll?.[1] };
  } catch { /* location is a nice-to-have */ }
  if (geoCache.size > 5000) geoCache.clear();
  geoCache.set(key, out);
  return out;
}

export async function recordEvents(list: SiteEvent[]): Promise<void> {
  if (!list.length) return;
  await ensureIndexes();
  await (await events()).insertMany(list.map((e) => ({ _id: randomUUID() as never, ...e, at: new Date(e.at) })));
}

// ----------------------------------------------------------------- reporting

export interface GeoCountry { code: string; name: string; visitors: number }
/** `code` is ISO 3166-2 ("IN-OR") so it can be drawn on a map. */
export interface GeoRegion { code: string; countryCode: string; name: string; country: string; visitors: number }
export interface GeoCity { name: string; region: string; country: string; countryCode: string; lat: number | null; lng: number | null; visitors: number }

export interface TrafficReport {
  days: number;
  activeNow: number;
  activePages: { path: string; visitors: number }[];
  totals: { visitors: number; pageviews: number; clicks: number; prevVisitors: number; prevPageviews: number; prevClicks: number };
  today: { visitors: number; pageviews: number; clicks: number };
  daily: { date: string; visitors: number; pageviews: number; clicks: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  topClicks: { label: string; href: string; clicks: number }[];
  sources: { source: string; visitors: number }[];
  devices: { device: string; visitors: number }[];
  countries: GeoCountry[];
  regions: GeoRegion[];
  cities: GeoCity[];
  realtime: { visitors: number; perMinute: number[]; countries: GeoCountry[]; regions: GeoRegion[]; cities: GeoCity[] };
  searches: { term: string; count: number; visitors: number }[];
  totalSearches: number;
  since: string | null;
}

const GEO_LIMIT = 50;
const country = (code: string, visitors: number): GeoCountry => ({ code, name: countryName(code), visitors });
const region = (c: string, r: string, visitors: number): GeoRegion => ({ code: `${c}-${r}`, countryCode: c, name: regionName(c, r), country: countryName(c), visitors });
const city = (c: string, r: string, name: string, lat: number | undefined, lng: number | undefined, visitors: number): GeoCity => {
  // Visits without coordinates are placed at their state's centre so they still show on the map.
  const centre = lat == null && c === 'IN' ? IN_STATE_CENTRE[r] : undefined;
  return { name, region: regionName(c, r), country: countryName(c), countryCode: c, lat: lat ?? centre?.[0] ?? null, lng: lng ?? centre?.[1] ?? null, visitors };
};

export async function trafficReport(days: number): Promise<TrafficReport> {
  await ensureIndexes();
  const now = Date.now();
  // Range = the last `days` India-time days including today; prev = the same length before it.
  const todayIst = istDate();
  const startIst = new Date(Date.parse(todayIst + 'T00:00:00Z') - (days - 1) * 86_400_000);
  const start = new Date(startIst.getTime() - IST_OFFSET_MS);
  const prevStart = new Date(start.getTime() - days * 86_400_000);
  const activeSince = new Date(now - ACTIVE_MINUTES * 60_000);
  const rtSince = new Date(now - REALTIME_MINUTES * 60_000);
  const minuteOf = (at: number) => REALTIME_MINUTES - 1 - Math.floor((now - at) / 60_000);
  const todayStart = new Date(Date.parse(todayIst + 'T00:00:00Z') - IST_OFFSET_MS);

  const col = await events();
  const docs = await col.find({ at: { $gte: prevStart } }, { projection: { _id: 0 } }).toArray();
  const rows: SiteEvent[] = docs.map((d) => ({ ...(d as unknown as SiteEvent), at: new Date(d.at as Date).toISOString() }));
  const first = await col.find({}, { projection: { at: 1 } }).sort({ at: 1 }).limit(1).toArray();

  const inRange = (e: SiteEvent, a: Date, b?: Date) => { const t = Date.parse(e.at); return t >= a.getTime() && (!b || t < b.getTime()); };
  const cur = rows.filter((e) => inRange(e, start));
  const prev = rows.filter((e) => inRange(e, prevStart, start));
  const uniq = (l: SiteEvent[]) => new Set(l.map((e) => e.vid)).size;
  const count = (l: SiteEvent[], k: EventKind) => l.filter((e) => e.kind === k).length;
  const active = rows.filter((e) => inRange(e, activeSince));
  const lastPath = new Map<string, string>();
  active.sort((a, b) => a.at.localeCompare(b.at)).forEach((e) => lastPath.set(e.vid, e.path));
  const group = (l: SiteEvent[], key: (e: SiteEvent) => string | undefined) => {
    const m = new Map<string, Set<string>>();
    l.forEach((e) => { const k = key(e); if (k) { if (!m.has(k)) m.set(k, new Set()); m.get(k)!.add(e.vid); } });
    return [...m.entries()].map(([k, s]) => ({ k, v: s.size })).sort((a, b) => b.v - a.v);
  };
  const geoOf = (l: SiteEvent[]) => {
    const ll = new Map<string, [number, number]>();
    l.forEach((e) => { if (e.city && e.lat != null && e.lng != null) ll.set(`${e.country}|${e.region || ''}|${e.city}`, [e.lat, e.lng]); });
    return {
      countries: group(l, (e) => e.country).map((x) => country(x.k, x.v)).slice(0, GEO_LIMIT),
      regions: group(l, (e) => (e.region ? `${e.country}|${e.region}` : '')).map((x) => { const [c, r] = x.k.split('|'); return region(c, r, x.v); }).slice(0, GEO_LIMIT),
      cities: group(l, (e) => (e.city ? `${e.country}|${e.region || ''}|${e.city}` : '')).map((x) => { const [c, r, name] = x.k.split('|'); const p = ll.get(x.k); return city(c, r, name, p?.[0], p?.[1], x.v); }).slice(0, GEO_LIMIT),
    };
  };

  const byDay = new Map<string, SiteEvent[]>();
  cur.forEach((e) => { const d = istDate(new Date(e.at)); if (!byDay.has(d)) byDay.set(d, []); byDay.get(d)!.push(e); });
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(startIst.getTime() + i * 86_400_000).toISOString().slice(0, 10);
    const l = byDay.get(date) || [];
    return { date, visitors: uniq(l), pageviews: count(l, 'pv'), clicks: count(l, 'click') };
  });

  const pages = new Map<string, { views: number; v: Set<string> }>();
  cur.filter((e) => e.kind === 'pv').forEach((e) => { const p = pages.get(e.path) || { views: 0, v: new Set() }; p.views++; p.v.add(e.vid); pages.set(e.path, p); });
  const clicks = new Map<string, { label: string; href: string; clicks: number }>();
  cur.filter((e) => e.kind === 'click').forEach((e) => { const k = `${e.label}|${e.href}`; const c = clicks.get(k) || { label: e.label || '', href: e.href || '', clicks: 0 }; c.clicks++; clicks.set(k, c); });
  const todayEv = rows.filter((e) => inRange(e, todayStart));
  const rt = rows.filter((e) => inRange(e, rtSince));
  const per = Array.from({ length: REALTIME_MINUTES }, () => new Set<string>());
  rt.forEach((e) => per[minuteOf(Date.parse(e.at))]?.add(e.vid));
  const searches = new Map<string, { count: number; v: Set<string> }>();
  cur.filter((e) => e.kind === 'search' && e.label).forEach((e) => { const k = e.label!.toLowerCase(); const x = searches.get(k) || { count: 0, v: new Set() }; x.count++; x.v.add(e.vid); searches.set(k, x); });

  return {
    days,
    activeNow: lastPath.size,
    activePages: [...[...lastPath.values()].reduce((m, p) => m.set(p, (m.get(p) || 0) + 1), new Map<string, number>())].map(([path, visitors]) => ({ path, visitors })).sort((a, b) => b.visitors - a.visitors),
    totals: { visitors: uniq(cur), pageviews: count(cur, 'pv'), clicks: count(cur, 'click'), prevVisitors: uniq(prev), prevPageviews: count(prev, 'pv'), prevClicks: count(prev, 'click') },
    today: { visitors: uniq(todayEv), pageviews: count(todayEv, 'pv'), clicks: count(todayEv, 'click') },
    daily,
    topPages: [...pages.entries()].map(([path, p]) => ({ path, views: p.views, visitors: p.v.size })).sort((a, b) => b.views - a.views).slice(0, 15),
    topClicks: [...clicks.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 15),
    sources: group(cur.filter((e) => e.kind === 'pv'), (e) => e.source).map((x) => ({ source: x.k, visitors: x.v })).slice(0, 10),
    devices: group(cur, (e) => e.device).map((x) => ({ device: x.k, visitors: x.v })),
    ...geoOf(cur),
    realtime: { visitors: uniq(rt), perMinute: per.map((x) => x.size), ...geoOf(rt) },
    searches: [...searches.entries()].map(([term, x]) => ({ term, count: x.count, visitors: x.v.size })).sort((a, b) => b.count - a.count).slice(0, 20),
    totalSearches: count(cur, 'search'),
    since: first[0]?.at ? new Date(first[0].at as Date).toISOString() : null,
  };
}
