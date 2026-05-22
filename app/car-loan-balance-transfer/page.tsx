'use client';

import React from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ArrowRight, CheckCircle, Calculator, Clock, Shield, RefreshCw, 
  Percent, FileText, User, CreditCard, Car, MapPin, DollarSign, 
  TrendingDown, AlertCircle, Info, Phone, Mail
} from 'lucide-react';

import HeroSection from '@/components/HeroSection';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const CarLoanBalanceTransfer: React.FC = () => {
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
      {/* 🔴 FIXED: Removed trailing space from Google Ads script src */}
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
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28">
          
          {/* Hero Section */}
          <div className="relative mb-12 sm:mb-16 overflow-hidden rounded-2xl shadow-xl mt-8">
            <HeroSection
              page="car-balance-transfer" 
              title="Car Balance Transfer" 
              subtitle="Switch your existing loan to a lower interest rate and save money"
            />
          </div>

          {/* Main Content */}
          <div className="py-6 sm:py-8 lg:py-5">
            
            {/* Introduction Section */}
            <div className="text-center mb-12 sm:mb-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-800">
                Looking to lower your monthly car loan payments?
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed px-2">
                Our Car Loan Balance Transfer service offers you the perfect opportunity to switch your existing loan to a lower interest rate, helping you save money. With a hassle-free process and quick approval, you can enjoy reduced EMIs and better financial flexibility.
              </p>
            </div>

            {/* Why Choose EzyLoan Section - GLASS EFFECTS + FIXED ICON VISIBILITY */}
            <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16 border border-blue-100/50">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                  Why choose EzyLoan for a Car Loan Balance Transfer?
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10">
                {[
                  {
                    icon: TrendingDown,
                    title: "Low-interest rates",
                    desc: "Get significantly reduced interest rates compared to your current lender and save thousands on your monthly EMIs.",
                    // ✅ FIXED: Darker gradient for better white icon contrast + added shadow
                    bg: "from-green-600 to-emerald-700",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  },
                  {
                    icon: Clock,
                    title: "Quick approval process",
                    desc: "Experience fast processing with minimal documentation and get approval within 24-48 hours.",
                    // ✅ FIXED: Darker gradient for better white icon contrast + added shadow
                    bg: "from-blue-600 to-cyan-700",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  },
                  {
                    icon: Shield,
                    title: "Flexible repayment options",
                    desc: "Choose from various repayment tenures and enjoy the flexibility to prepay without penalties.",
                    // ✅ FIXED: Darker gradient for better white icon contrast + added shadow
                    bg: "from-purple-600 to-pink-700",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg text-center hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 group hover:-translate-y-1"
                    >
                      {/* ✅ FIXED: Icon container with proper shadow for visibility */}
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className={`w-7 h-7 sm:w-8 sm:h-8 text-white ${item.iconShadow}`} />
                      </div>
                      <h3 className="text-xl font-bold mb-3 sm:mb-4 text-gray-800 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
              
              <div className="max-w-4xl mx-auto text-center px-2">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                  Choose EzyLoan for your Car Loan Balance Transfer to benefit from competitive interest rates, quick processing, and a transparent transfer process. We prioritize your convenience, offering flexible repayment options and personalized support to ensure a seamless transition. With EzyLoan, you can reduce your financial burden and enjoy lower EMIs with ease.
                </p>
              </div>
            </div>

            {/* Benefits Section - GLASS EFFECTS + FIXED ICON VISIBILITY */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg mb-12 sm:mb-16 border border-gray-100/50">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                  Discover the Benefits of Car Loan Balance Transfer
                </h2>
                <p className="text-lg text-gray-600">
                  Why take Car Loan Balance Transfer from us?
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {[
                  {
                    icon: Clock,
                    title: "Swift Online Process",
                    desc: "No need to physically stand in line or wait for a call from the required lender. Directly apply online and get balance loan approval instantly.",
                    // ✅ FIXED: Darker bg + shadow for icon visibility
                    bg: "bg-blue-600",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-blue-50/70 to-indigo-50/70"
                  },
                  {
                    icon: TrendingDown,
                    title: "Lower Interest Rate",
                    desc: "Get a new loan balance transfer with a lower interest rate. Our industry expert lenders will offer you competitive rates for your current financial requirement.",
                    // ✅ FIXED: Darker bg + shadow for icon visibility
                    bg: "bg-green-600",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-green-50/70 to-emerald-50/70"
                  },
                  {
                    icon: RefreshCw,
                    title: "Fast and Efficient",
                    desc: "Our streamlined online process gets your balance transfer for car loan approved quickly, so you can start saving from the word go.",
                    // ✅ FIXED: Darker bg + shadow for icon visibility
                    bg: "bg-purple-600",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-purple-50/70 to-pink-50/70"
                  },
                  {
                    icon: Shield,
                    title: "Clear and Transparent",
                    desc: "We are clear with our terms and conditions upfront. Therefore, you will be guided properly by our experts and will know what you are getting into.",
                    // ✅ FIXED: Darker bg + shadow for icon visibility
                    bg: "bg-orange-600",
                    iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]",
                    cardBg: "from-orange-50/70 to-yellow-50/70"
                  }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className={`bg-gradient-to-br ${item.cardBg} backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-100/50 hover:border-blue-200/50 transition-all duration-300 group`}
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        {/* ✅ FIXED: Icon with proper shadow for visibility */}
                        <div className={`${item.bg} w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${item.iconShadow}`} />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                          <p className="text-gray-600 text-sm sm:text-base">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Documents Section - GLASS EFFECTS + FIXED ICON VISIBILITY */}
            <div className="bg-gradient-to-br from-gray-50/70 to-blue-50/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 mb-12 sm:mb-16 border border-gray-100/50">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                  Documents you require for Balance Loan Transfer?
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
                {[
                  { icon: FileText, title: "Complete application", bg: "bg-blue-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: User, title: "Recent Passport Size Photograph", bg: "bg-green-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: CreditCard, title: "Identity Proof", bg: "bg-purple-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: Car, title: "Valid Car Registration Copy", bg: "bg-orange-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: MapPin, title: "Address Proof", bg: "bg-indigo-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: DollarSign, title: "Income Proof", bg: "bg-teal-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" },
                  { icon: FileText, title: "Loan Track Statement", bg: "bg-red-600", iconShadow: "drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" }
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={index} 
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 group hover:-translate-y-1"
                    >
                      {/* ✅ FIXED: Icon with proper shadow for visibility */}
                      <div className={`w-12 h-12 sm:w-16 sm:h-16 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
                        <Icon className={`w-6 h-6 sm:w-8 sm:h-8 text-white ${item.iconShadow}`} />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 text-gray-800 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    </div>
                  );
                })}
              </div>

              <div className="text-center max-w-3xl mx-auto px-2">
                <p className="text-base md:text-lg text-gray-700 mb-6">
                  Ready to escape a high-interest rate? Upgrade now to a more relaxing loan. Contact Ezyloan to resolve all your financial needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {/* ✅ GLASS PRISM APPLY NOW BUTTON */}
                  <Link 
                    href="/apply-now?loan=car-loan-bt"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-500 px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=car-loan-bt")}
                    aria-label="Apply for car loan balance transfer"
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
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </Link>
                  
                  {/* ✅ GLASS PRISM CONTACT US BUTTON */}
                  <Link 
                    href="/contact"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 transition-all duration-500 px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={(e) => handleRedirect(e, "/contact")}
                    aria-label="Contact EzyLoan support"
                  >
                    {/* Base Glass Prism Gradient */}
                    <span className="absolute inset-0 bg-gradient-to-r from-green-600/95 via-green-500/90 to-teal-600/95 backdrop-blur-md" />
                    
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

            {/* Eligibility Section - GLASS EFFECTS */}
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 lg:p-12 shadow-lg mb-12 sm:mb-16 border border-gray-100/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
                    ELIGIBILITY
                  </h2>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-600">
                    for Car Loan Balance Transfer
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-lg sm:text-xl font-semibold mb-3 text-gray-800">Salaried Individuals:</h4>
                      <div className="space-y-3">
                        {[
                          "Minimum 20 and maximum 60 years of age",
                          "Minimum employment of 2 years in the current company",
                          "Minimum income of Rs 3,00,000 a year",
                          "Valid Car Registration"
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-3 group">
                            <CheckCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                            <span className="text-gray-600 group-hover:text-blue-700 transition-colors">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"></div>
                  <div 
                    className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-r from-gray-200/70 to-gray-300/70 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-gray-100/50"
                    aria-label="Car loan eligibility illustration"
                  >
                    <span className="text-gray-400 text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">🚗</span>
                    <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-blue-600 text-white p-2.5 sm:p-3 rounded-full shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ WORKING CONTACT SECTION - Glass Cards with Clickable Links */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Get In Touch With Us</span>
                    </h3>
                    <p className="text-gray-600 text-sm sm:text-base">Our experts are ready to help you with your car loan balance transfer</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Phone - Clickable */}
                    <a href="tel:+916372977626" className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Phone className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base">Call Us</h4>
                        <p className="text-[#2563eb] font-medium text-sm sm:text-base hover:underline">+91 63729 77626</p>
                        <p className="text-xs text-slate-500/80 hidden sm:block">Mon-Sat: 9AM to 7PM</p>
                      </div>
                    </a>
                    {/* Email - Clickable */}
                    <a href="mailto:care@ezyloan.co.in" className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Mail className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base">Email Us</h4>
                        <p className="text-[#2563eb] font-medium text-sm sm:text-base hover:underline">care@ezyloan.co.in</p>
                        <p className="text-xs text-slate-500/80 hidden sm:block">Quick response guaranteed</p>
                      </div>
                    </a>
                    {/* Location - Clickable Google Maps */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=1st+Floor+Hindustan+Tyres+Building+Pir+Bazar+Bhanpur+Cuttack+Odisha+753011" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <MapPin className="w-6 h-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base">Visit Us</h4>
                        <p className="text-[#2563eb] font-medium text-xs sm:text-sm hover:underline line-clamp-2">
                          1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Final CTA Section - GLASS PRISM BUTTONS */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-8 lg:p-12 text-center text-white relative overflow-hidden">
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  Ready to Make the Smart Switch?
                </h2>
                <p className="text-lg md:text-xl mb-8 opacity-95 max-w-3xl mx-auto px-2">
                  Join thousands who have saved money by transferring their car loan to EzyLoan
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  {/* ✅ GLASS PRISM APPLY NOW BUTTON - CTA */}
                  <Link 
                    href="/apply-now?loan=car-loan-bt"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-base sm:text-lg"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=car-loan-bt")}
                    aria-label="Apply for car loan balance transfer now"
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
                          style={{ boxShadow: 'inset 0 0 25px rgba(37,99,235,0.2)' }} />
                    
                    {/* Animated Border Glow */}
                    <span className="absolute -inset-px rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </Link>
                  
                  {/* ✅ GLASS PRISM CALCULATE SAVINGS BUTTON */}
                  <button 
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 px-6 py-3 sm:px-8 sm:py-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 text-base sm:text-lg"
                    aria-label="Calculate your potential savings"
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
                      <Calculator className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
                      <span>Calculate Savings</span>
                    </span>
                  </button>
                </div>
              </div>
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

export default CarLoanBalanceTransfer;