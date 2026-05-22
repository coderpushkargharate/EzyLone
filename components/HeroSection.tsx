"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import axios from "axios";
import Image from "next/image";
import {
  Clock, Percent, Shield, Star, Phone, CheckCircle, User,
  ChevronDown, ArrowRight, ExternalLink, Mail, CreditCard,
  Car, Home, Briefcase, Building, Truck, RefreshCw, Plus, X,
} from "lucide-react";

// ==================== TYPES ====================
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

// ==================== CONSTANTS ====================
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

const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST || "http://127.0.0.1:3001";
const FALLBACK_BANNER = "/fallback-banner.jpg";
const EMAIL_PATTERN = "[a-z0-9._%+\\-]+@[a-z0-9.\\-]+\\.[a-z]{2,}$";
const PHONE_PATTERN = "[0-9]{10,13}";

// ==================== LoanTypeDropdown ====================
const LoanTypeDropdown = memo(({
  isOpen, onClose, onSelect, selectedLoan, isMobile,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (loanType: string) => void;
  selectedLoan: string;
  isMobile: boolean;
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", handleEscape, { passive: false });
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !isMobile) return;
    // ✅ FIX: Read scrollY BEFORE locking to avoid forced reflow during render
    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [isOpen, isMobile]);

  const handleLoanSelect = useCallback((loanType: string) => {
    onSelect(loanType);
    onClose();
  }, [onSelect, onClose]);

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-[9998] touch-none"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
          aria-hidden="true"
        />
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
          style={{ marginTop: "-120px" }}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col max-h-[70vh] border border-gray-100 pointer-events-auto overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Select loan type"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10 flex-shrink-0">
              <h3 className="text-base font-semibold text-gray-900">Select Loan Type</h3>
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClose(); }}
                className="p-2 hover:bg-gray-100 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close dropdown"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 pb-4" style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
              <div className="space-y-3 py-2">
                {LOAN_TYPES.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.group} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-2.5 px-1 py-2 mb-2">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{group.group}</span>
                        {group.isHighlighted && (
                          <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Popular</span>
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
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLoanSelect(loan.value); }}
                              onTouchStart={(e) => e.stopPropagation()}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 border-2 min-h-[44px] ${
                                isSelected ? `${group.bgColor} border-blue-500` : "bg-white border-transparent hover:border-gray-200"
                              }`}
                              aria-pressed={isSelected}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-white" : `bg-gradient-to-br ${group.color}`}`}>
                                <LoanIcon className={`w-5 h-5 ${isSelected ? group.iconColor : "text-white"}`} />
                              </div>
                              <span className={`text-sm font-medium flex-1 ${isSelected ? "text-gray-900" : "text-gray-700"}`}>{loan.label}</span>
                              {isSelected && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
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
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${group.color} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">{group.group}</span>
                {group.isHighlighted && (
                  <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">Popular</span>
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
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLoanSelect(loan.value); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 border-2 min-h-[44px] ${
                        isSelected ? `${group.bgColor} border-blue-500` : "bg-white border-transparent hover:border-gray-200"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-white" : `bg-gradient-to-br ${group.color}`}`}>
                        <LoanIcon className={`w-4 h-4 ${isSelected ? group.iconColor : "text-white"}`} />
                      </div>
                      <span className={`text-sm font-medium flex-1 ${isSelected ? "text-gray-900" : "text-gray-700"}`}>{loan.label}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />}
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
});
LoanTypeDropdown.displayName = "LoanTypeDropdown";

// ==================== BankingPartnersCarousel ====================
const BankingPartnersCarousel = memo(({ bankingPartners }: { bankingPartners: Array<{ name: string; logo: string }> }) => {
  const itemWidth = 160;
  const itemGap = 24;
  const itemTotal = itemWidth + itemGap;
  const scrollDistance = itemTotal * bankingPartners.length;

  if (bankingPartners.length === 0) return null;

  return (
    <div className="w-full px-4 py-5 lg:py-7">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-4 mb-2 md:mb-4">
          <div className="h-[2px] w-16 md:w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          <h2 className="text-base md:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            Trusted Banking &amp; NBFC Partners
          </h2>
          <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        </div>
        <div className="relative overflow-hidden py-2 lg:py-4">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            @keyframes partner-scroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-${scrollDistance}px); }
            }
            .partner-scroll-track { animation: partner-scroll 40s linear infinite; }
            @media (max-width: 1023px) {
              .partner-scroll-track { animation-duration: 80s !important; }
            }
            @media (hover: hover) {
              .partner-scroll-track:hover { animation-play-state: paused; }
            }
          `}</style>
          <div
            className="flex scrollbar-hide partner-scroll-track"
            style={{ width: `${itemTotal * bankingPartners.length * 2}px`, willChange: "transform" }}
          >
            {[...bankingPartners, ...bankingPartners].map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 flex items-center justify-center"
                style={{ width: `${itemWidth}px`, marginRight: `${itemGap}px` }}
              >
                <div className="w-40 h-20 bg-white/70 rounded-xl p-1 flex items-center justify-center border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                    loading="lazy"
                    width={120}
                    height={60}
                    quality={70}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-white/50 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white/50 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
});
BankingPartnersCarousel.displayName = "BankingPartnersCarousel";

// ==================== HeroSection ====================
const HeroSection: React.FC<HeroProps> = ({ page, title, subtitle }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phoneNumber: "", loanType: "", loanAmount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [currentTestimonialMobile, setCurrentTestimonialMobile] = useState(0);
  const [currentTestimonialDesktop, setCurrentTestimonialDesktop] = useState(0);

  useEffect(() => {
    // ✅ FIX: Check mobile on mount without causing reflow during render
    const checkMobile = () => setIsMobileView(window.innerWidth < 1024);
    checkMobile();
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkMobile, 150);
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => { clearTimeout(resizeTimeout); window.removeEventListener("resize", handleResize); };
  }, []);

  // Restore body scroll on unmount (safety net)
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const testimonials = useMemo<Testimonial[]>(() => [
    { name: "satyajit sethy", location: "Cuttack", quote: "Good organization.give good behaviour like friendly with all.", avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXmOhlXiVFoZDdhkdBgzVx1-U8UxBq3QpSc7IG69R7EoGjagyScag=s36-c-rp-mo-br100", rating: 5 },
    { name: "Rohan kumar Rout", location: "Bhubaneswar", quote: "Best service provide ❤️", avatar: "https://lh3.googleusercontent.com/a-/ALV-UjWi-Km3_8HDuoTJPHAcJ3dcomr165YhJ8jSY2IAoeKqCHDCT9MX=s36-c-rp-mo-br100", rating: 5 },
    { name: "Yashwant Mohanta", location: "Puri", quote: "Best financial advisor", avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXvxKlE3JqPL6xmUQrZOXOParG_0U-AslDgJVLfUE-Mbvyn6V1-=s36-c-rp-mo-br100", rating: 5 },
    { name: "Hota suresh", location: "Bhubaneswar", quote: "The best DSA in used car loan", avatar: "https://lh3.googleusercontent.com/a-/ALV-UjXw7b9Ef8vaGhQdWjsmvQwiGjT5-DRvtdme0eSc9Nn9y83e9Gmd=s36-c-rp-mo-ba2-br100", rating: 5 },
    { name: "Namita Das", location: "Puri", quote: "Best place for financial need.", avatar: "https://lh3.googleusercontent.com/a/ACg8ocK83OxpRRHcbJ0NEVzhbhl3wAEzrWjyCj-gj7hyBNFY9pkf8g=s36-c-rp-mo-br100", rating: 5 },
  ], []);

  const getValidImageUrl = useCallback((url: string): string => {
    if (!url?.trim()) return FALLBACK_BANNER;
    const trimmed = url.trim();
    if (trimmed.startsWith("/") && SERVER_HOST && !trimmed.startsWith("//"))
      return `${SERVER_HOST.replace(/\/+$/, "")}${trimmed}`;
    if (trimmed.startsWith("//")) return `https:${trimmed}`;
    return trimmed;
  }, []);

  const bankLogos = useMemo(() => [
    "/banks/AU-Small-Finance-Bank.webp", "/banks/Axis_Bank_logo.svg.webp", "/banks/Bajaj-Finsery-Logo.webp",
    "/banks/chola-logo-removebg-preview.webp", "/banks/Tata-Capital.webp", "/banks/HDB.webp", "/banks/boi.webp",
    "/banks/Hero-Fincorp.webp", "/banks/ICICI-Bank-logo.webp", "/banks/IDFC-logo.webp", "/banks/Kotak_Mahindra_Bank_logo.webp",
    "/banks/Mahindra_Finance_Logo.webp", "/banks/Piramal-Logo.webp", "/banks/esaf-seeklogo.webp",
    "/banks/aditya_birla_camptal-removebg-preview.webp", "/banks/download-removebg-preview.webp",
    "/banks/dcb_bank-removebg-preview.webp", "/banks/Poonamwalla-Fincorp-removebg-preview.webp",
  ], []);

  const bankingPartners = useMemo(
    () => bankLogos.map((logo, index) => ({ name: `Bank Partner ${index + 1}`, logo })),
    [bankLogos]
  );

  useEffect(() => {
    if (page === "home") { setIsLoading(false); return; }
    if (!SERVER_HOST) { setError("Backend URL not configured"); setIsLoading(false); return; }
    let isMounted = true;
    const fetchBanners = async () => {
      try {
        setIsLoading(true); setError(null);
        const response = await axios.get(`${SERVER_HOST}/api/banners?page=${encodeURIComponent(page)}`);
        if (!isMounted) return;
        const validBanners = (response.data || [])
          .filter((b: Banner) => b.isActive && b.image?.trim())
          .map((b: Banner) => ({ ...b, image: getValidImageUrl(b.image) }));
        setBanners(validBanners);
      } catch (err: unknown) {
        if (!isMounted) return;
        const axiosErr = err as { response?: { status: number } };
        setError(axiosErr.response?.status === 404 ? "Banners not found" : "Failed to load banners");
        setBanners([]);
      } finally { if (isMounted) setIsLoading(false); }
    };
    fetchBanners();
    return () => { isMounted = false; };
  }, [page, getValidImageUrl]);

  useEffect(() => { setCurrentSlide(0); }, [banners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const i = setInterval(() => setCurrentSlide((p) => (p + 1) % banners.length), 4000);
    return () => clearInterval(i);
  }, [banners.length]);

  useEffect(() => {
    if (page !== "home") return;
    const i = setInterval(() => setCurrentTestimonialMobile((p) => (p + 1) % testimonials.length), 5000);
    return () => clearInterval(i);
  }, [page, testimonials.length]);

  useEffect(() => {
    if (page !== "home") return;
    const visible = 3;
    const max = Math.max(0, testimonials.length - visible);
    const i = setInterval(() => setCurrentTestimonialDesktop((p) => (p + 1 > max ? 0 : p + 1)), 4000);
    return () => clearInterval(i);
  }, [page, testimonials.length]);

  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = "Full name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Valid email required";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    else if (!/^[0-9]{10,13}$/.test(formData.phoneNumber.replace(/[\s-]/g, "")))
      errors.phoneNumber = "Valid 10-digit number required";
    if (!formData.loanType) errors.loanType = "Select loan type";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { setSubmitMessage({ type: "error", text: "Please correct errors above" }); return; }
    setIsSubmitting(true); setSubmitMessage(null); setFormErrors({});
    try {
      const response = await axios.post(
        `${SERVER_HOST}/api/contacts`,
        { ...formData, page: page === "home" ? "home" : page, source: "hero_form", timestamp: new Date().toISOString() },
        { headers: { "Content-Type": "application/json" }, timeout: 15000 }
      );
      if (response.data.success || response.status === 200 || response.status === 201) {
        setSubmitMessage({ type: "success", text: "Thank you! We will contact you shortly." });
        setFormData({ fullName: "", email: "", phoneNumber: "", loanType: "", loanAmount: "" });
        if (typeof window !== "undefined" && (window as Window & { gtag?: Function }).gtag) {
          (window as Window & { gtag?: Function }).gtag!("event", "conversion", { send_to: "AW-18024243962/your_conversion_label" });
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setSubmitMessage({ type: "error", text: axiosErr.response?.data?.error || "Something went wrong. Please try again." });
    } finally { setIsSubmitting(false); }
  }, [formData, validateForm, page]);

  const handleLoanTypeSelect = useCallback((loanType: string) => {
    setFormData((prev) => ({ ...prev, loanType }));
    if (formErrors.loanType) setFormErrors((prev) => { const n = { ...prev }; delete n.loanType; return n; });
  }, [formErrors.loanType]);

  const toggleLoanDropdown = useCallback(() => setIsLoanDropdownOpen((p) => !p), []);
  const nextSlide = useCallback(() => banners.length > 1 && setCurrentSlide((p) => (p + 1) % banners.length), [banners.length]);
  const prevSlide = useCallback(() => banners.length > 1 && setCurrentSlide((p) => (p - 1 + banners.length) % banners.length), [banners.length]);

  const GOOGLE_REVIEW_LINK = "https://www.google.com/search?q=ezyloan#cobssid=s";

  useEffect(() => {
    if (!isLoanDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-loan-dropdown-trigger]") && !target.closest('[role="dialog"]')) {
        setIsLoanDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isLoanDropdownOpen]);

  const getSelectedLoanLabel = useCallback(
    (value: string) => LOAN_TYPES.flatMap((g) => g.types).find((t) => t.value === value)?.label,
    []
  );

  const getSelectedLoanIcon = useCallback((value: string) => {
    const sg = LOAN_TYPES.find((g) => g.types.some((t) => t.value === value));
    const sl = sg?.types.find((t) => t.value === value);
    return sl?.icon || CreditCard;
  }, []);

  const getLoanBtnClassName = useCallback((hasLoanType: boolean, hasError: boolean, isOpen: boolean, size: "sm" | "lg") => {
    const base = size === "sm"
      ? "w-full pl-8 pr-9 py-2 rounded-lg bg-white/95 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs border transition-all duration-200"
      : "w-full pl-10 pr-10 py-3 rounded-lg bg-white/95 text-left focus:outline-none focus:ring-2 focus:ring-blue-400 text-base border transition-all duration-200";
    const colorClass = hasLoanType ? "border-blue-300 text-gray-900" : "border-gray-200 text-gray-500";
    const errorClass = hasError ? "ring-2 ring-red-400 border-red-300" : "";
    const openClass = isOpen ? "ring-2 ring-blue-400 border-blue-400" : "";
    return [base, colorClass, errorClass, openClass].filter(Boolean).join(" ");
  }, []);

  // ==================== HOME PAGE ====================
  if (page === "home") {
    return (
      <section
        className="hero-section relative bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-16 sm:pt-20 lg:pt-24 pb-6 overflow-hidden"
        style={{ contentVisibility: "auto" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/10 rounded-full blur-xl lg:blur-2xl" />
          <div className="absolute top-40 -right-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-xl lg:blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* 📱 MOBILE HERO */}
          <div className="lg:hidden">
            {/*
              ✅ FIX CLS: Added explicit aspect-ratio / minHeight so the container
              doesn't reflow when the image loads. Previously this caused a 0.776 CLS score.
              The container now reserves space upfront via aspect-ratio.
            */}
            <div
              className="relative mt-5 rounded-2xl overflow-hidden mb-6 shadow-xl border border-gray-100/50"
              style={{ minHeight: "280px", aspectRatio: "4/3" }}
            >
              <div className="absolute inset-0">
                <Image
                  src="/homebanner/image1.webp"
                  alt="Car Loan - Get approved in 24 hours in Odisha"
                  className="object-contain object-right"
                  priority
                  fetchPriority="high"
                  fill
                  /*
                    ✅ FIX LCP: Lighthouse reported image was 640x960 but displayed at 356x535.
                    The sizes attribute now correctly tells the browser the actual display size
                    so it fetches the right optimized size (384w) rather than over-fetching 640w.
                  */
                  sizes="(max-width: 480px) 320px, (max-width: 768px) 384px, 640px"
                  quality={75}
                  loading="eager"
                />
              </div>
              <div className="relative z-10 p-4 sm:p-5">
                <h1 className="text-2xl sm:text-4xl font-bold w-75 text-gray-900 leading-tight mb-2">
                  <span>Get Loan Approved in </span>
                  <span className="text-blue-600">24 Hours in Odisha</span>
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-600 mb-3">
                  *Subject to eligibility &amp; document verification
                </p>
                <div className="flex items-center space-x-1.5 bg-green-50/80 w-fit px-2.5 py-1.5 rounded-full">
                  <CheckCircle className="w-3.5 h-3.5 text-green-800" />
                  <span className="font-semibold text-[11px] sm:text-xs text-gray-800">LOAN APPROVED IN 24 HOURS*</span>
                </div>
                <div className="flex flex-col gap-1.5 mt-3 text-[11px] sm:text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700">Hassle-free process</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                    <span className="text-gray-700">Low interest rates</span>
                  </div>
                </div>
                <p className="text-gray-700 font-medium text-[11px] sm:text-xs mt-2">✅ No hidden charges</p>
                <div className="grid grid-cols-3 gap-1.5 mt-3 w-72">
                  {[
                    { icon: Clock, label: "Quick Approval" },
                    { icon: Percent, label: "Lowest Rates" },
                    { icon: Shield, label: "100% Secure" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="text-center p-2 bg-white/60 rounded-lg border border-gray-100/50">
                      <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-800 leading-tight">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Form */}
            <div className="w-full bg-gradient-to-r from-blue-600/95 to-cyan-500/95 rounded-2xl p-3 sm:p-4 text-white shadow-2xl border border-white/30 relative" data-loan-dropdown>
              <div className="text-center mb-3">
                <p className="text-sm font-bold mb-0.5">
                  <span>Check Eligibility in </span>
                  <span className="text-orange-400">30 Sec</span>
                </p>
              </div>
              {submitMessage && (
                <div className={`mb-2 p-2 rounded-lg text-xs text-center ${submitMessage.type === "success" ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
                  {submitMessage.text}
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="space-y-2.5" noValidate>
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative col-span-1">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Name *"
                      value={formData.fullName}
                      onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); if (formErrors.fullName) setFormErrors((p) => { const n = { ...p }; delete n.fullName; return n; }); }}
                      className={`w-full pl-8 pr-2 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs${formErrors.fullName ? " ring-2 ring-red-400" : ""}`}
                      required
                      disabled={isSubmitting}
                      autoComplete="name"
                    />
                  </div>
                  <div className="relative col-span-1">
                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email *"
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
                      className={`w-full pl-8 pr-2 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs${formErrors.email ? " ring-2 ring-red-400" : ""}`}
                      required
                      disabled={isSubmitting}
                      autoComplete="email"
                      pattern={EMAIL_PATTERN}
                    />
                  </div>
                </div>
                {(formErrors.fullName || formErrors.email) && (
                  <div className="flex flex-col gap-0.5">
                    {formErrors.fullName && <p className="text-red-300 text-[9px] ml-1">{formErrors.fullName}</p>}
                    {formErrors.email && <p className="text-red-300 text-[9px] ml-1">{formErrors.email}</p>}
                  </div>
                )}
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Phone Number *"
                    value={formData.phoneNumber}
                    onChange={(e) => { const cleaned = e.target.value.replace(/\D/g, "").slice(0, 13); setFormData((prev) => ({ ...prev, phoneNumber: cleaned })); if (formErrors.phoneNumber) setFormErrors((p) => { const n = { ...p }; delete n.phoneNumber; return n; }); }}
                    className={`w-full pl-8 pr-3 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs${formErrors.phoneNumber ? " ring-2 ring-red-400" : ""}`}
                    required
                    disabled={isSubmitting}
                    inputMode="tel"
                    autoComplete="tel"
                    pattern={PHONE_PATTERN}
                  />
                  {formErrors.phoneNumber && <p className="text-red-300 text-[9px] mt-0.5 ml-1">{formErrors.phoneNumber}</p>}
                </div>
                <div className="relative">
                  <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Loan Amount (Optional)"
                    value={formData.loanAmount}
                    onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs"
                    disabled={isSubmitting}
                    inputMode="numeric"
                  />
                </div>
                <div className="space-y-0.5 relative" data-loan-dropdown-trigger>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={toggleLoanDropdown}
                      className={getLoanBtnClassName(!!formData.loanType, !!formErrors.loanType, isLoanDropdownOpen, "sm")}
                      disabled={isSubmitting}
                      aria-haspopup="listbox"
                      aria-expanded={isLoanDropdownOpen}
                    >
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                        {formData.loanType
                          ? (() => { const Icon = getSelectedLoanIcon(formData.loanType); return <Icon className="h-3.5 w-3.5 text-gray-600" />; })()
                          : <CreditCard className="h-3.5 w-3.5 text-gray-400" />}
                      </div>
                      <span className="block truncate pr-4">
                        {formData.loanType ? getSelectedLoanLabel(formData.loanType) : "Select loan type"}
                      </span>
                      <ChevronDown className={`absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 transition-transform duration-200${isLoanDropdownOpen ? " rotate-180" : ""}`} />
                    </button>
                  </div>
                  {formErrors.loanType && <p className="text-red-300 text-[9px] mt-0.5 ml-1">{formErrors.loanType}</p>}
                  <LoanTypeDropdown
                    isOpen={isLoanDropdownOpen}
                    onClose={() => setIsLoanDropdownOpen(false)}
                    onSelect={handleLoanTypeSelect}
                    selectedLoan={formData.loanType}
                    isMobile={isMobileView}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 font-bold py-2 rounded-lg transition-all duration-300 cursor-pointer disabled:opacity-50 text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white min-h-[44px] hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Check Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center space-x-1 text-[10px] text-green-300">
                  <Shield className="w-3 h-3" />
                  <span>Your details are 100% safe.</span>
                </div>
              </form>
            </div>
          </div>

          {/* 💻 DESKTOP HERO */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 mt-5 lg:items-start">
            <div className="space-y-6 text-left">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                <span>Get Loan Approved in </span>
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  24 Hours in Odisha
                </span>
              </h1>
              <p className="text-sm text-gray-500 -mt-2">*Subject to eligibility &amp; document verification</p>
              <div className="flex items-center space-x-2 bg-green-50/70 w-fit px-4 py-2 rounded-full border border-green-200/50">
                <CheckCircle className="w-5 h-5 text-green-800" />
                <span className="font-semibold text-sm text-green-800">LOAN APPROVED IN 24 HOURS*</span>
              </div>
              <div className="flex flex-wrap gap-6 text-sm">
                {["Hassle-free process", "Low interest rates"].map((item) => (
                  <div key={item} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-700 font-medium flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-800" />
                <span>No hidden charges</span>
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Clock, label: "Quick Approval" },
                  { icon: Percent, label: "Lowest Interest Rates" },
                  { icon: Shield, label: "100% Secure Process" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center p-4 bg-white/70 rounded-xl shadow-sm border border-white/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-[600px]">
              {/*
                ✅ FIX LCP: Desktop banner image — reserve space explicitly via
                width/height props and use correct sizes so the browser fetches
                the right optimized variant.
              */}
              <div className="absolute right-100  w-120 z-10" style={{ left:"-16rem", top:"-6.80rem" }}>
                <Image
                  src="/homebanner/bannerimg.webp"
                  alt="Car Loan illustration"
                  className="w-full h-auto object-contain"
                  priority
                  fetchPriority="high"
                  loading="eager"
                  width={460}
                  height={345}
                  quality={75}
                  sizes="(min-width: 1024px) 460px, 100vw"
                />
              </div>

              {/* Desktop Form */}
              <div className="absolute  lg:top-[-30px] w-100 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 py-4 text-white shadow-2xl z-20 border border-white/30" style={{ right:"0.30rem"}}>
                <div className="text-center mb-4">
                  <p className="text-lg font-bold">
                    <span>Check Your Loan Eligibility in </span>
                    <span className="text-orange-400">30 Sec</span>
                  </p>
                </div>
                {submitMessage && (
                  <div className={`mb-4 p-3 rounded-lg text-sm text-center ${submitMessage.type === "success" ? "bg-green-500/20 text-green-200" : "bg-red-500/20 text-red-200"}`}>
                    {submitMessage.text}
                  </div>
                )}
                <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); if (formErrors.fullName) setFormErrors((p) => { const n = { ...p }; delete n.fullName; return n; }); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base${formErrors.fullName ? " ring-2 ring-red-400" : ""}`}
                      required
                      disabled={isSubmitting}
                      autoComplete="name"
                    />
                    {formErrors.fullName && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.fullName}</p>}
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (formErrors.email) setFormErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base${formErrors.email ? " ring-2 ring-red-400" : ""}`}
                      required
                      disabled={isSubmitting}
                      autoComplete="email"
                      pattern={EMAIL_PATTERN}
                    />
                    {formErrors.email && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.email}</p>}
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phoneNumber}
                      onChange={(e) => { const cleaned = e.target.value.replace(/\D/g, "").slice(0, 13); setFormData((prev) => ({ ...prev, phoneNumber: cleaned })); if (formErrors.phoneNumber) setFormErrors((p) => { const n = { ...p }; delete n.phoneNumber; return n; }); }}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base${formErrors.phoneNumber ? " ring-2 ring-red-400" : ""}`}
                      required
                      disabled={isSubmitting}
                      inputMode="tel"
                      autoComplete="tel"
                      pattern={PHONE_PATTERN}
                    />
                    {formErrors.phoneNumber && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.phoneNumber}</p>}
                  </div>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Loan Amount (Optional)"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/95 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
                      disabled={isSubmitting}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2 relative" data-loan-dropdown-trigger>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={toggleLoanDropdown}
                        className={getLoanBtnClassName(!!formData.loanType, !!formErrors.loanType, isLoanDropdownOpen, "lg")}
                        disabled={isSubmitting}
                        aria-haspopup="listbox"
                        aria-expanded={isLoanDropdownOpen}
                      >
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {formData.loanType
                            ? (() => { const Icon = getSelectedLoanIcon(formData.loanType); return <Icon className="h-5 w-5 text-gray-600" />; })()
                            : <CreditCard className="h-5 w-5 text-gray-400" />}
                        </div>
                        <span className="block truncate">
                          {formData.loanType ? getSelectedLoanLabel(formData.loanType) : "Select a loan type"}
                        </span>
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 transition-transform duration-200${isLoanDropdownOpen ? " rotate-180" : ""}`} />
                      </button>
                    </div>
                    {formErrors.loanType && <p className="text-red-300 text-xs mt-1 ml-1">{formErrors.loanType}</p>}
                    <LoanTypeDropdown
                      isOpen={isLoanDropdownOpen}
                      onClose={() => setIsLoanDropdownOpen(false)}
                      onSelect={handleLoanTypeSelect}
                      selectedLoan={formData.loanType}
                      isMobile={isMobileView}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 text-base bg-gradient-to-r from-orange-500 to-amber-500 text-white min-h-[44px] hover:from-orange-600 hover:to-amber-600 active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Check Eligibility Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-300">
                    <Shield className="w-4 h-4" />
                    <span>Your details are 100% safe with us.</span>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Google Review Badge */}
          <div className="max-w-7xl px-4 sm:px-6 lg:px-0 mt-5 lg:mt-[-140px] w-full">
            <a href={GOOGLE_REVIEW_LINK} target="_blank" rel="noopener noreferrer" className="block w-full">
              <div className="bg-white/70 rounded-2xl p-4 lg:py-0 sm:p-6 shadow-lg border border-white/50 w-full hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
                  <p className="text-gray-800 font-semibold text-center sm:text-left text-sm sm:text-base">
                    Trusted by 10,000+ Customers Across Odisha
                  </p>
                  <div className="flex items-center space-x-2 sm:space-x-3 bg-white/60 rounded-lg px-3 sm:px-4 py-2 lg:py-2 group-hover:bg-blue-50/60 transition-colors border border-white/50">
                    <span className="text-lg sm:text-xl font-bold text-blue-600">Google</span>
                    <div className="flex items-center">
                      <span className="font-bold text-gray-800 mr-1 sm:mr-2 text-sm sm:text-base">4.8</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />)}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          </div>

          {/* Testimonials */}
          <div className="max-w-7xl px-4 sm:px-6 lg:px-0 mt-5 w-full">
            {/* Mobile */}
            <div className="lg:hidden relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out will-change-transform"
                style={{ transform: `translateX(-${currentTestimonialMobile * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-2">
                    <div className="flex items-start gap-4 bg-white/70 rounded-xl py-5 shadow-sm border border-white/50">
                      <div className="flex-shrink-0">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/60"
                          loading="lazy"
                          width={56}
                          height={56}
                          quality={70}
                          unoptimized={testimonial.avatar.includes("googleusercontent.com")}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=56`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2">"{testimonial.quote}"</p>
                        <p className="text-gray-600 text-sm font-medium">– {testimonial.name}, {testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden lg:block relative overflow-hidden">
              <div
                className="flex transition-transform duration-700 ease-in-out will-change-transform"
                style={{ transform: `translateX(-${currentTestimonialDesktop * (100 / 3)}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-1/3 flex-shrink-0 px-3">
                    <div className="flex items-start gap-4 bg-white/70 rounded-xl p-5 shadow-sm border border-white/50 h-full hover:shadow-md transition-shadow">
                      <div className="flex-shrink-0">
                        <Image
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/60"
                          loading="lazy"
                          width={56}
                          height={56}
                          quality={70}
                          unoptimized={testimonial.avatar.includes("googleusercontent.com")}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=0D8ABC&color=fff&size=56`;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
                          ))}
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed mb-2 line-clamp-3">"{testimonial.quote}"</p>
                        <p className="text-gray-600 text-sm font-medium">– {testimonial.name}, {testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <BankingPartnersCarousel bankingPartners={bankingPartners} />
      </section>
    );
  }

  // ==================== OTHER PAGES ====================
  if (isLoading) return (
    <section className="relative overflow-hidden min-h-[50vh] bg-gray-100 flex items-center justify-center pt-20">
      <div className="text-lg">Loading...</div>
    </section>
  );

  if (error) return (
    <section className="relative overflow-hidden min-h-[50vh] bg-red-50 flex items-center justify-center pt-20">
      <div className="text-red-600 text-center p-4 max-w-md">
        <p className="font-medium">⚠️ {error}</p>
        <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition">Retry</button>
      </div>
    </section>
  );

  if (banners.length === 0) return (
    <section className={`relative overflow-hidden ${page === "home" ? "min-h-screen" : "min-h-[16vh]"} flex items-center justify-center bg-blue-600 pt-20`}>
      <div className="text-center text-white p-6">
        <h1 className="text-4xl font-bold">{title || "EzyLoan"}</h1>
        {subtitle && <p className="text-xl mt-2">{subtitle}</p>}
      </div>
    </section>
  );

  return (
    <section
      id={page === "home" ? "home" : undefined}
      className={`relative overflow-hidden pt-0 ${page === "home" ? "min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50" : "min-h-[16vh]"}`}
    >
      {page === "home" && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-xl lg:blur-2xl" />
          <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-xl lg:blur-2xl" />
        </div>
      )}
      <div className="w-full relative z-10">
        <div className={`max-w-[85rem] mx-auto lg:px-0 ${page === "home" ? "px-[10px]" : ""}`}>
          <div
            className="relative w-full h-[60vh] md:min-h-[460px] md:h-[45vh] sm:h-[70vh] max-sm:h-[142px] rounded-2xl overflow-hidden shadow-lg"
            style={{ minHeight: "142px" }}
          >
            {banners.map((banner, index) => (
              <div
                key={banner._id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${currentSlide === index ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
              >
                <Image
                  src={banner.image}
                  alt={`Banner ${index + 1}`}
                  className="w-full h-full object-cover"
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  quality={75}
                  sizes="(max-width: 768px) 100vw, 1200px"
                  priority={index === 0}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
                <div className="absolute inset-0 bg-black/10" />
              </div>
            ))}

            {banners.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 transition min-w-[44px] min-h-[44px]" aria-label="Previous slide">‹</button>
                <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow flex items-center justify-center text-gray-700 transition min-w-[44px] min-h-[44px]" aria-label="Next slide">›</button>
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