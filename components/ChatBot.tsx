'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, Mic, Volume2, VolumeX } from 'lucide-react';

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
  // Every product we provide, by name (hero product first), plus the utilities.
  // Keep in sync with WELCOME_MENU in lib/chatbot/engine.ts.
  quickReplies: [
    'Car Loan Top-Up',
    'Used Car Balance Transfer',
    'Used Car Refinance',
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
  const [listening, setListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  // Whether EzySaathi speaks her replies aloud (female voice). On by default.
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceOnRef = useRef(true);
  // The female voice we picked from the browser's available voices.
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  // Text captured before the current dictation started, so we append rather than
  // overwrite anything the user had already typed.
  const baseInputRef = useRef('');
  // True while the user wants the mic on. The recognizer stops itself after a
  // pause; we auto-restart it while this is true so dictation keeps going until
  // the user taps the mic again.
  const wantListeningRef = useRef(false);
  // Whether the text currently in the box was produced by voice — sent to the API
  // so the admin analytics can show voice-vs-typed usage. Reset when the user types.
  const viaRef = useRef<'text' | 'voice'>('text');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading, open]);

  // Keep the ref in sync so the speak() callback always sees the latest setting.
  useEffect(() => {
    voiceOnRef.current = voiceOn;
    if (!voiceOn && typeof window !== 'undefined') window.speechSynthesis?.cancel();
  }, [voiceOn]);

  // Pick a female voice from whatever the browser exposes. Voices load
  // asynchronously, so we re-run on the `voiceschanged` event too.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const pick = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      // Known female voice names across Chrome/Edge/Safari/Android, plus a
      // generic female/woman/girl match. English ONLY — never a Hindi voice,
      // so the greeting always sounds like clear English. Prefer Indian English.
      const femaleRe =
        /(female|woman|girl|zira|susan|samantha|karen|tessa|fiona|moira|veena|raveena|heera|kalpana|swara|neerja|aria|jenny|libby|sonia|google uk english female)/i;
      const englishVoices = voices.filter((v) => /^en(-|$)/i.test(v.lang));
      femaleVoiceRef.current =
        englishVoices.find((v) => /^en-IN/i.test(v.lang) && femaleRe.test(v.name)) ||
        englishVoices.find((v) => femaleRe.test(v.name)) ||
        englishVoices.find((v) => /^en-IN/i.test(v.lang)) ||
        englishVoices[0] ||
        null;
    };
    pick();
    window.speechSynthesis.onvoiceschanged = pick;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Speak a bot reply aloud in the chosen female voice. Strips markdown/emoji
  // so the speech sounds natural. No-op if the user muted the voice.
  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !voiceOnRef.current) return;
    const clean = text
      .replace(/[*_#`>]/g, '')
      // Speak the brand names the way they should sound in English. This only
      // affects the spoken audio — the on-screen text still shows the real
      // spelling (EzyLoan / EzySaathi).
      .replace(/EzyLoan/gi, 'Easy Loan')
      .replace(/EzySaathi/gi, 'Ezzy Saathi')
      // Strip emoji/pictographs (surrogate-pair range) without needing the
      // Unicode regex flag, which this project's TS target doesn't allow.
      .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '')
      .replace(/[←-⇿⌀-➿⬀-⯿️]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;
    window.speechSynthesis.cancel(); // don't overlap with a previous utterance
    const u = new SpeechSynthesisUtterance(clean);
    if (femaleVoiceRef.current) u.voice = femaleVoiceRef.current;
    // Always English so the greeting is never spoken in Hindi, even if the
    // browser only exposes a non-English default voice.
    u.lang = /^en(-|$)/i.test(femaleVoiceRef.current?.lang || '')
      ? (femaleVoiceRef.current!.lang)
      : 'en-IN';
    u.rate = 1;
    u.pitch = 1.15; // a touch higher for a warm, feminine tone
    window.speechSynthesis.speak(u);
  }, []);

  // Greet aloud when the chat is opened (the open click is a user gesture, so
  // browsers allow speech). Stop talking when it's closed.
  useEffect(() => {
    if (open) {
      const last = [...messages].reverse().find((m) => m.role === 'assistant');
      if (last) speak(last.content);
    } else if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Set up Web Speech API voice input (Chrome/Edge/most mobile browsers).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English — handles common Hindi/English mix well
    recognition.continuous = true; // keep listening through natural pauses
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      viaRef.current = 'voice';
      // Only look at results new since last event. Finalised chunks are appended
      // to the confirmed text; interim words are shown live but not yet committed.
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const text = res[0].transcript;
        if (res.isFinal) {
          const base = baseInputRef.current;
          baseInputRef.current = (base ? base.trimEnd() + ' ' : '') + text.trim();
        } else {
          interim += text;
        }
      }
      const base = baseInputRef.current;
      setInput(base + (interim ? (base ? ' ' : '') + interim : ''));
    };

    // The engine ends itself after silence. If the user still wants the mic on,
    // restart it so dictation continues seamlessly.
    recognition.onend = () => {
      if (wantListeningRef.current) {
        try {
          recognition.start();
          return;
        } catch {
          /* fall through to turning the indicator off */
        }
      }
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      // Permission denied → stop for good and explain. Transient errors
      // (no-speech, aborted) are handled by onend's auto-restart.
      if (event?.error === 'not-allowed' || event?.error === 'service-not-allowed') {
        wantListeningRef.current = false;
        setListening(false);
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              'I couldn’t access your microphone. Please allow microphone permission for this site in your browser, then tap the 🎤 again.',
          },
        ]);
      }
    };

    recognitionRef.current = recognition;
    setMicSupported(true);

    return () => {
      try {
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  const toggleMic = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      // Browser has no Speech Recognition — tell the user in-chat instead of
      // the button doing nothing.
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Voice typing isn’t supported in this browser. Please use *Google Chrome*, *Microsoft Edge*, or a modern mobile browser — or just type your message here. 🙂',
        },
      ]);
      return;
    }
    if (listening) {
      wantListeningRef.current = false; // stop for good (don't auto-restart)
      try { recognition.stop(); } catch { /* ignore */ }
      setListening(false);
      return;
    }
    // Start fresh from whatever is already in the box.
    baseInputRef.current = input.trim();
    wantListeningRef.current = true;
    try {
      recognition.start();
      setListening(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      // start() throws if called while already active — reset state.
      wantListeningRef.current = false;
      setListening(false);
    }
  }, [listening, input]);

  const send = useCallback(
    async (raw: string, via: 'text' | 'voice' = 'text') => {
      const text = raw.trim();
      if (!text || loading) return;

      // Stop any active dictation as soon as the message is sent.
      wantListeningRef.current = false;
      if (listening) {
        try {
          recognitionRef.current?.stop();
        } catch {
          /* ignore */
        }
        setListening(false);
      }
      baseInputRef.current = '';

      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      setMessages((m) => [...m, { role: 'user', content: text }]);
      setInput('');
      viaRef.current = 'text'; // reset for the next message
      setLoading(true);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, state, history, via }),
        });
        const data = await res.json();
        setState(data.state || {});
        const reply = data.reply || 'Sorry, please try again.';
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: reply, quickReplies: data.quickReplies },
        ]);
        speak(reply); // read the answer aloud in EzySaathi's female voice
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
    [loading, messages, state, listening, speak],
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
            <div className="flex items-center gap-1">
              {/* Voice on/off — mutes EzySaathi's spoken replies */}
              <button
                onClick={() => setVoiceOn((v) => !v)}
                aria-label={voiceOn ? 'Mute voice' : 'Unmute voice'}
                aria-pressed={voiceOn}
                title={voiceOn ? 'Voice on — tap to mute' : 'Voice off — tap to unmute'}
                className="rounded-full p-1 hover:bg-white/20"
              >
                {voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-full p-1 hover:bg-white/20">
                <X className="h-5 w-5" />
              </button>
            </div>
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
              send(input, viaRef.current);
            }}
            className="flex items-center gap-2 border-t border-gray-200 bg-white p-2.5"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                viaRef.current = 'text'; // manual typing overrides voice attribution
                setInput(e.target.value);
              }}
              placeholder={listening ? 'Listening… speak now' : 'Type or tap 🎤 to speak…'}
              maxLength={1000}
              className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]"
            />
            {/* Mic (voice-to-text). Always visible. While recording it glows red
                and pulses so it clearly reads as "listening", not muted. */}
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? 'Stop voice input' : 'Speak your message'}
              aria-pressed={listening}
              title={
                !micSupported
                  ? 'Voice input needs Chrome, Edge or a supported mobile browser'
                  : listening
                    ? 'Listening… tap to stop'
                    : 'Tap and speak'
              }
              className={`relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                listening
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : micSupported
                    ? 'border border-gray-200 bg-gray-50 text-[#2563eb] hover:bg-gray-100'
                    : 'border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {listening && (
                <span className="absolute inset-0 animate-ping rounded-full bg-red-400/60" />
              )}
              {/* Always the mic icon — the red pulse conveys "recording". */}
              <Mic className={`relative h-4 w-4 ${listening ? 'animate-pulse' : ''}`} />
            </button>
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
