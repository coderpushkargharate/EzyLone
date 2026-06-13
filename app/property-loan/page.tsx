'use client';  // ← Required for Next.js App Router with client components
import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  Home, ArrowRight, Percent, Clock, Shield, DollarSign, 
  FileText, User, TrendingUp, CheckCircle, Building, AlertCircle,
  Zap, Award, Phone, Mail, MapPin
} from 'lucide-react';

import HeroSection from '@/components/HeroSection';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const PropertyLoanPage: React.FC = () => {
  // ✅ LOAN DETAILS FOR GOOGLE ADS COMPLIANCE
  const loanDetails = {
    interestRate: "10% – 28% p.a.",
    processingFee: "Up to 3% of loan amount",
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
    income: "₹15,000+ per month",
    employment: "Salaried / Self-employed",
  };

  return (
    <>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Main Container with responsive padding */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28">
          
          {/* Hero Section */}
          <div className="relative mb-12 sm:mb-16 overflow-hidden rounded-2xl shadow-xl mt-8">
            <HeroSection
              page="property-loan" 
              title="Property Loan" 
              subtitle="Unlock the value of your property for your financial needs"
            />
          </div>

          {/* Introduction Section - GLASS EFFECTS */}
          <div className="mb-12 lg:mb-16">
            <div className="text-center mb-10 lg:mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                Transform Your Property Dreams Into Reality
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                At EzyLoan, we offer hassle-free property loans tailored to meet your financial needs. Whether you want to buy, renovate, or expand your property, we've got you covered. Leverage your property's value to get funds for personal or business expenses.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-blue-100/50 hover:border-blue-200/50 transition-all duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose EzyLoan?</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    At EzyLoan, we offer easy and flexible property loans to meet your financial needs. Get funds for buying, renovating, or expanding your property effortlessly. Leverage your property's value for personal or business expenses.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Low-interest rates* and flexible repayment options",
                      "Quick approvals* with minimal documentation",
                      "Reliable and hassle-free property financing"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 group">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" aria-hidden="true" />
                        <span className="text-gray-700 group-hover:text-green-700 transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-8 lg:mt-0">
                {[
                  { icon: Zap, title: "Quick Process", desc: "Fast approvals* and seamless disbursement", bg: "from-green-600 to-emerald-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Percent, title: "Best Rates", desc: "Competitive interest rates* starting from 8.5% p.a.", bg: "from-blue-600 to-cyan-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Shield, title: "Secure", desc: "Safe and transparent loan process", bg: "from-purple-600 to-pink-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Award, title: "Trusted", desc: "Thousands of satisfied customers", bg: "from-orange-600 to-red-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="group bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-md border border-gray-100/50 hover:shadow-lg hover:border-blue-200/50 transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className={`w-7 h-7 text-white ${item.iconShadow}`} aria-hidden="true" />
                      </div>
                      <h3 className="font-bold text-gray-800 mb-1 text-lg group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* ✅ COMPLIANCE: Asterisk reference for rate/approval claims */}
            <p className="text-xs text-gray-500 text-center mt-4">
              *Rates and approval timelines subject to credit assessment. T&amp;C apply.
            </p>
          </div>

          {/* Why Choose Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 lg:p-12 border border-indigo-100/50 shadow-xl mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Why Choose EzyLoan Property Loan?
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {[
                { 
                  icon: DollarSign, 
                  title: "High Loan Amount", 
                  desc: "Avail loans up to 75% of your property's market value, whether it's residential, commercial, or industrial.*",
                  bg: "from-green-600 to-emerald-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: Percent, 
                  title: "Competitive Interest Rates", 
                  desc: "Enjoy attractive interest rates* starting as low as 8.5% p.a., ensuring affordable EMIs.",
                  bg: "from-blue-600 to-cyan-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: Clock, 
                  title: "Flexible Repayment Tenure", 
                  desc: "Choose repayment terms ranging from 5 to 20 years based on your convenience.",
                  bg: "from-purple-600 to-pink-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: Building, 
                  title: "Loan for Multiple Purposes", 
                  desc: "Use the loan amount for business expansion, education, weddings, medical emergencies, or debt consolidation.*",
                  bg: "from-orange-600 to-red-700",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 text-center border border-gray-100/50 hover:border-indigo-200/50 hover:-translate-y-1"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-8 h-8 text-white ${item.iconShadow}`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            {/* ✅ COMPLIANCE: Global asterisk disclaimer */}
            <p className="text-xs text-gray-500 text-center mt-6">
              *All loan amounts, rates, and purposes are subject to credit assessment, property valuation, lender approval, and applicable terms &amp; conditions.
            </p>
          </div>

          {/* Loan Details Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 lg:p-12 border border-blue-100/50 shadow-xl mb-12 lg:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-10 bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Property Loan Details &amp; Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Loan Amount",
                  icon: DollarSign,
                  bg: "from-green-600 to-emerald-700",
                  items: [
                    { label: "Minimum", value: "₹5,00,000" },
                    { label: "Maximum", value: "₹5 Crore+" },
                    { label: "LTV Ratio", value: "Up to 75%*" }
                  ]
                },
                {
                  title: "Interest Rate",
                  icon: Percent,
                  bg: "from-blue-600 to-cyan-700",
                  items: [
                    { label: "Starting from", value: "8.5% p.a.*" },
                    { label: "Up to", value: "12.0% p.a.*" },
                    { label: "Type", value: "Reducing Rate" }
                  ]
                },
                {
                  title: "Tenure & Fees",
                  icon: Clock,
                  bg: "from-purple-600 to-pink-700",
                  items: [
                    { label: "Tenure", value: "5 - 20 years" },
                    { label: "Processing Fee", value: "Up to 1%*" },
                    { label: "Prepayment", value: "Allowed*" }
                  ]
                }
              ].map((card, index) => {
                const Icon = card.icon;
                return (
                  <div 
                    key={index} 
                    className={`group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1 ${
                      index === 2 ? 'md:col-span-2 lg:col-span-1' : ''
                    }`}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${card.bg} rounded-xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center group-hover:text-blue-700 transition-colors">{card.title}</h3>
                    <div className="space-y-3">
                      {card.items.map((item, i) => (
                        <div key={i} className="flex justify-between border-b border-gray-100/50 pb-2 last:border-0 last:pb-0">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium text-gray-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ✅ COMPLIANCE: Global disclaimer for asterisked claims */}
            <p className="text-xs text-gray-500 text-center mt-6">
              *All rates, fees, LTV ratios, and terms are subject to credit assessment, property valuation, lender approval, and applicable terms &amp; conditions. Actual offers may vary.
            </p>
          </div>

          {/* Eligibility Criteria - GLASS EFFECTS */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 md:p-8 lg:p-10 shadow-xl border border-gray-100/50 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
              Eligibility Criteria
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {[
                { 
                  icon: User, 
                  title: "Age Criteria", 
                  value: "21 - 65 years", 
                  desc: "At the time of loan maturity",
                  bg: "from-blue-600 to-indigo-700",
                  bgCard: "from-blue-50/70 to-indigo-50/70",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: DollarSign, 
                  title: "Monthly Income", 
                  value: "₹50,000+", 
                  desc: "Net monthly income*",
                  bg: "from-green-600 to-emerald-700",
                  bgCard: "from-green-50/70 to-emerald-50/70",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: FileText, 
                  title: "Property Ownership", 
                  value: "Clear Title", 
                  desc: "Property documents required*",
                  bg: "from-purple-600 to-pink-700",
                  bgCard: "from-purple-50/70 to-pink-50/70",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                },
                { 
                  icon: TrendingUp, 
                  title: "Credit Score", 
                  value: "700+", 
                  desc: "Higher scores get better rates*",
                  bg: "from-orange-600 to-red-700",
                  bgCard: "from-orange-50/70 to-red-50/70",
                  iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className={`group text-center p-6 rounded-2xl transition-all duration-300 hover:shadow-md border border-gray-100/50 hover:border-indigo-200/50 hover:-translate-y-1 bg-gradient-to-br ${item.bgCard} backdrop-blur-sm`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-8 h-8 text-white ${item.iconShadow}`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2 text-xl group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-700 text-xl font-medium">{item.value}</p>
                    <p className="text-gray-600 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              *Eligibility criteria are indicative. Final approval subject to lender's underwriting policy, documentation verification, and property valuation.
            </p>
          </div>

          {/* ✅ COMPLIANCE-FIXED CTA Section - GLASS PRISM BUTTONS */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-6 md:p-8 lg:p-12 text-center text-white shadow-2xl mb-10 relative overflow-hidden" role="region" aria-label="Call to action">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">
                Ready to Unlock Your Property's Potential?
              </h2>
              <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-95 leading-relaxed px-2">
                Join thousands of satisfied customers who chose EzyLoan for their property financing needs. 
                Get quick approval* with competitive rates and flexible terms!
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-8">
                {["Quick Approval*", "Minimal Documentation", "Best Interest Rates*"].map((feature, index) => (
                  <div key={index} className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-300 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" aria-hidden="true" />
                    <span className="text-base md:text-lg">{feature}</span>
                  </div>
                ))}
              </div>
              
              {/* ✅ COMPLIANCE: Changed "Instant Approval" to "Check Eligibility" */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                {/* ✅ GLASS PRISM APPLY BUTTON */}
                <Link 
                  href="/apply-now" 
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-indigo-700 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-lg md:text-xl w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/apply-now")}
                  aria-label="Apply for property loan - check eligibility"
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/60 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(99,102,241,0.2)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)',
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
                    <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-indigo-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                    <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-indigo-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                    <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-indigo-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                  </span>
                </Link>
                
                {/* ✅ GLASS PRISM CONTACT BUTTON */}
                <Link 
                  href="/contact" 
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 px-6 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-lg md:text-xl w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/contact")}
                  aria-label="Contact EzyLoan support team"
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
              <p className="text-sm opacity-80 mt-6 max-w-2xl mx-auto px-2">
                *Subject to credit approval, property valuation, and lender policy. Approval timelines and rates vary by applicant. No guarantee of approval. Terms and conditions apply.
              </p>
            </div>
          </div>

        </div>

        {/* ✅ LOAN DETAILS BANNER - Google Ads Required - Enhanced Font Sizes */}
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
                *Terms and conditions apply. Interest rates subject to credit assessment and lender approval. Representative example only.
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
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.rate}% p.a.</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Tenure</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.tenureMonths} months</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Monthly EMI</p>
                  <p className="font-bold text-blue-600 text-sm sm:text-base md:text-lg">₹{emiExample.emi.toLocaleString()}</p>
                </div>
              </div>
              {/* ✅ COMPLIANCE: Full repayment disclosure + variation disclaimer */}
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
                Total Repayment: ₹{emiExample.totalAmount.toLocaleString()} (Principal + Interest) | 
                <span className="block sm:inline sm:ml-1">*Actual EMI may vary based on credit profile, lender terms, and applicable fees. This is a representative example for illustration purposes only.</span>
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
                *Eligibility subject to verification and lender's underwriting policy.
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
            <p className="text-gray-600 mb-4">Have questions? Our property loan experts are ready to help!</p>
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

export default PropertyLoanPage;