// GA4 organic report — READ-ONLY (GA4 Data API, analytics.readonly scope).
//
//   GA4_PROPERTY_ID=123456789 node scripts/seo/ga4-report.mjs [--days=28] [--out=reports/seo]
//
// Compares the last N days with the previous N days for Organic Search sessions:
// landing pages, lead events (generate_lead, submit_application), device and city.
// GA4 is not installed on production as of 2026-11-28, so until it is, this
// returns zero rows — which means "not measured", not "no traffic".
// Auth: GOOGLE_SA_KEY_FILE / GOOGLE_SA_KEY_JSON (the service account must be a
// *Viewer* on the GA4 property — docs/GA4-INTEGRATION-GUIDE.md §5).

import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCOPES, SetupError, googleJson } from './lib/google.mjs';
import { periods, ymd } from './lib/analysis.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const DAYS = Number(args.days || 28);
const OUT = path.resolve(args.out || 'reports/seo');
const LEAD_EVENTS = ['generate_lead', 'submit_application'];

const ORGANIC = { filter: { fieldName: 'sessionDefaultChannelGroup', stringFilter: { value: 'Organic Search' } } };

function rowsOf(j, dims, mets) {
  // With two dateRanges GA4 adds a 'dateRange' dimension: date_range_0 = current, date_range_1 = previous.
  const out = new Map();
  for (const r of j.rows || []) {
    const vals = r.dimensionValues.map((d) => d.value);
    const range = vals.at(-1) === 'date_range_1' ? 'prev' : 'cur';
    const key = vals.slice(0, dims.length).join(' · ');
    const x = out.get(key) || { key, cur: {}, prev: {} };
    mets.forEach((m, i) => { x[range][m] = Number(r.metricValues[i].value); });
    out.set(key, x);
  }
  return [...out.values()];
}

export async function ga4Organic(propertyId, days = DAYS) {
  if (!propertyId) throw new SetupError('GA4_PROPERTY_ID is not set (numeric id from GA4 → Admin → Property details)');
  const p = periods(days, new Date(), 1);
  const dateRanges = [{ startDate: p.current.start, endDate: p.current.end }, { startDate: p.previous.start, endDate: p.previous.end }];
  const run = (body) => googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, { scopes: SCOPES.analytics, body: { dateRanges, ...body } });
  const sessionMets = ['sessions', 'totalUsers', 'engagementRate', 'keyEvents'];
  const report = async (dims, extra = {}) => rowsOf(await run({
    dimensions: dims.map((name) => ({ name })), metrics: sessionMets.map((name) => ({ name })), dimensionFilter: ORGANIC, limit: '250', ...extra,
  }), dims, sessionMets);

  const [totals, landing, device, city, channels, leads] = await Promise.all([
    report([]),
    report(['landingPage'], { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] }),
    report(['deviceCategory']),
    report(['city'], { orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: '25' }),
    // All channels (no organic filter), so organic can be put in context.
    run({ dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }, { name: 'keyEvents' }] }).then((j) => rowsOf(j, ['channel'], ['sessions', 'keyEvents'])),
    run({
      dimensions: [{ name: 'eventName' }, { name: 'landingPage' }], metrics: [{ name: 'eventCount' }],
      dimensionFilter: { andGroup: { expressions: [ORGANIC, { filter: { fieldName: 'eventName', inListFilter: { values: LEAD_EVENTS } } }] } }, limit: '250',
    }).then((j) => rowsOf(j, ['eventName', 'landingPage'], ['eventCount'])),
  ]);

  // High-traffic organic landing pages with no lead events — the "traffic but no enquiries" list.
  const leadsByPage = new Map();
  for (const l of leads) { const page = l.key.split(' · ')[1]; leadsByPage.set(page, (leadsByPage.get(page) || 0) + (l.cur.eventCount || 0)); }
  const lowConversion = landing.filter((r) => (r.cur.sessions || 0) >= 30 && !leadsByPage.get(r.key)).slice(0, 15);

  return { source: 'GA4 Data API', propertyId, generatedAt: new Date().toISOString(), period: p, leadEvents: LEAD_EVENTS,
    totals: totals[0] || { key: '', cur: {}, prev: {} }, landing, device, city, channels, leads, lowConversion,
    note: (totals[0]?.cur.sessions || 0) === 0 ? 'No organic sessions recorded. If GA4 was installed recently (or not at all), this is missing measurement, not missing traffic.' : undefined };
}

