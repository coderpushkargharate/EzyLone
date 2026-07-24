import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { Activity } from '@/lib/models/Activity';
import { fetchNewLeadEmails } from '@/lib/imap';

export interface IngestResult {
  processed: number;
  created: number;
  skipped: number;
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
