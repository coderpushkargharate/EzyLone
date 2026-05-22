"use client";

import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Menu, X, ChevronDown, Calculator } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

// ✅ FIX: Removed "import Script from 'next/script'" — Scripts belong ONLY in layout.tsx
// That import was causing the HMR module factory error.

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCarRefinanceOpen, setIsCarRefinanceOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    };
  }, []);

  // On route change — close menu AND always restore body scroll
  useEffect(() => {
    setIsMenuOpen(false);
    setIsCarRefinanceOpen(false);
    document.body.style.overflow = "";
    document.body.style.position = "";
  }, [pathname]);

  // On unmount — always restore body scroll
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
    };
  }, []);

  const handleDropdownEnter = useCallback(() => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setIsCarRefinanceOpen(true);
  }, []);

  const handleDropdownLeave = useCallback(() => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsCarRefinanceOpen(false);
    }, 1000);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMenuOpen((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        document.body.style.overflow = next ? "hidden" : "";
      }
      return next;
    });
  }, []);

  const handleMobileLinkClick = useCallback(
    (e: React.MouseEvent, href: string) => {
      e.preventDefault();
      document.body.style.overflow = "";
      document.body.style.position = "";
      setIsMenuOpen(false);
      setIsCarRefinanceOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <>
      <style jsx global>{`
        @keyframes glass-shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes water-ripple {
          0% { transform: scale(0); opacity: 0.8; }
          100% { transform: scale(3); opacity: 0; }
        }
        @keyframes prism-light {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes liquid-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .glass-shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%);
          background-size: 1000px 100%;
          animation: glass-shimmer 4s infinite linear;
        }
        .animate-slide-down { animation: slide-down 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .transition-apple { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); }

        .apple-glass-btn {
          position: relative;
          overflow: hidden;
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, box-shadow;
        }

        @media (min-width: 1024px) {
          .apple-glass-btn::before {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 0; height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 40%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 1;
            transition: none;
          }
          .apple-glass-btn:hover::before,
          .apple-glass-btn:active::before {
            width: 250px; height: 250px;
            animation: water-ripple 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .apple-glass-btn::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 100%; height: 100%;
            background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 70%, transparent 100%);
            transform: skewX(-20deg);
            transition: left 0.5s ease-out;
            pointer-events: none;
            z-index: 2;
          }
          .apple-glass-btn:hover::after,
          .apple-glass-btn:active::after {
            left: 200%;
            animation: prism-light 1.5s ease-out forwards;
          }
          .liquid-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), rgba(255,255,255,0.3), rgba(255,255,255,0.15), transparent);
            background-size: 200% 100%;
            animation: liquid-flow 3s ease-in-out infinite;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 1;
            border-radius: inherit;
          }
          .apple-glass-btn:hover .liquid-overlay,
          .apple-glass-btn:active .liquid-overlay { opacity: 1; }
          .apple-glass-btn:hover,
          .apple-glass-btn:active {
            transform: scale(1.05) translateY(-4px);
            border-radius: 16px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 16px 50px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.4), 0 0 30px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.5);
          }
        }

        @media (min-width: 1024px) {
          .nav-link-water {
            position: relative;
            overflow: hidden;
            border-radius: 12px;
            padding: 4px 11px;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            -webkit-tap-highlight-color: transparent;
            will-change: transform, color;
          }
          .nav-link-water::before {
            content: '';
            position: absolute;
            top: 50%; left: 50%;
            width: 0; height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.05) 40%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 0;
            transition: none;
          }
          .nav-link-water:hover::before,
          .nav-link-water:active::before {
            width: 200px; height: 200px;
            animation: water-ripple 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          .nav-link-water:hover,
          .nav-link-water:active {
            background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(6,182,212,0.08));
            transform: translateY(-3px);
            color: #2563eb !important;
          }
        }

        @media (max-width: 1023px) {
          .apple-glass-btn::before,
          .apple-glass-btn::after,
          .liquid-overlay,
          .nav-link-water::before { display: none !important; }
          .apple-glass-btn:hover,
          .apple-glass-btn:active,
          .nav-link-water:hover,
          .nav-link-water:active {
            transform: none !important;
            box-shadow: none !important;
            background: none !important;
            animation: none !important;
          }
          .animate-slide-down { animation-duration: 0.15s !important; }
        }

        .apple-glass-btn:focus-visible,
        .nav-link-water:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .logo-img {
          content-visibility: auto;
          contain-intrinsic-size: 207px 140px;
        }

        /* ✅ FIX: glass-border defined here so it's always available */
        .glass-border {
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/10 glass-border transition-apple"
        role="banner"
        aria-label="Main navigation header"
      >
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-0">

            {/* Logo */}
            <div className="flex items-center space-x-2">
              <Link href="/" aria-label="EzyLoan Home">
                <Image
                  src="/ezy-logo.webp"
                  alt="EzyLoan Logo"
                  className="h-20 w-auto transition-apple hover:opacity-90 hover:scale-105 logo-img"
                  width={207}
                  height={140}
                  sizes="(max-width: 640px) 95px, 120px"
                  priority
                  quality={85}
                  loading="eager"
                />
              </Link>
            </div>

            {/* Mobile Apply Now */}
            <Link
              href="/apply-now"
              className="lg:hidden apple-glass-btn relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-3 py-1.5 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-apple transform hover:scale-105 group overflow-hidden text-base whitespace-nowrap glass-border active:scale-105 active:translate-y-[-4px]"
              aria-label="Apply for a loan now"
            >
              <span className="relative z-10">Apply Now</span>
              <div className="liquid-overlay"></div>
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-full scale-0 group-hover:scale-110 transition-apple duration-500 ease-out"></div>
              <div className="absolute inset-0 glass-shimmer rounded-full opacity-0 group-hover:opacity-100 transition-apple"></div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center space-x-0" role="navigation" aria-label="Main menu">
              <Link href="/" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/" ? "page" : undefined}>
                <span className="relative z-10">Home</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/about" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/about" ? "page" : undefined}>
                <span className="relative z-10">About</span>
                <div className="liquid-overlay"></div>
              </Link>

              <div className="relative group" onMouseEnter={handleDropdownEnter} onMouseLeave={handleDropdownLeave} role="menuitem">
                <button
                  className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap flex items-center space-x-1 apple-glass-btn active:translate-y-[-3px]"
                  aria-expanded={isCarRefinanceOpen}
                  aria-haspopup="true"
                  aria-label="Car Refinance options"
                >
                  <span className="relative z-10">Car Refinance</span>
                  <ChevronDown className={`w-4 h-4 transition-apple ${isCarRefinanceOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                  <div className="liquid-overlay"></div>
                </button>

                {isCarRefinanceOpen && (
                  <div
                    className="absolute top-full left-0 mt-2 w-64 bg-white/90 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 py-2 z-50 animate-slide-down glass-border"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                    role="menu"
                    aria-label="Car Refinance submenu"
                  >
                    <Link href="/car-loan-refinance" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-apple nav-link-water active:translate-y-[-3px]" role="menuitem">Car Loan Refinance</Link>
                    <Link href="/car-loan-topup" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-apple nav-link-water active:translate-y-[-3px]" role="menuitem">Car Loan TopUp</Link>
                    <Link href="/car-loan-balance-transfer" className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-apple nav-link-water active:translate-y-[-3px]" role="menuitem">Car Loan Balance Transfer</Link>
                  </div>
                )}
              </div>

              <Link href="/car-loan" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/car-loan" ? "page" : undefined}>
                <span className="relative z-10">New Car Loan</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/personal-loan" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/personal-loan" ? "page" : undefined}>
                <span className="relative z-10">Personal Loan</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/property-loan" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/property-loan" ? "page" : undefined}>
                <span className="relative z-10">Property Loan</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/commercial-vehicle-loan" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/commercial-vehicle-loan" ? "page" : undefined}>
                <span className="relative z-10">Commercial Vehicle</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/contact" className="nav-link-water relative text-gray-700 hover:text-blue-600 transition-apple font-medium group text-base whitespace-nowrap apple-glass-btn active:translate-y-[-3px]" aria-current={pathname === "/contact" ? "page" : undefined}>
                <span className="relative z-10">Contact</span>
                <div className="liquid-overlay"></div>
              </Link>

              <Link href="/apply-now" className="apple-glass-btn relative bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-apple transform hover:scale-105 group overflow-hidden text-base whitespace-nowrap glass-border ml-2 active:scale-105 active:translate-y-[-4px]" aria-label="Apply for a loan now">
                <span className="relative z-10">Apply Now</span>
                <div className="liquid-overlay"></div>
                <div className="absolute inset-0 glass-shimmer rounded-full opacity-0 group-hover:opacity-100 transition-apple"></div>
              </Link>

              <Link href="/emi-calculator" className="apple-glass-btn relative bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 transition-apple font-medium group text-base whitespace-nowrap flex items-center p-2.5 rounded-lg ml-1 overflow-hidden glass-border active:scale-105 active:translate-y-[-4px]" aria-label="Open EMI Calculator">
                <Calculator className="w-5 h-5 text-white transition-apple group-hover:scale-110" aria-hidden="true" />
                <div className="liquid-overlay"></div>
              </Link>
            </nav>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden p-2 rounded-lg backdrop-blur-sm bg-white/10 text-black relative group overflow-hidden transition-apple hover:bg-white/20 apple-glass-btn glass-border active:scale-105 active:translate-y-[-4px] min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={toggleMobileMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              {isMenuOpen
                ? <X className="w-6 h-6 transition-apple" aria-hidden="true" />
                : <Menu className="w-6 h-6 transition-apple" aria-hidden="true" />}
              <div className="liquid-overlay"></div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              id="mobile-menu"
              className="md:hidden py-4 backdrop-blur-xl text-black bg-white/10 rounded-2xl mt-2 border border-white/20 mx-2 glass-border animate-slide-down"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              <nav className="flex flex-col space-y-3 px-5" role="menu" aria-label="Mobile menu">
                <Link href="/" onClick={(e) => handleMobileLinkClick(e, "/")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Home</Link>
                <Link href="/about" onClick={(e) => handleMobileLinkClick(e, "/about")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">About</Link>

                <div className="border-l-2 border-blue-200 pl-3" role="group" aria-label="Car Refinance submenu">
                  <div className="text-base font-semibold text-blue-600 mb-2">Car Refinance</div>
                  <Link href="/car-loan-refinance" onClick={(e) => handleMobileLinkClick(e, "/car-loan-refinance")} className="nav-link-water text-gray-700 block text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Car Loan Refinance</Link>
                  <Link href="/car-loan-topup" onClick={(e) => handleMobileLinkClick(e, "/car-loan-topup")} className="nav-link-water text-gray-700 block text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Car Loan TopUp</Link>
                  <Link href="/car-loan-balance-transfer" onClick={(e) => handleMobileLinkClick(e, "/car-loan-balance-transfer")} className="nav-link-water text-gray-700 block text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Car Loan Balance Transfer</Link>
                </div>

                <Link href="/car-loan" onClick={(e) => handleMobileLinkClick(e, "/car-loan")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">New Car Loan</Link>
                <Link href="/personal-loan" onClick={(e) => handleMobileLinkClick(e, "/personal-loan")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Personal Loan</Link>
                <Link href="/property-loan" onClick={(e) => handleMobileLinkClick(e, "/property-loan")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Property Loan</Link>
                <Link href="/commercial-vehicle-loan" onClick={(e) => handleMobileLinkClick(e, "/commercial-vehicle-loan")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Commercial Vehicle Loan</Link>
                <Link href="/emi-calculator" onClick={(e) => handleMobileLinkClick(e, "/emi-calculator")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">EMI Calculator</Link>
                <Link href="/contact" onClick={(e) => handleMobileLinkClick(e, "/contact")} className="nav-link-water text-gray-700 apple-glass-btn text-base active:translate-y-[-3px] min-h-[44px] flex items-center" role="menuitem">Contact</Link>

                <Link
                  href="/apply-now"
                  onClick={(e) => handleMobileLinkClick(e, "/apply-now")}
                  className="apple-glass-btn relative text-white bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 rounded-full font-semibold mt-4 text-center group overflow-hidden max-w-[220px] mx-auto glass-border text-base active:scale-105 active:translate-y-[-4px] min-h-[44px] flex items-center justify-center"
                  role="menuitem"
                  aria-label="Apply for a loan now"
                >
                  <span className="relative z-10">Apply Now</span>
                  <div className="liquid-overlay"></div>
                  <div className="absolute inset-0 glass-shimmer rounded-full opacity-0 group-hover:opacity-100 transition-apple"></div>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
});

Header.displayName = "Header";
export default Header;