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
import LoanDisclosure from '@/components/LoanDisclosure';

// ==================== BankingPartnersCarousel ====================
// Mirrors the home page "Trusted Banking & NBFC Partners" section exactly:
// separate desktop / mobile marquee tracks, same tile & logo sizes, so all
// logos scroll through on every screen size.
const BankingPartnersCarousel = memo(({ bankingPartners }: { bankingPartners: Array<{name: string, logo: string}> }) => {
  if (bankingPartners.length === 0) return null;

  const heading = (
    <div className="flex items-center justify-center gap-4 mb-4">
      <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
        Trusted Banking &amp; NBFC Partners
      </h2>
      <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
    </div>
  );

  const itemCount = bankingPartners.length;
  const desktopTrackWidth = 184 * itemCount;
  const mobileTrackWidth = 124 * itemCount;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-50 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-2xl section-mb card-pad">
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
    "/banks/boi.jpg",
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
      <section id="about" className="bg-gradient-to-br from-white bg-white via-blue-50/30 to-blue-50/30 relative overflow-hidden section-pb">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Hero Image Section */}
          <div className="relative w-full overflow-hidden rounded-2xl shadow-xl hero-wrap">
            <HeroSection
              page="about"
              title="About EzyLoan"
              subtitle="Your trusted loan partner for all loan needs"
            />
          </div>

          {/* ✅ MANDATORY ABOUT CONTENT - Channel Partner Disclosure */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-xl section-mb card-pad">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
                  <Info className="w-4 h-4 text-blue-700" />
                  <span className="text-sm font-medium text-blue-700">Who We Are</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    About EzyLoan
                  </span>{' '}
                  <span className="text-gray-800">– Loan Facilitator in Cuttack, Odisha</span>
                </h1>
                <p className="text-gray-700 leading-relaxed text-lg mb-6">
                  EzyLoan is a loan service provider that helps customers secure loans from Banks and NBFCs. 
                  <span className="font-semibold text-blue-700"> We act as a channel partner and do not lend directly.</span>
                </p>
                
                <div className="mb-6">
                  <h2 className="text-base font-bold text-gray-800 mb-3">We specialize in:</h2>
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
                    className="relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold px-6 py-3 rounded-lg transition-all duration-500 group/btn cursor-pointer shadow-[0_4px_20px_rgba(32,100,200,0.25)] hover:shadow-[0_8px_30px_rgba(32,100,200,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=fast-approval")}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#2064c8]/90 via-[#3577d3]/85 to-[#5a91de]/90 backdrop-blur-md" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(53, 119, 211,0.25)' }} />
                    <span className="absolute -inset-px rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'borderGlow 3s infinite linear', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px' }} />
                    <span className="relative z-10 flex items-center gap-2 text-white">
                      ✓ Fast Approval
                    </span>
                  </button>
                  <button 
                    className="relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold px-6 py-3 rounded-lg transition-all duration-500 group/btn cursor-pointer shadow-[0_4px_20px_rgba(90,145,222,0.25)] hover:shadow-[0_8px_30px_rgba(90,145,222,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                    onClick={(e) => handleRedirect(e, "/apply-now?loan=transparent-process")}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-[#5a91de]/90 via-[#3577d3]/85 to-[#2064c8]/90 backdrop-blur-md" />
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(90, 145, 222,0.25)' }} />
                    <span className="absolute -inset-px rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)', animation: 'borderGlow 3s infinite linear', mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor', WebkitMaskComposite: 'xor', padding: '1px' }} />
                    <span className="relative z-10 flex items-center gap-2 text-white">
                      ✓ Transparent Process
                    </span>
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl blur opacity-20"></div>
                <img
                  src="/pic/mision.webp"
                  alt="Car Finance"
                  className="relative w-full aspect-[3/2] lg:aspect-auto lg:h-96 object-cover rounded-2xl shadow-2xl"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 section-mb">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>

          {/* ✅ FIXED: Banking Partners Section - Works on Mobile & Desktop */}
          <BankingPartnersCarousel bankingPartners={bankingPartners} />

          {/* What We Specialize In */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 backdrop-blur-xl rounded-3xl border border-blue-100/50 shadow-xl section-mb card-pad">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
                  <span className="text-sm font-medium text-blue-600">Our Services</span>
                </div>
                <h3 className="text-4xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">
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
                      className="relative w-full text-left bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group/btn overflow-hidden cursor-pointer"
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
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
                  <span className="text-sm font-medium text-blue-800">Why Choose Us</span>
                </div>
                <h4 className="text-3xl font-bold mb-8">
                  <span className="bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent">
                    WHY CHOOSE US?
                  </span>
                </h4>
                <div className="space-y-6">
                  {[
                    { icon: '💡', title: 'Expertise', desc: 'We are committed to delivering exceptional service with years of experience. No challenge is too big or too small for our expert team.' },
                    { icon: '⭐', title: 'Quality', desc: 'Providing best-in-class service and value for automotive dealers and customers with flexible, competitive rates tailored to your needs.' },
                    { icon: '🤝', title: 'Customer Service', desc: 'Customer-first approach with experienced professionals offering flexible and competitive rates tailored to your specific requirements.' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
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
          <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 backdrop-blur-xl rounded-3xl border border-green-100/50 shadow-xl section-mb card-pad">
            <div className="text-center section-head">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-blue-100 px-4 py-2 rounded-full backdrop-blur-sm border border-green-200/50 mb-6">
                <span className="text-sm font-medium text-green-700">Customer Reviews</span>
              </div>
              <h3 className="text-4xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
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
                          <img src={testimonial.avatar} alt={testimonial.name} referrerPolicy="no-referrer" width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-white/60 bg-blue-100" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff`; }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />))}
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
                    <span className={`h-2.5 rounded-full transition-all duration-300 ${currentTestimonialMobile === index ? 'bg-gradient-to-r from-blue-600 to-blue-400 w-6' : 'w-2.5 bg-gray-300/60 backdrop-blur-sm'}`} />
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
                          <img src={testimonial.avatar} alt={testimonial.name} referrerPolicy="no-referrer" width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-white/60 bg-blue-100" onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff`; }} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`} />))}
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
                    <span className={`h-2.5 rounded-full transition-all duration-300 ${currentTestimonialDesktop === index ? 'bg-gradient-to-r from-blue-600 to-blue-400 w-6' : 'w-2.5 bg-gray-300/60 backdrop-blur-sm'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Automotive News */}
          <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 backdrop-blur-xl rounded-3xl border border-orange-100/50 shadow-xl section-mb card-pad">
            <div className="text-center section-head">
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
                { img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', tag: '🔋 EV News', title: 'Electric Vehicle Market Growth', desc: 'Latest trends in electric vehicle adoption and financing options for sustainable transportation...' },
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
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl card-pad">
            <div className="text-center section-head">
              <h3 className="text-3xl lg:text-4xl font-bold mb-4">
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
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
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rates, fees & disclosures (Google Ads / Meta compliance) */}
          <LoanDisclosure loanDetails={loanDetails} emiExample={emiExample} eligibility={eligibility} contained={false} className="mt-10 section-mb" />



          {/* ✅ WORKING CONTACT SECTION - Glass Cards with Clickable Links */}
          <div className="mt-10">
            <div>
              <div className="relative bg-white/40 backdrop-blur-2xl rounded-3xl p-8 border border-white/60 shadow-[0_8px_32px_0_rgba(24,69,134,0.1)] overflow-hidden section-mb">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-blue-50/40 pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2">
                      <span className="bg-gradient-to-r from-[#2064c8] to-[#5a91de] bg-clip-text text-transparent">Get In Touch With Us</span>
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Phone - Clickable */}
                    <a href="tel:+916372977626" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2064c8]/90 to-[#5a91de]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(32,100,200,0.25)] group-hover:shadow-[0_6px_20px_rgba(32,100,200,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Call Us</h4>
                        <p className="text-[#2064c8] font-medium hover:underline">+91 63729 77626</p>
                        <p className="text-[#2064c8] font-medium hover:underline">+91 96924 29674</p>
                        <p className="text-sm text-slate-500/80">Mon-Sat: 9AM to 7PM</p>
                      </div>
                    </a>
                    {/* Email - Clickable */}
                    <a href="mailto:contact@ezyloan.co.in" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2064c8]/90 to-[#5a91de]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(32,100,200,0.25)] group-hover:shadow-[0_6px_20px_rgba(32,100,200,0.35)] transition-all duration-300 group-hover:scale-110">
                        <Mail className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Email Us</h4>
                        <p className="text-[#2064c8] font-medium hover:underline">contact@ezyloan.co.in</p>
                        <p className="text-sm text-slate-500/80">Quick response guaranteed</p>
                      </div>
                    </a>
                    {/* Location - Clickable Google Maps */}
                    <a href="https://www.google.com/maps/search/?api=1&query=1st+Floor+Hindustan+Tyres+Building+Pir+Bazar+Bhanpur+Cuttack+Odisha+753011" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 group cursor-pointer">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#2064c8]/90 to-[#5a91de]/90 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(32,100,200,0.25)] group-hover:shadow-[0_6px_20px_rgba(32,100,200,0.35)] transition-all duration-300 group-hover:scale-110">
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Visit Us</h4>
                        <p className="text-[#2064c8] font-medium text-sm hover:underline">1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
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