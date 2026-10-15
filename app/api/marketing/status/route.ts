import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getConnection, publicConnectionView } from '@/lib/marketing/connections';
import { getSettings } from '@/lib/marketing/settings';
import { keyStatus } from '@/lib/marketing/keyManager';
import { credentialStatus } from '@/lib/credentials';
import { setupChecklist } from '@/lib/marketing/setup';
import { googleAppConfig, metaAppConfig, publicBaseUrl, workerEnabled, META_GRAPH_VERSION, GOOGLE_ADS_API_VERSION } from '@/lib/marketing/config';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { MetaLeadReceipt } from '@/lib/models/MetaLeadReceipt';
import { IntegrationSyncLog, JobLease } from '@/lib/models/MarketingSupport';
import { Integration } from '@/lib/models/Integration';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/marketing/status — connection health, settings and queue state for
// the Marketing tab. Booleans only for secrets: no token, secret or ciphertext
// is ever included in this response.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: 'marketing' });
  if ('error' in gate) return gate.error;
  await connectDB();

  const [meta, google, settings, eventCounts, receiptCounts, lastLogs, health, fbInteg] = await Promise.all([
    getConnection('meta'),
    getConnection('google'),
    getSettings(true),
    ConversionEvent.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    MetaLeadReceipt.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    IntegrationSyncLog.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: { _id: { provider: '$provider', kind: '$kind' }, last: { $first: '$$ROOT' } } },
    ]),
    JobLease.find({ _id: { $in: ['marketing:health', 'marketing:insights'] } }).lean(),
    Integration.findOne({ provider: 'facebook' }).lean(),
  ]);
  const [mcfg, gcfg, credentials, key] = await Promise.all([metaAppConfig(), googleAppConfig(), credentialStatus(), keyStatus()]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbCfg = ((fbInteg as any)?.config || {}) as Record<string, unknown>;
  const keySource = key.source;
  const keys = Object.fromEntries(credentials.map((c) => [c.name, c.set]));
  // The legacy Automations form can also hold the App Secret / verify token.
  if (fbCfg.appSecret) keys.META_APP_SECRET = true;
  if (fbCfg.verifyToken) keys.FACEBOOK_VERIFY_TOKEN = true;
  const metaView = publicConnectionView(meta);
  const googleView = publicConnectionView(google);
  const base = publicBaseUrl();
  const leadsVerified = !!(await MetaLeadReceipt.exists({ status: 'done' }));

  return NextResponse.json(
    {
      isAdmin: gate.auth.role === 'admin',
      meta: metaView,
      google: googleView,
      settings,
      credentials,
      setup: setupChecklist({
        keys,
        encryptionKey: !key.problem,
        baseUrl: base,
        meta: { status: metaView.status, pages: metaView.meta?.pages || [], datasetId: metaView.meta?.datasetId, capiTokenSet: metaView.meta?.capiTokenSet, capiVerified: !!metaView.meta?.capiVerifiedAt, leadsVerified, missingScopes: metaView.missingScopes },
        google: { status: googleView.status, customerId: googleView.google?.customerId, searchConsoleSite: googleView.google?.searchConsoleSite, ga4PropertyId: googleView.google?.ga4PropertyId, uploadVerified: !!googleView.google?.uploadVerifiedAt, missingScopes: googleView.missingScopes },
        mappings: settings.eventMappings.map((m) => ({ meta: !!m.meta?.enabled, google: !!m.google?.enabled })),
        testMode: { meta: settings.testMode?.meta !== false, google: settings.testMode?.google !== false },
      }),
      urls: {
        metaWebhook: `${base}/api/webhook/facebook`,
        metaOAuthRedirect: mcfg.redirectUri,
        googleOAuthRedirect: gcfg.redirectUri,
        leadWebhook: `${base}/api/webhook/lead`,
        privacyPolicy: `${base}/privacy-policy`,
        terms: `${base}/terms-and-conditions`,
        siteDomain: new URL(base).hostname,
      },
      environment: {
        encryptionKeySet: !!keySource,
        encryptionKeySource: keySource,
        // Non-secret key facts for the panel (file path, fingerprint match, problem text).
        encryptionKey: { present: key.present, source: key.source, file: key.file, defaultFile: key.defaultFile, matches: key.matches, encryptedRecords: key.encryptedRecords, problem: key.problem },
        metaAppIdSet: !!mcfg.appId,
        metaAppSecretSet: !!(mcfg.appSecret || fbCfg.appSecret),
        metaVerifyTokenSet: !!keys.FACEBOOK_VERIFY_TOKEN,
        metaRedirectUri: mcfg.redirectUri,
        metaWebhookUrl: `${base}/api/webhook/facebook`,
        metaScopes: mcfg.scopes,
        metaGraphVersion: META_GRAPH_VERSION,
        legacyManualPageTokenSet: !!fbCfg.pageAccessToken,
        googleClientSet: !!(gcfg.clientId && gcfg.clientSecret),
        googleDeveloperTokenSet: !!gcfg.developerToken,
        googleRedirectUri: gcfg.redirectUri,
        googleAdsApiVersion: GOOGLE_ADS_API_VERSION,
        workerEnabled: workerEnabled(),
      },
      queue: {
        events: Object.fromEntries(eventCounts.map((e) => [e._id, e.count])),
        leadReceipts: Object.fromEntries(receiptCounts.map((e) => [e._id, e.count])),
      },
      lastSync: lastLogs.map((l) => ({
        provider: l._id.provider,
        kind: l._id.kind,
        status: l.last.status,
        message: l.last.message,
        at: l.last.createdAt,
      })),
      periodic: health.map((h) => ({ job: h._id, lastRunAt: h.lastRunAt })),
    },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
