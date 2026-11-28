// SEO crawl of every public route: node scripts/seo-crawl.mjs [baseUrl] [out.json]
// Default base is the live site. Reads URLs from <base>/sitemap.xml plus the
// known static routes, fetches each page as a crawler would (no JS execution),
// and records metadata, headings, structured data, images and internal links.
// Every internal link found is then checked for its HTTP status.
// Read-only: only GET requests, no forms submitted.

import { writeFileSync } from 'node:fs';

const BASE = (process.argv[2] || 'https://www.ezyloan.co.in').replace(/\/$/, '');
const OUT = process.argv[3] || 'seo-crawl.json';
const CANON_HOST = 'https://www.ezyloan.co.in';
const UA = 'Mozilla/5.0 (compatible; EzyLoan-SEO-Audit/1.0)';

const EXTRA = ['/', '/about', '/apply-now', '/blogs', '/contact', '/faq', '/emi-calculator', '/careers',
  '/lending-partners', '/compliance', '/loan-disclosure', '/privacy-policy', '/terms-and-conditions',
  '/ThankYouPage', '/ezylogin', '/blog', '/terms', '/privacy', '/this-page-does-not-exist'];

async function get(url, method = 'GET') {
  try {
    const r = await fetch(url, { method, redirect: 'manual', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(60000) });
    return { status: r.status, location: r.headers.get('location'), xrobots: r.headers.get('x-robots-tag'), text: method === 'GET' ? await r.text() : '' };
  } catch (e) { return { status: 0, error: e.message, text: '' }; }
}

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
function attr(tag, name) { const m = tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, 'i')); return m ? decode(m[1]) : null; }
function meta(html, key, val) {
  for (const t of html.match(/<meta\b[^>]*>/gi) || []) if ((attr(t, key) || '').toLowerCase() === val) return attr(t, 'content');
  return null;
}

function inspect(html) {
  const body = html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');
  const headings = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: +m[1], text: strip(m[2]).slice(0, 120) }));
  const skips = [];
  for (let i = 1; i < headings.length; i++) if (headings[i].level > headings[i - 1].level + 1) skips.push(`h${headings[i - 1].level}→h${headings[i].level} ("${headings[i].text.slice(0, 40)}")`);
  const ld = [...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  const types = []; let invalid = 0;
  const collect = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(collect); if (o['@type']) types.push([].concat(o['@type']).join('/')); if (o['@graph']) collect(o['@graph']); };
  for (const m of ld) { try { collect(JSON.parse(m[1])); } catch { invalid++; } }
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => attr(t, 'alt') === null).map((t) => attr(t, 'src'));
  const hrefs = (s) => [...s.matchAll(/<a\b[^>]*href=["']([^"'#]*)["']/gi)].map((m) => decode(m[1])).filter(Boolean);
  const internalOf = (list) => [...new Set(list.filter((h) => h.startsWith('/') && !h.startsWith('//') || h.startsWith(CANON_HOST)).map((h) => h.replace(CANON_HOST, '') || '/').map((h) => h.split('?')[0]))];
  const internal = internalOf(hrefs(body));
  // Links inside <main> only — excludes the site-wide header/footer navigation, so
  // contextual linking (blog → service page, related posts) can be measured.
  const main = body.match(/<main\b[\s\S]*<\/main>/i);
  const contentLinks = main ? internalOf(hrefs(main[0])) : null;
  const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
  const canon = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i) || [])[0];
  return {
    title: title ? decode(title.trim()) : null,
    description: meta(html, 'name', 'description'),
    canonical: canon ? attr(canon, 'href') : null,
    robots: meta(html, 'name', 'robots'),
    ogTitle: meta(html, 'property', 'og:title'), ogDescription: meta(html, 'property', 'og:description'),
    ogImage: meta(html, 'property', 'og:image'), ogUrl: meta(html, 'property', 'og:url'),
    twitterCard: meta(html, 'name', 'twitter:card'),
    h1: headings.filter((h) => h.level === 1).map((h) => h.text),
    headingCount: headings.length, headingSkips: skips,
    jsonLdTypes: types, jsonLdInvalid: invalid,
    images: imgs.length, imagesNoAlt: noAlt,
    internalLinks: internal, contentLinks, textChars: strip(body).length,
  };
}

const sm = await get(`${BASE}/sitemap.xml`);
const fromSitemap = [...sm.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1].replace(CANON_HOST, '') || '/');
const paths = [...new Set([...fromSitemap, ...EXTRA])];
const pages = [];
for (const p of paths) {
  const r = await get(BASE + p);
  const rec = { path: p, inSitemap: fromSitemap.includes(p), status: r.status, location: r.location, xRobotsTag: r.xrobots, error: r.error };
  if (r.status === 200) Object.assign(rec, inspect(r.text));
  pages.push(rec);
  process.stderr.write(`${r.status} ${p}\n`);
}

// Status of every internal link target not already crawled.
const crawled = new Map(pages.map((p) => [p.path, p.status]));
const targets = new Set(pages.flatMap((p) => p.internalLinks || []));
const linkStatus = {};
for (const t of targets) {
  if (crawled.has(t)) { linkStatus[t] = crawled.get(t); continue; }
  if (/\.(pdf|webp|png|jpe?g|svg|ico|xml|txt|webmanifest)$/i.test(t) || t.startsWith('/_next')) { linkStatus[t] = (await get(BASE + t, 'HEAD')).status; continue; }
  linkStatus[t] = (await get(BASE + t)).status;
}
const broken = Object.entries(linkStatus).filter(([, s]) => s >= 400 || s === 0)
  .map(([t, s]) => ({ target: t, status: s, linkedFrom: pages.filter((p) => p.internalLinks?.includes(t)).map((p) => p.path) }));

// Inbound internal links per sitemap page (orphan check).
const inbound = Object.fromEntries(fromSitemap.map((p) => [p, pages.filter((q) => q.path !== p && q.internalLinks?.includes(p)).length]));

// Duplicate titles / descriptions among indexable 200 pages.
const idx = pages.filter((p) => p.status === 200 && !/noindex/i.test((p.robots || '') + (p.xRobotsTag || '')));
const dup = (k) => Object.entries(idx.reduce((a, p) => { if (p[k]) (a[p[k]] ||= []).push(p.path); return a; }, {})).filter(([, v]) => v.length > 1);

const report = { base: BASE, crawledAt: new Date().toISOString(), sitemapCount: fromSitemap.length, pages, broken, inbound, duplicateTitles: dup('title'), duplicateDescriptions: dup('description') };
writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(`pages=${pages.length} sitemap=${fromSitemap.length} broken=${broken.length} dupTitles=${report.duplicateTitles.length} dupDesc=${report.duplicateDescriptions.length} -> ${OUT}`);
