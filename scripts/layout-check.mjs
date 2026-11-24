// Responsive layout check: node scripts/layout-check.mjs <baseUrl> <out.json> [screenshotDir]
// Drives a local headless Chrome over the DevTools protocol (no extra deps;
// Node 22+ for the global WebSocket). For every route × width it records
// horizontal overflow (page wider than the viewport), the elements causing it,
// console errors and failed requests. Optional full-width screenshots.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const OUT = process.argv[3] || 'layout-check.json';
const SHOTS = process.argv[4];
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const WIDTHS = (process.env.WIDTHS || '320,375,768,1024,1440').split(',').map(Number);
const ROUTES = (process.env.ROUTES || '/,/about,/apply-now,/blogs,/used-car-loan,/car-loan,/car-loan-topup,/car-loan-balance-transfer,/car-loan-refinance,/commercial-vehicle-loan,/personal-loan,/property-loan,/emi-calculator,/contact,/faq,/careers,/lending-partners,/compliance,/loan-disclosure,/privacy-policy,/terms-and-conditions,/blog/used-car-loan-india-2026').split(',');
const SHOT_ROUTES = (process.env.SHOT_ROUTES || '/used-car-loan').split(',');

const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--user-data-dir=${join(tmpdir(), 'ezy-cdp-' + port)}`, 'about:blank'], { stdio: 'ignore' });
let ver;
for (let i = 0; i < 50 && !ver; i++) { await new Promise((r) => setTimeout(r, 200)); try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch {} }
const target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page');
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const listeners = [];
ws.addEventListener('message', (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach((f) => f(m));
});
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Runtime.enable');
// ScrollReveal hides below-the-fold blocks until scrolled into view; it shows
// everything under reduced motion, so full-page screenshots capture all content.
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] }); await send('Network.enable'); await send('Log.enable');

let errors = []; let failed = []; const reqUrl = new Map();
listeners.push((m) => {
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text);
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(`${m.params.entry.text} ${m.params.entry.url || ''}`.slice(0, 200));
  if (m.method === 'Network.requestWillBeSent') reqUrl.set(m.params.requestId, m.params.request.url);
  if (m.method === 'Network.loadingFailed' && !m.params.canceled) failed.push(`${m.params.errorText} ${(reqUrl.get(m.params.requestId) || '').slice(0, 140)}`);
  if (m.method === 'Network.responseReceived' && m.params.response.status >= 400) failed.push(`${m.params.response.status} ${m.params.response.url}`.slice(0, 160));
});
const loaded = () => new Promise((r) => { const f = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); setTimeout(r, 30000); });

const probe = `(() => {
  const vw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
  const culprits = [];
  if (sw > vw + 1) for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width && r.right > vw + 1 && getComputedStyle(el).position !== 'fixed') {
      let p = el.parentElement, clipped = false;
      while (p) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') { clipped = true; break; } p = p.parentElement; }
      if (!clipped) culprits.push((el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + String(el.className).split(' ').slice(0, 3).join('.')).slice(0, 90) + ' right=' + Math.round(r.right));
    }
    if (culprits.length >= 5) break;
  }
  return JSON.stringify({ vw, sw, overflow: sw > vw + 1, culprits, h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim().slice(0, 60)) });
})()`;

const results = [];
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
for (const route of ROUTES) {
  for (const w of WIDTHS) {
    errors = []; failed = [];
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
    const done = loaded();
    await send('Page.navigate', { url: BASE + route });
    await done; await new Promise((r) => setTimeout(r, 1200));
    const v = await send('Runtime.evaluate', { expression: probe, returnByValue: true });
    const res = JSON.parse(v.result.result.value);
    if (SHOTS && SHOT_ROUTES.includes(route)) {
      // Reveal every scroll-animated block (users see them as they scroll).
      await send('Runtime.evaluate', { expression: "document.querySelectorAll('[data-aos]').forEach((e) => e.classList.add('aos-in'))" });
      await new Promise((r) => setTimeout(r, 900));
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      writeFileSync(join(SHOTS, `${route.replace(/\W+/g, '_') || 'home'}-${w}.png`), Buffer.from(shot.result.data, 'base64'));
    }
    results.push({ route, width: w, ...res, consoleErrors: [...new Set(errors)], failedRequests: [...new Set(failed)] });
    process.stderr.write(`${res.overflow ? 'OVERFLOW' : 'ok'} ${w} ${route} errs=${errors.length} failed=${failed.length}\n`);
  }
}
writeFileSync(OUT, JSON.stringify(results, null, 2));
ws.close(); chrome.kill();
const bad = results.filter((r) => r.overflow);
console.log(`checks=${results.length} overflow=${bad.length} withConsoleErrors=${results.filter((r) => r.consoleErrors.length).length} -> ${OUT}`);
process.exit(0);
