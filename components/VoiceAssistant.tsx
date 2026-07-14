'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Facebook, Phone, Calculator, Instagram } from 'lucide-react';

const VoiceAssistant: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  // ✅ FIX: Mark component as client-side only to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ FIX: Return null during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="fixed bottom-44 right-4 md:bottom-28 md:right-5 z-50">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-44 right-4 md:bottom-28 md:right-5 z-50">
        <div className="relative flex flex-col items-center space-y-3">
          <div className="flex flex-col space-y-3 mb-10">
            <button
              onClick={() => window.location.href = '/emi-calculator'}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 hover:scale-110 border-2 border-white/20"
              aria-label="EMI Calculator"
            >
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            <button
              onClick={() => window.open('https://www.facebook.com/ezyloan.co.in/', '_blank')}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 hover:scale-110 border-2 border-white/20"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Instagram Button */}
            <button
              onClick={() => window.open('https://www.instagram.com/ezyloanofficials/', '_blank')}
              className="w-10 h-10 sm:w-12 mb-10 lg:mb-3 sm:h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:scale-110 border-2 border-white/20"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>

            {/* Phone Button - Desktop only */}
            <button
              onClick={() => window.open('tel:+916372977626', '_blank')}
              className="hidden sm:flex w-12 h-12 rounded-full shadow-lg transition-all duration-300 items-center justify-center bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:scale-110 border-2 border-white/20"
              aria-label="Call"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>

            {/* WhatsApp Button - Desktop only */}
            <button
              onClick={() => window.open('https://wa.me/916372977626', '_blank')}
              className="hidden sm:flex w-12 h-12 rounded-full shadow-lg transition-all duration-300 items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 hover:scale-110 border-2 border-white/20"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VoiceAssistant;
