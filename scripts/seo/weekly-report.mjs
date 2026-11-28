// Weekly SEO audit — READ-ONLY against the live site and Google APIs.
//
//   node scripts/seo/weekly-report.mjs [--base=https://www.ezyloan.co.in] [--out=reports/seo]
//
// Runs whatever is configured and marks the rest "not measured" (never estimated):
//   always      technical crawl (scripts/seo-crawl.mjs), sitemap, robots/AI-crawler access, llms.txt, internal links
//   GSC         GOOGLE_SA_KEY_FILE|JSON  → 7/28/90-day performance, declining queries/pages, URL inspection
//   GA4         + GA4_PROPERTY_ID        → organic sessions, landing pages, leads, AI-assistant referrals
//   PageSpeed   PAGESPEED_API_KEY        → Core Web Vitals (field data when Google has it, else lab)
// Writes <out>/weekly-<date>.md + .json and compares with the newest earlier weekly-*.json in <out>/history.

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCOPES, SetupError, googleJson, loadServiceAccount } from './lib/google.mjs';
import { healthScore, periods, ymd } from './lib/analysis.mjs';
import { ga4Organic } from './ga4-report.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '../..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const BASE = (args.base || 'https://www.ezyloan.co.in').replace(/\/$/, '');
const OUT = path.resolve(args.out || path.join(ROOT, 'reports/seo'));
const HISTORY = path.join(OUT, 'history');
const TODAY = ymd(new Date());

const SERVICE_PAGES = ['/used-car-loan', '/car-loan', '/car-loan-topup', '/car-loan-balance-transfer', '/car-loan-refinance', '/commercial-vehicle-loan', '/personal-loan', '/property-loan'];
const KEY_PAGES = ['/', '/used-car-loan', '/car-loan', '/car-loan-topup', '/car-loan-balance-transfer', '/commercial-vehicle-loan'];
const AI_BOTS = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'CCBot'];
const AI_SOURCES = /chatgpt|openai|perplexity|gemini|bard|copilot|claude\.ai|you\.com|phind/i;

const sections = {};
const notMeasured = [];
const actions = [];
const act = (priority, area, text) => actions.push({ priority, area, text });

// ---------- 1. Technical crawl ----------
function crawl() {
  const file = path.join(OUT, `crawl-${TODAY}.json`);
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts/seo-crawl.mjs'), BASE, file], { encoding: 'utf8', timeout: 20 * 60_000 });
  if (r.status !== 0) throw new Error(`seo-crawl failed: ${(r.stderr || r.stdout || '').slice(-400)}`);
  return JSON.parse(readFileSync(file, 'utf8'));
}

