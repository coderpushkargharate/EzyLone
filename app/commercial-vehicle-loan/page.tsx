'use client';  // ← Required for Next.js App Router with client components

import React from 'react';
import Link from "next/link";
import Script from 'next/script';
import { 
  Truck, ArrowRight, Percent, Clock, Shield, DollarSign, FileText, AlertCircle,
  User, TrendingUp, CheckCircle, Building, Zap, Award, Bus, Car, Phone, Mail, MapPin
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const CommercialVehicleLoanPage: React.FC = () => {
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
      {/* ✅ GOOGLE ADS TAG - Fixed: Removed trailing spaces in URL */}
      <Script
        id="google-ads-gtag"
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=AW-18024243962"
      />
      <Script
        id="google-ads-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18024243962');
          `,
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Main Container with Responsive Padding */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28">
          
          {/* Hero Section */}
          <div className="relative mb-12 sm:mb-16 max-w-[85rem] mx-auto overflow-hidden rounded-2xl shadow-xl mt-8">
            <HeroSection
              page="commercial-vehicle-loan" 
              title="Commercial Vehicle Loan" 
              subtitle="Expand your business with our commercial vehicle financing solutions"
            />
          </div>

          {/* Introduction Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg sm:shadow-xl border border-blue-100/50 mb-8 sm:mb-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                  Accelerate Your Business Growth
                </span>
              </h2>
              
              {/* ✅ FIX: Replaced all "href" typos with "to" */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6 sm:mb-8 text-center max-w-4xl mx-auto px-4">
                At EzyLoan, we provide comprehensive commercial vehicle financing solutions to help your business thrive. Whether you need trucks, buses, or specialized commercial vehicles, we offer competitive rates and flexible terms tailored to your business needs.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-10">
                {[
                  { icon: Zap, title: "Fast Processing", desc: "Quick loan approval and disbursement", bg: "from-blue-600 to-indigo-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Percent, title: "Best Rates", desc: "Competitive interest rates from 9.5% p.a.*", bg: "from-green-600 to-emerald-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Shield, title: "Secure", desc: "Safe and transparent process", bg: "from-purple-600 to-pink-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Award, title: "Trusted", desc: "Thousands of satisfied customers", bg: "from-orange-600 to-red-700", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="group text-center p-4 sm:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                    >
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 text-white ${item.iconShadow}`} />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
              {/* ✅ COMPLIANCE: Asterisk reference for rate claim */}
              <p className="text-xs text-gray-500 text-center mt-4">
                *Rates subject to credit assessment. T&amp;C apply.
              </p>
            </div>
          </div>

          {/* About Section - GLASS EFFECTS */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100/50 mb-8 sm:mb-12">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                  Tailored Financing Solutions for Your Business
                </span>
              </h2>
              
              {/* ✅ FIX: "href" → "to" */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 sm:mb-10 text-center max-w-4xl mx-auto px-4">
                At EzyLoan, we understand that having the right commercial vehicle is crucial for your business operations. That's why we provide tailored financing solutions designed to meet the unique needs of businesses, big or small. With our Commercial Vehicle Loan, you can choose from a variety of vehicles, enjoy flexible repayment plans, and benefit from low-interest rates.
              </p>
              
              <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 items-center">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Why Choose Commercial Vehicle Loan?</h3>
                  {/* ✅ FIX: All "href" typos corrected */}
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                    At EzyLoan, we offer affordable and flexible commercial vehicle loans to help you grow your business with ease. Whether you're purchasing a new truck, bus, van, or fleet of vehicles, our loans are designed to meet your financial needs efficiently.
                  </p>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-6 sm:mb-8">
                    Get the financial support you need to expand your fleet, boost your business, and increase profitability with EzyLoan's Commercial Vehicle Loan. Apply now and drive your business toward success!
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      "Quick approval process",
                      "Competitive interest rates",
                      "Flexible repayment options",
                      "Minimal documentation required"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start space-x-2 sm:space-x-3 group">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                        </div>
                        <span className="text-sm sm:text-base text-gray-700 font-medium group-hover:text-green-700 transition-colors">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-6 sm:p-8 order-first lg:order-last border border-blue-100/50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">Loan for All Types of Commercial Vehicles</h3>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4 sm:mb-6">
                    Whether you need a truck, bus, van, pickup, or heavy-duty vehicle, our loans cover a wide range of commercial vehicles to support your business expansion.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[
                      { icon: Truck, label: "Trucks", color: "text-blue-600", bg: "from-blue-500 to-blue-600" },
                      { icon: Bus, label: "Buses", color: "text-green-600", bg: "from-green-500 to-green-600" },
                      { icon: Car, label: "Vans", color: "text-purple-600", bg: "from-purple-500 to-purple-600" },
                      { icon: Building, label: "Heavy Duty", color: "text-orange-600", bg: "from-orange-500 to-orange-600" }
                    ].map((vehicle, index) => {
                      const Icon = vehicle.icon;
                      return (
                        <div 
                          key={index} 
                          className="group text-center p-3 sm:p-4 bg-white/70 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50"
                        >
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${vehicle.bg} rounded-xl flex items-center justify-center mx-auto mb-1 sm:mb-2 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]`} aria-hidden="true" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">{vehicle.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Loan Details Section - GLASS EFFECTS */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-indigo-100/50 mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                Commercial Vehicle Loan Details &amp; Features
              </span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: DollarSign,
                  title: "Loan Amount",
                  items: [
                    { label: "Minimum", value: "₹3,00,000", color: "text-green-600" },
                    { label: "Maximum", value: "₹3 Crores", color: "text-green-600" },
                    { label: "LTV Ratio", value: "Up to 90%", color: "text-green-600" }
                  ],
                  bg: "from-green-600 to-emerald-700"
                },
                {
                  icon: Percent,
                  title: "Interest Rate",
                  items: [
                    { label: "Starting From", value: "8.75% p.a.*", color: "text-blue-600" },
                    { label: "Rate Type", value: "Fixed/Floating", color: "text-blue-600" },
                    { label: "Rate Range", value: "8.75% - 15% p.a.*", color: "text-blue-600" }
                  ],
                  bg: "from-blue-600 to-indigo-700"
                },
                {
                  icon: Clock,
                  title: "Tenure & Fees",
                  items: [
                    { label: "Tenure", value: "1 - 8 years", color: "text-purple-600" },
                    { label: "Processing Fee", value: "Up to 2.5%*", color: "text-purple-600" },
                    { label: "Prepayment", value: "Allowed*", color: "text-purple-600" }
                  ],
                  bg: "from-purple-600 to-pink-700"
                }
              ].map((section, index) => {
                const Icon = section.icon;
                return (
                  <div 
                    key={index} 
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-indigo-200/50 hover:-translate-y-1"
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${section.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-5 sm:mb-6 text-center group-hover:text-indigo-700 transition-colors">{section.title}</h3>
                    <div className="space-y-3 sm:space-y-4">
                      {section.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100/50 last:border-0">
                          <span className="text-gray-600 font-medium text-sm sm:text-base">{item.label}</span>
                          <span className={`font-bold ${item.color} text-sm sm:text-base`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* ✅ COMPLIANCE: Global disclaimer for asterisked claims */}
            <p className="text-xs text-gray-500 text-center mt-6">
              *All rates, fees, and terms are subject to credit assessment, lender approval, and applicable terms &amp; conditions. Actual offers may vary.
            </p>
          </div>

          {/* Eligibility Criteria - GLASS EFFECTS */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 shadow-xl border border-gray-100/50 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-10">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                Eligibility Criteria
              </span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Building, title: "Business Age", value: "2+ years", desc: "In business operation", bg: "from-blue-600 to-indigo-700" },
                { icon: DollarSign, title: "Annual Turnover", value: "₹50 Lakhs+", desc: "Minimum annual turnover", bg: "from-green-600 to-emerald-700" },
                { icon: FileText, title: "Business Type", value: "All Types", desc: "Proprietorship, Partnership, LLP, Pvt Ltd", bg: "from-purple-600 to-pink-700" },
                { icon: TrendingUp, title: "Credit Score", value: "650+", desc: "Good credit history required", bg: "from-orange-600 to-red-700" }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="group text-center p-5 sm:p-6 bg-gradient-to-br from-gray-50/70 to-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100/50 hover:border-indigo-200/50 hover:-translate-y-1"
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bg} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]`} aria-hidden="true" />
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 sm:mb-2 text-base sm:text-lg group-hover:text-indigo-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 text-base sm:text-lg font-medium">{item.value}</p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">{item.desc}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 text-center mt-6">
              *Eligibility criteria are indicative. Final approval subject to lender's underwriting policy and documentation verification.
            </p>
          </div>

          {/* ✅ COMPLIANCE-FIXED CTA Section - GLASS PRISM BUTTONS */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white shadow-2xl mb-12 relative overflow-hidden" role="region" aria-label="Call to action">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                {/* ✅ FIX: "href" → "to" */}
                Ready to Expand Your Fleet?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 text-indigo-100 max-w-3xl mx-auto px-4">
                Get the financial support you need to expand your fleet, boost your business, and increase profitability with EzyLoan's Commercial Vehicle Loan.
              </p>
              
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 px-2">
                {[
                  "Quick Approval Process*",
                  "Competitive Interest Rates*",
                  "Flexible Repayment Options"
                ].map((badge, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" aria-hidden="true" />
                    <span className="text-xs sm:text-sm whitespace-nowrap">{badge}</span>
                  </div>
                ))}
              </div>

              {/* ✅ COMPLIANCE: Avoid "Instant Approval" claim - potentially misleading */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2">
                {/* ✅ GLASS PRISM APPLY BUTTON */}
                <Link 
                  href="/apply-now" 
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-indigo-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-base sm:text-lg w-full sm:w-auto"
                  onClick={(e) => handleRedirect(e, "/apply-now")}
                  aria-label="Apply for commercial vehicle loan"
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/60 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(99,102,241,0.2)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 text-base sm:text-lg w-full sm:w-auto"
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
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
              
              {/* ✅ COMPLIANCE: Footer disclaimer for CTA claims */}
              <p className="text-xs text-indigo-100/80 mt-6 max-w-2xl mx-auto">
                *Approval timelines and rates depend on credit assessment, documentation, and lender policy. No guarantee of approval.
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
              {/* ✅ COMPLIANCE: Clear disclaimer visible */}
              <p className="text-xs sm:text-sm text-center mt-2 sm:mt-3 opacity-80 font-medium">
                *Terms and conditions apply. Interest rates subject to credit assessment and lender approval. Representative example only.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ EMI EXAMPLE - Near Form (Google Ads Requirement) - Enhanced Font Sizes */}
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

        {/* ✅ ELIGIBILITY SECTION - Google Ads Requirement - Enhanced Font Sizes */}
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

        {/* Footer CTA - GLASS EFFECTS */}
        <div className="bg-gray-50/70 backdrop-blur-sm border-t border-gray-100/50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 mb-4">Have questions? Our car loan experts are ready to help!</p>
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

export default CommercialVehicleLoanPage;