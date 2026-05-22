'use client';

import React from 'react';
import { 
  Car, ArrowRight, Percent, Clock, Shield, CheckCircle, 
  Star, Users, Award, Smartphone, FileText, Heart, Info, AlertCircle,
  Phone, Mail, MapPin
} from 'lucide-react';
import Link from "next/link";
import Script from "next/script";
import HeroSection from '@/components/HeroSection';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const NewCarLoanPage: React.FC = () => {
  const features = [
    'Competitive Interest Rates',
    'Quick Approval Process', 
    'Flexible Repayment Options',
    'Minimal Documentation',
    'Fast Processing',
    'Transparent Terms'
  ];
  
  const stats = [
    { value: '7.99%', label: 'Starting Interest Rate', icon: Percent },
    { value: '48h', label: 'Approval Time', icon: Clock },
    { value: '84mo', label: 'Max Tenure', icon: Shield },
    { value: '10k+', label: 'Happy Customers', icon: Users }
  ];

  // 🔴 FIXED: Removed ALL trailing spaces from schema.org URLs
  const carLoanSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "New Car Loan - EzyLoan",
    "description": "Get a new car loan with competitive interest rates starting from 7.99%. Quick approval, flexible tenure up to 84 months, and minimal documentation.",
    "brand": {
      "@type": "Brand",
      "name": "EzyLoan"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": "0",
      "priceSpecification": {
        "@type": "UnitPriceSpecification",
        "priceType": "https://schema.org/StartingPrice",
        "minPrice": "0"
      },
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "FinancialService",
        "name": "EzyLoan"
      }
    },
    "areaServed": "IN",
    "loanTerm": {
      "@type": "QuantitativeValue",
      "minValue": 12,
      "maxValue": 84,
      "unitCode": "MON"
    },
    "interestRate": {
      "@type": "QuantitativeValue",
      "minValue": 7.99,
      "unitCode": "P1"
    }
  };

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
        
        {/* Hero Section */}
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 max-sm:pt-32">
          
          {/* 🔥 HERO BANNER */}
          <div className="relative mb-16 w-full">
            <HeroSection
              page="new-car-loan"
              title="New Car Loan"
              subtitle="Drive your dream car today with our competitive loan offers"
            />
          </div>

          {/* Stats */}
          <div className="mt-12 max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index} 
                    className="bg-white/70 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md hover:border-blue-200/50 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="font-bold text-xl sm:text-2xl text-gray-800 group-hover:text-blue-700 transition-colors">{stat.value}</div>
                    <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Turn Your Dream <span className="text-blue-600">Into Reality</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-3xl">
                Drive home your dream car with EzyLoan! We offer flexible and convenient loan options tailored to your needs, making it easier than ever to own the car you've always wanted. With our quick approval process and competitive interest rates, you can enjoy a hassle-free experience from start to finish.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                {features.map((feature, index) => (
                  <div 
                    key={index} 
                    className="flex items-start space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 hover:border-blue-300/50 hover:shadow-md transition-all duration-300 group"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {/* ✅ GLASS PRISM APPLY NOW BUTTON */}
                <Link 
                  href="/apply-now?loan=new-car-loan"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 transition-all duration-500 py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  onClick={(e) => handleRedirect(e, "/apply-now?loan=new-car-loan")}
                >
                  {/* Base Glass Prism Gradient */}
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-indigo-700/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(37,99,235,0.25)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
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
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-700 border-2 border-blue-600 bg-white/80 backdrop-blur-sm hover:bg-blue-50/90 transition-all duration-500 py-4 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  onClick={(e) => handleRedirect(e, "/contact")}
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 20px rgba(37,99,235,0.15)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.4), transparent)',
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
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500 group">
                <div className="aspect-w-16 aspect-h-9">
                  <img 
                    src="/pic/car112.webp" 
                    alt="New Car Loan - Drive your dream car" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                {/* Glass overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100/50 max-w-xs hidden md:block group-hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center">
                  <Smartphone className="w-6 h-6 text-blue-600 mr-2 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <p className="font-bold text-gray-800">Apply in 2 minutes</p>
                    <p className="text-xs text-gray-500">Using our mobile app</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 md:p-10 lg:p-12 my-20 backdrop-blur-sm border border-blue-100/50">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden shadow-xl h-full group">
                  <div className="aspect-w-16 aspect-h-9">
                    {/* 🔴 FIXED: Removed trailing space from Unsplash URL */}
                    <img 
                      src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Car Finance Solutions" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  {/* Glass overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                {/* 🔴 G2RS FIX #4: "Financing Solutions" → "Loan Options" */}
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Customized Loan Options
                </h2>
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Turn your dream of owning a new car into reality with EzyLoan! Our customized loan options are designed to fit your budget, ensuring you get behind the wheel of your favorite car without any financial stress. With fast processing and transparent terms, EzyLoan makes the journey to owning your new car smooth and effortless.
                </p>
                
                <div className="space-y-5">
                  {[
                    { icon: Percent, title: "Interest Rates from 7.99%", desc: "Competitive rates in the market" },
                    { icon: Clock, title: "48 Hour Approval", desc: "Quick processing and disbursement" },
                    { icon: Shield, title: "Flexible Tenure", desc: "12 to 84 months repayment options" },
                    { icon: FileText, title: "Minimal Documentation", desc: "Only essential paperwork required" }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div 
                        key={index} 
                        className="flex items-start space-x-4 p-5 bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/50 hover:shadow-md hover:border-blue-200/50 transition-all duration-300 group"
                      >
                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us Section - 🔴 G2RS FIX #4: "Best Rates" → "Competitive Rates" */}
          <div className="py-16">
            <div className="text-center mb-16 max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  Why Choose EzyLoan?
                </span>
              </h2>
              <p className="text-xl text-gray-600">
                Experience the difference with our customer-centric approach and industry-leading services
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: Star, 
                  // 🔴 FIX: "Best Rates" → "Competitive Rates"
                  title: "Competitive Rates", 
                  desc: "Industry-leading interest rates starting from 7.99% per annum with no hidden charges",
                  gradient: "from-yellow-400 to-amber-500"
                },
                { 
                  icon: Clock, 
                  title: "Quick Process", 
                  desc: "Get approved within 48 hours with minimal documentation and digital verification",
                  gradient: "from-blue-400 to-cyan-500"
                },
                { 
                  icon: Users, 
                  title: "Expert Support", 
                  desc: "Dedicated relationship managers available 24/7 for personalized assistance",
                  gradient: "from-purple-400 to-pink-500"
                },
                { 
                  icon: Award, 
                  title: "Trusted Brand", 
                  desc: "Over 10,000+ satisfied customers across India with 4.9/5 average rating",
                  gradient: "from-rose-400 to-red-500"
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={index} 
                    className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100/50 hover:border-blue-200/50 hover:-translate-y-1"
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Testimonial Section */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 my-20 backdrop-blur-sm border border-indigo-100/50">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                ))}
              </div>
              <blockquote className="text-2xl font-bold text-gray-900 mb-6 italic">
                "EzyLoan made buying my first car completely stress-free. The entire process took less than 2 days from application to approval!"
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  RS
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900">Rahul Sharma</p>
                  <p className="text-gray-600">Maruti Swift Owner</p>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ WORKING CONTACT SECTION - Glass Cards with Clickable Links */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Get In Touch With Us</span>
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">Our experts are ready to help you with your new car loan</p>
                </div>
                <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                  {/* Phone - Clickable */}
                  <a href="tel:+916372977626" className="flex items-center space-x-3 sm:space-x-4 group cursor-pointer p-3 rounded-xl hover:bg-white/50 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                      <Phone className="w-6 h-6 text-white" />
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
                      <Mail className="w-6 h-6 text-white" />
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
                      <MapPin className="w-6 h-6 text-white" />
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

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12 text-center text-white shadow-2xl my-20 relative overflow-hidden">
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
            
            <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Ready to Drive Your Dream Car?
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
                Apply today and drive away with confidence! Choose EzyLoan and hit the road in your new car without any worries. Our experts are ready to help you find the perfect financing solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                {/* ✅ GLASS PRISM APPLY NOW BUTTON - CTA */}
                <Link 
                  href="/apply-now?loan=new-car-loan"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-blue-700 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 text-base sm:text-lg"
                  onClick={(e) => handleRedirect(e, "/apply-now?loan=new-car-loan")}
                >
                  {/* Base Glass Effect */}
                  <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                  
                  {/* Animated Prism Shine Layer */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent" 
                          style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                  </span>
                  
                  {/* Prismatic Edge Glow */}
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ boxShadow: 'inset 0 0 25px rgba(37,99,235,0.2)' }} />
                  
                  {/* Animated Border Glow */}
                  <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
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
                    <Car className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Apply Now</span>
                  </span>
                  
                  {/* Subtle Particle Sparkles on Hover */}
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                    <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                    <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                  </span>
                </Link>
                
                {/* ✅ GLASS PRISM CONTACT US BUTTON - CTA */}
                <Link 
                  href="/contact"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-bold text-white border-2 border-white/80 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all duration-500 py-4 px-8 rounded-xl hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-base sm:text-lg"
                  onClick={(e) => handleRedirect(e, "/contact")}
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
                    <Heart className="w-5 h-5 fill-white transition-transform duration-300 group-hover:scale-110" />
                    <span>Contact Us</span>
                  </span>
                </Link>
              </div>
              <p className="mt-6 text-sm opacity-80 max-w-2xl mx-auto flex items-center justify-center gap-1">
                <Shield className="w-4 h-4 inline-block mb-0.5" /> 
                Zero processing fees | 100% digital application | Secure & confidential
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

        {/* Footer CTA */}
        <div className="bg-gray-50 border-t border-gray-100 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-600 mb-4">Have questions? Our car loan experts are ready to help!</p>
            {/* ✅ GLASS PRISM FOOTER CTA BUTTON */}
            <Link 
              href="/contact"
              className="group relative inline-flex items-center space-x-2 bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-all duration-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 overflow-hidden"
              onClick={(e) => handleRedirect(e, "/contact")}
            >
              {/* Base Glass Effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-indigo-700/95 backdrop-blur-md" />
              
              {/* Animated Prism Shine Layer */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                      style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
              </span>
              
              {/* Prismatic Edge Glow */}
              <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.3), inset 0 0 35px rgba(37,99,235,0.2)' }} />
              
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
              
              {/* Button Text & Icon - Above all layers */}
              <span className="relative z-10 flex items-center space-x-2">
                <span>Schedule a Free Consultation</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              
              {/* Subtle Particle Sparkles on Hover */}
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="car-loan-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(carLoanSchema) }}
        strategy="afterInteractive"
      />

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

export default NewCarLoanPage;