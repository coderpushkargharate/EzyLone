"use client";
import { Phone } from "lucide-react";
import Link from "next/link";
import {
  CALL_NUMBER,
  WA_NUMBER,
  WA_ALT_NUMBER,
  WA_DISPLAY,
  WA_ALT_DISPLAY,
  waLink,
} from "@/lib/contact";

// Small inline WhatsApp glyph so both WhatsApp buttons share one crisp icon.
const WaIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M17.5 14.4c-.3-.15-1.7-.84-2-.94-.26-.1-.46-.15-.65.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.04-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.08-.15-.65-1.57-.9-2.15-.24-.56-.48-.48-.65-.49h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.42 0 1.43 1.04 2.8 1.19 3 .15.2 2.05 3.13 4.97 4.39.69.3 1.24.48 1.66.61.7.22 1.33.19 1.83.12.56-.08 1.7-.7 1.95-1.36.24-.66.24-1.23.17-1.36-.07-.12-.27-.19-.56-.34zM12.05 21.5h-.02a9.4 9.4 0 01-4.8-1.32l-.34-.2-3.57.94.95-3.48-.22-.36a9.42 9.42 0 01-1.44-5.01c0-5.2 4.24-9.44 9.46-9.44 2.52 0 4.9.99 6.68 2.77a9.38 9.38 0 012.76 6.68c0 5.2-4.24 9.44-9.46 9.44zM20.3 3.7A11.32 11.32 0 0012.05.28C5.8.28.72 5.36.72 11.6c0 2 .52 3.95 1.52 5.67L.62 23.28l6.16-1.62a11.33 11.33 0 005.27 1.34h.01c6.24 0 11.32-5.08 11.33-11.32a11.26 11.26 0 00-3.09-7.98z" />
  </svg>
);

const FixedFooter = () => {
  return (
    <>
      {/* ========== MOBILE ONLY FOOTER ========== */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[9999]"
        role="navigation"
        aria-label="Mobile action buttons"
      >
        <div className="flex items-stretch justify-between gap-1.5 p-2.5 pb-[calc(env(safe-area-inset-bottom)+0.5rem)]">

          {/* 📞 Call */}
          <a
            href={`tel:${CALL_NUMBER}`}
            className="flex flex-col items-center justify-center gap-0.5
                       bg-blue-600/90 active:bg-blue-700 text-white
                       px-2 py-2 rounded-2xl backdrop-blur-xl
                       border border-white/30 shadow-md flex-1
                       active:scale-95 transition"
            aria-label="Call us"
          >
            <Phone className="w-4 h-4" />
            <span className="text-[11px] font-semibold leading-tight">Call</span>
          </a>

          {/* 💬 WhatsApp #1 — primary WhatsApp business number */}
          <a
            href={waLink(WA_NUMBER)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5
                       bg-green-500/90 active:bg-green-600 text-white
                       px-2 py-2 rounded-2xl backdrop-blur-xl
                       border border-white/30 shadow-md flex-1
                       active:scale-95 transition"
            aria-label={`Chat on WhatsApp ${WA_DISPLAY}`}
          >
            <WaIcon className="w-4 h-4" />
            <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">WhatsApp&nbsp;1</span>
          </a>

          {/* 💬 WhatsApp #2 — the call number, also on WhatsApp */}
          <a
            href={waLink(WA_ALT_NUMBER)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-0.5
                       bg-green-600/90 active:bg-green-700 text-white
                       px-2 py-2 rounded-2xl backdrop-blur-xl
                       border border-white/30 shadow-md flex-1
                       active:scale-95 transition"
            aria-label={`Chat on WhatsApp ${WA_ALT_DISPLAY}`}
          >
            <WaIcon className="w-4 h-4" />
            <span className="text-[10px] font-semibold leading-tight whitespace-nowrap">WhatsApp&nbsp;2</span>
          </a>

          {/* 🚀 Apply Now */}
          <Link
            href="/apply-now"
            className="flex flex-col items-center justify-center gap-0.5
                       bg-gradient-to-r from-orange-500/90 to-orange-600/90 active:from-orange-600 active:to-orange-700
                       text-white px-2 py-2 rounded-2xl backdrop-blur-xl
                       border border-white/30 shadow-md flex-1
                       active:scale-95 transition"
            aria-label="Apply for a loan now"
          >
            <span className="text-[11px] font-semibold leading-tight">Apply</span>
          </Link>
        </div>
      </div>

      {/* ========== SPACER ========== */}
      <div className="md:hidden h-20 flex-shrink-0" aria-hidden="true"></div>
    </>
  );
};

export default FixedFooter;
