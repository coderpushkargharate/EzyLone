// Authorization & exposure regression tests — HTTP level, READ-ONLY.
//
//   npm run build && npm start            (or npm run dev)
//   npm run test:security                 (defaults to http://localhost:3000)
//   BASE_URL=https://staging.example npm run test:security
//
// Sends only unauthenticated / forged-cookie requests and public GETs. It never
// logs in (that would touch lockout counters) and never creates data, so it is
// safe against any environment — but prefer local or staging.

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
let passed = 0;
let failed = 0;

function check(name, ok, detail = '') {
  if (ok) passed++;
  else failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}

async function req(path, init = {}) {
  return fetch(BASE + path, { redirect: 'manual', ...init });
}

const ZERO_ID = '000000000000000000000000';
// A JWT claiming admin with a bad signature, and an unsigned alg:none token.
const FORGED = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzaWQiOiJ4Iiwic3ViIjoieCIsInJvbGUiOiJhZG1pbiJ9.invalidsig';
const ALG_NONE = 'eyJhbGciOiJub25lIn0.eyJzaWQiOiJ4Iiwic3ViIjoieCJ9.';

const PROTECTED_GET = [
  '/api/leads', '/api/loans', '/api/contacts', '/api/employees', '/api/careers',
  '/api/reports/export', '/api/admin/chatlogs', '/api/admin/blocked-ips', '/api/integrations',
  '/api/me', '/api/notifications', '/api/analytics', '/api/activities',
  '/api/admin/whatsapp-chats', '/api/admin/site-health', '/api/admin/push/debug',
  '/api/admin/knowledge', '/api/admin/chat-analytics', '/api/admin/whatsapp-status',
  '/api/auth/verify', `/api/leads/${ZERO_ID}`,
];

const PROTECTED_WRITES = [
  ['POST', '/api/leads'], ['POST', '/api/blogs'], ['POST', '/api/employees'],
  ['POST', '/api/banners'], ['POST', '/api/testimonials'], ['POST', '/api/content'],
  ['POST', '/api/admin/knowledge'], ['POST', '/api/integrations'], ['POST', '/api/me/password'],
  ['POST', `/api/blogs/${ZERO_ID}/status`], ['POST', '/api/blogs/upload'],
  ['DELETE', `/api/leads/${ZERO_ID}`], ['DELETE', `/api/loans/${ZERO_ID}/documents?url=x`],
  ['PATCH', `/api/employees/${ZERO_ID}`], ['PATCH', '/api/me'],
];

