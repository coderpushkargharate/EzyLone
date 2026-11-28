// Google Search Console report — READ-ONLY. Never submits, changes or deletes anything.
//
//   node scripts/seo/gsc-report.mjs performance            # API: 7/28/90-day vs previous period
//   node scripts/seo/gsc-report.mjs csv --dir=<folder>     # same, from a Search Console UI export
//   node scripts/seo/gsc-report.mjs inspect [--legacy]     # URL Inspection for every sitemap URL (+ legacy URLs)
//
// Options: --site=<property> (default: auto-detect ezyloan.co.in), --out=<dir> (default reports/seo),
//          --min-impressions=20 (rows below this in both periods are not ranked as movers).
// Auth: GOOGLE_SA_KEY_FILE or GOOGLE_SA_KEY_JSON — docs/GSC-INTEGRATION-GUIDE.md.
// Output: <out>/gsc-<mode>-<date>.json and .md. Every number comes from Google; nothing is estimated.

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCOPES, SetupError, googleJson } from './lib/google.mjs';
import { periods, parseCsv, normaliseGscTable, totalsFromDaily, movers, pct, num, ymd } from './lib/analysis.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://www.ezyloan.co.in';
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const MODE = process.argv[2];
const OUT = path.resolve(args.out || 'reports/seo');
const MIN_IMPR = Number(args['min-impressions'] || 20);
const WINDOWS = [7, 28, 90];

const SC = 'https://www.googleapis.com/webmasters/v3';
const enc = encodeURIComponent;

async function resolveSite() {
  if (args.site) return args.site;
  if (process.env.GSC_SITE) return process.env.GSC_SITE;
  const { siteEntry = [] } = await googleJson(`${SC}/sites`, { scopes: SCOPES.searchConsole });
  const mine = siteEntry.filter((s) => /ezyloan\.co\.in/.test(s.siteUrl) && s.permissionLevel !== 'siteUnverifiedUser');
  if (!mine.length) {
    throw new SetupError(`The service account can see ${siteEntry.length} propert${siteEntry.length === 1 ? 'y' : 'ies'}, none for ezyloan.co.in. Add its email as a user of the property (docs/GSC-INTEGRATION-GUIDE.md §2).`);
  }
  // A Domain property covers http/https/www/apex; prefer it.
  return (mine.find((s) => s.siteUrl.startsWith('sc-domain:')) || mine[0]).siteUrl;
}

async function query(site, body) {
  const rows = [];
  for (let startRow = 0; ; startRow += 25_000) {
    const j = await googleJson(`${SC}/sites/${enc(site)}/searchAnalytics/query`, {
      scopes: SCOPES.searchConsole,
      body: { dataState: 'final', rowLimit: 25_000, startRow, ...body },
    });
    rows.push(...(j.rows || []));
    if (!j.rows || j.rows.length < 25_000) return rows;
  }
}
const toRow = (r) => ({ key: r.keys?.[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position });

function joinPeriods(cur, prev) {
  const m = new Map();
  for (const r of cur) m.set(r.key, { key: r.key, cur: r, prev: { clicks: 0, impressions: 0, ctr: null, position: null } });
  for (const r of prev) {
    const x = m.get(r.key);
    if (x) x.prev = r;
    else m.set(r.key, { key: r.key, cur: { clicks: 0, impressions: 0, ctr: null, position: null }, prev: r });
  }
  return [...m.values()];
}

// ---------- performance (API) ----------
async function performanceApi() {
  const site = await resolveSite();
  const longest = periods(Math.max(...WINDOWS));
  const daily = (await query(site, { startDate: longest.previous.start, endDate: longest.current.end, dimensions: ['date'] }))
    .map((r) => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions, position: r.position }));
  const windows = [];
  for (const days of WINDOWS) {
    const p = periods(days);
    const w = { days, period: p, totals: { current: totalsFromDaily(daily, p.current.start, p.current.end), previous: totalsFromDaily(daily, p.previous.start, p.previous.end) } };
    for (const dim of ['query', 'page', ...(days === 28 ? ['device', 'country'] : [])]) {
      const [c, v] = await Promise.all([
        query(site, { startDate: p.current.start, endDate: p.current.end, dimensions: [dim] }),
        query(site, { startDate: p.previous.start, endDate: p.previous.end, dimensions: [dim] }),
      ]);
      const joined = joinPeriods(c.map(toRow), v.map(toRow));
      w[dim] = { rows: joined.length, ...(dim === 'query' || dim === 'page' ? movers(joined, { minImpressions: MIN_IMPR }) : { all: joined.sort((a, b) => b.cur.clicks - a.cur.clicks) }) };
      if (dim === 'query' || dim === 'page') w[dim].top = joined.sort((a, b) => b.cur.clicks - a.cur.clicks || b.cur.impressions - a.cur.impressions).slice(0, 25);
    }
    windows.push(w);
  }
  const sitemaps = (await googleJson(`${SC}/sites/${enc(site)}/sitemaps`, { scopes: SCOPES.searchConsole }).catch((e) => ({ error: e.message }))).sitemap || [];
  return { source: 'Search Console API', site, generatedAt: new Date().toISOString(), dataState: 'final', windows, sitemaps };
}

