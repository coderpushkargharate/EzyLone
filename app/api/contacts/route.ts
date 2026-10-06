import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Contact } from '@/lib/models/Contact';
import { requireAuth } from '@/lib/auth';
import { formRateLimit, getClientIp } from '@/lib/rateLimit';
import { isBlocked, blockIp, noteBlockedHit, recordStrike } from '@/lib/blocklist';
import { inspectFormGuard } from '@/lib/formGuard';
import { str, isEmail } from '@/lib/validate';
import { sendWelcomeEmail, sendContactAdminNotification } from '@/lib/email';
import { syncLeadToCrm } from '@/lib/crm';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';
import { normalizeIndianMobile } from '@/lib/phone';
import { geoGateIndia } from '@/lib/geo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/contacts — admin only
export async function GET(req: NextRequest) {
  const gate = await requireAuth(req, { permission: ['contacts', 'dashboard'] });
  if ('error' in gate) return gate.error;
  try {
    await connectDB();
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(5000).lean();
    return NextResponse.json(contacts, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return NextResponse.json({ message: 'Error fetching contacts' }, { status: 500 });
  }
}

// POST /api/contacts — public (rate-limited + spam-guarded)
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
      return NextResponse.json({ message: 'Contact submitted' }, { status: 201 });
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
    const email = str(body.email, 254).toLowerCase();
    const phoneNumber = str(body.phoneNumber, 20);
    const loanType = str(body.loanType, 60);
    const loanAmount = str(body.loanAmount, 30);
    const message = str(body.message, 2000);
    // loanAmount is intentionally NOT required here: the hero form marks it
    // "(Optional)". Requiring it silently rejected (400) every lead that left it
    // blank, which the user only saw as a generic "Something went wrong".
    if (!fullName || !email || !phoneNumber || !loanType) {
      return NextResponse.json({ message: 'Name, email, phone and loan type are required' }, { status: 400 });
    }
    if (!isEmail(email)) {
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
        sendContactAdminNotification({ fullName, email, phoneNumber: indianPhone, loanType, loanAmount, message }),
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
        ip: geo.ip,
        country: geo.country || undefined,
        countryCode: geo.countryCode || undefined,
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

    void sendLeadConfirmationWhatsApp(indianPhone, fullName, loanType).catch((e) =>
      console.error('WhatsApp send error (lead still saved):', e),
    );

    return NextResponse.json({ message: 'Contact submitted', id: contact._id }, { status: 201 });
  } catch (error) {
    console.error('Contact error:', error);
    return NextResponse.json({ message: 'Error submitting contact' }, { status: 500 });
  }
}
