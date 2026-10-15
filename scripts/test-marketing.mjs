// Marketing integration tests (Meta Lead Ads, Conversions API, Google Data Manager,
// attribution, consent, ledger idempotency, worker retries, admin authorization,
// dashboard aggregation).
//
//   npm run test:marketing
//
// Part 1 — pure unit tests (always run).
// Part 2 — integration tests against a DISPOSABLE local mongod started by this
//          script on a random port with a temp data dir (never DATABASE_URL from
//          .env.local). All Meta/Google HTTP calls are answered by an in-process
//          fetch mock — nothing leaves the machine. Set MONGOD_BIN to a mongod
//          binary, or the script looks in ~/.cache/mongodb-binaries.
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

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
const section = (t) => console.log(`\n${t}`);
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Env for the modules under test — set BEFORE importing them (lib/db.ts reads
// DATABASE_URL at import time, so the disposable mongod's port is chosen now).
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const MONGO_PORT = await freePort();
process.env.DATABASE_URL = `mongodb://127.0.0.1:${MONGO_PORT}`;
process.env.DATABASE_NAME = 'ezyloan_marketing_test';
process.env.MARKETING_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
process.env.JWT_SECRET = crypto.randomBytes(48).toString('base64url');
process.env.META_APP_ID = '1234567890';
process.env.META_APP_SECRET = 'a'.repeat(32);
process.env.GOOGLE_OAUTH_CLIENT_ID = 'test-client.apps.googleusercontent.com';
process.env.GOOGLE_OAUTH_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_ADS_DEVELOPER_TOKEN = 'test-dev-token';
process.env.MARKETING_PUBLIC_BASE_URL = 'https://www.ezyloan.co.in';
process.env.MARKETING_WORKER_ENABLED = 'false';
delete process.env.SMTP_USER;
delete process.env.VAPID_PRIVATE_KEY;
// Keep the modules' structured logs out of the test output.
const realLog = console.log;
const quiet = (fn) => (...a) => (typeof a[0] === 'string' && (a[0].startsWith('{"ts"') || a[0].startsWith('[push]')) ? undefined : fn(...a));
console.log = quiet(realLog);
console.warn = quiet(console.warn);
console.error = quiet(console.error);

// ─────────────────────────────── Part 1: unit ───────────────────────────────
const norm = await import('../lib/marketing/normalize.ts');
const attr = await import('../lib/marketing/attribution.ts');
const consent = await import('../lib/marketing/consent.ts');
const metaP = await import('../lib/marketing/meta/payload.ts');
const gP = await import('../lib/marketing/google/payload.ts');
const retry = await import('../lib/marketing/retry.ts');
const secrets = await import('../lib/marketing/secrets.ts');
const lf = await import('../lib/marketing/meta/leadFields.ts');
const settingsMod = await import('../lib/marketing/settings.ts');
const dashMath = await import('../lib/marketing/dashboard.ts');
const shape = await import('../lib/marketing/google/reportShape.ts');
const analytics = await import('../lib/analytics.ts');
const setupMod = await import('../lib/marketing/setup.ts');

section('Normalization + hashing (Meta / Google specs)');
check('email trimmed+lowercased then hashed', norm.metaHash.email('  John.Doe@Example.COM ') === sha('john.doe@example.com'));
check('already-hashed value is never re-hashed', norm.metaHash.email(sha('a@b.co')) === sha('a@b.co'));
check('uppercase hex hash passes through lowercased', norm.metaHash.email(sha('a@b.co').toUpperCase()) === sha('a@b.co'));
check('invalid email → null (not hashed garbage)', norm.metaHash.email('not-an-email') === null);
check('Meta phone: 10-digit Indian mobile gets 91, digits only', norm.metaHash.phone('98765 43210') === sha('919876543210'));
check('Meta phone: +91 / 0 prefix variants identical', norm.metaHash.phone('+91-98765-43210') === sha('919876543210') && norm.metaHash.phone('09876543210') === sha('919876543210'));
check('Google phone: E.164 with +', norm.googleHash.phone('9876543210') === sha('+919876543210'));
check('Google gmail: dots removed in local part', norm.googleHash.email('Jo.Hn@GMAIL.com') === sha('john@gmail.com'));
check('Google non-gmail: dots kept', norm.googleHash.email('jo.hn@example.com') === sha('jo.hn@example.com'));
check('name part: lowercase letters only', norm.normalizeNamePart("O'Brien-Smith") === 'obriensmith');
check('Unicode names kept', norm.normalizeNamePart('Rāhul') === 'rāhul');
check('splitName first/last', JSON.stringify(norm.splitName('  Rahul  Kumar Sharma ')) === JSON.stringify({ first: 'Rahul', last: 'Sharma' }));
check('empty input → null', norm.metaHash.phone('') === null && norm.metaHash.email(undefined) === null);

section('Attribution sanitization + channel');
const hosts = ['www.ezyloan.co.in'];
const s1 = attr.sanitizeAttribution({
  firstTouch: { utmSource: 'google', utmMedium: 'cpc', gclid: 'Cj0KCQjw_test-123', landingPage: 'https://www.ezyloan.co.in/car-loan?utm_source=google&email=x@y.com', at: new Date().toISOString(), evil: 'x' },
  lastTouch: { fbclid: 'IwAR0abc_DEF-123', referrer: 'https://www.facebook.com/some/path?id=1' },
  fbp: 'fb.1.1700000000000.1234567890',
  fbc: 'fb.1.1700000000000.IwAR0abc',
  pixelEventId: 'lead_abcdef123456',
  eventSourceUrl: 'https://evil.example/apply',
}, hosts);
check('gclid kept, unknown keys dropped', s1.firstTouch.gclid === 'Cj0KCQjw_test-123' && !('evil' in s1.firstTouch));
check('landing page keeps marketing params, strips other query (PII)', s1.firstTouch.landingPage === 'https://www.ezyloan.co.in/car-loan?utm_source=google');
check('referrer reduced to origin', s1.lastTouch.referrer === 'https://www.facebook.com');
check('fbp/fbc format validated', s1.fbp && s1.fbc);
check('event source URL on a foreign host rejected', s1.eventSourceUrl === undefined);
check('malformed click id rejected', attr.sanitizeAttribution({ lastTouch: { gclid: '<script>' } }).lastTouch === undefined);
check('future timestamp rejected', attr.sanitizeAttribution({ lastTouch: { utmSource: 'x', at: '2999-01-01' } }).lastTouch.at === undefined);
check('non-object input → {}', JSON.stringify(attr.sanitizeAttribution('x')) === '{}');
check('channel: gclid → google_ads', attr.deriveChannel({ gclid: 'abcdefgh1' }) === 'google_ads');
check('channel: facebook + paid → meta_ads', attr.deriveChannel({ utmSource: 'facebook', utmMedium: 'paid_social' }) === 'meta_ads');
check('channel: google referrer, no ids → organic_search', attr.deriveChannel({ referrer: 'https://www.google.com' }) === 'organic_search');
check('channel: Lead Ads source', attr.deriveChannel(undefined, 'Facebook Lead Ads') === 'meta_lead_ads');
check('channel: no touch → direct only when touch exists', attr.deriveChannel({ landingPage: 'https://www.ezyloan.co.in/' }) === 'direct');
check('consent: only explicit true = granted', attr.consentFromForm(true, 's').adMeasurement === 'granted' && attr.consentFromForm('true', 's').adMeasurement === 'unknown' && attr.consentFromForm(false, 's').adMeasurement === 'denied');

section('Consent gate');
const pol = { allowLeadIdOnlyForLeadAds: false };
check('granted → full', consent.evaluateConsent('meta', { adMeasurement: 'granted' }, pol, {}).mode === 'full');
check('unknown → blocked', !consent.evaluateConsent('meta', { adMeasurement: 'unknown' }, pol, {}).allowed);
check('denied → blocked even for Lead Ads with policy on', !consent.evaluateConsent('meta', { adMeasurement: 'denied' }, { allowLeadIdOnlyForLeadAds: true }, { metaLeadId: '123456789012345' }).allowed);
check('Lead Ads + policy off → blocked', !consent.evaluateConsent('meta', undefined, pol, { metaLeadId: '123456789012345' }).allowed);
check('Lead Ads + policy on → lead_id_only', consent.evaluateConsent('meta', undefined, { allowLeadIdOnlyForLeadAds: true }, { metaLeadId: '123456789012345' }).mode === 'lead_id_only');
check('Google never uses the Lead Ads exception', !consent.evaluateConsent('google', undefined, { allowLeadIdOnlyForLeadAds: true }, { metaLeadId: '123456789012345' }).allowed);

section('Meta Conversions API payload');
const now = Math.floor(Date.now() / 1000);
const full = metaP.buildMetaEvent({ eventName: 'QualifiedLead', eventTime: now - 60, eventId: 'ezy_QualifiedLead_x', actionSource: 'system_generated', mode: 'full', customer: { email: 'A@B.com', phone: '9876543210', name: 'Rahul Sharma', country: 'in', externalId: 'lead1', metaLeadId: '123456789012345' }, value: 500, currency: 'inr' });
const ud = full.event.user_data;
check('builds', full.ok);
check('em/ph hashed arrays', ud.em[0] === sha('a@b.com') && ud.ph[0] === sha('919876543210'));
check('fn/ln/country/external_id hashed', ud.fn[0] === sha('rahul') && ud.ln[0] === sha('sharma') && ud.country[0] === sha('in') && ud.external_id[0] === sha('lead1'));
check('lead_id sent raw (not hashed)', ud.lead_id === '123456789012345');
check('no raw email/phone anywhere in payload', !JSON.stringify(full.event).includes('a@b.com') && !JSON.stringify(full.event).includes('9876543210'));
check('CRM event: event_source=crm + lead_event_source', full.event.custom_data.event_source === 'crm' && full.event.custom_data.lead_event_source === 'EzyLoan CRM');
check('value rounded, currency uppercased', full.event.custom_data.value === 500 && full.event.custom_data.currency === 'INR');
check('client IP/UA not sent for non-website events', !('client_ip_address' in ud));
const lio = metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now, eventId: 'e1', actionSource: 'system_generated', mode: 'lead_id_only', customer: { email: 'a@b.com', metaLeadId: '123456789012345' } });
check('lead_id_only mode sends ONLY lead_id', JSON.stringify(Object.keys(lio.event.user_data)) === '["lead_id"]');
check('event older than 7 days refused', !metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now - 8 * 86400, eventId: 'e', actionSource: 'system_generated', mode: 'full', customer: { email: 'a@b.com' } }).ok);
check('future event refused', !metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now + 3600, eventId: 'e', actionSource: 'system_generated', mode: 'full', customer: { email: 'a@b.com' } }).ok);
check('no identifiers refused', !metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now, eventId: 'e', actionSource: 'system_generated', mode: 'full', customer: { name: 'X' } }).ok);
check('website event requires event_source_url + UA', !metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now, eventId: 'e', actionSource: 'website', mode: 'full', customer: { email: 'a@b.com' } }).ok);
const web = metaP.buildMetaEvent({ eventName: 'Lead', eventTime: now, eventId: 'lead_px123456', actionSource: 'website', eventSourceUrl: 'https://www.ezyloan.co.in/apply-now', mode: 'full', customer: { email: 'a@b.com', userAgent: 'UA', clientIp: '1.2.3.4', fbp: 'fb.1.1.1' } });
check('website event carries UA/IP/fbp + no crm custom_data', web.ok && web.event.user_data.client_user_agent === 'UA' && web.event.user_data.client_ip_address === '1.2.3.4' && !web.event.custom_data);
check('invalid event name refused', !metaP.buildMetaEvent({ eventName: 'bad name!', eventTime: now, eventId: 'e', actionSource: 'system_generated', mode: 'full', customer: { email: 'a@b.com' } }).ok);
check('response: events_received match → ok', metaP.parseMetaResponse({ events_received: 1, fbtrace_id: 'T' }, 1).ok);
check('response: mismatch → not ok', !metaP.parseMetaResponse({ events_received: 0 }, 1).ok && !metaP.parseMetaResponse({}, 1).ok);
check('error 190 → auth, not retryable', (() => { const c = metaP.classifyMetaError(400, { error: { code: 190 } }); return c.kind === 'auth' && !c.retryable; })());
check('error 17/613 → rate_limit retryable', metaP.classifyMetaError(400, { error: { code: 17 } }).retryable && metaP.classifyMetaError(400, { error: { code: 613 } }).kind === 'rate_limit');
check('error 200 → permission', metaP.classifyMetaError(403, { error: { code: 200 } }).kind === 'permission');
check('error 100 → invalid', metaP.classifyMetaError(400, { error: { code: 100 } }).kind === 'invalid');
check('HTTP 503 → transient retryable', metaP.classifyMetaError(503, {}).retryable);

