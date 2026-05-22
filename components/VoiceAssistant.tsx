'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  const recognitionRef = useRef<any>(null);

  // DeepSeek API function
  const getAIResponse = async (query: string) => {
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
  };

  useEffect(() => {
    // ✅ 100% ERROR-FREE: Using 'any' type to bypass TypeScript check
    if (typeof window !== 'undefined') {
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
    }
  }, [onSearch]);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setShowNeedHelp(false);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleWhatsAppRedirect = () => {
    const phoneNumber = '916372977626';
    const message = encodeURIComponent(`Hi, I need help with loan services. I was searching for: ${transcript || 'loan information'}`);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setShowNeedHelp(false);
      setTranscript('');
      setAiResponse({ answer: '', isLoading: false });
    }
  };

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

            {/* 📸 Instagram Button - Visible on ALL screens (Mobile + Desktop) */}
            <button
              onClick={() => window.open('https://www.instagram.com/ezyloanofficials/', '_blank')}
              className="w-10 h-10 sm:w-12 mb-10 lg:mb-3 sm:h-12 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:scale-110 border-2 border-white/20"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
            
            {/* 📱 Phone Button - Hidden on Mobile, Visible on Desktop (sm+) */}
            <button
              onClick={() => window.open('tel:+916372977626', '_blank')}
              className="hidden sm:flex w-12 h-12 rounded-full shadow-lg transition-all duration-300 items-center justify-center bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 hover:scale-110 border-2 border-white/20"
              aria-label="Call"
            >
              <Phone className="w-5 h-5 text-white" />
            </button>
            
            {/* 💬 WhatsApp Button - Hidden on Mobile, Visible on Desktop (sm+) */}
            <button
              onClick={() => window.open('https://wa.me/916372977626', '_blank')}
              className="hidden sm:flex w-12 h-12 rounded-full shadow-lg transition-all duration-300 items-center justify-center bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 hover:scale-110 border-2 border-white/20"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* <button
            onClick={toggleAssistant}
            className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
              isOpen
                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
            } hover:scale-110 border-2 sm:border-4 border-white/20`}
          >
            {isOpen ? (
              <X className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            ) : (
              <Mic className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            )}
          </button>

          {isListening && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 animate-ping opacity-75"></div>
          )} */}

          {/* {isOpen && (
            <div className="absolute bottom-16 sm:bottom-20 right-0 w-72 sm:w-80 md:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 transform transition-all duration-300 scale-100 max-h-[80vh] overflow-y-auto">
              <div className="space-y-3 sm:space-y-4">
                <div className="text-center">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">🎤 Voice Assistant</h3>
                  <p className="text-xs sm:text-sm text-gray-600">बोलिए, मैं आपकी मदद करूंगा!</p>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    disabled={!recognitionRef.current}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                      isListening
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600'
                    }`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Start</span>
                      </>
                    )}
                  </button>
                </div> */}

                {/* {isListening && (
                  <div className="text-center">
                    <div className="flex justify-center items-center space-x-1 sm:space-x-2 text-blue-600">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-xs sm:text-sm text-blue-600 mt-1 sm:mt-2">सुन रहा हूं...</p>
                  </div>
                )}

                {transcript && (
                  <div className="bg-gray-100 rounded-lg p-2 sm:p-3">
                    <p className="text-xs sm:text-sm text-gray-700">
                      <strong>आपने कहा:</strong> {transcript}
                    </p>
                  </div>
                )}

                {aiResponse.isLoading && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="text-center space-y-2 sm:space-y-3">
                      <div className="text-blue-600">
                        <Loader className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-1 sm:mb-2 animate-spin" />
                        <p className="text-sm sm:text-base font-semibold">AI से जवाब ला रहा हूं...</p>
                      </div>
                    </div>
                  </div>
                )}

                {aiResponse.answer && !aiResponse.isLoading && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-blue-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-blue-600 flex items-center space-x-1 sm:space-x-2">
                        <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
                        <p className="text-sm sm:text-base font-semibold">EzyLoan Assistant का जवाब:</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-100">
                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                          {aiResponse.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {showNeedHelp && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 sm:p-4 border border-green-200">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="text-green-600 flex items-center space-x-1 sm:space-x-2">
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        <p className="text-sm sm:text-base font-semibold">मदद चाहिए?</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        हमारे एक्सपर्ट से बात करने के लिए WhatsApp पर संपर्क करें!
                      </p>
                      <button
                        onClick={handleWhatsAppRedirect}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                      >
                        <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>WhatsApp पर संपर्क करें</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
                  <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1 sm:mb-2">💡 कैसे इस्तेमाल करें:</h4>
                  <ul className="text-xs text-gray-600 space-y-0.5 sm:space-y-1">
                    <li>• "Start" दबाकर बोलना शुरू करें</li>
                    <li>• लोन के बारे में कोई भी सवाल पूछें</li>
                    <li>• आप बोलकर अपना EMI भी calculate कर सकते हैं</li>
                    <li>• हिंदी या अंग्रेजी में बात करें</li>
                  </ul>
                </div>
                
                <div className="text-center mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400">
                    Developed by <span className="font-semibold text-blue-500">2solution.in</span>
                  </p>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

export default VoiceAssistant;