import type { ConsentRecord, Platform } from './types';

// Consent / lawful-basis gate for sending CRM data to ad platforms.
// Default is FAIL CLOSED: only an explicit, recorded ad-measurement consent
// allows hashed customer data to leave the CRM.
//
// The one configurable exception is Meta Lead Ads: the person submitted the
// form ON Meta, so Meta already holds their lead record. When the business
// enables `allowLeadIdOnlyForLeadAds` (a legal decision, off by default),
// lifecycle events for those leads are sent carrying ONLY Meta's own lead_id —
// no email, phone, name or other customer data is added.
// Pure module — unit-tested.

export interface ConsentPolicy {
  allowLeadIdOnlyForLeadAds: boolean;
}

export type SendMode = 'full' | 'lead_id_only';

export interface ConsentDecision {
  allowed: boolean;
  mode?: SendMode;
  reason: string;
}

export function evaluateConsent(
  platform: Platform,
  consent: ConsentRecord | undefined | null,
  policy: ConsentPolicy,
  ctx: { metaLeadId?: string }
): ConsentDecision {
  const state = consent?.adMeasurement || 'unknown';
  if (state === 'denied') return { allowed: false, reason: 'The customer declined ad-measurement consent.' };
  if (state === 'granted') return { allowed: true, mode: 'full', reason: `Consent granted (${consent?.source || 'unknown source'}).` };

  if (platform === 'meta' && ctx.metaLeadId && policy.allowLeadIdOnlyForLeadAds) {
    return {
      allowed: true,
      mode: 'lead_id_only',
      reason: 'Meta Lead Ads lead — sending Meta lead_id only (policy: allowLeadIdOnlyForLeadAds).',
    };
  }
  return { allowed: false, reason: 'No recorded ad-measurement consent for this lead.' };
}
