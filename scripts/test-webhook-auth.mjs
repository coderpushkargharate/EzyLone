// Unit tests for lib/webhookAuth.ts and lib/clientIp.ts (pure, no network/DB).
//   npm run test:unit
import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import crypto from 'node:crypto';
import path from 'node:path';

const OUT = '.tmp-unit-webhook';
execSync(
  `npx tsc --module commonjs --target es2019 --esModuleInterop --moduleResolution node --skipLibCheck --outDir ${OUT} lib/webhookAuth.ts lib/clientIp.ts`,
  { stdio: 'inherit' },
);

let passed = 0;
let failed = 0;
function check(name, ok, detail = '') {
  ok ? passed++ : failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);
}

try {
  const require = createRequire(import.meta.url);
  const { verifyMetaSignature, safeEqual, envFlag } = require(path.resolve(OUT, 'webhookAuth.js'));
  const { resolveClientIp, ipSourceConfigured } = require(path.resolve(OUT, 'clientIp.js'));

  console.log('Meta signature (X-Hub-Signature-256)');
  const secret = 'test-app-secret';
  const body = '{"entry":[{"changes":[{"field":"leadgen","value":{"leadgen_id":"1"}}]}]}';
  const good = 'sha256=' + crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
  check('valid signature → valid', verifyMetaSignature(body, good, secret) === 'valid');
  check('tampered body → invalid', verifyMetaSignature(body + ' ', good, secret) === 'invalid');
  check('wrong secret → invalid', verifyMetaSignature(body, good, 'other') === 'invalid');
  check('missing header → invalid', verifyMetaSignature(body, null, secret) === 'invalid');
  check('sha1 header → invalid', verifyMetaSignature(body, 'sha1=abc', secret) === 'invalid');
  check('no secret → unconfigured (caller must reject)', verifyMetaSignature(body, good, '') === 'unconfigured');

  console.log('\nsafeEqual / envFlag');
  check('equal strings', safeEqual('abc', 'abc'));
  check('different strings', !safeEqual('abc', 'abd'));
  check('different lengths', !safeEqual('abc', 'abcd'));
  check('null / empty never equal', !safeEqual(null, null) && !safeEqual('', ''));
  process.env.__T_FLAG = 'TRUE';
  check('envFlag requires exact "true"', !envFlag('__T_FLAG') && !envFlag('__T_MISSING'));
  process.env.__T_FLAG = 'true';
  check('envFlag "true" → on', envFlag('__T_FLAG'));

  console.log('\nClient IP resolution');
  const h = (o) => ({ get: (k) => o[k.toLowerCase()] ?? null });
  const spoofed = h({ 'x-forwarded-for': '6.6.6.6, 203.0.113.9', 'x-real-ip': '203.0.113.9' });

  let r = resolveClientIp(spoofed, {});
  check('unconfigured → left-most XFF, untrusted', r.ip === '6.6.6.6' && r.trusted === false, JSON.stringify(r));
  check('unconfigured → ipSourceConfigured false', ipSourceConfigured({}) === false);

  r = resolveClientIp(spoofed, { TRUSTED_IP_HEADER: 'X-Real-IP' });
  check('TRUSTED_IP_HEADER → that header, trusted', r.ip === '203.0.113.9' && r.trusted, JSON.stringify(r));
  r = resolveClientIp(h({ 'x-forwarded-for': '6.6.6.6' }), { TRUSTED_IP_HEADER: 'x-real-ip' });
  check('trusted header missing → unknown (no XFF fallback)', r.ip === 'unknown' && !r.trusted, JSON.stringify(r));

  r = resolveClientIp(spoofed, { TRUSTED_PROXY_HOPS: '1' });
  check('1 proxy hop → right-most XFF (ignores forged prefix)', r.ip === '203.0.113.9' && r.trusted, JSON.stringify(r));
  r = resolveClientIp(h({ 'x-forwarded-for': '6.6.6.6, 198.51.100.7, 10.0.0.2' }), { TRUSTED_PROXY_HOPS: '2' });
  check('2 proxy hops → second from right', r.ip === '198.51.100.7' && r.trusted, JSON.stringify(r));
  r = resolveClientIp(h({ 'x-forwarded-for': '198.51.100.7' }), { TRUSTED_PROXY_HOPS: '2' });
  check('fewer XFF entries than hops → unknown', r.ip === 'unknown' && !r.trusted, JSON.stringify(r));
  check('invalid hops value ignored', ipSourceConfigured({ TRUSTED_PROXY_HOPS: 'abc' }) === false);
} finally {
  rmSync(OUT, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