function technical(c) {
  const idx = c.pages.filter((p) => p.status === 200 && !/noindex/i.test((p.robots || '') + (p.xRobotsTag || '')));
  const sitemapPages = c.pages.filter((p) => p.inSitemap);
  const canonOf = (p) => BASE + (p.path === '/' ? '' : p.path);
  const m = {
    pagesCrawled: c.pages.length,
    sitemapTotal: c.sitemapCount,
    sitemap200: sitemapPages.filter((p) => p.status === 200).length,
    brokenLinks: c.broken.length,
    indexable: idx.length,
    missingMeta: idx.filter((p) => !p.title || !p.description).length,
    dupTitles: c.duplicateTitles.length,
    dupDescriptions: c.duplicateDescriptions.length,
    badH1: idx.filter((p) => (p.h1 || []).length !== 1).length,
    badCanonical: idx.filter((p) => p.canonical && p.canonical.replace(/\/$/, '') !== canonOf(p).replace(/\/$/, '')).length,
    invalidJsonLd: idx.filter((p) => p.jsonLdInvalid > 0).length,
    noindexInSitemap: sitemapPages.filter((p) => /noindex/i.test((p.robots || '') + (p.xRobotsTag || ''))).length,
    imagesNoAlt: idx.reduce((a, p) => a + (p.imagesNoAlt || []).length, 0),
    longTitles: idx.filter((p) => (p.title || '').length > 65).map((p) => p.path),
    headingSkips: idx.filter((p) => (p.headingSkips || []).length).map((p) => p.path),
    thinPages: idx.filter((p) => p.path.startsWith('/blog/') && p.textChars < 6000).map((p) => p.path),
  };
  if (m.brokenLinks) act('P0', 'Technical', `${m.brokenLinks} broken internal link target(s): ${c.broken.slice(0, 5).map((b) => `${b.target} (${b.status})`).join(', ')}`);
  if (m.sitemap200 < m.sitemapTotal) act('P0', 'Sitemap', `${m.sitemapTotal - m.sitemap200} sitemap URL(s) do not return 200`);
  if (m.noindexInSitemap) act('P0', 'Indexing', `${m.noindexInSitemap} noindex URL(s) listed in the sitemap`);
  if (m.missingMeta) act('P1', 'Metadata', `${m.missingMeta} indexable page(s) missing a title or description`);
  if (m.dupTitles || m.dupDescriptions) act('P1', 'Metadata', `${m.dupTitles} duplicate title group(s), ${m.dupDescriptions} duplicate description group(s)`);
  if (m.badCanonical) act('P1', 'Canonical', `${m.badCanonical} page(s) whose canonical is not self-referencing`);
  if (m.longTitles.length) act('P3', 'Metadata', `${m.longTitles.length} title(s) over 65 characters (truncated in results): ${m.longTitles.slice(0, 3).join(', ')}`);
  return m;
}

// ---------- 2. Internal links ----------
function internalLinks(c) {
  const all = c.pages.filter((p) => p.status === 200 && p.inSitemap);
  // Contextual links only: links inside <main> (seo-crawl `contentLinks`), which
  // excludes the header/footer navigation present on every page.
  const sitewide = new Set(['(header/footer navigation outside <main>)']);
  const pages = all.map((p) => ({ ...p, internalLinks: p.contentLinks ?? p.internalLinks ?? [] }));
  const linksTo = (target) => pages.filter((p) => p.path !== target && (p.internalLinks || []).includes(target)).map((p) => p.path);
  const inbound = pages.map((p) => ({ path: p.path, from: linksTo(p.path) }));
  const orphans = inbound.filter((x) => x.from.length === 0).map((x) => x.path);
  // "Listing-only": the blog index is the only page that links here.
  const listingOnly = inbound.filter((x) => x.from.length > 0 && x.from.every((f) => f === '/blogs')).map((x) => x.path);
  const blogs = pages.filter((p) => p.path.startsWith('/blog/'));
  const blogsNoService = blogs.filter((b) => !(b.internalLinks || []).some((l) => SERVICE_PAGES.includes(l))).map((b) => b.path);
  const serviceFromBlogs = SERVICE_PAGES.map((s) => ({ path: s, fromBlogs: blogs.filter((b) => (b.internalLinks || []).includes(s)).length }));
  const h1 = Object.fromEntries(pages.map((p) => [p.path, (p.h1 || [])[0] || p.title]));
  const trueOrphans = orphans.filter((p) => !(c.pages.some((q) => q.path !== p && (q.internalLinks || []).includes(p))));
  if (trueOrphans.length) act('P1', 'Internal links', `${trueOrphans.length} sitemap page(s) with no internal link anywhere (not even navigation): ${trueOrphans.slice(0, 5).join(', ')}`);
  const navOnlyServices = orphans.filter((p) => SERVICE_PAGES.includes(p));
  if (navOnlyServices.length) act('P2', 'Internal links', `${navOnlyServices.length} service page(s) reached only through header/footer navigation, with no in-content link: ${navOnlyServices.join(', ')}`);
  if (listingOnly.length) act('P2', 'Internal links', `${listingOnly.length} page(s) linked only from /blogs — add contextual links from the related service page and 1–2 related posts: ${listingOnly.slice(0, 4).join(', ')}`);
  if (blogsNoService.length) act('P2', 'Internal links', `${blogsNoService.length} blog post(s) do not link to any service page`);
  const weakest = [...serviceFromBlogs].sort((a, b) => a.fromBlogs - b.fromBlogs)[0];
  if (weakest && weakest.fromBlogs < 3) act('P2', 'Internal links', `${weakest.path} receives links from only ${weakest.fromBlogs} blog post(s)`);
  return { sitewideLinks: [...sitewide].sort(), orphans, listingOnly, blogsNoService, serviceFromBlogs, suggestions: listingOnly.slice(0, 15).map((p) => ({ target: p, anchorSuggestion: h1[p], fromCandidates: SERVICE_PAGES.filter((s) => p.includes(s.slice(1).split('-')[0])).slice(0, 2) })) };
}

