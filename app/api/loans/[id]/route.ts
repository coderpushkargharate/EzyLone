import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
