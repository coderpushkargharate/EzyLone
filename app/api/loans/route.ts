import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendWelcomeEmail, sendLoanAdminNotification } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/loans — admin only
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const loans = await LoanApplication.find().sort({ createdAt: -1 });
    return NextResponse.json(loans);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching loans', error: error.message }, { status: 500 });
  }
}

// POST /api/loans — public (rate-limited)
export async function POST(req: NextRequest) {
  const limited = formRateLimit(req);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { fullName, phoneNumber, loanType, employmentType, city, pincode, cibilScore, email } = body;
    if (!fullName || !phoneNumber || !loanType || !employmentType || !city || !pincode || !cibilScore) {
      return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }

    await connectDB();
    // Whitelist fields explicitly — never spread the raw body into create(), or
    // a caller could set server-controlled fields like `status` (e.g. ship an
    // already-"approved" application straight into the admin dashboard).
    const loanApplication = await LoanApplication.create({
      fullName, email, phoneNumber, loanType, employmentType, city, pincode, cibilScore,
    });

    await Promise.all([
      sendWelcomeEmail(fullName, email, 'loan'),
      sendLoanAdminNotification(body),
    ]);

    return NextResponse.json({ message: 'Loan submitted', loanApplication }, { status: 201 });
  } catch (error: any) {
    console.error('Loan error:', error);
    return NextResponse.json({ message: 'Error submitting loan', error: error.message }, { status: 500 });
  }
}
