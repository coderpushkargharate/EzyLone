// components/CareersPage.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight, CheckCircle, Mail, Phone, MapPin, FileText, User, Briefcase, Sparkles } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  location: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  locationPostalCode?: string;
  type: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "TEMPORARY" | "INTERN" | "VOLUNTEER" | "OTHER";
  experience: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  postedDate: string;
  validThrough?: string;
  minSalary?: number;
  maxSalary?: number;
  salaryPeriod?: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
}

// ─────────────────────────────────────────────────────────────
// JOB DATA
// ─────────────────────────────────────────────────────────────
const jobs: Job[] = [
  {
    id: "banner-designer-001",
    title: "Banner Designer",
    location: "Odisha (Remote/Hybrid)",
    locationCity: "Cuttack",
    locationState: "Odisha",
    locationCountry: "IN",
    locationPostalCode: "753011",
    type: "FULL_TIME",
    experience: "1–3 Years",
    postedDate: "2024-01-15",
    validThrough: "2026-12-31",
    minSalary: 8000,
    maxSalary: 10000,
    salaryPeriod: "MONTH",
    description: "Design marketing banners, landing creatives, and campaign visuals aligned with fintech branding.",
    responsibilities: [
      "Create high-converting banner ads for Google, Meta, and programmatic platforms",
      "Design landing page visuals and campaign creatives",
      "Maintain brand consistency across all marketing collateral",
      "Collaborate with marketing team on A/B testing variations",
    ],
    requirements: [
      "Proficiency in Figma, Adobe Creative Suite, or Canva Pro",
      "Portfolio demonstrating fintech/financial services design experience",
      "Understanding of digital ad specifications and best practices",
      "Strong communication skills and ability to meet deadlines",
    ],
  },
  {
    id: "digital-marketing-002",
    title: "Digital Marketing Executive",
    location: "Odisha (Remote/Hybrid)",
    locationCity: "Cuttack",
    locationState: "Odisha",
    locationCountry: "IN",
    locationPostalCode: "753011",
    type: "FULL_TIME",
    experience: "1–3 Years",
    postedDate: "2024-01-10",
    validThrough: "2026-12-31",
    minSalary: 8000,
    maxSalary: 10000,
    salaryPeriod: "MONTH",
    description: "Handle SEO, paid campaigns, social media marketing and lead generation strategies.",
    responsibilities: [
      "Manage Google Ads, Meta Ads, and other paid acquisition channels",
      "Execute SEO strategies to improve organic visibility",
      "Create and schedule social media content across platforms",
      "Analyze campaign performance and optimize for ROI",
    ],
    requirements: [
      "Hands-on experience with Google Ads, Meta Business Suite, GA4",
      "Understanding of SEO fundamentals and keyword research",
      "Excellent written communication skills in English & Hindi",
      "Data-driven mindset with ability to interpret analytics",
    ],
  },
];

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT - CAREERS LISTING PAGE
// ─────────────────────────────────────────────────────────────
export default function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setShowModal(true);
    setFormError(null);
    setFormSuccess(null);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedJob(null);
    setFormError(null);
    setFormSuccess(null);
    document.body.style.overflow = "unset";
  };

  const validateForm = (formData: FormData): string | null => {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phoneNumber = formData.get("phoneNumber") as string;
    const resume = formData.get("resume") as File;

    if (!fullName?.trim()) return "Full name is required";
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address";
    }
    if (!phoneNumber?.trim() || !/^[0-9]{10,13}$/.test(phoneNumber.replace(/[\s\-]/g, ""))) {
      return "Please enter a valid 10-digit mobile number";
    }
    if (!resume || resume.size === 0) return "Resume/CV is required";
    if (resume.size > 10 * 1024 * 1024) return "Resume file size must be under 10MB";
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(resume.type)) return "Resume must be in PDF or DOC/DOCX format";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("jobTitle", selectedJob!.title);
      formData.append("jobId", selectedJob!.id);

      const validationError = validateForm(formData);
      if (validationError) throw new Error(validationError);

      const response = await fetch('/api/careers', {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Submission failed");

      setFormSuccess("✅ Application submitted successfully!\n\n📧 Check your email for confirmation.\nWe'll contact you within 3-5 business days.");
      setTimeout(() => {
        closeModal();
        (e.target as HTMLFormElement).reset();
        setFormSuccess(null);
      }, 4000);
    } catch (error: any) {
      console.error("Submission error:", error);
      setFormError(`❌ ${error.message || "Failed to submit application. Please try again or email careers@ezyloan.co.in"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────
  // ✅ ORGANIZATION SCHEMA ONLY (NO JobPosting on listing page)
  // ─────────────────────────────────────────────────────────
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EzyLoan (Dibyansh Associates)",
    "url": "https://www.ezyloan.co.in",
    "logo": "https://www.ezyloan.co.in/logo.png",
    "description": "EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with partner banks and NBFCs across India.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur",
      "addressLocality": "Cuttack",
      "postalCode": "753011",
      "addressRegion": "Odisha",
      "addressCountry": "IN"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-6372977626",
      "contactType": "Customer Service",
      "email": "careers@ezyloan.co.in",
      "areaServed": "IN"
    }
  };

  // ─────────────────────────────────────────────────────────
  // ✅ BREADCRUMB SCHEMA FOR CAREERS PAGE
  // ─────────────────────────────────────────────────────────
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.ezyloan.co.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Careers",
        "item": "https://www.ezyloan.co.in/careers"
      }
    ]
  };

  return (
    <>

      {/* ✅ ONLY Organization + Breadcrumb Schema on Listing Page */}
      {mounted && (
        <>
          <Script id="organization-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
          <Script id="breadcrumb-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
        </>
      )}

      {/* ❌ REMOVED: JobPosting schema from listing page - causes validation errors */}
      {/* ✅ JobPosting schema should ONLY be on individual job detail pages: /careers/[jobId] */}

      <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen mt-10">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute -top-4 -left-4 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-cyan-300/10 rounded-full blur-3xl animate-pulse delay-500" />
        </div>

        {/* HERO SECTION - GLASS EFFECTS */}
        <section className="relative z-10 bg-white/70 backdrop-blur-sm border-b border-blue-100/50">
          <div className="max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-[2px] w-16 md:w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Build Your Career With EzyLoan
              </h1>
              <div className="h-[2px] w-16 md:w-20 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
            </div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-base md:text-lg">
              Join our growing fintech team and help create smarter financial solutions for thousands of customers across India.
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-8">
              {[
                { label: "🚀 Fast Growth", color: "blue", bg: "from-blue-500 to-blue-600" },
                { label: "💡 Innovative Culture", color: "cyan", bg: "from-cyan-500 to-cyan-600" },
                { label: "🤝 Collaborative Team", color: "emerald", bg: "from-emerald-500 to-emerald-600" },
              ].map((badge, i) => (
                <div 
                  key={i} 
                  className={`group relative px-4 py-2 bg-gradient-to-br ${badge.bg} rounded-full text-sm text-white font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-default overflow-hidden`}
                >
                  {/* Glass shine effect */}
                  <span className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPLIANCE BANNER - GLASS EFFECT */}
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="p-3 md:p-4 bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-500 rounded-r-lg" role="note" aria-label="Employment disclosures">
            <p className="text-xs md:text-sm text-amber-800">
              <strong>Important:</strong> EzyLoan (Dibyansh Associates) is an Equal Opportunity Employer. All employment decisions are based on qualifications, merit, and business needs. We do not discriminate based on race, religion, color, national origin, gender, sexual orientation, age, marital status, veteran status, or disability status.{" "}
              <Link href="/privacy-policy" className="underline hover:text-amber-900 ml-1 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* OPEN ROLES SECTION - GLASS EFFECTS */}
        <section className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Current Openings</h2>
            <p className="mt-2 text-gray-600 text-sm md:text-base">Explore opportunities to make an impact</p>
          </div>

          <div className="space-y-5 md:space-y-6">
            {jobs.map((job) => (
              <article 
                key={job.id} 
                className="group bg-white/70 backdrop-blur-sm border border-blue-100/50 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300">
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-3 py-1 bg-blue-50/70 backdrop-blur-sm text-blue-700 text-xs font-medium rounded-full border border-blue-200/50 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                      <span className="px-3 py-1 bg-cyan-50/70 backdrop-blur-sm text-cyan-700 text-xs font-medium rounded-full border border-cyan-200/50 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" /> {job.type.replace("_", " ")}
                      </span>
                      <span className="px-3 py-1 bg-purple-50/70 backdrop-blur-sm text-purple-700 text-xs font-medium rounded-full border border-purple-200/50 flex items-center gap-1">
                        ⏱ {job.experience}
                      </span>
                      {job.minSalary && job.maxSalary && (
                        <span className="px-3 py-1 bg-emerald-50/70 backdrop-blur-sm text-emerald-700 text-xs font-medium rounded-full border border-emerald-200/50 flex items-center gap-1">
                          💰 ₹{(job.minSalary / 1000).toFixed(0)}K - ₹{(job.maxSalary / 1000).toFixed(0)}K / {job.salaryPeriod?.toLowerCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-3 md:mt-4 text-sm leading-relaxed">{job.description}</p>
                    <details className="mt-3 md:mt-4 text-sm text-gray-600">
                      <summary className="cursor-pointer font-medium text-blue-600 hover:underline transition-colors">View full details</summary>
                      <div className="mt-3 space-y-3">
                        {job.responsibilities && (
                          <div>
                            <strong className="text-gray-800">Key Responsibilities:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {job.responsibilities.map((resp, i) => <li key={i} className="group-hover:text-gray-700 transition-colors">{resp}</li>)}
                            </ul>
                          </div>
                        )}
                        {job.requirements && (
                          <div>
                            <strong className="text-gray-800">Requirements:</strong>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                              {job.requirements.map((req, i) => <li key={i} className="group-hover:text-gray-700 transition-colors">{req}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                  
                  {/* ✅ GLASS PRISM APPLY BUTTON */}
                  <button
                    onClick={() => openApplyModal(job)}
                    className="group relative flex-shrink-0 px-5 md:px-6 py-2.5 md:py-3 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 text-sm overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                    aria-label={`Apply for ${job.title} position`}
                  >
                    {/* Base Glass Prism Gradient */}
                    <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-cyan-600/95 backdrop-blur-md" />
                    
                    {/* Animated Prism Shine Layer */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                            style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    
                    {/* Prismatic Edge Glow */}
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(37,99,235,0.25)' }} />
                    
                    {/* Animated Border Glow */}
                    <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                            animation: 'borderGlow 3s infinite linear',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'xor',
                            WebkitMaskComposite: 'xor',
                            padding: '1px'
                          }} />
                    
                    {/* Button Text & Icon - Above all layers */}
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Apply Now</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-6" />
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          {jobs.length === 0 && (
            <div className="text-center py-12 md:py-16 bg-white/50 backdrop-blur-sm border border-blue-100/50 rounded-2xl">
              <p className="text-gray-600 text-base md:text-lg">No open positions at the moment.</p>
              <p className="text-gray-500 mt-2 text-sm">
                Check back soon or send your resume to{" "}
                <a href="mailto:careers@ezyloan.co.in" className="text-blue-600 font-medium hover:underline transition-colors">careers@ezyloan.co.in</a>
              </p>
            </div>
          )}
        </section>

        {/* APPLY MODAL - GLASS EFFECTS */}
        {showModal && selectedJob && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-3 md:px-4 animate-fadeIn" 
            onClick={closeModal} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
          >
            <div 
              className="bg-white/95 backdrop-blur-md border border-blue-200/50 w-full max-w-lg rounded-2xl p-5 md:p-6 relative shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={closeModal} 
                className="absolute right-3 md:right-4 top-3 md:top-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100/70 backdrop-blur-sm rounded-full transition-all duration-300 group" 
                aria-label="Close application modal"
              >
                <span className="group-hover:rotate-90 transition-transform duration-300">✕</span>
              </button>
              
              <div className="pr-8">
                <h2 id="modal-title" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Apply for {selectedJob.title}</h2>
                <p className="text-gray-600 mt-1 text-sm">{selectedJob.location} • {selectedJob.type.replace("_", " ")}</p>
                {selectedJob.minSalary && selectedJob.maxSalary && (
                  <p className="text-emerald-600 mt-1 text-sm font-medium">💰 Budget: ₹{(selectedJob.minSalary / 1000).toFixed(0)}K - ₹{(selectedJob.maxSalary / 1000).toFixed(0)}K / {selectedJob.salaryPeriod?.toLowerCase()}</p>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="mt-5 md:mt-6 space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg text-red-700 text-sm animate-shake" role="alert" aria-live="assertive">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-lg text-green-700 text-sm whitespace-pre-line animate-fadeIn" role="status" aria-live="polite">
                    {formSuccess}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        id="fullName" 
                        name="fullName" 
                        required 
                        placeholder="John Doe" 
                        className="w-full border border-blue-200/50 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                        aria-required="true" 
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="email" 
                        id="email" 
                        name="email" 
                        required 
                        placeholder="john@example.com" 
                        className="w-full border border-blue-200/50 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                        aria-required="true" 
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      id="phoneNumber" 
                      name="phoneNumber" 
                      required 
                      placeholder="+91 98765 43210" 
                      pattern="[0-9]{10,13}" 
                      className="w-full border border-blue-200/50 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                      aria-required="true" 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="noticePeriod" className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                  <select 
                    id="noticePeriod" 
                    name="noticePeriod" 
                    className="w-full border border-blue-200/50 rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  >
                    <option value="">Select notice period</option>
                    <option value="immediate">Immediate Joiner</option>
                    <option value="15days">15 Days</option>
                    <option value="30days">30 Days</option>
                    <option value="60days">60 Days</option>
                    <option value="90days">90 Days</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="expectedCtc" className="block text-sm font-medium text-gray-700 mb-1">Expected CTC (LPA)</label>
                  <input 
                    type="number" 
                    id="expectedCtc" 
                    name="expectedCtc" 
                    placeholder="e.g., 6.5" 
                    step="0.1" 
                    min="1" 
                    max="50" 
                    className="w-full border border-blue-200/50 rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">Total Experience</label>
                    <input 
                      id="experience" 
                      name="experience" 
                      placeholder="2 years" 
                      className="w-full border border-blue-200/50 rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                    />
                  </div>
                  <div>
                    <label htmlFor="currentCTC" className="block text-sm font-medium text-gray-700 mb-1">Current CTC (Optional)</label>
                    <input 
                      id="currentCTC" 
                      name="currentCTC" 
                      placeholder="₹ X LPA" 
                      className="w-full border border-blue-200/50 rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70" 
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">Resume / CV *</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="file" 
                      id="resume" 
                      name="resume" 
                      required 
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                      className="w-full border border-blue-200/50 rounded-xl pl-10 pr-4 py-2.5 md:py-3 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50/70 backdrop-blur-sm file:text-blue-700 hover:file:bg-blue-100/70 transition-all duration-300 bg-white/50 hover:bg-white/70" 
                      aria-required="true" 
                      aria-describedby="resumeHelp" 
                    />
                  </div>
                  <p id="resumeHelp" className="text-xs text-gray-500 mt-1">PDF or DOC/DOCX format, max 10MB</p>
                </div>
                
                <div>
                  <label htmlFor="whyHire" className="block text-sm font-medium text-gray-700 mb-1">Why should we hire you? *</label>
                  <textarea 
                    id="whyHire" 
                    name="whyHire" 
                    required 
                    rows={3} 
                    placeholder="Briefly tell us about your relevant experience..." 
                    className="w-full border border-blue-200/50 rounded-xl px-4 py-2.5 md:py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white/50 backdrop-blur-sm hover:bg-white/70 resize-none" 
                    aria-required="true" 
                  />
                </div>
                
                <div className="flex items-start space-x-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="consent" 
                    name="consent" 
                    required 
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" 
                    aria-required="true" 
                  />
                  <label htmlFor="consent" className="text-xs text-gray-600 leading-tight cursor-pointer">
                    I consent to EzyLoan processing my personal data for recruitment purposes. My information will be handled per our{" "}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline transition-colors">Privacy Policy</Link>. *
                  </label>
                </div>
                
                {/* ✅ GLASS PRISM SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`group relative w-full py-3 md:py-3.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base overflow-hidden ${
                    isSubmitting 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  }`} 
                  aria-busy={isSubmitting}
                >
                  {/* Base Glass Prism Gradient (only when not submitting) */}
                  {!isSubmitting && (
                    <>
                      <span className="absolute inset-0 bg-gradient-to-r from-blue-600/95 via-blue-500/90 to-cyan-600/95 backdrop-blur-md" />
                      
                      {/* Animated Prism Shine Layer */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent" 
                              style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                      </span>
                      
                      {/* Prismatic Edge Glow */}
                      <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: 'inset 0 0 25px rgba(255,255,255,0.35), inset 0 0 45px rgba(37,99,235,0.25)' }} />
                      
                      {/* Animated Border Glow */}
                      <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)',
                              animation: 'borderGlow 3s infinite linear',
                              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                              maskComposite: 'xor',
                              WebkitMaskComposite: 'xor',
                              padding: '1px'
                            }} />
                      
                      {/* Subtle Particle Sparkles on Hover */}
                      <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-white/90 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                        <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                        <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                      </span>
                    </>
                  )}
                  
                  {/* Button Content - Above all layers */}
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Application</span>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
                
                <p className="text-xs text-gray-500 text-center pt-3 border-t border-gray-200/50">
                  By applying, you confirm the information provided is accurate. Shortlisted candidates will be contacted via email/phone within 3-5 business days.
                </p>
              </form>
            </div>
          </div>
        )}

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
          @keyframes fadeIn { 
            from { opacity: 0; } 
            to { opacity: 1; } 
          }
          @keyframes slideUp { 
            from { opacity: 0; transform: translateY(20px) scale(0.98); } 
            to { opacity: 1; transform: translateY(0) scale(1); } 
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
          .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
          .animate-shake { animation: shake 0.3s ease-in-out; }
          @media (max-width: 640px) { .max-h-\\[90vh\\] { max-height: 85vh; } }
        `}</style>

        {/* FOOTER - GLASS EFFECT */}
        <div className="relative z-10 mt-12 md:mt-16 pt-6 md:pt-8 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-2 md:space-y-3">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Recruitment Disclaimer:</strong> EzyLoan (Dibyansh Associates) is an Equal Opportunity Employer. All hiring decisions are based on qualifications, skills, and business requirements. We do not charge any fees from candidates at any stage of the recruitment process. Beware of fraudulent job offers.
            </p>
            <p className="text-xs text-gray-600">
              <strong>Data Privacy:</strong> Applicant data is collected solely for recruitment purposes and retained per applicable data protection laws. For queries, contact{" "}
              <a href="mailto:careers@ezyloan.co.in" className="text-blue-600 hover:underline transition-colors">careers@ezyloan.co.in</a>.
            </p>
            <p className="text-xs text-gray-500 pt-2">
              © {new Date().getFullYear()} EzyLoan. All rights reserved. |{" "}
              <Link href="/terms-and-conditions" className="hover:underline transition-colors">Terms</Link>{" "}
              | <Link href="/privacy-policy" className="hover:underline transition-colors">Privacy</Link>{" "}
              | <Link href="/careers" className="hover:underline transition-colors">Careers</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}