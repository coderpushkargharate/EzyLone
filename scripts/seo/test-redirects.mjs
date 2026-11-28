// Redirect regression test — READ-ONLY GETs against a running site.
//
//   node scripts/seo/test-redirects.mjs [baseUrl]      # default https://www.ezyloan.co.in
//
// Run it (1) against the live site now (baseline: no legacy redirect exists, so every legacy URL must 404),
// (2) against a local/staging build with the approved redirects, and (3) against production after deploy.
//
//  A. every APPROVED row: exactly one hop, 301, Location = https://www.ezyloan.co.in<destination>, final 200
//  B. every NOT-approved row (incl. keep-404 and decision rows): 404, no redirect
//  C. every sitemap URL: 200 with zero redirects (no live page was caught by a rule)
//  D. existing behaviour unchanged: /blog, /terms, /privacy redirects; unknown path → 404
// Loops and chains are detected by following every hop manually (lib/redirects.mjs followRedirects).
// A non-canonical base (localhost/staging) has the canonical origin rewritten to the base while
// following, but the Location header itself must still be the canonical absolute URL.

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { followRedirects, CANONICAL_ORIGIN, EXISTING_REDIRECTS } from './lib/redirects.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const BASE = (process.argv[2] || CANONICAL_ORIGIN).replace(/\/$/, '');
const map = JSON.parse(readFileSync(path.join(DIR, 'legacy-urls.json'), 'utf8'));
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; EzyLoan-SEO-Audit/1.0)' };

const onBase = (u) => (BASE === CANONICAL_ORIGIN ? u : u.replace(CANONICAL_ORIGIN, BASE));
// fetch wrapper that keeps following on the base under test
const fetchOnBase = (u, init) => fetch(onBase(u), init);

let pass = 0, fail = 0;
const failures = [];
const check = (ok, label) => { if (ok) pass++; else { fail++; failures.push(label); } };

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); }));
}

async function main() {
  const approved = map.urls.filter((u) => u.approved === true && u.destination);
  const others = map.urls.filter((u) => !(u.approved === true && u.destination));

  await pool(approved, 4, async (r) => {
    const f = await followRedirects(`${BASE}${r.path}`, { fetchImpl: fetchOnBase, headers: UA });
    const first = f.hops[0] || {};
    const expected = `${CANONICAL_ORIGIN}${r.destination}`;
    check(!f.loop, `A ${r.path}: redirect loop`);
    check(first.status === 301, `A ${r.path}: first response ${first.status}, expected 301`);
    check(first.location === expected, `A ${r.path}: Location "${first.location}", expected "${expected}"`);
    check(f.hops.length === 2, `A ${r.path}: ${f.hops.length - 1} redirect hop(s), expected exactly 1 (chain: ${f.hops.map((h) => h.status).join(' → ')})`);
    check(f.final?.status === 200, `A ${r.path}: destination answered ${f.final?.status}`);
  });

  await pool(others, 4, async (r) => {
    const f = await followRedirects(`${BASE}${r.path}`, { fetchImpl: fetchOnBase, headers: UA });
    check(f.hops.length === 1 && f.final?.status === 404, `B ${r.path}: expected plain 404, got ${f.hops.map((h) => h.status).join(' → ')}`);
  });

  const xml = await (await fetch(`${BASE}/sitemap.xml`, { headers: UA })).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  check(locs.length > 0, 'C sitemap.xml has no URLs');
  await pool(locs, 6, async (u) => {
    const f = await followRedirects(onBase(u), { fetchImpl: fetchOnBase, headers: UA });
    check(f.hops.length === 1 && f.final?.status === 200, `C ${u}: expected 200 without redirect, got ${f.hops.map((h) => h.status).join(' → ')}`);
  });

  for (const [src, dest] of Object.entries(EXISTING_REDIRECTS)) {
    const f = await followRedirects(`${BASE}${src}`, { fetchImpl: fetchOnBase, headers: UA });
    const loc = f.hops[0]?.location || '';
    check([301, 308].includes(f.hops[0]?.status) && new URL(loc, BASE).pathname === dest && f.final?.status === 200, `D ${src}: expected redirect to ${dest}, got ${f.hops.map((h) => `${h.status} ${h.location || ''}`).join(' → ')}`);
  }
  const probe = await followRedirects(`${BASE}/this-page-does-not-exist-${Date.now()}`, { fetchImpl: fetchOnBase, headers: UA });
  check(probe.hops.length === 1 && probe.final?.status === 404, `D unknown path: expected 404, got ${probe.hops.map((h) => h.status).join(' → ')}`);

  console.log(`redirect regression on ${BASE}: approved=${approved.length} not-approved=${others.length} sitemap=${locs.length}`);
  console.log(`${pass} passed, ${fail} failed`);
  for (const x of failures) console.log(`  ✗ ${x}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error(`Failed: ${e.message}`); process.exit(2); });
