// Evidence + validation for scripts/seo/legacy-urls.json — READ-ONLY (GET requests only).
//
//   node scripts/seo/verify-redirect-map.mjs [--out=reports/seo] [--no-archive]
//
// For every row that has (or may get) a destination:
//   live     current status of the old URL on www and on the apex host, with every redirect hop
//   target   the proposed destination's status, redirect hops and <title>
//   archive  Wayback Machine 200-captures (count, first/last, snapshot link) and the archived <title>/<h1>
// Then runs validateRedirectMap() (loops, chains, shadowed live pages, duplicates) against the live sitemap.
// Exit code 1 if validation finds an error — run before and after implementing.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRedirectMap, followRedirects, CANONICAL_ORIGIN, nextRedirects } from './lib/redirects.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const OUT = path.resolve(args.out || 'reports/seo');
const UA = { 'User-Agent': 'Mozilla/5.0 (compatible; EzyLoan-SEO-Audit/1.0)' };
const map = JSON.parse(readFileSync(path.join(DIR, 'legacy-urls.json'), 'utf8'));

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#0?38;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const titleOf = (html) => decode((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '');
const h1Of = (html) => decode(((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || '').replace(/<[^>]+>/g, ' ')).slice(0, 120);

async function pool(items, n, fn) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]); } }));
  return out;
}

async function archive(p) {
  try {
    const cdx = await (await fetch(`https://web.archive.org/cdx/search/cdx?url=ezyloan.co.in${encodeURIComponent(p).replace(/%2F/g, '/')}&output=json&fl=timestamp,original,statuscode&filter=statuscode:200`, { signal: AbortSignal.timeout(60_000) })).json();
    const caps = cdx.slice(1);
    if (!caps.length) return { captures: 0 };
    const last = caps.at(-1);
    let title = '', h1 = '';
    try {
      const html = await (await fetch(`https://web.archive.org/web/${last[0]}id_/${last[1]}`, { signal: AbortSignal.timeout(60_000) })).text();
      title = titleOf(html); h1 = h1Of(html);
    } catch { /* snapshot body optional */ }
    return { captures: caps.length, first: caps[0][0], last: last[0], original: last[1], snapshot: `https://web.archive.org/web/${last[0]}/${last[1]}`, title, h1 };
  } catch (e) { return { error: e.message }; }
}

async function main() {
  const xml = await (await fetch(`${CANONICAL_ORIGIN}/sitemap.xml`, { headers: UA })).text();
  const livePaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname.replace(/\/$/, '') || '/');
  const validation = validateRedirectMap(map.urls, livePaths);

  const rows = map.urls.filter((u) => u.confidence !== 'keep-404');
  const targets = [...new Set(rows.map((r) => r.destination).filter(Boolean))];
  const targetInfo = Object.fromEntries(await pool(targets, 4, async (d) => {
    const f = await followRedirects(CANONICAL_ORIGIN + d, { headers: UA });
    let title = '';
    if (f.final?.status === 200) title = titleOf(await (await fetch(CANONICAL_ORIGIN + d, { headers: UA })).text());
    return [d, { status: f.final?.status, hops: f.hops.length - 1, title }];
  }));

  const evidence = await pool(rows, 3, async (r) => {
    const [www, apex] = await Promise.all([
      followRedirects(CANONICAL_ORIGIN + r.path, { headers: UA }),
      followRedirects(`http://ezyloan.co.in${r.path}`, { headers: UA }),
    ]);
    const arc = args['no-archive'] ? null : await archive(r.path);
    return { ...r, live: { www: www.final?.status, wwwHops: www.hops.length - 1, apexChain: apex.hops.map((h) => `${h.status}`).join(' → ') + (apex.final ? '' : ' (no final)') }, target: r.destination ? targetInfo[r.destination] : null, archive: arc };
  });

  const generated = nextRedirects(map.urls);
  const result = { checkedAt: new Date().toISOString(), sitemapPaths: livePaths.length, validation, approvedCount: generated.length, generated, evidence };
  mkdirSync(OUT, { recursive: true });
  const day = result.checkedAt.slice(0, 10);
  writeFileSync(path.join(OUT, `redirect-evidence-${day}.json`), JSON.stringify(result, null, 2));

  const ts = (t) => (t ? `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6, 8)}` : '—');
  let md = `# Redirect map evidence — ${result.checkedAt}\n\nSitemap paths: ${livePaths.length} · approved rows: ${generated.length} · validation: **${validation.errors.length} error(s)**, ${validation.warnings.length} warning(s)\n\n`;
  if (validation.errors.length) md += validation.errors.map((e) => `- ❌ ${e}`).join('\n') + '\n\n';
  md += '| Old URL | www now | http-apex chain now | Destination | Dest. status (hops) | Destination title | Archive 200s · first → last | Archived title / H1 | Snapshot |\n|---|---|---|---|---|---|---|---|---|\n';
  for (const e of evidence) {
    const a = e.archive || {};
    md += `| \`${e.path}\` | ${e.live.www} | ${e.live.apexChain} | ${e.destination ? `\`${e.destination}\`` : '— (keep 404 / decision)'} | ${e.target ? `${e.target.status} (${e.target.hops})` : ''} | ${e.target?.title || ''} | ${a.captures ?? '—'} · ${ts(a.first)} → ${ts(a.last)} | ${[a.title, a.h1].filter(Boolean).join(' / ').replace(/\|/g, '/').slice(0, 110) || (a.error ? `archive error` : '—')} | ${a.snapshot ? `[link](${a.snapshot})` : ''} |\n`;
  }
  writeFileSync(path.join(OUT, `redirect-evidence-${day}.md`), md);
  console.log(`validation: ${validation.errors.length} error(s), ${validation.warnings.length} warning(s); approved rows: ${generated.length}; evidence for ${evidence.length} rows -> ${path.join(OUT, `redirect-evidence-${day}.md`)}`);
  for (const e of validation.errors) console.log(`  ERROR ${e}`);
  process.exit(validation.errors.length ? 1 : 0);
}

main().catch((e) => { console.error(`Failed: ${e.message}`); process.exit(2); });
