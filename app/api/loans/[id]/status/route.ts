import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { requireAuth } from '@/lib/auth';
import { sendLoanApprovalEmail, sendLoanRejectionEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PUT /api/loans/:id/status — admin only
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const gate = await requireAuth(req, { permission: 'loans' });
  if ('error' in gate) return gate.error;
  if (!isValidObjectId(params.id)) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  try {
    const { status } = await req.json();
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
    }
    await connectDB();
    const loan = await LoanApplication.findByIdAndUpdate(params.id, { status }, { new: true, runValidators: true });

    if (loan && status === 'approved') {
      await sendLoanApprovalEmail(loan);
    } else if (loan && status === 'rejected') {
      await sendLoanRejectionEmail(loan);
    }

    return NextResponse.json(loan);
  } catch (error: any) {
    console.error('Error updating status', error);

    return NextResponse.json({ message: 'Error updating status' }, { status: 500 });
  }
}
