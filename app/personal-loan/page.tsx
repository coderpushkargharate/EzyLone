'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wallet, ArrowRight, Clock, Shield, Zap, CheckCircle, 
  DollarSign, FileText, User, CreditCard, TrendingUp, AlertCircle,
  Award, Star, Phone, Mail, MapPin
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import LoanDisclosure from '@/components/LoanDisclosure';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const PersonalLoanPage: React.FC = () => {
  // ✅ Structured data for SEO (PersonalLoan schema) - Fixed trailing spaces in URLs
  const personalLoanSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Personal Loan - EzyLoan",
    "description": "Fulfill your personal financial needs with our hassle-free personal loans. Get quick approval*, flexible loan amounts from ₹50,000 to ₹50 lakhs, and competitive interest rates* starting from 10.5% p.a.",
    "category": "Personal Loan",
    "offers": {
      "@type": "Offer",
      "businessFunction": "ProvideLoan",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "INR",
        "price": "0"
      },
      "eligibleRegion": {
        "@type": "State",
        "name": "Odisha",
        "addressCountry": "IN"
      }
    },
    "provider": {
      "@type": "FinancialService",
      "name": "EzyLoan",
      "telephone": "+916372977626",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-6372977626",
        "contactType": "Customer Service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur",
        "addressLocality": "Cuttack",
        "postalCode": "753011",
        "addressRegion": "Odisha",
        "addressCountry": "IN"
      }
    },
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"],
    "loanTerm": {
      "@type": "QuantitativeValue",
      "minValue": "1",
      "maxValue": "5",
      "unitText": "Years"
    },
    "interestRate": {
      "@type": "QuantitativeValue",
      "minValue": "10.5",
      "maxValue": "18.0",
      "unitText": "Percent"
    },
    "loanAmount": {
      "@type": "MonetaryAmount",
      "minValue": "50000",
      "maxValue": "5000000",
      "currency": "INR"
    }
  };

  // ✅ LOAN DETAILS FOR GOOGLE ADS COMPLIANCE
  const loanDetails = {
    interestRate: "10% – 28% p.a.*",
    processingFee: "Up to 3% of loan amount*",
    tenure: "12 – 60 months",
  };

  // ✅ EMI EXAMPLE CALCULATION - Required by Google Ads (Representative Example)
  const emiExample = {
    principal: 100000,
    rate: 14,
    tenureMonths: 36,
    emi: 3418,
    totalAmount: 123048,
  };

  // ✅ ELIGIBILITY CRITERIA
  const eligibility = {
    age: "21 – 60 years",
    income: "₹15,000+ per month*",
    employment: "Salaried / Self-employed",
  };

  // FAQs shown on the page AND emitted as FAQPage schema from the same list, so
  // the structured data always matches what visitors read. Numbers come from
  // the loanDetails / eligibility values displayed above.
  const faqs = [
    {
      q: "What is the age requirement for a personal loan?",
      a: `Applicants are typically ${eligibility.age} old. Some lenders also cap the age at loan maturity. Subject to lender policy.`,
    },
    {
      q: "What is the minimum income required for personal loan eligibility?",
      a: `Most partner lenders look for a net monthly income of ${eligibility.income.replace('*', '')}, along with a stable job or business and a good repayment history. Subject to verification and lender underwriting.`,
    },
    {
      q: "What is the interest rate range for personal loans?",
      a: `Indicative rates range from ${loanDetails.interestRate.replace('*', '')} depending on your credit score, income, employer and the lender. The rate in your sanction letter is the one that applies.`,
    },
    {
      q: "What loan tenure is available?",
      a: `Personal loan tenure is usually ${loanDetails.tenure}. A longer tenure lowers your EMI but increases the total interest paid.`,
    },
    {
      q: "Which documents do I need?",
      a: "KYC (Aadhaar and PAN), address proof, the last 3 months' salary slips or 2 years' ITR for self-employed applicants, and 6 months of bank statements.",
    },
    {
      q: "Is prepayment allowed on personal loans?",
      a: "Yes, most lenders allow part-prepayment or foreclosure, sometimes after a lock-in period and with prepayment charges as per the lender's terms.",
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  return (
    <>
 
      <div 
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {/* ✅ Structured Data for SEO - Fixed trailing spaces in schema URLs */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personalLoanSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

        {/* Banner Image Section */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Image Section */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-xl hero-wrap">
            <HeroSection
              page="personal-loan"
              title="Personal Loan"
              subtitle="Fulfill your personal financial needs with our hassle-free personal loans"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 section-pb">
          {/* Introduction Section */}
          <div className="section-mb">
            <div className="text-center section-head">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                  Fulfill Your Dreams with Personal Loans
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                At EzyLoan, we understand that life is full of opportunities and unexpected expenses. Whether you're planning a wedding, going on a vacation, handling medical emergencies, or consolidating debt, our Personal Loan is designed to provide you with the financial flexibility you need*.
              </p>
            </div>
          </div>

          {/* Features Grid - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-blue-50/70 to-blue-50/70 backdrop-blur-sm rounded-3xl border border-blue-100/50 section-mb card-pad">
            <div className="text-center section-head">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                Why Choose Personal Loan?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Quick Loan Processing*",
                  desc: "Get quick approval* with minimal documentation, ensuring you receive the funds you need without unnecessary delays. Subject to verification.",
                  bg: "from-blue-600 to-blue-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                {
                  icon: DollarSign,
                  title: "Flexible Loan Amounts",
                  desc: "Choose a loan amount that fits your needs* – from ₹50,000 to ₹50 lakhs, giving you the financial freedom to achieve your goals. Subject to income & credit assessment.",
                  bg: "from-blue-600 to-blue-600",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                {
                  icon: TrendingUp,
                  title: "Competitive Interest Rates*",
                  desc: "Enjoy competitive interest rates* starting as low as 10.5% p.a., making your EMIs affordable and easy to manage. Final rate subject to credit profile.",
                  bg: "from-blue-700 to-blue-800",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                    itemScope
                    itemType="https://schema.org/Service"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-8 h-8 text-white ${item.iconShadow}`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            {/* ✅ COMPLIANCE: Asterisk reference for feature claims */}
            <p className="text-xs text-gray-500 text-center mt-6">
              *Approval timelines, loan amounts, and interest rates are subject to credit assessment, income verification, documentation, and lender policy. No guarantee of approval.
            </p>
          </div>

          {/* Additional Content Section - GLASS EFFECTS */}
          <div className="grid md:grid-cols-2 gap-12 items-center section-mb">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-800">
                Tailored Financing Solutions for Every Need
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At EzyLoan, we understand that having the right financial support is crucial for achieving your personal goals. That's why we provide tailored financing solutions designed to meet the unique needs of individuals, whether you're planning a major purchase, consolidating debt, or handling unexpected expenses*.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                With our Personal Loan, you can access funds quickly*, enjoy flexible repayment plans, and benefit from competitive interest rates* that make your financial journey smoother and more manageable.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Clock, title: "Quick Processing*", desc: "24-48 hours* approval", bg: "from-blue-600 to-blue-600" },
                  { icon: Shield, title: "Secure Process", desc: "100% safe & secure", bg: "from-blue-600 to-blue-700" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index}
                      className="group bg-gradient-to-br from-gray-50/70 to-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="group rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <img 
                src="/personal-side.webp" 
                alt="Personal Loan Benefits - Quick approval, flexible amounts, competitive rates" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                width="800"
                height="600"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1000&auto=format&fit=crop';
                }}
              />
            </div>
          </div>

          {/* Loan Details Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-blue-50/70 to-blue-50/70 backdrop-blur-sm rounded-3xl border border-blue-100/50 shadow-xl section-mb card-pad">
            <h2 className="text-3xl lg:text-4xl font-bold text-center section-head">
              <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                Loan Details &amp; Features
              </span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: DollarSign,
                  title: "Loan Amount",
                  items: [
                    { label: "Minimum", value: "₹50,000", color: "text-green-600" },
                    { label: "Maximum", value: "₹50,00,000*", color: "text-green-600" },
                    { label: "Based on", value: "Income & Profile*", color: "text-gray-700" }
                  ],
                  bg: "from-blue-600 to-blue-700"
                },
                {
                  icon: TrendingUp,
                  title: "Interest Rate",
                  items: [
                    { label: "Starting from", value: "10.5% p.a.*", color: "text-blue-600" },
                    { label: "Up to", value: "18.0% p.a.*", color: "text-blue-600" },
                    { label: "Type", value: "Reducing Rate", color: "text-gray-700" }
                  ],
                  bg: "from-blue-600 to-blue-600"
                },
                {
                  icon: Clock,
                  title: "Tenure & Fees",
                  items: [
                    { label: "Tenure", value: "1 - 5 years", color: "text-blue-700" },
                    { label: "Processing Fee", value: "Up to 2%*", color: "text-blue-700" },
                    { label: "Prepayment", value: "Allowed*", color: "text-gray-700" }
                  ],
                  bg: "from-blue-700 to-blue-800"
                }
              ].map((section, index) => {
                const Icon = section.icon;
                return (
                  <div 
                    key={index}
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${section.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center group-hover:text-blue-700 transition-colors">{section.title}</h3>
                    <div className="space-y-3">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-100/50 last:border-0 pb-2 last:pb-0">
                          <span className="text-gray-600">{item.label}</span>
                          <span className={`font-medium ${item.color}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ✅ COMPLIANCE: Global disclaimer for asterisked claims */}
            <p className="text-xs text-gray-500 text-center mt-6">
              *All loan amounts, rates, fees, and terms are subject to credit assessment, income verification, lender approval, and applicable terms &amp; conditions. Actual offers may vary.
            </p>
          </div>

          {/* Eligibility Criteria - GLASS EFFECTS */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100/50 section-mb card-pad">
            <h2 className="text-3xl lg:text-4xl font-bold text-center section-head">
              <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                Eligibility Criteria
              </span>
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[
                { icon: User, title: "Age Criteria", value: "21 - 65 years", desc: "At the time of loan maturity", bg: "from-blue-600 to-blue-800" },
                { icon: DollarSign, title: "Monthly Income", value: "₹25,000+*", desc: "Net monthly income*", bg: "from-blue-600 to-blue-700" },
                { icon: FileText, title: "Employment", value: "Salaried/Self-employed", desc: "Stable employment history*", bg: "from-blue-700 to-blue-800" },
                { icon: TrendingUp, title: "Credit Score", value: "650+*", desc: "Higher scores get better rates*", bg: "from-orange-600 to-red-700" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="group text-center p-4 sm:p-8 bg-gradient-to-br from-gray-50/70 to-white/70 backdrop-blur-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                    itemScope
                    itemType="https://schema.org/QuantitativeValue"
                  >
                    <div className={`w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-6 h-6 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 sm:mb-3 text-sm sm:text-lg group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 text-sm sm:text-lg font-medium">{item.value}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              *Eligibility criteria are indicative. Final approval subject to lender's underwriting policy, documentation verification, income proof, and credit assessment.
            </p>
          </div>

          {/* ✅ COMPLIANCE-FIXED CTA Section - GLASS PRISM BUTTONS */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl text-center text-white shadow-2xl relative overflow-hidden section-mb card-pad" role="region" aria-label="Call to action">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Dreams into Reality?
              </h2>
              <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                Join thousands of satisfied customers who chose EzyLoan for their personal financing needs. 
                Get quick approval* with competitive rates* and flexible terms!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                {[
                  "Quick Approval*",
                  "Minimal Documentation",
                  "Competitive Rates*"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center text-lg bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                    <CheckCircle className="w-6 h-6 mr-2 text-green-300 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" aria-hidden="true" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
              
              {/* ✅ COMPLIANCE: Changed "Instant Approval" to "Check Eligibility" */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {/* ✅ GLASS PRISM APPLY BUTTON */}
                <Link 
                  href="/apply-now"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-lg w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/apply-now")}
                  aria-label="Apply for personal loan - check your eligibility"
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(32, 100, 200,0.2)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(32, 100, 200,0.5), transparent)',
                          animation: 'borderGlow 3s infinite linear',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor',
                          WebkitMaskComposite: 'xor',
                          padding: '1px'
                        }} />
                  
                  {/* Button Text & Icon - Above all layers */}
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Apply Now - Check Eligibility</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  
                  {/* Subtle Particle Sparkles on Hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                    <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                    <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                  </span>
                </Link>
                
                {/* ✅ GLASS PRISM CONTACT BUTTON */}
                <Link 
                  href="/contact" 
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-lg w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/contact")}
                  aria-label="Contact EzyLoan for personal loan inquiries"
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/10 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                          animation: 'borderGlow 3s infinite linear',
                          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          maskComposite: 'xor',
                          WebkitMaskComposite: 'xor',
                          padding: '1px'
                        }} />
                  
                  {/* Button Text - Above all layers */}
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Contact Us</span>
                  </span>
                </Link>
              </div>
              
              {/* ✅ COMPLIANCE: Enhanced disclaimer for CTA section */}
              <p className="text-sm opacity-75 mt-6">
                *Subject to credit approval, income verification, and lender policy. Approval timelines and rates vary by applicant. No guarantee of approval. Terms and conditions apply.
              </p>
            </div>
          </div>
        </div>

        {/* Rates, fees & disclosures (Google Ads / Meta compliance) */}
        <LoanDisclosure loanDetails={loanDetails} emiExample={emiExample} eligibility={eligibility} className="section-my" />





        {/* Footer CTA - GLASS PRISM BUTTON */}
        <div className="bg-gray-50/70 backdrop-blur-sm border-t border-gray-100/50 py-8">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 mb-4">Have questions? Our personal loan experts are ready to help!</p>
            {/* ✅ GLASS PRISM CONSULTATION BUTTON */}
            <Link 
              href="/contact" 
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-500 py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => handleRedirect(e, "/contact")}
            >
              {/* Base Glass Prism Gradient */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-blue-700/95 backdrop-blur-md" />
              
              {/* Animated Prism Shine Layer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                      style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
              </span>
              
              {/* Prismatic Edge Glow */}
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(32, 100, 200,0.25)' }} />
              
              {/* Animated Border Glow */}
              <span className="absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                      animation: 'borderGlow 3s infinite linear',
                      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                      maskComposite: 'xor',
                      WebkitMaskComposite: 'xor',
                      padding: '1px'
                    }} />
              
              {/* Button Text & Icon - Above all layers */}
              <span className="relative z-10 flex items-center gap-2">
                <span>Schedule a Free Consultation</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
              </span>
              
              {/* Subtle Particle Sparkles on Hover */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
              </span>
            </Link>
          </div>
        </div>

        {/* Personal loan FAQs (same list as the FAQPage schema above) */}
        <section aria-labelledby="pl-faq-heading" className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 section-pb">
          <h2 id="pl-faq-heading" className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
            Personal Loan FAQs
          </h2>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group rounded-xl border border-gray-200 bg-white p-4 open:shadow-sm">
                <summary className="cursor-pointer list-none flex justify-between items-center gap-4 font-semibold text-gray-900">
                  {f.q}
                  <span aria-hidden="true" className="text-blue-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-gray-600">
            More answers in our <Link href="/faq" className="text-blue-700 underline">loan FAQs</Link>, or estimate your
            repayment with the <Link href="/emi-calculator" className="text-blue-700 underline">EMI calculator</Link>.
          </p>
        </section>

      </div>

      {/* ✅ Global CSS Animations for Prism Effects */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes borderGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </>
  );
};

export default PersonalLoanPage;