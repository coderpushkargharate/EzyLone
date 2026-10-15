// Shared vocabulary for the marketing integration layer. Pure — no runtime deps.

/** CRM lifecycle moments that can be reported to ad platforms. */
export const CRM_EVENTS = ['Lead', 'QualifiedLead', 'SubmitApplication', 'ApprovedApplication', 'LoanDisbursed'] as const;
export type CrmEvent = (typeof CRM_EVENTS)[number];

export const PLATFORMS = ['meta', 'google'] as const;
export type Platform = (typeof PLATFORMS)[number];

/**
 * Conversion ledger status.
 *  pending            — queued, waiting for the worker
 *  processing         — claimed by a worker (lease in lockedUntil)
 *  retry              — transient failure, will retry at nextAttemptAt
 *  sent               — Meta acknowledged receipt (events_received matched). NOT proof of attribution.
 *  submitted          — Google accepted the request (requestId) — processing result not yet known
 *  accepted           — Google reported the request processed (SUCCESS). Still NOT proof of attribution.
 *  unverified         — Google status could not be confirmed after the verification window
 *  rejected           — the platform refused the event (validation / policy); not retried
 *  failed             — permanent local failure (missing config, invalid payload); not retried
 *  dead               — retries exhausted (dead-letter); can be manually retried
 *  blocked_consent    — not sent: consent / lawful-basis conditions not satisfied
 *  skipped            — not sent for a recorded reason (e.g. no usable identifier, too old)
 *  retracted          — a previously delivered conversion was retracted
 */
export const EVENT_STATUSES = [
  'pending', 'processing', 'retry', 'sent', 'submitted', 'accepted', 'unverified',
  'rejected', 'failed', 'dead', 'blocked_consent', 'skipped', 'retracted',
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const DELIVERED_STATUSES: EventStatus[] = ['sent', 'submitted', 'accepted', 'unverified'];
export const RETRYABLE_MANUALLY: EventStatus[] = ['dead', 'failed', 'rejected', 'skipped', 'blocked_consent', 'unverified'];

export type ConsentState = 'granted' | 'denied' | 'unknown';

export interface ConsentRecord {
  adMeasurement: ConsentState;
  source?: string; // e.g. 'website_apply_form', 'meta_lead_form_disclaimer', 'admin'
  collectedAt?: Date | string;
  textVersion?: string;
}

/** A single marketing touch (first or last). */
export interface Touch {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  landingPage?: string;
  referrer?: string;
  at?: Date | string;
}

export type ErrorKind = 'auth' | 'permission' | 'rate_limit' | 'invalid' | 'transient' | 'config' | 'not_found';

export interface ClassifiedError {
  kind: ErrorKind;
  retryable: boolean;
  message: string;
  code?: string | number;
}

export class PlatformError extends Error {
  kind: ErrorKind;
  retryable: boolean;
  code?: string | number;
  constructor(c: ClassifiedError) {
    super(c.message);
    this.kind = c.kind;
    this.retryable = c.retryable;
    this.code = c.code;
  }
}
