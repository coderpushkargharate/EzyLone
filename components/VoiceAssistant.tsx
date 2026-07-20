'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium icons
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiPhoneCall } from 'react-icons/fi';
import { HiOutlineCalculator } from 'react-icons/hi';
import { IoArrowUp } from 'react-icons/io5';

// EzyLone contact number (used for both Call + WhatsApp).
const PHONE = '916372977626';
const WA_TEXT = 'Hi,%20I%27m%20interested%20in%20a%20loan%20from%20EzyLoan';

const ACTIONS: Array<{
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'calculator' | 'tel' | 'external';
  url?: string;
  priority?: 'high' | 'normal';
}> = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: FaWhatsapp,
    type: 'external',
    url: `https://wa.me/${PHONE}?text=${WA_TEXT}`,
    priority: 'high',
  },
  {
    id: 'call',
    label: 'Call Us',
    icon: FiPhoneCall,
    type: 'tel',
    url: `tel:+${PHONE}`,
    priority: 'high',
  },
  {
    id: 'calculator',
    label: 'EMI Calculator',
    icon: HiOutlineCalculator,
    type: 'calculator',
    priority: 'normal',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    icon: FaFacebookF,
    type: 'external',
    url: 'https://www.facebook.com/ezyloan.co.in/',
    priority: 'normal',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    icon: FaInstagram,
    type: 'external',
    url: 'https://www.instagram.com/ezyloanofficials/',
    priority: 'normal',
  },
];

interface StickyActionsProps {
  showScrollTop?: boolean;
}

export default function VoiceAssistant({ showScrollTop = true }: StickyActionsProps) {
  const [showButtons, setShowButtons] = useState(false);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Brand Colors — matched to the EzyLone website palette (blue → cyan).
  const BRAND_PRIMARY = '#2563eb';   // blue-600 (site primary)
  const BRAND_SECONDARY = '#06b6d4'; // cyan-500 (site accent)
  const BRAND_ACCENT = '#0ea5e9';    // sky-500
  const BRAND_LIGHT = '#eff6ff';     // blue-50
  const BRAND_DARK = '#1e3a8a';      // blue-900

  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAction = (action: typeof ACTIONS[0]) => {
    if (action.type === 'calculator') {
      // EzyLone has a dedicated EMI page (no modal) — navigate there.
      window.location.href = '/emi-calculator';
    } else if (action.type === 'tel') {
      if (action.url) window.location.href = action.url;
    } else if (action.type === 'external') {
      if (action.url) window.open(action.url, '_blank', 'noopener,noreferrer');
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      {/* Unified right-side vertical column — sits above the chat launcher so
          nothing overlaps. On mobile it clears the bottom action bar + chat FAB
          (bottom-44); on desktop it sits just above the chat FAB (bottom-24). */}
      <div className="fixed right-0 bottom-44 md:bottom-24 z-[100] flex flex-col gap-3 items-end pr-0">
        <AnimatePresence>
          {/* Scroll to Top — top of the stack, desktop only. As the first (top)
              child of a bottom-anchored column it grows the stack upward, so the
              logos below never shift. */}
          {showScrollTop && showScrollTopBtn && (
            <motion.div
              key="scroll-top"
              initial={{ scale: 0, x: 50, opacity: 0 }}
              animate={{ scale: 1, x: 0, opacity: 1 }}
              exit={{ scale: 0, x: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onMouseEnter={() => setHoveredId('scroll-top')}
              onMouseLeave={() => setHoveredId(null)}
              onClick={scrollToTop}
              className="relative cursor-pointer hidden md:block"
              aria-label="Scroll to top"
            >
              <motion.div
                className="relative flex items-center gap-2 overflow-hidden h-12"
                style={{
                  backgroundColor: BRAND_PRIMARY,
                  borderRadius: '999px 0 0 999px',
                  boxShadow: hoveredId === 'scroll-top'
                    ? `0 10px 25px -5px ${BRAND_PRIMARY}80, 0 0 0 2px ${BRAND_ACCENT}50`
                    : '0 4px 12px -2px rgba(0,0,0,0.15)',
                }}
                animate={{ width: hoveredId === 'scroll-top' ? 120 : 48 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0 z-10"
                  animate={{
                    backgroundColor: hoveredId === 'scroll-top' ? '#FFFFFF' : 'rgba(255,255,255,0)',
                    borderRadius: '50%'
                  }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <motion.div
                    animate={{ color: hoveredId === 'scroll-top' ? BRAND_PRIMARY : '#FFFFFF' }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-center"
                  >
                    <IoArrowUp className="w-5 h-5" />
                  </motion.div>
                </motion.div>

                <motion.div className="h-full flex items-center pr-4 overflow-hidden whitespace-nowrap">
                  <motion.span
                    className="text-[13px] font-semibold text-white tracking-wide drop-shadow-sm"
                    initial={{ opacity: 0, x: -10 }}
                    animate={hoveredId === 'scroll-top' ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                    transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
                  >
                    Back to Top
                  </motion.span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {showButtons && ACTIONS.map((action, index) => {
            const Icon = action.icon;
            const isHovered = hoveredId === action.id;
            const isHighPriority = action.priority === 'high';
            const isWhatsApp = action.id === 'whatsapp';
            const isCall = action.id === 'call';

            // Determine background color based on action type (blue/cyan family)
            let bgColor = BRAND_PRIMARY;
            if (isWhatsApp) bgColor = BRAND_PRIMARY;
            else if (isCall) bgColor = BRAND_SECONDARY;
            else if (action.id === 'calculator') bgColor = BRAND_ACCENT;
            else bgColor = BRAND_DARK;

            return (
              <motion.div
                key={action.id}
                initial={{ scale: 0, x: 50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, x: 50, opacity: 0 }}
                transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 400, damping: 25 }}
                onMouseEnter={() => setHoveredId(action.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleAction(action)}
                className={`relative cursor-pointer ${isHighPriority ? 'hidden md:block' : ''}`}
                aria-label={action.label}
              >
                <motion.div
                  className="relative flex items-center gap-2 overflow-hidden h-12"
                  style={{
                    backgroundColor: bgColor,
                    borderRadius: '999px 0 0 999px',
                    boxShadow: isHovered
                      ? `0 10px 25px -5px ${BRAND_PRIMARY}80, 0 0 0 2px ${BRAND_ACCENT}50`
                      : '0 4px 12px -2px rgba(0,0,0,0.15)',
                  }}
                  animate={{ width: isHovered ? 130 : 48 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="w-12 h-12 flex items-center justify-center flex-shrink-0 z-10"
                    animate={{
                      backgroundColor: isHovered ? '#FFFFFF' : 'rgba(255,255,255,0)',
                      borderRadius: '50%'
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <motion.div
                      animate={{ color: isHovered ? bgColor : '#FFFFFF' }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>
                  </motion.div>

                  <motion.div className="h-full flex items-center pr-4 overflow-hidden whitespace-nowrap">
                    <motion.span
                      className="text-[13px] font-semibold text-white tracking-wide drop-shadow-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
                      transition={{ duration: 0.25, delay: 0.05, ease: "easeOut" }}
                    >
                      {action.label}
                    </motion.span>
                  </motion.div>

                  {isHighPriority && !isHovered && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '999px 0 0 999px',
                        border: `2px solid ${BRAND_ACCENT}`,
                        opacity: 0.3
                      }}
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
