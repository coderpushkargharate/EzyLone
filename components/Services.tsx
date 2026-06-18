"use client";

// Services.tsx — EzyLoan PERFORMANCE OPTIMIZED v2
//
// LIGHTHOUSE FIXES:
// ✅ [LCP/Images] All 6 service card images had proper sizes attribute added.
// ✅ [TBT]  Removed backdrop-blur on mobile cards entirely.
// ✅ [TBT]  Removed hover transforms on mobile (forced reflow).
// ✅ [Perf] Carousel uses CSS transform only (GPU composited).
// ✅ [CLS]  Card images have explicit aspect-ratio container.

import Link from "next/link";
import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { Car, ArrowRight, Building2, User, Phone, Mail, MapPin, Percent, Clock, Shield } from "lucide-react";
import Image from "next/image";

const Services = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Admin-uploaded images (Banner page="loan-options") override the default card
  // images in order: 1st uploaded → 1st card, 2nd → 2nd card, etc. Cards with no
  // matching upload keep their built-in image.
  const [optionImages, setOptionImages] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    fetch("/api/banners?page=loan-options")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!mounted) return;
        const imgs = (data || [])
          .filter((b: any) => b.isActive && b.image?.trim())
          .map((b: any) => b.image as string);
        setOptionImages(imgs);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const services = useMemo(() => {
    const base = [
      { icon: Car, title: "Used Car BT", description: "Save more with our Used Car Balance Transfer, offering lower EMIs and better rates.", image: "/homebanners/2aaab97b-68e4-48f1-b5cb-4c8593864d29.webp", link: "/car-loan-balance-transfer", applyLink: "/apply-now?loan=used-car-bt", highlights: ["Lower EMIs", "Better Rates", "Quick Processing"] },
      { icon: Car, title: "Used Car Refinance", description: "Refinance your used car loan with us and enjoy better rates and flexible terms.", image: "/homebanners/00aa3850-ba76-4749-9c73-7f4edc3ce7cf.webp", link: "/car-loan-refinance", applyLink: "/apply-now?loan=used-car-refinance", highlights: ["Better Rates", "Flexible Terms", "Top-up Available"] },
      { icon: Car, title: "New Car Loan", description: "Drive your dream car today with our competitive rates and flexible repayment options.", image: "/homebanners/usedcarrefrance.webp", link: "/car-loan", applyLink: "/apply-now?loan=new-car-loan", highlights: ["Up to 100% Funding", "Quick Approval", "Low Rates"] },
      { icon: Building2, title: "Commercial Vehicle Loan", description: "Get behind the wheel of your dream vehicle with our easy and quick loan approval process.", image: "/homebanners/618797752_122285828318199270_8453964291894126689_n.webp", link: "/commercial-vehicle-loan", applyLink: "/apply-now?loan=commercial-vehicle-loan", highlights: ["High Loan Amount", "Flexible Tenure", "Tax Benefits"] },
      { icon: User, title: "Personal Loan", description: "Fulfill your dreams with our hassle-free Personal Loan, designed to meet your needs.", image: "/homebanners/image.webp", link: "/personal-loan", applyLink: "/apply-now?loan=personal-loan", highlights: ["Up to ₹25 Lakh", "Low Interest Rates", "Minimal Docs"] },
      { icon: Building2, title: "Property Loan", description: "Expand your business with our tailored Property Loan, designed for growth.", image: "/homebanners/634044681_122289263786199270_3408391623228588228_n.webp", link: "/property-loan", applyLink: "/apply-now?loan=property-loan", highlights: ["Up to ₹3 Crore", "Lowest EMIs", "Long Tenure"] },
    ];
    return base.map((s, i) => (optionImages[i] ? { ...s, image: optionImages[i] } : s));
  }, [optionImages]);

  const cardsPerView = 4;
  const maxIndex = services.length - cardsPerView;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => { setIsDesktop(e.matches); if (!e.matches) setCurrentIndex(0); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const nextSlide = useCallback(() => { setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1)); }, [maxIndex]);
  const goToSlide = useCallback((index: number) => { if (index >= 0 && index <= maxIndex) setCurrentIndex(index); }, [maxIndex]);

  useEffect(() => {
    if (!isDesktop || isPaused) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(nextSlide, 1500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isDesktop, isPaused, nextSlide]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      else if (!document.hidden && isDesktop && !isPaused) intervalRef.current = setInterval(nextSlide, 1500);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [isDesktop, isPaused, nextSlide]);

  const handleApplyClick = useCallback((e: React.MouseEvent, url: string) => { e.preventDefault(); e.stopPropagation(); window.location.href = url; }, []);

  return (
    <section id="services" className="py-10 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/50 relative overflow-hidden" aria-labelledby="services-heading" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none hidden lg:block" aria-hidden="true"><div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full" /><div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-400/10 rounded-full" /></div>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10"><h2 id="services-heading" className="text-3xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-[#2563eb] via-blue-600 to-[#06b6d4] bg-clip-text text-transparent">Instant Loan Options for Every Need</h2><p className="text-lg text-slate-600/80 max-w-3xl mx-auto">Choose the best loan for your needs and get instant approval</p></div>
        <div className="hidden lg:block relative">
          <div className="overflow-hidden"><div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`, willChange: "transform" }}>{[...services, ...services.slice(0, cardsPerView)].map((service, index) => (<div key={`${service.title}-${index}`} className="flex-shrink-0 w-1/4 px-3" style={{ contain: "layout style paint" }}><Link href={service.link} className="block group"><div className="glass-prism relative bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col h-full cursor-pointer"><div className="relative overflow-hidden bg-gradient-to-br from-gray-50/80 to-gray-100/80" style={{ aspectRatio: "16/9" }}><Image src={service.image} alt={service.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" sizes="(max-width: 1280px) 25vw, 300px" loading="lazy" quality={70} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x225/f5f5f5/666?text=${encodeURIComponent(service.title)}`; }} /><div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" /></div><div className="p-5 flex flex-col flex-grow"><h3 className="text-lg font-bold text-slate-800 mb-3 text-center group-hover:text-[#2563eb] transition-colors duration-300">{service.title}</h3><div className="space-y-1.5 mb-5">{service.highlights.map((highlight, i) => (<p key={i} className="text-sm text-slate-600/80 text-center font-medium">{highlight}</p>))}</div><div className="mt-auto"><button className="glass-prism-btn w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-3 px-4 rounded-xl transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg active:translate-y-0 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white touch-manipulation" onClick={(e) => handleApplyClick(e, service.applyLink)} aria-label={`Get offers for ${service.title}`}>Get Offers <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" /></button></div></div></div></Link></div>))}</div></div>
          <div className="flex justify-center gap-3 mt-8">{Array.from({ length: maxIndex + 1 }).map((_, index) => (<button key={index} onClick={() => goToSlide(index)} className={`h-2.5 rounded-full transition-all duration-300 ${currentIndex === index ? "w-10 bg-gradient-to-r from-[#2563eb] to-[#06b6d4] shadow-md" : "w-2.5 bg-slate-300/60 hover:bg-slate-400/60"}`} aria-label={`Go to slide ${index + 1}`} aria-current={currentIndex === index ? "true" : "false"} />))}</div>
        </div>
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">{services.map((service, index) => (<Link key={index} href={service.link} className="block"><div className="glass-prism relative bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer"><div className="relative overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}><Image src={service.image} alt={service.title} fill className="object-cover" sizes="(max-width: 640px) calc(100vw - 32px), calc(50vw - 24px)" loading="lazy" quality={65} onError={(e) => { (e.target as HTMLImageElement).src = `https://placehold.co/400x225/f5f5f5/666?text=${encodeURIComponent(service.title)}`; }} /></div><div className="p-4 flex flex-col flex-grow"><h3 className="text-base font-bold text-slate-800 mb-2 text-center">{service.title}</h3><div className="space-y-1 mb-4">{service.highlights.map((highlight, i) => (<p key={i} className="text-xs text-slate-600 text-center">{highlight}</p>))}</div><button className="glass-prism-btn w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white touch-manipulation active:scale-95 transition-transform duration-100 min-h-[44px]" onClick={(e) => handleApplyClick(e, service.applyLink)} aria-label={`Get offers for ${service.title}`}>Get Offers <ArrowRight className="w-4 h-4" /></button></div></div></Link>))}</div>
      </div>
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="relative bg-white lg:bg-white/50 lg:backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-gray-200 lg:border-white/70 shadow-md mb-10 overflow-hidden"><div className="relative z-10"><div className="text-center mb-6 lg:mb-8"><h3 className="text-xl lg:text-2xl font-bold"><span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Get In Touch With Us</span></h3></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"><a href="tel:+916372977626" className="flex items-center space-x-3 group"><div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"><Phone className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div><div><h4 className="font-semibold text-slate-800 text-sm lg:text-base">Call Us</h4><p className="text-[#2563eb] font-medium text-xs lg:text-sm">+91 6372977626</p><p className="text-xs text-slate-500">Mon-Sat: 9AM to 7PM</p></div></a><a href="mailto:contact@ezyloan.co.in" className="flex items-center space-x-3 group"><div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"><Mail className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div><div><h4 className="font-semibold text-slate-800 text-sm lg:text-base">Email Us</h4><p className="text-[#2563eb] font-medium text-xs lg:text-sm">contact@ezyloan.co.in</p><p className="text-xs text-slate-500">Quick response</p></div></a><a href="https://www.google.com/maps/search/?api=1&query=1st+Floor+Hindustan+Tyres+Building+Pir+Bazar+Bhanpur+Cuttack+Odisha+753011" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 group"><div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"><MapPin className="w-5 h-5 lg:w-6 lg:h-6 text-white" /></div><div><h4 className="font-semibold text-slate-800 text-sm lg:text-base">Visit Us</h4><p className="text-[#2563eb] font-medium text-xs lg:text-sm line-clamp-2">1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack - 753011</p></div></a></div></div></div>
        <div className="relative bg-white lg:bg-white/50 lg:backdrop-blur-sm rounded-3xl p-6 lg:p-10 border border-gray-200 lg:border-white/70 shadow-md overflow-hidden"><div className="relative z-10"><div className="text-center mb-8 lg:mb-10"><h3 className="text-2xl lg:text-3xl font-bold mb-2"><span className="bg-gradient-to-r from-[#2563eb] via-blue-600 to-[#06b6d4] bg-clip-text text-transparent">Why Choose EzyLoan?</span></h3><p className="text-slate-600 max-w-2xl mx-auto text-base lg:text-lg">We make borrowing simple, transparent, and hassle-free.</p></div><div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">{[{ icon: Percent, title: "Competitive Rates", desc: "Industry-leading interest rates starting from 8.99% with transparent pricing." }, { icon: Clock, title: "Quick Processing", desc: "Get approved in as little as 24 hours with our streamlined digital process." }, { icon: Shield, title: "Secure & Trusted", desc: "Bank-grade security and trusted by over 100,000 satisfied customers." }].map(({ icon: Icon, title, desc }) => (<div key={title} className="text-center p-4 lg:p-6 rounded-2xl bg-white/50 lg:bg-transparent"><div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#2563eb] to-[#06b6d4] rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-5 shadow-md"><Icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" /></div><h4 className="text-base lg:text-xl font-bold text-slate-800 mb-1 lg:mb-2">{title}</h4><p className="text-xs lg:text-sm text-slate-600">{desc}</p></div>))}</div></div></div>
      </div>
    </section>
  );
};

export default memo(Services);