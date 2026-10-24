import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ChevronRight,
  Bot,
  PieChart,
  Chrome,
  Building2,
  UserCheck,
  Minimize2,
} from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  actionLink?: { label: string; url: string };
}

export function AimikoGuideChatbot() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "bot",
      text: "Hi! I'm your AIMIKO Platform Guide. How can I help you explore today?",
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickPillars = [
    {
      label: "Individual Dashboards",
      url: "/role-select",
      answer: "AIMIKO provides customized AI dashboards adapted specifically to your age bracket (Kids, Teens, College, Adults, Seniors) and role (Developer, Creator, Analyst, Founder, Teacher).",
    },
    {
      label: "AIMIKO Works",
      url: "/works",
      answer: "AIMIKO Works delivers enterprise multi-tenant AI solutions, custom proposal requests, lead CRM pipeline, and API workflow automation.",
    },
    {
      label: "AIMIKO Pulse",
      url: "/pulse",
      answer: "AIMIKO Pulse gives you natural language Text-to-SQL generators, dataset summaries, KPI tracking, and chart layout recommendations.",
    },
    {
      label: "Chrome Extension",
      url: "/chrome-extension",
      answer: "The AIMIKO Chrome Extension brings your AI companion to any browser tab — summarizing web pages, drafting emails, and answering questions on the fly.",
    },
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");

    // Process guide response
    setTimeout(() => {
      let replyText = "AIMIKO is an adaptive AI platform that scales from personalized daily life companions to enterprise intelligence platforms. You can select your persona or test our AI tools!";
      let actionLink: { label: string; url: string } | undefined = undefined;

      const lower = query.toLowerCase();
      if (lower.includes("dashboard") || lower.includes("age") || lower.includes("role") || lower.includes("student") || lower.includes("kids")) {
        replyText = "Our Individual Dashboards adapt prompt strategies, UI widgets, and tools based on your age and profession!";
        actionLink = { label: "Explore Role Dashboards", url: "/role-select" };
      } else if (lower.includes("agency") || lower.includes("enterprise") || lower.includes("proposal") || lower.includes("b2b")) {
        replyText = "AIMIKO Agency builds enterprise multi-tenant AI pipelines, RAG systems, and custom client workflows.";
        actionLink = { label: "Open AIMIKO Agency", url: "/agency" };
      } else if (lower.includes("business") || lower.includes("sql") || lower.includes("analysis") || lower.includes("data") || lower.includes("kpi")) {
        replyText = "The Business Analysis AI suite includes Text-to-SQL generators, dataset analyzers, and conversion funnel dashboards.";
        actionLink = { label: "Open Business Analysis AI", url: "/business-analysis" };
      } else if (lower.includes("chrome") || lower.includes("extension") || lower.includes("browser") || lower.includes("plugin")) {
        replyText = "The AIMIKO Chrome Extension allows you to highlight text on any webpage to summarize, rephrase, or query AIMIKO!";
        actionLink = { label: "View Chrome Extension", url: "/chrome-extension" };
      } else if (lower.includes("chat") || lower.includes("talk") || lower.includes("gemini") || lower.includes("ollama")) {
        replyText = "You can chat live with AIMIKO in the Smart Chat workspace powered by Gemini or local Ollama models.";
        actionLink = { label: "Open Smart Chat", url: "/chat" };
      }

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: replyText,
        actionLink,
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  };

  const handlePillarClick = (pillar: typeof quickPillars[0]) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      text: pillar.label,
    };

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: "bot",
      text: pillar.answer,
      actionLink: { label: `Go to ${pillar.label.substring(2)}`, url: pillar.url },
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Floating Widget Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-card/95 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl shadow-black/30 flex flex-col overflow-hidden mb-3 animate-pop-in border-primary/30">
          {/* Header */}
          <div className="p-4 border-b border-border/60 bg-secondary/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1 rounded-xl bg-primary/10 border border-primary/20">
                <AimikoAvatar size="sm" animate />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  AIMIKO Platform Guide
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </h4>
                <span className="text-[10px] text-muted-foreground font-semibold">Online · Ask me anything</span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-secondary"
                onClick={() => setIsOpen(false)}
              >
                <Minimize2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 custom-scrollbar text-xs font-medium">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none shadow-md shadow-primary/15"
                      : "bg-secondary/80 border border-border/60 text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.text}

                  {msg.actionLink && (
                    <Button
                      onClick={() => {
                        navigate(msg.actionLink!.url);
                        setIsOpen(false);
                      }}
                      size="sm"
                      className="mt-2.5 w-full rounded-xl text-xs font-semibold aimiko-gradient text-white border-0 shadow-sm"
                    >
                      {msg.actionLink.label}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Pillar Chips */}
          <div className="p-2.5 bg-secondary/30 border-t border-border/40 overflow-x-auto flex gap-1.5 custom-scrollbar">
            {quickPillars.map((pillar) => (
              <button
                key={pillar.label}
                onClick={() => handlePillarClick(pillar)}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:text-primary shrink-0 transition-colors"
              >
                {pillar.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-border/60 bg-card flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about AIMIKO features..."
              className="flex-1 bg-secondary/60 border border-border/60 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
            />
            <Button
              onClick={() => handleSend()}
              size="icon"
              className="h-8 w-8 rounded-xl aimiko-gradient text-white shrink-0 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Trigger Button: Just logo and 'Talk to me' */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center gap-2.5 py-2 px-4 rounded-full bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-2xl border border-violet-200/90 dark:border-violet-800/60 text-slate-900 dark:text-white shadow-xl shadow-purple-500/15 hover:shadow-2xl hover:shadow-purple-500/25 hover:scale-105 hover:border-violet-500/60 transition-all duration-300"
      >
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500/20 via-pink-500/20 to-sky-400/20 p-1 border border-violet-500/30 flex items-center justify-center shrink-0">
          <img
            src="/brand/mascot_miko.png"
            alt="AIMIKO"
            className="w-full h-full object-contain rounded-full drop-shadow-sm group-hover:scale-110 transition-transform"
          />
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5 font-bold text-sm tracking-tight text-slate-900 dark:text-white">
          <span>Talk to me</span>
          <Sparkles className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400 fill-violet-500/20 group-hover:rotate-12 transition-transform" />
        </div>
      </button>
    </div>
  );
}
