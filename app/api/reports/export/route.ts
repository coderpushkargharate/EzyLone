import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Escape a value for CSV: wrap in quotes, double any inner quotes. Guards against
// formula injection (=,+,-,@) by prefixing a quote so Excel treats it as text.
function csvCell(v: any): string {
  let s = v === undefined || v === null ? '' : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function toCsv(headers: string[], rows: any[][]): string {
  const lines = [headers.map(csvCell).join(',')];
  for (const r of rows) lines.push(r.map(csvCell).join(','));
  return lines.join('\r\n');
}

// GET /api/reports/export?type=leads|loans&from=YYYY-MM-DD&to=YYYY-MM-DD
// Admin only. Streams a CSV the admin can open in Excel / Google Sheets.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  await connectDB();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') === 'loans' ? 'loans' : 'leads';
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const dateFilter: any = {};
  if (from) dateFilter.$gte = new Date(from + 'T00:00:00');
  if (to) dateFilter.$lte = new Date(to + 'T23:59:59');
  const query = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const fmt = (d: any) => (d ? new Date(d).toISOString().slice(0, 10) : '');

  let csv = '';
  if (type === 'loans') {
    const loans = await LoanApplication.find(query).sort({ createdAt: -1 }).lean();
    csv = toCsv(
      ['Name', 'Phone', 'Email', 'Loan Type', 'Stage', 'Lender', 'Loan Amount', 'Sanctioned', 'Disbursed', 'ROI %', 'Tenure', 'Payout %', 'Payout ₹', 'City', 'CIBIL', 'Applied On'],
      loans.map((l: any) => [
        l.fullName, l.phoneNumber, l.email, l.loanType, l.pipelineStage || 'New', l.lender,
        l.loanAmount, l.sanctionedAmount, l.disbursedAmount, l.interestRate, l.tenureMonths,
        l.payoutPercent, l.payoutAmount, l.city, l.cibilScore, fmt(l.createdAt),
      ])
    );
  } else {
    const leads = await Lead.find(query).sort({ createdAt: -1 }).lean();
    csv = toCsv(
      ['Name', 'Phone', 'WhatsApp', 'Email', 'Status', 'Source', 'Opportunity Size', 'Lead Stage', 'Follow-up Date', 'Notes', 'Created On'],
      leads.map((l: any) => [
        l.name, l.phone, l.whatsapp, l.email, l.status, l.source, l.opportunitySize,
        l.leadStage, fmt(l.followUpDate), l.notes, fmt(l.createdAt),
      ])
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ezyloan-${type}-${stamp}.csv"`,
    },
  });
}
