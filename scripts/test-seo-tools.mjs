// Unit tests for the read-only SEO tooling (scripts/seo/). No network, no credentials.
// FIXTURES ARE SYNTHETIC — they test the code paths, they are not EzyLoan data.
//   node scripts/test-seo-tools.mjs

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import http from 'node:http';
import { periods, parseCsv, num, normaliseGscTable, totalsFromDaily, movers, healthScore } from './seo/lib/analysis.mjs';
import { loadServiceAccount, SetupError, googleJson } from './seo/lib/google.mjs';
import { validateRedirectMap, nextRedirects, followRedirects, EXISTING_REDIRECTS } from './seo/lib/redirects.mjs';

const DIR = path.dirname(fileURLToPath(import.meta.url));
let pass = 0, fail = 0;
const check = (name, ok, extra = '') => { ok ? pass++ : fail++; console.log(`${ok ? '✓' : '✗'} ${name}${ok ? '' : `  ${extra}`}`); };

// periods
const p = periods(28, new Date('2026-11-28T10:00:00Z'), 3);
check('periods: current window ends 3 days back', p.current.end === '2026-11-25');
check('periods: current window is 28 days', p.current.start === '2026-10-29');
check('periods: previous window is the 28 days before', p.previous.end === '2026-10-28' && p.previous.start === '2026-10-01');

// CSV
const csv = '﻿Top queries,Clicks,Impressions,CTR,Position\r\n"car loan, odisha",12,"1,340",0.9%,8.4\r\nused car loan,3,210,1.43%,14\r\n';
const rows = parseCsv(csv);
check('csv: BOM stripped, header read', Object.keys(rows[0])[0] === 'Top queries');
check('csv: quoted comma kept', rows[0]['Top queries'] === 'car loan, odisha');
check('csv: thousands separator', num(rows[0].Impressions) === 1340);
check('csv: percent', Math.abs(num('0.9%') - 0.009) < 1e-12);
check('num: empty is null', num('') === null);

// GSC compare-mode export
const cmp = parseCsv('Top pages,Last 28 days Clicks,Previous 28 days Clicks,Last 28 days Impressions,Previous 28 days Impressions,Last 28 days CTR,Previous 28 days CTR,Last 28 days Position,Previous 28 days Position\n/a,5,20,400,500,1.25%,4%,12.1,6.2\n/b,9,2,300,100,3%,2%,5,9\n/c,0,0,3,4,0%,0%,40,38\n/d,0,7,0,90,0%,7.8%,,9.5\n');
const norm = normaliseGscTable(cmp);
check('gsc table: compare mode detected', !!norm[0].prev);
check('gsc table: current/previous split', norm[0].cur.clicks === 5 && norm[0].prev.clicks === 20);
const mv = movers(norm, { minImpressions: 20 });
check('movers: biggest click loss first', mv.declining[0].key === '/a');
check('movers: page that lost all impressions flagged', mv.declining.some((r) => r.key === '/d' && r.lost));
check('movers: improver detected', mv.improving[0].key === '/b');
check('movers: low-volume row skipped, not ranked', mv.skippedLowVolume === 1 && ![...mv.declining, ...mv.improving].some((r) => r.key === '/c'));

const plain = normaliseGscTable(rows);
check('gsc table: plain export has no prev', !plain[0].prev && plain[0].cur.impressions === 1340);

// daily totals — position weighted by impressions
const t = totalsFromDaily([{ date: '2026-01-01', clicks: 1, impressions: 100, position: 10 }, { date: '2026-01-02', clicks: 3, impressions: 300, position: 2 }, { date: '2026-01-03', clicks: 99, impressions: 1, position: 1 }], '2026-01-01', '2026-01-02');
check('totals: window respected', t.clicks === 4 && t.days === 2);
check('totals: weighted position', t.position === 4);

// health score — missing data excluded, never counted as pass/fail
const hs = healthScore({ pagesCrawled: 60, sitemapTotal: 50, sitemap200: 50, brokenLinks: 0, indexable: 50, missingMeta: 0, dupTitles: 0, dupDescriptions: 0, badH1: 0, badCanonical: 0, invalidJsonLd: 0, noindexInSitemap: 0 });
check('health: all measured technical checks pass → 100', hs.score === 100);
check('health: GSC/PSI not measured are excluded', hs.checks.find((c) => c.id === 'indexed_ratio').status === 'not measured' && hs.coverage < 1);
const hs2 = healthScore({ pagesCrawled: 60, sitemapTotal: 50, sitemap200: 50, brokenLinks: 0, indexable: 50, missingMeta: 0, dupTitles: 0, dupDescriptions: 0, badH1: 0, badCanonical: 0, invalidJsonLd: 0, noindexInSitemap: 0, inspected: 50, indexed: 25 });
check('health: 50% indexed lowers the score', hs2.score < 100 && hs2.checks.find((c) => c.id === 'indexed_ratio').status === 'fail');
check('health: nothing measured → null score', healthScore({}).score === null);