section('Google Data Manager payload');
const base = { operatingCustomerId: '123-456-7890', conversionActionId: '987654', eventTime: new Date(Date.now() - 3600_000), transactionId: 'ezy-QualifiedLead-abc', eventSource: 'WEB', enhanced: false };
const g1 = gP.buildDataManagerRequest({ ...base, gclid: 'Cj0KCQjw_test-123', value: 1000, currency: 'inr' });
check('builds with gclid', g1.ok && g1.body.events[0].adIdentifiers.gclid === 'Cj0KCQjw_test-123');
check('customer id dashes removed', g1.body.destinations[0].operatingAccount.accountId === '1234567890');
check('productDestinationId = conversion action', g1.body.destinations[0].productDestinationId === '987654');
check('IST RFC3339 timestamp', /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+05:30$/.test(g1.body.events[0].eventTimestamp));
check('consent adUserData granted, personalization denied', g1.body.events[0].consent.adUserData === 'CONSENT_GRANTED' && g1.body.events[0].consent.adPersonalization === 'CONSENT_DENIED');
check('no encoding without user identifiers', !('encoding' in g1.body));
const g2 = gP.buildDataManagerRequest({ ...base, enhanced: true, email: 'Jo.hn@gmail.com', phone: '9876543210' });
check('enhanced: hashed email/phone + HEX encoding', g2.ok && g2.body.encoding === 'HEX' && g2.body.events[0].userData.userIdentifiers[0].emailAddress === sha('john@gmail.com') && g2.body.events[0].userData.userIdentifiers[1].phoneNumber === sha('+919876543210'));
check('only ONE click id (gclid preferred)', (() => { const r = gP.buildDataManagerRequest({ ...base, gclid: 'gclid_12345', gbraid: 'gbraid_12345' }); return Object.keys(r.body.events[0].adIdentifiers).join() === 'gclid'; })());
check('no identifiers → refused', !gP.buildDataManagerRequest({ ...base }).ok);
check('enhanced=false ignores email (no gclid) → refused', !gP.buildDataManagerRequest({ ...base, email: 'a@b.com' }).ok);
check('invalid customer id refused', !gP.buildDataManagerRequest({ ...base, operatingCustomerId: '123', gclid: 'gclid_12345' }).ok);
check('older than 90 days refused', !gP.buildDataManagerRequest({ ...base, gclid: 'gclid_12345', eventTime: new Date(Date.now() - 91 * 86400_000) }).ok);
check('validateOnly passes through', gP.buildDataManagerRequest({ ...base, gclid: 'gclid_12345', validateOnly: true }).body.validateOnly === true);
check('status SUCCESS → accepted', gP.interpretRequestStatus({ requestStatusPerDestination: [{ requestStatus: 'SUCCESS' }] }).status === 'accepted');
check('status PROCESSING → pending', gP.interpretRequestStatus({ requestStatusPerDestination: [{ requestStatus: 'PROCESSING' }] }).status === 'pending');
check('status FAILED → rejected with reasons', (() => { const r = gP.interpretRequestStatus({ requestStatusPerDestination: [{ requestStatus: 'FAILED', errorInfo: { errorCounts: [{ reason: 'INVALID_GCLID', recordCount: '1' }] } }] }); return r.status === 'rejected' && r.detail.includes('INVALID_GCLID'); })());
check('partial failure parsed with row index', (() => { const e = gP.parsePartialFailure({ partialFailureError: { message: 'x', details: [{ errors: [{ message: 'Bad order id', errorCode: { conversionAdjustmentUploadError: 'ORDER_ID_NOT_FOUND' }, location: { fieldPathElements: [{ fieldName: 'conversion_adjustments', index: 0 }] } }] }] } }); return e[0].index === 0 && e[0].code === 'conversionAdjustmentUploadError.ORDER_ID_NOT_FOUND'; })());
check('retraction request shape', (() => { const r = gP.buildRetractionRequest({ customerId: '1234567890', conversionActionId: '987654', orderId: 'ezy-x', at: new Date() }); return r.body.conversionAdjustments[0].adjustmentType === 'RETRACTION' && r.body.partialFailure === true; })());
check('developer token error → permission', gP.classifyGoogleError(403, { error: { status: 'PERMISSION_DENIED', details: [{ errors: [{ errorCode: { authorizationError: 'DEVELOPER_TOKEN_NOT_APPROVED' } }] }] } }).message.startsWith('Developer token'));
check('429 → rate_limit retryable', gP.classifyGoogleError(429, {}).retryable);
check('401 → auth', gP.classifyGoogleError(401, {}).kind === 'auth');

section('Retry policy, secrets, lead field mapping, settings validation');
check('backoff grows exponentially', retry.backoffMs(1, { random: () => 0.5 }) === 30000 && retry.backoffMs(3, { random: () => 0.5 }) === 120000);
check('backoff capped at 6h', retry.backoffMs(30, { random: () => 0.5 }) === 6 * 3600_000);
check('rate-limited backoff starts 10× higher', retry.backoffMs(1, { rateLimited: true, random: () => 0.5 }) === 300000);
check('dead-letter after 8 attempts', retry.shouldDeadLetter(8) && !retry.shouldDeadLetter(7));
const enc = secrets.encryptSecret('EAAtoken123');
check('secret encrypted (not plaintext) and round-trips', !enc.includes('EAAtoken123') && secrets.decryptSecret(enc) === 'EAAtoken123');
check('tampered ciphertext rejected', (() => { try { secrets.decryptSecret(enc.slice(0, -2) + (enc.endsWith('A') ? 'B' : 'A') + enc.slice(-1)); return false; } catch { return true; } })());
check('redactSecrets strips tokens', !secrets.redactSecrets('url?access_token=EAAabc&x=1 Bearer ya29.zzz').match(/EAAabc|ya29/));
const mapped = lf.mapLeadFields({ id: '1', field_data: [{ name: 'full_name', values: ['Rahul Sharma'] }, { name: 'email', values: ['R@X.com'] }, { name: 'phone_number', values: ['+919876543210'] }, { name: 'pan_number', values: ['ABCDE1234F'] }, { name: 'which_loan_type', values: ['Used Car'] }, { name: 'city', values: ['Bhubaneswar'] }] });
check('Lead Ads fields mapped', mapped.name === 'Rahul Sharma' && mapped.email === 'r@x.com' && mapped.phone === '+919876543210' && mapped.loanType === 'Used Car');
check('identity-like answers withheld from notes', mapped.extraNotes.some((n) => n.startsWith('pan_number: [withheld')) && !mapped.extraNotes.join().includes('ABCDE1234F'));
check('first/last name combined', lf.mapLeadFields({ id: '1', field_data: [{ name: 'first_name', values: ['A'] }, { name: 'last_name', values: ['B'] }] }).name === 'A B');
check('disclaimer consent read by configured key', lf.consentFromDisclaimer({ id: '1', custom_disclaimer_responses: [{ checkbox_key: 'ads_ok', is_checked: '1' }] }, 'ads_ok') === 'granted' && lf.consentFromDisclaimer({ id: '1' }, undefined) === 'unknown');
check('settings: invalid Meta event name rejected', 'error' in settingsMod.sanitizeSettingsUpdate({ eventMappings: [{ crmEvent: 'Lead', meta: { eventName: 'bad name' } }] }));
check('settings: Google enabled without action rejected', 'error' in settingsMod.sanitizeSettingsUpdate({ eventMappings: [{ crmEvent: 'Lead', meta: {}, google: { enabled: true } }] }));
check('settings: unknown event rejected', 'error' in settingsMod.sanitizeSettingsUpdate({ eventMappings: [{ crmEvent: 'Purchase' }] }));
check('settings: non-boolean flags coerced to false', settingsMod.sanitizeSettingsUpdate({ consent: { allowLeadIdOnlyForLeadAds: 'yes' } }).update.consent.allowLeadIdOnlyForLeadAds === false);
check('dashboard rate/costPer null-safe', dashMath.rate(1, 0) === null && dashMath.costPer(null, 5) === null && dashMath.costPer(1000, 4) === 250 && dashMath.rate(1, 3) === 33.3);

