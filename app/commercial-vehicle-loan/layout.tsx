import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/commercial-vehicle-loan',
  title: "Commercial Vehicle Loan – Truck & Bus Finance",
  description:
    "Finance new or used trucks, buses, tippers and goods carriers. Eligibility, documents and tenure for commercial vehicle loans in Odisha.",
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CommercialVehicleLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RelatedArticles topic="commercial" heading="Commercial vehicle finance guides" />
    </>
  );
}
