"use client";
import React, { useEffect, useState, useMemo, memo } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  Heart,
  Target,
  Lightbulb,
  Globe,
  Info,
  AlertCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import HeroSection from '@/components/HeroSection';
import Script from 'next/script';

// ==================== BankingPartnersCarousel ====================
// Mirrors the home page "Trusted Banking & NBFC Partners" section exactly:
// separate desktop / mobile marquee tracks, same tile & logo sizes, so all
// logos scroll through on every screen size.
const BankingPartnersCarousel = memo(({ bankingPartners }: { bankingPartners: Array<{name: string, logo: string}> }) => {
  if (bankingPartners.length === 0) return null;

  const heading = (
    <div className="flex items-center justify-center gap-4 mb-4">
      <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
        Trusted Banking &amp; NBFC Partners
      </h2>
      <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
    </div>
  );

  const itemCount = bankingPartners.length;
  const desktopTrackWidth = 184 * itemCount;
  const mobileTrackWidth = 124 * itemCount;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-blue-100/50 shadow-2xl mb-20">
      <div className="max-w-7xl mx-auto">
        {heading}
        <div className="relative overflow-hidden py-2 lg:py-4">
          <style>{`
            @keyframes marquee-partners-desktop {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${desktopTrackWidth}px); }
            }
            @keyframes marquee-partners-mobile {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${mobileTrackWidth}px); }
            }
            .partner-marquee-desktop {
              animation: marquee-partners-desktop 40s linear infinite;
              will-change: transform;
            }
            .partner-marquee-mobile {
              animation: marquee-partners-mobile 30s linear infinite;
              will-change: transform;
            }
            .partner-marquee-desktop:hover,
            .partner-marquee-mobile:hover {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .partner-marquee-desktop,
              .partner-marquee-mobile {
                animation: none;
              }
            }
          `}</style>

          {/* Desktop */}
          <div className="hidden lg:block">
            <div
              className="flex partner-marquee-desktop"
              style={{ width: `${desktopTrackWidth * 2}px` }}
            >
              {[...bankingPartners, ...bankingPartners].map((partner, index) => (
                <div
                  key={`desktop-${partner.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: "160px", marginRight: "24px" }}
                >
                  <div className="w-40 h-20 bg-white rounded-xl px-2 py-1 flex items-center justify-center border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain scale-125"
                      loading="lazy"
                      decoding="async"
                      width={120}
                      height={60}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile */}
          <div className="lg:hidden">
            <div
              className="flex partner-marquee-mobile"
              style={{ width: `${mobileTrackWidth * 2}px` }}
            >
              {[...bankingPartners, ...bankingPartners].map((partner, index) => (
                <div
                  key={`mobile-${partner.name}-${index}`}
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ width: "112px", marginRight: "12px" }}
                >
                  <div className="w-28 h-16 bg-white rounded-xl px-2 py-1 flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-w-full max-h-full w-auto h-auto object-contain scale-125"
                      loading="lazy"
                      decoding="async"
                      width={80}
                      height={48}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-blue-50 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
});
BankingPartnersCarousel.displayName = 'BankingPartnersCarousel';

const About = () => {
  // ✅ Testimonials carousel state - Same as HeroSection
  const [currentTestimonialMobile, setCurrentTestimonialMobile] = useState(0);
  const [currentTestimonialDesktop, setCurrentTestimonialDesktop] = useState(0);

  // ✅ Same testimonials data as HeroSection
  const testimonials = [
    {
      name: "satyajit sethy",
      location: "Cuttack",
      quote: "Good organization.give good behaviour like friendly with all.",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXmOhlXiVFoZDdhkdBgzVx1-U8UxBq3QpSc7IG69R7EoGjagyScag=s36-c-rp-mo-br100",
      rating: 5
    },
    {
      name: "Rohan kumar Rout",
      location: "Bhubaneswar",
      quote: "Best service provide ❤️",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjWi-Km3_8HDuoTJPHAcJ3dcomr165YhJ8jSY2IAoeKqCHDCT9MX=s36-c-rp-mo-br100",
      rating: 5
    },
    {
      name: "Yashwant Mohanta",
      location: "Puri",
      quote: "Best financial advisor",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXvxKlE3JqPL6xmUQrZOXOParG_0U-AslDgJVLfUE-Mbvyn6V1-=s36-c-rp-mo-br100",
      rating: 5
    },
    {
      name: "Hota suresh",
      location: "Bhubaneswar",
      quote: "The best DSA in used car loan",
      avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXw7b9Ef8vaGhQdWjsmvQwiGjT5-DRvtdme0eSc9Nn9y83e9Gmd=s36-c-rp-mo-ba2-br100",
      rating: 5
    },
    {
      name: "Namita Das",
      location: "Puri",
      quote: "Best place for financial need.",
      avatar: "https://lh3.googleusercontent.com/a/ACg8ocK83OxpRRHcbJ0NEVzhbhl3wAEzrWjyCj-gj7hyBNFY9pkf8g=s36-c-rp-mo-br100",
      rating: 5
    }
  ];

  // ✅ Auto-rotate testimonials carousel - Mobile (1 at a time)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonialMobile((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ✅ Auto-rotate testimonials carousel - Desktop (3 at a time)
  useEffect(() => {
    const visibleCount = 3;
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    const interval = setInterval(() => {
      setCurrentTestimonialDesktop((prev) => (prev + 1) > maxIndex ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ✅ Desktop testimonial navigation
  const nextTestimonialDesktop = () => {
    const visibleCount = 3;
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    setCurrentTestimonialDesktop((prev) => (prev + 1) > maxIndex ? 0 : prev + 1);
  };
  
  const prevTestimonialDesktop = () => {
    const visibleCount = 3;
    const maxIndex = Math.max(0, testimonials.length - visibleCount);
    setCurrentTestimonialDesktop((prev) => (prev - 1) < 0 ? maxIndex : prev - 1);
  };

  const stats = [
    { number: '100K+', label: 'Happy Customers', icon: Users },
    { number: '₹500Cr+', label: 'Loans Disbursed', icon: TrendingUp },
    { number: '4.8/5', label: 'Customer Rating', icon: Award },
    { number: '24/7', label: 'Customer Support', icon: Heart }
  ];

  const values = [
    {
      icon: Target,
      title: 'Customer First',
      description: 'Every decision we make is centered around providing the best experience for our customers.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We leverage cutting-edge technology to simplify and enhance the lending experience.'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making financial services accessible to everyone, everywhere, anytime.'
    }
  ];

  const bankLogos = [
    "/banks/AU-Small-Finance-Bank.webp",
    "/banks/Axis_Bank_logo.svg.webp",
    "/banks/Bajaj-Finsery-Logo.webp",
    "/banks/chola-logo-removebg-preview.webp",
    "/banks/Tata-Capital.webp",
    "/banks/HDB.webp",
    "/banks/boi.webp",
    "/banks/Hero-Fincorp.webp",
    "/banks/ICICI-Bank-logo.webp",
    "/banks/IDFC-logo.webp",
    "/banks/Kotak_Mahindra_Bank_logo.webp",
    "/banks/Mahindra_Finance_Logo.webp",
    "/banks/Piramal-Logo.webp",
    "/banks/esaf-seeklogo.webp",
    "/banks/aditya_birla_camptal-removebg-preview.webp",
    "/banks/download-removebg-preview.webp",
    "/banks/dcb_bank-removebg-preview.webp",
    "/banks/Poonamwalla-Fincorp-removebg-preview.webp",
  ].filter(Boolean);

  const bankingPartners = useMemo(() => bankLogos.map((logo, index) => ({
    name: `Bank Partner ${index + 1}`,
    logo: logo
  })), [bankLogos]);

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

  // ✅ Helper function for button clicks with redirect
  const handleRedirect = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = url;
  };

  return (
    <>
      <section id="about" className="py-20 bg-gradient-to-br from-white bg-white via-blue-50/30 to-cyan-50/30 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-cyan-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Image Section */}
          <div className="relative mb-16 max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-xl mt-8">
            <HeroSection
              page="about"
              title="About EzyLoan"
              subtitle="Your trusted loan partner for all loan needs"
            />
          </div>

          {/* ✅ MANDATORY ABOUT CONTENT - Channel Partner Disclosure */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-blue-100/50 shadow-xl mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-medium text-blue-700">Who We Are</span>
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    ABOUT EZYLOAN
                  </span>
                </h3>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  EzyLoan is a loan service provider that helps customers secure loans from Banks and NBFCs. 
                  <span className="font-semibold text-blue-700"> We act as a channel partner and do not lend directly.</span>
                </p>
                
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">We specialize in:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Used Car Loans
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Loan Against Car
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Balance Transfer
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Top-Up Loans
                    </li>
                  </ul>
                </div>

                {/* ✅ Glass Prism Buttons - Working with Redirect */}
                <div className="flex flex-wrap gap-4">
                  <button 
                    className="relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold px-6 py-3 rounded-lg transition-all duration-500 group/btn cursor-pointer shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=fast-approval")}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#2563eb]/90 via-[#3b82f6]/85 to-[#06b6d4]/90 backdrop-blur-md" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(59,130,246,0.25)' }} />
                    <span className="absolute -inset-px rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'borderGlow 3s infinite linear', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px' }} />
                    <span className="relative z-10 flex items-center gap-2 text-white">
                      ✓ Fast Approval
                    </span>
                  </button>
                  <button 
                    className="relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold px-6 py-3 rounded-lg transition-all duration-500 group/btn cursor-pointer shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=transparent-process")}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#06b6d4]/90 via-[#0891b2]/85 to-[#2563eb]/90 backdrop-blur-md" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(6,182,212,0.25)' }} />
                    <span className="absolute -inset-px rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'borderGlow 3s infinite linear', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px' }} />
                    <span className="relative z-10 flex items-center gap-2 text-white">
                      ✓ Transparent Process
                    </span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur opacity-20"></div>
                <img
                  src="/pic/mision.webp"
                  alt="Car Finance"
                  className="relative w-full h-96 max-sm:h-[129px] object-cover rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 text-center border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* ✅ FIXED: Banking Partners Section - Works on Mobile & Desktop */}
          <BankingPartnersCarousel bankingPartners={bankingPartners} />

          {/* What We Specialize In */}
          <div className="bg-gradient-to-br from-cyan-50 via-white to-blue-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-cyan-100/50 shadow-xl mb-16">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-cyan-200/50 mb-6">
                  <span className="text-sm font-medium text-cyan-700">Our Services</span>
                </div>
                <h3 className="text-4xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                    WHAT WE SPECIALIZE IN
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { emoji: '🚗', text: 'Car Loan Against Car', link: '/apply-now?loan=car-loan' },
                    { emoji: '🚙', text: 'Loan Against Car', link: '/apply-now?loan=loan-against-car' },
                    { emoji: '💼', text: 'Car Loan Business Purpose', link: '/apply-now?loan=business-car-loan' },
                    { emoji: '👤', text: 'Personal Loan', link: '/apply-now?loan=personal-loan' },
                    { emoji: '🚛', text: 'Commercial Vehicle Loan', link: '/apply-now?loan=commercial-vehicle' },
                    { emoji: '🏢', text: 'Business Loan', link: '/apply-now?loan=business-loan' },
                    { emoji: '🏠', text: 'Home Loan', link: '/apply-now?loan=home-loan' },
                  ].map((service, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleRedirect(e, service.link)}
                      className="relative w-full text-left bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn overflow-hidden cursor-pointer"
                    >
                      <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                      </span>
                      <span className="relative z-10">{service.emoji} {service.text}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full backdrop-blur-sm border border-purple-200/50 mb-6">
                  <span className="text-sm font-medium text-purple-700">Why Choose Us</span>
                </div>
                <h4 className="text-3xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    WHY CHOOSE US?
                  </span>
                </h4>
                <div className="space-y-6">
                  {[
                    { icon: '💡', title: 'Expertise', desc: 'We are committed to delivering exceptional service with years of experience. No challenge is too big or too small for our expert team.' },
                    { icon: '⭐', title: 'Quality', desc: 'Providing best-in-class service and value for automotive dealers and customers with flexible, competitive rates tailored to your needs.' },
                    { icon: '🤝', title: 'Customer Service', desc: 'Customer-first approach with experienced professionals offering flexible and competitive rates tailored to your specific requirements.' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">{item.icon}</span>
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg mb-2">{item.title}</p>
                          <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 🔥 Testimonials Section - Same as Home Page HeroSection */}
          <div className="bg-gradient-to-br from-green-50 via-white to-emerald-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-green-100/50 shadow-xl mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-full backdrop-blur-sm border border-green-200/50 mb-6">
                <span className="text-sm font-medium text-green-700">Customer Reviews</span>
              </div>
              <h3 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                  TESTIMONIALS
                </span>
              </h3>
            </div>

            {/* 📱 Mobile: Carousel - 1 testimonial at a time */}
            <div className="lg:hidden relative">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentTestimonialMobile * 100}%)` }}>
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <div className="flex items-start gap-4 backdrop-blur-xl bg-white/70 rounded-xl py-5 shadow-sm border border-white/50">
                        <div className="flex-shrink-0">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/60" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff`; }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2">"{testimonial.quote}"</p>
                          <p className="text-gray-600 text-sm font-medium">– {testimonial.name}, {testimonial.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {testimonials.map((_, index) => (
                  <button key={index} onClick={() => setCurrentTestimonialMobile(index)} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1" aria-label={`Go to testimonial ${index + 1}`}>
                    <span className={`h-2.5 rounded-full transition-all duration-300 ${currentTestimonialMobile === index ? 'bg-gradient-to-r from-blue-600 to-cyan-500 w-6' : 'w-2.5 bg-gray-300/60 backdrop-blur-sm'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* 💻 Desktop: Carousel - 3 testimonials at a time */}
            <div className="hidden lg:block relative">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentTestimonialDesktop * (100/3)}%)` }}>
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-1/3 flex-shrink-0 px-3">
                      <div className="flex items-start gap-4 backdrop-blur-xl bg-white/70 rounded-xl p-5 shadow-sm border border-white/50 h-full hover:shadow-md transition-shadow">
                        <div className="flex-shrink-0">
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover border-2 border-white/60" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff`; }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />))}
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed mb-2 line-clamp-3">"{testimonial.quote}"</p>
                          <p className="text-gray-600 text-sm font-medium">– {testimonial.name}, {testimonial.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {Array.from({ length: Math.max(1, testimonials.length - 2) }).map((_, index) => (
                  <button key={index} onClick={() => setCurrentTestimonialDesktop(index)} className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1" aria-label={`Go to testimonials group ${index + 1}`}>
                    <span className={`h-2.5 rounded-full transition-all duration-300 ${currentTestimonialDesktop === index ? 'bg-gradient-to-r from-blue-600 to-cyan-500 w-6' : 'w-2.5 bg-gray-300/60 backdrop-blur-sm'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Automotive News */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-orange-100/50 shadow-xl mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full backdrop-blur-sm border border-orange-200/50 mb-6">
                <span className="text-sm font-medium text-orange-700">Industry Updates</span>
              </div>
              <h3 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-orange-600 to-red-500 bg-clip-text text-transparent">
                  LATEST AUTOMOTIVE NEWS
                </span>
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { img: 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tag: '🔋 EV News', title: 'Electric Vehicle Market Growth', desc: 'Latest trends in electric vehicle adoption and financing options for sustainable transportation...' },
                { img: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tag: '💰 Finance', title: 'Auto Loan Interest Rates', desc: 'Current market rates and best practices for vehicle financing with competitive loan options...' },
                { img: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80', tag: '📊 Market', title: 'Used Car Market Insights', desc: 'Market analysis and valuation trends for pre-owned vehicles with expert recommendations...' },
              ].map((news, idx) => (
                <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden border border-orange-100/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <img src={news.img} alt={news.title} className="w-full h-48 object-cover" />
                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">{news.tag}</div>
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">{news.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{news.desc}</p>
                    <div className="mt-4 text-orange-600 font-medium text-sm">📅 Dec 2024</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 lg:p-12 border border-white/30 shadow-2xl">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Our Core Values
                </span>
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These principles guide everything we do and shape our company culture.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const IconComponent = value.icon;
                return (
                  <div key={index} className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ✅ LOAN DETAILS BANNER - Google Ads Required */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mt-10">
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
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-blue-100 shadow-md sm:shadow-lg">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center text-base sm:text-lg">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                  <span className="font-semibold">EMI Example (Illustrative)</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div className="py-1">
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Loan Amount</p>
                    <p className="font-semibold text-sm sm:text-base md:text-lg">₹{emiExample.principal.toLocaleString('en-IN')}</p>
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
                    <p className="font-bold text-blue-600 text-sm sm:text-base md:text-lg">₹{emiExample.emi.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
                  Total Repayment: ₹{emiExample.totalAmount.toLocaleString('en-IN')} | *Actual EMI may vary based on credit profile and lender terms.
                </p>
              </div>
            </div>
          </div>

          {/* ✅ ELIGIBILITY SECTION - Google Ads Requirement */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="max-w-[85rem] mx-auto">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-green-200">
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

          {/* ✅ WORKING CONTACT SECTION - Glass Cards with Clickable Links */}
          <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mt-10">
            <div className="max-w-[85rem] mx-auto">
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] mb-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Get In Touch With Us</span>
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Phone - Clickable */}
                    <a href="tel:+916372977626" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Call Us</h4>
                        <p className="text-[#2563eb] font-medium hover:underline">+91 6372977626</p>
                        <p className="text-sm text-slate-500/80">Mon-Sat: 9AM to 7PM</p>
                      </div>
                    </a>
                    {/* Email - Clickable */}
                    <a href="mailto:contact@ezyloan.co.in" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Email Us</h4>
                        <p className="text-[#2563eb] font-medium hover:underline">contact@ezyloan.co.in</p>
                        <p className="text-sm text-slate-500/80">Quick response guaranteed</p>
                      </div>
                    </a>
                    {/* Location - Clickable Google Maps */}
                    <a href="https://www.google.com/maps/search/?api=1&query=1st+Floor+Hindustan+Tyres+Building+Pir+Bazar+Bhanpur+Cuttack+Odisha+753011" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-110">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Visit Us</h4>
                        <p className="text-[#2563eb] font-medium text-sm hover:underline">1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🔴 G2RS FIX: ENHANCED DISCLAIMER SECTION */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-16 flex items-start space-x-4">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-amber-800 mb-2">Important Disclaimer</h4>
              <p className="text-amber-900 text-sm leading-relaxed mb-2">We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.</p>
              <p className="text-amber-900 text-sm leading-relaxed mb-2"><strong>EzyLoan is not a lender.</strong> We are a loan service provider facilitating loans through Banks and NBFCs.</p>
              <p className="text-amber-900 text-sm leading-relaxed">We are a loan facilitation service and not engaged in any financial advisory or investment services.</p>
              <p className="text-amber-800 text-xs mt-3 pt-2 border-t border-amber-200">All loans are subject to bank/NBFC approval and terms. EzyLoan acts as a facilitator only.</p>
            </div>
          </div>

          {/* 🔴 G2RS COMPLIANCE FIX: ABOVE-FOLD DECLARATIONS */}
          <div className="mb-8 space-y-2 mt-10">
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-amber-900 font-medium"><strong>⚠️ Important:</strong> We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.</p>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-blue-900 font-medium"><strong>Note:</strong> EzyLoan is not a lender. We are a loan service provider facilitating loans through Banks and NBFCs.</p>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-gray-900 font-medium">We are a loan facilitation service and not engaged in any financial advisory or investment services.</p>
            </div>
          </div>
        </div>
      </section>

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

export default About;