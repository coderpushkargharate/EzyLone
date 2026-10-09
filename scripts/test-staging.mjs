// End-to-end STAGING checks — WRITES TEST DATA. Never point this at production.
//
//   STAGING_CONFIRM=yes-this-is-staging \
//   BASE_URL=https://staging.example \
//   STAGING_ADMIN_USERNAME=… STAGING_ADMIN_PASSWORD=… \
//   WEBHOOK_LEAD_SECRET=… TWILIO_AUTH_TOKEN=… \
//   IP_MODE=proxied            # "direct" = no proxy in front (local run with TRUSTED_PROXY_HOPS=1)
//   node scripts/test-staging.mjs
//
// The secrets must be the STAGING server's own values; they are read from the
// environment and never printed. What it does to the staging database:
//  - creates one employee (disabled again at the end), a few leads, one contact,
//    one loan application, one WhatsApp conversation — all named "STAGING-TEST";
//  - SAVES A RANDOM Facebook App Secret through Admin → Automations (the real
//    staging App Secret must be re-entered afterwards if Meta's test tool is used);
//  - blocks and then unblocks TEST-NET addresses (203.0.113.x / 198.51.100.x).
// It sends no email or WhatsApp itself; whether the server does depends on the
// staging SMTP/Twilio settings, which must be test accounts or empty.

