// Runtime smoke test of the PRODUCTION BUILD (`next start`) with the marketing
// layer, against a disposable local mongod. Run `npm run build` first.
//
//   MONGOD_BIN=/path/to/mongod node scripts/test-marketing-runtime.mjs
//
// Every outbound integration from .env.local is overridden with an empty value
// (SMTP, Twilio, CRM mirror, OpenAI, web-push, Cloudinary), so nothing leaves the
// machine and the live database is never touched: DATABASE_URL points at the
// temp mongod started here.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

let passed = 0;
let failed = 0;
const check = (name, ok, detail = '') => {
  ok ? passed++ : failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const waitPort = async (port, ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const ok = await new Promise((r) => { const s = net.connect(port, '127.0.0.1', () => { s.end(); r(true); }); s.on('error', () => r(false)); });
    if (ok) return true;
    await sleep(300);
  }
  return false;
};

const bin = process.env.MONGOD_BIN;
if (!bin || !fs.existsSync(bin)) {
  console.error('Set MONGOD_BIN to a mongod binary.');
  process.exit(2);
}
if (!fs.existsSync('.next/BUILD_ID')) {
  console.error('Run `npm run build` first.');
  process.exit(2);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ezy-rt-'));
const mport = await freePort();
const port = await freePort();
const mongod = spawn(bin, ['--dbpath', tmp, '--port', String(mport), '--bind_ip', '127.0.0.1', '--quiet'], { stdio: 'ignore' });
await waitPort(mport, 20_000);

const ADMIN = { username: 'rt-admin', password: `Rt-${crypto.randomBytes(8).toString('hex')}1` };
const blank = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'CRM_WEBHOOK_URL', 'CRM_WEBHOOK_SECRET', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_TEMPLATE_SID', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'VAPID_PRIVATE_KEY', 'VAPID_PUBLIC_KEY', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET', 'PAGESPEED_API_KEY', 'IMAP_USER', 'IMAP_PASS', 'FACEBOOK_APP_SECRET'];
const env = {
  ...process.env,
  ...Object.fromEntries(blank.map((k) => [k, ''])),
  NODE_ENV: 'production',
  DATABASE_URL: `mongodb://127.0.0.1:${mport}`,
  DATABASE_NAME: 'ezyloan_runtime_test',
  JWT_SECRET: crypto.randomBytes(48).toString('base64url'),
  ADMIN_USERNAME: ADMIN.username,
  ADMIN_PASSWORD: ADMIN.password,
  // No env key: exercises the auto-created key file (as on a server without MARKETING_ENCRYPTION_KEY).
  MARKETING_ENCRYPTION_KEY: '',
  MARKETING_KEY_FILE: path.join(tmp, 'keys', 'marketing.key'),
  MARKETING_PUBLIC_BASE_URL: `http://localhost:${port}`,
  META_APP_ID: '1234567890',
  META_APP_SECRET: 'c'.repeat(32),
  DISABLE_GEO_BLOCK: 'true',
  TRUSTED_PROXY_HOPS: '',
  TRUSTED_IP_HEADER: '',
};
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', String(port)], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let serverLog = '';
server.stdout.on('data', (d) => (serverLog += d));
server.stderr.on('data', (d) => (serverLog += d));
const BASE = `http://localhost:${port}`;

async function req(p, { cookie, json, method = 'GET', headers = {} } = {}) {
  const h = { ...headers };
  if (cookie) h.cookie = cookie;
  if (json !== undefined) h['content-type'] = 'application/json';
  const res = await fetch(BASE + p, { method, headers: h, body: json !== undefined ? JSON.stringify(json) : undefined, redirect: 'manual' });
  const text = await res.text();
  let body = text;
  try { body = JSON.parse(text); } catch { /* html */ }
  return { status: res.status, body, headers: res.headers, text };
}

