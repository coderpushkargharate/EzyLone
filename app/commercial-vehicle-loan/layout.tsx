import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial Vehicle Loan – Truck & CV Finance',
  description:
    'Finance trucks, buses and commercial vehicles with EzyLoan. Competitive interest rates*, high funding and fast approval for transporters across Odisha. *Subject to lender approval.',
  alternates: { canonical: '/commercial-vehicle-loan' },
};

export default function CommercialVehicleLoanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
