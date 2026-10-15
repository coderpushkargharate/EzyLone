import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { AdMetricDaily } from '@/lib/models/MarketingSupport';
import { getSettings } from './settings';
import { CRM_EVENTS } from './types';
import type { CrmEvent } from './types';

// Marketing dashboard aggregation. Two strictly separate kinds of numbers:
//   crm.*       — counted from EzyLoan's own database (CRM-confirmed)
//   platform.*  — reported by Meta / Google APIs (spend, clicks, their conversions)
// Derived ratios (CPL, ROAS) are only computed when both inputs exist, and are
// labelled with how they were derived. Nothing is estimated from thin air.

export interface DashboardFilters {
  from: Date;
  to: Date;
  channel?: string;
  campaign?: string;
  loanType?: string;
  status?: string;
}

const STR = (v: string | null, max = 100) => (v ? v.trim().slice(0, max) : undefined);

export function parseFilters(sp: URLSearchParams): DashboardFilters {
  const to = sp.get('to') && /^\d{4}-\d{2}-\d{2}$/.test(sp.get('to')!) ? new Date(`${sp.get('to')}T23:59:59.999+05:30`) : new Date();
  const fromDefault = new Date(to.getTime() - 29 * 86_400_000);
  const from = sp.get('from') && /^\d{4}-\d{2}-\d{2}$/.test(sp.get('from')!) ? new Date(`${sp.get('from')}T00:00:00+05:30`) : fromDefault;
  return { from, to, channel: STR(sp.get('channel'), 40), campaign: STR(sp.get('campaign'), 200), loanType: STR(sp.get('loanType'), 60), status: STR(sp.get('status'), 40) };
}

const META_CHANNELS = ['meta_lead_ads', 'meta_ads', 'meta_click'];
const GOOGLE_CHANNELS = ['google_ads'];

export function rate(n: number, d: number): number | null {
  return d > 0 ? Math.round((n / d) * 1000) / 10 : null;
}

export function costPer(spend: number | null, count: number): number | null {
  return spend != null && spend > 0 && count > 0 ? Math.round((spend / count) * 100) / 100 : null;
}