export function ga4Markdown(r) {
  const n = (x, d = 0) => (x == null ? '—' : Number(x).toLocaleString('en-IN', { maximumFractionDigits: d }));
  const line = (label, c, p) => `| ${label} | ${n(p)} → ${n(c)} |`;
  let md = `# GA4 — Organic Search (${r.period.current.start} → ${r.period.current.end} vs previous ${r.period.days} days)\n\nProperty ${r.propertyId} · generated ${r.generatedAt}\n\n`;
  md += `> **Data status: MEASURED** by the GA4 Data API${r.note ? ', but see the warning below' : ''}. GA4 has no data before its installation date, so a previous period that predates installation is **not measured**, not "zero traffic".\n\n`;
  if (r.note) md += `> ⚠ ${r.note}\n\n`;
  md += `| Metric | Previous → current |\n|---|---|\n${line('Organic sessions', r.totals.cur.sessions, r.totals.prev.sessions)}\n${line('Organic users', r.totals.cur.totalUsers, r.totals.prev.totalUsers)}\n${line('Organic key events', r.totals.cur.keyEvents, r.totals.prev.keyEvents)}\n| Engagement rate | ${n((r.totals.prev.engagementRate || 0) * 100, 1)}% → ${n((r.totals.cur.engagementRate || 0) * 100, 1)}% |\n\n`;
  md += `## Top organic landing pages\n\n| Landing page | Sessions | Engagement | Key events |\n|---|---|---|---|\n${r.landing.slice(0, 25).map((x) => `| ${x.key} | ${n(x.prev.sessions)} → ${n(x.cur.sessions)} | ${n((x.cur.engagementRate || 0) * 100, 0)}% | ${n(x.cur.keyEvents)} |`).join('\n')}\n\n`;
  md += `## Organic lead events by landing page\n\n| Event · landing page | Count (prev → cur) |\n|---|---|\n${r.leads.map((x) => `| ${x.key} | ${n(x.prev.eventCount)} → ${n(x.cur.eventCount)} |`).join('\n') || '| none recorded | |'}\n\n`;
  md += `## Organic pages with ≥ 30 sessions and no lead events\n\n${r.lowConversion.map((x) => `- ${x.key} (${n(x.cur.sessions)} sessions)`).join('\n') || 'None.'}\n\n`;
  md += `## Device\n\n${r.device.map((x) => `- ${x.key}: ${n(x.prev.sessions)} → ${n(x.cur.sessions)}`).join('\n')}\n\n## City (organic)\n\n${r.city.map((x) => `- ${x.key}: ${n(x.cur.sessions)}`).join('\n')}\n\n`;
  md += `## All channels (context)\n\n${r.channels.map((x) => `- ${x.key}: ${n(x.prev.sessions)} → ${n(x.cur.sessions)} sessions, ${n(x.cur.keyEvents)} key events`).join('\n')}\n`;
  return md;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  ga4Organic(process.env.GA4_PROPERTY_ID)
    .then((r) => {
      mkdirSync(OUT, { recursive: true });
      const base = path.join(OUT, `ga4-organic-${ymd(new Date())}`);
      writeFileSync(`${base}.json`, JSON.stringify(r, null, 2));
      writeFileSync(`${base}.md`, ga4Markdown(r));
      console.log(`wrote ${base}.json and .md`);
    })
    .catch((e) => { console.error(e instanceof SetupError ? `Setup needed: ${e.message}` : `Failed: ${e.message}`); process.exit(e instanceof SetupError ? 3 : 1); });
}
