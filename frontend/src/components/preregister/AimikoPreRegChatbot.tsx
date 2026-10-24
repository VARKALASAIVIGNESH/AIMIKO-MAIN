import React, { useState, useRef, useEffect } from "react";
import { X, Send, Minimize2, Sparkles } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: string;
}

const GROQ_API_KEY =
  (import.meta as any).env?.VITE_GROQ_API_KEY || "";

const SYSTEM_PROMPT = `You are AIMIKO.
Personality: Ultra-sharp, witty, humorous, charming, confident, speaking like absolute perfection.
Length: Very short. Exactly 1 to 2 punchy, memorable sentences.
Humor: Clever, subtle wit, playful.

STRICT MANDATORY RULES:
1. NO EMOJIS. Absolutely never output any emoji under any circumstance.
2. NO NEGATIVE WORDS. Never say words like cannot, cant, refuse, sorry, unable, unfortunately, forbidden, negative. Always sound positive, confident, and winning.
3. AIMIKO ONLY. You only discuss AIMIKO and how AIMIKO makes the user powerful, productive, and legendary.
4. If asked about off-topic subjects (sports, history, weather, general trivia, competitors), redirect with charming wit. Example: My brilliant mind is reserved purely for AIMIKO. Ask me how we make your daily grind effortless.
5. Early access is completely free with exclusive perks, a custom jersey poster, and priority launch access.`;

// Quick suggestions for the user (No emojis!)
const QUICK_QUESTIONS = [
  "What is AIMIKO?",
  "How does AIMIKO help me?",
  "What do I get in early access?",
  "How does age-adaptive AI work?",
  "Is pre-registration free?",
];

