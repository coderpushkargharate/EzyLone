import type { NextRequest } from 'next/server';
import { cleanUrl, consentFromForm, sanitizeAttribution } from './attribution';
import { siteHosts } from './config';
import { AD_CONSENT_VERSION } from './consentText';
import type { AttributionInput } from './attributionStore';

/**
 * Build the marketing payload for a website form submission from the
 * (untrusted) request body: validated attribution, the explicit ad-measurement
 * consent checkbox, and the browser details Meta needs for website events.
 */
export function marketingFromForm(
  req: NextRequest,
  body: Record<string, unknown>,
  opts: { crmSource: string; consentSource: string; clientIp?: string; loanType?: string }
): AttributionInput {
  const hosts = siteHosts();
  const attribution = sanitizeAttribution(body.attribution, hosts);
  if (!attribution.eventSourceUrl) {
    const fromReferer = cleanUrl(req.headers.get('referer'), hosts);
    if (fromReferer) attribution.eventSourceUrl = fromReferer;
  }
  return {
    crmSource: opts.crmSource,
    attribution,
    consent: consentFromForm(body.adConsent, opts.consentSource, AD_CONSENT_VERSION),
    clientIp: opts.clientIp && opts.clientIp !== 'unknown' ? opts.clientIp : undefined,
    userAgent: req.headers.get('user-agent')?.slice(0, 512) || undefined,
    loanType: opts.loanType,
  };
}
