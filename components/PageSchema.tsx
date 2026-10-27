import { SITE_URL, jsonLd } from '@/lib/seo';

// Per-page structured data (server component, no JS shipped):
//  - BreadcrumbList: Home › <page> — Google shows it instead of the raw URL.
//  - optional loan product (LoanOrCredit) for loan pages, linked to the
//    organisation in the root layout. No rates or fees are stated here: those
//    vary by lender and must only come from the page's own visible content.

export const ORG_ID = `${SITE_URL}/#organization`;

export default function PageSchema({ path, name, loan }: {
  path: string;
  name: string;
  loan?: { name: string; description: string; loanType: string; category?: string };
}) {
  const url = `${SITE_URL}${path}`;
  const graph: Record<string, unknown>[] = [
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name, item: url },
      ],
    },
  ];
  if (loan) {
    graph.push({
      '@type': 'LoanOrCredit',
      '@id': `${url}#loan`,
      name: loan.name,
      description: loan.description,
      url,
      loanType: loan.loanType,
      ...(loan.category ? { category: loan.category } : {}),
      currency: 'INR',
      areaServed: { '@type': 'Country', name: 'India' },
      provider: { '@id': ORG_ID },
      brand: { '@type': 'Brand', name: 'EzyLoan' },
    });
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': graph }) }}
    />
  );
}
