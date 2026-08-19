"use client";

// HeroSection.tsx — EzyLoan HYDRATION-FIXED v3 (cleaned & formatted)
//
// FIXES APPLIED:
// ✅ [Hydration] Mobile detection now uses CSS media queries via className, not JS state
// ✅ [Hydration] Added suppressHydrationWarning only where truly needed
// ✅ [Images] All Next.js Image components now have proper width/height OR use fill correctly
// ✅ [Performance] Removed unnecessary will-change and backdrop-filter on mobile

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { trackGoogleAdsConversion } from "@/lib/ads";
import { trackMetaLead } from "@/components/MetaPixel";
import { isIndianMobile } from "@/lib/phone";
import {
  Clock,
  Percent,
  Shield,
  Star,
  Phone,
  CheckCircle,
  User,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Mail,
  CreditCard,
  Car,
  Home,
  Briefcase,
  Building,
  Truck,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

// Types
interface Banner {
  _id: string;
  image: string;
  page: string;
  isActive: boolean;
}

interface HeroProps {
  page: string;
  title?: string;
  subtitle?: string;
}

interface Testimonial {
  name: string;
  location: string;
  quote: string;
  avatar: string;
  rating: number;
}

// Constants
const LOAN_TYPES = [
  {
    group: "Vehicle Loans",
    icon: Car,
    color: "from-blue-500 to-cyan-600",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    isHighlighted: true,
    types: [
      { value: "car-loan-new", label: "Car Loan (New)", icon: Car },
      { value: "used-car-loan", label: "Used Car Loan", icon: Car },
      { value: "car-loan-topup", label: "Car Loan Top-Up", icon: RefreshCw },
      { value: "commercial-vehicle", label: "Commercial Vehicle", icon: Truck },
      { value: "car-loan-bt", label: "Car Loan Balance Transfer", icon: RefreshCw },
    ],
  },
  {
    group: "Personal",
    icon: CreditCard,
    color: "from-purple-500 to-indigo-600",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    types: [{ value: "personal-loan", label: "Personal Loan", icon: CreditCard }],
  },
  {
    group: "Property Loans",
    icon: Home,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    types: [
      { value: "home-loan", label: "Home Loan", icon: Home },
      { value: "property-loan-lap", label: "Property Loan (LAP)", icon: Building },
    ],
  },
  {
    group: "Business",
    icon: Briefcase,
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    types: [{ value: "business-loan", label: "Business Loan", icon: Briefcase }],
  },
  {
    group: "Others",
    icon: Plus,
    color: "from-gray-500 to-slate-600",
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600",
    types: [{ value: "other", label: "Other / Custom", icon: Plus }],
  },
];

const FALLBACK_BANNER = "/ezy-banner.webp";

// Session-lived client cache for banner data, keyed by page. Lets banners render
// instantly when navigating between pages (no spinner / re-fetch flash) while a
// background request revalidates. The API also caches server-side + sets
// Cache-Control, so the network hit itself is cheap.
const bannerClientCache = new Map<string, any[]>();
const GOOGLE_REVIEW_LINK =
  "https://www.google.com/search?q=ezyloan#cobssid=s";

// Helper: LoanTypeDropdown (memoised)
const LoanTypeDropdown = memo(
  ({ isOpen, onClose, onSelect, selectedLoan, isMobile }: any) => {
    useEffect(() => {
      if (!isOpen) return;
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      };
      window.addEventListener("keydown", handleEscape, { passive: false });
      return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
      if (!isOpen || !isMobile) return;
      const scrollY = window.scrollY;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
        window.scrollTo({ top: scrollY, behavior: "instant" as ScrollBehavior });
      };
    }, [isOpen, isMobile]);

    const handleLoanSelect = useCallback(
      (loanType: string) => {
        onSelect(loanType);
        onClose();
      },
      [onSelect, onClose]
    );

    if (!isOpen) return null;

    if (isMobile) {
      return (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[9998] touch-none"
            onClick={onClose}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            onClick={onClose}
          >
            <div
              className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[70vh] border border-gray-100 pointer-events-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Select loan type"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-900">
                  Select Loan Type
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close dropdown"
                  type="button"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto px-3 pb-4"
                style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
              >
                <div className="space-y-3 py-2">
                  {LOAN_TYPES.map((group) => {
                    const Icon = group.icon;
                    return (
                      <div key={group.group} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center gap-2.5 px-1 py-2 mb-2">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            {group.group}
                          </span>
                          {group.isHighlighted && (
                            <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="space-y-2">
                          {group.types.map((loan) => {
                            const LoanIcon = loan.icon;
                            const isSelected = selectedLoan === loan.value;
                            return (
                              <button
                                key={loan.value}
                                type="button"
                                onClick={() => handleLoanSelect(loan.value)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left border-2 min-h-[44px] ${
                                  isSelected
                                    ? `${group.bgColor} border-blue-500`
                                    : "bg-white border-transparent"
                                }`}
                                aria-pressed={isSelected}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? "bg-white"
                                      : `bg-gradient-to-br ${group.color}`
                                  }`}
                                >
                                  <LoanIcon
                                    className={`w-5 h-5 ${
                                      isSelected ? group.iconColor : "text-white"
                                    }`}
                                  />
                                </div>
                                <span
                                  className={`text-sm font-medium flex-1 ${
                                    isSelected ? "text-gray-900" : "text-gray-700"
                                  }`}
                                >
                                  {loan.label}
                                </span>
                                {isSelected && (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return (
      <div
        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-96 overflow-y-auto p-2">
          {LOAN_TYPES.map((group) => {
            const Icon = group.icon;
            return (
              <div key={group.group} className="mb-2 last:mb-0">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div
                    className={`w-6 h-6 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {group.group}
                  </span>
                  {group.isHighlighted && (
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      Popular
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {group.types.map((loan) => {
                    const LoanIcon = loan.icon;
                    const isSelected = selectedLoan === loan.value;
                    return (
                      <button
                        key={loan.value}
                        type="button"
                        onClick={() => handleLoanSelect(loan.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left border-2 min-h-[44px] transition-colors duration-150 ${
                          isSelected
                            ? `${group.bgColor} border-blue-500`
                            : "bg-white border-transparent hover:border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "bg-white"
                              : `bg-gradient-to-br ${group.color}`
                          }`}
                        >
                          <LoanIcon
                            className={`w-4 h-4 ${
                              isSelected ? group.iconColor : "text-white"
                            }`}
                          />
                        </div>
                        <span
                          className={`text-sm font-medium flex-1 ${
                            isSelected ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {loan.label}
                        </span>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
LoanTypeDropdown.displayName = "LoanTypeDropdown";

// Helper: BankingPartnersCarousel (memoised)
const BankingPartnersCarousel = memo(
  ({ bankingPartners }: { bankingPartners: Array<{ name: string; logo: string }> }) => {
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
      <div className="w-full px-4 py-5 lg:py-7">
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

            <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-white/60 to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white/60 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    );
  }
);
BankingPartnersCarousel.displayName = "BankingPartnersCarousel";

// Main Component: HeroSection
const HeroSection: React.FC<HeroProps> = ({ page, title, subtitle }) => {
  // State
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    loanType: "",
    loanAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  // Mirrors the Services carousel: 3 cards per view on desktop, 1 on mobile.
  const [testimonialsPerView, setTestimonialsPerView] = useState(1);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  // Refs
  const slideIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testimonialIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  // Data
  const defaultTestimonials = useMemo<Testimonial[]>(
    () => [
      {
        name: "satyajit sethy",
        location: "Cuttack",
        quote:
          "Good organization. Give good behaviour like friendly with all.",
        avatar:
          "https://lh3.googleusercontent.com/a-/ALV-UjXmOhlXiVFoZDdhkdBgzVx1-U8UxBq3QpSc7IG69R7EoGjagyScag=s36-c-rp-mo-br100",
        rating: 5,
      },
      {
        name: "Rohan kumar Rout",
        location: "Bhubaneswar",
        quote: "Best service provide ❤️",
        avatar:
          "https://lh3.googleusercontent.com/a-/ALV-UjWi-Km3_8HDuoTJPHAcJ3dcomr165YhJ8jSY2IAoeKqCHDCT9MX=s36-c-rp-mo-br100",
        rating: 5,
      },
      {
        name: "Yashwant Mohanta",
        location: "Puri",
        quote: "Best financial advisor",
        avatar:
          "https://lh3.googleusercontent.com/a-/ALV-UjXvxKlE3JqPL6xmUQrZOXOParG_0U-AslDgJVLfUE-Mbvyn6V1-=s36-c-rp-mo-br100",
        rating: 5,
      },
      {
        name: "Hota suresh",
        location: "Bhubaneswar",
        quote: "The best DSA in used car loan",
        avatar:
          "https://lh3.googleusercontent.com/a-/ALV-UjXw7b9Ef8vaGhQdWjsmvQwiGjT5-DRvtdme0eSc9Nn9y83e9Gmd=s36-c-rp-mo-ba2-br100",
        rating: 5,
      },
      {
        name: "Namita Das",
        location: "Puri",
        quote: "Best place for financial need.",
        avatar:
          "https://lh3.googleusercontent.com/a/ACg8ocK83OxpRRHcbJ0NEVzhbhl3wAEzrWjyCj-gj7hyBNFY9pkf8g=s36-c-rp-mo-br100",
        rating: 5,
      },
    ],
    []
  );

  // Admin-managed testimonials (from the admin panel). These are shown in
  // addition to the built-in defaults below — newly added ones appear first and
  // the earlier/default testimonials are kept.
  const [adminTestimonials, setAdminTestimonials] = useState<Testimonial[]>([]);
  useEffect(() => {
    let mounted = true;
    axios
      // Cache-buster so the public list reflects admin adds/deletes right away
      // instead of serving the 5-min cached response.
      .get(`/api/testimonials?_t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' },
      })
      .then((r) => {
        if (!mounted) return;
        const list = (r.data || [])
          .filter((t: any) => t.isActive !== false && t.quote)
          .map((t: any) => ({
            name: t.name,
            location: t.location || '',
            quote: t.quote,
            avatar: t.avatar || '',
            rating: t.rating || 5,
          }));
        setAdminTestimonials(list);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Show admin-added testimonials first, then the built-in defaults, so adding
  // new ones never hides the earlier testimonials.
  const testimonials = useMemo<Testimonial[]>(
    () => [...adminTestimonials, ...defaultTestimonials],
    [adminTestimonials, defaultTestimonials]
  );

  const bankLogos = useMemo(
    () => [
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
    ],
    []
  );

  // Admin-uploaded partner logos (Banner page="bank-partners") are appended to
  // the built-in set, so the admin can add more logos without touching code.
  const [adminBankLogos, setAdminBankLogos] = useState<string[]>([]);
  useEffect(() => {
    let mounted = true;
    axios
      .get('/api/banners?page=bank-partners')
      .then((r) => {
        if (!mounted) return;
        const imgs = (r.data || [])
          .filter((b: Banner) => b.isActive && b.image?.trim())
          .map((b: Banner) => b.image);
        setAdminBankLogos(imgs);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const bankingPartners = useMemo(
    () =>
      [...bankLogos, ...adminBankLogos].map((logo, index) => ({
        name: `Bank Partner ${index + 1}`,
        logo,
      })),
    [bankLogos, adminBankLogos]
  );

  // Helper functions
  const getValidImageUrl = useCallback(
    (url: string): string => {
      if (!url?.trim()) return FALLBACK_BANNER;
      const trimmed = url.trim();
      // Banners are served same-origin now (Cloudinary URLs or /uploads/...),
      // so relative "/..." paths resolve directly — no host prefix needed.
      if (trimmed.startsWith("//")) return `https:${trimmed}`;
      return trimmed;
    },
    []
  );

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Valid email required";
    if (!formData.phoneNumber.trim())
      errors.phoneNumber = "Phone number is required";
    else if (!isIndianMobile(formData.phoneNumber))
      errors.phoneNumber = "Enter a valid Indian mobile (10 digits, starts 6-9)";
    if (!formData.loanType) errors.loanType = "Select loan type";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) {
        setSubmitMessage({ type: "error", text: "Please correct errors above" });
        return;
      }
      setIsSubmitting(true);
      setSubmitMessage(null);
      setFormErrors({});
      try {
        const response = await axios.post(
          `/api/contacts`,
          {
            ...formData,
            page: page === "home" ? "home" : page,
            source: "hero_form",
            timestamp: new Date().toISOString(),
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
          }
        );
        if (response.data.success || response.status === 200 || response.status === 201) {
          setSubmitMessage({
            type: "success",
            text: "Thank you! We will contact you shortly.",
          });
          setFormData({
            fullName: "",
            email: "",
            phoneNumber: "",
            loanType: "",
            loanAmount: "",
          });
          // Google Ads conversion (env-driven; safe no-op until the label is configured)
          trackGoogleAdsConversion();
          // Meta Pixel lead
          trackMetaLead({ content_name: formData.loanType || "hero_form", currency: "INR", value: 1 });
        } else {
          throw new Error("Unexpected response");
        }
      } catch {
        setSubmitMessage({
          type: "error",
          text: "Something went wrong. Please try again.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, page]
  );

  const handleLoanTypeSelect = useCallback(
    (loanType: string) => {
      setFormData((prev) => ({ ...prev, loanType }));
      if (formErrors.loanType) {
        setFormErrors((prev) => {
          const n = { ...prev };
          delete n.loanType;
          return n;
        });
      }
    },
    [formErrors.loanType]
  );

  const toggleLoanDropdown = useCallback(
    () => setIsLoanDropdownOpen((p) => !p),
    []
  );

  const nextSlide = useCallback(() => {
    if (banners.length > 1)
      setCurrentSlide((p) => (p + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length > 1)
      setCurrentSlide((p) => (p - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const getSelectedLoanLabel = useCallback(
    (value: string) =>
      LOAN_TYPES.flatMap((g) => g.types).find((t) => t.value === value)?.label,
    []
  );

  const getSelectedLoanIcon = useCallback((value: string) => {
    const group = LOAN_TYPES.find((g) =>
      g.types.some((t) => t.value === value)
    );
    const loan = group?.types.find((t) => t.value === value);
    return loan?.icon || CreditCard;
  }, []);

  const getLoanBtnClassName = useCallback(
    (
      hasLoanType: boolean,
      hasError: boolean,
      isOpen: boolean,
      size: "sm" | "lg"
    ) => {
      const base =
        size === "sm"
          ? "w-full pl-8 pr-9 py-2 rounded-lg bg-white/95 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs border transition-colors duration-150"
          : "w-full pl-10 pr-10 py-3 rounded-lg bg-white/95 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 text-base border transition-colors duration-150";
      const colorClass = hasLoanType
        ? "border-blue-300 text-gray-900"
        : "border-gray-200 text-gray-500";
      const errorClass = hasError ? "ring-2 ring-red-400 border-red-300" : "";
      const openClass = isOpen ? "ring-2 ring-blue-400 border-blue-400" : "";
      return [base, colorClass, errorClass, openClass].filter(Boolean).join(" ");
    },
    []
  );

  // (Testimonials use an auto-advancing transform carousel — see effects below.)

  // Effects
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (page === "home") {
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        // Show cached banners immediately (instant), then revalidate in the bg.
        const cached = bannerClientCache.get(page);
        if (cached) {
          setBanners(cached);
          setIsLoading(false);
        } else {
          setIsLoading(true);
        }
        setError(null);
        const response = await axios.get(
          `/api/banners?page=${encodeURIComponent(page)}`
        );
        if (!isMounted) return;
        const validBanners = (response.data || [])
          .filter((b: Banner) => b.isActive && b.image?.trim())
          .map((b: Banner) => ({ ...b, image: getValidImageUrl(b.image) }));
        bannerClientCache.set(page, validBanners);
        setBanners(validBanners);
      } catch {
        if (isMounted && !bannerClientCache.get(page))
          setError("Failed to load banners. Please refresh the page.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchBanners();
    return () => {
      isMounted = false;
    };
  }, [page, getValidImageUrl]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [banners]);

  useEffect(() => {
    if (banners.length <= 1 || page === "home") return;
    if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    slideIntervalRef.current = setInterval(
      () => setCurrentSlide((p) => (p + 1) % banners.length),
      4000
    );
    return () => {
      if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
    };
  }, [banners.length, page]);

  // Responsive cards-per-view (3 desktop / 1 mobile) — mirrors the Services carousel.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      setTestimonialsPerView(mq.matches ? 3 : 1);
      setTestimonialIndex(0);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Auto-advance the testimonials carousel (pauses on hover).
  useEffect(() => {
    if (page !== "home" || !isHydrated) return;
    const maxIndex = Math.max(0, testimonials.length - testimonialsPerView);
    if (isTestimonialPaused || maxIndex === 0) return;
    if (testimonialIntervalRef.current)
      clearInterval(testimonialIntervalRef.current);
    testimonialIntervalRef.current = setInterval(
      () => setTestimonialIndex((p) => (p >= maxIndex ? 0 : p + 1)),
      3000
    );
    return () => {
      if (testimonialIntervalRef.current)
        clearInterval(testimonialIntervalRef.current);
    };
  }, [page, isHydrated, testimonials.length, testimonialsPerView, isTestimonialPaused]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (slideIntervalRef.current) clearInterval(slideIntervalRef.current);
      } else {
        if (banners.length > 1 && page !== "home")
          slideIntervalRef.current = setInterval(
            () => setCurrentSlide((p) => (p + 1) % banners.length),
            4000
          );
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [banners.length, page]);

  useEffect(() => {
    if (!isLoanDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        !(e.target as HTMLElement).closest("[data-loan-dropdown-trigger]") &&
        !(e.target as HTMLElement).closest('[role="dialog"]')
      ) {
        setIsLoanDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLoanDropdownOpen]);

  // Render helpers
  const renderForm = (size: "sm" | "lg") => {
    const isLg = size === "lg";
    return (
      <form onSubmit={handleFormSubmit} className={isLg ? "space-y-4" : "space-y-2.5"} noValidate>
        {isLg ? (
          <>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name *"
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (formErrors.fullName) {
                    setFormErrors((p) => {
                      const n = { ...p };
                      delete n.fullName;
                      return n;
                    });
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base${
                  formErrors.fullName ? " ring-2 ring-red-400" : ""
                }`}
                required
                disabled={isSubmitting}
                autoComplete="name"
              />
              {formErrors.fullName && (
                <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.fullName}</p>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (formErrors.email) {
                    setFormErrors((p) => {
                      const n = { ...p };
                      delete n.email;
                      return n;
                    });
                  }
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base${
                  formErrors.email ? " ring-2 ring-red-400" : ""
                }`}
                required
                disabled={isSubmitting}
                autoComplete="email"
              />
              {formErrors.email && (
                <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.email}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name *"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    if (formErrors.fullName) {
                      setFormErrors((p) => {
                        const n = { ...p };
                        delete n.fullName;
                        return n;
                      });
                    }
                  }}
                  className={`w-full pl-8 pr-2 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs${
                    formErrors.fullName ? " ring-2 ring-red-400" : ""
                  }`}
                  required
                  disabled={isSubmitting}
                  autoComplete="name"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) {
                      setFormErrors((p) => {
                        const n = { ...p };
                        delete n.email;
                        return n;
                      });
                    }
                  }}
                  className={`w-full pl-8 pr-2 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs${
                    formErrors.email ? " ring-2 ring-red-400" : ""
                  }`}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
            </div>
            {(formErrors.fullName || formErrors.email) && (
              <div className="flex flex-col gap-0.5">
                {formErrors.fullName && (
                  <p className="text-red-300 text-[9px] ml-1">{formErrors.fullName}</p>
                )}
                {formErrors.email && (
                  <p className="text-red-300 text-[9px] ml-1">{formErrors.email}</p>
                )}
              </div>
            )}
          </>
        )}

        <div className="relative">
          <span
            className={`absolute left-${
              isLg ? "3" : "2.5"
            } top-1/2 -translate-y-1/2 ${
              isLg ? "text-base" : "text-xs"
            } font-medium text-gray-600 select-none pointer-events-none`}
          >
            🇮🇳 +91
          </span>
          <input
            type="tel"
            placeholder="10-digit mobile number *"
            maxLength={10}
            value={formData.phoneNumber}
            onChange={(e) => {
              // India-only: keep digits, drop a pasted 91/0 prefix, cap at 10.
              let d = e.target.value.replace(/\D/g, "");
              if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
              if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
              const cleaned = d.slice(0, 10);
              setFormData((prev) => ({ ...prev, phoneNumber: cleaned }));
              if (formErrors.phoneNumber) {
                setFormErrors((p) => {
                  const n = { ...p };
                  delete n.phoneNumber;
                  return n;
                });
              }
            }}
            className={`w-full ${
              isLg ? "pl-20 pr-4 py-3 text-base" : "pl-16 pr-3 py-2 text-xs"
            } rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400${
              formErrors.phoneNumber ? " ring-2 ring-red-400" : ""
            }`}
            required
            disabled={isSubmitting}
            inputMode="tel"
            autoComplete="tel"
          />
          {formErrors.phoneNumber && (
            <p
              className={`text-red-300 ${
                isLg ? "text-xs" : "text-[9px]"
              } mt-0.5 ml-1`}
            >
              {formErrors.phoneNumber}
            </p>
          )}
        </div>

        <div className="relative">
          <Percent
            className={`absolute left-${
              isLg ? "3" : "2.5"
            } top-1/2 -translate-y-1/2 ${
              isLg ? "h-5 w-5" : "h-3.5 w-3.5"
            } text-gray-400`}
          />
          <input
            type="text"
            placeholder="Loan Amount (Optional)"
            value={formData.loanAmount}
            onChange={(e) =>
              setFormData({ ...formData, loanAmount: e.target.value })
            }
            className={`w-full ${
              isLg ? "pl-10 pr-4 py-3 text-base" : "pl-8 pr-3 py-2 text-xs"
            } rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400`}
            disabled={isSubmitting}
            inputMode="numeric"
          />
        </div>

        <div className="space-y-0.5 relative" data-loan-dropdown-trigger>
          <div className="relative">
            <button
              type="button"
              onClick={toggleLoanDropdown}
              className={getLoanBtnClassName(
                !!formData.loanType,
                !!formErrors.loanType,
                isLoanDropdownOpen,
                size
              )}
              disabled={isSubmitting}
              aria-haspopup="listbox"
              aria-expanded={isLoanDropdownOpen}
            >
              <div
                className={`absolute inset-y-0 left-0 ${
                  isLg ? "pl-3" : "pl-2.5"
                } flex items-center pointer-events-none`}
              >
                {formData.loanType ? (
                  (() => {
                    const Icon = getSelectedLoanIcon(formData.loanType);
                    return (
                      <Icon
                        className={
                          isLg
                            ? "h-5 w-5 text-gray-600"
                            : "h-3.5 w-3.5 text-gray-600"
                        }
                      />
                    );
                  })()
                ) : (
                  <CreditCard
                    className={
                      isLg
                        ? "h-5 w-5 text-gray-400"
                        : "h-3.5 w-3.5 text-gray-400"
                    }
                  />
                )}
              </div>
              <span className="block truncate pr-4">
                {formData.loanType
                  ? getSelectedLoanLabel(formData.loanType)
                  : isLg
                  ? "Select a loan type"
                  : "Select loan type"}
              </span>
              <ChevronDown
                className={`absolute ${
                  isLg ? "right-3" : "right-2.5"
                } top-1/2 -translate-y-1/2 ${
                  isLg ? "h-5 w-5" : "h-3.5 w-3.5"
                } text-gray-400 transition-transform duration-200${
                  isLoanDropdownOpen ? " rotate-180" : ""
                }`}
              />
            </button>
          </div>
          {formErrors.loanType && (
            <p
              className={`text-red-300 ${
                isLg ? "text-xs" : "text-[9px]"
              } mt-0.5 ml-1`}
            >
              {formErrors.loanType}
            </p>
          )}
          <LoanTypeDropdown
            isOpen={isLoanDropdownOpen}
            onClose={() => setIsLoanDropdownOpen(false)}
            onSelect={handleLoanTypeSelect}
            selectedLoan={formData.loanType}
            isMobile={!isHydrated ? false : window.innerWidth < 1024}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`glass-prism-btn w-full inline-flex items-center justify-center gap-2 font-bold ${
            isLg ? "py-3 text-base" : "py-2 text-xs"
          } rounded-lg disabled:opacity-50 bg-gradient-to-r from-orange-500 to-amber-500 text-white min-h-[44px] active:scale-[0.98] transition-transform duration-100`}
        >
          {isSubmitting ? (
            <>
              <svg
                className={`animate-spin ${
                  isLg ? "h-5 w-5" : "h-3.5 w-3.5"
                } text-white`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>{isLg ? "Check Eligibility Now" : "Check Now"}</span>
              <ArrowRight className={isLg ? "w-5 h-5" : "w-3.5 h-3.5"} />
            </>
          )}
        </button>

        <div
          className={`flex items-center justify-center space-x-1 ${
            isLg ? "text-sm" : "text-[10px]"
          } text-green-300`}
        >
          <Shield className={isLg ? "w-4 h-4" : "w-3 h-3"} />
          <span>Your details are 100% safe{isLg ? " with us." : "."}</span>
        </div>
      </form>
    );
  };

  // Main render
  if (page === "home") {
    return (
      <section
        className="hero-section relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 sm:pt-20 lg:pt-24 pb-6 overflow-hidden"
        suppressHydrationWarning
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-400/10 rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Mobile view */}
          <div className="lg:hidden mobile-view-block">
            <div
              className="relative mt-5  rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-100/50"
              style={{ minHeight: "280px", aspectRatio: "4/3" }}
            >
              <div className="absolute inset-0">
                <Image
                  src="/homebanner/image1.webp"
                  alt="Car Loan - Get approved in 24 hours in Odisha"
                  fill
                  sizes="(max-width: 768px) 180px, 450px"
                  quality={60}
                  className="object-contain object-right pointer-events-none"
                  priority
                  fetchPriority="high"
                />
              </div>
              <div className="relative z-10 p-4 sm:p-5 ">
                <h1 className="text-2xl sm:text-4xl font-bold w-75 text-gray-900 leading-tight mb-2">
                  <span>Get Loan Approved in </span>
                  <span className="text-blue-600">24 Hours in Odisha</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-3">
                  *Subject to eligibility &amp; document verification
                </p>
                <div className="flex items-center space-x-1.5 bg-green-50/80 w-fit px-2.5 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-green-800" />
                  <span className="font-semibold text-[11px] sm:text-xs text-gray-800">
                    LOAN APPROVED IN 24 HOURS*
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 text-[11px] sm:text-xs">
                  {["Hassle-free process", "Low interest rates"].map((item) => (
                    <div key={item} className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-700 font-medium text-[11px] sm:text-xs mb-1  mt-2">
                  ✅ No hidden charges
                </p>
                <div className="grid grid-cols-3 gap-1.5  w-72">
                  {[
                    { icon: Clock, label: "Quick Approval" },
                    { icon: Percent, label: "Lowest Rates" },
                    { icon: Shield, label: "100% Secure" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="glass-prism text-center p-2 bg-white/60 rounded-lg"
                    >
                      <div className="w-7 h-7 bg-blue-100  rounded-full flex items-center justify-center mx-auto mb-1">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="w-full bg-gradient-to-r from-blue-600/95 to-cyan-500/95 rounded-2xl p-3 sm:p-4 text-white shadow-2xl border border-white/30 relative"
              data-loan-dropdown
            >
              <div className="text-center mb-3">
                <p className="text-sm font-bold mb-0.5">
                  Check Eligibility in <span className="text-orange-400">30 Sec</span>
                </p>
              </div>
              {submitMessage && (
                <div
                  className={`mb-2 p-2 rounded-lg text-xs text-center ${
                    submitMessage.type === "success"
                      ? "bg-green-500/20 text-green-200"
                      : "bg-red-500/20 text-red-200"
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}
              {renderForm("sm")}
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 mt-5 lg:items-start">
            <div className="space-y-6 text-left">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                <span>Get Loan Approved in </span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  24 Hours in Odisha
                </span>
              </h1>
              <p className="text-sm text-gray-500 -mt-2">
                *Subject to eligibility &amp; document verification
              </p>
              <div className="flex items-center space-x-2 bg-green-50/70 w-fit px-4 py-2 rounded-full border border-green-200/50">
                <CheckCircle className="w-5 h-5 text-green-800" />
                <span className="font-semibold text-sm text-green-800">
                  LOAN APPROVED IN 24 HOURS*
                </span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                {["Hassle-free process", "Low interest rates"].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 font-medium flex items-center gap-1.5 ">
                <CheckCircle className="w-4 h-4 text-green-800" />
                <span>No hidden charges</span>
              </p>
              <div className="grid grid-cols-3  gap-4">
                {[
                  { icon: Clock, label: "Quick Approval" },
                  { icon: Percent, label: "Lowest Interest Rates" },
                  { icon: Shield, label: "100% Secure Process" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="glass-prism text-center p-4 bg-white/70 rounded-xl"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[600px]" style={{ position: "relative", height: "600px" }}>
              <div
                className="absolute z-10 pointer-events-none"
                style={{ left: "-19rem", top: "-6.50rem", width: "570px", height: "570px", position: "relative" }}
              >
                {/* Desktop hero. NOT `priority` and `loading="lazy"` on purpose:
                    `priority`/`eager` make Next emit a <link rel=preload> in
                    <head> that fires even though this block is display:none on
                    mobile, stealing 4G bandwidth from the real mobile LCP image
                    (image1.webp). With `lazy`, mobile (display:none) never
                    downloads it at all, while desktop — where it sits in the
                    initial viewport — still loads it promptly on an unthrottled
                    network. */}
                <Image
                  src="/homebanner/bannerimg.webp"
                  alt="Car Loan illustration"
                  fill
                  sizes="570px"
                  loading="lazy"
                  fetchPriority="high"
                  quality={72}
                  className="object-contain pointer-events-none"
                />
              </div>
              <div
                className="absolute lg:top-[-30px] w-100 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 py-4 text-white shadow-2xl z-20 border border-white/30"
                style={{ position: "absolute", top: "-30px", right: "0.30rem", width: "25rem" }}
              >
                <div className="text-center mb-4">
                  <p className="text-lg font-bold">
                    Check Your Loan Eligibility in{" "}
                    <span className="text-orange-400">30 Sec</span>
                  </p>
                </div>
                {submitMessage && (
                  <div
                    className={`mb-4 p-3 rounded-lg text-sm text-center ${
                      submitMessage.type === "success"
                        ? "bg-green-500/20 text-green-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {submitMessage.text}
                  </div>
                )}
                {renderForm("lg")}
              </div>
            </div>
          </div>

          {/* Google review strip */}
          <div className="max-w-7xl px-4 sm:px-6 lg:px-0 mt-5 lg:mt-[-140px] w-full">
            <a
              href={GOOGLE_REVIEW_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <div className="glass-prism bg-white/70 rounded-2xl p-4 lg:py-0 sm:p-6 w-full cursor-pointer group">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
                  <p className="text-gray-800 font-semibold text-center sm:text-left text-sm sm:text-base">
                    Trusted by 10,000+ Customers Across Odisha
                  </p>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 rounded-lg px-3 sm:px-4 py-2 lg:py-2 group-hover:bg-blue-50/60 transition-colors border border-white/50">
                    <span className="text-lg sm:text-xl font-bold text-blue-600">
                      Google
                    </span>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-800 mr-1 sm:mr-2 text-sm sm:text-base">
                        4.8
                      </span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Testimonials — auto-advancing carousel (same behaviour as the Services carousel) */}
          <div className="max-w-7xl px-4 sm:px-6 lg:px-0 mt-5 w-full" style={{ minHeight: "160px" }}>
            <div
              className="relative overflow-hidden py-2"
              onMouseEnter={() => setIsTestimonialPaused(true)}
              onMouseLeave={() => setIsTestimonialPaused(false)}
            >
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${testimonialIndex * (100 / testimonialsPerView)}%)`,
                  willChange: "transform",
                }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={`testimonial-${index}`}
                    className="flex-shrink-0 px-2 sm:px-3"
                    style={{ width: `${100 / testimonialsPerView}%` }}
                  >
                    <div className="glass-prism flex items-start gap-4 bg-white/70 rounded-xl p-5 h-full">
                      <div className="flex-shrink-0">
                        <Image
                          src={testimonial.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=48`}
                          alt={testimonial.name}
                          width={48}
                          height={48}
                          className="rounded-full object-cover border-2 border-white/60"
                          loading="lazy"
                          quality={65}
                          unoptimized={!testimonial.avatar || testimonial.avatar.includes("googleusercontent.com") || testimonial.avatar.includes("ui-avatars.com")}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              testimonial.name
                            )}&background=0D8ABC&color=fff&size=48`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2 line-clamp-3">
                          "{testimonial.quote}"
                        </p>
                        <p className="text-gray-600 text-sm font-medium">
                          – {testimonial.name}, {testimonial.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Navigation dots */}
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: Math.max(1, testimonials.length - testimonialsPerView + 1) }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTestimonialIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={testimonialIndex === i}
                  className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1"
                >
                  <span
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      testimonialIndex === i
                        ? "w-8 bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md"
                        : "w-2.5 bg-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        <BankingPartnersCarousel bankingPartners={bankingPartners} />
      </section>
    );
  }

  // Non-home page (banner carousel)
  if (isLoading) {
    return (
      <section className="relative overflow-hidden min-h-[50vh] bg-gray-100 flex items-center justify-center pt-20">
        <div className="text-lg">Loading...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative overflow-hidden min-h-[50vh] bg-red-50 flex items-center justify-center pt-20">
        <div className="text-red-600 text-center p-4 max-w-md">
          <p className="font-medium">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (banners.length === 0) {
    return (
      <section
        className={`relative overflow-hidden ${
          page === "home" ? "min-h-screen" : "min-h-[16vh]"
        } flex items-center justify-center bg-blue-600 pt-20`}
      >
        <div className="text-center text-white p-6">
          <h1 className="text-4xl font-bold">{title || "EzyLoan"}</h1>
          {subtitle && <p className="text-xl mt-2">{subtitle}</p>}
        </div>
      </section>
    );
  }

  return (
    <section
      id={page === "home" ? "home" : undefined}
      className={`relative overflow-hidden pt-0 ${
        page === "home"
          ? "min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50"
          : "min-h-[16vh]"
      }`}
      suppressHydrationWarning
    >
      <div className="w-full relative z-10">
        <div
          className={`max-w-[85rem] mx-auto lg:px-0 ${
            page === "home" ? "px-[10px]" : ""
          }`}
        >
          <div
            className="relative w-full h-[60vh] md:min-h-[460px] md:h-[45vh] sm:h-[70vh] max-sm:h-[142px] rounded-2xl overflow-hidden shadow-lg"
            style={{ minHeight: "142px" }}
          >
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 1200px"
                  quality={75}
                  loading={index === 0 ? "eager" : "lazy"}
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 min-w-[44px] min-h-[44px]"
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 min-w-[44px] min-h-[44px]"
                  aria-label="Next slide"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {page === "home" && <BankingPartnersCarousel bankingPartners={[]} />}
    </section>
  );
};

export default HeroSection;