// ---------- performance (CSV export) ----------
function performanceCsv(dir) {
  if (!dir || !existsSync(dir)) throw new SetupError('--dir=<unzipped Search Console export folder> is required (docs/GSC-INTEGRATION-GUIDE.md §4)');
  const files = readdirSync(dir);
  const read = (re) => { const f = files.find((x) => re.test(x)); return f ? parseCsv(readFileSync(path.join(dir, f), 'utf8')) : null; };
  const dates = read(/^dates\.csv$/i) || read(/chart\.csv$/i);
  const out = { source: `Search Console UI export (${path.basename(dir)})`, generatedAt: new Date().toISOString(), windows: [], tables: {} };
  if (dates) {
    const daily = dates.map((r) => ({ date: r.Date || r.date, clicks: num(r.Clicks) || 0, impressions: num(r.Impressions) || 0, position: num(r.Position) || 0 }))
      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date)).sort((a, b) => a.date.localeCompare(b.date));
    const last = daily.at(-1)?.date;
    out.coverage = { firstDay: daily[0]?.date, lastDay: last, days: daily.length };
    for (const days of WINDOWS) {
      // Anchor windows on the export's last day (lag 0), so the comparison matches the file.
      const p = periods(days, new Date(new Date(last + 'T00:00:00Z').getTime() + 86_400_000), 1);
      const prev = totalsFromDaily(daily, p.previous.start, p.previous.end);
      out.windows.push({ days, period: p, totals: { current: totalsFromDaily(daily, p.current.start, p.current.end), previous: prev },
        incomplete: prev.days < days ? `export covers only ${prev.days} of ${days} previous-period days` : undefined });
    }
    out.monthly = Object.values(daily.reduce((m, d) => { const k = d.date.slice(0, 7); (m[k] ||= { month: k, clicks: 0, impressions: 0 }); m[k].clicks += d.clicks; m[k].impressions += d.impressions; return m; }, {}));
  }
  for (const [name, re] of [['query', /^queries\.csv$/i], ['page', /^pages\.csv$/i], ['device', /^devices\.csv$/i], ['country', /^countries\.csv$/i]]) {
    const t = read(re);
    if (!t) continue;
    const rows = normaliseGscTable(t);
    const compare = rows.some((r) => r.prev);
    out.tables[name] = { compareMode: compare, rows: rows.length, ...(compare ? movers(rows, { minImpressions: MIN_IMPR }) : {}), top: rows.slice(0, 25) };
  }
  if (!dates && !Object.keys(out.tables).length) throw new SetupError(`No Dates.csv / Queries.csv / Pages.csv found in ${dir}`);
  return out;
}

