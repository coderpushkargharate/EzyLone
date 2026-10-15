import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { getConnection, publicConnectionView } from '@/lib/marketing/connections';
import { getSettings } from '@/lib/marketing/settings';
import { encryptionConfigured } from '@/lib/marketing/secrets';
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
  const mcfg = metaAppConfig();
  const gcfg = googleAppConfig();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fbCfg = ((fbInteg as any)?.config || {}) as Record<string, unknown>;

  return NextResponse.json(
    {
      isAdmin: gate.auth.role === 'admin',
      meta: publicConnectionView(meta),
      google: publicConnectionView(google),
      settings,
      environment: {
        encryptionKeySet: encryptionConfigured(),
        metaAppIdSet: !!mcfg.appId,
        metaAppSecretSet: !!(mcfg.appSecret || fbCfg.appSecret),
        metaVerifyTokenSet: !!(fbCfg.verifyToken || process.env.FACEBOOK_VERIFY_TOKEN),
        metaRedirectUri: mcfg.redirectUri,
        metaWebhookUrl: `${publicBaseUrl()}/api/webhook/facebook`,
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
