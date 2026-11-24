// Lab Web Vitals over the DevTools protocol: node scripts/vitals-lab.mjs <baseUrl> [out.json]
// Fallback for machines where Lighthouse's performance run fails (NO_NAVSTART).
// Mobile profile ≈ Lighthouse's: 412px viewport, Slow-4G-like network
// (150 ms RTT, 1.6 Mbps down) and 4× CPU slowdown; desktop: 1350px, no throttling.
// Reports LCP, CLS, FCP, long-task total (TBT-like: sum of task time over 50 ms
// until load + 5 s) and transferred bytes. Cold cache, 3 runs, median reported.
// These are LAB numbers for comparison between builds, not field (CrUX) data.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const OUT = process.argv[3];
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ROUTES = (process.env.ROUTES || '/,/used-car-loan,/apply-now,/blogs,/car-loan-topup').split(',');
const RUNS = Number(process.env.RUNS || 3);
const PROFILES = {
  mobile: { width: 412, height: 823, mobile: true, cpu: 4, net: { latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 } },
  desktop: { width: 1350, height: 940, mobile: false, cpu: 1, net: null },
};

const port = 9800 + Math.floor(Math.random() * 100);
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', `--user-data-dir=${join(tmpdir(), 'ezy-vitals-' + port)}`, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 50 && !target; i++) { await new Promise((r) => setTimeout(r, 200)); try { target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page'); } catch {} }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const listeners = [];
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } else listeners.forEach((f) => f(m)); });
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable'); await send('Network.enable'); await send('Runtime.enable');

// Observers installed before any page script runs.
await send('Page.addScriptToEvaluateOnNewDocument', { source: `
  window.__v = { lcp: 0, cls: 0, fcp: 0, longTasks: [] };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__v.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__v.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__v.longTasks.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true });
` });

let bytes = 0;
listeners.push((m) => { if (m.method === 'Network.loadingFinished') bytes += m.params.encodedDataLength; });
const loaded = () => new Promise((r) => { const f = (m) => { if (m.method === 'Page.loadEventFired') { listeners.splice(listeners.indexOf(f), 1); r(); } }; listeners.push(f); setTimeout(r, 60000); });
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

const results = [];
for (const [name, p] of Object.entries(PROFILES)) {
  await send('Emulation.setDeviceMetricsOverride', { width: p.width, height: p.height, deviceScaleFactor: p.mobile ? 2 : 1, mobile: p.mobile });
  await send('Emulation.setCPUThrottlingRate', { rate: p.cpu });
  await send('Network.emulateNetworkConditions', p.net ? { offline: false, ...p.net } : { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  for (const route of ROUTES) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      await send('Network.clearBrowserCache'); await send('Network.setCacheDisabled', { cacheDisabled: true });
      await send('Page.navigate', { url: 'about:blank' }); await new Promise((r) => setTimeout(r, 300));
      bytes = 0;
      const done = loaded();
      await send('Page.navigate', { url: BASE + route });
      await done; await new Promise((r) => setTimeout(r, 5000));
      const v = JSON.parse((await send('Runtime.evaluate', { expression: 'JSON.stringify(window.__v)', returnByValue: true })).result.result.value);
      const tbt = v.longTasks.filter(([s]) => s >= v.fcp).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
      runs.push({ lcp: v.lcp, cls: v.cls, fcp: v.fcp, tbt, kb: bytes / 1024 });
    }
    const r = { profile: name, route, lcpMs: Math.round(median(runs.map((x) => x.lcp))), fcpMs: Math.round(median(runs.map((x) => x.fcp))), cls: +median(runs.map((x) => x.cls)).toFixed(3), tbtMs: Math.round(median(runs.map((x) => x.tbt))), transferKB: Math.round(median(runs.map((x) => x.kb))) };
    results.push(r);
    console.log(`${name.padEnd(7)} ${route.padEnd(18)} LCP ${r.lcpMs}ms  FCP ${r.fcpMs}ms  CLS ${r.cls}  TBT~ ${r.tbtMs}ms  ${r.transferKB} KB`);
  }
}
if (OUT) writeFileSync(OUT, JSON.stringify(results, null, 2));
ws.close(); chrome.kill(); process.exit(0);
