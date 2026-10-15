import { connectDB } from '@/lib/db';
import { LeadAttribution } from '@/lib/models/LeadAttribution';
import type { ILeadAttribution } from '@/lib/models/LeadAttribution';
import { Lead } from '@/lib/models/Lead';
import { ConversionEvent } from '@/lib/models/ConversionEvent';
import { getSettings, mappingFor } from './settings';
import { evaluateConsent } from './consent';
import { enqueueConversion } from './ledger';
import { findLeadIdForLoan, recordAttribution, setLifecycle } from './attributionStore';
import type { AttributionInput } from './attributionStore';
import { getConnection } from './connections';
import { mlog } from './log';
import { DELIVERED_STATUSES } from './types';
import type { CrmEvent } from './types';

// CRM lifecycle → conversion ledger. These hooks are called from the existing
// lead / loan routes AFTER the CRM change is saved. They only react to real CRM
// state (a status actually changing, a loan actually created / sanctioned /
// disbursed) — nothing here ever changes a lead or loan. Every hook swallows its
// own errors: a marketing failure must never break a CRM write or a form submit.

const LIFECYCLE_FIELD: Record<CrmEvent, keyof ILeadAttribution['lifecycle']> = {
  Lead: 'leadAt',
  QualifiedLead: 'qualifiedAt',
  SubmitApplication: 'applicationAt',
  ApprovedApplication: 'approvedAt',
  LoanDisbursed: 'disbursedAt',
};

async function safe(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    mlog('error', 'lifecycle_hook_failed', { hook: name, error: e instanceof Error ? e.message : String(e) });
  }
}

/** Queue the configured platform events for one CRM moment. */
export async function emitCrmEvent(
  crmEvent: CrmEvent,
  ctx: { leadId: string | null; loanId?: string | null; eventTime?: Date }
): Promise<void> {
  await connectDB();
  const eventTime = ctx.eventTime || new Date();
  if (ctx.leadId) await setLifecycle(ctx.leadId, LIFECYCLE_FIELD[crmEvent], eventTime);

  const settings = await getSettings();
  const mapping = mappingFor(settings, crmEvent);
  if (!mapping || (!mapping.meta.enabled && !mapping.google.enabled)) return;

  const attr = ctx.leadId ? await LeadAttribution.findOne({ leadId: ctx.leadId }).lean<ILeadAttribution>() : null;
  const lead = ctx.leadId ? await Lead.findById(ctx.leadId).select('source').lean() : null;
  const subject = ctx.loanId ? { kind: 'loan' as const, id: ctx.loanId } : { kind: 'lead' as const, id: ctx.leadId || '' };
  if (!subject.id) return;
  const policy = { allowLeadIdOnlyForLeadAds: settings.consent?.allowLeadIdOnlyForLeadAds === true };
  const common = {
    crmEvent,
    subject,
    leadId: ctx.leadId,
    loanId: ctx.loanId || null,
    eventTime,
    value: mapping.value,
    currency: settings.currency || 'INR',
    source: lead?.source,
    channel: attr?.channel,
  };

  if (mapping.meta.enabled) {
    const testMode = settings.testMode?.meta !== false;
    const decision = evaluateConsent('meta', attr?.consent, policy, { metaLeadId: attr?.meta?.leadgenId });
    // Website Lead events use action_source "website" and the browser Pixel's
    // eventID so Meta de-duplicates the Pixel and server copies. Everything
    // that happens later in the CRM is a CRM ("system_generated") event.
    const isWebsiteLead = crmEvent === 'Lead' && !attr?.meta?.leadgenId && !!attr?.eventSourceUrl;
    await enqueueConversion({
      ...common,
      platform: 'meta',
      testMode,
      platformEventName: mapping.meta.eventName || crmEvent,
      eventId: isWebsiteLead && attr?.pixelEventId && !testMode ? attr.pixelEventId : undefined,
      consentState: attr?.consent?.adMeasurement || 'unknown',
      consentReason: decision.reason,
      sendMode: decision.mode,
      allowed: decision.allowed,
      actionSource: isWebsiteLead ? 'website' : 'system_generated',
    });
  }

  if (mapping.google.enabled && mapping.google.conversionActionId) {
    const testMode = settings.testMode?.google !== false;
    const decision = evaluateConsent('google', attr?.consent, policy, {});
    const conn = await getConnection('google');
    const allowed = decision.allowed && decision.mode === 'full';
    await enqueueConversion({
      ...common,
      platform: 'google',
      testMode,
      platformEventName: mapping.google.conversionActionId,
      consentState: attr?.consent?.adMeasurement || 'unknown',
      consentReason: conn?.google?.customerId ? decision.reason : `${decision.reason} (Google Ads account not selected yet.)`,
      sendMode: decision.mode,
      allowed,
    });
  }
}

