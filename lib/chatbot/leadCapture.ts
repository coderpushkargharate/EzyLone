// Shared lead-capture pipeline for Ezy AI, used by BOTH the website chat
// (app/api/chat) and the WhatsApp auto-reply bot (app/api/whatsapp/webhook).
//
// A chat/WhatsApp-captured lead goes through the SAME pipeline as an "Apply Now"
// (calling-team) lead: it is saved to the LoanApplication collection (so it
// appears in the admin dashboard alongside every other lead), then an admin
// email, CRM sync, and a WhatsApp confirmation are sent. Fields the chat doesn't
// collect (email, pincode, CIBIL) get tidy "via chat" placeholders. Every step is
// guarded so a DB/mail/CRM/Twilio hiccup never breaks the reply — the lead is
// saved first.

import { LeadData } from './engine';
import { connectDB } from '@/lib/db';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { syncLeadToCrm } from '@/lib/crm';
import { createLeadFromWebhook } from '@/lib/ingest';
import { sendLoanAdminNotification, sendWelcomeEmail } from '@/lib/email';
import { sendLeadConfirmationWhatsApp } from '@/lib/whatsapp';

export async function captureLead(lead: LeadData): Promise<void> {
  const fullName = lead.name || 'Ezy AI Lead';
  const email = lead.email || undefined;
  const phoneNumber = lead.phone || '';
  const loanType = lead.loanType || 'General enquiry';
  const employmentType = lead.employment || 'Not specified';
  const city = lead.city || 'Not provided';
  const pincode = 'Not provided (via chat)';
  const cibilScore = 'Not shared (via chat)';

  // 1) Persist to the admin's lead list (same collection as Apply Now).
  try {
    await connectDB();
    await LoanApplication.create({
      fullName, email, phoneNumber, loanType, employmentType, city, pincode, cibilScore,
    });
  } catch (e) {
    console.error('Chat lead DB save failed:', e);
  }

  // 2) Notify the admin/lead inbox by email (same template as Apply Now).
  try {
    await sendLoanAdminNotification({
      fullName, email: email || '', phoneNumber, loanType, employmentType, city, pincode, cibilScore,
    });
  } catch (e) {
    console.error('Chat lead admin email failed (lead still saved):', e);
  }

  // 2b) Confirmation email to the visitor — same welcome template as the
  // Apply Now / Contact forms. Only when we captured an email (guarded so it
  // never breaks the reply). sendWelcomeEmail itself no-ops without email.
  if (email) {
    try {
      await sendWelcomeEmail(fullName, email, 'loan');
    } catch (e) {
      console.error('Chat lead welcome email failed (lead still saved):', e);
    }
  }

  // 3) Land the lead in the admin CRM Lead Management (shared `leads` collection),
  // tagged with its AI priority + product and staged "AI Qualified" — deduped by
  // phone/email so a repeat chat/WhatsApp enquiry updates the same lead card.
  try {
    await createLeadFromWebhook({
      name: fullName,
      email,
      phone: phoneNumber,
      message: lead.message,
      source: lead.source,
      priority: lead.priority,
      loanType: lead.loanType,
      city: lead.city,
      leadStage: 'AI Qualified',
    });
  } catch (e) {
    console.error('Chat lead CRM (Lead Management) create failed (lead still saved):', e);
  }

  // 3b) Also mirror into any external CRM (Privyr etc.) — no-op when unconfigured.
  try {
    await syncLeadToCrm({
      name: fullName,
      email,
      phone: phoneNumber,
      message: lead.message,
      source: lead.source,
    });
  } catch (e) {
    console.error('Chat lead external CRM sync failed (lead still saved):', e);
  }

  // 4) WhatsApp confirmation to the lead (template/free-text auto-picked by env).
  if (phoneNumber) {
    try {
      await sendLeadConfirmationWhatsApp(phoneNumber, fullName);
    } catch (e) {
      console.error('Chat lead WhatsApp failed (lead still saved):', e);
    }
  }
}
