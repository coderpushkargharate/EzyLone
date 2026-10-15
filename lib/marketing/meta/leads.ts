import { connectDB } from '@/lib/db';
import { MetaLeadReceipt } from '@/lib/models/MetaLeadReceipt';
import type { IMetaLeadReceipt } from '@/lib/models/MetaLeadReceipt';
import { MarketingConnection } from '@/lib/models/MarketingConnection';
import type { IMarketingConnection } from '@/lib/models/MarketingConnection';
import { createLeadFromWebhook } from '@/lib/ingest';
import { graph } from './graph';
import { getPageToken, recordConnectionError, recordConnectionSuccess } from '../connections';
import { LEAD_FIELDS_BASIC, LEAD_FIELDS_FULL, consentFromDisclaimer, mapLeadFields } from './leadFields';
import type { MetaLeadData } from './leadFields';
import { getSettings } from '../settings';
import { backoffMs, shouldDeadLetter } from '../retry';
import { PlatformError } from '../types';
import { decryptSecret } from '../secrets';
import { mlog, syncLog } from '../log';

// Meta Lead Ads ingestion: webhook / backfill → receipt (unique per leadgen_id)
// → fetch field data via the Graph API → CRM lead via the existing
// createLeadFromWebhook (same de-duplication, activity timeline and push alert
// as before) → attribution + "Lead" conversion via the lifecycle hook.

export interface LeadgenChange {
  leadgen_id?: string | number;
  page_id?: string | number;
  form_id?: string | number;
  ad_id?: string | number;
  adgroup_id?: string | number;
  created_time?: number;
}

/** Record a leadgen notification. Returns whether it was new (false = duplicate delivery). */
export async function recordLeadgen(
  ch: LeadgenChange,
  via: 'webhook' | 'backfill',
  signatureVerified: boolean
): Promise<{ isNew: boolean; receiptId: string | null }> {
  await connectDB();
  const leadgenId = ch.leadgen_id != null ? String(ch.leadgen_id) : '';
  if (!/^\d{5,30}$/.test(leadgenId)) return { isNew: false, receiptId: null };
  const res = await MetaLeadReceipt.updateOne(
    { leadgenId },
    {
      $setOnInsert: {
        leadgenId,
        pageId: ch.page_id != null ? String(ch.page_id) : undefined,
        formId: ch.form_id != null ? String(ch.form_id) : undefined,
        adId: ch.ad_id != null ? String(ch.ad_id) : undefined,
        adgroupId: ch.adgroup_id != null ? String(ch.adgroup_id) : undefined,
        createdTime: typeof ch.created_time === 'number' ? new Date(ch.created_time * 1000) : undefined,
        receivedVia: via,
        signatureVerified,
        status: 'pending',
        attempts: 0,
        nextAttemptAt: new Date(),
      },
    },
    { upsert: true }
  ).catch((e) => {
    if ((e as { code?: number }).code === 11000) return { upsertedCount: 0 };
    throw e;
  });
  if (res.upsertedCount) {
    const doc = await MetaLeadReceipt.findOne({ leadgenId }).select('_id').lean();
    return { isNew: true, receiptId: doc ? String(doc._id) : null };
  }
  await MetaLeadReceipt.updateOne({ leadgenId }, { $inc: { deliveries: 1 } });
  return { isNew: false, receiptId: null };
}

async function fetchLead(leadgenId: string, token: string): Promise<MetaLeadData> {
  try {
    return (await graph.get(`/${leadgenId}`, token, { fields: LEAD_FIELDS_FULL })) as unknown as MetaLeadData;
  } catch (e) {
    // Ad/campaign names need ads permissions the Page token may lack — retry with the basic field set.
    if (e instanceof PlatformError && (e.kind === 'permission' || e.kind === 'invalid')) {
      return (await graph.get(`/${leadgenId}`, token, { fields: LEAD_FIELDS_BASIC })) as unknown as MetaLeadData;
    }
    throw e;
  }
}

