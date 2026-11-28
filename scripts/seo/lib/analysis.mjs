// Pure helpers shared by the SEO scripts: periods, CSV parsing, period-over-period
// comparison and the weekly health score. No network, no I/O — unit-tested in
// scripts/test-seo-tools.mjs.

const DAY = 86_400_000;
export const ymd = (d) => new Date(d).toISOString().slice(0, 10);

/**
 * Current and previous equivalent windows of `days` days ending `lagDays` before `today`.
 * Search Console data is final after ~2–3 days, so the default lag is 3.
 */
export function periods(days, today = new Date(), lagDays = 3) {
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()) - lagDays * DAY);
  const start = new Date(end.getTime() - (days - 1) * DAY);
  const prevEnd = new Date(start.getTime() - DAY);
  const prevStart = new Date(prevEnd.getTime() - (days - 1) * DAY);
  return { days, current: { start: ymd(start), end: ymd(end) }, previous: { start: ymd(prevStart), end: ymd(prevEnd) } };
}

/** RFC-4180-ish CSV parser (quoted fields, escaped quotes, CRLF, BOM). */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v !== '')) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? '').trim()])));
}

/** "1,234" → 1234, "3.2%" → 0.032, "" → null */
export function num(v) {
  if (v == null || v === '') return null;
  const s = String(v).replace(/,/g, '').trim();
  if (s.endsWith('%')) return Number(s.slice(0, -1)) / 100;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalise a Search Console UI export table (Queries.csv / Pages.csv), plain or
 * compare mode. Compare-mode headers look like "Last 28 days Clicks" / "Previous 28 days Clicks".
 * Returns [{ key, cur: {clicks, impressions, ctr, position}, prev?: {...} }].
 */
export function normaliseGscTable(records) {
  if (!records.length) return [];
  const cols = Object.keys(records[0]);
  const keyCol = cols[0];
  const metric = (name) => {
    const plain = cols.find((c) => c.toLowerCase() === name);
    const pair = cols.filter((c) => c.toLowerCase().endsWith(' ' + name));
    const prev = pair.find((c) => /previous|^prev/i.test(c));
    const cur = pair.find((c) => c !== prev);
    return { cur: plain || cur, prev };
  };
  const m = { clicks: metric('clicks'), impressions: metric('impressions'), ctr: metric('ctr'), position: metric('position') };
  const compare = !!m.clicks.prev;
  return records.map((r) => {
    const pick = (which) => Object.fromEntries(Object.entries(m).map(([k, c]) => [k, num(r[c[which]])]));
    return { key: r[keyCol], cur: pick('cur'), ...(compare ? { prev: pick('prev') } : {}) };
  });
}

/** Sum a daily series (Dates.csv or API date rows) over [start, end]. Position is impression-weighted. */
export function totalsFromDaily(daily, start, end) {
  let clicks = 0, impressions = 0, posW = 0, n = 0;
  for (const d of daily) {
    if (d.date < start || d.date > end) continue;
    n++;
    clicks += d.clicks || 0;
    impressions += d.impressions || 0;
    posW += (d.position || 0) * (d.impressions || 0);
  }
  return { days: n, clicks, impressions, ctr: impressions ? clicks / impressions : null, position: impressions ? posW / impressions : null };
}

export const pct = (cur, prev) => (prev ? (cur - prev) / prev : cur ? null : 0);

/**
 * Rows that lost the most clicks (or, at equal clicks, position) between periods.
 * Rows with fewer than `minImpressions` in BOTH periods are skipped — at low volume
 * the change is noise, and the report says so rather than ranking it.
 */
export function movers(rows, { minImpressions = 20, limit = 25 } = {}) {
  const usable = rows.filter((r) => r.prev && Math.max(r.cur.impressions || 0, r.prev.impressions || 0) >= minImpressions);
  const withDelta = usable.map((r) => ({
    ...r,
    dClicks: (r.cur.clicks || 0) - (r.prev.clicks || 0),
    dImpr: (r.cur.impressions || 0) - (r.prev.impressions || 0),
    // Positive = got worse (higher number = lower ranking). null when either side has no position.
    dPos: r.cur.position != null && r.prev.position != null && r.cur.impressions && r.prev.impressions ? r.cur.position - r.prev.position : null,
    lost: !r.cur.impressions && r.prev.impressions > 0,
    gained: !r.prev.impressions && r.cur.impressions > 0,
  }));
  const declining = withDelta
    .filter((r) => r.dClicks < 0 || (r.dPos != null && r.dPos >= 1) || r.lost)
    .sort((a, b) => a.dClicks - b.dClicks || (b.dPos ?? 0) - (a.dPos ?? 0))
    .slice(0, limit);
  const improving = withDelta
    .filter((r) => r.dClicks > 0 || (r.dPos != null && r.dPos <= -1) || r.gained)
    .sort((a, b) => b.dClicks - a.dClicks || (a.dPos ?? 0) - (b.dPos ?? 0))
    .slice(0, limit);
  return { declining, improving, skippedLowVolume: rows.length - usable.length };
}

/**
 * Weekly technical health score, 0–100, from MEASURED checks only. Each check is
 * weighted; a check whose data is missing is reported as "not measured" and left
 * out of the denominator (so a missing integration never looks like a pass or a fail).
 */
export function healthScore(m) {
  const checks = [
    { id: 'sitemap_200', label: 'Sitemap URLs return 200', weight: 15, value: m.sitemapTotal ? m.sitemap200 / m.sitemapTotal : null },
    { id: 'no_broken_links', label: 'No broken internal links', weight: 15, value: m.pagesCrawled ? Math.max(0, 1 - m.brokenLinks / m.pagesCrawled) : null },
    { id: 'meta_complete', label: 'Title + description on every indexable page', weight: 10, value: m.indexable ? 1 - m.missingMeta / m.indexable : null },
    { id: 'meta_unique', label: 'No duplicate titles/descriptions', weight: 5, value: m.indexable ? 1 - Math.min(1, (m.dupTitles + m.dupDescriptions) / m.indexable) : null },
    { id: 'one_h1', label: 'Exactly one H1', weight: 5, value: m.indexable ? 1 - m.badH1 / m.indexable : null },
    { id: 'canonical_self', label: 'Self-referencing canonical', weight: 10, value: m.indexable ? 1 - m.badCanonical / m.indexable : null },
    { id: 'jsonld_valid', label: 'Valid structured data', weight: 5, value: m.indexable ? 1 - m.invalidJsonLd / m.indexable : null },
    { id: 'no_noindex_in_sitemap', label: 'No noindex URL in sitemap', weight: 10, value: m.sitemapTotal ? 1 - m.noindexInSitemap / m.sitemapTotal : null },
    { id: 'indexed_ratio', label: 'Sitemap URLs indexed (Google URL Inspection)', weight: 15, value: m.inspected ? m.indexed / m.inspected : null },
    { id: 'cwv_pass', label: 'Core Web Vitals "good" (PageSpeed field/lab)', weight: 10, value: m.cwvTested ? m.cwvGood / m.cwvTested : null },
  ];
  let got = 0, max = 0;
  for (const c of checks) {
    if (c.value == null || !Number.isFinite(c.value)) { c.status = 'not measured'; continue; }
    c.value = Math.max(0, Math.min(1, c.value));
    got += c.value * c.weight;
    max += c.weight;
    c.status = c.value >= 0.999 ? 'pass' : c.value >= 0.9 ? 'warn' : 'fail';
  }
  return { score: max ? Math.round((100 * got) / max) : null, coverage: max / checks.reduce((a, c) => a + c.weight, 0), checks };
}
