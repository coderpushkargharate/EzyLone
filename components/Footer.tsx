"use client";

// Footer.tsx — EzyLoan Performance-Optimized
//
// FIXES APPLIED:
// ✅ [CLS] Removed content-visibility:auto on footer — it causes layout recalculation
//    when the element enters the viewport, shifting content above it (CLS 0.776 culprit)
// ✅ [TBT] footer-pulse animation disabled on mobile (was running on main thread)
// ✅ [TBT] blur-3xl removed on mobile — no backdrop-filter at all
// ✅ [CLS] Explicit minHeight:'600px' on footer element preserved to reserve space
// ✅ [Paint] Reduced background decoration complexity on mobile
// ✅ [Memory] Logo loaded lazy at 28px quality:60 — correct, preserved
// ✅ [DOM] No duplicate GTM script — correct, preserved

import {
  Phone, Mail, MapPin, Facebook, Instagram, ArrowRight,
  Info, ShieldCheck, Lock, BadgeCheck,
} from "lucide-react";
import Link from "next/link";
import { useMemo, memo } from "react";
import Image from "next/image";

const Footer = memo(() => {
  const currentYear = new Date().getFullYear();

  const footerLinks = useMemo(() => ({
    products: [
      { name: "Personal Loan", href: "/personal-loan" },
      { name: "New Car Loan", href: "/car-loan" },
      { name: "Property Loan", href: "/property-loan" },
      { name: "Commercial Vehicle Loan", href: "/commercial-vehicle-loan" },
      { name: "Car Loan Refinance", href: "/car-loan-refinance" },
      { name: "Car Loan TopUp", href: "/car-loan-topup" },
      { name: "Car Loan Balance Transfer", href: "/car-loan-balance-transfer" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Blogs", href: "/blogs" },
      { name: "Admin", href: "/admin" },
    ],
    resources: [
      { name: "EMI Calculator", href: "/emi-calculator" },
      { name: "FAQs", href: "/faq" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Loan Disclosure", href: "/loan-disclosure" },
      { name: "Terms & Conditions", href: "/terms-and-conditions" },
      { name: "Compliance", href: "/compliance" },
      { name: "Lending Partners", href: "/lending-partners" },
    ],
  }), []);

  const socialLinks = useMemo(() => [
    { icon: Facebook, href: "https://www.facebook.com/people/Ezy-Loan/61555978110163/", label: "Facebook" },
    { icon: Instagram, href: "https://www.instagram.com/ezyloanofficials/", label: "Instagram" },
  ], []);

  return (
    <>
      <style jsx global>{`
        /* ============================================================
           FOOTER ANIMATIONS
           ✅ FIX: Pulse/glow animations ONLY on desktop
           On mobile these run on the main thread and hurt TBT + CLS
           ============================================================ */

        @media (min-width: 1024px) and (prefers-reduced-motion: no-preference) {
          @keyframes footer-pulse-anim {
            0%, 100% { opacity: 0.5; }
            50%       { opacity: 1; }
          }
          .footer-pulse {
            animation: footer-pulse-anim 3s ease-in-out infinite;
          }
          /* Only apply blur on desktop */
          .footer-blur {
            backdrop-filter: blur(6px);
            -webkit-backdrop-filter: blur(6px);
          }
        }

        /* ✅ Mobile: zero animations, zero blur, zero box-shadow on footer */
        @media (max-width: 1023px) {
          .footer-pulse  { animation: none !important; }
          .footer-blur   { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
          .footer-glow   { box-shadow: none !important; }
          /* Simplify background decorations — remove blur entirely */
          .footer-bg-blur { display: none !important; }
        }
      `}</style>

      <footer
        className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-gray-100 relative overflow-hidden"
        aria-label="Site footer"
        /*
          ✅ FIX: minHeight reserves layout space to prevent CLS.
          Without this, the page shifts when the footer renders into the DOM.
          DO NOT set content-visibility:auto here — it causes CLS when footer
          enters viewport as the browser recomputes layout.
        */
        style={{ minHeight: '600px' }}
      >
        {/* Background decorations — hidden on mobile via footer-bg-blur */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none footer-bg-blur"
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-cyan-500/10 to-blue-600/10 rounded-full blur-3xl footer-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-full blur-3xl footer-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        </div>

        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="py-12">
            <div className="grid lg:grid-cols-5 gap-12">

              {/* Brand Section */}
              <div className="lg:col-span-2 space-y-5">
                <div className="flex items-center space-x-3">
                  <div className="relative" style={{ width: 48, height: 48, flexShrink: 0 }}>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-400/30 footer-glow">
                      <Image
                        src="/new-ezy-logo.webp"
                        alt="EzyLoan Logo"
                        className="object-contain brightness-0 invert"
                        width={28}
                        height={28}
                        quality={60}
                        loading="lazy"
                        sizes="28px"
                        style={{ width: 28, height: 28 }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                      EzyLoan
                    </span>
                    <p className="text-xs text-cyan-300/90 font-medium">Your Trusted Loan Partner</p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/40 rounded-xl p-4 border border-cyan-500/20 footer-blur shadow-lg">
                  <p className="text-gray-200 leading-relaxed max-w-md text-sm">
                    🌟 Making dreams come true with quick, easy loans. Join{' '}
                    <span className="text-cyan-300 font-semibold">10,000+ trusted customers</span> across India.
                  </p>
                  <div className="flex items-center space-x-1 mt-3">
                    <span className="text-amber-400 text-sm">⭐⭐⭐⭐⭐</span>
                    <span className="text-xs text-gray-300/80">4.9/5 Rating</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 footer-pulse" />
                    Follow Us
                  </h3>
                  <div className="flex space-x-2">
                    {socialLinks.map((social, index) => {
                      const IconComponent = social.icon;
                      return (
                        <a
                          key={index}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="w-10 h-10 bg-gradient-to-br from-blue-800/40 to-cyan-800/40 rounded-xl flex items-center justify-center border border-cyan-500/30 hover:bg-gradient-to-br hover:from-cyan-500 hover:to-blue-600 transition-colors duration-300 group"
                        >
                          <IconComponent className="w-4 h-4 text-cyan-300 group-hover:text-white transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400/80 mt-2">Stay connected for updates &amp; offers</p>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2" />
                  Products
                </h3>
                <ul className="space-y-2">
                  {footerLinks.products.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-300/90 hover:text-cyan-300 transition-colors duration-200 flex items-center group text-sm py-1"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-cyan-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2" />
                  Company
                </h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-300/90 hover:text-cyan-300 transition-colors duration-200 flex items-center group text-sm py-1"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-cyan-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h3 className="text-base font-semibold text-white mb-4 flex items-center">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mr-2" />
                  Resources
                </h3>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="text-gray-300/90 hover:text-cyan-300 transition-colors duration-200 flex items-center group text-sm py-1"
                      >
                        <span className="group-hover:translate-x-0.5 transition-transform duration-200">{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 text-cyan-400" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact + Compliance */}
          <div className="py-2 border-t border-cyan-500/20">
            <div className="bg-gradient-to-br from-amber-900/30 via-orange-900/25 to-red-900/30 rounded-2xl p-6 border border-amber-500/30 footer-blur shadow-xl">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="text-center lg:text-left">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center justify-center lg:justify-start">
                      <span className="w-3 h-3 bg-cyan-400 rounded-full mr-2 footer-pulse" />
                      📞 Get in Touch
                    </h3>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 mx-auto lg:mx-0 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <a
                      href="tel:+916372977626"
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/50 to-cyan-900/40 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-colors duration-300"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-semibold text-base">+91 6372977626</span>
                        <p className="text-cyan-300/90 text-xs">Mon-Sat, 9AM-8PM IST</p>
                      </div>
                    </a>
                    <a
                      href="https://wa.me/916372977626"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-900/40 to-green-900/40 rounded-lg border border-emerald-500/30 hover:border-emerald-400/60 transition-colors duration-300"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <span className="text-white text-sm font-bold">💬</span>
                      </div>
                      <div>
                        <span className="text-white font-semibold text-base">WhatsApp Chat</span>
                        <p className="text-emerald-300/90 text-xs">Instant support available</p>
                      </div>
                    </a>
                    <a
                      href="mailto:contact@ezyloan.co.in"
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-900/50 to-cyan-900/40 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-colors duration-300"
                    >
                      <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-semibold text-base">contact@ezyloan.co.in</span>
                        <p className="text-cyan-300/90 text-xs">We reply within 24 hours</p>
                      </div>
                    </a>
                    <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-900/50 to-cyan-900/40 rounded-lg border border-cyan-500/30">
                      <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-0.5 shadow-md flex-shrink-0">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-white font-semibold text-sm leading-relaxed">
                          1st Floor, Hindustan-Tyres, Pir Bazar, Bhanpur, Cuttack, Odisha-753011, India
                        </span>
                        <p className="text-cyan-300/90 text-xs mt-1">🕐 Visit us: Mon-Sat, 10AM-6PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <div className="bg-slate-800/70 rounded-xl p-4 border border-amber-500/40 shadow-inner">
                    <p className="text-gray-200/95 text-xs leading-relaxed mb-2.5">
                      <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" /> Important Notice:
                      </span>
                      We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.
                    </p>
                    <p className="text-gray-200/95 text-xs leading-relaxed mb-2.5">
                      <strong className="text-cyan-300">EzyLoan is not a lender.</strong> We are a loan facilitation platform connecting borrowers with trusted Banks and NBFCs.
                    </p>
                    <p className="text-gray-200/95 text-xs leading-relaxed">
                      We facilitate loan applications and are not engaged in financial advisory, investment services, or lending activities.
                    </p>
                    <p className="text-gray-400/90 text-[10px] mt-4 pt-3 border-t border-gray-600/50">
                      ⚠️ Loan approval subject to lender eligibility criteria. Interest rates range from 10%-28% p.a. Processing fees up to 3% may apply.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="py-8 border-t border-cyan-500/20">
            <div className="bg-gradient-to-r from-slate-800/60 to-blue-900/50 rounded-2xl p-6 footer-blur border border-cyan-500/20 shadow-lg">
              <h4 className="text-center text-lg font-semibold text-white mb-4 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400 mr-2" />
                Legal &amp; Compliance
                <ShieldCheck className="w-5 h-5 text-cyan-400 ml-2" />
              </h4>
              <div className="flex flex-wrap justify-center gap-3 mb-5">
                {footerLinks.legal.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-gray-300/90 hover:text-cyan-300 transition-colors duration-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/40"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400/90 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  Your data is secure and protected under Indian financial regulations
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="py-4 border-t border-cyan-500/20">
            <div className="bg-gradient-to-r from-slate-900/90 to-blue-950/90 rounded-2xl p-6 footer-blur border border-cyan-500/30 shadow-xl">
              <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                <div className="text-center lg:text-left">
                  <div className="text-gray-200/95 text-sm font-medium mb-2">
                    © {currentYear} <span className="text-cyan-300 font-bold">EzyLoan</span>. All rights reserved.
                  </div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-gray-200/95 text-sm font-medium mb-2">
                    Designed with <span className="text-red-400 footer-pulse">❤️</span> for your financial success
                  </div>
                  <div className="text-xs text-gray-400/80">
                    🌟 Trusted by <span className="text-cyan-300 font-semibold">10,000+ customers</span> across India
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-5 border-t border-cyan-500/20">
                <div className="flex flex-wrap justify-center items-center gap-5 text-xs text-gray-400/90">
                  <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" />256-bit SSL Encryption</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />RBI Compliant Partner</span>
                  <span className="flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5 text-purple-400" />Data Protection Act 2023</span>
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-amber-400" />24/7 Customer Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
});

Footer.displayName = 'Footer';
export default Footer;