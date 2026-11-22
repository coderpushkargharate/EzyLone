'use client';  // ← Required for Next.js App Router with client components

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, CheckCircle, Calculator, Clock, Shield, RefreshCw,
  TrendingUp, CreditCard, AlertCircle, Info, Phone, Mail, 
  Zap, Target, Gift, FileText, User, Car, MapPin, DollarSign
} from 'lucide-react';

import HeroSection from '@/components/HeroSection';
import LoanDisclosure from '@/components/LoanDisclosure';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const CarLoanTopUp: React.FC = () => {
  // ✅ LOAN DETAILS FOR GOOGLE ADS COMPLIANCE
  const loanDetails = {
    interestRate: "10% – 28% p.a.",
    processingFee: "Up to 3% of loan amount",
    tenure: "12 – 60 months",
  };

  // ✅ EMI EXAMPLE CALCULATION - Required by Google Ads
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

      <div className="min-h-screen bg-gradient-to-br bg-white from-white via-blue-50/30 to-blue-50/30 relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl shadow-xl hero-wrap">
            {/* 🔴 G2RS FIX #4: Updated subtitle to use "loan" terminology */}
            <HeroSection
              page="car-top-up" 
              title="Car Top-Up Loan" 
              subtitle="Get additional funds against your existing loan"
            />
          </div>

          {/* Intro Section */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-50 section-py">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-200 mb-6">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Car Loan Top-Up</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                  Car Loan Top-Up
                </h1>
                
                <p className="text-base md:text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed px-2">
                  Unlock extra funds with our Car Loan Top-Up option! service, designed to meet your additional financial needs without the hassle of a new loan. EzyLoan offers quick approvals, competitive interest rates, and flexible repayment terms, allowing you to access more funds while keeping your existing car loan intact.
                </p>

                <div className="mb-10">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
                    Why EzyLoan's Car Loan Top-Up?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                    {[
                      { icon: TrendingUp, title: "Low-interest rates", bg: "from-blue-500 to-blue-500", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                      { icon: Clock, title: "Quick approval process", bg: "from-blue-500 to-blue-400", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                      { icon: Shield, title: "Flexible repayment options", bg: "from-blue-600 to-blue-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div 
                          key={index} 
                          className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg border border-green-100/50 hover:border-green-200/50 transition-all duration-300 group hover:-translate-y-1"
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                            <Icon className={`w-6 h-6 text-white ${item.iconShadow}`} />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{item.title}</h3>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-base md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                  Apply today and get the additional funds you need with ease!
                </p>

                {/* ✅ GLASS PRISM APPLY BUTTON */}
                <Link 
                  href="/apply-now?loan=car-loan-topup"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 transition-all duration-500 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={(e) => handleRedirect(e, "/apply-now?loan=car-loan-topup")}
                  aria-label="Apply for car loan top-up"
                >
                  {/* Base Glass Prism Gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-blue-600/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(22,163,74,0.25)' }} />
                  
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
                    <span>Apply for Top-Up</span>
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

          {/* Main Content */}
          <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 section-py">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Car Loan Top-Up Section */}
              <div className="text-center section-head">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                    Car Loan Top-Up
                  </span>
                </h2>
              </div>

              {/* Ready to Experience Section */}
              <div className="text-center section-head">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8">
                  <span className="text-gray-800">Ready to Experience the Benefits of </span>
                  <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                    Car Loan Top-Up
                  </span>
                  <span className="text-gray-800">?</span>
                </h2>
                {/* ✅ GLASS PRISM APPLY NOW BUTTON */}
                <Link 
                  href="/apply-now?loan=car-loan-topup"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 transition-all duration-500 px-8 sm:px-12 py-4 rounded-full text-lg sm:text-xl font-semibold hover:shadow-2xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={(e) => handleRedirect(e, "/apply-now?loan=car-loan-topup")}
                  aria-label="Apply for car loan top-up now"
                >
                  {/* Base Glass Prism Gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-blue-600/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(22,163,74,0.25)' }} />
                  
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
                  
                  {/* Button Text - Above all layers */}
                  <span className="relative z-10 flex items-center gap-2">
                    <span>Apply Now</span>
                  </span>
                  
                  {/* Subtle Particle Sparkles on Hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                    <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                    <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                  </span>
                </Link>
              </div>

              {/* Eligibility Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-green-100/50 max-w-6xl mx-auto section-mb">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Left Side - Content */}
                  <div>
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                      <span className="text-gray-800">ELIGIBILITY</span>
                      <br />
                      <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                        for Car Loan Top Up
                      </span>
                    </h3>
                    
                    <div>
                      <h4 className="text-xl font-bold mb-4 text-blue-600">Salaried Individuals:</h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {[
                          "Minimum 20 and maximum 60 years of age",
                          "Minimum employment of 2 years in the current company",
                          "Minimum income of Rs 3,00,000 a year",
                          "Valid Car Registration"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                            <span className="text-gray-700 group-hover:text-green-700 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Right Side - Image */}
                  <div className="relative w-full">
                    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl bg-gray-50" style={{ aspectRatio: "1280 / 897" }}>
                      <img
                        src="/car-blue-elementor-io-optimized.webp"
                        alt="Car loan top-up eligibility — quick and easy process"
                        width={1280}
                        height={897}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute -bottom-3 -right-3 bg-green-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits Section - GLASS EFFECTS + FIXED ICON VISIBILITY */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 section-mb">
                {[
                  { 
                    icon: CreditCard, 
                    title: "Instant Liquidity", 
                    desc: "Get immediate access to funds without the hassle of applying for a new loan from scratch.",
                    bg: "from-blue-600 to-blue-700",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-blue-50/70 to-blue-50/70"
                  },
                  { 
                    icon: Clock, 
                    title: "Quick Approval", 
                    desc: "Faster processing since you're already our customer. Get approved in just 24 hours.",
                    bg: "from-blue-600 to-blue-600",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-blue-50/70 to-blue-50/70"
                  },
                  { 
                    icon: Shield, 
                    title: "Same Interest Rate", 
                    desc: "Enjoy the same competitive interest rate as your existing car loan with no additional charges.",
                    bg: "from-blue-700 to-blue-800",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-blue-50/70 to-blue-50/70"
                  }
                ].map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br ${benefit.cardBg} backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-gray-100/50 hover:border-green-200/50 shadow-xl text-center hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1`}
                    >
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${benefit.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-white ${benefit.iconShadow}`} />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 group-hover:text-green-700 transition-colors">{benefit.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{benefit.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* TopUp Amount Calculator - GLASS EFFECTS */}
              <div className="bg-gradient-to-br from-blue-50/70 via-white/70 to-blue-50/70 backdrop-blur-sm rounded-3xl border border-green-100/50 shadow-xl section-mb card-pad">
                <div className="text-center section-head">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                      How Much Can You Get?
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                    TopUp amount depends on your loan repayment history and current vehicle value
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
                  <div className="space-y-5 sm:space-y-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">TopUp Calculation Factors</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { title: "Current Vehicle Value", desc: "Based on current market price of your vehicle" },
                        { title: "Outstanding Loan Amount", desc: "Remaining principal amount on your existing loan" },
                        { title: "Repayment History", desc: "Your track record of timely EMI payments" },
                        { title: "Income Stability", desc: "Current income and employment stability" }
                      ].map((item, index) => (
                        <div key={index} className="flex items-start space-x-3 group">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                          <div>
                            <span className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{item.title}</span>
                            <p className="text-gray-600 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/30 shadow-lg">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-5 sm:mb-6">Typical TopUp Amounts</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {[
                        { label: "Excellent Credit", amount: "Up to ₹10 Lakhs", bg: "bg-green-50" },
                        { label: "Good Credit", amount: "Up to ₹7 Lakhs", bg: "bg-blue-50" },
                        { label: "Average Credit", amount: "Up to ₹5 Lakhs", bg: "bg-orange-50" }
                      ].map((item, index) => (
                        <div key={index} className={`flex justify-between items-center p-4 ${item.bg} rounded-xl border border-gray-100/50`}>
                          <span className="font-medium text-gray-700">{item.label}</span>
                          <span className="font-bold text-green-600">{item.amount}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-4">
                      *Actual amount subject to eligibility and vehicle valuation
                    </p>
                  </div>
                </div>
              </div>

              {/* Use Cases - GLASS EFFECTS */}
              <div className="section-mb">
                <div className="text-center section-head">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                      Perfect For Your Needs
                    </span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-2">
                    Use your car loan top-up for various financial requirements
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { icon: "🏠", title: "Home Renovation", desc: "Upgrade your home with the extra funds", bg: "from-blue-600 to-blue-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                    { icon: "🎓", title: "Education", desc: "Fund your or your child's education", bg: "from-blue-700 to-blue-800", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                    { icon: "💼", title: "Business", desc: "Invest in your business growth", bg: "from-blue-600 to-blue-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                    { icon: "🚨", title: "Emergency", desc: "Handle unexpected financial needs", bg: "from-orange-600 to-red-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" }
                  ].map((item, index) => (
                    <div 
                      key={index} 
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/30 shadow-lg text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <span className={`text-white text-lg sm:text-xl ${item.iconShadow}`}>{item.icon}</span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-2 group-hover:text-green-700 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility & Documents - GLASS EFFECTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 section-mb">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl card-pad">
                  <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800">Eligibility Criteria</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "Existing car loan customer with EzyLoan",
                      "Minimum 12 months of loan repayment history",
                      "No EMI defaults in the last 12 months",
                      "Current income should support additional EMI",
                      "Vehicle should have sufficient market value"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 group">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                        <span className="text-gray-600 group-hover:text-green-700 transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-white/30 shadow-xl card-pad">
                  <h3 className="text-xl sm:text-2xl font-bold mb-5 sm:mb-6 text-gray-800">Required Documents</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "Latest salary slips (3 months)",
                      "Bank statements (6 months)",
                      "Current loan statement",
                      "Vehicle valuation report",
                      "Updated KYC documents"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-3 group">
                        <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                        <span className="text-gray-600 group-hover:text-blue-700 transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA Section - GLASS PRISM BUTTONS */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl text-center text-white relative overflow-hidden card-pad">
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    Need Extra Funds? We've Got You Covered!
                  </h2>
                  <p className="text-lg md:text-xl mb-6 sm:mb-8 opacity-90 px-2">
                    Get instant access to additional funds with our car loan top-up facility
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {/* ✅ GLASS PRISM APPLY BUTTON */}
                    <Link 
                      href="/apply-now?loan=car-loan-topup"
                      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-green-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                      onClick={(e) => handleRedirect(e, "/apply-now?loan=car-loan-topup")}
                      aria-label="Apply for car loan top-up"
                    >
                      {/* Base Glass Effect */}
                      <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                      
                      {/* Animated Prism Shine Layer */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent" 
                              style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                      </span>
                      
                      {/* Prismatic Edge Glow */}
                      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: 'inset 0 0 25px rgba(34,197,94,0.2)' }} />
                      
                      {/* Animated Border Glow */}
                      <span className="absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)',
                              animation: 'borderGlow 3s infinite linear',
                              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              maskComposite: 'xor',
                              WebkitMaskComposite: 'xor',
                              padding: '1px'
                            }} />
                      
                      {/* Button Text & Icon - Above all layers */}
                      <span className="relative z-10 flex items-center gap-2">
                        <span>Apply for TopUp</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      
                      {/* Subtle Particle Sparkles on Hover */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-green-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                        <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-green-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-green-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                      </span>
                    </Link>
                    
                    {/* ✅ GLASS PRISM CHECK ELIGIBILITY BUTTON */}
                    <Link 
                      href="/apply-now?loan=car-loan-topup"
                      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                      aria-label="Check eligibility for car loan top-up"
                    >
                      {/* Base Glass Effect */}
                      <span className="absolute inset-0 bg-white/10 backdrop-blur-md" />
                      
                      {/* Animated Prism Shine Layer */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" 
                              style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                      </span>
                      
                      {/* Prismatic Edge Glow */}
                      <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)' }} />
                      
                      {/* Animated Border Glow */}
                      <span className="absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
                        <span>Check Eligibility</span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rates, fees & disclosures (Google Ads / Meta compliance) */}
        <LoanDisclosure loanDetails={loanDetails} emiExample={emiExample} eligibility={eligibility} className="section-my" />




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

export default CarLoanTopUp;