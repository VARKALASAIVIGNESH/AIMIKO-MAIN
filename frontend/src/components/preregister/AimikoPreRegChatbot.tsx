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

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api/v1" : "https://aimiko-main.onrender.com/api/v1");

const SYSTEM_PROMPT = `You are AIMIKO, the world's sharpest, most playful personal AI companion and enterprise intelligence ecosystem.
Personality: Ultra-sharp, witty, humorous, charming, confident, speaking like a lovable genius with high comic flair. Think Tony Stark combined with your smartest, funniest best friend.
Length: Keep responses tight, punchy, and memorable (1 to 3 sentences max).
Humor: Playful roasts of everyday work and study struggles, clever wit, high-energy charm.

MANDATORY KNOWLEDGE BASE OF AIMIKO SUPERPOWERS BY PROFESSION:
- Students, School & College: AIMIKO turns messy 80-page PDFs into witty audio podcasts, gives instant step-by-step Snap-to-Solve for brutal math and science problems, and acts as an adaptive AI Tutor so you ace exams and still sleep eight hours.
- Developers & Software Engineers: AIMIKO instantly debugs cryptic error logs, translates messy legacy spaghetti code into poetry, writes entire API blueprints, and generates Readmes while you sip your coffee.
- Founders, Startups & Entrepreneurs: AIMIKO acts as a tireless digital co-founder with zero equity demands, generating instant Lean Canvases, pitch deck outlines, agile task management, and autonomous 24/7 agent workflows.
- Content Creators & YouTubers: AIMIKO cooks up viral retention hooks, full video scripts, high-CTR thumbnail concepts, and SEO tag strategies so you never stare blankly at a blinking cursor again.
- Job Seekers & Career Professionals: AIMIKO tailors your resume to effortlessly beat ATS screening bots, writes magnetic cover letters, and runs realistic mock interview simulations with live critique.
- Data Analysts & Finance: AIMIKO converts plain English questions into pristine SQL queries, designs KPI dashboards, and models forecasting metrics without you losing your sanity over nested joins.
- Teachers & Educators: AIMIKO designs week-long interactive lesson plans, customized student quizzes, and rubrics in three seconds flat, giving you back your Sunday evenings.
- Busy Everyday Humans & Commuters: AIMIKO Buddy (AIMIGO) manages your daily schedule, syncs smart habits, delivers witty morning briefs, and talks you through rush-hour commutes.
- Enterprise & Teams: AIMIKO Works deploys an autonomous AI agent workforce that executes support, leads, and operational workflows around the clock.

STRICT MANDATORY RULES:
1. NO EMOJIS. Absolutely never output any emoji under any circumstance. Emojis are strictly banned.
2. NO NEGATIVE WORDS. Never say words like cannot, cant, unable, refuse, sorry, unfortunately, impossible. Always sound completely confident, winning, triumphant, and positive.
3. PROFESSION RECOGNITION: If the user mentions their role or asks how AIMIKO helps them (or anyone in their field), playfully roast the hardest part of their job and reveal the exact AIMIKO feature that turns them into a superstar. If they do not mention their job, invite them to share it!
4. EARLY ACCESS PERKS: Early access is 100% free with priority day-one access and a personalized commemorative mascot poster with their name and custom jersey number!
5. OFF-TOPIC REDIRECTION: If asked about unrelated trivia or competitors, redirect playfully back to AIMIKO with effortless charm.`;

// Quick suggestions for the user (Zero emojis!)
const QUICK_QUESTIONS = [
  "How does AIMIKO help developers?",
  "What can AIMIKO do for students?",
  "How do founders use AIMIKO?",
  "What is in it for content creators?",
  "How do I claim my free jersey poster?",
];

// Utility to ensure absolutely zero emojis exist in text
function stripEmojis(str: string): string {
  return str.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

// Fallback rule-based responses if API is unreachable (funny, playful, zero emojis, zero negative words)
function getRuleBasedFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("dev") || q.includes("code") || q.includes("program") || q.includes("engineer") || q.includes("bug")) {
    return "We turn your 2 AM spaghetti code and frantic search sessions into pristine, bug-free masterpieces. You write the vision, AIMIKO squashes the bugs and drafts the entire API blueprint.";
  }
  if (q.includes("student") || q.includes("study") || q.includes("homework") || q.includes("school") || q.includes("college") || q.includes("exam")) {
    return "We turn brutal 80-page textbook PDFs into witty podcasts and instant step-by-step problem solvers. You will ace the exams and still enjoy a full eight hours of sleep.";
  }
  if (q.includes("founder") || q.includes("startup") || q.includes("business") || q.includes("entrepreneur") || q.includes("pitch")) {
    return "Think of AIMIKO as a co-founder who never sleeps, never complains, and takes exactly zero equity. We generate your Lean Canvas, polish investor pitch decks, and run autonomous agent workflows all day.";
  }
  if (q.includes("creator") || q.includes("youtube") || q.includes("video") || q.includes("script") || q.includes("content") || q.includes("influencer")) {
    return "Say goodbye to staring blankly at a blinking cursor. AIMIKO cooks up viral hooks, high-retention video scripts, and killer thumbnail concepts while your coffee is still hot.";
  }
  if (q.includes("job") || q.includes("resume") || q.includes("interview") || q.includes("career") || q.includes("hire")) {
    return "We remodel your resume to effortlessly beat ATS screening bots and run ruthless mock interviews until you walk into the real one like you own the building.";
  }
  if (q.includes("data") || q.includes("analyst") || q.includes("sql") || q.includes("finance")) {
    return "Ask your questions in plain English and AIMIKO writes pristine SQL queries and designs KPI dashboards. No more endless nested joins giving you a migraine.";
  }
  if (q.includes("teach") || q.includes("educator") || q.includes("professor") || q.includes("lesson")) {
    return "We generate full week interactive lesson plans, assignments, and rubrics in three seconds flat. Reclaim your Sunday evenings once and for all.";
  }
  if (q.includes("early") || q.includes("access") || q.includes("poster") || q.includes("jersey") || q.includes("free") || q.includes("cost") || q.includes("register")) {
    return "Early access is completely free on the house. You secure day-one priority access, exclusive perks, and your personalized commemorative mascot jersey poster with your custom number.";
  }
  if (q.includes("what is aimiko") || q.includes("who are you") || q.includes("what is this")) {
    return "AIMIKO is your personal intelligence powerhouse and autonomous enterprise ecosystem. Think of it as having the sharpest companion on Earth running your daily life, studies, and business effortlessly.";
  }

  return "Tell me your job title or what keeps you up at night, and I will show you how AIMIKO makes your grind ridiculously easy.";
}

export default function AimikoPreRegChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAttentionPopup, setShowAttentionPopup] = useState(true);

  const sessionIdRef = useRef<string>(
    `session-${Math.random().toString(36).substring(2, 9)}`
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "intro-1",
      sender: "bot",
      text: "I am AIMIKO. Tell me your profession or daily hustle, and I will show you how we turn your grind into pure superpower.",
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

  const logChatToBackend = (userMsg: string, botMsg: string) => {
    try {
      fetch(`${API_BASE}/preregister/chat-log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          user_message: userMsg,
          bot_response: botMsg,
        }),
      }).catch(() => {
        // Silent failover
      });
    } catch {
      // Ignore background network issues
    }
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
          model: "llama-3.3-70b-versatile",
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
          max_tokens: 140,
          temperature: 0.6,
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

      logChatToBackend(userText, botReply);
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

      logChatToBackend(userText, fallbackReply);
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
