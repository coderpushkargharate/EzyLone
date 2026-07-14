'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Facebook, Phone, Calculator, Instagram } from 'lucide-react';

// Each floating action. `gradient` + `iconHover` are written as full literal
// class strings so Tailwind's JIT picks them up.
const ACTIONS: Array<{
  id: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconHover: string;
  desktopOnly?: boolean;
  onClick: () => void;
}> = [
  {
    id: 'calculator',
    label: 'EMI Calculator',
    Icon: Calculator,
    gradient: 'from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700',
    iconHover: 'group-hover:text-purple-700',
    onClick: () => (window.location.href = '/emi-calculator'),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    Icon: Facebook,
    gradient: 'from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900',
    iconHover: 'group-hover:text-blue-700',
    onClick: () => window.open('https://www.facebook.com/ezyloan.co.in/', '_blank'),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    Icon: Instagram,
    gradient:
      'from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500',
    iconHover: 'group-hover:text-pink-600',
    onClick: () => window.open('https://www.instagram.com/ezyloanofficials/', '_blank'),
  },
  {
    id: 'phone',
    label: 'Call Us',
    Icon: Phone,
    gradient: 'from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700',
    iconHover: 'group-hover:text-teal-700',
    desktopOnly: true,
    onClick: () => window.open('tel:+916372977626', '_blank'),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    Icon: MessageCircle,
    gradient: 'from-green-500 to-green-700 hover:from-green-600 hover:to-green-800',
    iconHover: 'group-hover:text-green-600',
    desktopOnly: true,
    onClick: () => window.open('https://wa.me/916372977626', '_blank'),
  },
];

const VoiceAssistant: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ Mark component as client-side only to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
    // Trigger the staggered slide-in shortly after mount.
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);

  // ✅ Return a placeholder during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="fixed bottom-44 right-0 md:bottom-28 z-50">
        <div className="w-12 h-12 rounded-l-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed bottom-44 right-0 md:bottom-28 z-50">
      <div className="flex flex-col items-end gap-3">
        {ACTIONS.map((action, i) => (
          <div
            key={action.id}
            className={`flex justify-end transition-all duration-500 ease-out ${
              action.desktopOnly ? 'hidden sm:flex' : ''
            } ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <button
              onClick={action.onClick}
              aria-label={action.label}
              className={`group flex h-12 w-max items-center overflow-hidden rounded-l-full bg-gradient-to-r ${action.gradient} shadow-lg transition-shadow duration-300 hover:shadow-xl`}
            >
              {/* Icon circle — leads on the left, inverts to white on hover */}
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 group-hover:bg-white">
                <action.Icon
                  className={`h-5 w-5 text-white transition-colors duration-300 ${action.iconHover}`}
                />
              </span>

              {/* Label — collapses to 0 width, expands after the icon on hover */}
              <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-300 ease-out group-hover:grid-cols-[1fr]">
                <span className="overflow-hidden">
                  <span className="block whitespace-nowrap pl-1 pr-4 text-sm font-semibold text-white">
                    {action.label}
                  </span>
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceAssistant;
