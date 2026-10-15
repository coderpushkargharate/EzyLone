// Setup checklist shown in Admin → Marketing & Ads → Settings. Pure: derives
// each step's state from the status payload, so it is unit-tested.

export interface SetupInput {
  keys: Record<string, boolean>; // credential name → set
  encryptionKey: boolean;
  meta: { status: string; pages: { subscribed: boolean }[]; datasetId?: string; capiTokenSet?: boolean; missingScopes?: string[] };
  google: { status: string; customerId?: string; searchConsoleSite?: string; ga4PropertyId?: string; missingScopes?: string[] };
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
    { id: 'enc', group: 'Basics', title: 'Encryption key available', done: s.encryptionKey, hint: 'Set MARKETING_ENCRYPTION_KEY, or make the app folder writable so the server can create .data/marketing.key.' },
    { id: 'meta-keys', group: 'Meta', title: 'Meta App ID, App Secret and webhook verify token saved', done: !!(s.keys.META_APP_ID && s.keys.META_APP_SECRET && s.keys.FACEBOOK_VERIFY_TOKEN), hint: 'Fill them in under "API keys" below.' },
    { id: 'meta-connect', group: 'Meta', title: 'Meta connected (all required permissions granted)', done: s.meta.status === 'connected' && !(s.meta.missingScopes || []).length, hint: 'Integrations tab → Connect Meta.' },
    { id: 'meta-page', group: 'Meta', title: 'Facebook Page subscribed to Lead Ads', done: s.meta.pages.some((p) => p.subscribed), hint: 'Integrations tab → Pages → Subscribe.' },
    { id: 'meta-capi', group: 'Meta', title: 'Conversions API: dataset ID + access token saved', done: !!(s.meta.datasetId && s.meta.capiTokenSet), hint: 'Integrations tab → Reporting & Conversions API.' },
    { id: 'meta-pixel', group: 'Meta', title: 'Meta Pixel ID saved (website browser events)', done: !!s.keys.META_PIXEL_ID, optional: true, hint: 'API keys → Meta Pixel / Dataset ID.' },
    { id: 'google-keys', group: 'Google', title: 'Google OAuth Client ID and Secret saved', done: !!(s.keys.GOOGLE_OAUTH_CLIENT_ID && s.keys.GOOGLE_OAUTH_CLIENT_SECRET), hint: 'Fill them in under "API keys" below.' },
    { id: 'google-connect', group: 'Google', title: 'Google connected', done: s.google.status === 'connected', hint: 'Integrations tab → Connect Google (grant all requested access).' },
    { id: 'google-sc', group: 'Google', title: 'Search Console property selected', done: !!s.google.searchConsoleSite, hint: 'Search Console tab → Load properties → Use.' },
    { id: 'google-ga4', group: 'Google', title: 'GA4 property selected (reports, cities)', done: !!s.google.ga4PropertyId, hint: 'Analytics (GA4) tab → Load properties → Use.' },
    { id: 'google-tag', group: 'Google', title: 'GA4 Measurement ID saved (website tracking)', done: !!s.keys.GA4_MEASUREMENT_ID, optional: true, hint: 'API keys → GA4 Measurement ID.' },
    { id: 'google-ads', group: 'Google', title: 'Google Ads account selected', done: !!s.google.customerId, optional: !googleOn, hint: 'Integrations tab → List accounts → Use this account (needs the developer token).' },
    { id: 'google-dev', group: 'Google', title: 'Google Ads developer token saved (spend reports)', done: !!s.keys.GOOGLE_ADS_DEVELOPER_TOKEN, optional: true, hint: 'API keys → Google Ads developer token.' },
    { id: 'map', group: 'Automation', title: 'At least one CRM event mapped to Meta or Google', done: s.mappings.some((m) => m.meta || m.google), hint: 'Settings → CRM event → ad platform mapping.' },
    { id: 'live', group: 'Automation', title: 'Test mode switched off (real conversions are sent)', done: (!metaOn || !s.testMode.meta) && (!googleOn || !s.testMode.google) && (metaOn || googleOn), hint: 'Turn off only after test events look right in Meta Events Manager / Google.' },
  ];
}
