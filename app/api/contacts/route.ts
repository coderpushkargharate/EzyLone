import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendWelcomeEmail, sendContactAdminNotification } from '@/lib/email';
import { syncLeadToCrm } from '@/lib/crm';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';
import { normalizeIndianMobile } from '@/lib/phone';

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

    // India-only: reject out-of-country numbers. Store the normalized 10-digit form
    // so the CRM/WhatsApp downstream (which prefix +91) get a clean value and dedup works.
    const indianPhone = normalizeIndianMobile(phoneNumber);
    if (!indianPhone) {
      return NextResponse.json(
        { message: 'Please enter a valid Indian mobile number (10 digits, starting 6-9). We currently serve India only.' },
        { status: 400 },
      );
    }

    await connectDB();
    // Whitelist fields explicitly rather than spreading the raw body (see loans route).
    const contact = await Contact.create({
      fullName, email, phoneNumber: indianPhone, loanType,
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

    const leadMessage =
      `Loan Type: ${loanType} | Amount: ${loanAmount || 'Not specified'}` +
      (message ? ` | Message: ${message}` : '');

    // Create/attach a Lead in the SAME database the admin CRM reads from, so every
    // website enquiry lands in Lead Management, Activities, Analytics, Team and the
    // notification bell. De-duped by phone/email; a repeat enquiry is logged on the
    // existing lead's timeline instead of creating a second lead. Never throws — a
    // CRM hiccup must not turn a captured contact into a 500 for the visitor.
    try {
      await createLeadFromWebhook({
        name: fullName,
        email,
        phone: indianPhone,
        message: leadMessage,
        source: 'Website Contact Form',
      });
    } catch (crmErr) {
      console.error('Lead capture failed (contact still saved):', crmErr);
    }

    // External notifications (CRM mirror + WhatsApp confirmation) are fired WITHOUT
    // awaiting: the lead is already saved, so they must never delay or break the
    // visitor's response. Previously these were awaited, and a slow/unreachable
    // Twilio or CRM pushed the response past the client's 15s timeout — the visitor
    // saw "Something went wrong" even though the lead was captured. Both helpers
    // catch their own errors and never throw, so a bare .catch is just a safety net.
    void syncLeadToCrm({
      name: fullName,
      email,
      phone: indianPhone,
      message: leadMessage,
      source: 'Website Contact Form',
    }).catch((e) => console.error('CRM sync error (lead still saved):', e));

    void sendLeadConfirmationWhatsApp(indianPhone, fullName).catch((e) =>
      console.error('WhatsApp send error (lead still saved):', e),
    );

    return NextResponse.json({ message: 'Contact submitted', contact }, { status: 201 });
  } catch (error: any) {
    console.error('Contact error:', error);
    return NextResponse.json({ message: 'Error submitting contact', error: error.message }, { status: 500 });
  }
}