/** Claim one due receipt (lease-based, safe across processes). */
async function claimReceipt(): Promise<IMetaLeadReceipt | null> {
  const now = new Date();
  return MetaLeadReceipt.findOneAndUpdate(
    {
      $or: [
        { status: { $in: ['pending', 'retry'] }, nextAttemptAt: { $lte: now } },
        { status: 'processing', lockedUntil: { $lt: now } }, // worker crashed mid-job
      ],
    },
    { $set: { status: 'processing', lockedUntil: new Date(now.getTime() + 2 * 60_000) }, $inc: { attempts: 1 } },
    { sort: { nextAttemptAt: 1 }, new: true }
  ).lean<IMetaLeadReceipt>();
}

export async function processReceipt(r: IMetaLeadReceipt): Promise<'done' | 'retry' | 'failed' | 'dead'> {
  const { token, via } = await getPageToken(r.pageId);
  try {
    if (!token) {
      throw new PlatformError({ kind: 'config', retryable: true, message: 'No Page access token for this page — connect Meta and subscribe the page.' });
    }
    const lead = await fetchLead(r.leadgenId, token);
    const mapped = mapLeadFields(lead);
    if (!mapped.hasContact) throw new PlatformError({ kind: 'invalid', retryable: false, message: 'Lead has no name, email or phone.' });

    const settings = await getSettings();
    const consentState = consentFromDisclaimer(lead, settings.consent?.metaLeadFormConsentKey);
    const conn = await MarketingConnection.findOne({ provider: 'meta' }).select('meta.pages').lean<IMarketingConnection>();
    const form = conn?.meta?.pages?.flatMap((p) => p.forms || []).find((f) => f.id === (lead.form_id || r.formId));

    const notes = ['Submitted via Facebook / Instagram Lead Ad', form ? `Form: ${form.name}` : '', lead.campaign_name ? `Campaign: ${lead.campaign_name}` : '', ...mapped.extraNotes]
      .filter(Boolean)
      .join(' | ')
      .slice(0, 2000);

    const result = await createLeadFromWebhook({
      name: mapped.name,
      email: mapped.email,
      phone: mapped.phone,
      message: notes,
      source: 'Facebook Lead Ads',
      sourceMessageId: `fb_${r.leadgenId}`,
      loanType: mapped.loanType,
      marketing: {
        crmSource: 'Facebook Lead Ads',
        loanType: mapped.loanType,
        consent: consentState === 'unknown' ? undefined : { adMeasurement: consentState, source: 'meta_lead_form_disclaimer', collectedAt: lead.created_time ? new Date(lead.created_time) : new Date() },
        meta: {
          leadgenId: r.leadgenId,
          pageId: r.pageId,
          formId: lead.form_id || r.formId,
          formName: form?.name,
          adId: lead.ad_id || r.adId,
          adName: lead.ad_name,
          adsetId: lead.adset_id || r.adgroupId,
          adsetName: lead.adset_name,
          campaignId: lead.campaign_id,
          campaignName: lead.campaign_name,
          platform: lead.platform,
          isOrganic: lead.is_organic,
          createdTime: lead.created_time ? new Date(lead.created_time) : r.createdTime,
        },
      },
    });
    await MetaLeadReceipt.updateOne(
      { _id: r._id },
      { $set: { status: 'done', processedAt: new Date(), leadId: result.leadId, leadCreated: result.created, lockedUntil: null, lastError: null } }
    );
    if (via === 'oauth') await recordConnectionSuccess('meta');
    return 'done';
  } catch (e) {
    const err = e instanceof PlatformError ? e : new PlatformError({ kind: 'transient', retryable: true, message: (e as Error)?.message || String(e) });
    if (err.kind === 'auth' || err.kind === 'permission') await recordConnectionError('meta', err.message, err.kind);
    // Auth/permission problems are retried too: they are fixed by reconnecting, and the lead must not be lost meanwhile.
    const retryable = err.retryable || err.kind === 'auth' || err.kind === 'permission' || err.kind === 'config';
    const dead = shouldDeadLetter(r.attempts);
    const status = !retryable ? 'failed' : dead ? 'dead' : 'retry';
    await MetaLeadReceipt.updateOne(
      { _id: r._id },
      {
        $set: {
          status,
          lockedUntil: null,
          lastError: err.message.slice(0, 500),
          nextAttemptAt: new Date(Date.now() + backoffMs(r.attempts, { rateLimited: err.kind === 'rate_limit' })),
        },
      }
    );
    mlog(status === 'retry' ? 'warn' : 'error', 'meta_lead_fetch_failed', { leadgenId: r.leadgenId, status, kind: err.kind, error: err.message });
    if (status !== 'retry') await syncLog('meta', 'lead_fetch', 'error', `Lead ${r.leadgenId} ${status}: ${err.message}`);
    return status;
  }
}