// ---------- 3. Crawler & AI access ----------
async function crawlerAccess() {
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  const groups = [];
  let cur = null;
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    const [k, ...v] = line.split(':');
    const val = v.join(':').trim();
    if (/^user-agent$/i.test(k)) { if (!cur || cur.rules.length) groups.push((cur = { agents: [], rules: [] })); cur.agents.push(val.toLowerCase()); }
    else if (cur && /^(allow|disallow)$/i.test(k)) cur.rules.push({ type: k.toLowerCase(), path: val });
  }
  const verdict = (bot) => {
    const g = groups.find((x) => x.agents.includes(bot.toLowerCase())) || groups.find((x) => x.agents.includes('*'));
    if (!g) return 'allowed (no rule)';
    const rootBlocked = g.rules.some((r) => r.type === 'disallow' && r.path === '/');
    return `${rootBlocked ? 'BLOCKED' : 'allowed'} (${g.agents.includes(bot.toLowerCase()) ? 'own rule' : 'via *'})`;
  };
  const llms = await fetch(`${BASE}/llms.txt`).then((r) => r.status).catch(() => 0);
  const bots = Object.fromEntries(AI_BOTS.map((b) => [b, verdict(b)]));
  if (/BLOCKED/.test(bots.Googlebot) || /BLOCKED/.test(bots.Bingbot)) act('P0', 'Crawling', 'robots.txt blocks Googlebot or Bingbot');
  return { bots, llmsTxt: llms, note: 'GPTBot = model training, OAI-SearchBot = ChatGPT search; Google-Extended = Gemini training (does not affect Google Search). Changing these is a management decision.' };
}

// ---------- 4. Search Console ----------
async function searchConsole() {
  const run = (mode, extra = []) => {
    const r = spawnSync(process.execPath, [path.join(DIR, 'gsc-report.mjs'), mode, `--out=${OUT}`, ...extra], { encoding: 'utf8', env: process.env, timeout: 30 * 60_000 });
    if (r.status === 3) throw new SetupError((r.stderr || '').replace(/^Setup needed: /, '').trim());
    if (r.status !== 0) throw new Error((r.stderr || r.stdout || '').trim().slice(-400));
    return JSON.parse(readFileSync(path.join(OUT, `gsc-${mode}-${TODAY}.json`), 'utf8'));
  };
  const perf = run('performance');
  const inspection = run('inspect', ['--legacy']);
  const w28 = perf.windows.find((w) => w.days === 28);
  const t = w28.totals;
  if (t.previous.clicks && t.current.clicks < t.previous.clicks * 0.85) act('P1', 'Search performance', `Clicks down ${Math.round(100 - (100 * t.current.clicks) / t.previous.clicks)}% (28 d vs previous 28 d) — see declining pages`);
  for (const p of w28.page.declining.slice(0, 3)) act('P2', 'Search performance', `Page losing clicks: ${p.key.replace(BASE, '')} (${p.prev.clicks} → ${p.cur.clicks}, position ${p.prev.position?.toFixed(1)} → ${p.cur.position?.toFixed(1)})`);
  const s = inspection.summary;
  if (s.sitemapUrls && s.indexed < s.sitemapUrls) act('P1', 'Indexing', `${s.sitemapUrls - s.indexed} of ${s.sitemapUrls} sitemap URLs are not indexed — states: ${Object.entries(s.byCoverageState).filter(([k]) => !/indexed/i.test(k) || /not indexed/i.test(k)).map(([k, v]) => `${k} ${v}`).join('; ')}`);
  if (s.canonicalMismatches) act('P1', 'Indexing', `${s.canonicalMismatches} URL(s) where Google chose a different canonical`);
  const legacyKnown = inspection.results.filter((r) => r.group === 'legacy' && r.coverageState && !/unknown to google/i.test(r.coverageState));
  if (legacyKnown.length) act('P1', 'Redirects', `${legacyKnown.length} legacy URL(s) still known to Google — redirect map applies (docs/OLD-URL-REDIRECT-MAP.md)`);
  return { perf, inspection: { summary: s, notIndexed: inspection.results.filter((r) => r.group === 'sitemap' && r.verdict !== 'PASS').map((r) => ({ url: r.url, coverageState: r.coverageState || r.error })), legacyKnown: legacyKnown.map((r) => ({ url: r.url, coverageState: r.coverageState })) } };
}

