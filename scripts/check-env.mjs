// Pre-deployment environment check. Prints variable NAMES and set/unset/format
// status only — never a value. Run it ON THE SERVER, against the env file the
// app will load:
//
//   node --env-file=.env.local scripts/check-env.mjs --target=staging
//   node --env-file=.env.local scripts/check-env.mjs --target=production
//
// "DB fingerprint" is a short hash of cluster host + database name. Run the
// check on both servers: the fingerprints MUST differ, which proves staging
// uses a different database without anyone seeing the connection string.
// Exit code 1 when any FAIL is reported.
import crypto from 'node:crypto';

const target = (process.argv.find((a) => a.startsWith('--target=')) || '').split('=')[1];
if (!['staging', 'production'].includes(target)) {
  console.error('Usage: node --env-file=<file> scripts/check-env.mjs --target=staging|production');
  process.exit(2);
}
const STAGING = target === 'staging';
const env = process.env;
const has = (k) => typeof env[k] === 'string' && env[k].trim() !== '';
const rows = [];
const row = (status, name, note) => rows.push({ status, name, note });
const need = (name, note, ok = has(name), failNote) => row(ok ? 'PASS' : 'FAIL', name, ok ? note : failNote || `not set — ${note}`);
const hostOf = (u) => { try { return new URL(u).hostname; } catch { return ''; } };

