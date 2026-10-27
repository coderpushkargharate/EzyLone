// Ad-measurement consent wording shown on the website forms. Shared by the
// client checkbox and the server (which records the version the visitor saw).
// LEGAL REVIEW REQUIRED before production use — bump the version whenever the
// wording changes so each recorded consent maps to the exact text displayed.

export const AD_CONSENT_VERSION = 'ad-measurement-v2';

// Always visible next to the checkbox.
export const AD_CONSENT_SHORT =
  'Optional: Share my email and phone, in hashed form, with Meta and Google to measure ads.';

// Shown when the visitor taps "Read more".
export const AD_CONSENT_TEXT =
  'Optional: I agree that EzyLoan may share my email and phone number, in hashed (encrypted) form, ' +
  'with advertising partners (Meta and Google) to measure how well its ads work. My loan, income and ' +
  'document details are never shared. I can withdraw this at any time.';
