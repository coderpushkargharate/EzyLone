'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Script from 'next/script';
import { CheckCircle, Mail, Phone, Clock, Home, MessageSquare, AlertCircle } from 'lucide-react';
import { trackMetaLead } from '@/components/MetaPixel';

const ThankYouPage = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(30);
  const [applicationId, setApplicationId] = useState<string | null>(null);

  // ✅ Generate/retrieve application ID from URL params or session
  useEffect(() => {
    // Try to get application ID from URL params or sessionStorage
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('applicationId') || sessionStorage.getItem('lastApplicationId');
    
    if (appId) {
      setApplicationId(appId);
    } else {
      // Fallback: generate a reference ID (note: real apps should get this from backend)
      const fallbackId = `APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      setApplicationId(fallbackId);
      sessionStorage.setItem('lastApplicationId', fallbackId);
    }
  }, []);

  // ✅ Auto-redirect with visual countdown update
  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [countdown, router]);

  // ✅ Track conversion for Google Ads - Fixed trailing spaces
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-18024243962/conversion_label', // 🔑 Replace with actual conversion label
        'value': 1.0,
        'currency': 'INR',
        'transaction_id': applicationId || ''
      });
    }

    // ✅ Meta (Facebook) Pixel conversion
    trackMetaLead({ value: 1.0, currency: 'INR' });
  }, [applicationId]);

  // ✅ Structured Data for ConfirmationPage - Fixed trailing spaces
  const confirmationSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Application Submitted - EzyLoan",
    "description": "Your loan application has been received. EzyLoan will review your details and connect you with partner lenders.",
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.ezyloan.co.in" },
        { "@type": "ListItem", "position": 2, "name": "Apply", "item": "https://www.ezyloan.co.in/apply-now" },
        { "@type": "ListItem", "position": 3, "name": "Confirmation", "item": "https://www.ezyloan.co.in/thank-you" }
      ]
    },
    "mainEntity": {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "When will I hear back about my application?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our team typically responds within 24-48 business hours*. Final approval timeline depends on document verification and lender underwriting."
          }
        },
        {
          "@type": "Question",
          "name": "Is my application guaranteed to be approved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Submission does not guarantee approval*. All loan decisions are made solely by partner banks/NBFCs based on credit assessment and eligibility."
          }
        }
      ]
    }
  };

  return (
    <>

      {/* ✅ Structured Data for SEO */}
      <Script
        id="confirmation-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(confirmationSchema) }}
      />

      <main 
        className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4 py-10 mt-12"
        itemScope 
        itemType="https://schema.org/WebPage"
        role="main"
      >
        {/* ✅ COMPLIANCE BANNER - Visible above content */}
        <div className="w-full max-w-3xl mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg" role="note" aria-label="Important application notice">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Application submission does not guarantee approval*. 
              EzyLoan is a loan facilitator (DSA), not a direct lender. Final decisions are made by partner banks/NBFCs. 
              <Link href="/loan-disclosure" className="underline hover:text-amber-900 ml-1">View full disclosures</Link>.
            </p>
          </div>
        </div>

        {/* Success Icon with Accessibility */}
        <div 
          className="bg-green-500 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-6 shadow-lg animate-fade-in"
          role="img"
          aria-label="Application submitted successfully"
        >
          <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" aria-hidden="true" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 text-center px-4">
          Thank You!
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 mb-6 text-center px-4 max-w-2xl">
          Your application has been submitted successfully*.
        </p>

        {/* Submission Info Box - ✅ Enhanced with compliance */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-xl text-center mb-10 shadow-sm">
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
            Our team will review your application and contact you soon. 
            You will also receive a confirmation email within 24–48 business hours*.
          </p>
          <p className="text-blue-700 font-medium mt-4 flex items-center justify-center gap-2 flex-wrap">
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>Please check your email (including spam folder) for application details.</span>
          </p>
          {/* ✅ Enhanced disclaimer */}
          <p className="text-xs text-gray-500 mt-4 leading-relaxed">
            *Response times and approval are subject to document verification, credit assessment, and partner lender policies. 
            EzyLoan does not sanction or disburse loans directly.
          </p>
        </div>

        {/* Application Reference - ✅ Improved with proper ID handling */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 mb-8 max-w-md w-full shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-gray-600 font-medium">Application Reference:</span>
            <span 
              className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded text-sm sm:text-base"
              aria-live="polite"
            >
              {applicationId || 'Loading...'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-gray-600 font-medium">Submitted:</span>
            <time 
              dateTime={new Date().toISOString()}
              className="ml-2 font-medium text-sm sm:text-base"
            >
              {new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </time>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Save this reference ID for future inquiries.
          </p>
        </div>

        {/* Action Buttons - ✅ Enhanced accessibility */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <Link 
            href="/" 
            className="bg-blue-600 text-white px-6 sm:px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center justify-center gap-2"
            aria-label="Return to EzyLoan homepage"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go to Home
          </Link>
          <Link 
            href="/contact" 
            className="border-2 border-blue-600 text-blue-600 px-6 sm:px-8 py-3.5 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            aria-label="Contact EzyLoan support team"
          >
            <MessageSquare className="w-4 h-4" aria-hidden="true" />
            Contact Us
          </Link>
        </div>

        {/* What's Next Section - ✅ Compliance-enhanced */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white rounded-2xl p-6 max-w-3xl w-full shadow-lg mb-8">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 text-center">What's Next?*</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 text-center">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
              <div className="bg-white text-blue-600 w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 text-2xl sm:text-3xl shadow-md">
                📄
              </div>
              <p className="font-semibold text-base sm:text-lg">Document Verification</p>
              <p className="text-sm mt-2 opacity-90">We'll verify your submitted documents*</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
              <div className="bg-white text-green-500 w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 text-2xl sm:text-3xl shadow-md">
                ✅
              </div>
              <p className="font-semibold text-base sm:text-lg">Application Review</p>
              <p className="text-sm mt-2 opacity-90">Our team reviews eligibility*</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl hover:bg-white/20 transition-all">
              <div className="bg-white text-yellow-400 w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center mb-3 text-2xl sm:text-3xl shadow-md">
                💰
              </div>
              <p className="font-semibold text-base sm:text-lg">Lender Decision</p>
              <p className="text-sm mt-2 opacity-90">Partner bank/NBFC makes final decision*</p>
            </div>
          </div>
          <p className="text-xs text-center text-white/80 mt-4">
            *Timelines and outcomes subject to verification, credit assessment, and lender policy. No guarantee of approval.
          </p>
        </div>

        {/* Auto-redirect Countdown - ✅ Now functional */}
        <div className="mt-4 text-gray-600 text-sm text-center" role="status" aria-live="polite">
          <p>
            Redirecting to homepage in{' '}
            <span className="font-bold text-blue-600" id="countdown" aria-label={`${countdown} seconds until redirect`}>
              {countdown}
            </span>{' '}
            seconds...
          </p>
          <button 
            onClick={() => router.push('/')}
            className="mt-2 text-blue-600 hover:underline text-sm"
            aria-label="Go to homepage now"
          >
            Go now →
          </button>
        </div>

        {/* FAQ Section - ✅ Enhanced with structured data alignment */}
        <div className="mt-12 max-w-3xl w-full bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl sm:text-2xl font-bold text-center mb-6 text-gray-900">Need Help?</h3>
          <div className="space-y-4">
            <div className="border-b pb-4">
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Mail className="w-4 h-4" aria-hidden="true" /> Email us:
              </p>
              <a 
                href="mailto:care@ezyloan.co.in" 
                className="text-blue-600 hover:underline block mt-1"
                aria-label="Email EzyLoan support"
              >
                care@ezyloan.co.in
              </a>
              <p className="text-xs text-gray-500 mt-1">Response time: 24-48 business hours*</p>
            </div>
            <div className="border-b pb-4">
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Phone className="w-4 h-4" aria-hidden="true" /> Call us:
              </p>
              <a 
                href="tel:+916372977626" 
                className="text-blue-600 hover:underline block mt-1"
                aria-label="Call EzyLoan support"
              >
                +91 63729 77626
              </a>
              <p className="text-xs text-gray-500 mt-1">Mon-Sat: 9:00 AM - 7:00 PM IST</p>
            </div>
            <div>
              <p className="font-medium text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4" aria-hidden="true" /> Track Application:
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                Use your Application Reference ID above when contacting us for faster assistance.
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">
            *Response times are estimates. Actual timelines may vary based on application volume and verification requirements.
          </p>
        </div>

        {/* ✅ GLOBAL FOOTER DISCLAIMER */}
        <footer className="mt-12 pt-6 border-t border-gray-200 w-full max-w-4xl" role="contentinfo">
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Disclaimer:</strong> EzyLoan (Dibyansh Associates) is a loan facilitation service provider (DSA) and <strong>not a direct lender</strong>. 
              All loan approvals, interest rates*, fees*, and terms* are solely determined by partner banks/NBFCs. 
              Submission does not guarantee approval. Please review all terms before accepting any loan offer.
            </p>
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} EzyLoan. All rights reserved. |{' '}
              <Link href="/terms" className="hover:underline">Terms</Link> |{' '}
              <Link href="/privacy" className="hover:underline">Privacy</Link> |{' '}
              <Link href="/loan-disclosure" className="hover:underline">Disclosures</Link>
            </p>
          </div>
        </footer>

      </main>

      {/* ✅ CSS Animations (if not in global CSS) */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
        .animation-delay-600 { animation-delay: 0.6s; opacity: 0; }
      `}</style>
    </>
  );
};

export default ThankYouPage;