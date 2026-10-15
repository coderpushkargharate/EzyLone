import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { LeadAttribution } from '@/lib/models/LeadAttribution';
import type { ILeadAttribution } from '@/lib/models/LeadAttribution';
import { Lead } from '@/lib/models/Lead';
import { normalizeIndianMobile } from '@/lib/phone';
import { deriveChannel } from './attribution';
import type { SanitizedAttribution } from './attribution';
import type { ConsentRecord, Touch } from './types';

export interface AttributionInput {
  crmSource?: string;
  attribution?: SanitizedAttribution;
  consent?: ConsentRecord;
  clientIp?: string;
  userAgent?: string;
  loanType?: string;
  meta?: ILeadAttribution['meta'];
}

/** Click ids carried by a touch (Google first-party click ids and Meta fbclid). */
function adClickOf(t?: Touch): ILeadAttribution['lastAdClick'] | undefined {
  if (!t || !(t.gclid || t.gbraid || t.wbraid || t.fbclid)) return undefined;
  return { gclid: t.gclid, gbraid: t.gbraid, wbraid: t.wbraid, fbclid: t.fbclid, at: t.at ? new Date(t.at) : new Date() };
}

function isDupKey(e: unknown): boolean {
  return !!e && typeof e === 'object' && (e as { code?: number }).code === 11000;
}

/**
 * Create or update the attribution row for a lead. First touch is written once
 * and never overwritten; last touch and consent move forward. Browser IP /
 * user agent are only stored while ad-measurement consent is granted.
 */
export async function recordAttribution(leadId: string, input: AttributionInput): Promise<void> {
  await connectDB();
  const a = input.attribution || {};
  const first = a.firstTouch || a.lastTouch;
  const last = a.lastTouch || a.firstTouch;
  const explicitConsent = input.consent && input.consent.adMeasurement !== 'unknown' ? input.consent : undefined;
  const grantedNow = explicitConsent?.adMeasurement === 'granted';

  const existing = await LeadAttribution.findOne({ leadId }).lean<ILeadAttribution>();
  if (!existing) {
    const doc: Partial<ILeadAttribution> = {
      leadId: new mongoose.Types.ObjectId(leadId),
      crmSource: input.crmSource,
      channel: deriveChannel(first, input.crmSource),
      lastChannel: deriveChannel(last, input.crmSource),
      firstTouch: first,
      lastTouch: last,
      touches: 1,
      lastAdClick: adClickOf(last) || adClickOf(first),
      meta: input.meta,
      fbp: a.fbp,
      fbc: a.fbc,
      pixelEventId: a.pixelEventId,
      eventSourceUrl: a.eventSourceUrl,
      loanType: input.loanType,
      consent: explicitConsent || { adMeasurement: 'unknown' },
      consentHistory: explicitConsent ? [explicitConsent] : [],
      lifecycle: { leadAt: new Date() },
    };
    if (grantedNow) {
      doc.clientIp = input.clientIp;
      doc.userAgent = input.userAgent?.slice(0, 512);
    }
    try {
      await LeadAttribution.create(doc);
      return;
    } catch (e) {
      if (!isDupKey(e)) throw e; // a concurrent request created it — fall through to update
    }
  }

  const set: Record<string, unknown> = {};
  const push: Record<string, unknown> = {};
  if (last) {
    set.lastTouch = last;
    // Acquisition channel stays as first recorded; only the latest-touch channel moves.
    set.lastChannel = deriveChannel(last, input.crmSource || existing?.crmSource);
  }
  // Merge per platform: a Meta click never erases the Google click id, and vice versa.
  const click = adClickOf(last);
  if (click?.gclid || click?.gbraid || click?.wbraid) {
    set['lastAdClick.gclid'] = click.gclid || null;
    set['lastAdClick.gbraid'] = click.gbraid || null;
    set['lastAdClick.wbraid'] = click.wbraid || null;
    set['lastAdClick.at'] = click.at;
  }
  if (click?.fbclid) set['lastAdClick.fbclid'] = click.fbclid;
  if (a.fbp) set.fbp = a.fbp;
  if (a.fbc) set.fbc = a.fbc;
  if (input.loanType) set.loanType = input.loanType;
  if (explicitConsent) {
    set.consent = explicitConsent;
    push.consentHistory = explicitConsent;
    if (!grantedNow) {
      // Consent withdrawn/declined: drop browser identifiers we hold.
      set.clientIp = null;
      set.userAgent = null;
    }
  }
  if (grantedNow) {
    if (input.clientIp) set.clientIp = input.clientIp;
    if (input.userAgent) set.userAgent = input.userAgent.slice(0, 512);
  }
  if (input.meta) {
    for (const [k, v] of Object.entries(input.meta)) if (v !== undefined && v !== null && v !== '') set[`meta.${k}`] = v;
  }
  const update: Record<string, unknown> = { $inc: { touches: 1 } };
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(push).length) update.$push = push;
  // First touch only fills a gap, never overwrites.
  if (first) await LeadAttribution.updateOne({ leadId, firstTouch: { $exists: false } }, { $set: { firstTouch: first } });
  await LeadAttribution.updateOne({ leadId }, update);
}

export async function setLifecycle(leadId: string, field: keyof ILeadAttribution['lifecycle'], at: Date): Promise<void> {
  await connectDB();
  // Keep the FIRST time each stage was reached.
  await LeadAttribution.updateOne({ leadId, [`lifecycle.${field}`]: { $exists: false } }, { $set: { [`lifecycle.${field}`]: at } });
}

/** Loan applications are linked to CRM leads by phone (then email), the same keys lead de-duplication uses. */
export async function findLeadIdForLoan(loan: { phoneNumber?: string; email?: string }): Promise<string | null> {
  await connectDB();
  const phone = normalizeIndianMobile(loan.phoneNumber);
  if (phone) {
    const byPhone = await Lead.findOne({ phone }).sort({ createdAt: 1 }).select('_id').lean();
    if (byPhone) return String(byPhone._id);
  }
  if (loan.email) {
    const byEmail = await Lead.findOne({ email: loan.email.toLowerCase() }).sort({ createdAt: 1 }).select('_id').lean();
    if (byEmail) return String(byEmail._id);
  }
  return null;
}
