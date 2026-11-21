'use client';

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

import { trackMetaLead } from "@/components/MetaPixel";
import { Truck, ArrowRight, ArrowLeft, Clock, FileText, AlertCircle, User, TrendingUp, CheckCircle,
  Building, Zap, Car, Info, Phone, Mail, MapPin, Lock, Handshake, ShieldCheck, Coins, ArrowLeftRight } from "lucide-react";

import { isIndianMobile } from "@/lib/phone";
import { useFormGuard } from "@/components/FormGuard";
import AdConsentCheckbox from "@/components/AdConsentCheckbox";
import { trackEvent } from "@/lib/analytics";
import { getAttributionPayload, newLeadEventId } from "@/lib/marketing/clientAttribution";
import LoanDisclosure from '@/components/LoanDisclosure';

const BASE_URL = 'https://www.ezyloan.co.in'; // ✅ Fixed: No trailing spaces

const ApplyNowPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: '',
    phoneNumber: "",
    loanType: "",
    employmentType: "",
    city: "",
    pincode: "",
    cibilScore: "",
    consent: false, // ✅ Added: Privacy consent checkbox
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  // Invisible spam guard (honeypot + signed form token).
  const { guardNode, getGuardPayload } = useFormGuard();
  // Optional ad-measurement consent (separate from the required data-processing consent).
  const [adConsent, setAdConsent] = useState(false);

  // 3-step wizard: 1 Personal, 2 Loan, 3 Credit Profile.
  const [step, setStep] = useState(1);

  const goNext = () => {
    const errs = validateForm(STEP_FIELDS[step - 1]);
    if (Object.keys(errs).length) {
      trackEvent('form_error', { form_id: 'apply_now', step });
      return;
    }
    setSubmitMessage('');
    setStep((s) => Math.min(3, s + 1));
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  // "Our Loan Solutions" tile → preselect loan type and bring the form into view.
  const pickLoanSolution = (value: string) => {
    setFormData((f) => ({ ...f, loanType: value }));
    document.getElementById('apply-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;

    // Phone is India-only: keep digits, drop a pasted 91/0 prefix, cap at 10.
    let nextValue: string = value;
    if (name === 'phoneNumber') {
      let d = value.replace(/\D/g, '');
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      nextValue = d.slice(0, 10);
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : nextValue,
    });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Client-side validation. With `only`, validates just those fields (one wizard step)
  // and keeps errors on other fields untouched.
  const validateForm = (only?: string[]) => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Mobile number is required';
    } else if (!isIndianMobile(formData.phoneNumber)) {
      errors.phoneNumber = 'Enter a valid Indian mobile number (10 digits, starting 6-9)';
    }
    if (!formData.loanType) errors.loanType = 'Please select a loan type';
    if (!formData.employmentType) errors.employmentType = 'Please select employment type';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = 'Valid 6-digit pincode is required';
    }
    if (!formData.cibilScore) errors.cibilScore = 'Please select your CIBIL range (or "Not Sure")';
    if (!formData.consent) errors.consent = 'You must consent to data processing';

    if (only) {
      const scoped: Record<string, string> = {};
      for (const k of only) if (errors[k]) scoped[k] = errors[k];
      setFormErrors((prev) => {
        const next = { ...prev };
        for (const k of only) delete next[k];
        return { ...next, ...scoped };
      });
      return scoped;
    }
    setFormErrors(errors);
    return errors;
  };

  // Submit Form Data to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enter on steps 1-2 advances instead of submitting.
    if (step < 3) {
      goNext();
      return;
    }

    const errs = validateForm();
    if (Object.keys(errs).length) {
      trackEvent('form_error', { form_id: 'apply_now' });
      // Jump back to the first step that has a problem.
      const bad = STEP_FIELDS.findIndex((fields) => fields.some((f) => errs[f]));
      if (bad >= 0) setStep(bad + 1);
      setSubmitMessage('❌ Please correct the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const guard = await getGuardPayload();
      const leadEventId = newLeadEventId();
      await axios.post('/api/loans', { ...formData, ...guard, adConsent, attribution: getAttributionPayload(leadEventId) }, {
        headers: { 'Content-Type': 'application/json' }
      });

      // ✅ Track conversion for Google Ads
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'submit_loan_application', {
          'event_category': 'conversion',
          'event_label': formData.loanType,
          'value': 1
        });
      }

      // ✅ Track conversion for Meta (Facebook) Pixel
      trackMetaLead({ content_name: formData.loanType, currency: 'INR', value: 1 }, leadEventId);
      trackEvent('submit_application', { form_id: 'apply_now', loan_type: formData.loanType });

      // ✅ Redirect to Thank You page after successful submission
      router.push("/ThankYouPage");

    } catch (error) {
      const serverMsg = axios.isAxiosError(error) && error.response && error.response.status < 500
        ? error.response.data?.message
        : undefined;
      setSubmitMessage(
        typeof serverMsg === "string" && serverMsg
          ? `❌ ${serverMsg}`
          : "❌ Sorry, there was an error submitting your application. Please try again or contact us at care@ezyloan.co.in."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Structured data for SEO (FinancialProduct schema) - Fixed trailing spaces
  const loanApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    "name": "Loan Application - EzyLoan",
    "description": "Apply for personal loans, car loans, home loans, business loans and more with EzyLoan. Interest rates* 10%-28% p.a., tenure 12-60 months. *Subject to lender approval and credit assessment.",
    "applicationCategory": "FinancialLoan",
    "offers": {
      "@type": "Offer",
      "businessFunction": "ProvideLoan",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "priceCurrency": "INR",
        "price": "0",
        "description": "No upfront fees. Processing fees* charged by lender upon approval."
      },
      "eligibleRegion": {
        "@type": "Country",
        "name": "India"
      }
    },
    "provider": {
      "@type": "FinancialService",
      "name": "EzyLoan (Dibyansh Associates)",
      "url": BASE_URL,
      "telephone": "+91-6372977626",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-6372977626",
        "contactType": "Customer Service",
        "areaServed": "IN",
        "availableLanguage": ["English", "Hindi"]
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur",
        "addressLocality": "Cuttack",
        "postalCode": "753011",
        "addressRegion": "Odisha",
        "addressCountry": "IN"
      }
    },
    "areaServed": "IN",
    "availableLanguage": ["English", "Hindi"],
    "loanTerm": {
      "@type": "QuantitativeValue",
      "minValue": 12,
      "maxValue": 60,
      "unitText": "Months"
    },
    "interestRate": {
      "@type": "QuantitativeValue",
      "minValue": 10,
      "maxValue": 28,
      "unitText": "Percent"
    },
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Processing Fee",
        "value": "Up to 3% of loan amount*"
      },
      {
        "@type": "PropertyValue",
        "name": "Eligibility",
        "value": "Subject to credit assessment, income verification, and lender approval"
      },
      {
        "@type": "PropertyValue",
        "name": "Disclaimer",
        "value": "EzyLoan is a DSA, not a direct lender. Final terms determined by partner banks/NBFCs."
      }
    ]
  };

  // ✅ Benefits schema - Fixed trailing spaces + compliance language
  const benefitsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Swift Online Process*",
        "text": "Complete your application online in minutes. *Preliminary response within 24-48 hours; final approval subject to lender verification."
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Competitive Interest Rates*",
        "text": "Get rates tailored to your financial profile. *Actual rates determined by lender based on credit assessment."
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Minimal Documentation",
        "text": "Quick processing with essential documents only. Exact requirements vary by lender and loan type."
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Transparent Terms*",
        "text": "No hidden charges. All fees disclosed before acceptance. *Terms subject to lender policy."
      }
    ]
  };

  // ✅ LOAN DETAILS FOR GOOGLE ADS COMPLIANCE - Added asterisks
  const loanDetails = {
    interestRate: "10% – 28% p.a.*",
    processingFee: "Up to 3% of loan amount*",
    tenure: "12 – 60 months",
  };

  // ✅ EMI EXAMPLE CALCULATION - Required by Google Ads (Representative Example)
  const emiExample = {
    principal: 100000,
    rate: 14,
    tenureMonths: 36,
    emi: 3418,
    totalAmount: 123048,
  };

  // ✅ ELIGIBILITY CRITERIA - Added asterisks for variable criteria
  const eligibility = {
    age: "21 – 60 years",
    income: "₹15,000+ per month*",
    employment: "Salaried / Self-employed",
  };

  return (
    <>

      {/* ✅ Structured Data for SEO - Fixed trailing spaces */}
      <Script
        id="loan-application-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(loanApplicationSchema) }}
        strategy="afterInteractive"
      />
      <Script
        id="benefits-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(benefitsSchema) }}
        strategy="afterInteractive"
      />

      {/* ===========================================
          MAIN PAGE CONTENT - FULLY RESPONSIVE
          =========================================== */}
      <div 
        className="min-h-screen bg-gradient-to-br from-white bg-white via-blue-50/30 to-cyan-50/30 relative overflow-hidden"
        itemScope 
        itemType="https://schema.org/WebPage"
        role="main"
      >
        {/* Hero Image Section (banner) — hidden per request. Kept commented so it can be restored later. */}
        {/*
        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-20 sm:pt-20 lg:pt-24 xl:pt-28">
          <div className="relative mb-8 sm:mb-10 lg:mb-12 xl:mb-16 overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl mt-8">
            <HeroSection
              page="apply"
              title="Apply for Loan"
              subtitle="Quick processing* • Subject to approval"
            />
          </div>
        </div>
        */}

        {/* ===== HERO + 3-STEP APPLICATION (mockup design) ===== */}
        <section className="relative pt-[84px] sm:pt-24 lg:pt-28 pb-8 sm:pb-12 bg-gradient-to-b from-[#e6f0ff] via-[#f3f8ff] to-white overflow-hidden">
          <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,500px)] gap-5 lg:gap-12 items-start">

              {/* Left: headline, car, trust badges */}
              <div className="lg:pt-4">
                {/* Banner: text on the left, car on the right (overlapping on mobile like the mockup) */}
                <div className="relative min-h-[178px] sm:min-h-[250px] lg:min-h-0">
                  <div className="relative z-10 w-[56%] sm:w-[55%] lg:w-full pt-3 sm:pt-6 lg:pt-0">
                    <h1 className="text-[27px] leading-[1.08] sm:text-[42px] lg:text-[46px] xl:text-[52px] font-extrabold text-[#0b1b3f] tracking-tight">
                      Get the Right Car Finance with{' '}
                      <span className="bg-gradient-to-r from-[#1d5bf0] to-[#f7941d] bg-clip-text text-transparent italic pr-1">EzyLoan</span>
                    </h1>
                    <ul className="mt-2.5 sm:mt-4 space-y-0.5 sm:space-y-1 text-[12px] sm:text-[15px] lg:text-base text-[#1e3a8a] font-medium lg:flex lg:flex-wrap lg:gap-x-4 lg:space-y-0">
                      {['Simple Application', 'Quick Response*', 'Trusted Lending Partners'].map((t) => (
                        <li key={t} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f7941d] shrink-0" aria-hidden="true" />{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <img
                    src="/apply-hero-car.webp"
                    alt="Blue SUV — car finance with EzyLoan"
                    width={466}
                    height={253}
                    className="absolute top-2 -right-4 sm:right-0 w-[60%] sm:w-[55%] h-auto lg:static lg:w-full lg:mt-6 lg:rounded-2xl"
                    style={{
                      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                      maskImage: 'linear-gradient(to right, transparent 0%, #000 28%)',
                    }}
                  />
                </div>

                {/* Trust badges: 2x2 on phones/laptops, 4 across on tablet & wide screens */}
                <div className="mt-3 sm:mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { icon: <Zap className="w-6 h-6 text-amber-500 fill-amber-400" />, text: <>Top-Up up to<br />200% of Car Value*</> },
                    { icon: <Clock className="w-6 h-6 text-blue-600" />, text: <>Quick &amp;<br />Digital Process</> },
                    { icon: <Handshake className="w-6 h-6 text-blue-600" />, text: <>Trusted<br />Partners</> },
                    { icon: <ShieldCheck className="w-6 h-6 text-white fill-green-600" />, text: <>Secure &amp;<br />Private</> },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white rounded-xl shadow-[0_4px_14px_rgba(30,64,175,0.10)] border border-blue-50 px-3 py-2.5 lg:px-4 lg:py-3">
                      <span className="shrink-0" aria-hidden="true">{b.icon}</span>
                      <span className="text-[12px] sm:text-[12.5px] lg:text-sm font-semibold text-[#0b1b3f] leading-tight">{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Right: Apply Now card */}
              <div id="apply-form" className="scroll-mt-28 bg-white rounded-2xl shadow-[0_10px_40px_rgba(30,64,175,0.12)] border border-blue-50 p-4 sm:p-6 lg:p-7">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-50 flex items-center justify-center shrink-0" aria-hidden="true">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b1b3f] leading-tight">Apply Now</h2>
                    <p className="text-sm sm:text-base text-gray-600">A simple 3-step application to get started</p>
                  </div>
                </div>

                {/* Stepper */}
                <ol className="mt-5 flex items-start justify-between" aria-label="Application steps">
                  {STEPS.map((label, i) => {
                    const n = i + 1;
                    const active = n === step;
                    const done = n < step;
                    return (
                      <React.Fragment key={label}>
                        <li className="flex flex-col items-center w-20 shrink-0" aria-current={active ? 'step' : undefined}>
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center text-base font-bold border-2 ${
                            active ? 'bg-blue-600 border-blue-600 text-white shadow-[0_0_0_4px_rgba(37,99,235,0.15)]'
                              : done ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-gray-100 border-gray-300 text-gray-700'
                          }`}>
                            {done ? <CheckCircle className="w-5 h-5" /> : n}
                          </span>
                          <span className={`mt-1 text-xs sm:text-sm text-center leading-tight ${active || done ? 'text-blue-700 font-semibold' : 'text-gray-600'}`}>
                            {label.split(' ')[0]}<br />{label.split(' ').slice(1).join(' ')}
                          </span>
                        </li>
                        {n < STEPS.length && (
                          <span className={`flex-1 h-0.5 mt-[18px] mx-1 rounded ${n < step ? 'bg-blue-600' : 'bg-gray-300'}`} aria-hidden="true" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </ol>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-base sm:text-lg font-bold text-blue-600">Step {step} of 3: {STEPS[step - 1]}</p>
                  <p className="text-base font-bold text-[#0b1b3f]">{Math.round((step / 3) * 100)}%</p>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-blue-100 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((step / 3) * 100)}>
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
                </div>

                <form
                  onSubmit={handleSubmit}
                  onFocusCapture={() => trackEvent("form_start", { form_id: "apply_now" }, { once: "form_start_apply" })}
                  className="mt-4 space-y-3"
                  noValidate
                  aria-label="Loan application form"
                >
                  {/* STEP 1 — Personal Details */}
                  <div className={step === 1 ? 'space-y-3' : 'hidden'}>
                    <Field label="Full Name" htmlFor="fullName" error={formErrors.fullName}>
                      <InputShell icon={<User className="w-5 h-5 text-gray-500" />} error={!!formErrors.fullName}>
                        <input id="fullName" type="text" name="fullName" autoComplete="name" value={formData.fullName} onChange={handleChange}
                          aria-required="true" aria-invalid={!!formErrors.fullName} placeholder="Enter your full name" className={INPUT_CLS} />
                      </InputShell>
                    </Field>
                    <Field label="Mobile Number" htmlFor="phoneNumber" error={formErrors.phoneNumber}>
                      <InputShell icon={<Phone className="w-5 h-5 text-gray-500" />} error={!!formErrors.phoneNumber}>
                        <span className="font-semibold text-gray-800 pr-3 select-none">+91</span>
                        <input id="phoneNumber" type="tel" name="phoneNumber" autoComplete="tel-national" value={formData.phoneNumber} onChange={handleChange}
                          inputMode="numeric" maxLength={10} pattern="[6-9][0-9]{9}" aria-required="true" aria-invalid={!!formErrors.phoneNumber}
                          placeholder="Enter 10-digit mobile number" className={INPUT_CLS} />
                      </InputShell>
                    </Field>
                    <Field label="Email Address" htmlFor="email" error={formErrors.email}>
                      <InputShell icon={<Mail className="w-5 h-5 text-gray-500" />} error={!!formErrors.email}>
                        <input id="email" type="email" name="email" autoComplete="email" value={formData.email} onChange={handleChange}
                          aria-required="true" aria-invalid={!!formErrors.email} placeholder="Enter your email address" className={INPUT_CLS} />
                      </InputShell>
                    </Field>
                  </div>

                  {/* STEP 2 — Loan Details */}
                  <div className={step === 2 ? 'space-y-3' : 'hidden'}>
                    <Field label="Loan Type" htmlFor="loanType" error={formErrors.loanType}>
                      <InputShell icon={<Car className="w-5 h-5 text-gray-500" />} error={!!formErrors.loanType}>
                        <select id="loanType" name="loanType" value={formData.loanType} onChange={handleChange}
                          aria-required="true" aria-invalid={!!formErrors.loanType} className={`${INPUT_CLS} bg-transparent`}>
                          <option value="">Select loan type</option>
                          {LOAN_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </InputShell>
                    </Field>
                    <Field label="Employment Type" htmlFor="employmentType" error={formErrors.employmentType}>
                      <InputShell icon={<Building className="w-5 h-5 text-gray-500" />} error={!!formErrors.employmentType}>
                        <select id="employmentType" name="employmentType" value={formData.employmentType} onChange={handleChange}
                          aria-required="true" aria-invalid={!!formErrors.employmentType} className={`${INPUT_CLS} bg-transparent`}>
                          <option value="">Select employment type</option>
                          <option value="salaried">Salaried</option>
                          <option value="self-employed">Self Employed</option>
                          <option value="business">Business Owner</option>
                          <option value="professional">Professional</option>
                          <option value="retired">Retired</option>
                        </select>
                      </InputShell>
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City" htmlFor="city" error={formErrors.city}>
                        <InputShell icon={<MapPin className="w-5 h-5 text-gray-500" />} error={!!formErrors.city}>
                          <input id="city" type="text" name="city" autoComplete="address-level2" value={formData.city} onChange={handleChange}
                            aria-required="true" aria-invalid={!!formErrors.city} placeholder="Your city" className={INPUT_CLS} />
                        </InputShell>
                      </Field>
                      <Field label="Pincode" htmlFor="pincode" error={formErrors.pincode}>
                        <InputShell error={!!formErrors.pincode}>
                          <input id="pincode" type="text" name="pincode" autoComplete="postal-code" inputMode="numeric" maxLength={6} value={formData.pincode} onChange={handleChange}
                            aria-required="true" aria-invalid={!!formErrors.pincode} placeholder="6-digit pincode" className={INPUT_CLS} />
                        </InputShell>
                      </Field>
                    </div>
                  </div>

                  {/* STEP 3 — Credit Profile */}
                  <div className={step === 3 ? 'space-y-3' : 'hidden'}>
                    <Field label="CIBIL Score Range" htmlFor="cibilScore" error={formErrors.cibilScore}>
                      <InputShell icon={<TrendingUp className="w-5 h-5 text-gray-500" />} error={!!formErrors.cibilScore}>
                        <select id="cibilScore" name="cibilScore" value={formData.cibilScore} onChange={handleChange}
                          aria-required="true" aria-invalid={!!formErrors.cibilScore} className={`${INPUT_CLS} bg-transparent`}>
                          <option value="">Select your CIBIL range</option>
                          <option value="300-549">300-549 (Poor)</option>
                          <option value="550-649">550-649 (Fair)</option>
                          <option value="650-749">650-749 (Good)</option>
                          <option value="750-900">750-900 (Excellent)</option>
                          <option value="not-sure">Not Sure</option>
                        </select>
                      </InputShell>
                    </Field>
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
                      Helps match you with suitable lenders. Final credit check is performed by the lender*.
                    </p>

                    <label className="flex items-start gap-2 cursor-pointer pt-1">
                      <input type="checkbox" name="consent" checked={formData.consent} onChange={handleChange}
                        aria-required="true" aria-invalid={!!formErrors.consent}
                        className="mt-0.5 w-4 h-4 shrink-0 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                      <span className="text-xs text-gray-600 leading-snug">
                        I consent to EzyLoan processing my personal data for loan facilitation and sharing it with partner lenders for assessment.
                        I agree to the <Link href="/privacy-policy" className="text-blue-600 underline">Privacy Policy</Link> and{' '}
                        <Link href="/terms-and-conditions" className="text-blue-600 underline">Terms</Link>. <span className="text-red-500">*</span>
                      </span>
                    </label>
                    {formErrors.consent && <p className="text-xs text-red-600" role="alert">{formErrors.consent}</p>}

                    <AdConsentCheckbox checked={adConsent} onChange={setAdConsent} tone="light" />
                  </div>

                  {/* Invisible spam guard (off-screen honeypot) */}
                  {guardNode}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    {step > 1 && (
                      <button type="button" onClick={goBack}
                        className="inline-flex items-center justify-center gap-1 px-4 py-3.5 rounded-xl border border-blue-200 text-blue-700 font-semibold hover:bg-blue-50 transition">
                        <ArrowLeft className="w-5 h-5" /> Back
                      </button>
                    )}
                    {step < 3 ? (
                      <button type="button" onClick={goNext}
                        className="flex-1 inline-flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-b from-[#2f74ff] to-[#1446c9] text-white text-lg sm:text-xl font-bold shadow-[0_8px_20px_rgba(29,78,216,0.35)] hover:brightness-110 active:translate-y-px transition">
                        Continue <ArrowRight className="w-6 h-6" />
                      </button>
                    ) : (
                      <button type="submit" disabled={isSubmitting || !formData.consent} aria-busy={isSubmitting}
                        className="flex-1 inline-flex items-center justify-center gap-3 py-3.5 rounded-xl bg-gradient-to-b from-[#2f74ff] to-[#1446c9] text-white text-lg sm:text-xl font-bold shadow-[0_8px_20px_rgba(29,78,216,0.35)] hover:brightness-110 active:translate-y-px transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Submitting…' : <>Submit Application <ArrowRight className="w-6 h-6" /></>}
                      </button>
                    )}
                  </div>

                  {submitMessage && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm" role="alert" aria-live="polite">
                      {submitMessage}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#1e3a8a] pt-1 text-center leading-snug">
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline-block -mt-0.5 mr-1.5" aria-hidden="true" />
                    Your information is safe, secure and used only for loan processing.
                  </p>
                  <p className="text-[11px] text-gray-500 text-center">
                    *Submission does not guarantee approval. Approval, rates and terms vary by lender.{' '}
                    <Link href="/loan-disclosure" className="underline">Full disclosures</Link>.
                  </p>
                </form>
              </div>
            </div>

            {/* Our Loan Solutions */}
            <div className="mt-8 sm:mt-12">
              <h2 className="text-[22px] sm:text-3xl font-extrabold text-[#0b1b3f]">Our Loan Solutions</h2>
              <span className="block mt-1 h-1 w-16 rounded-full bg-gradient-to-r from-[#f7941d] to-[#ffb347]" aria-hidden="true" />
              <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-4">
                {LOAN_SOLUTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => pickLoanSolution(s.value)}
                    className="group flex flex-col items-center justify-start gap-1.5 sm:gap-2 bg-white rounded-xl sm:rounded-2xl border border-blue-50 shadow-[0_4px_14px_rgba(30,64,175,0.10)] px-1 sm:px-2 py-3 sm:py-5 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(30,64,175,0.16)] transition"
                  >
                    <span className="h-8 sm:h-10 flex items-center [&_svg]:w-7 [&_svg]:h-7 sm:[&_svg]:w-10 sm:[&_svg]:h-10" aria-hidden="true">{s.icon}</span>
                    <span className="text-[10px] sm:text-sm font-semibold text-[#0b1b3f] text-center leading-tight">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fraud alert */}
            <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
              <p className="text-xs sm:text-sm text-red-700">
                <strong className="text-red-800">Fraud Alert:</strong> EzyLoan does NOT charge upfront fees. If anyone asks for advance payment for &quot;processing&quot; or &quot;guaranteed approval&quot;, it&apos;s a scam. Report to{' '}
                <a href="mailto:care@ezyloan.co.in" className="underline">care@ezyloan.co.in</a>.
              </p>
            </div>
          </div>
        </section>
        
        {/* Rates, fees & disclosures (Google Ads / Meta compliance) */}
        <LoanDisclosure loanDetails={loanDetails} emiExample={emiExample} eligibility={eligibility} className="my-10 sm:my-12" />





      </div>

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

const STEPS = ['Personal Details', 'Loan Details', 'Credit Profile'];
const STEP_FIELDS: string[][] = [
  ['fullName', 'phoneNumber', 'email'],
  ['loanType', 'employmentType', 'city', 'pincode'],
  ['cibilScore', 'consent'],
];

const LOAN_TYPE_OPTIONS = [
  { value: 'used-car', label: 'Used Car Loan' },
  { value: 'new-car', label: 'New Car Loan' },
  { value: 'car-loan-topup', label: 'Car Loan Top-Up' },
  { value: 'car-loan-balance-transfer', label: 'Car Loan Balance Transfer' },
  { value: 'commercial-vehicle', label: 'Commercial Vehicle Loan' },
  { value: 'personal', label: 'Personal Loan' },
  { value: 'property', label: 'Property Loan' },
  { value: 'business', label: 'Business Loan' },
  { value: 'home', label: 'Home Loan' },
];

const LOAN_SOLUTIONS: { value: string; label: React.ReactNode; icon: React.ReactNode }[] = [
  { value: 'used-car', label: <>Used<br />Car Loan</>, icon: <Car className="w-10 h-10 text-blue-600 fill-blue-600" strokeWidth={1.5} /> },
  {
    value: 'car-loan-topup', label: <>Car Loan<br />Top-Up</>,
    icon: (
      <span className="relative">
        <Coins className="w-10 h-10 text-amber-500" strokeWidth={1.8} />
        <span className="absolute -right-2 -bottom-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-600 text-white flex items-center justify-center">
          <ArrowRight className="!w-2.5 !h-2.5 sm:!w-3 sm:!h-3 -rotate-90" strokeWidth={3} />
        </span>
      </span>
    ),
  },
  { value: 'car-loan-balance-transfer', label: <>Car Loan<br />Balance Transfer</>, icon: <ArrowLeftRight className="w-10 h-10 text-blue-600" strokeWidth={2.5} /> },
  { value: 'new-car', label: <>New<br />Car Loan</>, icon: <Car className="w-10 h-10 text-orange-500 fill-orange-400" strokeWidth={1.5} /> },
  { value: 'commercial-vehicle', label: <>Commercial<br />Vehicle Loan</>, icon: <Truck className="w-10 h-10 text-blue-600 fill-blue-600" strokeWidth={1.5} /> },
];

const INPUT_CLS = 'flex-1 min-w-0 py-3 outline-none text-gray-900 placeholder:text-gray-500 text-[15px]';

const Field = ({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label htmlFor={htmlFor} className="block mb-1 text-[15px] font-bold text-[#0b1b3f]">
      {label} <span className="text-red-500">*</span>
    </label>
    {children}
    {error && <p id={`${htmlFor}Error`} className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
  </div>
);

const InputShell = ({ icon, error, children }: { icon?: React.ReactNode; error?: boolean; children: React.ReactNode }) => (
  <div className={`flex items-center gap-3 px-4 rounded-xl border bg-white transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 ${
    error ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-300'
  }`}>
    {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
    {children}
  </div>
);

export default ApplyNowPage;