// ---------- 5. GA4 ----------
async function analytics() {
  const r = await ga4Organic(process.env.GA4_PROPERTY_ID, 7);
  const p = periods(7, new Date(), 1);
  const ai = await googleJson(`https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`, {
    scopes: SCOPES.analytics,
    body: { dateRanges: [{ startDate: p.current.start, endDate: p.current.end }], dimensions: [{ name: 'sessionSource' }], metrics: [{ name: 'sessions' }, { name: 'keyEvents' }], limit: '500' },
  });
  const aiRows = (ai.rows || []).filter((x) => AI_SOURCES.test(x.dimensionValues[0].value)).map((x) => ({ source: x.dimensionValues[0].value, sessions: Number(x.metricValues[0].value), keyEvents: Number(x.metricValues[1].value) }));
  if (r.lowConversion.length) act('P2', 'Conversion', `${r.lowConversion.length} organic landing page(s) with ≥ 30 sessions and no lead event — review CTA/form placement: ${r.lowConversion.slice(0, 3).map((x) => x.key).join(', ')}`);
  return { ...r, aiReferrals: aiRows };
}

// ---------- 6. PageSpeed ----------
async function pagespeed() {
  const key = process.env.PAGESPEED_API_KEY;
  if (!key) throw new SetupError('PAGESPEED_API_KEY not set');
  const out = [];
  for (const p of KEY_PAGES) {
    // PageSpeed documents only the `key=` query parameter. googleJson redacts it from every
    // error message, and this script never logs request URLs.
    const j = await googleJson(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(BASE + p)}&strategy=mobile&category=performance&key=${encodeURIComponent(key)}`, { redact: [key] })
      .catch((e) => {
        if (/quota/i.test(e.message)) throw new SetupError(`PageSpeed quota exceeded for this API key's project: ${e.message.slice(0, 120)}`);
        if (e.status === 400 || e.status === 403) throw new SetupError(`PageSpeed rejected the API key (HTTP ${e.status}): ${e.message.slice(0, 120)} — check the key and that "PageSpeed Insights API" is enabled and allowed in the key's API restrictions`);
        throw e;
      });
    const a = j.lighthouseResult.audits;
    const fld = j.loadingExperience?.metrics && !j.loadingExperience.origin_fallback ? j.loadingExperience.metrics : null;
    const lab = { lcp: a['largest-contentful-paint'].numericValue, cls: a['cumulative-layout-shift'].numericValue, tbt: a['total-blocking-time'].numericValue };
    const field = fld ? { lcp: fld.LARGEST_CONTENTFUL_PAINT_MS?.percentile, inp: fld.INTERACTION_TO_NEXT_PAINT?.percentile, cls: (fld.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile ?? 0) / 100 } : null;
    const good = field ? field.lcp <= 2500 && (field.inp ?? 0) <= 200 && field.cls <= 0.1 : lab.lcp <= 2500 && lab.cls <= 0.1 && lab.tbt <= 200;
    out.push({ path: p, source: field ? 'field (CrUX p75)' : 'lab (Lighthouse)', score: Math.round(j.lighthouseResult.categories.performance.score * 100), lab, field, good });
  }
  const bad = out.filter((x) => !x.good);
  if (bad.length) act('P2', 'Core Web Vitals', `${bad.length}/${out.length} key page(s) not "good" on mobile: ${bad.map((x) => `${x.path} (${x.source})`).join(', ')}`);
  return out;
}

