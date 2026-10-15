// Server-only environment configuration for the marketing integrations.
// None of these are NEXT_PUBLIC_*: they never reach the browser bundle.

function env(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export const META_GRAPH_VERSION = env('META_GRAPH_VERSION') || 'v25.0';
export const GOOGLE_ADS_API_VERSION = env('GOOGLE_ADS_API_VERSION') || 'v25';

/** Public origin used to build OAuth redirect URIs. Never derived from the request. */
export function publicBaseUrl(): string {
  return (env('MARKETING_PUBLIC_BASE_URL') || env('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000').replace(/\/$/, '');
}

export function metaAppConfig() {
  return {
    appId: env('META_APP_ID'),
    // FACEBOOK_APP_SECRET is the variable the existing Lead Ads webhook already uses.
    appSecret: env('META_APP_SECRET') || env('FACEBOOK_APP_SECRET'),
    configId: env('META_LOGIN_CONFIG_ID'), // optional: Facebook Login for Business configuration
    scopes: (env('META_OAUTH_SCOPES') ||
      'pages_show_list,pages_read_engagement,pages_manage_metadata,pages_manage_ads,leads_retrieval,ads_read,business_management')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    redirectUri: `${publicBaseUrl()}/api/marketing/meta/callback`,
  };
}

/** Scopes that, if missing, stop Lead Ads ingestion from working. */
export const META_REQUIRED_SCOPES = ['pages_show_list', 'pages_manage_metadata', 'leads_retrieval', 'pages_read_engagement'];

export const GOOGLE_SCOPES = {
  ads: 'https://www.googleapis.com/auth/adwords',
  dataManager: 'https://www.googleapis.com/auth/datamanager',
  // Full Search Console scope: reading reports + URL inspection work with
  // webmasters.readonly, but submitting a sitemap needs write access.
  searchConsole: 'https://www.googleapis.com/auth/webmasters',
  analytics: 'https://www.googleapis.com/auth/analytics.readonly',
} as const;

export function googleAppConfig() {
  return {
    clientId: env('GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: env('GOOGLE_OAUTH_CLIENT_SECRET'),
    developerToken: env('GOOGLE_ADS_DEVELOPER_TOKEN'),
    // One Google consent covers every Google feature in the panel; each feature
    // reports its own missing scope. Override with GOOGLE_OAUTH_SCOPES (space-separated).
    scopes: (env('GOOGLE_OAUTH_SCOPES') || [GOOGLE_SCOPES.ads, GOOGLE_SCOPES.dataManager, GOOGLE_SCOPES.searchConsole, GOOGLE_SCOPES.analytics].join(' '))
      .split(/\s+/)
      .filter(Boolean),
    redirectUri: `${publicBaseUrl()}/api/marketing/google/callback`,
  };
}

export function workerEnabled(): boolean {
  return process.env.MARKETING_WORKER_ENABLED !== 'false';
}

export function cronSecret(): string | undefined {
  return env('MARKETING_CRON_SECRET');
}

/** Hostnames accepted in stored landing-page / event-source URLs. */
export function siteHosts(): string[] {
  const hosts = new Set<string>(['www.ezyloan.co.in', 'ezyloan.co.in', 'localhost']);
  try {
    hosts.add(new URL(publicBaseUrl()).hostname.toLowerCase());
  } catch {
    /* ignore */
  }
  for (const h of (env('MARKETING_EXTRA_SITE_HOSTS') || '').split(',')) if (h.trim()) hosts.add(h.trim().toLowerCase());
  return Array.from(hosts);
}