// ---------- URL inspection ----------
async function inspect() {
  const site = await resolveSite();
  const xml = await (await fetch(`${SITE_URL}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const list = urls.map((u) => ({ url: u, group: 'sitemap' }));
  if (args.legacy) {
    const legacy = JSON.parse(readFileSync(path.join(DIR, 'legacy-urls.json'), 'utf8'));
    for (const l of legacy.urls) list.push({ url: `https://ezyloan.co.in${l.path}`, group: 'legacy' });
  }
  if (list.length > 1900) throw new SetupError(`${list.length} URLs exceeds the 2,000/day URL Inspection quota — split the run`);
  const results = [];
  for (const [i, item] of list.entries()) {
    try {
      const j = await googleJson('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        scopes: SCOPES.searchConsole, body: { inspectionUrl: item.url, siteUrl: site, languageCode: 'en-IN' },
      });
      const r = j.inspectionResult?.indexStatusResult || {};
      results.push({ ...item, verdict: r.verdict, coverageState: r.coverageState, indexingState: r.indexingState, robotsTxtState: r.robotsTxtState,
        pageFetchState: r.pageFetchState, lastCrawlTime: r.lastCrawlTime || null, googleCanonical: r.googleCanonical || null, userCanonical: r.userCanonical || null,
        canonicalMismatch: !!(r.googleCanonical && r.userCanonical && r.googleCanonical !== r.userCanonical), referringUrls: (r.referringUrls || []).slice(0, 5), sitemaps: r.sitemap || [] });
    } catch (e) {
      results.push({ ...item, error: e.message });
    }
    if ((i + 1) % 10 === 0) process.stderr.write(`  inspected ${i + 1}/${list.length}\n`);
    await new Promise((res) => setTimeout(res, 150)); // stay far below 600/min
  }
  const sitemapRows = results.filter((r) => r.group === 'sitemap');
  const byState = sitemapRows.reduce((m, r) => { const k = r.coverageState || r.error || 'unknown'; m[k] = (m[k] || 0) + 1; return m; }, {});
  return { source: 'Search Console URL Inspection API', site, generatedAt: new Date().toISOString(),
    summary: { sitemapUrls: sitemapRows.length, indexed: sitemapRows.filter((r) => r.verdict === 'PASS').length, canonicalMismatches: sitemapRows.filter((r) => r.canonicalMismatch).length, byCoverageState: byState },
    results };
}

// ---------- markdown ----------
const f = (n, d = 0) => (n == null ? '—' : Number(n).toLocaleString('en-IN', { maximumFractionDigits: d }));
const fp = (x) => (x == null ? '—' : `${x >= 0 ? '+' : ''}${(x * 100).toFixed(1)}%`);
const fctr = (x) => (x == null ? '—' : `${(x * 100).toFixed(2)}%`);

function moverTable(title, list, key) {
  if (!list?.length) return `**${title}:** none above the ${MIN_IMPR}-impression threshold.\n`;
  const rows = list.map((r) => `| ${String(r.key).replace(SITE_URL, '').replace(/\|/g, '/')} | ${f(r.prev.clicks)} → ${f(r.cur.clicks)} | ${f(r.prev.impressions)} → ${f(r.cur.impressions)} | ${f(r.prev.position, 1)} → ${f(r.cur.position, 1)} |${r.lost ? ' no impressions now' : r.gained ? ' new' : ''}`);
  return `**${title}**\n\n| ${key} | Clicks | Impressions | Avg position |\n|---|---|---|---|\n${rows.join('\n')}\n`;
}

