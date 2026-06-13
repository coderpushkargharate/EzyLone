'use client';

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Script from "next/script";

import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import { trackMetaLead } from "@/components/MetaPixel";
import {   Truck, ArrowRight, Percent, Clock, Shield, DollarSign, FileText, AlertCircle,
  User, TrendingUp, CheckCircle, Building, Zap, Award, Bus, Car , Info, Phone, Mail, MapPin } from "lucide-react";

// Next.js requires NEXT_PUBLIC_ prefix for client-side env vars
const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST || 'http://127.0.0.1:3001';
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

  // ✅ Helper function for button clicks with redirect (Glass Prism compatible)
  const handleRedirect = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.location.href = url;
  };

  // Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
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

  // Client-side validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.phoneNumber.trim() || !/^[0-9]{10,13}$/.test(formData.phoneNumber.replace(/[\s\-]/g, ''))) {
      errors.phoneNumber = 'Valid 10-digit mobile number is required';
    }
    if (!formData.loanType) errors.loanType = 'Please select a loan type';
    if (!formData.employmentType) errors.employmentType = 'Please select employment type';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.pincode.trim() || !/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = 'Valid 6-digit pincode is required';
    }
    if (!formData.consent) errors.consent = 'You must consent to data processing';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Form Data to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitMessage('❌ Please correct the errors above before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await axios.post(`${SERVER_HOST}/api/loans`, formData, {
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
      trackMetaLead({ content_name: formData.loanType, currency: 'INR', value: 1 });

      // ✅ Redirect to Thank You page after successful submission
      router.push("/ThankYouPage");

    } catch (error) {
      console.error("Error submitting loan application:", error);
      setSubmitMessage(
        "❌ Sorry, there was an error submitting your application. Please try again or contact us at care@ezyloan.co.in."
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
        <div className="max-w-[85rem] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 relative z-10 pt-20 sm:pt-20 lg:pt-24 xl:pt-28">
          
          {/* Hero Image Section - Responsive padding & sizing */}
          <div className="relative mb-8 sm:mb-10 lg:mb-12 xl:mb-16 overflow-hidden rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl mt-8">
            <HeroSection
              page="apply"
              title="Apply for Loan"
              subtitle="Quick processing* • Subject to approval"
            />
          </div>
        </div>

      

        {/* Form + Benefits Section - Fully Responsive Layout */}
        <div className="pt-4 sm:pt-6 lg:pt-8 xl:pt-10 pb-8 sm:pb-10 lg:pb-12">
          <div className="max-w-[85rem] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
              
              {/* Loan Application Form - Responsive Styling */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 text-white mb-6 sm:mb-8 lg:mb-10">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 leading-tight">Apply for Your Loan*</h2>
                <p className="text-blue-100 text-sm mb-6">*Submission does not guarantee approval. Final terms determined by partner lender.</p>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate aria-label="Loan application form">
                  {/* Personal Details */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-100">Personal Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fullName" className="sr-only">Full Name</label>
                        <input
                          id="fullName"
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          aria-required="true"
                          aria-invalid={!!formErrors.fullName}
                          aria-describedby={formErrors.fullName ? "fullNameError" : undefined}
                          placeholder="Enter your full name *"
                          className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                            formErrors.fullName ? 'ring-2 ring-red-400' : ''
                          }`}
                        />
                        {formErrors.fullName && (
                          <p id="fullNameError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.fullName}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="sr-only">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          aria-required="true"
                          aria-invalid={!!formErrors.email}
                          aria-describedby={formErrors.email ? "emailError" : undefined}
                          placeholder="Enter your email address *"
                          className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                            formErrors.email ? 'ring-2 ring-red-400' : ''
                          }`}
                        />
                        {formErrors.email && (
                          <p id="emailError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.email}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="phoneNumber" className="sr-only">Phone Number</label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{10,13}"
                          aria-required="true"
                          aria-invalid={!!formErrors.phoneNumber}
                          aria-describedby={formErrors.phoneNumber ? "phoneError" : undefined}
                          placeholder="Enter your 10-digit mobile number *"
                          className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                            formErrors.phoneNumber ? 'ring-2 ring-red-400' : ''
                          }`}
                        />
                        {formErrors.phoneNumber && (
                          <p id="phoneError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Loan Type */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-100">Loan Details</h3>
                    <label htmlFor="loanType" className="sr-only">Select Loan Type</label>
                    <select
                      id="loanType"
                      name="loanType"
                      value={formData.loanType}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.loanType}
                      aria-describedby={formErrors.loanType ? "loanTypeError" : undefined}
                      className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                        formErrors.loanType ? 'ring-2 ring-red-400' : ''
                      }`}
                    >
                      <option value="">Select Loan Type *</option>
                      <option value="personal">Personal Loan</option>
                      <option value="car">Car Loan</option>
                      <option value="home">Home Loan</option>
                      <option value="business">Business Loan</option>
                      <option value="property">Property Loan</option>
                      <option value="commercial-vehicle">Commercial Vehicle Loan</option>
                    </select>
                    {formErrors.loanType && (
                      <p id="loanTypeError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.loanType}</p>
                    )}
                  </div>

                  {/* Employment */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-100">Employment Details</h3>
                    <label htmlFor="employmentType" className="sr-only">Select Employment Type</label>
                    <select
                      id="employmentType"
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      aria-invalid={!!formErrors.employmentType}
                      aria-describedby={formErrors.employmentType ? "employmentError" : undefined}
                      className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                        formErrors.employmentType ? 'ring-2 ring-red-400' : ''
                      }`}
                    >
                      <option value="">Employment Type *</option>
                      <option value="salaried">Salaried</option>
                      <option value="self-employed">Self Employed</option>
                      <option value="business">Business Owner</option>
                      <option value="professional">Professional</option>
                      <option value="retired">Retired</option>
                    </select>
                    {formErrors.employmentType && (
                      <p id="employmentError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.employmentType}</p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-100">Address Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="city" className="sr-only">City</label>
                        <input
                          id="city"
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          aria-required="true"
                          aria-invalid={!!formErrors.city}
                          aria-describedby={formErrors.city ? "cityError" : undefined}
                          placeholder="City *"
                          className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                            formErrors.city ? 'ring-2 ring-red-400' : ''
                          }`}
                        />
                        {formErrors.city && (
                          <p id="cityError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.city}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="pincode" className="sr-only">Pincode</label>
                        <input
                          id="pincode"
                          type="text"
                          name="pincode"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                          pattern="[0-9]{6}"
                          aria-required="true"
                          aria-invalid={!!formErrors.pincode}
                          aria-describedby={formErrors.pincode ? "pincodeError" : undefined}
                          placeholder="Pincode (6 digits) *"
                          className={`w-full px-4 bg-white py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900 ${
                            formErrors.pincode ? 'ring-2 ring-red-400' : ''
                          }`}
                        />
                        {formErrors.pincode && (
                          <p id="pincodeError" className="mt-1 text-xs text-red-200" role="alert">{formErrors.pincode}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* CIBIL - With compliance disclaimer */}
                  <div>
                    <h3 className="font-semibold mb-4 text-blue-100">Credit Information</h3>
                    <label htmlFor="cibilScore" className="sr-only">CIBIL Score Range</label>
                    <select
                      id="cibilScore"
                      name="cibilScore"
                      value={formData.cibilScore}
                      onChange={handleChange}
                      required
                      aria-required="true"
                      className="w-full bg-white px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 outline-none text-gray-900"
                    >
                      <option value="">CIBIL Score Range (Optional)</option>
                      <option value="300-549">300-549 (Poor)</option>
                      <option value="550-649">550-649 (Fair)</option>
                      <option value="650-749">650-749 (Good)</option>
                      <option value="750-900">750-900 (Excellent)</option>
                      <option value="not-sure">Not Sure</option>
                    </select>
                    <p className="mt-2 text-xs text-blue-100/80">
                      <Info className="w-3 h-3 inline mr-1" aria-hidden="true" />
                      Providing CIBIL info helps match you with suitable lenders. Final credit check performed by lender*.
                    </p>
                  </div>

                  {/* ✅ COMPLIANCE: Privacy Consent Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="consent"
                        checked={formData.consent}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        aria-invalid={!!formErrors.consent}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs text-blue-100 leading-tight">
                        I consent to EzyLoan processing my personal data for loan facilitation purposes and sharing it with partner lenders for assessment. 
                        I have read and agree to the <Link href="/privacy" className="underline hover:text-white">Privacy Policy</Link> and <Link href="/terms" className="underline hover:text-white">Terms</Link>. *
                      </span>
                    </label>
                    {formErrors.consent && (
                      <p className="mt-1 text-xs text-red-200" role="alert">{formErrors.consent}</p>
                    )}
                  </div>

                  {/* ✅ GLASS PRISM SUBMIT BUTTON - Working with Redirect */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.consent}
                    className="relative w-full inline-flex items-center justify-center gap-2 overflow-hidden font-semibold py-3 px-6 rounded-lg transition-all duration-500 group/btn cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.25)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_20px_rgba(255,255,255,0.25)]"
                    aria-busy={isSubmitting}
                    aria-label={isSubmitting ? "Submitting application" : "Submit loan application"}
                  >
                    {/* Base Glass Prism Gradient - White/Blue for form */}
                    <span className="absolute inset-0 bg-gradient-to-r from-white/95 via-blue-50/90 to-cyan-50/95 backdrop-blur-md" />
                    
                    {/* Animated Prism Shine Layer */}
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 disabled:opacity-0">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent" 
                            style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    
                    {/* Prismatic Edge Glow */}
                    <span className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 disabled:opacity-0"
                          style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.5), inset 0 0 45px rgba(37,99,235,0.3)' }} />
                    
                    {/* Animated Border Glow */}
                    <span className="absolute -inset-px rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 disabled:opacity-0"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
                            animation: 'borderGlow 3s infinite linear',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'xor',
                            WebkitMaskComposite: 'xor',
                            padding: '1px'
                          }} />
                    
                    {/* Button Text & Icon - Above all layers */}
                    <span className="relative z-10 flex items-center gap-2 text-blue-700 font-semibold">
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Application
                          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:rotate-6" />
                        </>
                      )}
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 pointer-events-none disabled:opacity-0">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </button>

                  {/* Error/Success Message */}
                  {submitMessage && (
                    <div 
                      className={`p-4 rounded-lg ${
                        submitMessage.includes('❌') 
                          ? 'bg-red-100 text-red-800 border border-red-300' 
                          : 'bg-green-100 text-green-800 border border-green-300'
                      }`}
                      role={submitMessage.includes('❌') ? "alert" : "status"}
                      aria-live="polite"
                    >
                      {submitMessage}
                    </div>
                  )}

                  {/* Form-level disclaimer */}
                  <p className="text-xs text-blue-100/70 text-center pt-4 border-t border-blue-400/30">
                    By submitting, you confirm information is accurate. Approval*, rates*, and terms* vary by lender. 
                    <Link href="/loan-disclosure" className="underline hover:text-white ml-1">Full disclosures</Link>.
                  </p>
                </form>
              </div>
              

              {/* Right Side - Benefits - Responsive */}
              <div className="space-y-5 sm:space-y-6 lg:space-y-8">
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 lg:mb-4 leading-tight">
                    Why Choose EzyLoan?*
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base">
                    *Benefits subject to lender policy and applicant profile
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  <BenefitCard
                    iconColor="blue"
                    title="Swift Process*"
                    desc="Quick preliminary response*. Final approval subject to lender verification."
                  />
                  <BenefitCard
                    iconColor="green"
                    title="Competitive Rates*"
                    desc="Rates tailored to your profile*. Determined by partner lender."
                  />
                  <BenefitCard
                    iconColor="purple"
                    title="Minimal Documentation"
                    desc="Essential documents only. Requirements vary by lender and loan type."
                  />
                  <BenefitCard
                    iconColor="orange"
                    title="Transparent Terms*"
                    desc="All fees disclosed before acceptance. *Subject to lender policy."
                  />
                </div>

                {/* ✅ WORKING CONTACT SECTION - Glass Cards with Clickable Links */}
                <div className="relative bg-white/40 backdrop-blur-2xl rounded-2xl p-5 border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-cyan-50/40 pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-4 text-center">
                      <span className="bg-gradient-to-r from-[#2563eb] to-[#06b6d4] bg-clip-text text-transparent">Need Help?</span>
                    </h3>
                    <div className="space-y-4">
                      {/* Phone - Clickable */}
                      <a href="tel:+916372977626" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-105">
                          <Phone className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Call Us</p>
                          <p className="text-[#2563eb] text-sm font-medium hover:underline">+91 63729 77626</p>
                        </div>
                      </a>
                      {/* Email - Clickable */}
                      <a href="mailto:care@ezyloan.co.in" className="flex items-center space-x-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb]/90 to-[#06b6d4]/90 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(37,99,235,0.25)] group-hover:shadow-[0_6px_20px_rgba(37,99,235,0.35)] transition-all duration-300 group-hover:scale-105">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Email Us</p>
                          <p className="text-[#2563eb] text-sm font-medium hover:underline">care@ezyloan.co.in</p>
                        </div>
                      </a>
                    </div>
                    <p className="text-[10px] xs:text-xs mt-3 text-center text-slate-500/80">Response time: 24-48 business hours*</p>
                  </div>
                </div>

                {/* ✅ Added: Security/Fraud Warning */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-sm font-medium text-red-800">⚠️ Fraud Alert</p>
                      <p className="text-xs text-red-700 mt-1">
                        EzyLoan does NOT charge upfront fees. If anyone asks for advance payment for "processing" or "guaranteed approval", it's a scam. Report to care@ezyloan.co.in.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ✅ EMI EXAMPLE - Near Form (Google Ads Requirement) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-blue-100 shadow-md sm:shadow-lg" role="region" aria-label="Representative EMI example">
              <h3 className="font-bold text-gray-800 mb-3 flex items-center text-base sm:text-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0" aria-hidden="true"></span>
                <span className="font-semibold">Representative EMI Example (Illustrative)*</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Loan Amount</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">₹{emiExample.principal.toLocaleString()}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Interest Rate</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.rate}% p.a.*</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Tenure</p>
                  <p className="font-semibold text-sm sm:text-base md:text-lg">{emiExample.tenureMonths} months</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">Monthly EMI</p>
                  <p className="font-bold text-blue-600 text-sm sm:text-base md:text-lg">₹{emiExample.emi.toLocaleString()}*</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3 text-center font-medium">
                Total Repayment: ₹{emiExample.totalAmount.toLocaleString()} (Principal + Interest) | 
                <span className="block sm:inline sm:ml-1">*Actual EMI may vary based on credit profile, lender terms, processing fees, and applicable charges. This is a representative example for illustration purposes only.</span>
              </p>
            </div>
          </div>
        </div>

        {/* ✅ ELIGIBILITY SECTION - Google Ads Requirement */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-green-200" role="region" aria-label="Eligibility criteria">
              <h3 className="font-bold text-gray-800 mb-3 text-base sm:text-lg">✅ Eligibility Criteria*</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Age: {eligibility.age}</span>
                </div>
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Income: {eligibility.income}</span>
                </div>
                <div className="flex items-center py-1">
                  <span className="text-green-600 mr-2 text-sm sm:text-base flex-shrink-0" aria-hidden="true">✓</span>
                  <span className="text-xs sm:text-sm md:text-base font-medium">Employment: {eligibility.employment}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                *Eligibility criteria are indicative. Final approval subject to lender's underwriting policy, documentation verification, income proof, and credit assessment.
              </p>
            </div>
          </div>
        </div>
          {/* ✅ COMPLIANCE BANNER - Required disclosures visible above form */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg mb-6 sm:mb-8" role="note" aria-label="Important application disclosures">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm text-amber-800">
                  <strong>Important:</strong> EzyLoan is a loan facilitation service provider (DSA), <strong>not a direct lender</strong>. 
                  Interest rates*, processing fees*, approval timelines*, and loan terms* vary by partner lender and applicant profile. 
                  Submission does not guarantee approval. <Link href="/loan-disclosure" className="underline hover:text-amber-900">View full disclosures</Link>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ LOAN DETAILS BANNER - Google Ads Required */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 text-white" role="region" aria-label="Loan terms and conditions">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Interest Rate</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.interestRate}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Processing Fee</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.processingFee}</p>
                </div>
                <div className="py-1">
                  <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium leading-tight">Loan Tenure</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{loanDetails.tenure}</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-center mt-2 sm:mt-3 opacity-80 font-medium">
                *Terms and conditions apply. Rates &amp; fees subject to credit assessment and lender approval. Representative example only.
              </p>
            </div>
          </div>
        </div>

            {/* 🔴 G2RS COMPLIANCE FIX: Footer Declarations (Added at page bottom as requested) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mb-8">
          <div className="max-w-[85rem] mx-auto space-y-2">
            {/* FIX #1: NO INVESTMENT DECLARATION */}
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-amber-900 font-medium">
                <strong>⚠️ Important:</strong> We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.
              </p>
            </div>
            {/* FIX #2: NOT A LENDER STATEMENT */}
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-blue-900 font-medium">
                <strong>Note:</strong> EzyLoan is not a lender. We are a loan service provider facilitating loans through Banks and NBFCs.
              </p>
            </div>
            {/* FIX #3: FINAL COMPLIANCE LINE */}
            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-r-lg p-3">
              <p className="text-xs sm:text-sm text-gray-900 font-medium">
                We are a loan facilitation service and not engaged in any financial advisory or investment services.
              </p>
            </div>
          </div>
        </div>

        {/* 🔴 G2RS COMPLIANCE: Enhanced Disclaimer Section (Before Footer CTA) */}
        <div className="px-3 sm:px-4 lg:px-6 xl:px-8 mb-8">
          <div className="max-w-[85rem] mx-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start space-x-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800 mb-2">Important Disclaimer</h4>
                {/* FIX #1: NO INVESTMENT */}
                <p className="text-amber-900 text-sm leading-relaxed mb-2">
                  We do not provide investment advisory services and do not deal in stocks, mutual funds, securities, or trading products.
                </p>
                {/* FIX #2: NOT A LENDER */}
                <p className="text-amber-900 text-sm leading-relaxed mb-2">
                  <strong>EzyLoan is not a lender.</strong> We are a loan service provider facilitating loans through Banks and NBFCs.
                </p>
                {/* FIX #3: FINAL COMPLIANCE LINE */}
                <p className="text-amber-900 text-sm leading-relaxed">
                  We are a loan facilitation service and not engaged in any financial advisory or investment services.
                </p>
                <p className="text-amber-800 text-xs mt-3 pt-2 border-t border-amber-200">
                  All loans are subject to bank/NBFC approval and terms. EzyLoan acts as a facilitator only.
                </p>
              </div>
            </div>
          </div>
        </div>

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

// Reusable Benefit Card Component - Fully Responsive + Compliance + Glass Hover
const BenefitCard = ({
  iconColor,
  title,
  desc,
}: {
  iconColor: string;
  title: string;
  desc: string;
}) => {
  return (
    <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-5 lg:p-6 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 hover:shadow-xl hover:border-blue-200/50 transition-all duration-300 group">
      <div
        className={`w-10 h-10 sm:w-12 sm:h-12 bg-${iconColor}-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300`}
        aria-hidden="true"
      >
        <CheckCircle className={`w-5 h-5 sm:w-6 sm:h-6 text-${iconColor}-600`} />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mb-1 sm:mb-2 leading-tight group-hover:text-blue-700 transition-colors">{title}</h3>
        <p className="text-gray-600 text-[10px] xs:text-xs sm:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export default ApplyNowPage;