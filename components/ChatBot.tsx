'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: string[];
}

interface ChatState {
  flow?: string | null;
  step?: number;
  data?: Record<string, any>;
}

const WELCOME: Msg = {
  role: 'assistant',
  content:
    'Hello 👋 Welcome to *EzyLoan*. I’m *EzySaathi AI*, your digital loan assistant. I can help you explore loan options, check preliminary eligibility, calculate your EMI, or connect you with a specialist.\n\n*How may I help you today?*',
  // Every service we provide, with the original friendly labels.
  // Keep in sync with WELCOME_MENU in lib/chatbot/engine.ts.
  quickReplies: [
    'Additional funds against my car',
    'Used Car Loan',
    'New Car Loan',
    'Commercial Vehicle Loan',
    'Personal Loan',
    'Loan Against Property',
    'Check My Eligibility',
    'Calculate EMI',
    'Talk to a Loan Specialist',
  ],
};

// Render very light markdown (*bold* and _italic_ and line breaks) safely as
// plain React nodes — no dangerouslySetInnerHTML.
function renderText(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    // Simple "### heading" support — used e.g. for the big estimated EMI figure.
    if (/^###\s+/.test(line)) {
      return (
        <p key={i} className="my-0.5 text-lg font-bold text-[#2563eb]">
          {line.replace(/^###\s+/, '')}
        </p>
      );
    }
    return (
    <React.Fragment key={i}>
      {line.split(/(\*[^*]+\*|_[^_]+_)/g).map((part, j) => {
        if (/^\*[^*]+\*$/.test(part)) return <strong key={j}>{part.slice(1, -1)}</strong>;
        if (/^_[^_]+_$/.test(part)) return <em key={j} className="text-gray-500">{part.slice(1, -1)}</em>;
        return <React.Fragment key={j}>{part}</React.Fragment>;
      })}
      {i < text.split('\n').length - 1 && <br />}
    </React.Fragment>
    );
  });
}

const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ChatState>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((m) => [...m, { role: 'user', content: text }]);
      setInput('');
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, state, history }),
        });
        const data = await res.json();
        setState(data.state || {});
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: data.reply || 'Sorry, please try again.', quickReplies: data.quickReplies },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              'I’m having trouble connecting right now. Please call us on +91 6372977626 or try again in a moment.',
          },
        ]);
      } finally {
        setLoading(false);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    },
    [loading, messages, state],
  );

  return (
    <>
      {/* Launcher button — bottom-right corner */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Chat with EzySaathi AI"
          className="fixed bottom-24 right-4 z-[9998] flex origin-right items-center gap-2 rounded-full border border-white/25 bg-gradient-to-r from-[#2563eb]/80 to-[#06b6d4]/80 px-4 py-3 text-white shadow-xl backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-105 md:bottom-6 md:right-6"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="hidden text-sm font-semibold sm:inline">Chat with us</span>
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-ping rounded-full bg-green-400" />
          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-green-500" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-4 z-[9998] flex h-[min(68vh,540px)] w-[min(92vw,384px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl md:bottom-6 md:right-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-[#2563eb] to-[#06b6d4] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold leading-tight">EzySaathi AI</p>
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-green-400" /> Online · Your Digital Loan Assistant
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 px-3 py-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                    m.role === 'user'
                      ? 'rounded-br-md bg-[#2563eb] text-white'
                      : 'rounded-bl-md border border-gray-100 bg-white text-gray-800'
                  }`}
                >
                  {renderText(m.content)}
                </div>
              </div>
            ))}

            {/* Quick replies from the latest assistant message */}
            {!loading &&
              messages.length > 0 &&
              messages[messages.length - 1].role === 'assistant' &&
              messages[messages.length - 1].quickReplies?.length ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {messages[messages.length - 1].quickReplies!.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-[#2563eb]/30 bg-white px-3 py-1.5 text-xs font-medium text-[#2563eb] shadow-sm transition-colors hover:bg-[#2563eb] hover:text-white"
                  >
                    {q}
                  </button>
                ))}
              </div>
            ) : null}

            {loading && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              maxLength={1000}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#2563eb] to-[#06b6d4] text-white transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="bg-white pb-2 text-center text-[10px] leading-tight text-gray-400">
            EzySaathi AI gives preliminary guidance only. Final approval &amp; rates are decided by the lending partner.
          </p>
        </div>
      )}
    </>
  );
};

export default ChatBot;