import crypto from 'node:crypto';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const host = new URL(BASE).hostname;
if (/(^|\.)ezyloan\.co\.in$/i.test(host)) {
  console.error(`Refusing to run against ${host}: this script writes data. Use a staging host.`);
  process.exit(2);
}
if (process.env.STAGING_CONFIRM !== 'yes-this-is-staging') {
  console.error('Set STAGING_CONFIRM=yes-this-is-staging to confirm BASE_URL is a disposable staging environment.');
  process.exit(2);
}
const need = ['STAGING_ADMIN_USERNAME', 'STAGING_ADMIN_PASSWORD', 'WEBHOOK_LEAD_SECRET', 'TWILIO_AUTH_TOKEN'];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing env: ${missing.join(', ')}`);
  process.exit(2);
}
const IP_MODE = process.env.IP_MODE === 'direct' ? 'direct' : 'proxied';

let passed = 0;
let failed = 0;
const failures = [];
function check(name, ok, detail = '') {
  if (ok) passed++;
  else {
    failed++;
    failures.push(name);
  }
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (n = 16) => crypto.randomBytes(n).toString('hex');
const TAG = `STAGING-TEST ${new Date().toISOString().slice(0, 16)}`;

async function req(path, { cookie, json, headers = {}, ...init } = {}) {
  const h = { ...headers };
  if (cookie) h.cookie = cookie;
  if (json !== undefined) {
    h['content-type'] = 'application/json';
    init.body = JSON.stringify(json);
  }
  const res = await fetch(BASE + path, { redirect: 'manual', ...init, headers: h });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

async function login(username, password, xff) {
  const r = await req('/api/auth/login', {
    method: 'POST',
    json: { username, password },
    headers: xff ? { 'x-forwarded-for': xff } : {},
  });
  const set = r.headers.get('set-cookie') || '';
  const m = set.match(/((?:__Host-)?ezy_session)=([^;]+)/);
  return { status: r.status, cookie: m ? `${m[1]}=${m[2]}` : null, user: r.body?.user };
}

// A distinct client IP per public-form request so the per-IP form rate limit
// doesn't interfere. Only meaningful in direct mode (TRUSTED_PROXY_HOPS=1, no
// proxy): behind a real proxy the server sees this machine's address instead.
let ipSeq = 10;
const nextIp = () => `198.51.100.${ipSeq++}`;

async function formToken(xff) {
  const r = await req('/api/form-token', { headers: xff ? { 'x-forwarded-for': xff } : {} });
  return r.body?.token;
}

async function main() {
  console.log(`Staging checks against ${BASE} (IP_MODE=${IP_MODE})\n`);

  // ── Admin session ───────────────────────────────────────────────────────
  console.log('Admin login & session');
  const admin = await login(process.env.STAGING_ADMIN_USERNAME, process.env.STAGING_ADMIN_PASSWORD, nextIp());
  check('admin login → 200 with session cookie', admin.status === 200 && !!admin.cookie, `got ${admin.status}`);
  if (!admin.cookie) throw new Error('Cannot continue without an admin session.');
  const A = admin.cookie;
  const me = await req('/api/me', { cookie: A });
  check('GET /api/me → admin', me.status === 200 && (me.body?.user?.role || me.body?.role) === 'admin', `got ${me.status}`);
  const bad = await login(process.env.STAGING_ADMIN_USERNAME, 'definitely-wrong-' + rand(4), nextIp());
  check('wrong password → 401 (generic)', bad.status === 401 && !bad.cookie, `got ${bad.status}`);
  const shell = await req('/ezyadmin', { cookie: A });
  check('/ezyadmin renders for a logged-in admin', shell.status === 200, `got ${shell.status}`);

  // ── Facebook App Secret (Admin → Automations) ───────────────────────────
  console.log('\nFacebook Lead Ads App Secret — save / reload / validation / access');
  const before = await req('/api/integrations', { cookie: A });
  check('GET /api/integrations → 200', before.status === 200, `got ${before.status}`);
  const fbBefore = (before.body?.items || []).find((i) => i.provider === 'facebook');
  const fbBody = (id) => JSON.stringify({ entry: [{ changes: [{ field: 'leadgen', value: { leadgen_id: id } }] }] });
  if (!fbBefore?.config?.appSecret_set) {
    const r = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: fbBody('0') });
    check('no App Secret saved → webhook rejects (403)', r.status === 403, `got ${r.status} — is FACEBOOK_APP_SECRET set in env, or FACEBOOK_ALLOW_UNSIGNED on?`);
  } else {
    console.log('  · App Secret already saved — "missing secret" case not testable here (see test-security.mjs on a fresh env)');
  }
  for (const [label, v] of [['too short', 'abc123'], ['non-hex', 'z'.repeat(32)], ['non-string', 12345]]) {
    const r = await req('/api/integrations', { method: 'POST', cookie: A, json: { provider: 'facebook', config: { verifyToken: 'stg-' + rand(6), appSecret: v } } });
    check(`invalid App Secret (${label}) → 400`, r.status === 400, `got ${r.status}`);
  }
  const testSecret = rand(16); // 32 hex chars, like a real Meta App Secret
  const verifyToken = 'stg-' + rand(8);
  const saved = await req('/api/integrations', { method: 'POST', cookie: A, json: { provider: 'facebook', enabled: true, config: { verifyToken, appSecret: testSecret } } });
  check('valid App Secret saves → 200', saved.status === 200, `got ${saved.status}`);
  check('save response masks the secret', saved.body?.integration?.config?.appSecret === '••••••••' && saved.body?.integration?.config?.appSecret_set === true);
  const reload = await req('/api/integrations', { cookie: A });
  const fbCfg = (reload.body?.items || []).find((i) => i.provider === 'facebook')?.config || {};
  check('reload shows appSecret_set=true', fbCfg.appSecret_set === true);
  check('reload never returns the secret value', !JSON.stringify(reload.body).includes(testSecret));
  // Re-saving the form with the masked placeholder / blank must keep the secret.
  await req('/api/integrations', { method: 'POST', cookie: A, json: { provider: 'facebook', config: { verifyToken, appSecret: '••••••••' } } });
  await req('/api/integrations', { method: 'POST', cookie: A, json: { provider: 'facebook', config: { verifyToken, appSecret: '' } } });

  const sign = (body, secret) => 'sha256=' + crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  const okBody = fbBody(`staging-${Date.now()}`);
  const valid = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign(okBody, testSecret) }, body: okBody });
  check('Facebook: valid signature → 200 (after masked/blank re-saves)', valid.status === 200, `got ${valid.status}`);
  const wrongKey = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign(okBody, rand(16)) }, body: okBody });
  check('Facebook: signature with wrong secret → 403', wrongKey.status === 403, `got ${wrongKey.status}`);
  const tampered = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': sign(okBody, testSecret) }, body: okBody.replace('staging-', 'staginG-') });
  check('Facebook: tampered body → 403', tampered.status === 403, `got ${tampered.status}`);
  const unsigned = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: okBody });
  check('Facebook: missing signature → 403', unsigned.status === 403, `got ${unsigned.status}`);
  const hs = await req(`/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=ch4ll3nge`);
  check('Facebook: verify handshake with saved token → challenge echoed', hs.status === 200 && hs.body === 'ch4ll3nge', `got ${hs.status}`);

  // ── Employee RBAC ───────────────────────────────────────────────────────
  console.log('\nEmployee access control');
  const empEmail = `staging-emp-${rand(4)}@example.test`;
  const empPass = 'Stg' + rand(8) + '7';
  const created = await req('/api/employees', { method: 'POST', cookie: A, json: { name: TAG, email: empEmail, password: empPass, permissions: ['leads'] } });
  check('admin creates employee (leads only) → 201', created.status === 201, `got ${created.status} ${created.body?.message || ''}`);
  const empId = created.body?.employee?.id;
  const emp = await login(empEmail, empPass, nextIp());
  check('employee login → 200', emp.status === 200 && !!emp.cookie, `got ${emp.status}`);
  const E = emp.cookie;
  if (E) {
    check('employee GET /api/leads → 200', (await req('/api/leads', { cookie: E })).status === 200);
    for (const p of ['/api/integrations', '/api/employees', '/api/loans', '/api/admin/blocked-ips', '/api/reports/export']) {
      const r = await req(p, { cookie: E });
      check(`employee GET ${p} → 403`, r.status === 403, `got ${r.status}`);
    }
    const w = await req('/api/integrations', { method: 'POST', cookie: E, json: { provider: 'facebook', config: { appSecret: rand(16) } } });
    check('employee cannot save the App Secret → 403', w.status === 403, `got ${w.status}`);
    // Grant automations: may READ integration status, still cannot WRITE it.
    await req(`/api/employees/${empId}`, { method: 'PATCH', cookie: A, json: { permissions: ['leads', 'automations'] } });
    const stale = await req('/api/leads', { cookie: E });
    check('permission change revokes the employee session → 401', stale.status === 401, `got ${stale.status}`);
    const emp2 = await login(empEmail, empPass, nextIp());
    const r1 = await req('/api/integrations', { cookie: emp2.cookie });
    check('employee with automations can view integration status', r1.status === 200, `got ${r1.status}`);
    check('…but sees no secret values', !JSON.stringify(r1.body).includes(testSecret));
    const r2 = await req('/api/integrations', { method: 'POST', cookie: emp2.cookie, json: { provider: 'facebook', config: { appSecret: rand(16) } } });
    check('…and still cannot save it (admin only) → 403', r2.status === 403, `got ${r2.status}`);
    const lo = await req('/api/auth/logout', { method: 'POST', cookie: emp2.cookie });
    check('employee logout → 200', lo.status === 200, `got ${lo.status}`);
    check('logged-out session is rejected → 401', (await req('/api/leads', { cookie: emp2.cookie })).status === 401);
  }

  // ── Lead webhook auth ───────────────────────────────────────────────────
  console.log('\nDirect lead webhook (/api/webhook/lead)');
  const leadPayload = { name: `${TAG} webhook`, email: 'webhook@example.test', phone: '9000000001', source: 'Staging Test' };
  const noSecret = await req('/api/webhook/lead', { method: 'POST', json: leadPayload });
  check('no secret → 401', noSecret.status === 401, `got ${noSecret.status}`);
  const wrong = await req('/api/webhook/lead', { method: 'POST', json: leadPayload, headers: { 'x-webhook-secret': rand(16) } });
  check('wrong secret → 401', wrong.status === 401, `got ${wrong.status}`);
  const good = await req('/api/webhook/lead', { method: 'POST', json: leadPayload, headers: { 'x-webhook-secret': process.env.WEBHOOK_LEAD_SECRET } });
  check('correct x-webhook-secret → 200, lead created', good.status === 200 && good.body?.ok === true, `got ${good.status}`);
  const qs = await req(`/api/webhook/lead?secret=${encodeURIComponent(process.env.WEBHOOK_LEAD_SECRET)}`, { method: 'POST', json: { ...leadPayload, name: `${TAG} webhook-qs`, phone: '9000000002' } });
  check('correct ?secret= → 200', qs.status === 200, `got ${qs.status}`);

  // ── Twilio WhatsApp signature ───────────────────────────────────────────
  console.log('\nTwilio WhatsApp webhook signature');
  const params = { From: 'whatsapp:+919000000003', Body: 'hi (staging test)', MessageSid: 'SMstaging' + rand(8), ProfileName: TAG };
  const form = new URLSearchParams(params).toString();
  // The server checks the signature against the URL it rebuilds from
  // X-Forwarded-Proto + Host. Next.js fills X-Forwarded-Proto with "http" when
  // the proxy doesn't send it, so behind HTTPS nginx MUST forward
  // `X-Forwarded-Proto $scheme`. Direct mode plays the proxy and sends it.
  const u = new URL(BASE);
  const signedUrl = `${IP_MODE === 'direct' ? 'https' : u.protocol.replace(':', '')}://${u.host}/api/whatsapp/webhook`;
  const data = signedUrl + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const twSig = crypto.createHmac('sha1', process.env.TWILIO_AUTH_TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
  const proxyHdr = IP_MODE === 'direct' ? { 'x-forwarded-proto': 'https' } : {};
  const twPost = (headers) => req('/api/whatsapp/webhook', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', ...proxyHdr, ...headers }, body: form });
  check('missing X-Twilio-Signature → 403', (await twPost({})).status === 403);
  check('forged X-Twilio-Signature → 403', (await twPost({ 'x-twilio-signature': crypto.randomBytes(20).toString('base64') })).status === 403);
  const tw = await twPost({ 'x-twilio-signature': twSig });
  check('valid X-Twilio-Signature → 200 TwiML', tw.status === 200 && /<Response>/.test(String(tw.body)), `got ${tw.status} — does nginx forward X-Forwarded-Proto/Host?`);

  // ── Customer forms ──────────────────────────────────────────────────────
  console.log('\nCustomer workflows (public forms)');
  const ipC = nextIp();
  const tC = await formToken(ipC);
  check('form token issued', typeof tC === 'string' && tC.includes('.'));
  await sleep(2700); // MIN_FILL_MS
  const contact = await req('/api/contacts', {
    method: 'POST',
    headers: { 'x-forwarded-for': ipC },
    json: { fullName: `${TAG} contact`, email: 'contact@example.test', phoneNumber: '9000000004', loanType: 'Personal Loan', message: 'staging test', fg_token: tC },
  });
  check('contact form submit → 201', contact.status === 201, `got ${contact.status} ${contact.body?.message || ''}`);
  const ipL = nextIp();
  const tL = await formToken(ipL);
  await sleep(2700);
  const loan = await req('/api/loans', {
    method: 'POST',
    headers: { 'x-forwarded-for': ipL },
    json: { fullName: `${TAG} apply`, phoneNumber: '9000000005', email: 'apply@example.test', loanType: 'Personal Loan', employmentType: 'Salaried', city: 'Bhubaneswar', pincode: '751001', cibilScore: '750+', fg_token: tL },
  });
  check('apply-now submit → 201', loan.status === 201, `got ${loan.status} ${loan.body?.message || ''}`);
  const noTok = await req('/api/contacts', { method: 'POST', headers: { 'x-forwarded-for': nextIp() }, json: { fullName: 'x', email: 'x@example.test', phoneNumber: '9000000006', loanType: 'Personal Loan' } });
  check('submit without form token → 400', noTok.status === 400, `got ${noTok.status}`);
  const chat = await req('/api/chat', { method: 'POST', headers: { 'x-forwarded-for': nextIp() }, json: { message: 'What loans do you offer?', messages: [{ role: 'user', content: 'What loans do you offer?' }] } });
  check('chatbot answers → 200', chat.status === 200, `got ${chat.status}`);

  // ── Admin workflows on the new data ─────────────────────────────────────
  console.log('\nAdmin workflows');
  const leads = await req(`/api/leads?search=${encodeURIComponent('STAGING-TEST')}`, { cookie: A });
  const leadList = leads.body?.leads || leads.body?.items || [];
  check('admin sees STAGING-TEST leads', leads.status === 200 && leadList.length > 0, `got ${leads.status}, ${leadList.length} rows`);
  const lead = leadList[0];
  if (lead?._id) {
    const one = await req(`/api/leads/${lead._id}`, { cookie: A });
    check('GET /api/leads/[id] → 200 (async params)', one.status === 200, `got ${one.status}`);
    const upd = await req(`/api/leads/${lead._id}`, { method: 'PATCH', cookie: A, json: { status: 'Warm', notes: 'staging test' } });
    check('PATCH lead status → 200', upd.status === 200 && upd.body?.lead?.status === 'Warm', `got ${upd.status}`);
  }
  const manual = await req('/api/leads', { method: 'POST', cookie: A, json: { name: `${TAG} manual`, phone: '9000000007' } });
  check('admin creates a manual lead → 201', manual.status === 201, `got ${manual.status}`);
  const loans = await req('/api/loans', { cookie: A });
  const loanList = Array.isArray(loans.body) ? loans.body : loans.body?.loans || loans.body?.items || [];
  check('GET /api/loans → 200 with the application', loans.status === 200 && loanList.some((l) => String(l.fullName || '').startsWith('STAGING-TEST')), `got ${loans.status}`);
  const myLoan = loanList.find((l) => String(l.fullName || '').startsWith('STAGING-TEST'));
  if (myLoan?._id) {
    const st = await req(`/api/loans/${myLoan._id}/status`, { method: 'PUT', cookie: A, json: { status: 'nonsense' } });
    check('loan status rejects invalid value → 400', st.status === 400, `got ${st.status}`);
  }
  check('GET /api/contacts → 200', (await req('/api/contacts', { cookie: A })).status === 200);
  check('GET /api/reports/export → 200', (await req('/api/reports/export?type=leads', { cookie: A })).status === 200);
  for (const p of ['/api/analytics', '/api/notifications', '/api/activities', '/api/admin/whatsapp-chats', '/api/admin/chatlogs', '/api/blogs?all=1', '/api/careers', '/api/admin/whatsapp-status']) {
    const r = await req(p, { cookie: A });
    check(`GET ${p} → 200`, r.status === 200, `got ${r.status}`);
  }
  const draft = await req('/api/blogs', { method: 'POST', cookie: A, json: { title: `${TAG} draft post`, content: '<p>staging</p><script>alert(1)</script>', status: 'draft' } });
  check('create blog draft → 201', draft.status === 201 || draft.status === 200, `got ${draft.status} ${draft.body?.message || ''}`);
  const blogId = draft.body?.blog?._id || draft.body?._id;
  if (blogId) {
    const pub = await req(`/api/blog/${draft.body?.blog?.slug || draft.body?.slug}`);
    check('draft is not publicly readable → 404', pub.status === 404, `got ${pub.status}`);
    const del = await req(`/api/blogs/${blogId}`, { method: 'DELETE', cookie: A });
    check('delete draft → 200', del.status === 200, `got ${del.status}`);
  }

  // ── Trusted client IP ───────────────────────────────────────────────────
  console.log(`\nTrusted client IP (${IP_MODE})`);
  const target = '203.0.113.77';
  const blk = await req('/api/admin/blocked-ips', { method: 'POST', cookie: A, json: { ip: target, reason: TAG } });
  check('admin blocks a TEST-NET IP → 201', blk.status === 201, `got ${blk.status}`);
  const probe = (xff) => req('/api/contacts', { method: 'POST', headers: { 'x-forwarded-for': xff }, json: {} });
  if (IP_MODE === 'direct') {
    // TRUSTED_PROXY_HOPS=1 and we act as the proxy: the RIGHT-most entry is the client.
    check('blocked IP as the proxy-appended entry → 403', (await probe(target)).status === 403);
    check('forged left-most entry cannot impersonate the blocked IP', (await probe(`${target}, 198.51.100.200`)).status !== 403);
    check('forged prefix cannot dodge the block', (await probe(`1.2.3.4, ${target}`)).status === 403);
  } else {
    // Behind the real proxy, our own address is appended — a spoofed header
    // naming the blocked IP must be ignored.
    const r = await probe(target);
    check('spoofed X-Forwarded-For naming a blocked IP is ignored', r.status !== 403, `got ${r.status} — TRUSTED_* does not match the proxy chain`);
  }
  const unb = await req(`/api/admin/blocked-ips?ip=${target}`, { method: 'DELETE', cookie: A });
  check('unblock → 200', unb.status === 200, `got ${unb.status}`);

  // ── Cleanup ─────────────────────────────────────────────────────────────
  if (empId) {
    const dis = await req(`/api/employees/${empId}`, { method: 'PATCH', cookie: A, json: { disabled: true } });
    check('cleanup: test employee disabled', dis.status === 200, `got ${dis.status}`);
    const again = await login(empEmail, empPass, nextIp());
    check('disabled employee cannot log in → 401', again.status === 401, `got ${again.status}`);
  }
  const out = await req('/api/auth/logout', { method: 'POST', cookie: A });
  check('admin logout → 200', out.status === 200);
  check('admin session revoked after logout → 401', (await req('/api/me', { cookie: A })).status === 401);

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed) console.log(`Failed: ${failures.join(' | ')}`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(`\nAborted: ${e.message}`);
  console.log(`${passed} passed, ${failed} failed (incomplete)`);
  process.exit(2);
});
