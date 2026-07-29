import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { fetchNewLeadEmails } from '@/lib/imap';

export interface IngestResult {
  processed: number;
  created: number;
  skipped: number;
}

export interface WebhookLeadInput {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  source: string;
  // A stable per-source id (e.g. Facebook leadgen_id) so repeated webhook
  // deliveries of the SAME lead don't create duplicates.
  sourceMessageId?: string;
}

/**
 * Create a lead from any real-time webhook source (Facebook/Instagram Lead Ads,
 * a form-builder webhook, etc.). Writes to the same shared `leads`/`activities`
 * collections the CRM and Email-to-Lead sync use, so everything lands in the
 * admin Lead Management tab together.
 *
 * De-duplicated first by `sourceMessageId`, then by phone/email — so a lead who
 * already exists is skipped instead of duplicated.
 */
export async function createLeadFromWebhook(
  input: WebhookLeadInput
): Promise<{ created: boolean; leadId: string }> {
  await connectDB();

  if (input.sourceMessageId) {
    const existing = await Lead.findOne({ sourceMessageId: input.sourceMessageId }).lean();
    if (existing) return { created: false, leadId: String(existing._id) };
  }

  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();
  const orConds: Record<string, string>[] = [];
  if (email) orConds.push({ email });
  if (phone) orConds.push({ phone });
  if (orConds.length) {
    const dup = await Lead.findOne({ $or: orConds }).lean();
    if (dup) return { created: false, leadId: String(dup._id) };
  }

  const lead = await Lead.create({
    name: input.name?.trim() || email || phone || 'Unknown Lead',
    email,
    phone,
    whatsapp: phone,
    notes: input.message ? `${input.source}: ${input.message}` : `Lead received via ${input.source}`,
    source: input.source,
    sourceMessageId: input.sourceMessageId,
    status: 'New',
  });

  await Activity.create({
    leadId: lead._id,
    type: 'created',
    description: `Lead received from ${input.source}`,
  });

  return { created: true, leadId: String(lead._id) };
}

/**
 * Read new emails from the configured inbox and turn each into a lead.
 * Deduped by the email's Message-ID so re-runs are safe. Ported from
 * EzyLoanCrm; writes to the same shared `leads`/`activities` collections.
 */
export async function ingestLeadEmails(): Promise<IngestResult> {
  await connectDB();
  const parsedLeads = await fetchNewLeadEmails();

  let created = 0;
  let skipped = 0;

  for (const p of parsedLeads) {
    if (p.messageId) {
      const existing = await Lead.findOne({ sourceMessageId: p.messageId }).lean();
      if (existing) {
        skipped++;
        continue;
      }
    }

    const lead = await Lead.create({
      name: p.name,
      email: p.email,
      phone: p.phone,
      notes: p.message ? `Email Inquiry: ${p.message}` : 'Lead received via email',
      source: p.source,
      sourceMessageId: p.messageId,
      status: 'New',
    });

    await Activity.create({
      leadId: lead._id,
      type: 'created',
      description: `Lead received from ${p.source}`,
    });

    created++;
  }

  return { processed: parsedLeads.length, created, skipped };
}
