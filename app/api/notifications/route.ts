import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/notifications — the admin/staff notification bell feed. Surfaces the
// things that need attention today: overdue & due-today follow-ups, brand-new
// leads from the last 24h, and fresh loan applications awaiting action.
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  await connectDB();

  const now = new Date();
  const endOfToday = new Date(now); endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date(now); startOfToday.setHours(0, 0, 0, 0);
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [overdue, dueToday, newLeads, newLoans] = await Promise.all([
    Lead.find({ followUpDate: { $lt: startOfToday }, status: { $nin: ['Converted', 'Lost'] } })
      .sort({ followUpDate: 1 }).limit(20).select('name phone followUpDate status').lean(),
    Lead.find({ followUpDate: { $gte: startOfToday, $lte: endOfToday }, status: { $nin: ['Converted', 'Lost'] } })
      .sort({ followUpDate: 1 }).limit(20).select('name phone followUpDate status').lean(),
    Lead.find({ createdAt: { $gte: dayAgo } })
      .sort({ createdAt: -1 }).limit(20).select('name phone source createdAt').lean(),
    LoanApplication.find({ createdAt: { $gte: dayAgo } })
      .sort({ createdAt: -1 }).limit(20).select('fullName phoneNumber loanType createdAt').lean(),
  ]);

  const total = overdue.length + dueToday.length + newLeads.length + newLoans.length;

  return NextResponse.json({
    total,
    counts: {
      overdue: overdue.length,
      dueToday: dueToday.length,
      newLeads: newLeads.length,
      newLoans: newLoans.length,
    },
    overdue,
    dueToday,
    newLeads,
    newLoans,
  });
}