/** Process due receipts. Returns counts for the worker summary. */
export async function processDueReceipts(limit = 20): Promise<Record<string, number>> {
  await connectDB();
  const counts: Record<string, number> = {};
  for (let i = 0; i < limit; i++) {
    const r = await claimReceipt();
    if (!r) break;
    const outcome = await processReceipt(r);
    counts[outcome] = (counts[outcome] || 0) + 1;
  }
  return counts;
}

/** Process one specific receipt right away (used inline by the webhook for low latency). */
export async function processReceiptNow(receiptId: string): Promise<void> {
  const now = new Date();
  const r = await MetaLeadReceipt.findOneAndUpdate(
    { _id: receiptId, status: { $in: ['pending', 'retry'] } },
    { $set: { status: 'processing', lockedUntil: new Date(now.getTime() + 2 * 60_000) }, $inc: { attempts: 1 } },
    { new: true }
  ).lean<IMetaLeadReceipt>();
  if (r) await processReceipt(r);
}

/**
 * Reconciliation: pull leads from every subscribed page's forms created since
 * `since` and queue any we have not seen. Requires leads_retrieval on the page.
 */
export async function backfillLeads(since: Date): Promise<{ forms: number; seen: number; queued: number; errors: string[] }> {
  await connectDB();
  const started = Date.now();
  const conn = await MarketingConnection.findOne({ provider: 'meta' }).lean<IMarketingConnection>();
  const pages = (conn?.meta?.pages || []).filter((p) => p.subscribed && p.tokenEnc);
  const out = { forms: 0, seen: 0, queued: 0, errors: [] as string[] };
  const filtering = JSON.stringify([{ field: 'time_created', operator: 'GREATER_THAN', value: Math.floor(since.getTime() / 1000) }]);
  for (const page of pages) {
    const token = decryptSecret(page.tokenEnc)!;
    for (const form of page.forms || []) {
      out.forms++;
      let after: string | undefined;
      for (let i = 0; i < 50; i++) {
        let body: Record<string, unknown>;
        try {
          body = await graph.get(`/${form.id}/leads`, token, { fields: 'id,created_time,ad_id,form_id', filtering, limit: 100, after });
        } catch (e) {
          out.errors.push(`${form.name}: ${(e as Error).message}`);
          break;
        }
        const rows = (Array.isArray(body.data) ? body.data : []) as { id: string; created_time?: string; ad_id?: string }[];
        for (const row of rows) {
          out.seen++;
          const ct = row.created_time ? Math.floor(new Date(row.created_time).getTime() / 1000) : undefined;
          const { isNew } = await recordLeadgen({ leadgen_id: row.id, page_id: page.id, form_id: form.id, ad_id: row.ad_id, created_time: ct }, 'backfill', true);
          if (isNew) out.queued++;
        }
        const paging = (body.paging || {}) as { next?: string; cursors?: { after?: string } };
        if (!paging.next || !paging.cursors?.after) break;
        after = paging.cursors.after;
      }
    }
  }
  await syncLog('meta', 'backfill', out.errors.length ? (out.queued || out.seen ? 'partial' : 'error') : 'ok',
    `Backfill since ${since.toISOString().slice(0, 10)}: ${out.forms} form(s), ${out.seen} lead(s) seen, ${out.queued} new` +
      (out.errors.length ? ` — errors: ${out.errors.slice(0, 3).join('; ')}` : ''),
    { counts: { forms: out.forms, seen: out.seen, queued: out.queued }, durationMs: Date.now() - started });
  return out;
}
