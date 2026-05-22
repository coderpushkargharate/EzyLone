"use client";
import { Phone, MessageCircle } from "lucide-react";
import Link from "next/link";

const FixedFooter = () => {
  const phoneNumber = "+916372977626";
  const whatsappNumber = "+916372977626";
  const whatsappMessage = "Hi, I'm interested in getting a loan";

  return (
    <>
      {/* ========== MOBILE ONLY FOOTER ========== */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] 
            "
        role="navigation"
        aria-label="Mobile action buttons"
      >
        <div className="flex items-center justify-between gap-2 p-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">
          
          {/* 📞 Call Now Button - Blue with Apple Liquid Glass */}
          <a
            href={`tel:${phoneNumber}`}
            className="group relative flex items-center justify-center gap-1.5 
                       bg-blue-600/85 hover:bg-blue-600/90 active:bg-blue-700
                       text-white px-3 py-2.5 rounded-2xl 
                       text-sm font-semibold 
                       backdrop-blur-xl
                       border border-white/30 hover:border-white/50
                       shadow-[0_4px_12px_-2px_rgba(37,99,235,0.4)] 
                       hover:shadow-[0_8px_24px_-4px_rgba(37,99,235,0.6)]
                       transition-all duration-300 ease-out
                       hover:-translate-y-0.5 active:scale-95 active:translate-y-0
                       focus:outline-none focus:ring-2 focus:ring-blue-400/60 focus:ring-offset-1 focus:ring-offset-transparent
                       overflow-hidden flex-1"
            aria-label="Call us now"
          >
            {/* Liquid glass highlight overlay */}
            <span className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {/* Subtle animated shine */}
            <span className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-shine pointer-events-none" />
            
            <Phone className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
            <span className="whitespace-nowrap transition-transform duration-300">Call Now</span>
          </a>

          {/* 💬 WhatsApp Button - Green with Apple Liquid Glass */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-1.5 
                       bg-green-500/85 hover:bg-green-500/90 active:bg-green-600
                       text-white px-3 py-2.5 rounded-2xl 
                       text-sm font-semibold 
                       backdrop-blur-xl
                       border border-white/30 hover:border-white/50
                       shadow-[0_4px_12px_-2px_rgba(34,197,94,0.4)] 
                       hover:shadow-[0_8px_24px_-4px_rgba(34,197,94,0.6)]
                       transition-all duration-300 ease-out
                       hover:-translate-y-0.5 active:scale-95 active:translate-y-0
                       focus:outline-none focus:ring-2 focus:ring-green-400/60 focus:ring-offset-1 focus:ring-offset-transparent
                       overflow-hidden flex-1"
            aria-label="Chat on WhatsApp"
          >
            {/* Liquid glass highlight overlay */}
            <span className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {/* Subtle animated shine */}
            <span className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:animate-shine pointer-events-none" />
            
            <MessageCircle className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
            <span className="whitespace-nowrap transition-transform duration-300">WhatsApp</span>
          </a>

          {/* 🚀 Apply Now Button - Orange with Apple Liquid Glass */}
          <Link
            href="/apply-now"
            className="group relative flex items-center justify-center 
                       bg-gradient-to-r from-orange-500/85 to-orange-600/85 
                       hover:from-orange-500/90 hover:to-orange-600/90 active:from-orange-600 active:to-orange-700
                       text-white px-4 py-2.5 rounded-2xl 
                       text-sm font-semibold 
                       backdrop-blur-xl
                       border border-white/30 hover:border-white/50
                       shadow-[0_4px_12px_-2px_rgba(249,115,22,0.4)] 
                       hover:shadow-[0_8px_24px_-4px_rgba(249,115,22,0.6)]
                       transition-all duration-300 ease-out
                       hover:-translate-y-0.5 active:scale-95 active:translate-y-0
                       focus:outline-none focus:ring-2 focus:ring-orange-400/60 focus:ring-offset-1 focus:ring-offset-transparent
                       overflow-hidden flex-1"
            aria-label="Apply for a loan now"
          >
            {/* Liquid glass highlight overlay */}
            <span className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            {/* Subtle animated shine */}
            <span className="absolute -inset-full top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-shine pointer-events-none" />
            
            <span className="whitespace-nowrap transition-transform duration-300">Apply Now</span>
          </Link>
        </div>
      </div>

      {/* ========== SPACER ========== */}
      <div className="md:hidden h-20 flex-shrink-0" aria-hidden="true"></div>
    </>
  );
};

export default FixedFooter;