// ── Database ──────────────────────────────────────────────────────────────
need('DATABASE_URL', 'MongoDB connection string');
const dbName = env.DATABASE_NAME?.trim() || 'mydatabase';
let fingerprint = 'n/a';
if (has('DATABASE_URL')) {
  const host = hostOf(env.DATABASE_URL.replace(/^mongodb(\+srv)?:/, 'http:')).toLowerCase();
  fingerprint = crypto.createHash('sha256').update(`${host}/${dbName}`).digest('hex').slice(0, 12);
  const pathDb = (() => { try { return new URL(env.DATABASE_URL.replace(/^mongodb(\+srv)?:/, 'http:')).pathname.replace(/^\//, ''); } catch { return ''; } })();
  if (pathDb && pathDb !== dbName) {
    row(has('DATABASE_NAME') ? 'INFO' : 'WARN', 'DATABASE_URL',
      has('DATABASE_NAME') ? 'database name in the URL path is ignored; DATABASE_NAME is used' : 'the database named in the URL path is IGNORED — the app opens "mydatabase". Set DATABASE_NAME.');
  }
}
if (STAGING) {
  row(has('DATABASE_NAME') && dbName !== 'mydatabase' ? 'PASS' : 'FAIL', 'DATABASE_NAME',
    has('DATABASE_NAME') && dbName !== 'mydatabase' ? 'staging database name set' : 'staging must set DATABASE_NAME to a non-production name (the code default is the production name "mydatabase")');
} else {
  row('INFO', 'DATABASE_NAME', has('DATABASE_NAME') ? 'set (production normally leaves this unset → "mydatabase")' : 'unset → "mydatabase" (unchanged production behaviour)');
}

// ── Auth ──────────────────────────────────────────────────────────────────
need('JWT_SECRET', 'session signing key (≥ 32 chars)', has('JWT_SECRET') && env.JWT_SECRET.length >= 32, has('JWT_SECRET') ? 'shorter than 32 characters' : undefined);
row('INFO', 'ADMIN_USERNAME / ADMIN_PASSWORD', has('ADMIN_USERNAME') && has('ADMIN_PASSWORD') ? 'set — only used when the DB has no admin yet' : 'unset — fine if an admin already exists in this DB');

// ── Client IP (exactly one) ───────────────────────────────────────────────
const hops = Number.parseInt(env.TRUSTED_PROXY_HOPS || '', 10);
const hopsOk = Number.isInteger(hops) && hops >= 1 && hops <= 9;
if (has('TRUSTED_IP_HEADER') && hopsOk) row('WARN', 'TRUSTED_IP_HEADER + TRUSTED_PROXY_HOPS', 'both set — TRUSTED_IP_HEADER wins; unset the other to avoid confusion');
else if (has('TRUSTED_IP_HEADER')) row('PASS', 'TRUSTED_IP_HEADER', `header "${env.TRUSTED_IP_HEADER.trim().toLowerCase()}" — the proxy must OVERWRITE it (nginx: proxy_set_header X-Real-IP $remote_addr)`);
else if (hopsOk) row('PASS', 'TRUSTED_PROXY_HOPS', `${hops} proxy hop(s) append to X-Forwarded-For`);
else row('FAIL', 'TRUSTED_IP_HEADER / TRUSTED_PROXY_HOPS', has('TRUSTED_PROXY_HOPS') ? 'TRUSTED_PROXY_HOPS must be 1–9' : 'neither set — client IPs are spoofable and automatic IP blocking stays OFF');

// ── Webhooks ──────────────────────────────────────────────────────────────
need('WEBHOOK_LEAD_SECRET', 'direct lead webhook secret (≥ 32 chars)', has('WEBHOOK_LEAD_SECRET') && env.WEBHOOK_LEAD_SECRET.length >= 32,
  has('WEBHOOK_LEAD_SECRET') ? 'shorter than 32 characters' : 'not set — /api/webhook/lead answers 503 (fail closed)');
row(env.WEBHOOK_LEAD_ALLOW_OPEN === 'true' ? 'FAIL' : 'PASS', 'WEBHOOK_LEAD_ALLOW_OPEN', env.WEBHOOK_LEAD_ALLOW_OPEN === 'true' ? 'escape hatch ON — anyone can create leads' : 'off');
if (has('FACEBOOK_APP_SECRET')) {
  row(/^[0-9a-f]{32}$/i.test(env.FACEBOOK_APP_SECRET.trim()) ? 'PASS' : 'FAIL', 'FACEBOOK_APP_SECRET', /^[0-9a-f]{32}$/i.test(env.FACEBOOK_APP_SECRET.trim()) ? 'set, 32 hex chars (a secret saved in Admin → Automations takes precedence)' : 'not 32 hex characters');
} else {
  row('WARN', 'FACEBOOK_APP_SECRET', 'unset — OK only if the App Secret is saved in Admin → Automations → Facebook Lead Ads; otherwise every lead event is rejected (403)');
}
row(env.FACEBOOK_ALLOW_UNSIGNED === 'true' ? 'FAIL' : 'PASS', 'FACEBOOK_ALLOW_UNSIGNED', env.FACEBOOK_ALLOW_UNSIGNED === 'true' ? 'escape hatch ON — unsigned events accepted' : 'off');
if (has('TWILIO_ACCOUNT_SID')) need('TWILIO_AUTH_TOKEN', 'verifies X-Twilio-Signature');
else row('INFO', 'TWILIO_ACCOUNT_SID', 'unset — WhatsApp sending disabled; inbound webhook rejects everything without TWILIO_AUTH_TOKEN');
row(env.TWILIO_VALIDATE_SIGNATURE === 'false' ? 'FAIL' : 'PASS', 'TWILIO_VALIDATE_SIGNATURE', env.TWILIO_VALIDATE_SIGNATURE === 'false' ? 'signature check DISABLED' : 'signature check on');

// ── Cloudinary (CLOUD_NAME is also read at BUILD time by next.config.mjs) ──
need('CLOUDINARY_CLOUD_NAME', 'must be set BEFORE `npm run build` — it scopes the image optimizer to this account');
need('CLOUDINARY_API_KEY', 'uploads');
need('CLOUDINARY_API_SECRET', 'uploads; also verifies delete ownership');

// ── Outbound side effects ─────────────────────────────────────────────────
const site = env.NEXT_PUBLIC_SITE_URL || '';
const siteHost = hostOf(site);
if (STAGING) {
  row(siteHost && !/(^|\.)ezyloan\.co\.in$/.test(siteHost) || /^staging\./.test(siteHost) ? 'PASS' : 'FAIL', 'NEXT_PUBLIC_SITE_URL',
    siteHost ? `host ${siteHost} (inlined at build time)` : 'unset');
  row(has('SMTP_USER') ? 'WARN' : 'PASS', 'SMTP_USER / SMTP_PASS', has('SMTP_USER') ? 'set — must be a TEST mailbox; customer welcome emails and alerts will really be sent' : 'unset — no email is sent (safe default for staging)');
  row(has('CRM_WEBHOOK_URL') ? 'WARN' : 'PASS', 'CRM_WEBHOOK_URL', has('CRM_WEBHOOK_URL') ? `points at ${hostOf(env.CRM_WEBHOOK_URL) || 'an unparsable URL'} — must NOT be the production CRM` : 'unset — CRM sync disabled');
  row(has('TWILIO_ACCOUNT_SID') ? 'WARN' : 'PASS', 'TWILIO_ACCOUNT_SID', has('TWILIO_ACCOUNT_SID') ? 'set — use a Twilio TEST/sandbox account; real WhatsApp messages will be sent' : 'unset — no WhatsApp is sent');
  row(has('VAPID_PRIVATE_KEY') ? 'WARN' : 'PASS', 'VAPID_PRIVATE_KEY', has('VAPID_PRIVATE_KEY') ? 'set — use a staging-only keypair so pushes never reach production admins' : 'unset — push disabled');
  row(has('ANTHROPIC_API_KEY') || has('OPENAI_API_KEY') ? 'WARN' : 'PASS', 'ANTHROPIC_API_KEY / OPENAI_API_KEY', has('ANTHROPIC_API_KEY') || has('OPENAI_API_KEY') ? 'set — chatbot calls bill this key' : 'unset — rule-engine chatbot only');
} else {
  row(siteHost === 'www.ezyloan.co.in' ? 'PASS' : 'FAIL', 'NEXT_PUBLIC_SITE_URL', siteHost ? `host ${siteHost} (must be www.ezyloan.co.in; inlined at build time)` : 'unset');
  need('SMTP_USER', 'lead/alert email');
  need('SMTP_PASS', 'lead/alert email');
  need('FROM_EMAIL', 'sender (must match SMTP_USER for Gmail)');
}

// ── Report ────────────────────────────────────────────────────────────────
console.log(`Environment check — target: ${target}`);
console.log(`DB fingerprint: ${fingerprint}  (database name: ${dbName === 'mydatabase' ? 'mydatabase [production default]' : 'custom'})\n`);
const w = Math.max(...rows.map((r) => r.name.length));
for (const r of rows) console.log(`${r.status.padEnd(5)} ${r.name.padEnd(w)}  ${r.note}`);
const fails = rows.filter((r) => r.status === 'FAIL').length;
const warns = rows.filter((r) => r.status === 'WARN').length;
console.log(`\n${fails} FAIL, ${warns} WARN`);
process.exit(fails ? 1 : 0);
