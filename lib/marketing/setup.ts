// Setup checklist shown in Admin → Marketing & Ads → Settings. Pure: derives
// each step's state from the status payload, so it is unit-tested.

export interface SetupInput {
  keys: Record<string, boolean>; // credential name → set
  encryptionKey: boolean;
  baseUrl?: string; // origin used for OAuth redirect URIs
  meta: { status: string; pages: { subscribed: boolean }[]; datasetId?: string; capiTokenSet?: boolean; capiVerified?: boolean; leadsVerified?: boolean; missingScopes?: string[] };
  google: { status: string; customerId?: string; searchConsoleSite?: string; ga4PropertyId?: string; uploadVerified?: boolean; missingScopes?: string[] };
  mappings: { meta: boolean; google: boolean }[];
  testMode: { meta: boolean; google: boolean };
}

export interface SetupStep {
  id: string;
  group: 'Basics' | 'Meta' | 'Google' | 'Automation';
  title: string;
  done: boolean;
  optional?: boolean;
  hint: string;
}

export function setupChecklist(s: SetupInput): SetupStep[] {
  const metaOn = s.meta.status !== 'disconnected';
  const googleOn = s.google.status !== 'disconnected';
  return [
    { id: 'enc', group: 'Basics', title: 'Encryption key usable and matching saved data', done: s.encryptionKey, hint: 'See the encryption key note under API keys. A key is created automatically only on a fresh install.' },
    { id: 'base', group: 'Basics', title: 'Public site URL is HTTPS (OAuth redirects use it)', done: s.baseUrl === undefined || s.baseUrl.startsWith('https://'), hint: `Currently ${s.baseUrl}. Set MARKETING_PUBLIC_BASE_URL (or NEXT_PUBLIC_SITE_URL) to https://www.ezyloan.co.in.` },
    { id: 'meta-keys', group: 'Meta', title: 'Meta App ID, App Secret and webhook verify token saved', done: !!(s.keys.META_APP_ID && s.keys.META_APP_SECRET && s.keys.FACEBOOK_VERIFY_TOKEN), hint: 'Fill them in under "API keys" below.' },
    { id: 'meta-connect', group: 'Meta', title: 'Meta connected (all required permissions granted)', done: s.meta.status === 'connected' && !(s.meta.missingScopes || []).length, hint: 'Integrations tab → Connect Meta.' },
    { id: 'meta-page', group: 'Meta', title: 'Facebook Page subscribed to Lead Ads', done: s.meta.pages.some((p) => p.subscribed), hint: 'Integrations tab → Pages → Subscribe.' },
    { id: 'meta-leads', group: 'Meta', title: 'Lead Ads verified: a lead reached the CRM', done: !!s.meta.leadsVerified, hint: 'Create a test lead with Meta’s Lead Ads Testing Tool; it should appear in Lead Management. Requires Leads Access for the app.' },
    { id: 'meta-capi', group: 'Meta', title: 'Conversions API verified: Meta confirmed an event', done: !!(s.meta.datasetId && s.meta.capiTokenSet && s.meta.capiVerified), hint: s.meta.datasetId && s.meta.capiTokenSet ? 'Saved, but not yet confirmed by Meta. Click “Send test event” on the Integrations tab.' : 'Integrations tab → Reporting & Conversions API → save dataset ID + token, then “Send test event”.' },
    { id: 'meta-pixel', group: 'Meta', title: 'Meta Pixel ID saved (website browser events)', done: !!s.keys.META_PIXEL_ID, optional: true, hint: 'API keys → Meta Pixel / Dataset ID.' },
    { id: 'google-keys', group: 'Google', title: 'Google OAuth Client ID and Secret saved', done: !!(s.keys.GOOGLE_OAUTH_CLIENT_ID && s.keys.GOOGLE_OAUTH_CLIENT_SECRET), hint: 'Fill them in under "API keys" below.' },
    { id: 'google-connect', group: 'Google', title: 'Google connected', done: s.google.status === 'connected', hint: 'Integrations tab → Connect Google (grant all requested access).' },
    { id: 'google-sc', group: 'Google', title: 'Search Console property selected', done: !!s.google.searchConsoleSite, hint: 'Search Console tab → Load properties → Use.' },
    { id: 'google-ga4', group: 'Google', title: 'GA4 property selected (reports, cities)', done: !!s.google.ga4PropertyId, hint: 'Analytics (GA4) tab → Load properties → Use.' },
    { id: 'google-tag', group: 'Google', title: 'GA4 Measurement ID saved (website tracking)', done: !!s.keys.GA4_MEASUREMENT_ID, optional: true, hint: 'API keys → GA4 Measurement ID.' },
    { id: 'google-ads', group: 'Google', title: 'Google Ads account selected', done: !!s.google.customerId, optional: !googleOn, hint: 'Integrations tab → List accounts → Use this account (needs the developer token).' },
    { id: 'google-upload', group: 'Google', title: 'Conversion upload verified: Google accepted or validated an event', done: !!s.google.uploadVerified, optional: !googleOn, hint: 'Map a CRM event to a Google conversion action and let one consented lead reach that stage (test mode validates without ingesting).' },
    { id: 'google-dev', group: 'Google', title: 'Google Ads developer token saved (spend reports)', done: !!s.keys.GOOGLE_ADS_DEVELOPER_TOKEN, optional: true, hint: 'API keys → Google Ads developer token.' },
    { id: 'map', group: 'Automation', title: 'At least one CRM event mapped to Meta or Google', done: s.mappings.some((m) => m.meta || m.google), hint: 'Settings → CRM event → ad platform mapping.' },
    { id: 'live', group: 'Automation', title: 'Test mode switched off (real conversions are sent)', done: (!metaOn || !s.testMode.meta) && (!googleOn || !s.testMode.google) && (metaOn || googleOn), hint: 'Turn off only after test events look right in Meta Events Manager / Google.' },
  ];
}