/** A lead was captured by any ingestion path (website form, Lead Ads, webhook). */
export async function onLeadCaptured(leadId: string, created: boolean, input: AttributionInput): Promise<void> {
  await safe('onLeadCaptured', async () => {
    await recordAttribution(leadId, input);
    // A repeat enquiry from an existing lead is not a new Lead conversion.
    if (created) await emitCrmEvent('Lead', { leadId });
  });
}

/** Lead status changed in the CRM (Lead Management PATCH). */
export async function onLeadStatusChanged(leadId: string, from: string, to: string): Promise<void> {
  await safe('onLeadStatusChanged', async () => {
    if (from === to) return;
    const settings = await getSettings();
    const qualified = settings.qualifiedStatuses || [];
    if (qualified.includes(to) && !qualified.includes(from)) {
      await emitCrmEvent('QualifiedLead', { leadId });
    }
  });
}

interface LoanLike {
  _id: unknown;
  phoneNumber?: string;
  email?: string;
  loanType?: string;
  status?: string;
  pipelineStage?: string;
}

export async function onLoanCreated(loan: LoanLike): Promise<void> {
  await safe('onLoanCreated', async () => {
    const leadId = await findLeadIdForLoan(loan);
    if (leadId && loan.loanType) await LeadAttribution.updateOne({ leadId }, { $set: { loanType: loan.loanType } });
    await emitCrmEvent('SubmitApplication', { leadId, loanId: String(loan._id) });
  });
}

/** Loan updated by staff (status or pipeline stage). `before` is the stored row prior to the update. */
export async function onLoanChanged(before: LoanLike, after: LoanLike): Promise<void> {
  await safe('onLoanChanged', async () => {
    const loanId = String(after._id);
    const becameApproved =
      (after.status === 'approved' && before.status !== 'approved') ||
      (after.pipelineStage === 'Sanctioned' && before.pipelineStage !== 'Sanctioned');
    const becameDisbursed = after.pipelineStage === 'Disbursed' && before.pipelineStage !== 'Disbursed';
    const becameRejected =
      (after.status === 'rejected' && before.status !== 'rejected') ||
      (after.pipelineStage === 'Rejected' && before.pipelineStage !== 'Rejected');

    if (becameApproved || becameDisbursed) {
      const leadId = await findLeadIdForLoan(after);
      // A loan can be disbursed without the approval step having been recorded;
      // approval is implied, so both moments are reported (each exactly once).
      await emitCrmEvent('ApprovedApplication', { leadId, loanId });
      if (becameDisbursed) await emitCrmEvent('LoanDisbursed', { leadId, loanId });
    }
    if (becameRejected) {
      // Never retract automatically — flag delivered conversions for an admin to review.
      await ConversionEvent.updateMany(
        { loanId, crmEvent: { $in: ['ApprovedApplication', 'LoanDisbursed'] }, status: { $in: DELIVERED_STATUSES } },
        { $set: { needsReview: 'Loan was later marked rejected — review whether this conversion should be retracted.' } }
      );
    }
  });
}
