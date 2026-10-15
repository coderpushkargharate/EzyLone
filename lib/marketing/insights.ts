import { connectDB } from '@/lib/db';
import { AdMetricDaily } from '@/lib/models/MarketingSupport';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection } from '@/lib/models/MarketingConnection';
import { decryptSecret } from './secrets';
import { graphAll } from './meta/graph';
import { campaignDailyMetrics } from './google/api';
import { PlatformError } from './types';
import { recordConnectionError } from './connections';
import { syncLog } from './log';
import { getCredential } from '../credentials';

// Platform-reported spend / performance, fetched through the official APIs
// only when the connection has the needed access (Meta ads_read, Google Ads
// developer token). Stored per day per campaign and always labelled as
// platform-reported in the dashboard. Nothing is estimated or invented.

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function syncMetaInsights(days = 30): Promise<{ rows: number; skipped?: string }> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  if (!conn?.tokenEnc || conn.status === 'disconnected') return { rows: 0, skipped: 'Meta not connected' };
  if (!conn.scopes.includes('ads_read') && !conn.scopes.includes('ads_management')) return { rows: 0, skipped: 'ads_read permission not granted' };
  const accounts = conn.meta?.selectedAdAccountIds || [];
  if (!accounts.length) return { rows: 0, skipped: 'No ad account selected' };
  const token = decryptSecret(conn.tokenEnc)!;
  const since = ymd(new Date(Date.now() - days * 86_400_000));
  const until = ymd(new Date());
  let rows = 0;
  const started = Date.now();
  try {
    for (const act of accounts) {
      const data = await graphAll<Record<string, unknown>>(`/${act}/insights`, token, {
        level: 'campaign',
        fields: 'campaign_id,campaign_name,spend,impressions,clicks,actions,account_currency',
        time_range: JSON.stringify({ since, until }),
        time_increment: 1,
        limit: 500,
      });
      for (const r of data) {
        const actions = (r.actions as { action_type: string; value: string }[] | undefined) || [];
        const lead = actions.find((a) => a.action_type === 'lead') || actions.find((a) => a.action_type === 'onsite_conversion.lead_grouped');
        await AdMetricDaily.updateOne(
          { provider: 'meta', accountId: act, date: String(r.date_start), campaignId: String(r.campaign_id) },
          {
            $set: {
              campaignName: r.campaign_name,
              spend: Number(r.spend || 0),
              currency: r.account_currency,
              impressions: Number(r.impressions || 0),
              clicks: Number(r.clicks || 0),
              platformLeads: lead ? Number(lead.value) : 0,
              fetchedAt: new Date(),
            },
          },
          { upsert: true }
        );
        rows++;
      }
    }
    await syncLog('meta', 'insights', 'ok', `Fetched ${rows} campaign-day row(s) for ${accounts.length} ad account(s)`, { counts: { rows }, durationMs: Date.now() - started });
    return { rows };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof PlatformError && (e.kind === 'auth' || e.kind === 'permission')) await recordConnectionError('meta', `Insights: ${msg}`, e.kind);
    await syncLog('meta', 'insights', 'error', `Insights sync failed: ${msg}`);
    throw e;
  }
}

export async function syncGoogleMetrics(days = 30): Promise<{ rows: number; skipped?: string }> {
  await connectDB();
  const conn = await MarketingConnection.findOne({ provider: 'google' }).lean<IMarketingConnection>();
  if (!conn?.refreshTokenEnc || conn.status === 'disconnected') return { rows: 0, skipped: 'Google not connected' };
  if (!conn.google?.customerId) return { rows: 0, skipped: 'No Google Ads customer selected' };
  if (!(await getCredential('GOOGLE_ADS_DEVELOPER_TOKEN'))) return { rows: 0, skipped: 'Google Ads developer token not configured' };
  const started = Date.now();
  try {
    const data = await campaignDailyMetrics(conn.google.customerId, ymd(new Date(Date.now() - days * 86_400_000)), ymd(new Date()), conn.google.loginCustomerId);
    for (const r of data) {
      await AdMetricDaily.updateOne(
        { provider: 'google', accountId: conn.google.customerId, date: r.date, campaignId: r.campaignId },
        { $set: { campaignName: r.campaignName, spend: r.spend, currency: conn.google.currency, impressions: r.impressions, clicks: r.clicks, platformLeads: r.conversions, fetchedAt: new Date() } },
        { upsert: true }
      );
    }
    await syncLog('google', 'insights', 'ok', `Fetched ${data.length} campaign-day row(s)`, { counts: { rows: data.length }, durationMs: Date.now() - started });
    return { rows: data.length };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (e instanceof PlatformError && (e.kind === 'auth' || e.kind === 'permission')) await recordConnectionError('google', `Reporting: ${msg}`, e.kind);
    await syncLog('google', 'insights', 'error', `Google metrics sync failed: ${msg}`);
    throw e;
  }
}