async function main() {
  console.log(`Security regression tests against ${BASE}\n`);

  console.log('Anonymous access to protected APIs → 401');
  for (const p of PROTECTED_GET) {
    const r = await req(p);
    check(`GET ${p}`, r.status === 401, `got ${r.status}`);
  }
  for (const [method, p] of PROTECTED_WRITES) {
    const r = await req(p, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ role: 'admin', permissions: ['employees'] }),
    });
    check(`${method} ${p}`, r.status === 401, `got ${r.status}`);
  }

  console.log('\nForged / unsigned session cookies are rejected');
  for (const [label, cookie] of [
    ['forged HS256 (dev name)', `ezy_session=${FORGED}`],
    ['forged HS256 (__Host- name)', `__Host-ezy_session=${FORGED}`],
    ['alg:none', `__Host-ezy_session=${ALG_NONE}`],
    ['legacy cookie name', `token=${FORGED}`],
  ]) {
    const r = await req('/api/leads', { headers: { cookie } });
    check(`${label} → 401`, r.status === 401, `got ${r.status}`);
  }

  console.log('\nAdmin shell gate');
  {
    const r = await req('/ezyadmin');
    check('anonymous /ezyadmin redirects to /ezylogin', [307, 308].includes(r.status) && /\/ezylogin$/.test(r.headers.get('location') || ''), `got ${r.status}`);
    const r2 = await req('/ezyadmin', { headers: { 'x-middleware-subrequest': 'middleware:middleware:middleware:middleware:middleware' } });
    check('x-middleware-subrequest does not bypass middleware', [307, 308].includes(r2.status), `got ${r2.status}`);
    const r3 = await req('/ezylogin');
    check('/ezylogin sends X-Robots-Tag noindex', /noindex/.test(r3.headers.get('x-robots-tag') || ''));
    check('/ezylogin is not cacheable', /no-store/.test(r3.headers.get('cache-control') || ''));
  }

  console.log('\nCross-origin state change is refused (CSRF defence)');
  {
    const r = await req('/api/leads', { method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body: '{}' });
    check('foreign Origin POST → 401/403', [401, 403].includes(r.status), `got ${r.status}`);
  }

  console.log('\nWebhooks fail closed (payloads can never create a lead)');
  {
    // A leadgen id that cannot resolve at the Graph API, so even a server in
    // FACEBOOK_ALLOW_UNSIGNED mode saves nothing.
    const fbBody = JSON.stringify({ entry: [{ changes: [{ field: 'leadgen', value: { leadgen_id: '0' } }] }] });
    const unsigned = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json' }, body: fbBody });
    check('Facebook webhook: unsigned POST → 403', unsigned.status === 403, `got ${unsigned.status} (open? check App Secret / FACEBOOK_ALLOW_UNSIGNED)`);
    const forged = await req('/api/webhook/facebook', { method: 'POST', headers: { 'content-type': 'application/json', 'x-hub-signature-256': 'sha256=' + '0'.repeat(64) }, body: fbBody });
    check('Facebook webhook: forged signature → 403', forged.status === 403, `got ${forged.status}`);
    const verify = await req('/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=wrong-token&hub.challenge=x');
    check('Facebook verify handshake with wrong token → 403', verify.status === 403, `got ${verify.status}`);

    // Empty body: even an open endpoint answers 400 without creating anything.
    const noSecret = await req('/api/webhook/lead', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    check('Lead webhook: no secret → 401/503', [401, 503].includes(noSecret.status), `got ${noSecret.status} (open? check WEBHOOK_LEAD_SECRET / WEBHOOK_LEAD_ALLOW_OPEN)`);
    const badSecret = await req('/api/webhook/lead', { method: 'POST', headers: { 'content-type': 'application/json', 'x-webhook-secret': 'wrong-secret' }, body: '{}' });
    check('Lead webhook: wrong secret → 401/503', [401, 503].includes(badSecret.status), `got ${badSecret.status}`);
    // The Twilio webhook is deliberately not probed: on a server with
    // TWILIO_VALIDATE_SIGNATURE=false it would store a message and send a push.
  }

  console.log('\nPublic blog data exposes published posts only');
  {
    const r = await req('/api/blogs');
    const list = r.ok ? await r.json() : [];
    check('/api/blogs returns 200', r.ok, `got ${r.status}`);
    const leaks = list.filter((b) => 'status' in b || 'content' in b || 'previousSlugs' in b);
    check('public list omits status/content/internal fields', leaks.length === 0, `${leaks.length} rows leak`);
    const missing = await req('/api/blog/zz-definitely-not-a-real-post');
    check('unknown slug → 404', missing.status === 404, `got ${missing.status}`);
    const page = await req('/blog/zz-definitely-not-a-real-post');
    check('unknown blog page → 404', page.status === 404, `got ${page.status}`);
  }

  console.log('\nSitemap & robots');
  {
    const xml = await (await req('/sitemap.xml')).text();
    check('sitemap excludes private/admin/api URLs', !/<loc>[^<]*(ezyadmin|ezylogin|ThankYouPage|\/api\/)/i.test(xml));
    const robots = await (await req('/robots.txt')).text();
    check('robots.txt references sitemap', /Sitemap:/i.test(robots));
  }

  console.log('\nSecurity headers');
  {
    const h = (await req('/')).headers;
    check('X-Content-Type-Options nosniff', h.get('x-content-type-options') === 'nosniff');
    check('clickjacking protection', h.get('x-frame-options') === 'DENY' && /frame-ancestors 'none'/.test(h.get('content-security-policy') || ''));
    check('Referrer-Policy set', !!h.get('referrer-policy'));
    check('X-Powered-By hidden', !h.get('x-powered-by'));
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(`Could not reach ${BASE}: ${e.message}`);
  process.exit(2);
});
