import Link from "next/link";
import { BadgePercent, Calculator, UserCheck, ShieldCheck } from "lucide-react";

// One compact "Rates, fees & disclosures" block used on every loan page.
// It carries everything Google Ads / Meta financial-services policies look for
// on a landing page (rate range, fees, repayment period, a representative
// example with total cost, and the "not a lender" disclosure) without the
// stack of repeated banners the pages used to have.

type Props = {
  loanDetails: { interestRate: string; processingFee: string; tenure: string };
  emiExample?: { principal: number; rate: number; tenureMonths: number; emi: number; totalAmount: number };
  eligibility: { age: string; income: string; employment: string };
  /** false when the page already wraps this in its own padded container */
  contained?: boolean;
  className?: string;
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export default function LoanDisclosure({ loanDetails, emiExample, eligibility, contained = true, className = "" }: Props) {
  const card = (
    <section
      aria-labelledby="loan-disclosure-heading"
      className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <h2 id="loan-disclosure-heading" className="text-base sm:text-lg font-bold text-slate-900">
          Rates, fees &amp; key terms
        </h2>
        <span className="text-[11px] sm:text-xs font-medium text-slate-500">Indicative · set by partner lenders</span>
      </div>

      <div className={`grid grid-cols-1 ${emiExample ? "md:grid-cols-3" : "md:grid-cols-2"} divide-y md:divide-y-0 md:divide-x divide-slate-100`}>
        {/* Pricing */}
        <div className="p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <BadgePercent className="w-4 h-4" aria-hidden="true" /> Pricing
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Interest rate</dt>
              <dd className="font-semibold text-slate-900 text-right">{loanDetails.interestRate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Processing fee</dt>
              <dd className="font-semibold text-slate-900 text-right">{loanDetails.processingFee}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Repayment tenure</dt>
              <dd className="font-semibold text-slate-900 text-right">{loanDetails.tenure}</dd>
            </div>
          </dl>
        </div>

        {/* Representative example */}
        {emiExample && (
          <div className="p-5 sm:p-6">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              <Calculator className="w-4 h-4" aria-hidden="true" /> Representative example
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              {inr(emiExample.principal)} at {emiExample.rate}% p.a. for {emiExample.tenureMonths} months
            </p>
            <dl className="mt-2 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Monthly EMI</dt>
                <dd className="font-bold text-blue-700">{inr(emiExample.emi)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Total interest</dt>
                <dd className="font-semibold text-slate-900">{inr(emiExample.totalAmount - emiExample.principal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Total repayable</dt>
                <dd className="font-semibold text-slate-900">{inr(emiExample.totalAmount)}</dd>
              </div>
            </dl>
          </div>
        )}

        {/* Eligibility */}
        <div className="p-5 sm:p-6">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <UserCheck className="w-4 h-4" aria-hidden="true" /> Basic eligibility
          </p>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Age</dt>
              <dd className="font-semibold text-slate-900 text-right">{eligibility.age}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Income</dt>
              <dd className="font-semibold text-slate-900 text-right">{eligibility.income}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Employment</dt>
              <dd className="font-semibold text-slate-900 text-right">{eligibility.employment}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex items-start gap-3 px-5 sm:px-6 py-4 border-t border-slate-100 bg-orange-50/60">
        <ShieldCheck className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-xs sm:text-[13px] leading-relaxed text-slate-700">
          <strong className="text-slate-900">EzyLoan is a loan facilitation service (DSA), not a lender.</strong>{" "}
          Loans are offered by RBI-regulated banks and NBFCs, subject to their approval and terms. Actual rate, fees and
          EMI depend on your credit profile. We do not provide investment advice or deal in stocks, mutual funds,
          securities or trading products.{" "}
          <Link href="/loan-disclosure" className="font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-800">
            Full disclosures
          </Link>
        </p>
      </div>
    </section>
  );

  if (!contained) return <div className={className}>{card}</div>;
  return <div className={`max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>{card}</div>;
}
