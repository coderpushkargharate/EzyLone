'use client';  // ← Required for Next.js App Router with client components
import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, CheckCircle, Calculator, Clock, Shield, 
  TrendingDown, Star, Users, Award, Phone, Mail, 
  MapPin, RefreshCw, AlertCircle, Info 
} from 'lucide-react';

import HeroSection from '@/components/HeroSection';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const CarLoanRefinance: React.FC = () => {

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
  
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 bg-white to-cyan-50/30 relative overflow-hidden">
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 sm:pt-24 lg:pt-28">
          
          {/* Hero Section */}
          <div className="relative mb-12 sm:mb-16 overflow-hidden rounded-2xl shadow-xl mt-8">
            <HeroSection
              page="car-refinance" 
              title="Car Refinance" 
              subtitle="Refinance your existing loan with better rates and terms"
            />
          </div>

          {/* Intro Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-r from-blue-50/70 to-cyan-50/70 backdrop-blur-sm py-12 sm:py-16 border-y border-blue-100/50">
            <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200/50 mb-6">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Car Loan Refinance</span>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                  Take control of your finances with EzyLoan's Car Refinance Loan!
                </h1>
                
                <p className="text-base md:text-lg text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed px-2">
                  If you're looking to lower your monthly payments, reduce your interest rate, or access funds for other expenses, refinancing your car loan can be a smart move. Our easy and efficient refinancing process allows you to replace your existing loan with one that better suits your financial goals.
                </p>
                
                <p className="text-base md:text-lg text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed px-2">
                  With competitive rates and flexible terms, EzyLoan helps you save money while improving your cash flow. Discover how our Car Refinance Loan can provide you with the financial relief you need and get started today!
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* ✅ GLASS PRISM APPLY BUTTON */}
                  <Link 
                    href="/apply-now?loan=used-car-refinance"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-500 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=used-car-refinance")}
                    aria-label="Apply for car loan refinancing"
                  >
                    {/* Base Glass Prism Gradient */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-cyan-500/95 backdrop-blur-md" />
                    
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
                      <span>Apply for Refinancing</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </Link>
                  
                  {/* ✅ GLASS PRISM CONTACT BUTTON */}
                  <Link 
                    href="/contact"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 transition-all duration-500 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={(e) => handleRedirect(e, "/contact")}
                    aria-label="Contact EzyLoan support"
                  >
                    {/* Base Glass Prism Gradient */}
                    <span className="absolute inset-0 bg-gradient-to-r from-green-600/95 via-green-500/90 to-emerald-500/95 backdrop-blur-md" />
                    
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
                      <span>Contact Us</span>
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
          </div>
          
          {/* Main Content */}
          <div className="bg-gradient-to-br from-gray-50/50 via-white to-blue-50/50 py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Car Loan Refinance Section */}
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Car Loan Refinance
                  </span>
                </h2>
                <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                  Refinancing your car loan with EzyLoan offers multiple benefits, including lower monthly payments and reduced interest rates. By improving your loan terms, you can save money over time and enhance your cash flow. Whether you want to shorten your loan term or extend it for affordability, EzyLoan makes refinancing simple and efficient. Take control of your finances today!
                </p>
              </div>

              {/* Benefits Grid - GLASS EFFECTS + ICON VISIBILITY FIX */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
                {[
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    ),
                    bg: "from-green-600 to-emerald-700",
                    border: "border-green-100/50 hover:border-green-200/50",
                    hoverColor: "group-hover:text-green-600",
                    title: "Swift",
                    subtitle: "Digital Application Process",
                    desc: "Say goodbye to endless paperwork and a long waiting period. We offer a completely online process for quick and easy refinance approvals."
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    ),
                    bg: "from-blue-600 to-cyan-700",
                    border: "border-blue-100/50 hover:border-blue-200/50",
                    hoverColor: "group-hover:text-blue-600",
                    title: "Unlock",
                    subtitle: "For Higher Funding Amount",
                    desc: "Get substantial additional funds against your current vehicle's worth. Refinance your car loans up to 200% of the value of your vehicle."
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                    bg: "from-purple-600 to-pink-700",
                    border: "border-purple-100/50 hover:border-purple-200/50",
                    hoverColor: "group-hover:text-purple-600",
                    title: "Flexible",
                    subtitle: "Repayment Tenure",
                    desc: "Select a payment plan between 12 to 60 months according to your budget. Choose a longer repayment period in order to lower your EMI for enhanced financial flexibility."
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    ),
                    bg: "from-orange-600 to-red-700",
                    border: "border-orange-100/50 hover:border-orange-200/50",
                    hoverColor: "group-hover:text-orange-600",
                    title: "Hassles",
                    subtitle: "Documentation Process",
                    desc: "To apply, simply submit your valid ID, address, and income proof. Get additional funds over your existing loan with minimum documentation."
                  },
                  {
                    icon: (
                      <svg className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    ),
                    bg: "from-teal-600 to-green-700",
                    border: "border-teal-100/50 hover:border-teal-200/50",
                    hoverColor: "group-hover:text-teal-600",
                    title: "Tailor",
                    subtitle: "Repayment Structure",
                    desc: "You can choose a repayment plan that suits your financial needs from our diverse portfolio of partners, offering step-up and balance transfer options."
                  }
                ].map((benefit, index) => (
                  <div 
                    key={index} 
                    className={`group bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border ${benefit.border} hover:-translate-y-1`}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${benefit.bg} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {benefit.icon}
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 ${benefit.hoverColor} transition-colors duration-300`}>
                      {benefit.title}
                    </h3>
                    <h4 className="text-lg font-semibold mb-3 text-blue-600">
                      {benefit.subtitle}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Ready to Experience Section */}
              <div className="text-center mb-16 sm:mb-20">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-gray-800">Ready to Experience the Benefits of </span>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Car Loan Refinance
                  </span>
                  <span className="text-gray-800">?</span>
                </h2>
                {/* ✅ GLASS PRISM APPLY NOW BUTTON */}
                <Link 
                  href="/apply-now?loan=used-car-refinance"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-500 px-8 sm:px-12 py-4 rounded-full text-lg sm:text-xl shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={(e) => handleRedirect(e, "/apply-now?loan=used-car-refinance")}
                  aria-label="Apply for car loan refinancing now"
                >
                  {/* Base Glass Prism Gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-green-600/95 via-green-500/90 to-emerald-600/95 backdrop-blur-md" />
                  
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
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
                  </span>
                  
                  {/* Subtle Particle Sparkles on Hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                    <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                    <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                  </span>
                </Link>
              </div>

              {/* Eligibility & Documents - GLASS EFFECTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-16 sm:mb-20">
                {/* Eligibility Criteria */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-green-100/50 hover:border-green-200/50 transition-colors duration-300">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                    <span className="text-gray-800">ELIGIBILITY</span>
                    <br />
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      FOR LOAN AGAINST CAR
                    </span>
                  </h3>
                  
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h4 className="text-xl font-bold mb-4 text-blue-600">Salaried Individuals:</h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {[
                          "Age criteria: 21 to 60 years",
                          "Minimum employment of 2 years",
                          "Income proof",
                          "Car ownership detail"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                            <span className="text-gray-700 group-hover:text-blue-700 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-xl font-bold mb-4 text-purple-600">Self-Employed Individuals:</h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {[
                          "Age criteria: 25 to 60 years",
                          "Minimum Business setup of 2 years",
                          "Income proof"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                            <span className="text-gray-700 group-hover:text-blue-700 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Required Documents */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-100/50 hover:border-blue-200/50 transition-colors duration-300">
                  <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
                    <span className="text-gray-800">Documents</span>
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      Required for Loan Against CAR
                    </span>
                  </h3>
                  
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <h4 className="text-xl font-bold mb-4 text-green-600">Salaried Individuals:</h4>
                      <ul className="space-y-2 sm:space-y-3">
                        {[
                          "Completed Application Form",
                          "A Recent Passport Size Photograph",
                          "Identity Proof (ID) (Any One)",
                          "Address Proof (Any One)",
                          "Income Proof (3 months Salary Slip)",
                          "Vehicle RC Copy",
                          "Loan Track Statement"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start space-x-3 group">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                            <span className="text-gray-700 group-hover:text-blue-700 transition-colors">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section - GLASS PRISM BUTTONS */}
              <div className="text-center mt-12 sm:mt-16">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-6 sm:p-8 lg:p-12 relative overflow-hidden">
                  {/* Glass shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-base md:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                      Join thousands of satisfied customers who have saved money with our car loan refinancing solutions.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                      <div className="flex items-center text-white group cursor-pointer hover:text-blue-200 transition-colors">
                        <Phone className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                        <a href="tel:+916372977626" className="text-base sm:text-lg font-medium hover:underline">+91 6372977626</a>
                      </div>
                      <div className="flex items-center text-white group cursor-pointer hover:text-blue-200 transition-colors">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-300" />
                        <a href="mailto:contact@ezyloan.co.in" className="text-base sm:text-lg font-medium hover:underline">contact@ezyloan.co.in</a>
                      </div>
                    </div>
                    
                    {/* ✅ GLASS PRISM APPLY BUTTON - CTA */}
                    <Link 
                      href="/apply-now?loan=used-car-refinance"
                      className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 py-3 sm:py-4 px-8 sm:px-12 rounded-2xl text-base sm:text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                      onClick={(e) => handleRedirect(e, "/apply-now?loan=used-car-refinance")}
                      aria-label="Apply for car loan refinancing"
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
                        <span>Apply for Car Loan Refinancing</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                      
                      {/* Subtle Particle Sparkles on Hover */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                        <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section - GLASS EFFECTS */}
          <div className="py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                  <span className="text-gray-800">Frequently Asked </span>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Questions
                  </span>
                </h2>
                <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                  If you have additional questions, please give us a call at +91 6372977626 or email us at Contact@ezyloan.co.in
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {[
                  {
                    question: "What type of loan can I get against a used car?",
                    answer: "You can apply for a secured loan where your used car is used as collateral. The loan amount typically depends on the car's market value, age, and condition.",
                    bg: "from-green-600 to-emerald-700",
                    border: "border-green-100/50"
                  },
                  {
                    question: "What are the eligibility criteria for getting a loan against a used car?",
                    answer: "The eligibility criteria may include a minimum age requirement, proof of income, and ownership of the car. The car should also meet specific age and condition standards.",
                    bg: "from-blue-600 to-cyan-700",
                    border: "border-blue-100/50"
                  },
                  {
                    question: "How much loan can I get against my used car?",
                    answer: "The loan amount can vary, but it is usually a percentage of your car's current market value, often ranging between 50% to 80%.",
                    bg: "from-purple-600 to-pink-700",
                    border: "border-purple-100/50"
                  },
                  {
                    question: "What is the interest rate on a loan against a used car?",
                    answer: "The interest rate on a loan against a used car depends on factors such as the car's value, your credit score, and the lender's policies. Typically, the rates are lower for secured loans.",
                    bg: "from-orange-600 to-red-700",
                    border: "border-orange-100/50"
                  },
                  {
                    question: "How long does it take to process a loan against a used car?",
                    answer: "The processing time may vary by lender but generally takes a few days once all required documents are submitted and verified.",
                    bg: "from-indigo-600 to-purple-700",
                    border: "border-indigo-100/50"
                  },
                  {
                    question: "What documents are required to apply for a loan against a used car?",
                    answer: "Commonly required documents include proof of car ownership, car insurance, identity proof, address proof, and proof of income.",
                    bg: "from-pink-600 to-rose-700",
                    border: "border-pink-100/50"
                  }
                ].map((faq, index) => (
                  <div 
                    key={index} 
                    className={`group bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border ${faq.border} hover:-translate-y-1`}
                  >
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br ${faq.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md`}>
                        <span className="text-white font-bold text-xs sm:text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">Q</span>
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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

          {/* ✅ LOAN DETAILS BANNER - Google Ads Required */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="max-w-[85rem] mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 text-white">
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
                <p className="text-xs sm:text-sm text-center mt-2 sm:mt-3 opacity-80 font-medium">*Terms and conditions apply. Subject to lender approval.</p>
              </div>
            </div>
          </div>

          {/* ✅ EMI EXAMPLE - Near Form (Google Ads Requirement) */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="max-w-[85rem] mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-blue-100/50 shadow-md sm:shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center text-base sm:text-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span className="font-semibold">EMI Example (Illustrative)</span>
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
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
                  Total Repayment: ₹{emiExample.totalAmount.toLocaleString()} | *Actual EMI may vary based on credit profile and lender terms.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ ELIGIBILITY SECTION - Google Ads Requirement */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="max-w-[85rem] mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-green-200/50 backdrop-blur-sm hover:border-green-300/50 transition-colors duration-300">
                <h3 className="font-bold text-gray-800 mb-3 text-base sm:text-lg">✅ Eligibility Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="flex items-center py-1">
                    <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0">✓</span>
                    <span className="text-xs sm:text-sm md:text-base font-medium">Age: {eligibility.age}</span>
                  </div>
                  <div className="flex items-center py-1">
                    <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0">✓</span>
                    <span className="text-xs sm:text-sm md:text-base font-medium">Income: {eligibility.income}</span>
                  </div>
                  <div className="flex items-center py-1">
                    <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0">✓</span>
                    <span className="text-xs sm:text-sm md:text-base font-medium">Employment: {eligibility.employment}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* 🔴 G2RS COMPLIANCE: Enhanced Disclaimer Section (Before page end) */}
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

export default CarLoanRefinance;