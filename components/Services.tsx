"use client";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import {
  Car, ArrowRight, Building2, User, Phone, Mail, MapPin, Percent, Clock, Shield,
} from "lucide-react";

const Services = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);

  const services = useMemo(() => [
    {
      icon: Car, title: "Used Car BT", description: "Save more with our Used Car Balance Transfer, offering lower EMIs and better rates.",
      image: "/homebanners/2aaab97b-68e4-48f1-b5cb-4c8593864d29.webp", link: "/car-loan-balance-transfer", applyLink: "/apply-now?loan=used-car-bt",
      highlights: ["Lower EMIs", "Better Rates", "Quick Processing"],
    },
    {
      icon: Car, title: "Used Car Refinance", description: "Refinance your used car loan with us and enjoy better rates and flexible terms.",
      image: "/homebanners/00aa3850-ba76-4749-9c73-7f4edc3ce7cf.webp", link: "/car-loan-refinance", applyLink: "/apply-now?loan=used-car-refinance",
      highlights: ["Better Rates", "Flexible Terms", "Top-up Available"],
    },
    {
      icon: Car, title: "New Car Loan", description: "Drive your dream car today with our competitive rates and flexible repayment options available.",
      image: "/homebanners/usedcarrefrance.webp", link: "/car-loan", applyLink: "/apply-now?loan=new-car-loan",
      highlights: ["Up to 100% Funding", "Quick Approval", "Low Rates"],
    },
    {
      icon: Building2, title: "Commercial Vehicle Loan", description: "Get behind the wheel of your dream vehicle with our easy and quick loan approval process.",
      image: "/homebanners/618797752_122285828318199270_8453964291894126689_n.webp", link: "/commercial-vehicle-loan", applyLink: "/apply-now?loan=commercial-vehicle-loan",
      highlights: ["High Loan Amount", "Flexible Tenure", "Tax Benefits"],
    },
    {
      icon: User, title: "Personal Loan", description: "Fulfill your dreams with our hassle-free Personal Loan, designed to meet your needs.",
      image: "/homebanners/image.webp", link: "/personal-loan", applyLink: "/apply-now?loan=personal-loan",
      highlights: ["Up to ₹25 Lakh", "Low Interest Rates", "Minimal Docs"],
    },
    {
      icon: Building2, title: "Property Loan", description: "Expand your business with our tailored Property Loan, designed for growth.",
      image: "/homebanners/634044681_122289263786199270_3408391623228588228_n.webp", link: "/property-loan", applyLink: "/apply-now?loan=property-loan",
      highlights: ["Up to ₹3 Crore", "Lowest EMIs", "Long Tenure"],
    },
  ], []);

  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;
    const checkDesktop = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => setIsDesktop(window.innerWidth >= 1024), 150);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop, { passive: true });
    return () => { clearTimeout(resizeTimeout); window.removeEventListener("resize", checkDesktop); };
  }, []);

  const cardsPerView = 4;
  const cardWidthPercent = 100 / cardsPerView;
  const maxIndex = services.length - cardsPerView;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index <= maxIndex) setCurrentIndex(index);
  }, [maxIndex]);

  useEffect(() => {
    if (!isDesktop || isPaused) return;
    const interval = setInterval(nextSlide, 1300);
    return () => clearInterval(interval);
  }, [isDesktop, isPaused, nextSlide]);

  useEffect(() => {
    if (isDesktop) setCurrentIndex(0);
  }, [isDesktop]);

  // ✅ FIX: Use router.push for internal navigation instead of window.location.href
  // to prevent full page reload which would also cause scroll state issues
  const handleApplyClick = useCallback((e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = url;
  }, []);

  return (
    <section
      id="services"
      className="py-10 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/50 relative overflow-hidden touch-pan-y"
      aria-labelledby="services-heading"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      ref={carouselRef}
      style={{ contentVisibility: "auto" }}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-none lg:blur-2xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-none lg:blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-300/5 to-cyan-300/5 rounded-full blur-none lg:blur-2xl" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cyan-50/30 to-transparent lg:hidden" />
      </div>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 id="services-heading" className="text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#2563eb] via-blue-600 to-[#06b6d4] bg-clip-text text-transparent">
              Instant Loan Options for Every Need
            </span>
          </h2>
          <p className="text-xl text-slate-600/80 max-w-3xl mx-auto">
            Choose the best loan for your needs and get instant approval
          </p>
        </div>

        {/* Desktop Carousel */}
        <div className="hidden lg:block relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out will-change-transform"
              style={{ transform: `translateX(-${currentIndex * cardWidthPercent}%)` }}
            >
              {[...services, ...services.slice(0, cardsPerView)].map((service, index) => (
                <div
                  key={`${service.title}-${index}`}
                  className="flex-shrink-0 w-1/4 px-3"
                  style={{ contain: "layout style paint" }}
                >
                  <Link href={service.link} className="block group">
                    <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/50 hover:border-[#2563eb]/50 transition-all duration-300 flex flex-col h-full cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1">
                      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-50/80 to-gray-100/80">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f5f5f5/666?text=${encodeURIComponent(service.title)}`; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-slate-800 mb-3 text-center group-hover:text-[#2563eb] transition-colors duration-300">
                          {service.title}
                        </h3>
                        <div className="space-y-1.5 mb-5">
                          {service.highlights?.map((highlight, i) => (
                            <p key={i} className="text-sm text-slate-600/80 text-center font-medium">{highlight}</p>
                          ))}
                        </div>
                        <div className="mt-auto">
                          <button
                            className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white touch-manipulation"
                            onClick={(e) => handleApplyClick(e, service.applyLink)}
                            aria-label={`Get offers for ${service.title}`}
                          >
                            Get Offers <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
          {/* Dots */}
          <div className="flex justify-center gap-3 mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? "w-10 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] shadow-md" : "w-2.5 bg-slate-300/60 hover:bg-slate-400/60"}`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentIndex === index ? "true" : "false"}
              />
            ))}
          </div>
        </div>

        {/* Mobile/Tablet Grid */}
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <Link key={index} href={service.link} className="block group">
              <div className="relative bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/60 hover:border-[#2563eb]/50 transition-all duration-300 flex flex-col cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-53 overflow-hidden bg-gradient-to-br from-gray-50/60 to-gray-100/60">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x300/f5f5f5/666?text=${encodeURIComponent(service.title)}`; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-slate-800 mb-3 text-center group-hover:text-[#2563eb] transition-colors">
                    {service.title}
                  </h3>
                  <div className="space-y-1.5 mb-5">
                    {service.highlights?.map((highlight, i) => (
                      <p key={i} className="text-sm text-slate-600/80 text-center font-medium">{highlight}</p>
                    ))}
                  </div>
                  <div className="mt-auto">
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white touch-manipulation"
                      onClick={(e) => handleApplyClick(e, service.applyLink)}
                      aria-label={`Get offers for ${service.title}`}
                    >
                      Get Offers <ArrowRight className="w-4 h-4 transition-transform duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 border border-white/70 shadow-md mb-10 overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">
                  Get In Touch With Us
                </span>
              </h3>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <a href="tel:+916372977626" className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Call Us</h4>
                  <p className="text-[#2563eb] font-medium hover:underline">+91 6372977626</p>
                  <p className="text-sm text-slate-500/80">Mon-Sat: 9AM to 7PM</p>
                </div>
              </a>
              <a href="mailto:contact@ezyloan.co.in" className="flex items-center space-x-4 group cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Email Us</h4>
                  <p className="text-[#2563eb] font-medium hover:underline">contact@ezyloan.co.in</p>
                  <p className="text-sm text-slate-500/80">Quick response guaranteed</p>
                </div>
              </a>
              <a
                href="https://www.google.com/maps/search/?api=1&query=1st+Floor+Hindustan+Tyres+Building+Pir+Bazar+Bhanpur+Cuttack+Odisha+753011"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 group cursor-pointer"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Visit Us</h4>
                  <p className="text-[#2563eb] font-medium text-sm hover:underline">
                    1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011
                  </p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/70 shadow-md overflow-hidden">
          <div className="relative z-10">
            <div className="text-center mb-10">
              <h3 className="text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-[#2563eb] via-blue-600 to-[#06b6d4] bg-clip-text text-transparent">
                  Why Choose EzyLoan?
                </span>
              </h3>
              <p className="text-slate-600/80 max-w-2xl mx-auto text-lg">
                We make borrowing simple, transparent, and hassle-free with our customer-first approach.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Percent,
                  title: "Competitive Rates",
                  desc: "Industry-leading interest rates starting from 8.99% with transparent pricing.",
                },
                {
                  icon: Clock,
                  title: "Quick Processing",
                  desc: "Get approved in as little as 24 hours with our streamlined digital process.",
                },
                {
                  icon: Shield,
                  title: "Secure & Trusted",
                  desc: "Bank-grade security and trusted by over 100,000 satisfied customers.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="text-center group p-6 rounded-2xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-white/50">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md group-hover:shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2">{title}</h4>
                  <p className="text-slate-600/80">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @media (max-width: 1023px) {
          .animate-shimmer { animation: none !important; }
          .backdrop-blur-sm, .backdrop-blur-md { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
          .shadow-lg, .shadow-xl, .shadow-2xl { box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important; }
          .hover\\:-translate-y-1, .hover\\:scale-110, .group-hover\\:scale-110 { transform: none !important; transition: none !important; }
          html { scroll-behavior: auto !important; }
        }
      `}</style>
    </section>
  );
};

export default memo(Services);