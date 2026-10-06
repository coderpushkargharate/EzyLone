import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { requireAuth } from '@/lib/auth';
import { formRateLimit, getClientIp } from '@/lib/rateLimit';
import { isBlocked, blockIp, noteBlockedHit, recordStrike } from '@/lib/blocklist';
import { inspectFormGuard } from '@/lib/formGuard';
import { str, isEmail } from '@/lib/validate';
import { sendWelcomeEmail, sendLoanAdminNotification } from '@/lib/email';
import { syncLeadToCrm } from '@/lib/crm';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';
import { normalizeIndianMobile } from '@/lib/phone';
import { geoGateIndia } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/loans — admin only
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['loans', 'dashboard'] });
  if ('error' in gate) return gate.error;
  try {
    await connectDB();
    const loans = await LoanApplication.find().sort({ createdAt: -1 }).limit(5000).lean();
    return NextResponse.json(loans, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Fetch loans error:', error);
    return NextResponse.json({ message: 'Error fetching loans' }, { status: 500 });
  }
}

// POST /api/loans — public (rate-limited + spam-guarded)
export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  // Hard block: IPs on the blocklist (auto-flagged spammers or admin-banned)
  // never reach the form logic — nothing is saved, no email is sent.
  if (await isBlocked(ip)) {
    await noteBlockedHit(ip);
    return NextResponse.json({ message: 'Request blocked.' }, { status: 403 });
  }

  const limited = formRateLimit(req);
  if (limited) {
    // Repeated hammering from one IP earns strikes → auto-block.
    await recordStrike(ip, 'rate-limit-abuse');
    return limited;
  }

  // India-only gate: block submissions from non-India IP addresses and record
  // the origin. Fails open for private/unresolvable IPs (see lib/geo.ts).
  const geo = await geoGateIndia(req);
  if (!geo.allowed) {
    return NextResponse.json(
      { message: 'We currently serve customers in India only.' },
      { status: 403 },
    );
  }

  try {
    const body = await req.json();

    // Spam guard: honeypot + signed form token (see lib/formGuard.ts).
    const guard = inspectFormGuard(body);
    if (guard.honeypot) {
      // A filled honeypot is a near-certain bot. Block the IP and return a
      // success-looking response so the bot thinks it worked and moves on —
      // nothing is saved and no email is sent.
      await blockIp(ip, 'honeypot', 'auto');
      return NextResponse.json({ message: 'Loan submitted' }, { status: 201 });
    }
    if (guard.tokenProblem) {
      // Missing/forged token = a script posting straight at the API. Count it
      // toward the IP's auto-block strikes. (An expired token just means the
      // tab was open for hours — ask for a refresh, no strike.)
      if (guard.tokenProblem !== 'expired') await recordStrike(ip, `form-token-${guard.tokenProblem}`);
      return NextResponse.json(
        { message: 'Your session expired. Please refresh the page and submit again.' },
        { status: 400 },
      );
    }

    const fullName = str(body.fullName, 100);
    const phoneNumber = str(body.phoneNumber, 20);
    const loanType = str(body.loanType, 60);
    const employmentType = str(body.employmentType, 60);
    const city = str(body.city, 80);
    const pincode = str(body.pincode, 10);
    const cibilScore = str(body.cibilScore, 30);
    const email = str(body.email, 254).toLowerCase() || undefined;
    if (!fullName || !phoneNumber || !loanType || !employmentType || !city || !pincode || !cibilScore) {
      return NextResponse.json({ message: 'All fields required' }, { status: 400 });
    }
    if (!/^[0-9]{6}$/.test(pincode)) {
      return NextResponse.json({ message: 'Please enter a valid 6-digit pincode.' }, { status: 400 });
    }
    if (email && !isEmail(email)) {
      return NextResponse.json({ message: 'Please enter a valid email address.' }, { status: 400 });
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
    // Whitelist fields explicitly — never spread the raw body into create(), or
    // a caller could set server-controlled fields like `status` (e.g. ship an
    // already-"approved" application straight into the admin dashboard).
    const loanApplication = await LoanApplication.create({
      fullName, email, phoneNumber: indianPhone, loanType, employmentType, city, pincode, cibilScore,
    });

    // The application is already saved above. A mail failure must NOT turn a
    // captured application into a 500 the applicant reads as "failed".
    try {
      await Promise.all([
        sendWelcomeEmail(fullName, email, 'loan'),
        sendLoanAdminNotification({ fullName, email, phoneNumber: indianPhone, loanType, employmentType, city, pincode, cibilScore }),
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
        phone: indianPhone,
        message: leadMessage,
        source: 'Website Apply Now',
        ip: geo.ip,
        country: geo.country || undefined,
        countryCode: geo.countryCode || undefined,
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
      phone: indianPhone,
      message: leadMessage,
      source: 'Website Apply Now',
    }).catch((e) => console.error('CRM sync error (application still saved):', e));

    void sendLeadConfirmationWhatsApp(indianPhone, fullName, loanType).catch((e) =>
      console.error('WhatsApp send error (application still saved):', e),
    );

    return NextResponse.json({ message: 'Loan submitted', id: loanApplication._id }, { status: 201 });
  } catch (error) {
    console.error('Loan error:', error);
    return NextResponse.json({ message: 'Error submitting loan' }, { status: 500 });
  }
}
