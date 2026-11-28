// Legacy-URL redirect logic: validation (loops, chains, shadowing, duplicates), Next.js
// redirect generation, and a runtime checker that follows redirects hop by hop.
// Pure except checkUrl(), which performs one GET per hop. Tested in scripts/test-seo-tools.mjs.

export const CANONICAL_ORIGIN = 'https://www.ezyloan.co.in';

/** Redirects that already exist in next.config.mjs (kept in sync by a test). */
export const EXISTING_REDIRECTS = { '/terms': '/terms-and-conditions', '/privacy': '/privacy-policy', '/blog': '/blogs' };

const norm = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);

/**
 * Static validation of the map. `livePaths` = every path that serves a real page (200),
 * e.g. the sitemap paths. Returns { errors: [...], warnings: [...] }. Any error blocks implementation.
 */
export function validateRedirectMap(rows, livePaths, { existing = EXISTING_REDIRECTS } = {}) {
  const errors = [], warnings = [];
  const live = new Set([...livePaths].map(norm));
  const active = rows.filter((r) => r.destination);
  const seen = new Map();
  for (const r of rows) {
    const s = r.path;
    if (!/^\/[^?#\s]*$/.test(s)) errors.push(`${s}: source must be a path starting with "/" and without query, fragment or spaces`);
    if (seen.has(norm(s))) errors.push(`${s}: duplicate source (also row "${seen.get(norm(s))}")`);
    seen.set(norm(s), s);
    if (live.has(norm(s))) errors.push(`${s}: source is a live page — redirecting it would remove a working URL`);
    if (existing[norm(s)]) errors.push(`${s}: already redirected by next.config.mjs → ${existing[norm(s)]}`);
    if (s !== s.toLowerCase()) warnings.push(`${s}: mixed case — Next.js matching is case-sensitive`);
  }
  const map = new Map(active.map((r) => [norm(r.path), norm(r.destination)]));
  for (const [s, d] of map) {
    if (!d.startsWith('/')) errors.push(`${s}: destination must be a site path, got "${d}"`);
    if (s === d) errors.push(`${s}: redirects to itself (loop)`);
    if (map.has(d)) errors.push(`${s} → ${d}: destination is itself redirected → ${map.get(d)} (chain)`);
    if (existing[d]) errors.push(`${s} → ${d}: destination is redirected by next.config.mjs → ${existing[d]} (chain)`);
    if (!live.has(d)) errors.push(`${s} → ${d}: destination is not a live page`);
  }
  // Cycle detection across the whole graph (covers longer loops than A→A).
  for (const start of map.keys()) {
    const path = [start];
    let cur = start;
    while (map.has(cur)) {
      cur = map.get(cur);
      if (path.includes(cur)) { errors.push(`loop: ${[...path, cur].join(' → ')}`); break; }
      path.push(cur);
    }
  }
  return { errors: [...new Set(errors)], warnings };
}

/**
 * Next.js `redirects()` entries for APPROVED rows only. Absolute www destination so a
 * request on the apex host reaches the final page in ONE hop (these entries must be
 * placed before the apex→www rule in next.config.mjs). statusCode 301 as requested
 * (Next's `permanent: true` would send 308).
 */
export function nextRedirects(rows) {
  return rows
    .filter((r) => r.approved === true && r.destination)
    .map((r) => ({ source: r.path, destination: `${CANONICAL_ORIGIN}${r.destination}`, statusCode: 301 }));
}

/**
 * Follow redirects manually from `url`, up to `maxHops`. Detects loops (a URL seen twice)
 * and reports every hop, so chains are visible. fetchImpl is injectable for tests.
 */
export async function followRedirects(url, { maxHops = 6, fetchImpl = fetch, headers = {} } = {}) {
  const hops = [];
  const seen = new Set();
  let cur = url;
  for (let i = 0; i <= maxHops; i++) {
    if (seen.has(cur)) return { hops, final: null, loop: true };
    seen.add(cur);
    let r;
    try { r = await fetchImpl(cur, { method: 'GET', redirect: 'manual', headers, signal: AbortSignal.timeout(30_000) }); }
    catch (e) { return { hops, final: { url: cur, status: 0, error: e.message }, loop: false }; }
    const loc = r.headers.get('location');
    hops.push({ url: cur, status: r.status, location: loc });
    if (r.status >= 300 && r.status < 400 && loc) { cur = new URL(loc, cur).toString(); continue; }
    return { hops, final: { url: cur, status: r.status }, loop: false };
  }
  return { hops, final: null, loop: false, tooManyHops: true };
}