section('Search Console / GA4 shaping + GA4 PII guard');
const tot = shape.scTotals([{ clicks: 10, impressions: 100, position: 2 }, { clicks: 0, impressions: 300, position: 10 }]);
check('SC totals: CTR recomputed from sums', tot.clicks === 10 && tot.impressions === 400 && tot.ctr === 0.025);
check('SC totals: position impression-weighted', tot.position === 8);
check('SC totals: no impressions → null CTR/position', shape.scTotals([]).ctr === null && shape.scTotals([]).position === null);
check('previous period same length, immediately before', JSON.stringify(shape.previousPeriod('2026-10-01', '2026-10-10')) === JSON.stringify({ from: '2026-09-21', to: '2026-09-30' }));
check('pctChange null-safe', shape.pctChange(110, 100) === 10 && shape.pctChange(5, 0) === null && shape.pctChange(null, 3) === null);
check('isYmd strict', shape.isYmd('2026-10-01') && !shape.isYmd('2026-10-1') && !shape.isYmd("2026-10-01' OR"));
check('GA4 rows mapped by header names', JSON.stringify(shape.ga4Rows({ dimensionHeaders: [{ name: 'date' }], metricHeaders: [{ name: 'sessions' }], rows: [{ dimensionValues: [{ value: '20261001' }], metricValues: [{ value: '42' }] }] })) === '[{"date":"20261001","sessions":42}]');
check('URL must belong to property (domain + prefix)', shape.urlBelongsToSite('https://www.ezyloan.co.in/x', 'sc-domain:ezyloan.co.in') && !shape.urlBelongsToSite('https://evil.com/?ezyloan.co.in', 'sc-domain:ezyloan.co.in') && shape.urlBelongsToSite('https://www.ezyloan.co.in/a', 'https://www.ezyloan.co.in/') && !shape.urlBelongsToSite('https://ezyloan.co.in.evil.com/', 'https://ezyloan.co.in/'));
const sp = analytics.sanitizeParams({ form_id: 'hero', email: 'a@b.com', user_name: 'Rahul', loan_type: 'Car', note: 'call 98765 43210', other: 'x@y.co', ok: 3 });
const steps0 = setupMod.setupChecklist({ keys: {}, encryptionKey: true, meta: { status: 'disconnected', pages: [] }, google: { status: 'disconnected' }, mappings: [], testMode: { meta: true, google: true } });
check('setup checklist: fresh install → only basics done', steps0.filter((s) => s.done).map((s) => s.id).join() === 'enc,base');
check('setup checklist: http base URL flagged', !setupMod.setupChecklist({ keys: {}, encryptionKey: true, baseUrl: 'http://ezyloan.co.in', meta: { status: 'disconnected', pages: [] }, google: { status: 'disconnected' }, mappings: [], testMode: { meta: true, google: true } }).find((s) => s.id === 'base').done);
const savedOnly = setupMod.setupChecklist({ keys: {}, encryptionKey: true, meta: { status: 'connected', pages: [{ subscribed: true }], datasetId: '1', capiTokenSet: true, capiVerified: false, leadsVerified: false }, google: { status: 'disconnected' }, mappings: [], testMode: { meta: true, google: true } });
check('setup checklist: saved-but-unverified CAPI and Lead Ads are NOT done', !savedOnly.find((s) => s.id === 'meta-capi').done && !savedOnly.find((s) => s.id === 'meta-leads').done);
const steps1 = setupMod.setupChecklist({ keys: { META_APP_ID: true, META_APP_SECRET: true, FACEBOOK_VERIFY_TOKEN: true }, encryptionKey: true, meta: { status: 'connected', pages: [{ subscribed: true }], datasetId: '1', capiTokenSet: true, capiVerified: true, leadsVerified: true, missingScopes: [] }, google: { status: 'disconnected' }, mappings: [{ meta: true, google: false }], testMode: { meta: false, google: true } });
check('setup checklist: Meta fully set up + verified + live', ['meta-keys', 'meta-connect', 'meta-page', 'meta-leads', 'meta-capi', 'map', 'live'].every((id) => steps1.find((s) => s.id === id).done));
check('GA4 params: PII keys and email/phone-like values dropped', JSON.stringify(sp) === '{"form_id":"hero","loan_type":"Car","ok":3}');

// ───────────────────────────── Part 2: integration ─────────────────────────────
function findMongod() {
  if (process.env.MONGOD_BIN && fs.existsSync(process.env.MONGOD_BIN)) return process.env.MONGOD_BIN;
  const dir = path.join(os.homedir(), '.cache', 'mongodb-binaries');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => /^mongod.*?(\.exe)?$/.test(n) && !n.endsWith('.md5'));
  return f ? path.join(dir, f) : null;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const bin = findMongod();
let mongod = null;
let tmp = null;
if (!bin) {
  section('Integration tests: SKIPPED — no mongod binary (set MONGOD_BIN)');
  failures.push('integration skipped (no mongod)');
} else {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ezy-mkt-'));
  const port = MONGO_PORT;
  mongod = spawn(bin, ['--dbpath', tmp, '--port', String(port), '--bind_ip', '127.0.0.1', '--quiet'], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    const ok = await new Promise((r) => { const s = net.connect(port, '127.0.0.1', () => { s.end(); r(true); }); s.on('error', () => r(false)); });
    if (ok) break;
    await sleep(250);
  }
  try {
    await integration();
  } catch (e) {
    check('integration suite crashed', false, e?.stack || String(e));
  }
}

