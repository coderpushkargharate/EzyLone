// app/lending-partners/page.tsx
import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Banking & NBFC Partners',
  description: 'EzyLoan partners with leading banks and NBFCs including ICICI, Axis, Kotak, Tata Capital, Bajaj Finance & more for personal loans, business loans & home loans.',
  keywords: 'loan partners, bank partners, EzyLoan lenders, ICICI Bank, Axis Bank, Kotak Mahindra, Tata Capital, Bajaj Finance',
  robots: 'index, follow',
  alternates: { canonical: '/lending-partners' },
};

// Banking partners with logos and website links
const BANKING_PARTNERS = [
  { 
    name: 'AU Small Finance Bank', 
    logo: '/banks/AU-Small-Finance-Bank.webp',
    website: 'https://www.aubank.in',
    type: 'Bank'
  },
  { 
    name: 'Axis Bank', 
    logo: '/banks/Axis_Bank_logo.svg.webp',
    website: 'https://www.axisbank.com',
    type: 'Bank'
  },
  { 
    name: 'Bajaj Finserv', 
    logo: '/banks/Bajaj-Finsery-Logo.webp',
    website: 'https://www.bajajfinserv.in',
    type: 'NBFC'
  },
  { 
    name: 'Cholamandalam Finance', 
    logo: '/banks/chola-logo-removebg-preview.jpg',
    website: 'https://www.cholamandalam.com',
    type: 'NBFC'
  },
  { 
    name: 'Tata Capital', 
    logo: '/banks/Tata-Capital.webp',
    website: 'https://www.tatacapital.com',
    type: 'NBFC'
  },
  { 
    name: 'HDB Financial Services', 
    logo: '/banks/HDB.webp',
    website: 'https://www.hdbfs.com',
    type: 'NBFC'
  },
  { 
    name: 'Bank of India', 
    logo: '/banks/boi.webp',
    website: 'https://www.bankofindia.co.in',
    type: 'Bank'
  },
  { 
    name: 'Hero FinCorp', 
    logo: '/banks/Hero-Fincorp.webp',
    website: 'https://www.herofincorp.com',
    type: 'NBFC'
  },
  { 
    name: 'ICICI Bank', 
    logo: '/banks/ICICI-Bank-logo.webp',
    website: 'https://www.icicibank.com',
    type: 'Bank'
  },
  { 
    name: 'IDFC FIRST Bank', 
    logo: '/banks/IDFC-logo.webp',
    website: 'https://www.idfcfirstbank.com',
    type: 'Bank'
  },
  { 
    name: 'Kotak Mahindra Bank', 
    logo: '/banks/Kotak_Mahindra_Bank_logo.webp',
    website: 'https://www.kotak.com',
    type: 'Bank'
  },
  { 
    name: 'Mahindra Finance', 
    logo: '/banks/Mahindra_Finance_Logo.jpg',
    website: 'https://www.mahindrafinance.com',
    type: 'NBFC'
  },
  { 
    name: 'Piramal Finance', 
    logo: '/banks/Piramal-Logo.webp',
    website: 'https://www.piramalfinance.com',
    type: 'NBFC'
  },
  { 
    name: 'ESAF Small Finance Bank', 
    logo: '/banks/esaf-seeklogo.webp',
    website: 'https://www.esafbank.com',
    type: 'Bank'
  },
  { 
    name: 'Aditya Birla Capital', 
    logo: '/banks/aditya_birla_camptal-removebg-preview.webp',
    website: 'https://www.adityabirlacapital.com',
    type: 'NBFC'
  },
  { 
    name: 'DCB Bank', 
    logo: '/banks/dcb_bank-removebg-preview.webp',
    website: 'https://www.dcbank.com',
    type: 'Bank'
  },
  { 
    name: 'Poonawalla Fincorp', 
    logo: '/banks/Poonamwalla-Fincorp-removebg-preview.webp',
    website: 'https://www.poonawallafincorp.com',
    type: 'NBFC'
  },
];

// ✅ Server-safe Image component with fallback (no event handlers)
function PartnerLogo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 group-hover:from-blue-50 group-hover:to-cyan-50 transition-colors overflow-hidden">
      {/* Primary Image */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain"
        loading="lazy"
      />
      {/* Fallback: Show initials if image fails (handled via CSS + alt text) */}
      <noscript>
        <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-400">
          {alt.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()}
        </div>
      </noscript>
    </div>
  );
}

export default function LendingPartnersPage() {
  const lastUpdated = new Date().toLocaleDateString('en-IN', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 mt-16">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Hero Section */}
        <section className="mb-10">
          <div className="backdrop-blur-xl bg-white/70 rounded-3xl p-6 sm:p-8 shadow-lg border border-white/50">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
                <span className="text-xs font-semibold text-blue-700">🤝 Trusted Network</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                Our <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Banking Partners</span>
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                EzyLoan partners with <strong className="text-gray-800">India's leading banks and NBFCs</strong> to provide you with the best loan options. 
                We are a loan facilitation service provider (DSA) connecting you with RBI-regulated financial institutions.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500">
             
                <span className="text-gray-300">•</span>
                <span className="inline-flex items-center gap-1">
                  ✓ {BANKING_PARTNERS.length} Trusted Partners
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Grid */}
        <section className="mb-12" aria-labelledby="section-partners">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-sm"></div>
              <h2 id="section-partners" className="text-2xl font-bold text-gray-800">
                Partner Institutions
              </h2>
            </div>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {BANKING_PARTNERS.length} partners
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {BANKING_PARTNERS.map((partner, index) => (
              <a
                key={index}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative backdrop-blur-xl bg-white/70 rounded-2xl p-5 border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300"
              >
                {/* Logo Container - Server-safe */}
                <PartnerLogo src={partner.logo} alt={partner.name} />

                {/* Partner Info */}
                <div className="text-center mt-3">
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-blue-700 transition-colors line-clamp-2 min-h-[2.5rem]">
                    {partner.name}
                  </h3>
                  <span className={`inline-block text-[10px] font-medium px-2 py-1 rounded-full ${
                    partner.type === 'Bank' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {partner.type}
                  </span>
                </div>

                {/* External Link Icon */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </a>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-10">
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base mb-6 max-w-2xl mx-auto">
              Apply now and get matched with the best loan offers from our partner banks and NBFCs. 
              Quick approval, competitive rates, and minimal documentation.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/apply-now" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Apply Now →
              </Link>
              <a 
                href="tel:+916372977626" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-700/50 text-white font-semibold rounded-xl hover:bg-blue-700/70 transition-all backdrop-blur-sm border border-white/20"
              >
                📞 +91 63729 77626
              </a>
            </div>
          </div>
        </section>

        {/* Compliance Notice */}
        <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 rounded-r-xl backdrop-blur-sm" role="note">
          <p className="text-sm text-blue-800">
            <strong>Transparency Notice:</strong> EzyLoan is a Direct Selling Agent (DSA) for partner financial institutions. 
            We do not charge any upfront fees from borrowers. All loan products are offered by RBI-regulated entities.
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-12 py-6 bg-white/50 backdrop-blur-sm border-t border-gray-200/50" role="contentinfo">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} EzyLoan (Dibyansh Associates). All rights reserved. | GST: 21CNXPM8317C1ZV
            </p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              EzyLoan is a loan facilitation service provider (DSA). We are not a direct lender. 
              All loans are provided by RBI-regulated partner institutions.
            </p>
          </div>
        </footer>

      </div>
    </main>
  );
}