// service account loading — errors are setup errors and never echo the key
let e1; try { loadServiceAccount({}); } catch (e) { e1 = e; }
check('sa: missing key → SetupError', e1 instanceof SetupError);
let e2; try { loadServiceAccount({ GOOGLE_SA_KEY_JSON: '{"type":"authorized_user","private_key":"SECRET-VALUE"}' }); } catch (e) { e2 = e; }
check('sa: wrong key type rejected without echoing it', e2 instanceof SetupError && !e2.message.includes('SECRET-VALUE'));

// gsc-report csv mode end-to-end (synthetic export folder)
const tmp = mkdtempSync(path.join(tmpdir(), 'seo-test-'));
const exp = path.join(tmp, 'export');
const out = path.join(tmp, 'out');
const days = [];
for (let i = 0; i < 200; i++) { const d = new Date(Date.UTC(2026, 4, 1) + i * 86_400_000).toISOString().slice(0, 10); days.push(`${d},${i < 100 ? 10 : 5},${i < 100 ? 200 : 180},5%,${i < 100 ? 8 : 11}`); }
mkdirSync(exp, { recursive: true });
writeFileSync(path.join(exp, 'Dates.csv'), `Date,Clicks,Impressions,CTR,Position\n${days.join('\n')}\n`);
writeFileSync(path.join(exp, 'Pages.csv'), 'Top pages,Last 28 days Clicks,Previous 28 days Clicks,Last 28 days Impressions,Previous 28 days Impressions,Last 28 days CTR,Previous 28 days CTR,Last 28 days Position,Previous 28 days Position\nhttps://www.ezyloan.co.in/a,5,20,400,500,1%,4%,12,6\n');
const r = spawnSync(process.execPath, [path.join(DIR, 'seo/gsc-report.mjs'), 'csv', `--dir=${exp}`, `--out=${out}`], { encoding: 'utf8' });
check('gsc csv: exits 0', r.status === 0, r.stderr);
const json = readdirSync(out).find((f) => f.endsWith('.json'));
const rep = json ? JSON.parse(readFileSync(path.join(out, json), 'utf8')) : null;
const w7 = rep?.windows.find((w) => w.days === 7);
check('gsc csv: 7-day window from Dates.csv', w7 && w7.totals.current.clicks === 35 && w7.totals.previous.clicks === 35);
const w90 = rep?.windows.find((w) => w.days === 90);
check('gsc csv: 90-day comparison spans the drop', w90 && w90.totals.current.clicks === 450 && w90.totals.previous.clicks < 900 && w90.totals.previous.clicks > 450);
check('gsc csv: page decline ranked', rep?.tables.page.declining[0].key.endsWith('/a'));
const md = readdirSync(out).find((f) => f.endsWith('.md'));
check('gsc csv: markdown written', md && readFileSync(path.join(out, md), 'utf8').includes('Declining pages'));
check('gsc csv: report labels its data status and source', md && /Data status: MEASURED.*Search Console UI export/.test(readFileSync(path.join(out, md), 'utf8')));
const missing = spawnSync(process.execPath, [path.join(DIR, 'seo/gsc-report.mjs'), 'csv', `--dir=${path.join(tmp, 'nope')}`, `--out=${out}`], { encoding: 'utf8' });
check('gsc csv: missing folder → setup exit code 3', missing.status === 3);
const noSa = spawnSync(process.execPath, [path.join(DIR, 'seo/gsc-report.mjs'), 'performance', `--out=${out}`], { encoding: 'utf8', env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
check('gsc api: no credentials → setup exit code 3, clear message', noSa.status === 3 && /GOOGLE_SA_KEY/.test(noSa.stderr));
rmSync(tmp, { recursive: true, force: true });

// ---------- redirects: static validation ----------
const live = ['/', '/about', '/car-loan', '/car-loan-topup', '/blogs', '/terms-and-conditions'];
const v = (rows) => validateRedirectMap(rows, live);
check('redirects: clean map passes', v([{ path: '/a.php', destination: '/about' }, { path: '/b.html', destination: '/car-loan' }]).errors.length === 0);
check('redirects: self-loop caught', v([{ path: '/about.php', destination: '/about.php' }]).errors.some((e) => /itself|loop/.test(e)));
check('redirects: 2-node loop caught', v([{ path: '/x', destination: '/y' }, { path: '/y', destination: '/x' }]).errors.some((e) => /loop/.test(e)));
check('redirects: chain caught (A→B, B→C)', v([{ path: '/old1', destination: '/old2' }, { path: '/old2', destination: '/about' }]).errors.some((e) => /chain/.test(e)));
check('redirects: chain into an existing next.config redirect caught', v([{ path: '/x.php', destination: '/terms' }]).errors.some((e) => /next\.config/.test(e)));
check('redirects: live page as source caught', v([{ path: '/car-loan', destination: '/about' }]).errors.some((e) => /live page/.test(e)));
check('redirects: trailing-slash duplicate caught', v([{ path: '/a', destination: '/about' }, { path: '/a/', destination: '/about' }]).errors.some((e) => /duplicate/.test(e)));
check('redirects: destination must be live', v([{ path: '/z.php', destination: '/no-such-page' }]).errors.some((e) => /not a live page/.test(e)));
check('redirects: keep-404 rows (no destination) ignored', v([{ path: '/team/gerry', destination: null }]).errors.length === 0);
check('redirects: query string in source rejected', v([{ path: '/a.php?id=1', destination: '/about' }]).errors.length > 0);

// generation: only approved rows, absolute www destination, 301
const gen = nextRedirects([{ path: '/a.php', destination: '/about', approved: true }, { path: '/b.php', destination: '/about', approved: false }, { path: '/c', destination: null, approved: true }]);
check('redirects: only approved rows with a destination are generated', gen.length === 1 && gen[0].source === '/a.php');
check('redirects: statusCode 301 (not permanent→308)', gen[0].statusCode === 301 && !('permanent' in gen[0]));
check('redirects: absolute canonical destination (one hop from apex)', gen[0].destination === 'https://www.ezyloan.co.in/about');

// the real map: valid against the app's routes, and nothing approved yet
const legacy = JSON.parse(readFileSync(path.join(DIR, 'seo/legacy-urls.json'), 'utf8'));
const appRoutes = readdirSync(path.join(DIR, '../app'), { withFileTypes: true }).filter((d) => d.isDirectory() && !/^(api|ezyadmin|ezylogin|blog|ThankYouPage)$/.test(d.name) && !d.name.startsWith('[')).map((d) => `/${d.name}`);
const blogSlugs = readdirSync(path.join(DIR, 'blog-content')).map((f) => `/blog/${f.replace(/\.html$/, '')}`);
const realCheck = validateRedirectMap(legacy.urls, ['/', ...appRoutes, ...blogSlugs]);
check('redirects: legacy-urls.json validates with 0 errors against app routes', realCheck.errors.length === 0, realCheck.errors.join('; '));
check('redirects: no row approved before sign-off', nextRedirects(legacy.urls).length === 0);
check('redirects: 30 high-confidence rows, each with recorded evidence', legacy.urls.filter((u) => u.confidence === 'high').length === 30 && legacy.urls.filter((u) => u.confidence === 'high').every((u) => u.evidenceBasis && u.archiveEvidence));

// EXISTING_REDIRECTS mirrors next.config.mjs (so chain detection knows the real rules)
const cfg = (await import(pathToFileURL(path.join(DIR, '../next.config.mjs')).href)).default;
const cfgRedirects = (await cfg.redirects()).filter((r) => !r.has).reduce((m, r) => ({ ...m, [r.source]: r.destination }), {});
check('redirects: EXISTING_REDIRECTS matches next.config.mjs', JSON.stringify(cfgRedirects) === JSON.stringify(EXISTING_REDIRECTS), JSON.stringify(cfgRedirects));

// ---------- redirects: runtime follower against a mock server ----------
const srv = http.createServer((req, res) => {
  const routes = { '/ok.php': [301, '/about'], '/about': [200], '/chain1': [301, '/chain2'], '/chain2': [301, '/about'], '/loop1': [301, '/loop2'], '/loop2': [301, '/loop1'], '/perm': [308, '/about'] };
  const [code, loc] = routes[req.url] || [404];
  res.writeHead(code, loc ? { Location: loc } : {}); res.end();
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${srv.address().port}`;
const okF = await followRedirects(`${base}/ok.php`);
check('follow: single 301 hop to 200', okF.hops.length === 2 && okF.hops[0].status === 301 && okF.final.status === 200);
const chainF = await followRedirects(`${base}/chain1`);
check('follow: chain visible as 2 hops', chainF.hops.length === 3 && chainF.final.status === 200);
const loopF = await followRedirects(`${base}/loop1`);
check('follow: loop detected', loopF.loop === true);
const permF = await followRedirects(`${base}/perm`);
check('follow: 308 reported as 308 (so a 301 expectation fails)', permF.hops[0].status === 308);
const missF = await followRedirects(`${base}/nothing`);
check('follow: 404 with no hops', missF.hops.length === 1 && missF.final.status === 404);
srv.close();

// ---------- key handling ----------
const keySrv = http.createServer((req, res) => { res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: { message: `Bad request for ${req.url}` } })); });
await new Promise((r) => keySrv.listen(0, '127.0.0.1', r));
let keyErr;
try { await googleJson(`http://127.0.0.1:${keySrv.address().port}/x?url=a&key=SUPERSECRETKEY123`, { redact: ['SUPERSECRETKEY123'] }); } catch (e) { keyErr = e; }
keySrv.close();
check('keys: API key echoed by a server is redacted from the error', keyErr && !keyErr.message.includes('SUPERSECRETKEY123') && keyErr.message.includes('[redacted]'), keyErr?.message);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