export function performanceMarkdown(r) {
  let md = `# Search Console performance — ${r.source}\n\nGenerated ${r.generatedAt}${r.site ? ` · property \`${r.site}\`` : ''}${r.coverage ? ` · data ${r.coverage.firstDay} → ${r.coverage.lastDay}` : ''}\n\n`;
  md += `> **Data status: MEASURED** — every figure below was returned by ${r.source}${r.dataState ? ` (\`dataState: ${r.dataState}\`)` : ''}. Nothing is estimated or modelled. A dash (—) means Google returned no value, not zero.${r.windows.some((w) => w.incomplete) ? ' ⚠ Some comparison windows are incomplete (marked below).' : ''}\n\n`;
  md += `Rows with fewer than ${MIN_IMPR} impressions in both periods are not ranked as movers (too small to separate from noise).\n\n`;
  md += '| Window | Clicks | Impressions | CTR | Avg position |\n|---|---|---|---|---|\n';
  for (const w of r.windows) {
    const c = w.totals.current, p = w.totals.previous;
    md += `| ${w.days} d (${w.period.current.start} → ${w.period.current.end}) vs previous | ${f(p.clicks)} → ${f(c.clicks)} (${fp(pct(c.clicks, p.clicks))}) | ${f(p.impressions)} → ${f(c.impressions)} (${fp(pct(c.impressions, p.impressions))}) | ${fctr(p.ctr)} → ${fctr(c.ctr)} | ${f(p.position, 1)} → ${f(c.position, 1)} |${w.incomplete ? ` ⚠ ${w.incomplete}` : ''}\n`;
  }
  if (r.monthly?.length) md += `\n**Monthly (from export)**\n\n| Month | Clicks | Impressions |\n|---|---|---|\n${r.monthly.map((m) => `| ${m.month} | ${f(m.clicks)} | ${f(m.impressions)} |`).join('\n')}\n`;
  for (const w of r.windows.filter((x) => x.query)) {
    md += `\n## ${w.days}-day window\n\n${moverTable('Declining queries', w.query.declining, 'Query')}\n${moverTable('Declining pages', w.page.declining, 'Page')}\n${moverTable('Improving queries', w.query.improving.slice(0, 10), 'Query')}\n`;
  }
  for (const [name, t] of Object.entries(r.tables || {})) {
    md += `\n## ${name} table (export${t.compareMode ? ', compare mode' : ''})\n\n`;
    md += t.compareMode ? `${moverTable(`Declining ${name}s`, t.declining, name)}\n${moverTable(`Improving ${name}s`, t.improving.slice(0, 10), name)}` : `Plain export (no comparison columns). Re-export with **Compare** enabled to rank declines.\n`;
  }
  return md;
}

function inspectMarkdown(r) {
  let md = `# URL-level indexing report\n\nGenerated ${r.generatedAt} · property \`${r.site}\` · source: URL Inspection API (Google's own index status)\n\n`;
  md += `> **Data status: MEASURED** per URL by Google. A row showing an error instead of a verdict was **not measured** (API error), and is not counted as indexed or not indexed.\n\n`;
  md += `**Sitemap URLs indexed:** ${r.summary.indexed} / ${r.summary.sitemapUrls} · **Google-selected canonical ≠ declared:** ${r.summary.canonicalMismatches}\n\n`;
  md += `| Coverage state | URLs |\n|---|---|\n${Object.entries(r.summary.byCoverageState).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}\n\n`;
  md += '| URL | Group | Verdict | Coverage | Last crawl | Google canonical |\n|---|---|---|---|---|---|\n';
  for (const x of r.results) md += `| ${x.url.replace(/^https:\/\/(www\.)?ezyloan\.co\.in/, '') || '/'} | ${x.group} | ${x.verdict || x.error || ''} | ${x.coverageState || ''} | ${(x.lastCrawlTime || '').slice(0, 10)} | ${x.canonicalMismatch ? `⚠ ${x.googleCanonical}` : 'same'} |\n`;
  return md;
}

async function main() {
  let result, md;
  if (MODE === 'performance') { result = await performanceApi(); md = performanceMarkdown(result); }
  else if (MODE === 'csv') { result = performanceCsv(args.dir); md = performanceMarkdown(result); }
  else if (MODE === 'inspect') { result = await inspect(); md = inspectMarkdown(result); }
  else { console.error('Usage: node scripts/seo/gsc-report.mjs <performance|csv|inspect> [--dir=] [--site=] [--out=] [--legacy]'); process.exit(2); }
  mkdirSync(OUT, { recursive: true });
  const base = path.join(OUT, `gsc-${MODE}-${ymd(new Date())}`);
  writeFileSync(`${base}.json`, JSON.stringify(result, null, 2));
  writeFileSync(`${base}.md`, md);
  console.log(`wrote ${base}.json and .md`);
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((e) => {
    console.error(e instanceof SetupError ? `Setup needed: ${e.message}` : `Failed: ${e.message}`);
    process.exit(e instanceof SetupError ? 3 : 1);
  });
}