export async function buildDashboard(f: DashboardFilters) {
  await connectDB();
  const settings = await getSettings();
  const qualified = settings.qualifiedStatuses || [];

  const leadMatch: Record<string, unknown> = { createdAt: { $gte: f.from, $lte: f.to } };
  if (f.status) leadMatch.status = f.status;

  const campaignExpr = {
    $ifNull: ['$a.meta.campaignName', { $ifNull: ['$a.meta.campaignId', { $ifNull: ['$a.lastTouch.utmCampaign', '(none)'] }] }],
  };
  const has = (path: string) => ({ $cond: [{ $ifNull: [path, false] }, 1, 0] });
  const stageSums = {
    leads: { $sum: 1 },
    qualified: { $sum: { $cond: [{ $or: [{ $in: ['$status', qualified] }, { $ifNull: ['$a.lifecycle.qualifiedAt', false] }] }, 1, 0] } },
    applications: { $sum: has('$a.lifecycle.applicationAt') },
    approvals: { $sum: has('$a.lifecycle.approvedAt') },
    disbursements: { $sum: has('$a.lifecycle.disbursedAt') },
    consented: { $sum: { $cond: [{ $eq: ['$a.consent.adMeasurement', 'granted'] }, 1, 0] } },
  };

  const post: Record<string, unknown> = {};
  if (f.channel) post.channel = f.channel;
  if (f.campaign) post.campaign = f.campaign;
  if (f.loanType) post['a.loanType'] = f.loanType;

  const [agg] = await Lead.aggregate([
    { $match: leadMatch },
    { $lookup: { from: 'lead_attributions', localField: '_id', foreignField: 'leadId', as: 'a' } },
    { $unwind: { path: '$a', preserveNullAndEmptyArrays: true } },
    { $addFields: { channel: { $ifNull: ['$a.channel', 'unattributed'] }, campaign: campaignExpr, campaignId: '$a.meta.campaignId' } },
    { $match: post },
    {
      $facet: {
        totals: [{ $group: { _id: null, ...stageSums } }],
        bySource: [{ $group: { _id: { $ifNull: ['$source', 'Unknown'] }, ...stageSums } }, { $sort: { leads: -1 } }, { $limit: 30 }],
        byChannel: [{ $group: { _id: '$channel', ...stageSums } }, { $sort: { leads: -1 } }],
        byCampaign: [
          { $group: { _id: '$campaign', campaignIds: { $addToSet: '$campaignId' }, channels: { $addToSet: '$channel' }, ...stageSums } },
          { $sort: { leads: -1 } },
          { $limit: 50 },
        ],
      },
    },
  ]);

  const totals = agg?.totals?.[0] || { leads: 0, qualified: 0, applications: 0, approvals: 0, disbursements: 0, consented: 0 };

  // Loan pipeline straight from LoanApplication (all applications in range; not channel-filterable
  // for history because loans pre-dating attribution have no lead link).
  const loanMatch: Record<string, unknown> = { createdAt: { $gte: f.from, $lte: f.to } };
  if (f.loanType) loanMatch.loanType = f.loanType;
  const [loanAgg] = await LoanApplication.aggregate([
    { $match: loanMatch },
    {
      $group: {
        _id: null,
        applications: { $sum: 1 },
        approved: { $sum: { $cond: [{ $or: [{ $eq: ['$status', 'approved'] }, { $in: ['$pipelineStage', ['Sanctioned', 'Disbursed']] }] }, 1, 0] } },
        disbursed: { $sum: { $cond: [{ $eq: ['$pipelineStage', 'Disbursed'] }, 1, 0] } },
      },
    },
  ]);

  // Platform-reported metrics for the same dates (IST calendar days).
  const fromDay = new Date(f.from.getTime() + 330 * 60_000).toISOString().slice(0, 10);
  const toDay = new Date(f.to.getTime() + 330 * 60_000).toISOString().slice(0, 10);
  const metricRows = await AdMetricDaily.aggregate([
    { $match: { date: { $gte: fromDay, $lte: toDay } } },
    {
      $group: {
        _id: { provider: '$provider', campaignId: '$campaignId' },
        campaignName: { $last: '$campaignName' },
        spend: { $sum: '$spend' },
        impressions: { $sum: '$impressions' },
        clicks: { $sum: '$clicks' },
        platformConversions: { $sum: '$platformLeads' },
        currency: { $last: '$currency' },
        fetchedAt: { $max: '$fetchedAt' },
      },
    },
    { $sort: { spend: -1 } },
  ]);
  const freshness = await AdMetricDaily.aggregate([{ $group: { _id: '$provider', fetchedAt: { $max: '$fetchedAt' } } }]);
  const lastFetched: Record<string, Date | null> = { meta: null, google: null };
  for (const r of freshness) lastFetched[r._id] = r.fetchedAt;

  const spendBy = (provider: string) => {
    const rows = metricRows.filter((r) => r._id.provider === provider);
    return rows.length ? rows.reduce((s, r) => s + (r.spend || 0), 0) : null;
  };
  const metaSpend = spendBy('meta');
  const googleSpend = spendBy('google');

  const channelRows = (agg?.byChannel || []) as { _id: string; leads: number; qualified: number }[];
  const sumChannels = (list: string[], k: 'leads' | 'qualified') =>
    channelRows.filter((r) => list.includes(r._id)).reduce((s, r) => s + r[k], 0);

  // Configured value per CRM event (admin-set business values — not revenue).
  const valueOf = (e: CrmEvent) => settings.eventMappings.find((m) => m.crmEvent === e)?.value || 0;
  const configuredValue = (row: { leads: number; qualified: number; applications: number; approvals: number; disbursements: number }) =>
    row.leads * valueOf('Lead') +
    row.qualified * valueOf('QualifiedLead') +
    row.applications * valueOf('SubmitApplication') +
    row.approvals * valueOf('ApprovedApplication') +
    row.disbursements * valueOf('LoanDisbursed');
  const anyValueConfigured = CRM_EVENTS.some((e) => valueOf(e) > 0);

  const platformChannel = (provider: 'meta' | 'google', spend: number | null) => {
    const list = provider === 'meta' ? META_CHANNELS : GOOGLE_CHANNELS;
    const leads = sumChannels(list, 'leads');
    const q = sumChannels(list, 'qualified');
    const rows = (agg?.byCampaign || []).filter((c: { channels: string[] }) => c.channels.some((ch) => list.includes(ch)));
    const value = rows.reduce((s: number, r: Parameters<typeof configuredValue>[0]) => s + configuredValue(r), 0);
    return {
      spend,
      currency: metricRows.find((r) => r._id.provider === provider)?.currency || null,
      lastFetchedAt: lastFetched[provider],
      crmLeads: leads,
      crmQualified: q,
      cpl: costPer(spend, leads),
      costPerQualified: costPer(spend, q),
      configuredValue: anyValueConfigured ? value : null,
      roas: anyValueConfigured && spend ? Math.round((value / spend) * 100) / 100 : null,
    };
  };

  // Campaign rows: CRM-confirmed counts, joined to platform spend ONLY by exact Meta campaign id.
  const metaById = new Map(metricRows.filter((r) => r._id.provider === 'meta').map((r) => [r._id.campaignId, r]));
  const byCampaign = (agg?.byCampaign || []).map((c: { _id: string; campaignIds: (string | null)[]; channels: string[]; leads: number; qualified: number; applications: number; approvals: number; disbursements: number }) => {
    const metric = c.campaignIds.map((id) => (id ? metaById.get(id) : undefined)).find(Boolean);
    return {
      campaign: c._id,
      channels: c.channels,
      leads: c.leads,
      qualified: c.qualified,
      applications: c.applications,
      approvals: c.approvals,
      disbursements: c.disbursements,
      spend: metric ? metric.spend : null,
      spendJoin: metric ? 'meta_campaign_id' : null,
      cpl: metric ? costPer(metric.spend, c.leads) : null,
      costPerQualified: metric ? costPer(metric.spend, c.qualified) : null,
    };
  });

  const eventStats = await ConversionEvent.aggregate([
    { $match: { createdAt: { $gte: f.from, $lte: f.to } } },
    { $group: { _id: { platform: '$platform', status: '$status', test: '$testMode' }, count: { $sum: 1 } } },
  ]);

  return {
    range: { from: f.from, to: f.to },
    filters: f,
    crm: {
      totals,
      rates: {
        leadToQualified: rate(totals.qualified, totals.leads),
        qualifiedToApplication: rate(totals.applications, totals.qualified),
        applicationToApproval: rate(totals.approvals, totals.applications),
        approvalToDisbursal: rate(totals.disbursements, totals.approvals),
      },
      bySource: agg?.bySource || [],
      byChannel: channelRows,
      byCampaign,
      loanPipeline: loanAgg || { applications: 0, approved: 0, disbursed: 0 },
      configuredValue: anyValueConfigured ? configuredValue(totals) : null,
    },
    platform: {
      meta: platformChannel('meta', metaSpend),
      google: platformChannel('google', googleSpend),
      campaigns: metricRows.slice(0, 50).map((r) => ({ provider: r._id.provider, campaignId: r._id.campaignId, ...r, _id: undefined })),
    },
    delivery: eventStats.map((e) => ({ platform: e._id.platform, status: e._id.status, test: e._id.test, count: e.count })),
    notes: [
      'CRM counts come from EzyLoan’s database. Platform figures come from Meta/Google APIs and can lag by up to 72 hours.',
      'Lifecycle stages (application, approval, disbursal) are linked to leads from the date this integration went live; earlier loans appear only in the loan-pipeline totals.',
      'CPL = platform spend ÷ CRM leads attributed to that platform in the same dates. ROAS uses the conversion values configured in Settings, not actual revenue.',
      'Leads without UTM/click data or Lead Ads ids are counted as "unattributed".',
    ],
  };
}