try {
  check('next start came up', await waitPort(port, 60_000));
  await sleep(1500);

  console.log('\nPublic pages render the optional consent box (prerendered HTML)');
  for (const page of ['/', '/apply-now', '/contact']) {
    const html = (await req(page)).text;
    const tag = html.match(/<input[^>]*name="adConsent"[^>]*>/)?.[0] || '';
    check(`${page}: ad-consent checkbox present and unticked`, !!tag && !/checked/.test(tag) && html.includes('hashed (encrypted) form'), tag || 'not found');
  }

  console.log('\nPublic form with attribution + consent');
  const tok = (await req('/api/form-token')).body.token;
  await sleep(2700); // form guard minimum fill time
  const lead = await req('/api/loans', {
    method: 'POST',
    headers: { origin: BASE },
    json: {
      fullName: 'Runtime Tester', phoneNumber: '9876533333', email: 'rt@example.com', loanType: 'Used Car Loan', employmentType: 'Salaried', city: 'Cuttack', pincode: '753001', cibilScore: '750-800', consent: true,
      fg_token: tok, company_website: '', adConsent: true,
      attribution: { firstTouch: { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'rt-campaign', gclid: 'Cj0KCQjw_runtime_1', landingPage: `${BASE}/car-loan?gclid=Cj0KCQjw_runtime_1`, at: new Date().toISOString() }, pixelEventId: 'lead_runtime_000001', eventSourceUrl: `${BASE}/apply-now` },
    },
  });
  check('POST /api/loans → 201', lead.status === 201, JSON.stringify(lead.body));

  console.log('\nAdmin session');
  const login = await req('/api/auth/login', { method: 'POST', headers: { origin: BASE }, json: ADMIN });
  const m = (login.headers.get('set-cookie') || '').match(/((?:__Host-)?ezy_session)=([^;]+)/);
  const cookie = m ? `${m[1]}=${m[2]}` : '';
  check('admin login', login.status === 200 && !!cookie, `status ${login.status}`);
  // The __Host- cookie is Secure; send it back explicitly over local http.
  const st = await req('/api/marketing/status', { cookie });
  check('GET /api/marketing/status → 200', st.status === 200, st.text.slice(0, 200));
  check('status shows no secrets', st.status === 200 && !/enc:v1:|cccccccc/.test(st.text));
  const dash = await req('/api/marketing/dashboard', { cookie });
  check('dashboard counts the form lead under google_ads', dash.status === 200 && dash.body.crm.byChannel.some((c) => c._id === 'google_ads' && c.leads === 1), JSON.stringify(dash.body?.crm?.byChannel));
  check('dashboard campaign from UTM', dash.body.crm.byCampaign.some((c) => c.campaign === 'rt-campaign'));
  check('anonymous status → 401', (await req('/api/marketing/status')).status === 401);
  const admin = await req('/ezyadmin', { cookie });
  check('/ezyadmin renders for admin', admin.status === 200 && admin.text.includes('<html'));

  console.log('\nAPI keys saved in the panel take effect without a restart');
  const keyPut = await req('/api/marketing/credentials', { method: 'PUT', cookie, headers: { origin: BASE }, json: { values: { META_PIXEL_ID: '123456789012', GA4_MEASUREMENT_ID: 'G-RUNTIME123' } } });
  check('admin saves Pixel + GA4 IDs', keyPut.status === 200, JSON.stringify(keyPut.body).slice(0, 200));
  const tags = (await req('/api/site-tags')).body;
  check('public /api/site-tags serves them immediately', tags.metaPixelId === '123456789012' && tags.ga4MeasurementId === 'G-RUNTIME123');
  const st2 = (await req('/api/marketing/status', { cookie })).body;
  check('encryption key file auto-created on the server', st2.environment.encryptionKeySource === 'file' && fs.existsSync(path.join(tmp, 'keys', 'marketing.key')));

  console.log('\nSettings → worker processes queue in the background');
  const put = await req('/api/marketing/settings', {
    method: 'PUT', cookie, headers: { origin: BASE },
    json: { eventMappings: ['Lead', 'QualifiedLead', 'SubmitApplication', 'ApprovedApplication', 'LoanDisbursed'].map((e) => ({ crmEvent: e, meta: { enabled: e === 'Lead', eventName: e }, google: { enabled: false, enhanced: false } })), testMode: { meta: true, google: true } },
  });
  check('admin saves mappings', put.status === 200, JSON.stringify(put.body).slice(0, 200));
  const tok2 = (await req('/api/form-token')).body.token;
  await sleep(2700);
  const c2 = await req('/api/contacts', { method: 'POST', headers: { origin: BASE }, json: { fullName: 'Second Runtime', email: 'rt2@example.com', phoneNumber: '9876544444', loanType: 'Car Loan', fg_token: tok2, company_website: '', adConsent: true, attribution: { lastTouch: { utmSource: 'facebook', utmMedium: 'paid_social', fbclid: 'IwAR_runtime_2' } } } });
  check('POST /api/contacts → 201', c2.status === 201, JSON.stringify(c2.body));
  let ev = null;
  for (let i = 0; i < 25 && !ev; i++) {
    await sleep(2000);
    const r = await req('/api/marketing/events?crmEvent=Lead', { cookie });
    ev = (r.body.items || []).find((e) => e.status !== 'pending');
  }
  check('background worker (started by instrumentation) processed the event without a manual trigger', !!ev && ev.attempts >= 1, JSON.stringify(ev));
  check('missing CAPI credentials reported honestly (failed/config, nothing sent)', ev?.status === 'failed' && ev.errorKind === 'config' && /not configured/.test(ev.lastError || ''));
  check('worker start logged', /worker_started/.test(serverLog));
  check('event flagged as TEST', ev?.testMode === true);
  const logs = await req('/api/marketing/sync-logs', { cookie });
  check('sync history records worker pass', logs.status === 200 && logs.body.items.some((l) => l.kind === 'worker' || l.kind === 'settings'));
  check('no server errors logged', !/Unhandled|TypeError|ReferenceError/.test(serverLog), serverLog.split('\n').filter((l) => /Error/.test(l)).slice(0, 3).join(' | '));
  // The existing anonymous-access regression suite, against this same isolated server.
  console.log('\nnpm run test:security against the isolated server');
  const sec = await new Promise((resolve) => {
    const c = spawn(process.execPath, ['scripts/test-security.mjs'], { env: { ...process.env, BASE_URL: BASE }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    c.stdout.on('data', (d) => (out += d));
    c.stderr.on('data', (d) => (out += d));
    c.on('close', (code) => resolve({ code, out }));
  });
  const summary = sec.out.trim().split('\n').filter((l) => /passed|✗/.test(l));
  console.log(summary.map((l) => '    ' + l).join('\n'));
  check('test:security passes (incl. new marketing routes)', sec.code === 0);
} catch (e) {
  check('runtime test crashed', false, e?.stack || String(e));
} finally {
  server.kill();
  mongod.kill();
  await sleep(800);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* ignore */ }
}
console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