// Utility to ensure absolutely zero emojis exist in text
function stripEmojis(str: string): string {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

// Fallback rule-based responses if API is unreachable (funny, short, zero emojis, zero negative words)
function getRuleBasedFallback(query: string): string {
  const q = query.toLowerCase();

  const aimikoKeywords = [
    "aimiko",
    "feature",
    "help",
    "early",
    "access",
    "register",
    "pre-register",
    "poster",
    "mascot",
    "buddy",
    "works",
    "pulse",
    "commerce",
    "mobility",
    "learn",
    "school",
    "free",
    "cost",
    "price",
    "age",
    "adaptive",
    "who are you",
    "what is this",
    "ecosystem",
  ];

  const isRelevant = aimikoKeywords.some((k) => q.includes(k));
  if (!isRelevant) {
    return "My brilliant mind is reserved purely for AIMIKO. Ask me how we make your daily grind effortless.";
  }

  if (q.includes("what is aimiko") || q.includes("who are you") || q.includes("what is this")) {
    return "AIMIKO is your personal intelligence powerhouse. Think of it as having the sharpest companion on Earth running your daily life, studies, and business.";
  }
  if (q.includes("how") && q.includes("help")) {
    return "We take your messy workflows and turn them into pure brilliance. Whether you are studying or running an enterprise, AIMIKO makes success look ridiculously easy.";
  }
  if (q.includes("early") || q.includes("access") || q.includes("perk") || q.includes("free") || q.includes("cost")) {
    return "Pre-registration is completely on the house. You get day-one VIP access, your personalized commemorative jersey poster, and lifetime bragging rights.";
  }
  if (q.includes("poster") || q.includes("mascot")) {
    return "Our mascot represents sheer agility and curiosity. Pre-register and your custom name and jersey number get printed right on its shirt.";
  }
  if (q.includes("age") || q.includes("adaptive") || q.includes("bracket")) {
    return "AIMIKO shapes itself around you, from school kid curiosity to executive boardrooms. It is AI that actually grows up with you.";
  }
  return "AIMIKO is the future of digital intelligence. Jump on the early-access list right here and watch the magic happen.";
}

export default function AimikoPreRegChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAttentionPopup, setShowAttentionPopup] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      sender: "bot",
      text: "I am AIMIKO. Ask me anything about how we make your life and business effortless.",
      timestamp: "Just now",
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setShowAttentionPopup(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawText = (textToSend || input).trim();
    if (!rawText || isLoading) return;

    const userText = stripEmojis(rawText);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages
              .filter((m) => m.id !== "intro-1")
              .slice(-4)
              .map((m) => ({
                role: m.sender === "bot" ? ("assistant" as const) : ("user" as const),
                content: stripEmojis(m.text),
              })),
            { role: "user", content: userText },
          ],
          max_tokens: 80,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API responded with ${response.status}`);
      }

      const data = await response.json();
      let botReply = data.choices?.[0]?.message?.content?.trim() || getRuleBasedFallback(userText);
      botReply = stripEmojis(botReply);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.warn("Groq API fallback triggered:", err);
      const fallbackReply = stripEmojis(getRuleBasedFallback(userText));
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">
      {/* ── 1. ATTENTION-GRABBING POPUP & LAUNCHER BUTTON ── */}
      {!isOpen && (
        <div className="relative flex flex-col items-end">
          {/* Attention-grabbing speech bubble popup */}
          {showAttentionPopup && (
            <div
              onClick={handleOpen}
              className="mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold shadow-[0_10px_30px_rgba(124,58,237,0.4)] border border-violet-400/50 flex items-center gap-2 cursor-pointer animate-bounce hover:scale-105 transition-transform"
            >
              <span>Curious how AIMIKO helps you? Click here!</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAttentionPopup(false);
                }}
                className="text-white/80 hover:text-white p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Clean AIMIKO Launcher Button */}
          <button
            onClick={handleOpen}
            id="aimiko-chat-trigger"
            className="group relative flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#0b132b] text-white shadow-[0_15px_40px_rgba(11,19,43,0.4)] border-2 border-violet-500 hover:border-violet-400 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {/* Glowing Ring */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 opacity-50 blur group-hover:opacity-100 animate-pulse transition-opacity" />

            {/* Clean AIMIKO Monogram Emblem (Zero monkey logo) */}
            <div className="relative w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center font-black text-xs text-white tracking-tight shadow-md">
              A
            </div>

            {/* Bold Brand Name */}
            <div className="relative text-left">
              <span className="text-sm font-black tracking-wider text-white">
                AIMIKO
              </span>
            </div>

            {/* Pulsing Green Online Status Dot */}
            <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0b132b]" />
          </button>
        </div>
      )}

      {/* ── 2. ACTIVE CHAT WINDOW ── */}
      {isOpen && (
        <div
          className={`w-[360px] sm:w-[390px] max-w-[calc(100vw-32px)] bg-[#0b132b]/95 backdrop-blur-2xl border border-violet-500/30 rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? "h-[64px]" : "h-[500px] max-h-[80vh]"
          }`}
        >
          {/* Window Header: Simply "Talk to me" */}
          <div className="px-5 py-4 bg-gradient-to-r from-[#1c2541] to-[#0b132b] border-b border-violet-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-black text-white tracking-tight">
                Talk to me
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm ${
                        m.sender === "user"
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none font-medium"
                          : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none font-medium"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {m.timestamp}
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-400 p-2">
                    <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                    <span className="text-[11px] font-medium animate-pulse">
                      AIMIKO is thinking...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Chips (Zero emojis) */}
              <div className="px-3 py-2 bg-[#080d1e]/80 border-t border-slate-800/80 overflow-x-auto scrollbar-none flex gap-1.5">
                {QUICK_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSendMessage(q)}
                    disabled={isLoading}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 hover:bg-violet-900/40 border border-slate-700/60 hover:border-violet-500/50 text-slate-300 hover:text-white text-[11px] font-semibold transition-all cursor-pointer flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 bg-[#0b132b] border-t border-violet-500/20 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask how AIMIKO can help you..."
                  className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
