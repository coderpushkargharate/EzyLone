import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { sendLoanApprovalEmail, sendLoanRejectionEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Fields an admin may edit on a loan application. Whitelisted (never spread the
// raw body) so a caller can't set arbitrary/server-controlled fields. Covers the
// applicant details, decision status, and the loan pipeline + commission fields
// the CRM's LoanDetailModal edits. `payoutAmount` is derived, not accepted.
const EDITABLE_FIELDS = [
  'fullName', 'email', 'phoneNumber', 'loanType', 'employmentType',
  'city', 'pincode', 'cibilScore', 'monthlyIncome', 'status', 'notes',
  'pipelineStage', 'lender', 'loanAmount', 'sanctionedAmount', 'disbursedAmount',
  'interestRate', 'tenureMonths', 'payoutPercent',
] as const;

// PATCH /api/loans/:id — admin only. Partial update of a loan application
// (applicant edits, decision status, and the pipeline/commission fields). A
// status change to approved/rejected fires the same applicant email as the
// dedicated /status route. `payoutAmount` is recomputed from disbursed × payout%.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    await connectDB();
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update: Record<string, any> = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ message: 'No editable fields provided' }, { status: 400 });
    }

    const existing = await LoanApplication.findById(params.id);
    if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    // Keep commission in sync: payout ₹ = disbursed × payout% (using the new
    // value if provided, else the stored one). Only when either input is present.
    if (update.disbursedAmount !== undefined || update.payoutPercent !== undefined) {
      const disbursed = Number(update.disbursedAmount ?? existing.disbursedAmount ?? 0);
      const percent = Number(update.payoutPercent ?? existing.payoutPercent ?? 0);
      update.payoutAmount = Math.round(disbursed * percent) / 100;
    }

    const statusChanged = update.status && update.status !== existing.status;

    const loan = await LoanApplication.findByIdAndUpdate(params.id, update, { new: true });

    if (loan && statusChanged) {
      if (update.status === 'approved') await sendLoanApprovalEmail(loan);
      else if (update.status === 'rejected') await sendLoanRejectionEmail(loan);
    }

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating loan', error: error.message }, { status: 500 });
  }
}

// DELETE /api/loans/:id — admin only
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    await LoanApplication.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Loan deleted' });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error deleting loan', error: error.message }, { status: 500 });
  }
}
