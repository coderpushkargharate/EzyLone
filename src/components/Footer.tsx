import React from 'react';
import { 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    products: [
      'Personal Loan',
      'Business Loan',
      'Home Loan',
      'Vehicle Loan',
      'Education Loan',
      'Credit Card'
    ],
    company: [
      'About Us',
      'Careers',
      'Press',
      'Blog',
      'Investor Relations',
      'Contact'
    ],
    resources: [
      'EMI Calculator',
      'Loan Guide',
      'Financial Tips',
      'Customer Support',
      'FAQs',
      'Interest Rates'
    ],
    legal: [
      'Privacy Policy',
      'Terms of Service',
      'Cookie Policy',
      'Grievance Redressal',
      'Regulatory Compliance'
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://www.facebook.com/people/Ezy-Loan/61555978110163/?mibextid=wwXIfr&rdid=gCetAIeuJmkorolA&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1AMg9SKGtP%2F%3Fmibextid%3DwwXIfr', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: 'https://www.instagram.com/ezyloan.co.in?igsh=N3FqeWhiamp6Y211&utm_source=qr', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-white/20">
                    <img 
                      src="/new-ezy-logo.png" 
                      alt="EzyLoan Logo" 
                      className="w-7 h-7 object-contain filter brightness-0 invert"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">✓</span>
                  </div>
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                    EzyLoan
                  </span>
                  <p className="text-xs text-blue-300 font-medium">Your Trusted Financial Partner</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-4 border border-blue-500/20 backdrop-blur-sm">
                <p className="text-gray-200 leading-relaxed max-w-md text-sm">
                  🌟 Making dreams come true with quick, easy loans. 
                  Join over <span className="text-cyan-300 font-bold">100,000+</span> satisfied customers.
                </p>
                <div className="flex items-center space-x-3 mt-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
                    <span className="text-xs text-gray-300">4.9/5</span>
                  </div>

                </div>
              </div>





              {/* Social Links */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center">
                  <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                  Follow Us
                </h3>
                <div className="flex space-x-2">
                  {socialLinks.map((social, index) => {
                    const IconComponent = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        aria-label={social.label}
                        className="w-9 h-9 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center border border-blue-500/30 hover:bg-gradient-to-br hover:from-blue-500 hover:to-cyan-500 transition-all duration-300 group hover:scale-105 hover:shadow-md hover:shadow-blue-500/25"
                      >
                        <IconComponent className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
                      </a>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-2">Stay connected for updates</p>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Products</h3>
              <ul className="space-y-2">
                {footerLinks.products.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group text-sm"
                    >
                      <span>{link}</span>
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group text-sm"
                    >
                      <span>{link}</span>
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center group text-sm"
                    >
                      <span>{link}</span>
                      <ArrowRight className="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Full Width Disclaimer & Contact Box */}
        <div className="py-6 border-t border-gradient-to-r from-orange-500/30 to-red-500/30">
          <div className="bg-gradient-to-br from-orange-900/40 via-red-900/30 to-yellow-900/40 rounded-2xl p-6 border-2 border-orange-500/30 backdrop-blur-sm shadow-xl">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Get in Touch Section */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center lg:justify-start">
                    <span className="w-3 h-3 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                    📞 Get in Touch
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto lg:mx-0 rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  <a href="tel:+916372977626" className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-800/40 to-cyan-800/40 rounded-lg border border-blue-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">📱</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-base">+91 6372977626</span>
                      <p className="text-cyan-300 text-xs">Call us anytime - 24/7 Support</p>
                    </div>
                  </a>
                  
                  <a href="https://wa.me/+916372977626" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded-lg border border-green-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">💬</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-base">WhatsApp Chat</span>
                      <p className="text-emerald-300 text-xs">Quick support via WhatsApp</p>
                    </div>
                  </a>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-800/40 to-cyan-800/40 rounded-lg border border-blue-500/30 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm">✉️</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-base">contact@ezyloan.co.in</span>
                      <p className="text-cyan-300 text-xs">Quick response guaranteed</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-800/40 to-cyan-800/40 rounded-lg border border-blue-500/30 hover:border-cyan-400/50 transition-all duration-300">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mt-1">
                      <span className="text-white text-sm">📍</span>
                    </div>
                    <div>
                      <span className="text-white font-bold text-sm leading-relaxed">1st floor, Hindustan-Tyres, Pir Bazar, Bhanpur, Cuttack, Odisha-753011</span>
                      <p className="text-cyan-300 text-xs mt-1">Visit our office</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Disclaimer Section */}
              <div className="space-y-4">
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center lg:justify-start">
                    <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                    ⚠️ Important Disclaimer
                  </h3>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto lg:mx-0 rounded-full"></div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-black/30 rounded-xl p-4 border border-yellow-500/40">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      <span className="font-bold text-yellow-300 text-base">Ezy loan (Dibyansh Associates)</span> is providing services to client to get the loan from Banks or NBFC.
                    </p>
                  </div>
                  
                  <div className="bg-black/30 rounded-xl p-4 border border-cyan-500/40">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      We at <span className="font-bold text-cyan-300 text-base">Ezy loan</span> do not finance directly to the client and do not run any NBFC.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-900/60 to-orange-900/60 rounded-xl p-4 border-2 border-red-500/50 text-center">
                    <p className="text-red-200 text-sm font-semibold flex items-center justify-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
                      🚨 We are loan facilitators, not direct lenders
                      <span className="w-2 h-2 bg-red-400 rounded-full ml-2 animate-pulse"></span>
                    </p>
                    <p className="text-red-300 text-xs mt-1">
                      All loan approvals subject to bank/NBFC policies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="py-8 border-t border-gradient-to-r from-cyan-500/30 to-blue-500/30">
          <div className="bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-pink-900/60 rounded-3xl p-8 backdrop-blur-lg border border-gradient-to-r from-cyan-400/30 to-purple-400/30 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-center justify-between space-y-6 lg:space-y-0">
              <div className="text-center lg:text-left">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent mb-3">
                  📧 Stay in the Loop!
                </h3>
                <p className="text-gray-200 text-lg leading-relaxed max-w-md">
                  Get exclusive loan offers, financial tips, and instant updates delivered to your inbox. 
                  <span className="text-cyan-300 font-semibold">Join 50,000+ subscribers!</span>
                </p>
                <div className="flex items-center space-x-2 mt-3">
                  <span className="text-green-400 text-sm">✓ No spam</span>
                  <span className="text-blue-400 text-sm">✓ Weekly updates</span>
                  <span className="text-purple-400 text-sm">✓ Exclusive offers</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="✉️ Enter your email address"
                  className="px-6 py-4 bg-white/15 border-2 border-cyan-400/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 backdrop-blur-sm min-w-80 transition-all duration-300"
                />
                <button className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 whitespace-nowrap">
                  🚀 Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="py-8 border-t border-gradient-to-r from-purple-500/30 to-cyan-500/30">
          <div className="bg-gradient-to-r from-slate-800/50 to-gray-800/50 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-center text-lg font-semibold text-white mb-4 flex items-center justify-center">
              <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
              Legal & Compliance
              <span className="w-2 h-2 bg-yellow-400 rounded-full ml-2"></span>
            </h4>
            <div className="flex flex-wrap justify-center gap-4 mb-4">
              {footerLinks.legal.map((link, index) => {
                const linkPath = link === 'Privacy Policy' ? '/privacy-policy' : '#';
                const LinkComponent = link === 'Privacy Policy' ? Link : 'a';
                const linkProps = link === 'Privacy Policy' ? { to: linkPath } : { href: linkPath };
                
                return (
                  <LinkComponent
                    key={index}
                    {...linkProps}
                    className="text-gray-300 hover:text-cyan-300 transition-all duration-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-400/30"
                  >
                    {link}
                  </LinkComponent>
                );
              })}
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">
                🔒 Your data is secure and protected under Indian financial regulations
              </p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="py-8 border-t border-gradient-to-r from-cyan-500/40 to-purple-500/40">
          <div className="bg-gradient-to-r from-gray-900/80 to-slate-900/80 rounded-2xl p-6 backdrop-blur-sm border border-cyan-400/20">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <div className="text-gray-200 text-sm font-medium mb-2">
                  © {currentYear} <span className="text-cyan-300 font-bold">EzyLoan</span>. All rights reserved.
                </div>

              </div>
              
              <div className="text-center lg:text-right">
                <div className="text-gray-200 text-sm font-medium mb-2">
                  Designed with <span className="text-red-400 animate-pulse">❤️</span> for your financial success
                </div>
                <div className="text-xs text-gray-400">
                  🌟 Trusted by <span className="text-cyan-300 font-semibold">100,000+</span> customers across India
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Designed by <a href="https://2solution.in" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:text-orange-300 transition-colors duration-300">2solution.in</a>
                </div>
              </div>
            </div>
            
            {/* Additional Trust Indicators */}
            <div className="mt-6 pt-4 border-t border-gray-600/50">
              <div className="flex flex-wrap justify-center items-center space-x-6 text-xs text-gray-400">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  SSL Secured
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  256-bit Encryption
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                  GDPR Compliant
                </span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1"></span>
                  24/7 Support
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;