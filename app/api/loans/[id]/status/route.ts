import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { sendLoanApprovalEmail, sendLoanRejectionEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/loans/:id/status — admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAuth(req)) return unauthorized();

  try {
    const { status } = await req.json();
    await connectDB();
    const loan = await LoanApplication.findByIdAndUpdate(params.id, { status }, { new: true });

    if (loan && status === 'approved') {
      await sendLoanApprovalEmail(loan);
    } else if (loan && status === 'rejected') {
      await sendLoanRejectionEmail(loan);
    }

    return NextResponse.json(loan);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating status', error: error.message }, { status: 500 });
  }
}
