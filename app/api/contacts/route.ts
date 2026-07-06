import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendWelcomeEmail, sendContactAdminNotification } from '@/lib/email';
import { syncLeadToCrm } from '@/lib/crm';

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
    const { fullName, email, phoneNumber, loanType, loanAmount, message } = body;
    // loanAmount is intentionally NOT required here: the hero form marks it
    // "(Optional)". Requiring it silently rejected (400) every lead that left it
    // blank, which the user only saw as a generic "Something went wrong".
    if (!fullName || !email || !phoneNumber || !loanType) {
      return NextResponse.json({ message: 'Name, email, phone and loan type are required' }, { status: 400 });
    }

    await connectDB();
    // Whitelist fields explicitly rather than spreading the raw body (see loans route).
    const contact = await Contact.create({
      fullName, email, phoneNumber, loanType,
      loanAmount: loanAmount || 'Not specified',
      message,
    });

    // The lead is already saved above. A mail failure (SMTP down, bad address)
    // must NOT turn a captured lead into a 500 the visitor reads as "failed".
    try {
      await Promise.all([
        sendWelcomeEmail(fullName, email, 'enquiry'),
        sendContactAdminNotification(body),
      ]);
    } catch (mailErr) {
      console.error('Contact notification email failed (lead still saved):', mailErr);
    }

    // Mirror the lead into EzyLoanCrm. Non-blocking + never throws — same
    // guarantee as the email step: a CRM outage never affects the visitor.
    await syncLeadToCrm({
      name: fullName,
      email,
      phone: phoneNumber,
      message: `Loan Type: ${loanType} | Amount: ${loanAmount || 'Not specified'}` +
        (message ? ` | Message: ${message}` : ''),
      source: 'Website Contact Form',
    });

    return NextResponse.json({ message: 'Contact submitted', contact }, { status: 201 });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ message: 'Error submitting contact', error: error.message }, { status: 500 });
  }
}
