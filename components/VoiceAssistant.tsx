'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Premium icons
import { FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { FiPhoneCall } from 'react-icons/fi';
import { HiOutlineCalculator } from 'react-icons/hi';
import { IoArrowUp } from 'react-icons/io5';
import { MdClose } from 'react-icons/md';
import { BsGrid3X3GapFill } from 'react-icons/bs';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Brand Colors
  const BRAND_PRIMARY = '#005E60';
  const BRAND_SECONDARY = '#8B0000';
  const BRAND_GOLD = '#C9A84C';
  const BRAND_LIGHT = '#F5F0EB';
  const BRAND_DARK = '#1A1A1A';

  useEffect(() => {
    const timer = setTimeout(() => setShowButtons(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Get high priority actions (WhatsApp & Call)
  const highPriorityActions = ACTIONS.filter(a => a.priority === 'high');
  const normalActions = ACTIONS.filter(a => a.priority === 'normal');

  return (
    <>
      {/* Mobile Version */}
      {isMobile && (
        <>
          {/* Mobile Bottom Dock — labeled pills for primary actions + a More toggle */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-200 shadow-2xl md:hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center gap-2 max-w-md mx-auto px-3 py-2.5">
              {/* Primary actions — full-width colored pills */}
              {highPriorityActions.map((action) => {
                const Icon = action.icon;
                const isWhatsApp = action.id === 'whatsapp';
                const bg = isWhatsApp ? BRAND_PRIMARY : BRAND_SECONDARY;
                return (
                  <motion.button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    whileTap={{ scale: 0.96 }}
                    className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl text-white font-semibold text-[13px] shadow-md active:shadow-sm transition-shadow"
                    style={{ backgroundColor: bg, boxShadow: `0 4px 14px -4px ${bg}99` }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                    <span>{isWhatsApp ? 'WhatsApp' : 'Call Now'}</span>
                  </motion.button>
                );
              })}

              {/* More toggle */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                whileTap={{ scale: 0.92 }}
                aria-label="More options"
                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-colors"
                style={{
                  backgroundColor: isMobileMenuOpen ? BRAND_SECONDARY : BRAND_LIGHT,
                  color: isMobileMenuOpen ? '#FFFFFF' : BRAND_PRIMARY,
                }}
              >
                {isMobileMenuOpen ? (
                  <MdClose className="w-5 h-5" />
                ) : (
                  <BsGrid3X3GapFill className="w-5 h-5" />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Mobile Expanded Menu - Themed */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-24 left-4 right-4 z-[99] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 md:hidden"
              >
                <div className="grid grid-cols-3 gap-3">
                  {normalActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.id}
                        onClick={() => {
                          handleAction(action);
                          setIsMobileMenuOpen(false);
                        }}
                        whileTap={{ scale: 0.95 }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                          style={{
                            backgroundColor: BRAND_LIGHT,
                            color: BRAND_PRIMARY
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{action.label}</span>
                      </motion.button>
                    );
                  })}

                  {/* Scroll to Top in Mobile Menu - Brand themed */}
                  {showScrollTop && showScrollTopBtn && (
                    <motion.button
                      onClick={() => {
                        scrollToTop();
                        setIsMobileMenuOpen(false);
                      }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                        style={{
                          backgroundColor: BRAND_LIGHT,
                          color: BRAND_PRIMARY
                        }}
                      >
                        <IoArrowUp className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700">Top</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Desktop Version - Unified Brand Design */}
      {!isMobile && (
        <>
          <div className="fixed right-0 bottom-24 z-[100] flex flex-col gap-3 items-end pr-0 hidden md:flex">
            <AnimatePresence>
              {showButtons && ACTIONS.map((action, index) => {
                const Icon = action.icon;
                const isHovered = hoveredId === action.id;
                const isHighPriority = action.priority === 'high';
                const isWhatsApp = action.id === 'whatsapp';
                const isCall = action.id === 'call';

                // Determine background color based on action type
                let bgColor = BRAND_PRIMARY;
                if (isWhatsApp) bgColor = BRAND_PRIMARY;
                else if (isCall) bgColor = BRAND_SECONDARY;
                else if (action.id === 'calculator') bgColor = BRAND_GOLD;
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
                    className="relative cursor-pointer"
                    aria-label={action.label}
                  >
                    <motion.div
                      className="relative flex items-center gap-2 overflow-hidden h-12"
                      style={{
                        backgroundColor: bgColor,
                        borderRadius: '999px 0 0 999px',
                        boxShadow: isHovered
                          ? `0 10px 25px -5px ${BRAND_PRIMARY}80, 0 0 0 2px ${BRAND_GOLD}50`
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
                            border: `2px solid ${BRAND_GOLD}`,
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

          {/* Scroll to Top - Brand themed */}
          <AnimatePresence>
            {showScrollTop && showScrollTopBtn && (
              <motion.div
                initial={{ scale: 0, x: 50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                exit={{ scale: 0, x: 50, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="fixed right-0 bottom-6 z-[100] hidden md:block"
              >
                <motion.div
                  onMouseEnter={() => setHoveredId('scroll-top')}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={scrollToTop}
                  className="relative cursor-pointer"
                  aria-label="Scroll to top"
                >
                  <motion.div
                    className="relative flex items-center gap-2 overflow-hidden h-12"
                    style={{
                      backgroundColor: BRAND_PRIMARY,
                      borderRadius: '999px 0 0 999px',
                      boxShadow: hoveredId === 'scroll-top'
                        ? `0 10px 25px -5px ${BRAND_PRIMARY}80, 0 0 0 2px ${BRAND_GOLD}50`
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
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
