import { connectDB } from '@/lib/db';
import { Lead } from '@/lib/models/Lead';
import { LoanApplication } from '@/lib/models/LoanApplication';
import { LeadAttribution } from '@/lib/models/LeadAttribution';
import type { ILeadAttribution } from '@/lib/models/LeadAttribution';
import type { IConversionEvent } from '@/lib/models/ConversionEvent';
import { getSettings, mappingFor } from './settings';
import { evaluateConsent } from './consent';
import type { ConsentDecision } from './consent';
import type { EventStatus, ErrorKind } from './types';

// Shared delivery context: everything a platform sender needs about the event's
// lead, loaded fresh at SEND time so a consent withdrawal after queueing is
// still honoured. Only matching identifiers are loaded — loan amounts, income,
// CIBIL score and documents are never read here and never leave the CRM.

export interface DeliveryOutcome {
  status: EventStatus;
  message: string;
  httpStatus?: number;
  traceId?: string;
  requestId?: string;
  errorKind?: ErrorKind;
  /** For 'retry': when to try next is decided by the worker. */
  rateLimited?: boolean;
}

export interface DeliveryContext {
  lead: { _id: unknown; name?: string; email?: string; phone?: string } | null;
  attr: ILeadAttribution | null;
  loan: { city?: string; pincode?: string } | null;
  decision: ConsentDecision;
  settings: Awaited<ReturnType<typeof getSettings>>;
  mapping: ReturnType<typeof mappingFor>;
}

export async function loadDeliveryContext(ev: IConversionEvent): Promise<DeliveryContext> {
  await connectDB();
  const settings = await getSettings();
  const lead = ev.leadId ? await Lead.findById(ev.leadId).select('name email phone').lean() : null;
  const attr = ev.leadId ? await LeadAttribution.findOne({ leadId: ev.leadId }).lean<ILeadAttribution>() : null;
  const loan = ev.loanId ? await LoanApplication.findById(ev.loanId).select('city pincode').lean() : null;
  const decision = evaluateConsent(
    ev.platform,
    attr?.consent,
    { allowLeadIdOnlyForLeadAds: settings.consent?.allowLeadIdOnlyForLeadAds === true },
    { metaLeadId: attr?.meta?.leadgenId }
  );
  return { lead, attr, loan, decision, settings, mapping: mappingFor(settings, ev.crmEvent) };
}
