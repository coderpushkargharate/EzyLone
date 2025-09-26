import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  User,
  MessageSquare,
  Calculator
} from 'lucide-react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    loanType: '',
    loanAmount: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      await axios.post('http://localhost:3001/api/contacts', formData);
      setSubmitMessage('✅ Thank you! Your message has been sent successfully. We will get back to you soon.');
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        loanType: '',
        loanAmount: '',
        message: ''
      });
    } catch (error) {
      setSubmitMessage('❌ Sorry, there was an error sending your message. Please try again.');
    }

    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      details: '+91 6372977626',
      subtitle: 'Mon-Sat 9AM-7PM'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: 'contact@ezyloan.co.in',
      subtitle: 'Quick response guaranteed'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '1st Floor, Hindustan Tyres Building, Pir Bazar, Bhanpur, Cuttack, Odisha - 753011, India',
      subtitle: 'Head Office Location'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: '9:00 AM - 7:00 PM',
      subtitle: 'Monday to Saturday'
    }
  ];

  const loanTypes = [
    'Loan Against Car',
    'Car Refinance',
    'Personal Loan',
    'Business Loan',
    'Home Loan',
    'Gold Loan'
  ];

  return (
    <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full backdrop-blur-sm border border-blue-200/50 mb-6">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Get in Touch</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Contact Us
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Ready to take the next step? Get in touch with our loan experts who will guide you 
            through the entire process and help you find the perfect loan solution.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 text-center border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{info.title}</h3>
                <p className="text-blue-600 font-semibold mb-1">{info.details}</p>
                <p className="text-sm text-gray-500">{info.subtitle}</p>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Send us a Message</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Type *
                  </label>
                  <select
                    name="loanType"
                    value={formData.loanType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select loan type</option>
                    {loanTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount *
                </label>
                <div className="relative">
                  <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleChange}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter loan amount (e.g., ₹1,00,000)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us more about your requirements..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Send className="w-5 h-5 animate-pulse" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              {submitMessage && (
                <div className={`p-4 rounded-xl text-center font-medium ${
                  submitMessage.includes('error') || submitMessage.startsWith('❌')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-green-50 text-green-700'
                }`}>
                  {submitMessage}
                </div>
              )}
            </form>
          </div>

          {/* Right Side Content */}
          <div className="space-y-8">
            {/* Quick Apply Card */}
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">Need a Loan Urgently?</h3>
                <p className="text-blue-100 mb-6 leading-relaxed">
                  Get instant pre-approval in just 2 minutes. No paperwork, no waiting. 
                  Just quick and easy loans when you need them most.
                </p>
                <button className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Apply Now
                </button>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Frequently Asked Questions</h3>
              
              <div className="space-y-4">
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">How quickly can I get approved?</h4>
                  <p className="text-sm text-gray-600">Most applications are approved within 24 hours of submission.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">What documents do I need?</h4>
                  <p className="text-sm text-gray-600">Basic documents include ID proof, address proof, and income proof.</p>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Is my information secure?</h4>
                  <p className="text-sm text-gray-600">Yes, we use bank-grade encryption to protect all your personal data.</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Can I prepay my loan?</h4>
                  <p className="text-sm text-gray-600">Yes, we offer flexible prepayment options with minimal charges.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
