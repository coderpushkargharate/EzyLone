'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, MessageCircle, X, Bot, Loader, Facebook, Phone, Calculator, Instagram } from 'lucide-react';

interface VoiceAssistantProps {
  onSearch?: (query: string) => void;
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ onSearch }) => {
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showNeedHelp, setShowNeedHelp] = useState(false);
  const [aiResponse, setAiResponse] = useState({ answer: '', isLoading: false });
  const [isClient, setIsClient] = useState(false);
  const recognitionRef = useRef<any>(null);

  // ✅ FIX: Mark component as client-side only to avoid SSR issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // DeepSeek API function
  const getAIResponse = useCallback(async (query: string) => {
    setAiResponse({ answer: '', isLoading: true });
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-1a7508db24d145de93f3e64ba3d299b5'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful loan assistant for EzyLoan company. Answer loan-related questions in Hindi/English in exactly 5 lines. Be concise and helpful. Focus on personal loans, car loans, home loans, EMI calculations, and loan processes.'
            },
            {
              role: 'user',
              content: query
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || 'मुझे खुशी होगी आपकी मदद करने में। कृपया अपना प्रश्न दोबारा पूछें।';
      
      setAiResponse({ answer, isLoading: false });
    } catch (error) {
      console.error('AI API Error:', error);
      setAiResponse({ 
        answer: 'मुझे खुशी होगी आपकी मदद करने में। कृपया WhatsApp पर संपर्क करें।', 
        isLoading: false 
      });
    }
  }, []);

  useEffect(() => {
    // ✅ FIX: Only initialize SpeechRecognition on client
    if (!isClient || typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN';

      recognitionRef.current.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        setIsListening(false);
        
        getAIResponse(result);
        setShowNeedHelp(true);
        
        if (onSearch) {
          onSearch(result);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onSearch, isClient, getAIResponse]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && isClient) {
      setIsListening(true);
      setTranscript('');
      setShowNeedHelp(false);
      recognitionRef.current.start();
    }
  }, [isClient]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const handleWhatsAppRedirect = useCallback(() => {
    const phoneNumber = '916372977626';
    const message = encodeURIComponent(`Hi, I need help with loan services. I was searching for: ${transcript || 'loan information'}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }, [transcript]);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setShowNeedHelp(false);
      setTranscript('');
      setAiResponse({ answer: '', isLoading: false });
    }
  }, [isOpen]);

  // ✅ FIX: Return null during SSR to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <div className="relative flex flex-col items-center space-y-3">
          <div className="flex flex-col space-y-3">
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