async function integration() {
  // ── fetch mock: routes Meta/Google URLs to scripted handlers, records calls ──
  const calls = [];
  const handlers = [];
  const realFetch = globalThis.fetch;
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  globalThis.fetch = async (url, init = {}) => {
    const u = String(url);
    const body = typeof init.body === 'string' ? init.body : '';
    calls.push({ url: u, method: init.method || 'GET', body, headers: init.headers || {} });
    for (const h of handlers) {
      if (h.match(u, init)) return h.respond(u, init, body);
    }
    if (u.startsWith('http://127.0.0.1') || u.startsWith('mongodb')) return realFetch(url, init);
    return json(599, { error: { message: `unmocked ${u.split('?')[0]}` } });
  };
  const on = (match, respond) => {
    const h = { match: typeof match === 'string' ? (u) => u.includes(match) : match, respond };
    handlers.unshift(h);
    return () => handlers.splice(handlers.indexOf(h), 1);
  };
  const reset = () => { handlers.length = 0; calls.length = 0; };

  const mongoose = (await import('mongoose')).default;
  const { connectDB } = await import('../lib/db.ts');
  await connectDB();
  const { Lead } = await import('../lib/models/Lead.ts');
  const { LoanApplication } = await import('../lib/models/LoanApplication.ts');
  const { LeadAttribution } = await import('../lib/models/LeadAttribution.ts');
  const { ConversionEvent } = await import('../lib/models/ConversionEvent.ts');
  const { MarketingSettings } = await import('../lib/models/MarketingSettings.ts');
  const { MarketingConnection } = await import('../lib/models/MarketingConnection.ts');
  const { MetaLeadReceipt } = await import('../lib/models/MetaLeadReceipt.ts');
  const { AdMetricDaily } = await import('../lib/models/MarketingSupport.ts');
  const { User } = await import('../lib/models/User.ts');
  await Promise.all([ConversionEvent.init(), LeadAttribution.init(), MetaLeadReceipt.init(), MarketingSettings.init()]);
  const { createLeadFromWebhook } = await import('../lib/ingest.ts');
  const lifecycle = await import('../lib/marketing/lifecycle.ts');
  const ledger = await import('../lib/marketing/ledger.ts');
  const worker = await import('../lib/marketing/worker.ts');
  const settings = await import('../lib/marketing/settings.ts');
  const { encryptSecret } = await import('../lib/marketing/secrets.ts');
  const { createSession } = await import('../lib/auth.ts');
  const { AUTH_COOKIE } = await import('../lib/authCookie.ts');
  const { NextRequest } = await import('next/server');

  async function setMappings(over = {}) {
    await settings.getSettings(true);
    const maps = ['Lead', 'QualifiedLead', 'SubmitApplication', 'ApprovedApplication', 'LoanDisbursed'].map((e) => ({
      crmEvent: e,
      meta: { enabled: true, eventName: e },
      google: { enabled: e !== 'Lead', conversionActionId: '555' + e.length, enhanced: true },
      value: e === 'LoanDisbursed' ? 5000 : e === 'QualifiedLead' ? 300 : undefined,
    }));
    await MarketingSettings.updateOne({ key: 'default' }, { $set: { eventMappings: maps, testMode: { meta: false, google: false }, consent: { allowLeadIdOnlyForLeadAds: false, websiteConsentTextVersion: 'v1' }, ...over } });
    settings.invalidateSettingsCache();
  }
  async function connectPlatforms() {
    await MarketingConnection.updateOne({ provider: 'meta' }, { $set: { status: 'connected', scopes: ['leads_retrieval', 'pages_show_list', 'pages_manage_metadata', 'pages_read_engagement'], tokenEnc: encryptSecret('EAAuser'), 'meta.datasetId': '111222333444', 'meta.capiTokenEnc': encryptSecret('EAAcapitoken_secret_value'), 'meta.pages': [{ id: '999000111', name: 'EzyLoan', tokenEnc: encryptSecret('EAApagetoken'), subscribed: true, forms: [{ id: '777', name: 'Car loan form' }] }] } }, { upsert: true });
    await MarketingConnection.updateOne({ provider: 'google' }, { $set: { status: 'connected', refreshTokenEnc: encryptSecret('1//refresh'), tokenEnc: encryptSecret('ya29.access'), tokenExpiresAt: new Date(Date.now() + 3600_000), 'google.customerId': '1234567890', 'google.currency': 'INR' } }, { upsert: true });
  }
  const website = (consentVal, extra = {}) => ({
    crmSource: 'Website Apply Now',
    attribution: { lastTouch: { gclid: 'Cj0KCQjw_gclid-1', utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'car-loans' }, firstTouch: { utmSource: 'google', utmMedium: 'cpc', utmCampaign: 'car-loans' }, fbp: 'fb.1.1700000000000.42', pixelEventId: 'lead_pixel_abc123', eventSourceUrl: 'https://www.ezyloan.co.in/apply-now' },
    consent: { adMeasurement: consentVal, source: 'website_apply_form', collectedAt: new Date() },
    clientIp: '203.0.113.7',
    userAgent: 'Mozilla/5.0 test',
    ...extra,
  });
  const metaCapiOk = () => on((u) => u.includes('/111222333444/events'), () => json(200, { events_received: 1, fbtrace_id: 'TRACE1' }));
  const googleOk = () => on('datamanager.googleapis.com/v1/events:ingest', () => json(200, { requestId: 'req-1' }));
  const drain = async () => { for (let i = 0; i < 5; i++) await worker.processDueEvents(50); };

  await connectPlatforms();
  await setMappings();

  section('Lead capture → attribution → ledger (consent granted)');
  reset();
  const r1 = await createLeadFromWebhook({ name: 'Test One', email: 'one@example.com', phone: '9876500001', message: 'm', source: 'Website Apply Now', marketing: website('granted') });
  const a1 = await LeadAttribution.findOne({ leadId: r1.leadId }).lean();
  check('lead created + attribution row', r1.created && !!a1);
  check('channel google_ads, first/last touch stored', a1.channel === 'google_ads' && a1.firstTouch.utmCampaign === 'car-loans' && a1.lastTouch.gclid === 'Cj0KCQjw_gclid-1');
  check('browser ip/UA stored only because consent granted', a1.clientIp === '203.0.113.7' && a1.userAgent === 'Mozilla/5.0 test');
  const ev1 = await ConversionEvent.find({ leadId: r1.leadId }).lean();
  check('Lead → 1 Meta event (Google Lead mapping off)', ev1.length === 1 && ev1[0].platform === 'meta' && ev1[0].crmEvent === 'Lead');
  check('website Lead uses the Pixel eventID for dedup + action_source website', ev1[0].eventId === 'lead_pixel_abc123' && ev1[0].actionSource === 'website');
  check('nothing sent synchronously (queued only)', calls.length === 0);

  section('Repeat enquiry / duplicate webhook');
  const r1b = await createLeadFromWebhook({ name: 'Test One', email: 'one@example.com', phone: '9876500001', source: 'Website Contact Form', marketing: website('granted', { attribution: { lastTouch: { fbclid: 'IwAR_second_touch', utmSource: 'facebook', utmMedium: 'paid_social' } } }) });
  const a1b = await LeadAttribution.findOne({ leadId: r1.leadId }).lean();
  check('same person → same lead, no new Lead event', !r1b.created && r1b.leadId === r1.leadId && (await ConversionEvent.countDocuments({ leadId: r1.leadId })) === 1);
  check('first touch preserved, last touch updated, touches=2', a1b.firstTouch.utmCampaign === 'car-loans' && a1b.lastTouch.fbclid === 'IwAR_second_touch' && a1b.touches === 2);
  check('later non-Google touch does not erase the Google click id', a1b.lastAdClick.fbclid === 'IwAR_second_touch' && a1b.lastAdClick.gclid === 'Cj0KCQjw_gclid-1');
  check('acquisition channel kept; latest channel tracked separately', a1b.channel === 'google_ads' && a1b.lastChannel === 'meta_ads');
  const r1c = await createLeadFromWebhook({ name: 'X', email: 'other@example.com', source: 'Facebook Lead Ads', sourceMessageId: 'fb_dup_1' });
  const r1d = await createLeadFromWebhook({ name: 'X', email: 'other@example.com', source: 'Facebook Lead Ads', sourceMessageId: 'fb_dup_1' });
  check('same sourceMessageId redelivered → one lead', r1c.leadId === r1d.leadId && (await Lead.countDocuments({ sourceMessageId: 'fb_dup_1' })) === 1);

  section('Consent enforcement');
  const r2 = await createLeadFromWebhook({ name: 'No Consent', email: 'two@example.com', phone: '9876500002', source: 'Website Apply Now', marketing: website('denied') });
  const a2 = await LeadAttribution.findOne({ leadId: r2.leadId }).lean();
  const ev2 = await ConversionEvent.findOne({ leadId: r2.leadId }).lean();
  check('declined consent → event recorded as blocked_consent (not dropped, not sent)', ev2.status === 'blocked_consent');
  check('declined consent → no IP/UA stored', !a2.clientIp && !a2.userAgent);
  const r3 = await createLeadFromWebhook({ name: 'Unknown', email: 'three@example.com', phone: '9876500003', source: 'Website Contact Form', marketing: website(undefined) });
  check('no consent answer → blocked_consent', (await ConversionEvent.findOne({ leadId: r3.leadId }).lean()).status === 'blocked_consent');

  section('Lifecycle: status changes and loans are idempotent');
  await lifecycle.onLeadStatusChanged(r1.leadId, 'New', '1. Interested');
  await lifecycle.onLeadStatusChanged(r1.leadId, 'Warm', '1. Interested');
  await lifecycle.onLeadStatusChanged(r1.leadId, '1. Interested', 'Warm');
  check('QualifiedLead queued once per platform despite repeated changes', (await ConversionEvent.countDocuments({ leadId: r1.leadId, crmEvent: 'QualifiedLead' })) === 2);
  await lifecycle.onLeadStatusChanged(r1.leadId, 'New', 'Cold');
  check('non-qualifying status → no event', (await ConversionEvent.countDocuments({ leadId: r1.leadId, crmEvent: 'QualifiedLead' })) === 2);
  const loan = await LoanApplication.create({ fullName: 'Test One', phoneNumber: '9876500001', email: 'one@example.com', loanType: 'Used Car Loan', employmentType: 'Salaried', city: 'Bhubaneswar', pincode: '751001', cibilScore: '750' });
  await lifecycle.onLoanCreated(loan.toObject());
  await lifecycle.onLoanCreated(loan.toObject());
  check('SubmitApplication linked to lead by phone, once per platform', (await ConversionEvent.countDocuments({ loanId: loan._id, crmEvent: 'SubmitApplication', leadId: r1.leadId })) === 2);
  const before = loan.toObject();
  await lifecycle.onLoanChanged(before, { ...before, status: 'approved' });
  await lifecycle.onLoanChanged({ ...before, status: 'approved' }, { ...before, status: 'approved', pipelineStage: 'Sanctioned' });
  check('approve then sanction → ApprovedApplication once per platform', (await ConversionEvent.countDocuments({ loanId: loan._id, crmEvent: 'ApprovedApplication' })) === 2);
  await lifecycle.onLoanChanged({ ...before, pipelineStage: 'Sanctioned' }, { ...before, pipelineStage: 'Disbursed' });
  check('disbursed → LoanDisbursed with configured value', (await ConversionEvent.find({ loanId: loan._id, crmEvent: 'LoanDisbursed' }).lean()).every((e) => e.value === 5000));
  const aL = await LeadAttribution.findOne({ leadId: r1.leadId }).lean();
  check('lifecycle timestamps recorded on attribution', aL.lifecycle.qualifiedAt && aL.lifecycle.applicationAt && aL.lifecycle.approvedAt && aL.lifecycle.disbursedAt);
  check('loan never modified by hooks', (await LoanApplication.findById(loan._id).lean()).status === 'pending');

  section('Ledger concurrency');
  const subj = { kind: 'lead', id: new mongoose.Types.ObjectId().toString() };
  const results = await Promise.all(Array.from({ length: 12 }, () => ledger.enqueueConversion({ platform: 'meta', crmEvent: 'QualifiedLead', subject: subj, leadId: subj.id, eventTime: new Date(), testMode: false, consentState: 'granted', consentReason: 'x', allowed: true })));
  check('12 concurrent enqueues → exactly 1 row', results.filter((r) => r.created).length === 1 && (await ConversionEvent.countDocuments({ idempotencyKey: ledger.idempotencyKey({ platform: 'meta', crmEvent: 'QualifiedLead', subject: subj, testMode: false }) })) === 1);
  check('test-mode key distinct from production key', ledger.idempotencyKey({ platform: 'meta', crmEvent: 'Lead', subject: subj, testMode: true }) !== ledger.idempotencyKey({ platform: 'meta', crmEvent: 'Lead', subject: subj, testMode: false }));
  await ConversionEvent.deleteOne({ leadId: subj.id });

  section('Worker: Meta Conversions API delivery');
  reset();
  metaCapiOk();
  googleOk();
  await drain();
  const metaCall = calls.find((c) => c.url.includes('/111222333444/events') && c.body.includes('lead_pixel_abc123'));
  const metaBody = metaCall ? new URLSearchParams(metaCall.body) : null;
  const sentEvent = metaBody ? JSON.parse(metaBody.get('data'))[0] : null;
  check('website Lead sent to Meta', !!sentEvent && sentEvent.event_name === 'Lead' && sentEvent.action_source === 'website');
  check('CAPI token sent, no appsecret_proof (Events Manager token)', metaBody.get('access_token') === 'EAAcapitoken_secret_value' && !metaBody.has('appsecret_proof'));
  check('no raw PII in the request body', !metaCall.body.includes('one@example.com') && !metaCall.body.includes('9876500001'));
  check('hashed em matches spec', sentEvent.user_data.em[0] === sha('one@example.com'));
  check('production event has no test_event_code', !metaBody.has('test_event_code'));
  const sentMeta = await ConversionEvent.find({ platform: 'meta', status: 'sent' }).lean();
  check('Meta events marked sent with fbtrace id', sentMeta.length >= 4 && sentMeta.every((e) => e.platformTraceId === 'TRACE1'));
  check('blocked_consent events never sent', !calls.some((c) => c.body.includes(sha('two@example.com'))));
  const gCalls = calls.filter((c) => c.url.includes('events:ingest'));
  const gBody = JSON.parse(gCalls.find((c) => c.body.includes('Cj0KCQjw_gclid-1'))?.body || '{"events":[{}]}');
  check('Google uploads via Data Manager with Bearer token, no developer token needed', gCalls.length >= 4 && gCalls[0].headers.Authorization === 'Bearer ya29.access');
  check('Google payload: gclid + transactionId stable + hashed identifiers', gBody.events[0].adIdentifiers.gclid === 'Cj0KCQjw_gclid-1' && gBody.events[0].transactionId.startsWith('ezy-') && gBody.encoding === 'HEX' && !gCalls[0].body.includes('one@example.com'));
  check('Google events "submitted" (not claimed as attributed)', (await ConversionEvent.countDocuments({ platform: 'google', status: 'submitted', platformRequestId: 'req-1' })) >= 4);
  check('no loan amount / income / CIBIL sent anywhere', !calls.some((c) => /cibil|750"|Salaried|disbursedAmount|monthlyIncome/i.test(c.body)));

  section('Worker: Google verification');
  reset();
  await ConversionEvent.updateMany({ status: 'submitted' }, { $set: { nextAttemptAt: new Date(Date.now() - 1000) } });
  let n = 0;
  on('requestStatus:retrieve', () => json(200, { requestStatusPerDestination: [{ requestStatus: n++ === 0 ? 'FAILED' : 'SUCCESS', errorInfo: { errorCounts: [{ reason: 'INVALID_GCLID', recordCount: '1' }] } }] }));
  await worker.processDueEvents(50);
  const verified = await ConversionEvent.find({ platform: 'google', platformRequestId: 'req-1' }).lean();
  check('one rejected with reason, rest accepted', verified.filter((e) => e.status === 'rejected' && /INVALID_GCLID/.test(e.lastError)).length === 1 && verified.filter((e) => e.status === 'accepted').length === verified.length - 1);
  check('accepted message says processed ≠ attributed', verified.find((e) => e.status === 'accepted').history.at(-1).message.includes('≠ attributed'));

  section('Worker: failures, backoff, dead-letter, restart recovery, concurrency');
  const mk = async (over = {}) => {
    const id = new mongoose.Types.ObjectId().toString();
    await LeadAttribution.create({ leadId: id, channel: 'direct', consent: { adMeasurement: 'granted' }, lifecycle: {} });
    await Lead.collection.insertOne({ _id: new mongoose.Types.ObjectId(id), name: 'Worker Test', email: `w${id}@example.com`, phone: '9876511111', status: 'New', createdAt: new Date() });
    await ledger.enqueueConversion({ platform: 'meta', crmEvent: 'QualifiedLead', subject: { kind: 'lead', id }, leadId: id, eventTime: new Date(), testMode: false, platformEventName: 'QualifiedLead', consentState: 'granted', consentReason: 'ok', sendMode: 'full', allowed: true, actionSource: 'system_generated', ...over });
    return ConversionEvent.findOne({ leadId: id });
  };
  reset();
  on('/111222333444/events', () => json(500, { error: { code: 2, message: 'Service temporarily unavailable', is_transient: true } }));
  const e1 = await mk();
  await worker.processDueEvents(50);
  const e1a = await ConversionEvent.findById(e1._id).lean();
  check('transient 500 → retry with future nextAttemptAt + error recorded', e1a.status === 'retry' && e1a.nextAttemptAt > new Date() && /temporarily/.test(e1a.lastError) && e1a.attempts === 1);
  await ConversionEvent.updateOne({ _id: e1._id }, { $set: { attempts: 7, nextAttemptAt: new Date(0) } });
  await worker.processDueEvents(50);
  const e1b = await ConversionEvent.findById(e1._id).lean();
  check('8th failure → dead-lettered (kept, not dropped)', e1b.status === 'dead' && /Dead-lettered/.test(e1b.lastError));
  reset();
  on('/111222333444/events', () => json(400, { error: { code: 190, message: 'Error validating access token: Session has expired' } }));
  const e2 = await mk();
  await worker.processDueEvents(50);
  check('expired token → failed (no retry storm) + connection marked expired', (await ConversionEvent.findById(e2._id).lean()).status === 'failed' && (await MarketingConnection.findOne({ provider: 'meta' }).lean()).status === 'expired');
  await MarketingConnection.updateOne({ provider: 'meta' }, { $set: { status: 'connected' } });
  reset();
  on('/111222333444/events', () => json(400, { error: { code: 613, message: 'Calls to this api have exceeded the rate limit.' } }));
  const e3 = await mk();
  await worker.processDueEvents(50);
  const e3a = await ConversionEvent.findById(e3._id).lean();
  check('rate limit → retry with long backoff (≥ 4 min)', e3a.status === 'retry' && e3a.nextAttemptAt - Date.now() > 4 * 60_000);
  // Crash recovery: an event stuck "processing" with an expired lease is reclaimed.
  reset();
  metaCapiOk();
  const e4 = await mk();
  await ConversionEvent.updateOne({ _id: e4._id }, { $set: { status: 'processing', lockedUntil: new Date(Date.now() - 1000), lockId: 'dead-worker', attempts: 1 } });
  const e5 = await mk();
  await ConversionEvent.updateOne({ _id: e5._id }, { $set: { status: 'processing', lockedUntil: new Date(Date.now() + 60_000), lockId: 'live-worker' } });
  await worker.processDueEvents(50);
  check('expired lease reclaimed and delivered', (await ConversionEvent.findById(e4._id).lean()).status === 'sent');
  check('live lease left alone', (await ConversionEvent.findById(e5._id).lean()).status === 'processing');
  await ConversionEvent.updateOne({ _id: e5._id }, { $set: { status: 'sent', lockedUntil: null } });
  // Concurrency: parallel worker passes deliver each event exactly once.
  reset();
  metaCapiOk();
  const batch = await Promise.all(Array.from({ length: 6 }, () => mk()));
  await Promise.all([worker.processDueEvents(50), worker.processDueEvents(50), worker.processDueEvents(50)]);
  const sentIds = calls.filter((c) => c.url.includes('/events')).map((c) => JSON.parse(new URLSearchParams(c.body).get('data'))[0].event_id);
  check('3 concurrent workers: each event sent exactly once', sentIds.length === 6 && new Set(sentIds).size === 6 && (await ConversionEvent.countDocuments({ _id: { $in: batch.map((b) => b._id) }, status: 'sent' })) === 6);
  // Consent withdrawn after queueing is honoured at send time.
  reset();
  metaCapiOk();
  const e6 = await mk();
  await LeadAttribution.updateOne({ leadId: e6.leadId }, { $set: { 'consent.adMeasurement': 'denied' } });
  await worker.processDueEvents(50);
  check('consent withdrawn after queueing → blocked at send time, nothing sent', (await ConversionEvent.findById(e6._id).lean()).status === 'blocked_consent' && calls.length === 0);

  section('Test mode');
  reset();
  metaCapiOk();
  on('events:ingest', (u, i, b) => json(200, JSON.parse(b).validateOnly ? {} : { requestId: 'should-not-happen' }));
  await setMappings({ testMode: { meta: true, metaTestEventCode: 'TEST12345', google: true } });
  const t1 = await createLeadFromWebhook({ name: 'Test Mode', email: 'tm@example.com', phone: '9876500009', source: 'Website Apply Now', marketing: website('granted') });
  await lifecycle.onLeadStatusChanged(t1.leadId, 'New', '1. Interested');
  await drain();
  const tEvents = await ConversionEvent.find({ leadId: t1.leadId }).lean();
  const tMetaCall = calls.find((c) => c.url.includes('/events'));
  check('test events flagged and keyed separately', tEvents.length === 3 && tEvents.every((e) => e.testMode && e.idempotencyKey.endsWith(':test')));
  check('Meta test events carry test_event_code', new URLSearchParams(tMetaCall.body).get('test_event_code') === 'TEST12345');
  check('Google test mode uses validateOnly and records "nothing ingested"', JSON.parse(calls.find((c) => c.url.includes('events:ingest')).body).validateOnly === true && tEvents.find((e) => e.platform === 'google').lastError.includes('nothing was ingested'));
  await setMappings();

  section('Meta Lead Ads webhook (signed, duplicate delivery, outage recovery)');
  reset();
  const route = await import('../app/api/webhook/facebook/route.ts');
  let graphFail = true;
  on((u) => u.includes('graph.facebook.com') && u.includes('/5550001'), () =>
    graphFail
      ? json(500, { error: { code: 2, message: 'Temporary', is_transient: true } })
      : json(200, { id: '5550001', created_time: new Date().toISOString(), field_data: [{ name: 'full_name', values: ['Lead Ad Person'] }, { name: 'email', values: ['leadad@example.com'] }, { name: 'phone_number', values: ['+919876522222'] }], form_id: '777', ad_id: '888', campaign_id: '321', campaign_name: 'Odisha Car Loans' })
  );
  const payload = JSON.stringify({ object: 'page', entry: [{ id: '999000111', changes: [{ field: 'leadgen', value: { leadgen_id: '5550001', page_id: '999000111', form_id: '777', ad_id: '888', created_time: Math.floor(Date.now() / 1000) } }] }] });
  const sign = (b, s = process.env.META_APP_SECRET) => 'sha256=' + crypto.createHmac('sha256', s).update(b).digest('hex');
  const post = (b, sig) => route.POST(new NextRequest('https://www.ezyloan.co.in/api/webhook/facebook', { method: 'POST', body: b, headers: { 'x-hub-signature-256': sig, 'content-type': 'application/json' } }));
  check('bad signature → 403', (await post(payload, sign(payload, 'b'.repeat(32)))).status === 403);
  check('signed delivery → 200', (await post(payload, sign(payload))).status === 200);
  const rc = await MetaLeadReceipt.findOne({ leadgenId: '5550001' }).lean();
  check('Graph outage: receipt kept for retry, NO empty lead created', rc.status === 'retry' && (await Lead.countDocuments({ sourceMessageId: 'fb_5550001' })) === 0);
  check('redelivery → 200, still one receipt (deliveries=2)', (await post(payload, sign(payload))).status === 200 && (await MetaLeadReceipt.countDocuments({ leadgenId: '5550001' })) === 1 && (await MetaLeadReceipt.findOne({ leadgenId: '5550001' }).lean()).deliveries === 2);
  graphFail = false;
  const { processDueReceipts } = await import('../lib/marketing/meta/leads.ts');
  await MetaLeadReceipt.updateOne({ leadgenId: '5550001' }, { $set: { nextAttemptAt: new Date(0) } });
  await processDueReceipts(10);
  const fbLead = await Lead.findOne({ sourceMessageId: 'fb_5550001' }).lean();
  const fbAttr = fbLead ? await LeadAttribution.findOne({ leadId: fbLead._id }).lean() : null;
  check('worker retry fetched the lead → CRM lead with real fields', fbLead?.name === 'Lead Ad Person' && fbLead.email === 'leadad@example.com' && fbLead.source === 'Facebook Lead Ads');
  check('Lead Ads attribution: leadgen/page/form/ad/campaign ids', fbAttr?.meta.leadgenId === '5550001' && fbAttr.meta.campaignName === 'Odisha Car Loans' && fbAttr.meta.formName === 'Car loan form' && fbAttr.channel === 'meta_lead_ads');
  check('Graph called with Page token + appsecret_proof', calls.some((c) => c.url.includes('/5550001?') && c.url.includes('appsecret_proof=') && c.url.includes('access_token=EAApagetoken')));
  check('Lead Ads lead w/o consent: Meta Lead event blocked (policy off)', (await ConversionEvent.findOne({ leadId: fbLead._id, platform: 'meta' }).lean()).status === 'blocked_consent');
  await post(payload, sign(payload));
  check('redelivery after processing → still exactly one lead', (await Lead.countDocuments({ sourceMessageId: 'fb_5550001' })) === 1);

  section('Lead Ads lead_id-only policy');
  reset();
  metaCapiOk();
  await setMappings({ consent: { allowLeadIdOnlyForLeadAds: true, websiteConsentTextVersion: 'v1' } });
  await lifecycle.onLeadStatusChanged(String(fbLead._id), 'New', '1. Interested');
  await drain();
  const lidCall = calls.find((c) => c.url.includes('/events'));
  const lidEvent = JSON.parse(new URLSearchParams(lidCall.body).get('data'))[0];
  check('sends only lead_id (no hashed PII) with crm custom_data', JSON.stringify(Object.keys(lidEvent.user_data)) === '["lead_id"]' && lidEvent.user_data.lead_id === '5550001' && lidEvent.custom_data.event_source === 'crm');
  check('Google event for the same lead stays blocked', (await ConversionEvent.findOne({ leadId: fbLead._id, platform: 'google', crmEvent: 'QualifiedLead' }).lean()).status === 'blocked_consent');
  await setMappings();

  section('Admin authorization + secret protection');
  const admin = await User.create({ username: 'mkt-admin', password: 'Password12345', role: 'admin' });
  const emp = await User.create({ username: 'mkt-emp', password: 'Password12345', role: 'employee', permissions: ['leads'] });
  const mktEmp = await User.create({ username: 'mkt-viewer', password: 'Password12345', role: 'employee', permissions: ['marketing'] });
  const cookieFor = async (u) => `${AUTH_COOKIE}=${await createSession(String(u._id), {})}`;
  const [adminC, empC, viewC] = await Promise.all([cookieFor(admin), cookieFor(emp), cookieFor(mktEmp)]);
  const call = async (mod, method, url, cookie, body) => {
    const h = { host: 'www.ezyloan.co.in' };
    if (cookie) h.cookie = cookie;
    if (body) h['content-type'] = 'application/json';
    const req = new NextRequest(`https://www.ezyloan.co.in${url}`, { method, headers: h, body: body ? JSON.stringify(body) : undefined });
    return mod[method](req, { params: Promise.resolve({ id: String(new mongoose.Types.ObjectId()) }) });
  };
  const statusRoute = await import('../app/api/marketing/status/route.ts');
  const settingsRoute = await import('../app/api/marketing/settings/route.ts');
  const eventsRoute = await import('../app/api/marketing/events/route.ts');
  const exportRoute = await import('../app/api/marketing/export/route.ts');
  const dashRoute = await import('../app/api/marketing/dashboard/route.ts');
  const metaAssets = await import('../app/api/marketing/meta/assets/route.ts');
  const workerRoute = await import('../app/api/marketing/worker/route.ts');
  const connectRoute = await import('../app/api/marketing/meta/connect/route.ts');
  const callbackRoute = await import('../app/api/marketing/meta/callback/route.ts');
  check('status: anonymous → 401', (await call(statusRoute, 'GET', '/api/marketing/status')).status === 401);
  check('status: employee without marketing tab → 403', (await call(statusRoute, 'GET', '/api/marketing/status', empC)).status === 403);
  const viewRes = await call(statusRoute, 'GET', '/api/marketing/status', viewC);
  const viewText = await viewRes.text();
  check('status: marketing employee → 200', viewRes.status === 200);
  check('status response contains no tokens or ciphertext', !/enc:v1:|EAA|ya29|1\/\/refresh|capitoken|tokenEnc|refreshTokenEnc/.test(viewText));
  check('settings PUT: marketing employee → 403 (admin only)', (await call(settingsRoute, 'PUT', '/api/marketing/settings', viewC, { currency: 'USD' })).status === 403);
  check('settings PUT: admin, invalid → 400', (await call(settingsRoute, 'PUT', '/api/marketing/settings', adminC, { currency: 'rupees' })).status === 400);
  check('settings PUT: admin, valid → 200', (await call(settingsRoute, 'PUT', '/api/marketing/settings', adminC, { qualifiedStatuses: ['1. Interested', 'Warm'] })).status === 200);
  await setMappings();
  check('bulk retry: marketing employee → 403', (await call(eventsRoute, 'POST', '/api/marketing/events', viewC, { action: 'retry_all', status: 'dead' })).status === 403);
  const retryRes = await call(eventsRoute, 'POST', '/api/marketing/events', adminC, { action: 'retry_all', status: 'dead' });
  check('bulk retry dead → requeued by admin', retryRes.status === 200 && (await retryRes.json()).requeued >= 1);
  check('export: marketing employee → 403', (await call(exportRoute, 'GET', '/api/marketing/export?type=attribution', viewC)).status === 403);
  const exp = await call(exportRoute, 'GET', '/api/marketing/export?type=attribution', adminC);
  const csv = await exp.text();
  check('export CSV masks phone/email, omits click ids & IPs', exp.status === 200 && !csv.includes('9876500001') && !csv.includes('one@example.com') && !csv.includes('Cj0KCQjw_gclid-1') && !csv.includes('203.0.113.7') && csv.includes('o•••@example.com'));
  check('Meta assets: employee → 403', (await call(metaAssets, 'POST', '/api/marketing/meta/assets', viewC, { action: 'healthcheck' })).status === 403);
  check('worker: anonymous → 401 (no cron secret)', (await call(workerRoute, 'POST', '/api/marketing/worker')).status === 401);
  check('cross-origin admin POST refused (CSRF)', (await settingsRoute.PUT(new NextRequest('https://www.ezyloan.co.in/api/marketing/settings', { method: 'PUT', headers: { cookie: adminC, origin: 'https://evil.example', host: 'www.ezyloan.co.in', 'content-type': 'application/json' }, body: '{}' }))).status === 403);

  section('OAuth state (CSRF / replay)');
  const conn = await call(connectRoute, 'GET', '/api/marketing/meta/connect', adminC);
  const loc = new URL(conn.headers.get('location'));
  const state = loc.searchParams.get('state');
  check('connect redirects to facebook.com dialog with state + fixed redirect_uri', loc.hostname === 'www.facebook.com' && state?.length >= 40 && loc.searchParams.get('redirect_uri') === 'https://www.ezyloan.co.in/api/marketing/meta/callback');
  const badState = await call(callbackRoute, 'GET', `/api/marketing/meta/callback?code=x&state=forged`, adminC);
  check('forged state → rejected, redirect to admin with error', new URL(badState.headers.get('location')).searchParams.get('error') === 'meta_state_invalid');
  const admin2 = await User.create({ username: 'mkt-admin2', password: 'Password12345', role: 'admin' });
  const otherSession = await call(callbackRoute, 'GET', `/api/marketing/meta/callback?code=x&state=${state}`, await cookieFor(admin2));
  check('state from another admin session → rejected', new URL(otherSession.headers.get('location')).searchParams.get('error') === 'meta_state_invalid');
  const conn2 = await call(connectRoute, 'GET', '/api/marketing/meta/connect', adminC);
  const state2 = new URL(conn2.headers.get('location')).searchParams.get('state');
  reset();
  on('/oauth/access_token', () => json(400, { error: { code: 100, message: 'Invalid verification code format.' } }));
  const used = await call(callbackRoute, 'GET', `/api/marketing/meta/callback?code=bad&state=${state2}`, adminC);
  check('valid state + bad code → error redirect (no fake Connected)', new URL(used.headers.get('location')).searchParams.get('error') === 'meta_invalid');
  const replay = await call(callbackRoute, 'GET', `/api/marketing/meta/callback?code=bad&state=${state2}`, adminC);
  check('state is single-use (replay rejected)', new URL(replay.headers.get('location')).searchParams.get('error') === 'meta_state_invalid');
  check('callback anonymous → 401', (await call(callbackRoute, 'GET', `/api/marketing/meta/callback?state=x`)).status === 401);

  section('Dashboard aggregation + filters');
  await AdMetricDaily.create({ provider: 'meta', accountId: 'act_1', date: new Date(Date.now() + 330 * 60_000).toISOString().slice(0, 10), campaignId: '321', campaignName: 'Odisha Car Loans', spend: 1000, currency: 'INR', impressions: 5000, clicks: 100, platformLeads: 7, fetchedAt: new Date() });
  const dres = await call(dashRoute, 'GET', '/api/marketing/dashboard', viewC);
  const d = await dres.json();
  const totalLeads = await Lead.countDocuments();
  const metaLeads = await LeadAttribution.countDocuments({ channel: { $in: ['meta_lead_ads', 'meta_ads', 'meta_click'] } });
  check('dashboard 200 for marketing viewer', dres.status === 200);
  check('CRM total = leads in DB for range', d.crm.totals.leads === totalLeads);
  check('qualified counts real status/lifecycle', d.crm.totals.qualified >= 2);
  check('approval/disbursal funnel from lifecycle', d.crm.totals.approvals === 1 && d.crm.totals.disbursements === 1);
  check('loan pipeline from LoanApplication (status untouched → 0 approved)', d.crm.loanPipeline.applications === 1 && d.crm.loanPipeline.approved === 0);
  check('Meta spend platform-reported; CPL = spend ÷ CRM Meta leads', d.platform.meta.spend === 1000 && d.platform.meta.crmLeads === metaLeads && d.platform.meta.cpl === Math.round((1000 / metaLeads) * 100) / 100, JSON.stringify({ meta: d.platform.meta, ch: d.crm.byChannel.map((c) => [c._id, c.leads]) }));
  check('Google spend unavailable → null, not 0', d.platform.google.spend === null && d.platform.google.cpl === null);
  check('platform conversions kept separate from CRM counts', d.platform.campaigns[0].platformConversions === 7);
  const camp = d.crm.byCampaign.find((c) => c.campaign === 'Odisha Car Loans');
  check('campaign row joined to spend only by Meta campaign id', camp?.spend === 1000 && camp.spendJoin === 'meta_campaign_id');
  check('ROAS uses configured values', typeof d.platform.meta.roas === 'number' || d.platform.meta.roas === null);
  const dch = await (await call(dashRoute, 'GET', '/api/marketing/dashboard?channel=google_ads', viewC)).json();
  check('channel filter', dch.crm.totals.leads === (await LeadAttribution.countDocuments({ channel: 'google_ads' })));
  const dst = await (await call(dashRoute, 'GET', '/api/marketing/dashboard?status=1.%20Interested', viewC)).json();
  check('status filter', dst.crm.totals.leads === (await Lead.countDocuments({ status: '1. Interested' })));
  const dold = await (await call(dashRoute, 'GET', '/api/marketing/dashboard?from=2020-01-01&to=2020-01-31', viewC)).json();
  check('date range excludes current leads', dold.crm.totals.leads === 0);
  check('inverted range → 400', (await call(dashRoute, 'GET', '/api/marketing/dashboard?from=2026-02-01&to=2026-01-01', viewC)).status === 400);

  section('Search Console + GA4 routes (mocked Google APIs) and audit log');
  const searchRoute = await import('../app/api/marketing/search/route.ts');
  const gaRoute = await import('../app/api/marketing/analytics/route.ts');
  const auditRoute = await import('../app/api/admin/audit-log/route.ts');
  const { AuditLog } = await import('../lib/models/AuditLog.ts');
  reset();
  await MarketingConnection.updateOne({ provider: 'google' }, { $set: { scopes: ['https://www.googleapis.com/auth/adwords', 'https://www.googleapis.com/auth/datamanager'] } });
  const noScope = await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'sites' });
  check('Search Console without granted scope → clear permission error', noScope.status === 409 && /not granted/.test((await noScope.json()).message));
  await MarketingConnection.updateOne({ provider: 'google' }, { $set: { status: 'connected', scopes: ['https://www.googleapis.com/auth/webmasters', 'https://www.googleapis.com/auth/analytics.readonly'] } });
  on('webmasters/v3/sites?', () => json(200, {}));
  on((u) => u.endsWith('/webmasters/v3/sites'), () => json(200, { siteEntry: [{ siteUrl: 'sc-domain:ezyloan.co.in', permissionLevel: 'siteOwner' }, { siteUrl: 'https://x.example/', permissionLevel: 'siteUnverifiedUser' }] }));
  const sites = await (await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'sites' })).json();
  check('lists verified properties only', sites.sites.length === 1 && sites.sites[0].siteUrl === 'sc-domain:ezyloan.co.in');
  check('select unknown property → 400', (await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'select', siteUrl: 'sc-domain:evil.com' })).status === 400);
  check('select listed property → 200', (await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'select', siteUrl: 'sc-domain:ezyloan.co.in' })).status === 200);
  check('Search Console POST by marketing employee → 403', (await call(searchRoute, 'POST', '/api/marketing/search', viewC, { action: 'sites' })).status === 403);
  let scCalls = 0;
  on('searchAnalytics/query', (u, i, b) => {
    scCalls++;
    const q = JSON.parse(b);
    const d = q.dimensions?.[0];
    if (!d) return json(200, { rows: [{ clicks: q.startDate === '2026-09-01' ? 120 : 100, impressions: 4000, ctr: 0.03, position: 7.4 }] });
    if (d === 'date') return json(200, { rows: [{ keys: ['2026-09-01'], clicks: 60, impressions: 2000, ctr: 0.03, position: 7 }, { keys: ['2026-09-02'], clicks: 60, impressions: 2000, ctr: 0.03, position: 8 }] });
    return json(200, { rows: [{ keys: [d === 'query' ? 'car loan odisha' : d === 'page' ? 'https://www.ezyloan.co.in/car-loan' : d === 'country' ? 'ind' : 'MOBILE'], clicks: 50, impressions: 900, ctr: 0.055, position: 4.2 }] });
  });
  const scRes = await call(searchRoute, 'GET', '/api/marketing/search?from=2026-09-01&to=2026-09-10', viewC);
  const sc = await scRes.json();
  check('performance report for marketing viewer', scRes.status === 200 && sc.totals.clicks === 120 && sc.previousTotals.clicks === 100 && sc.change.clicks === 20);
  check('trend/queries/pages/countries/devices shaped', sc.trend.length === 2 && sc.queries[0].key === 'car loan odisha' && sc.pages[0].key.endsWith('/car-loan') && sc.countries[0].key === 'ind' && sc.devices.length === 1);
  check('notes state delay, non-exact position and no city data', sc.notes.join(' ').includes('delay') && sc.notes.join(' ').includes('not a fixed ranking') && sc.notes.join(' ').includes('city-level'));
  const callsBefore = scCalls;
  const sc2 = await (await call(searchRoute, 'GET', '/api/marketing/search?from=2026-09-01&to=2026-09-10', viewC)).json();
  check('second request served from cache (no API calls)', sc2.fromCache === true && scCalls === callsBefore);
  check('invalid dates → 4xx, no API call', (await call(searchRoute, 'GET', "/api/marketing/search?from=2026-09-01'&to=x", viewC)).status >= 400 && scCalls === callsBefore);
  check('CSV export: marketing employee → 403', (await call(searchRoute, 'GET', '/api/marketing/search?from=2026-09-01&to=2026-09-10&format=csv', viewC)).status === 403);
  const scCsv = await call(searchRoute, 'GET', '/api/marketing/search?from=2026-09-01&to=2026-09-10&format=csv&table=pages', adminC);
  check('CSV export: admin → pages CSV', scCsv.status === 200 && (await scCsv.text()).includes('car-loan'));
  on('urlInspection/index:inspect', () => json(200, { inspectionResult: { inspectionResultLink: 'https://search.google.com/x', indexStatusResult: { verdict: 'PASS', coverageState: 'Submitted and indexed', googleCanonical: 'https://www.ezyloan.co.in/car-loan' } } }));
  const insp = await (await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'inspect', url: 'https://www.ezyloan.co.in/car-loan' })).json();
  check('URL inspection returns index verdict + disclaimer', insp.result.verdict === 'PASS' && /not a live test/.test(insp.result.note));
  check('URL inspection outside property refused', (await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'inspect', url: 'https://evil.example/' })).status === 400);
  on((u, i) => u.includes('/sitemaps/') && i.method === 'PUT', () => new Response(null, { status: 204 }));
  const sub = await call(searchRoute, 'POST', '/api/marketing/search', adminC, { action: 'submit_sitemap', url: 'https://www.ezyloan.co.in/sitemap.xml' });
  check('sitemap submit (no indexing promise)', sub.status === 200 && /Google decides/.test((await sub.json()).message));
  on('analyticsadmin.googleapis.com/v1beta/accountSummaries', () => json(200, { accountSummaries: [{ displayName: 'EzyLoan', propertySummaries: [{ property: 'properties/123456', displayName: 'ezyloan.co.in' }] }] }));
  const props = await (await call(gaRoute, 'POST', '/api/marketing/analytics', adminC, { action: 'properties' })).json();
  check('GA4 properties listed', props.properties[0].id === '123456');
  check('GA4 select listed property', (await call(gaRoute, 'POST', '/api/marketing/analytics', adminC, { action: 'select', propertyId: '123456' })).status === 200);
  on('analyticsdata.googleapis.com/v1beta/properties/123456:runReport', (u, i, b) => {
    const q = JSON.parse(b);
    const dim = q.dimensions?.[0]?.name;
    const mh = q.metrics.map((m) => ({ name: m.name }));
    const vals = (k) => q.metrics.map((m, j) => ({ value: String(k + j) }));
    if (!dim) return json(200, { metricHeaders: mh, rows: [{ metricValues: vals(q.dateRanges[0].startDate === '2026-09-01' ? 200 : 100) }] });
    if (dim === 'eventName') return json(200, { dimensionHeaders: [{ name: 'eventName' }], metricHeaders: mh, rows: [{ dimensionValues: [{ value: 'generate_lead' }], metricValues: [{ value: '7' }, { value: '6' }] }] });
    return json(200, { dimensionHeaders: [{ name: dim }], metricHeaders: mh, rows: [{ dimensionValues: [{ value: 'x' }], metricValues: vals(1) }] });
  });
  const ga = await (await call(gaRoute, 'GET', '/api/marketing/analytics?from=2026-09-01&to=2026-09-10', viewC)).json();
  check('GA4 report: totals + comparison', ga.totals.sessions === 200 && ga.previousTotals.sessions === 100 && ga.change.sessions === 100);
  check('GA4 funnel events include zero rows for missing events', ga.funnelEvents.find((e) => e.eventName === 'generate_lead').eventCount === 7 && ga.funnelEvents.find((e) => e.eventName === 'form_start').eventCount === 0);
  check('GA4 report includes cities', Array.isArray(ga.cities) && ga.cities.length === 1);
  const ovRoute = await import('../app/api/marketing/overview/route.ts');
  const ov = await (await call(ovRoute, 'GET', '/api/marketing/overview', viewC)).json();
  check('overview: Search Console clicks + GA4 + conversion counts', ov.search.ok && typeof ov.search.data.totals.clicks === 'number' && ov.analytics.ok && ov.conversions.meta.sent >= 1);
  check('overview: employee without marketing tab → 403', (await call(ovRoute, 'GET', '/api/marketing/overview', empC)).status === 403);
  await MarketingConnection.updateOne({ provider: 'google' }, { $set: { 'google.searchConsoleSite': null } });
  const ov2 = await (await call(ovRoute, 'GET', '/api/marketing/overview', viewC)).json();
  check('overview: unconfigured block gives a reason instead of numbers', ov2.search.ok === false && /property/.test(ov2.search.reason));
  check('GA4 report: anonymous → 401', (await call(gaRoute, 'GET', '/api/marketing/analytics?from=2026-09-01&to=2026-09-10')).status === 401);

  section('API keys entered in the admin panel');
  const credRoute = await import('../app/api/marketing/credentials/route.ts');
  const tagsRoute = await import('../app/api/site-tags/route.ts');
  const leadHook = await import('../app/api/webhook/lead/route.ts');
  const { AppCredential } = await import('../lib/models/AppCredential.ts');
  const { getCredential, clearCredentialCache } = await import('../lib/credentials.ts');
  check('keys GET: marketing employee → 403', (await call(credRoute, 'GET', '/api/marketing/credentials', viewC)).status === 403);
  check('keys PUT: marketing employee → 403', (await call(credRoute, 'PUT', '/api/marketing/credentials', viewC, { values: { META_PIXEL_ID: '1234567' } })).status === 403);
  check('keys PUT: invalid format → 400', (await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { GA4_MEASUREMENT_ID: 'UA-123' } })).status === 400);
  check('keys PUT: unknown key → 400', (await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { DATABASE_URL: 'x' } })).status === 400);
  const putRes = await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { META_PIXEL_ID: '123456789012', GA4_MEASUREMENT_ID: 'G-ABC1234567', WEBHOOK_LEAD_SECRET: 'lead-secret-0123456789abcdef' } });
  const putBody = await putRes.json();
  check('keys PUT: admin saves valid keys', putRes.status === 200 && putBody.saved.length === 3);
  check('response never contains a secret value', !JSON.stringify(putBody).includes('lead-secret-0123456789abcdef') && putBody.credentials.find((c) => c.name === 'WEBHOOK_LEAD_SECRET').set === true);
  const stored = await AppCredential.findOne({ name: 'WEBHOOK_LEAD_SECRET' }).lean();
  check('secret stored encrypted, public ID stored plain', stored.enc?.startsWith('enc:v1:') && !stored.value && (await AppCredential.findOne({ name: 'META_PIXEL_ID' }).lean()).value === '123456789012');
  clearCredentialCache();
  check('saved key resolves for the integrations', (await getCredential('WEBHOOK_LEAD_SECRET')) === 'lead-secret-0123456789abcdef');
  await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { META_APP_ID: '999999999' } });
  check('server env overrides the panel value', (await getCredential('META_APP_ID')) === process.env.META_APP_ID && (await (await call(credRoute, 'GET', '/api/marketing/credentials', adminC)).json()).credentials.find((c) => c.name === 'META_APP_ID').source === 'env');
  const gen = await (await call(credRoute, 'POST', '/api/marketing/credentials', adminC, { action: 'generate', name: 'FACEBOOK_VERIFY_TOKEN' })).json();
  check('generate verify token → returned once, saved encrypted', typeof gen.value === 'string' && gen.value.length >= 20 && (await AppCredential.findOne({ name: 'FACEBOOK_VERIFY_TOKEN' }).lean()).enc?.startsWith('enc:v1:'));
  check('cannot generate arbitrary keys', (await call(credRoute, 'POST', '/api/marketing/credentials', adminC, { action: 'generate', name: 'META_APP_SECRET' })).status === 400);
  const hs = await route.GET(new NextRequest(`https://www.ezyloan.co.in/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(gen.value)}&hub.challenge=CH123`));
  check('Meta webhook verification uses the panel verify token', hs.status === 200 && (await hs.text()) === 'CH123');
  check('wrong verify token → 403', (await route.GET(new NextRequest('https://www.ezyloan.co.in/api/webhook/facebook?hub.mode=subscribe&hub.verify_token=nope&hub.challenge=x'))).status === 403);
  const leadPost = (secret) => leadHook.POST(new NextRequest('https://www.ezyloan.co.in/api/webhook/lead', { method: 'POST', headers: { 'content-type': 'application/json', ...(secret ? { 'x-webhook-secret': secret } : {}) }, body: JSON.stringify({ name: 'Zap Lead', email: 'zap@example.com', source: 'Zapier' }) }));
  check('lead webhook: wrong secret → 401', (await leadPost('wrong')).status === 401);
  check('lead webhook: panel secret → 200', (await leadPost('lead-secret-0123456789abcdef')).status === 200);
  const tags = await (await tagsRoute.GET()).json();
  check('public site-tags returns only the validated public IDs', tags.metaPixelId === '123456789012' && tags.ga4MeasurementId === 'G-ABC1234567' && Object.keys(tags).length === 2);
  const st = await (await call(statusRoute, 'GET', '/api/marketing/status', adminC)).json();
  check('status: setup checklist + URLs to configure', Array.isArray(st.setup) && st.setup.length >= 10 && st.urls.metaWebhook.endsWith('/api/webhook/facebook') && st.urls.leadWebhook.endsWith('/api/webhook/lead'));
  check('status: no secret values exposed', !JSON.stringify(st).includes('lead-secret-0123456789abcdef') && !JSON.stringify(st).includes(gen.value));
  const clr = await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { GA4_MEASUREMENT_ID: '' } });
  check('clearing a key removes it', clr.status === 200 && !(await AppCredential.findOne({ name: 'GA4_MEASUREMENT_ID' }).lean()));

  section('Encryption key safety');
  const km = await import('../lib/marketing/keyManager.ts');
  const sec = await import('../lib/marketing/secrets.ts');
  const { KeyCheck } = await import('../lib/models/MarketingSupport.ts');
  const realKey = process.env.MARKETING_ENCRYPTION_KEY;
  const keyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ezy-key-'));
  process.env.MARKETING_KEY_FILE = path.join(keyDir, 'sub', 'marketing.key');
  const st1 = await km.keyStatus();
  check('current key matches stored fingerprint', st1.present && st1.source === 'env' && st1.matches === true && !st1.problem && st1.encryptedRecords > 0, JSON.stringify(st1));
  process.env.MARKETING_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  sec.resetKeyCache();
  const st2 = await km.keyStatus();
  check('a different key is detected as a mismatch', st2.matches === false && /not the key/.test(st2.problem || ''));
  const wrongPut = await call(credRoute, 'PUT', '/api/marketing/credentials', adminC, { values: { META_PIXEL_ID: '111111111', WEBHOOK_LEAD_SECRET: 'another-secret-0123456789' } });
  check('saving secrets with the wrong key → 409, nothing saved (not even the public ID)', wrongPut.status === 409 && (await AppCredential.findOne({ name: 'META_PIXEL_ID' }).lean()).value === '123456789012');
  clearCredentialCache();
  const unreadable = (await (await call(credRoute, 'GET', '/api/marketing/credentials', adminC)).json()).credentials.find((c) => c.name === 'WEBHOOK_LEAD_SECRET');
  check('undecryptable saved secret is reported as unreadable, not silently "not set"', unreadable.unreadable === true);
  delete process.env.MARKETING_ENCRYPTION_KEY;
  sec.resetKeyCache();
  const st3 = await km.keyStatus();
  check('missing key with existing encrypted data → problem reported', !st3.present && /missing/.test(st3.problem || ''));
  let refused = false;
  try { await km.ensureEncryptionKey(); } catch { refused = true; }
  check('missing key with existing data → NO new key generated', refused && !fs.existsSync(process.env.MARKETING_KEY_FILE));
  const conn3 = await call(connectRoute, 'GET', '/api/marketing/meta/connect', adminC);
  check('connect blocked while the key problem exists', new URL(conn3.headers.get('location')).searchParams.get('error') === 'encryption_key_problem');
  // Pre-fingerprint data: no stored fingerprint → the key must prove it can read existing ciphertext.
  await KeyCheck.deleteMany({});
  process.env.MARKETING_ENCRYPTION_KEY = crypto.randomBytes(32).toString('base64');
  sec.resetKeyCache();
  check('no fingerprint + wrong key → still detected by a decrypt probe', (await km.keyStatus()).matches === false);
  process.env.MARKETING_ENCRYPTION_KEY = realKey;
  sec.resetKeyCache();
  check('no fingerprint + right key → accepted and fingerprint stored', (await km.ensureEncryptionKey()).matches === true && !!(await KeyCheck.findById('encryption').lean()));
  // Fresh install (separate empty state): no ciphertext, no fingerprint, no key → file created once.
  const savedCreds = await AppCredential.find().lean();
  const savedConns = await MarketingConnection.find().lean();
  await AppCredential.deleteMany({});
  await MarketingConnection.deleteMany({});
  await KeyCheck.deleteMany({});
  delete process.env.MARKETING_ENCRYPTION_KEY;
  sec.resetKeyCache();
  const fresh = await km.ensureEncryptionKey();
  const keyText = fs.readFileSync(process.env.MARKETING_KEY_FILE, 'utf8');
  check('fresh install → key file created and fingerprint stored', fresh.source === 'file' && fresh.file === process.env.MARKETING_KEY_FILE && keyText.length >= 40 && fresh.matches === true);
  if (process.platform !== 'win32') check('key file mode 0600', (fs.statSync(process.env.MARKETING_KEY_FILE).mode & 0o777) === 0o600);
  await km.ensureEncryptionKey();
  check('second call reuses the same key (never regenerated)', fs.readFileSync(process.env.MARKETING_KEY_FILE, 'utf8') === keyText);
  // Restore the shared test state.
  await AppCredential.deleteMany({});
  await KeyCheck.deleteMany({});
  if (savedCreds.length) await AppCredential.insertMany(savedCreds);
  if (savedConns.length) await MarketingConnection.insertMany(savedConns);
  process.env.MARKETING_ENCRYPTION_KEY = realKey;
  delete process.env.MARKETING_KEY_FILE;
  sec.resetKeyCache();
  await km.ensureEncryptionKey();
  clearCredentialCache();

  const actions = await AuditLog.distinct('action');
  check('audit log recorded settings change, exports, retries, connect attempts, property selection', ['config_change', 'export', 'conversion_retry_bulk', 'sitemap_submit', 'credentials_change'].every((a) => actions.includes(a)), JSON.stringify(actions));
  const auditText = JSON.stringify(await AuditLog.find().lean());
  check('audit log holds no tokens/secrets', !/EAA|ya29|enc:v1:|capitoken|lead-secret-0123456789abcdef/.test(auditText) && !auditText.includes(gen.value));
  check('audit log API: marketing employee → 403', (await call(auditRoute, 'GET', '/api/admin/audit-log', viewC)).status === 403);
  check('audit log API: admin → 200', (await call(auditRoute, 'GET', '/api/admin/audit-log', adminC)).status === 200);

  await mongoose.disconnect();
  globalThis.fetch = realFetch;
}

if (mongod) {
  mongod.kill();
  await sleep(500);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch { /* windows file locks */ }
}
console.log = realLog;
console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) console.log('Failures:\n - ' + failures.join('\n - '));
process.exit(failed ? 1 : 0);