async function attempt(name, fn) {
  try { sections[name] = await fn(); }
  catch (e) {
    notMeasured.push({ section: name, reason: e instanceof SetupError ? e.message : `error: ${e.message}` });
    sections[name] = null;
  }
}

// ---------- report ----------
const n = (x, d = 0) => (x == null ? '—' : Number(x).toLocaleString('en-IN', { maximumFractionDigits: d }));
function markdown(rep, prev) {
  const h = rep.health;
  let md = `# Weekly SEO report — ${TODAY}\n\nSite: ${BASE} · generated ${rep.generatedAt}\n\n`;
  md += `> **Measured vs estimated:** every number below was measured this run, by the source named in its section. Nothing is estimated. Sections that could not run are listed under *Not measured*. Their absence is not a pass or a fail.\n\n`;
  md += `## Health score\n\n| | Score | Coverage |\n|---|---|---|\n| This week | **${h.score ?? '—'}** / 100 | ${Math.round(h.coverage * 100)}% of checks measured |\n| Previous week | ${prev?.health?.score ?? '—'} | ${prev ? `${Math.round(prev.health.coverage * 100)}% (${prev.date})` : 'no earlier report'} |\n\n`;
  md += `Scores are only comparable when coverage is the same. A new integration changes the denominator.\n\n| Check | Weight | Result | Status |\n|---|---|---|---|\n${h.checks.map((c) => `| ${c.label} | ${c.weight} | ${c.value == null ? '—' : `${Math.round(c.value * 100)}%`} | ${c.status} |`).join('\n')}\n\n`;
  md += `## Recommended actions\n\n${rep.actions.length ? `| Priority | Area | Action |\n|---|---|---|\n${rep.actions.sort((a, b) => a.priority.localeCompare(b.priority)).map((a) => `| ${a.priority} | ${a.area} | ${a.text} |`).join('\n')}` : 'No issues found by the measured checks.'}\n\n`;
  if (rep.notMeasured.length) md += `## Not measured this week\n\n${rep.notMeasured.map((x) => `- **${x.section}** — ${x.reason}`).join('\n')}\n\n`;
  const t = rep.sections.technical;
  if (t) md += `## Technical SEO (crawl of ${t.pagesCrawled} URLs)\n\n| Check | Result |\n|---|---|\n| Sitemap URLs returning 200 | ${t.sitemap200}/${t.sitemapTotal} |\n| Broken internal link targets | ${t.brokenLinks} |\n| Missing title/description | ${t.missingMeta} |\n| Duplicate title / description groups | ${t.dupTitles} / ${t.dupDescriptions} |\n| Pages without exactly one H1 | ${t.badH1} |\n| Non-self canonicals | ${t.badCanonical} |\n| Invalid JSON-LD | ${t.invalidJsonLd} |\n| Images without alt | ${t.imagesNoAlt} |\n| Heading-level skips | ${t.headingSkips.length} |\n| Blog posts under ~6k characters of page text | ${t.thinPages.length} |\n\n`;
  const g = rep.sections.searchConsole;
  if (g) {
    md += `## Search Console (property \`${g.perf.site}\`)\n\n| Window | Clicks | Impressions | Avg position |\n|---|---|---|---|\n`;
    for (const w of g.perf.windows) md += `| ${w.days} d vs previous | ${n(w.totals.previous.clicks)} → ${n(w.totals.current.clicks)} | ${n(w.totals.previous.impressions)} → ${n(w.totals.current.impressions)} | ${n(w.totals.previous.position, 1)} → ${n(w.totals.current.position, 1)} |\n`;
    const w28 = g.perf.windows.find((w) => w.days === 28);
    md += `\n**Top pages (28 d):** ${w28.page.top.slice(0, 10).map((r) => `${r.key.replace(BASE, '') || '/'} (${r.cur.clicks})`).join(', ')}\n\n`;
    md += `**Declining queries (28 d):** ${w28.query.declining.slice(0, 10).map((r) => `"${r.key}" ${r.prev.clicks}→${r.cur.clicks}`).join(', ') || 'none above threshold'}\n\n`;
    md += `**Improving queries (28 d):** ${w28.query.improving.slice(0, 10).map((r) => `"${r.key}" ${r.prev.clicks}→${r.cur.clicks}`).join(', ') || 'none above threshold'}\n\n`;
    md += `**Blog posts in top pages:** ${w28.page.top.filter((r) => r.key.includes('/blog/')).map((r) => `${r.key.replace(BASE, '')} (${r.cur.clicks} clicks, ${r.cur.impressions} impr.)`).join(', ') || 'none'}\n\n`;
    md += `**Indexing:** ${g.inspection.summary.indexed}/${g.inspection.summary.sitemapUrls} sitemap URLs indexed. Not indexed: ${g.inspection.notIndexed.map((x) => `${x.url.replace(BASE, '')} (${x.coverageState})`).join(', ') || 'none'}\n\n`;
    md += `Full tables: \`gsc-performance-${TODAY}.md\`, \`gsc-inspect-${TODAY}.md\`.\n\n`;
  }
  const a = rep.sections.analytics;
  if (a) md += `## GA4 — organic (7 d vs previous 7 d)\n\n- Organic sessions ${n(a.totals.prev.sessions)} → ${n(a.totals.cur.sessions)}; key events ${n(a.totals.prev.keyEvents)} → ${n(a.totals.cur.keyEvents)}\n- Top landing pages: ${a.landing.slice(0, 8).map((x) => `${x.key} (${x.cur.sessions})`).join(', ') || 'none'}\n- AI-assistant referrals (sessionSource): ${a.aiReferrals.map((x) => `${x.source} ${x.sessions} sessions / ${x.keyEvents} key events`).join(', ') || 'none recorded'}\n${a.note ? `- ${a.note}\n` : ''}\n`;
  const ps = rep.sections.pagespeed;
  if (ps) md += `## Core Web Vitals (mobile)\n\n| Page | Source | LCP | INP | CLS | Good |\n|---|---|---|---|---|---|\n${ps.map((x) => `| ${x.path} | ${x.source} | ${n(x.field?.lcp ?? x.lab.lcp)} ms | ${x.field?.inp != null ? `${x.field.inp} ms` : '— (lab has no INP)'} | ${(x.field?.cls ?? x.lab.cls).toFixed(3)} | ${x.good ? '✅' : '❌'} |`).join('\n')}\n\n`;
  const il = rep.sections.internalLinks;
  if (il) md += `## Internal links (contextual: links inside \`<main>\`, header/footer navigation excluded)\n\n- Pages with no contextual inbound link (reachable only through navigation): ${il.orphans.join(', ') || 'none'}\n- Linked only from /blogs: ${il.listingOnly.length}\n- Blog posts without a service-page link: ${il.blogsNoService.length}\n- Blog → service links: ${il.serviceFromBlogs.map((s) => `${s.path} ${s.fromBlogs}`).join(', ')}\n\n${il.suggestions.length ? `| Page needing links | Suggested anchor (its H1, shorten naturally) | Link from |\n|---|---|---|\n${il.suggestions.map((s) => `| ${s.target} | ${s.anchorSuggestion} | ${s.fromCandidates.join(', ') || 'a related post'} |`).join('\n')}\n\n` : ''}`;
  const ca = rep.sections.crawlerAccess;
  if (ca) md += `## Crawler & AI-search access\n\n| Crawler | robots.txt |\n|---|---|\n${Object.entries(ca.bots).map(([b, v]) => `| ${b} | ${v} |`).join('\n')}\n\n/llms.txt → HTTP ${ca.llmsTxt}. ${ca.note}\n\nAI-answer visibility itself (whether ChatGPT, Perplexity or Gemini *cite* EzyLoan) has no API and is not measured here. Referral sessions in GA4 are the measurable proxy.\n`;
  return md;
}

