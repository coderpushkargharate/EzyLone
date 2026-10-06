// Shared SEO helpers (server + client safe — no Node-only imports).

export const SITE_URL = 'https://www.ezyloan.co.in';

/**
 * Serialise JSON-LD for a <script type="application/ld+json"> tag. Escapes "<"
 * so database-sourced text (e.g. a blog title containing "</script>") can never
 * break out of the script element.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** A canonical must point at this site; anything else falls back to the default. */
export function siteCanonical(candidate: string | undefined | null, fallback: string): string {
  const c = (candidate || '').trim();
  if (!c) return fallback;
  try {
    const u = new URL(c);
    return u.protocol === 'https:' && u.host === new URL(SITE_URL).host ? u.toString() : fallback;
  } catch {
    return fallback;
  }
}

export interface TopicLink {
  href: string;
  label: string;
  description: string;
}

/**
 * Topic clusters: each pillar product page plus the supporting pages around it.
 * Order matters: the first matching cluster wins (commercial before car).
 * Blog posts link into the cluster that matches their category/tags/title, so
 * every article passes context and authority to the relevant product page.
 */
export const TOPIC_CLUSTERS: { key: string; match: RegExp; links: TopicLink[] }[] = [
  {
    key: 'commercial',
    match: /\b(commercial vehicle|trucks?|tractors?|tippers?|bus|buses|fleet|goods vehicle|cv loan)\b/i,
    links: [
      { href: '/commercial-vehicle-loan', label: 'Commercial Vehicle Loan', description: 'Finance for trucks, buses and goods carriers' },
      { href: '/emi-calculator', label: 'EMI Calculator', description: 'Plan repayments for your vehicle loan' },
      { href: '/car-loan', label: 'Car Loan', description: 'Finance for personal-use cars' },
    ],
  },
  {
    key: 'car',
    match: /\b(cars?|auto loan|balance transfer|top[- ]?up|refinanc\w*)\b/i,
    links: [
      { href: '/car-loan', label: 'Car Loan', description: 'New and used car finance through partner banks & NBFCs' },
      { href: '/car-loan-balance-transfer', label: 'Car Loan Balance Transfer', description: 'Move an existing car loan to a lender with better terms' },
      { href: '/car-loan-topup', label: 'Car Loan Top-Up', description: 'Additional funds on your running car loan' },
      { href: '/car-loan-refinance', label: 'Car Loan Refinance', description: 'Raise funds against a car you already own' },
      { href: '/emi-calculator', label: 'Car Loan EMI Calculator', description: 'Estimate your monthly EMI before you apply' },
    ],
  },
  {
    key: 'property',
    match: /\b(property|home loan|housing|mortgage|lap)\b/i,
    links: [
      { href: '/property-loan', label: 'Loan Against Property', description: 'Unlock funds against residential or commercial property' },
      { href: '/emi-calculator', label: 'EMI Calculator', description: 'Work out the EMI for a larger, longer loan' },
    ],
  },
  {
    key: 'personal',
    match: /\b(personal|salary|salaried|instant loan|cibil|credit score)\b/i,
    links: [
      { href: '/personal-loan', label: 'Personal Loan', description: 'Unsecured loans for salaried and self-employed applicants' },
      { href: '/emi-calculator', label: 'Personal Loan EMI Calculator', description: 'Check affordability before applying' },
      { href: '/faq', label: 'Loan FAQs', description: 'Eligibility, documents and process questions answered' },
    ],
  },
];

const DEFAULT_LINKS: TopicLink[] = [
  { href: '/personal-loan', label: 'Personal Loan', description: 'Unsecured loans through partner lenders' },
  { href: '/car-loan', label: 'Car Loan', description: 'New and used car finance' },
  { href: '/property-loan', label: 'Loan Against Property', description: 'Funds against property you own' },
  { href: '/emi-calculator', label: 'EMI Calculator', description: 'Estimate your monthly repayment' },
];

/** Product/supporting pages relevant to a post, most specific cluster first. */
export function topicLinksFor(input: { category?: string; tags?: string[]; title?: string }): TopicLink[] {
  const haystack = [input.category, ...(input.tags || []), input.title].filter(Boolean).join(' ');
  const cluster = TOPIC_CLUSTERS.find((c) => c.match.test(haystack));
  return cluster ? cluster.links : DEFAULT_LINKS;
}

/**
 * Per-page metadata with everything kept in sync: canonical, Open Graph and
 * Twitter all use the page's own URL/title/description (otherwise Next inherits
 * the homepage's og:url / og:title from the root layout for every page).
 */
export function pageMeta(opts: {
  path: string;
  title: string;
  description: string;
  image?: string;
  noindex?: boolean;
}): import('next').Metadata {
  const url = `${SITE_URL}${opts.path === '/' ? '' : opts.path}`;
  const image = opts.image || `${SITE_URL}/og-image.jpg`;
  const socialTitle = `${opts.title} | EzyLoan`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'EzyLoan',
      url,
      title: socialTitle,
      description: opts.description,
      images: [{ url: image, width: 1200, height: 630, alt: opts.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: opts.description,
      images: [image],
    },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
