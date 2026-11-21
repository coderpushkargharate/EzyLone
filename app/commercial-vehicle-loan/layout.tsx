import PageSchema from '@/components/PageSchema';
import RelatedArticles from '@/components/RelatedArticles';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({
  path: '/commercial-vehicle-loan',
  title: "Commercial Vehicle Loan in Odisha – Truck, Bus & Taxi Finance",
  description:
    "Finance new or used trucks, buses, tippers, pickups and taxis in Odisha. Check commercial vehicle loan eligibility, documents and tenure with partner banks and NBFCs in Cuttack and Bhubaneswar.",
  keywords: ["commercial vehicle loan Odisha", "truck loan Odisha", "used truck finance", "tipper loan", "bus loan", "taxi loan Odisha", "pickup loan", "commercial vehicle finance Cuttack"],
});

// Static page; the related-articles list refreshes hourly (and on blog publish).
export const revalidate = 3600;

export default function CommercialVehicleLoanLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageSchema path="/commercial-vehicle-loan" name="Commercial Vehicle Loan" loan={{"name":"Commercial Vehicle Loan","loanType":"Commercial vehicle loan","category":"Vehicle loan","description":"Finance new or used trucks, buses, tippers and goods carriers. Eligibility, documents and tenure for commercial vehicle loans in Odisha."}} />
      {children}
      <RelatedArticles topic="commercial" heading="Commercial vehicle finance guides" />
    </>
  );
}
