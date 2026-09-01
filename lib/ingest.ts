import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { sendAdminPush } from '@/lib/push';

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
  // Optional CRM qualification fields — used by the EzySaathi AI chatbot/WhatsApp
  // pipeline so a qualified conversation lands as a tagged, staged CRM lead.
  priority?: 'HOT' | 'WARM' | 'COLD';
  loanType?: string;
  city?: string;
  leadStage?: string;
}

// Map an AI lead priority to a CRM group tag (used for filtering in the panel).
function priorityTag(p?: string): string | null {
  if (p === 'HOT') return '🔥 Hot';
  if (p === 'WARM') return '🟡 Warm';
  if (p === 'COLD') return '⚪ Cold';
  return null;
}

// The extra CRM tags/stage carried by a qualified AI lead.
function crmExtras(input: WebhookLeadInput): { groups: string[]; leadStage?: string } {
  const groups: string[] = [];
  const tag = priorityTag(input.priority);
  if (tag) groups.push(tag);
  if (input.loanType) groups.push(input.loanType);
  return { groups, leadStage: input.leadStage };
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
    if (dup) {
      // Same person enquired again (new form submission, not a duplicate webhook
      // redelivery). Don't spawn a second lead, but DO record the fresh enquiry
      // on the timeline and bump lastActivity so nothing goes unrecorded and the
      // lead resurfaces in "recently active" views. Merge any new priority/product
      // tags and stage so the CRM reflects the latest qualification.
      await Activity.create({
        leadId: dup._id,
        type: 'note',
        description: input.message
          ? `New enquiry via ${input.source}: ${input.message}`
          : `New enquiry via ${input.source}`,
      });
      const { groups, leadStage } = crmExtras(input);
      const update: Record<string, any> = { $set: { lastActivity: new Date() } };
      if (leadStage) update.$set.leadStage = leadStage;
      if (groups.length) update.$addToSet = { groups: { $each: groups } };
      await Lead.updateOne({ _id: dup._id }, update);
      return { created: false, leadId: String(dup._id) };
    }
  }

  const { groups, leadStage } = crmExtras(input);
  const lead = await Lead.create({
    name: input.name?.trim() || email || phone || 'Unknown Lead',
    email,
    phone,
    whatsapp: phone,
    notes: input.message ? `${input.source}: ${input.message}` : `Lead received via ${input.source}`,
    source: input.source,
    sourceMessageId: input.sourceMessageId,
    status: 'New',
    leadStage,
    groups: groups.length ? groups : undefined,
  });

  await Activity.create({
    leadId: lead._id,
    type: 'created',
    description: `Lead received from ${input.source}`,
  });

  // A genuinely NEW lead (not a dedup/repeat) — alert the admin app right away,
  // even when it's closed. Fire-and-forget; never blocks lead creation.
  void sendAdminPush({
    title: '🎯 New lead',
    body: `${lead.name || 'Someone'} via ${input.source}`,
    url: '/admin',
    tag: 'lead',
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
  // Lazy-loaded so the lightweight createLeadFromWebhook path (used by the
  // public website form routes) never pulls in the heavy IMAP/mail-parser deps.
  const { fetchNewLeadEmails } = await import('@/lib/imap');
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
