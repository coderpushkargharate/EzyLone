'use client';

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  Wallet, ArrowRight, Clock, Shield, Zap, CheckCircle, 
  DollarSign, FileText, User, CreditCard, TrendingUp, AlertCircle,
  Award, Star, Phone, Mail, MapPin
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';

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

  // ✅ FAQ schema - Fixed trailing spaces
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is the minimum age requirement for a personal loan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The minimum age requirement is 21 years and maximum is 65 years at the time of loan maturity. Subject to lender policy."
        }
      },
      {
        "@type": "Question",
        "name": "What is the minimum monthly income required for personal loan eligibility?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The minimum monthly income requirement is ₹25,000 net monthly income*. Subject to verification and lender underwriting."
        }
      },
      {
        "@type": "Question",
        "name": "What is the interest rate range for personal loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Interest rates* start from 10.5% p.a. and can go up to 18.0% p.a. depending on your credit profile, income, and lender policy."
        }
      },
      {
        "@type": "Question",
        "name": "What is the loan tenure available for personal loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Loan tenure ranges from 1 to 5 years with flexible repayment options. Final tenure subject to lender approval."
        }
      },
      {
        "@type": "Question",
        "name": "Is prepayment allowed on personal loans?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, prepayment is allowed on personal loans* with minimal charges as per terms and conditions. Charges vary by lender."
        }
      }
    ]
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

  return (
    <>
 
      <div 
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
        itemScope
        itemType="https://schema.org/WebPage"
      >
        {/* ✅ Structured Data for SEO - Fixed trailing spaces in schema URLs */}
        <Script
          id="personal-loan-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(personalLoanSchema) 
          }}
        />
        
        <Script
          id="faq-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(faqSchema) 
          }}
        />

        {/* Banner Image Section */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">
          {/* Hero Image Section */}
          <div className="relative mb-16 max-w-8xl mx-auto overflow-hidden rounded-2xl shadow-xl ">
            <HeroSection
              page="personal-loan"
              title="Personal Loan"
              subtitle="Fulfill your personal financial needs with our hassle-free personal loans"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Introduction Section */}
          <div className="mb-8 sm:mb-12 lg:mb-16">
            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Fulfill Your Dreams with Personal Loans
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                At EzyLoan, we understand that life is full of opportunities and unexpected expenses. Whether you're planning a wedding, going on a vacation, handling medical emergencies, or consolidating debt, our Personal Loan is designed to provide you with the financial flexibility you need*.
              </p>
            </div>
          </div>

          {/* Features Grid - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-3xl p-8 lg:p-12 mb-16 border border-blue-100/50">
            <div className="text-center mb-12">
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
                  bg: "from-green-600 to-emerald-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                {
                  icon: DollarSign,
                  title: "Flexible Loan Amounts",
                  desc: "Choose a loan amount that fits your needs* – from ₹50,000 to ₹50 lakhs, giving you the financial freedom to achieve your goals. Subject to income & credit assessment.",
                  bg: "from-blue-600 to-cyan-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                {
                  icon: TrendingUp,
                  title: "Competitive Interest Rates*",
                  desc: "Enjoy competitive interest rates* starting as low as 10.5% p.a., making your EMIs affordable and easy to manage. Final rate subject to credit profile.",
                  bg: "from-purple-600 to-pink-700",
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
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
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
                  { icon: Clock, title: "Quick Processing*", desc: "24-48 hours* approval", bg: "from-blue-600 to-cyan-700" },
                  { icon: Shield, title: "Secure Process", desc: "100% safe & secure", bg: "from-green-600 to-emerald-700" }
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
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-blue-100/50 shadow-xl mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
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
                  bg: "from-green-600 to-emerald-700"
                },
                {
                  icon: TrendingUp,
                  title: "Interest Rate",
                  items: [
                    { label: "Starting from", value: "10.5% p.a.*", color: "text-blue-600" },
                    { label: "Up to", value: "18.0% p.a.*", color: "text-blue-600" },
                    { label: "Type", value: "Reducing Rate", color: "text-gray-700" }
                  ],
                  bg: "from-blue-600 to-cyan-700"
                },
                {
                  icon: Clock,
                  title: "Tenure & Fees",
                  items: [
                    { label: "Tenure", value: "1 - 5 years", color: "text-purple-600" },
                    { label: "Processing Fee", value: "Up to 2%*", color: "text-purple-600" },
                    { label: "Prepayment", value: "Allowed*", color: "text-gray-700" }
                  ],
                  bg: "from-purple-600 to-pink-700"
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
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 lg:p-12 shadow-xl border border-gray-100/50 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Eligibility Criteria
              </span>
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: User, title: "Age Criteria", value: "21 - 65 years", desc: "At the time of loan maturity", bg: "from-blue-600 to-indigo-700" },
                { icon: DollarSign, title: "Monthly Income", value: "₹25,000+*", desc: "Net monthly income*", bg: "from-green-600 to-emerald-700" },
                { icon: FileText, title: "Employment", value: "Salaried/Self-employed", desc: "Stable employment history*", bg: "from-purple-600 to-pink-700" },
                { icon: TrendingUp, title: "Credit Score", value: "650+*", desc: "Higher scores get better rates*", bg: "from-orange-600 to-red-700" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index}
                    className="group text-center p-8 bg-gradient-to-br from-gray-50/70 to-white/70 backdrop-blur-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                    itemScope
                    itemType="https://schema.org/QuantitativeValue"
                  >
                    <div className={`w-20 h-20 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-10 h-10 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-3 text-lg group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 text-lg font-medium">{item.value}</p>
                    <p className="text-sm text-gray-500 mt-2">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              *Eligibility criteria are indicative. Final approval subject to lender's underwriting policy, documentation verification, income proof, and credit assessment.
            </p>
          </div>

          {/* ✅ COMPLIANCE-FIXED CTA Section - GLASS PRISM BUTTONS */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-center text-white shadow-2xl mb-16 relative overflow-hidden" role="region" aria-label="Call to action">
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
                  href="/apply" 
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-lg w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/apply")}
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
                        style={{ boxShadow: 'inset 0 0 25px rgba(37,99,235,0.2)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)',
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

        {/* ✅ LOAN DETAILS BANNER - Google Ads Required */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 text-white" role="region" aria-label="Loan terms and conditions">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Interest Rate</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.interestRate}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Processing Fee</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.processingFee}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Loan Tenure</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.tenure}</p>
                </div>
              </div>
              {/* ✅ COMPLIANCE: Enhanced disclaimer */}
              <p className="text-xs sm:text-sm text-center mt-2 sm:mt-3 opacity-80 font-medium">
                *Terms and conditions apply. Interest rates &amp; fees subject to credit assessment, income verification, and lender approval. Representative example only.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ EMI EXAMPLE - Near Form (Google Ads Requirement) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-blue-100/50 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300" role="region" aria-label="Representative EMI example">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center text-base sm:text-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0" aria-hidden="true"></span>
                <span className="font-semibold">Representative EMI Example (Illustrative)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Loan Amount</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">₹{emiExample.principal.toLocaleString()}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Interest Rate</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.rate}% p.a.*</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Tenure</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.tenureMonths} months</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Monthly EMI</p>
                  <p className="font-bold text-blue-600 text-sm sm:text-base md:text-lg">₹{emiExample.emi.toLocaleString()}*</p>
                </div>
              </div>
              {/* ✅ COMPLIANCE: Full repayment disclosure + variation disclaimer */}
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
                Total Repayment: ₹{emiExample.totalAmount.toLocaleString()} (Principal + Interest) | 
                <span className="block sm:inline sm:ml-1">*Actual EMI may vary based on credit profile, lender terms, processing fees, and applicable charges. This is a representative example for illustration purposes only.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ✅ ELIGIBILITY SECTION - Google Ads Requirement */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-green-200/50 backdrop-blur-sm hover:border-green-300/50 transition-colors duration-300" role="region" aria-label="Eligibility criteria">
              <h3 className="font-bold text-gray-800 mb-3 text-base sm:text-lg">✅ Eligibility Criteria</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Age: {eligibility.age}</span>
                </div>
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Income: {eligibility.income}</span>
                </div>
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Employment: {eligibility.employment}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                *Eligibility subject to income verification, credit assessment, and lender's underwriting policy.
              </p>
            </div>
          </div>
        </div>

        {/* 🔴 G2RS COMPLIANCE FIX: Footer Declarations (Added at page bottom as requested) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mb-8">
          <div className="max-w-[85rem] mx-auto space-y-2">
            {/* FIX #1: NO INVESTMENT DECLARATION */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                <strong>⚠️ Important:</strong> We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.
              </p>
            </div>
            {/* FIX #2: NOT A LENDER STATEMENT */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-blue-900 font-medium">
                <strong>Note:</strong> EzyLoan is not a lender. We are a loan service provider facilitating loans through Banks and NBFCs.
              </p>
            </div>
            {/* FIX #3: FINAL COMPLIANCE LINE */}
            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-gray-900 font-medium">
                We are a loan facilitation service and not engaged in any financial advisory or investment services.
              </p>
            </div>
          </div>
        </div>

        {/* 🔴 G2RS COMPLIANCE: Enhanced Disclaimer Section (Before Footer CTA) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mb-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800 mb-2">Important Disclaimer</h4>
                {/* FIX #1: NO INVESTMENT */}
                <p className="text-amber-900 text-sm leading-relaxed mb-2">
                  We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.
                </p>
                {/* FIX #2: NOT A LENDER */}
                <p className="text-amber-900 text-sm leading-relaxed mb-2">
                  <strong>EzyLoan is not a lender.</strong> We are a loan service provider facilitating loans through Banks and NBFCs.
                </p>
                {/* FIX #3: FINAL COMPLIANCE LINE */}
                <p className="text-amber-900 text-sm leading-relaxed">
                  We are a loan facilitation service and not engaged in any financial advisory or investment services.
                </p>
                <p className="text-amber-800 text-xs mt-3 pt-2 border-t border-amber-200">
                  All loans are subject to bank/NBFC approval and terms. EzyLoan acts as a facilitator only.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer CTA - GLASS PRISM BUTTON */}
        <div className="bg-gray-50/70 backdrop-blur-sm border-t border-gray-100/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 mb-4">Have questions? Our personal loan experts are ready to help!</p>
            {/* ✅ GLASS PRISM CONSULTATION BUTTON */}
            <Link 
              href="/contact" 
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 py-3 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={(e) => handleRedirect(e, "/contact")}
            >
              {/* Base Glass Prism Gradient */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-indigo-600/95 backdrop-blur-md" />
              
              {/* Animated Prism Shine Layer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                      style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
              </span>
              
              {/* Prismatic Edge Glow */}
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(37,99,235,0.25)' }} />
              
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