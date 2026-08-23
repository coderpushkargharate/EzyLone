// app/contact/page.tsx
'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, Send, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Script from 'next/script';
import HeroSection from '@/components/HeroSection';
import { isIndianMobile } from '@/lib/phone';

// ✅ Helper function for button clicks with redirect (Glass Prism compatible)
const handleRedirect = (e: React.MouseEvent, url: string) => {
  e.preventDefault();
  e.stopPropagation();
  window.location.href = url;
};

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '', email: '', phoneNumber: '', loanType: '', loanAmount: '', message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'phoneNumber') {
      let d = value.replace(/\D/g, '');
      if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
      if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
      nextValue = d.slice(0, 10);
    }
    setFormData({ ...formData, [name]: nextValue });
    if (formErrors[name]) {
      setFormErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Please enter a valid email address';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    else if (!isIndianMobile(formData.phoneNumber)) errors.phoneNumber = 'Enter a valid Indian mobile number (10 digits, starting 6-9)';
    if (!formData.loanType) errors.loanType = 'Please select a loan type';
    if (!formData.loanAmount.trim()) errors.loanAmount = 'Loan amount is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) { setSubmitMessage('❌ Please correct the errors above before submitting.'); return; }
    setIsSubmitting(true); setSubmitMessage('');
    try {
      await axios.post('/api/contacts', formData, { headers: { 'Content-Type': 'application/json' } });
      setSubmitMessage('✅ Thank you! Your message has been sent successfully. We will get back to you within 24-48 business hours.');
      setFormData({ fullName: '', email: '', phoneNumber: '', loanType: '', loanAmount: '', message: '' });
      setFormErrors({});
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitMessage('❌ Sorry, there was an error sending your message. Please try again or contact us directly at care@ezyloan.co.in.');
    } finally { setIsSubmitting(false); }
  };

  // ✅ ONLY Organization Schema - NO FAQ Schema on contact page
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    "name": "EzyLoan (Dibyansh Associates)",
    "url": "https://ezyloan.co.in",
    "description": "EzyLoan is a loan facilitation service provider (DSA) connecting borrowers with partner banks and NBFCs across India. We are not a direct lender.",
    "telephone": "+91-6372977626",
    "contactPoint": { "@type": "ContactPoint", "telephone": "+91-6372977626", "contactType": "Customer Service", "areaServed": "IN", "availableLanguage": ["English", "Hindi"] },
    "address": { "@type": "PostalAddress", "streetAddress": "1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur", "addressLocality": "Cuttack", "postalCode": "753011", "addressRegion": "Odisha", "addressCountry": "IN" },
    "geo": { "@type": "GeoCoordinates", "latitude": 20.4618, "longitude": 85.8812 },
    "openingHoursSpecification": { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "09:00", "closes": "19:00" },
    "sameAs": ["https://facebook.com/ezyloan", "https://twitter.com/ezyloan", "https://linkedin.com/company/ezyloan"]
  };

  const contactInfo = [
    { icon: Phone, title: 'Call Us', details: '+91 6372977626', subtitle: 'Mon-Sat 9AM-7PM IST', href: 'tel:+916372977626' },
    { icon: Mail, title: 'Email Us', details: 'care@ezyloan.co.in', subtitle: 'Response within 24-48 hrs', href: 'mailto:care@ezyloan.co.in' },
    { icon: MapPin, title: 'Visit Us', details: '1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011', subtitle: 'Head Office', href: 'https://maps.app.goo.gl/your-map-link' },
    { icon: Clock, title: 'Business Hours', details: '9:00 AM - 7:00 PM', subtitle: 'Monday to Saturday', href: null }
  ];

  const loanTypes = ['Loan Against Car', 'Car Refinance', 'Personal Loan', 'Business Loan', 'Home Loan', 'Gold Loan'];

  return (
    <>

      {/* ✅ ONLY Organization Schema - NO FAQ Schema */}
      <Script id="organization-structured-data" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden" role="main">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-8">
          <div className="relative mb-16 max-w-7xl mx-auto overflow-hidden rounded-2xl shadow-xl">
            <HeroSection page="contact" title="Contact EzyLoan" subtitle="Your trusted financial partner for all loan needs" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
         

          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Contact Us</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Ready to take the next step? Get in touch with our loan experts who will guide you through the entire process.</p>
          </div>

          {/* Contact Info Cards - GLASS EFFECTS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon;
              return (
                <a 
                  key={index} 
                  href={info.href || undefined}
                  className={`group bg-white/70 backdrop-blur-sm rounded-3xl p-6 text-center border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200/50 ${!info.href ? 'cursor-default' : 'cursor-pointer'}`}
                  onClick={info.href ? (e) => handleRedirect(e, info.href!) : undefined}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="w-7 h-7 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{info.title}</h2>
                  {info.href ? (
                    <span className="text-blue-600 font-semibold mb-1 block group-hover:underline">{info.details}</span>
                  ) : (
                    <p className="text-blue-600 font-semibold mb-1">{info.details}</p>
                  )}
                  <p className="text-sm text-gray-500">{info.subtitle}</p>
                </a>
              );
            })}
          </div>

          {/* Contact Form - GLASS EFFECTS */}
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-md">
                  <Send className="w-5 h-5 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Send us a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      id="fullName" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-4 py-3 text-black bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-white/70 ${formErrors.fullName ? 'border-red-300 bg-red-50/50' : 'border-gray-200/50'}`} 
                      placeholder="Enter your full name" 
                    />
                    {formErrors.fullName && <p className="mt-1 text-sm text-red-600 animate-shake">{formErrors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-4 py-3 text-black bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-white/70 ${formErrors.email ? 'border-red-300 bg-red-50/50' : 'border-gray-200/50'}`} 
                      placeholder="Enter your email" 
                    />
                    {formErrors.email && <p className="mt-1 text-sm text-red-600 animate-shake">{formErrors.email}</p>}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <div className={`flex w-full rounded-xl overflow-hidden bg-white/50 backdrop-blur-sm border ${formErrors.phoneNumber ? 'border-red-300 bg-red-50/50' : 'border-gray-200/50'}`}>
                      <span className="inline-flex items-center px-3 bg-gray-100/80 text-gray-700 font-medium border-r border-gray-200/50 select-none">🇮🇳 +91</span>
                      <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        inputMode="numeric"
                        maxLength={10}
                        pattern="[6-9][0-9]{9}"
                        className="flex-1 px-4 py-3 text-black bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {formErrors.phoneNumber && <p className="mt-1 text-sm text-red-600 animate-shake">{formErrors.phoneNumber}</p>}
                  </div>
                  <div>
                    <label htmlFor="loanType" className="block text-sm font-medium text-gray-700 mb-2">Loan Type *</label>
                    <select 
                      id="loanType" 
                      name="loanType" 
                      value={formData.loanType} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-4 py-3 text-black bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-white/70 ${formErrors.loanType ? 'border-red-300 bg-red-50/50' : 'border-gray-200/50'}`}
                    >
                      <option value="">Select loan type</option>
                      {loanTypes.map((type, index) => <option key={index} value={type}>{type}</option>)}
                    </select>
                    {formErrors.loanType && <p className="mt-1 text-sm text-red-600 animate-shake">{formErrors.loanType}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700 mb-2">Loan Amount *</label>
                  <input 
                    type="text" 
                    id="loanAmount" 
                    name="loanAmount" 
                    value={formData.loanAmount} 
                    onChange={handleChange} 
                    required 
                    className={`w-full px-4 py-3 text-black bg-white/50 backdrop-blur-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-white/70 ${formErrors.loanAmount ? 'border-red-300 bg-red-50/50' : 'border-gray-200/50'}`} 
                    placeholder="Enter amount (e.g., ₹1,00,000)" 
                  />
                  {formErrors.loanAmount && <p className="mt-1 text-sm text-red-600 animate-shake">{formErrors.loanAmount}</p>}
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message <span className="text-gray-400 font-normal">(Optional)</span></label>
                  <textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange} 
                    rows={4} 
                    className="w-full px-4 py-3 text-black bg-white/50 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-white/70 resize-none" 
                    placeholder="Tell us more about your requirements..." 
                  />
                </div>
                
                {/* ✅ GLASS PRISM SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className={`group relative w-full overflow-hidden font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2 py-4 px-8 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white'
                  }`}
                >
                  {/* Base Glass Prism Gradient (only when not submitting) */}
                  {!isSubmitting && (
                    <>
                      {/* Base Glass Effect */}
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
                  <span className="relative z-10 flex items-center space-x-2">
                    {isSubmitting ? (
                      <><Send className="w-5 h-5 animate-pulse" /><span>Sending...</span></>
                    ) : (
                      <>
                        <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                        <span>Send Message</span>
                      </>
                    )}
                  </span>
                </button>
                
                {submitMessage && (
                  <div className={`p-4 rounded-xl text-center font-medium mt-4 animate-fadeIn ${
                    submitMessage.includes('error') || submitMessage.startsWith('❌') 
                      ? 'bg-red-50/80 backdrop-blur-sm border border-red-200/50 text-red-700' 
                      : 'bg-green-50/80 backdrop-blur-sm border border-green-200/50 text-green-700'
                  }`}>
                    {submitMessage}
                  </div>
                )}
                <p className="text-xs text-gray-500 text-center pt-4 border-t border-gray-200/50">
                  By submitting, you consent to sharing your details with partner lenders for assessment. Approval*, rates*, and terms* vary by lender. <Link href="/privacy-policy" className="underline hover:text-blue-600 transition-colors">Privacy Policy</Link>.
                </p>
              </form>
            </div>

            {/* Right Side Content - GLASS EFFECTS */}
            <div className="space-y-8">
              {/* Pre-qualification Card - GLASS PRISM BUTTON */}
              <div className="bg-gradient-to-br from-blue-600 to-cyan-700 rounded-3xl p-8 text-white relative overflow-hidden">
                {/* Glass shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold mb-4">Need a Loan?</h2>
                  <p className="text-blue-100 mb-6">Get pre-qualification* in minutes. No obligation, no hidden fees.</p>
                  
                  {/* ✅ GLASS PRISM CHECK ELIGIBILITY BUTTON */}
                  <Link 
                    href="/apply-now" 
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold text-blue-600 bg-white/95 backdrop-blur-md hover:bg-white transition-all duration-500 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                    onClick={(e) => handleRedirect(e, "/apply-now")}
                  >
                    {/* Base Glass Effect */}
                    <span className="absolute inset-0 bg-white/95 backdrop-blur-md" />
                    
                    {/* Animated Prism Shine Layer */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/60 to-transparent" 
                            style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
                    </span>
                    
                    {/* Prismatic Edge Glow */}
                    <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{ boxShadow: 'inset 0 0 25px rgba(37,99,235,0.2)' }} />
                    
                    {/* Animated Border Glow */}
                    <span className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.5), transparent)',
                            animation: 'borderGlow 3s infinite linear',
                            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                            maskComposite: 'xor',
                            WebkitMaskComposite: 'xor',
                            padding: '1px'
                          }} />
                    
                    {/* Button Text & Icon - Above all layers */}
                    <span className="relative z-10 flex items-center gap-2">
                      <span>Check Eligibility</span>
                      <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    
                    {/* Subtle Particle Sparkles on Hover */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none">
                      <span className="absolute top-1/2 left-1/4 w-1 h-1 bg-blue-200/80 rounded-full animate-ping" style={{ animationDelay: '0ms', animationDuration: '1.5s' }} />
                      <span className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-200/60 rounded-full animate-ping" style={{ animationDelay: '200ms', animationDuration: '1.8s' }} />
                      <span className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-blue-200/70 rounded-full animate-ping" style={{ animationDelay: '400ms', animationDuration: '2s' }} />
                    </span>
                  </Link>
                  
                  <p className="text-xs text-blue-100/80 mt-3">*Subject to documentation & lender approval.</p>
                </div>
              </div>

              {/* FAQ Section - NO structured data attributes - GLASS EFFECTS */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  {[
                    { q: "How quickly can I get approved?", a: "Most applications receive a preliminary response within 24 hours*. Final approval depends on documentation and lender policy." },
                    { q: "What documents do I need?", a: "Basic documents include KYC (PAN, Aadhaar), income proof, bank statements, and address proof. Exact requirements vary by lender*." },
                    { q: "Is my information secure?", a: "Yes, we use bank-grade encryption and comply with data protection regulations. Your information is shared only with partner lenders for assessment." },
                    { q: "Can I prepay my loan?", a: "Yes, prepayment is allowed* on most products. Charges depend on lender policy. Confirm terms in your loan agreement." }
                  ].map((faq, index) => (
                    <div key={index} className="border-b border-gray-200/50 pb-4 last:border-0 group">
                      <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors">{faq.q}</h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">{faq.a}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-4 text-center">*Answers are indicative. Final terms subject to lender policy.</p>
              </div>
            </div>
          </div>
          
          {/* Compliance Banner - GLASS EFFECT */}
          <div className="mt-12 p-4 bg-amber-50/80 backdrop-blur-sm border-l-4 border-amber-500 rounded-r-lg" role="note">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
              <div className="text-sm text-amber-800">
                <strong>Important:</strong> Interest rates*, processing fees*, and loan terms vary by lender. Approval is subject to eligibility verification. Final terms are decided solely by partner banks/NBFCs. <Link href="/loan-disclosure" className="underline hover:text-amber-900 transition-colors">View full disclosures</Link>.
              </div>
            </div>
          </div>
        </div>
        

        {/* Footer Disclaimer - GLASS EFFECT */}
        <div className="mt-16 pt-8 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-600">
              <strong>Disclaimer:</strong> EzyLoan is a loan facilitation service provider (DSA) and <strong>not a direct lender</strong>. All loan approvals, rates*, fees*, and terms* are determined by partner lenders.
            </p>
            <p className="text-xs text-gray-500 pt-2">
              © {new Date().getFullYear()} EzyLoan. | <Link href="/terms-and-conditions" className="hover:underline transition-colors">Terms</Link> | <Link href="/privacy-policy" className="hover:underline transition-colors">Privacy</Link>
            </p>
          </div>
        </div>
      </section>

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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Contact;