import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendWelcomeEmail, sendContactAdminNotification } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/contacts — admin only
export async function GET(req: NextRequest) {
  if (!verifyAuth(req)) return unauthorized();
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return NextResponse.json(contacts);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error fetching contacts', error: error.message }, { status: 500 });
  }
}

// POST /api/contacts — public (rate-limited)
export async function POST(req: NextRequest) {
  const limited = formRateLimit(req);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { fullName, email, phoneNumber, loanType, loanAmount } = body;
    if (!fullName || !email || !phoneNumber || !loanType || !loanAmount) {
      return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }

    await connectDB();
    const contact = await Contact.create(body);

    await Promise.all([
      sendWelcomeEmail(fullName, email, 'enquiry'),
      sendContactAdminNotification(body),
    ]);

    return NextResponse.json({ message: 'Contact submitted', contact }, { status: 201 });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ message: 'Error submitting contact', error: error.message }, { status: 500 });
  }
}
