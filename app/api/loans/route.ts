import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { verifyAuth, unauthorized } from '@/lib/auth';
import { formRateLimit } from '@/lib/rateLimit';
import { sendWelcomeEmail, sendLoanAdminNotification } from '@/lib/email';
import { syncLeadToCrm } from '@/lib/crm';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';

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

    // The application is already saved above. A mail failure must NOT turn a
    // captured application into a 500 the applicant reads as "failed".
    try {
      await Promise.all([
        sendWelcomeEmail(fullName, email, 'loan'),
        sendLoanAdminNotification(body),
      ]);
    } catch (mailErr) {
      console.error('Loan notification email failed (application still saved):', mailErr);
    }

    const leadMessage =
      `Loan Type: ${loanType} | Employment: ${employmentType} | ` +
      `City: ${city} | Pincode: ${pincode} | CIBIL: ${cibilScore}`;

    // Create/attach a Lead in the SAME database the admin CRM reads from, so every
    // Apply-Now application lands in Lead Management, Activities, Analytics, Team
    // and the notification bell. De-duped by phone/email; a repeat application is
    // logged on the existing lead's timeline. Never throws — a CRM hiccup must not
    // turn a captured application into a 500 for the applicant.
    try {
      await createLeadFromWebhook({
        name: fullName,
        email,
        phone: phoneNumber,
        message: leadMessage,
        source: 'Website Apply Now',
      });
    } catch (crmErr) {
      console.error('Lead capture failed (application still saved):', crmErr);
    }

    // External notifications (CRM mirror + WhatsApp confirmation) are fired WITHOUT
    // awaiting: the application is already saved, so they must never delay or break
    // the applicant's response. A slow/unreachable Twilio or CRM would otherwise push
    // the response past the client's 15s timeout ("Something went wrong"). Both
    // helpers catch their own errors and never throw — the .catch is a safety net.
    void syncLeadToCrm({
      name: fullName,
      email,
      phone: phoneNumber,
      message: leadMessage,
      source: 'Website Apply Now',
    }).catch((e) => console.error('CRM sync error (application still saved):', e));

    void sendLeadConfirmationWhatsApp(phoneNumber, fullName).catch((e) =>
      console.error('WhatsApp send error (application still saved):', e),
    );

    return NextResponse.json({ message: 'Loan submitted', loanApplication }, { status: 201 });
  } catch (error: any) {
    console.error('Loan error:', error);
    return NextResponse.json({ message: 'Error submitting loan', error: error.message }, { status: 500 });
  }
}
