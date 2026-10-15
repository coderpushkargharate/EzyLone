import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { audit } from '@/lib/audit';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { LeadAttribution } from '@/lib/models/LeadAttribution';
import { Lead } from '@/lib/models/Lead';
import { parseFilters } from '@/lib/marketing/dashboard';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Same CSV conventions as /api/reports/export (quoted cells, formula-injection guard).
function csvCell(v: unknown): string {
  let s = v === undefined || v === null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
const toCsv = (headers: string[], rows: unknown[][]) => [headers, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');

function maskPhone(p?: string) {
  return p ? `${'•'.repeat(Math.max(0, p.length - 4))}${p.slice(-4)}` : '';
}
function maskEmail(e?: string) {
  if (!e || !e.includes('@')) return '';
  const [u, d] = e.split('@');
  return `${u.slice(0, 1)}•••@${d}`;
}

// GET /api/marketing/export?type=events|attribution&from&to — admin only.
// Contact details are masked; click ids, browser ids and IPs are never exported.
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { adminOnly: true });
  if ('error' in gate) return gate.error;
  const limited = checkRateLimit(req, 'marketing-export', { windowMs: 60_000, max: 10, message: 'Too many exports.' });
  if (limited) return limited;
  await connectDB();
  const sp = req.nextUrl.searchParams;
  const f = parseFilters(sp);
  const range = { $gte: f.from, $lte: f.to };
  const type = sp.get('type') === 'attribution' ? 'attribution' : 'events';
  let csv: string;

  if (type === 'events') {
    const rows = await ConversionEvent.find({ createdAt: range }).sort({ createdAt: -1 }).limit(20_000).select('-history').lean();
    csv = toCsv(
      ['Created', 'Platform', 'CRM event', 'Platform event / action', 'Event ID', 'Event time', 'Status', 'Test', 'Attempts', 'Consent', 'Send mode', 'Channel', 'Lead source', 'Value', 'Currency', 'Delivered', 'Last error', 'Needs review'],
      rows.map((r) => [r.createdAt, r.platform, r.crmEvent, r.platformEventName, r.eventId, r.eventTime, r.status, r.testMode ? 'yes' : 'no', r.attempts, r.consentState, r.sendMode, r.channel, r.source, r.value, r.currency, r.deliveredAt, r.lastError, r.needsReview])
    );
  } else {
    const attrs = await LeadAttribution.find({ createdAt: range }).sort({ createdAt: -1 }).limit(20_000).lean();
    const leads = await Lead.find({ _id: { $in: attrs.map((a) => a.leadId) } }).select('name phone email status source').lean();
    const byId = new Map(leads.map((l) => [String(l._id), l]));
    csv = toCsv(
      ['Lead created', 'Lead', 'Phone (masked)', 'Email (masked)', 'CRM status', 'Source', 'Channel', 'First UTM source', 'First UTM medium', 'First UTM campaign', 'Last UTM source', 'Last UTM medium', 'Last UTM campaign', 'Has Google click id', 'Meta campaign', 'Meta ad set', 'Meta ad', 'Meta form', 'Loan type', 'Consent', 'Consent source', 'Qualified', 'Application', 'Approved', 'Disbursed'],
      attrs.map((a) => {
        const l = byId.get(String(a.leadId));
        return [
          a.createdAt, l?.name, maskPhone(l?.phone), maskEmail(l?.email), l?.status, l?.source, a.channel,
          a.firstTouch?.utmSource, a.firstTouch?.utmMedium, a.firstTouch?.utmCampaign,
          a.lastTouch?.utmSource, a.lastTouch?.utmMedium, a.lastTouch?.utmCampaign,
          a.lastTouch?.gclid || a.firstTouch?.gclid || a.lastTouch?.gbraid || a.lastTouch?.wbraid ? 'yes' : 'no',
          a.meta?.campaignName || a.meta?.campaignId, a.meta?.adsetName || a.meta?.adsetId, a.meta?.adName || a.meta?.adId, a.meta?.formName || a.meta?.formId,
          a.loanType, a.consent?.adMeasurement, a.consent?.source,
          a.lifecycle?.qualifiedAt, a.lifecycle?.applicationAt, a.lifecycle?.approvedAt, a.lifecycle?.disbursedAt,
        ];
      })
    );
  }
  await audit(gate.auth, 'export', `marketing_${type}`, { from: f.from.toISOString(), to: f.to.toISOString() }, req);
  const name = `ezyloan-marketing-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${name}"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