async function main() {
  mkdirSync(HISTORY, { recursive: true });
  let c = null;
  await attempt('technical', async () => { c = crawl(); return technical(c); });
  if (c) await attempt('internalLinks', async () => internalLinks(c));
  await attempt('crawlerAccess', crawlerAccess);
  // Technical-only mode: never fetch Search Console / GA4 data (used when the GitHub
  // repository is public, because workflow logs and artifacts are then readable by others).
  const technicalOnly = args['technical-only'] || process.env.SEO_TECHNICAL_ONLY === '1';
  const toReason = process.env.SEO_TECHNICAL_ONLY_REASON || 'technical-only mode';
  let saOk = !technicalOnly;
  if (technicalOnly) notMeasured.push({ section: 'searchConsole', reason: `disabled — ${toReason}` }, { section: 'analytics', reason: `disabled — ${toReason}` });
  else try { loadServiceAccount(); } catch (e) { saOk = false; notMeasured.push({ section: 'searchConsole', reason: e.message }, { section: 'analytics', reason: e.message }); }
  if (saOk) {
    await attempt('searchConsole', searchConsole);
    if (process.env.GA4_PROPERTY_ID) await attempt('analytics', analytics);
    else notMeasured.push({ section: 'analytics', reason: 'GA4_PROPERTY_ID not set (GA4 is not installed on the live site yet)' });
  }
  await attempt('pagespeed', pagespeed);

  const t = sections.technical || {};
  const ins = sections.searchConsole?.inspection.summary;
  const ps = sections.pagespeed;
  const health = healthScore({ ...t, inspected: ins?.sitemapUrls, indexed: ins?.indexed, cwvTested: ps?.length, cwvGood: ps?.filter((x) => x.good).length });

  const prevFile = readdirSync(HISTORY).filter((f) => /^weekly-\d{4}-\d{2}-\d{2}\.json$/.test(f) && f < `weekly-${TODAY}.json`).sort().at(-1);
  const prev = prevFile ? { ...JSON.parse(readFileSync(path.join(HISTORY, prevFile), 'utf8')), date: prevFile.slice(7, 17) } : null;

  const rep = { date: TODAY, generatedAt: new Date().toISOString(), base: BASE, health, actions, notMeasured, sections };
  const json = path.join(OUT, `weekly-${TODAY}.json`);
  writeFileSync(json, JSON.stringify(rep, null, 2));
  copyFileSync(json, path.join(HISTORY, `weekly-${TODAY}.json`));
  writeFileSync(path.join(OUT, `weekly-${TODAY}.md`), markdown(rep, prev));
  writeFileSync(path.join(OUT, 'WEEKLY-SEO-REPORT.md'), markdown(rep, prev));
  // Small, data-free summary for notifications (safe to show in a public issue).
  writeFileSync(path.join(OUT, 'summary.json'), JSON.stringify({
    date: TODAY, score: health.score, previousScore: prev?.health?.score ?? null, coverage: Math.round(health.coverage * 100),
    p0: actions.filter((a) => a.priority === 'P0' && ['Technical', 'Sitemap', 'Crawling'].includes(a.area)).map((a) => `${a.area}: ${a.text}`),
    p0Count: actions.filter((a) => a.priority === 'P0').length, actionCount: actions.length,
    notMeasured: notMeasured.map((x) => x.section),
  }, null, 2));
  console.log(`health ${health.score ?? '—'} (coverage ${Math.round(health.coverage * 100)}%), ${actions.length} action(s), ${notMeasured.length} section(s) not measured -> ${path.join(OUT, `weekly-${TODAY}.md`)}`);
}

main().catch((e) => { console.error(`Weekly report failed: ${e.message}`); process.exit(1); });
