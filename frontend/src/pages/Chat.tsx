import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AimikoAvatar, AimikoThinking } from "@/components/AimikoAvatar";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Lock,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse, ChatMessage } from "@/lib/ai";
import { api } from "@/lib/api";

interface Message {
  id: number;
  sender: "user" | "aimiko";
  text: string;
}

const initialMessages: Message[] = [
  { id: 1, sender: "aimiko", text: "Hey there! I'm AIMIKO, your AI companion. What's on your mind today?" },
];

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [guestCount, setGuestCount] = useState<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [isVoiceOn, setIsVoiceOn] = useState(() => localStorage.getItem("aimiko_voice_on") === "true");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
      rec.onerror = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (location.state?.text) setInput(location.state.text);
  }, [location.state]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const toggleVoice = () => {
    const newVal = !isVoiceOn;
    setIsVoiceOn(newVal);
    localStorage.setItem("aimiko_voice_on", String(newVal));
    if (!newVal) window.speechSynthesis.cancel();
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported. Try Chrome!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const speak = (text: string) => {
    if (!isVoiceOn) return;
    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/```[\s\S]*?```/g, "[code block]")
      .replace(/`.*?`/g, "")
      .replace(/\*\*|#|-|\*/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Load conversation history for authenticated user
  useEffect(() => {
    const token = localStorage.getItem("aimiko_token");
    if (token) {
      api.buddy.getConversations().then((convs) => {
        if (convs && convs.length > 0) {
          const latest = convs[0];
          setActiveConvId(latest.id);
          api.buddy.getConversationMessages(latest.id).then((history) => {
            if (history && history.length > 0) {
              setMessages(history.map((m) => ({
                id: m.id,
                sender: m.role === "user" ? "user" : "aimiko",
                text: m.content,
              })));
            }
          }).catch(() => {});
        }
      }).catch(() => {});
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();

    // Guest action-gating: Allow 3 free test prompts, then invite sign up
    const token = localStorage.getItem("aimiko_token");
    if (!token && guestCount >= 3) {
      setShowAuthModal(true);
      return;
    }

    if (!incrementPromptUsage()) {
      if (confirm("Daily limit reached. Upgrade to Premium for unlimited prompts?")) navigate("/upgrade");
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now(), sender: "user", text: userText }]);
    setInput("");
    setIsThinking(true);

    try {
      // 1. Generate real-time response via Groq Cloud LPU
      const history: ChatMessage[] = messages
        .filter((m) => m.id !== initialMessages[0].id)
        .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }));

      const responseText = await generateAIResponse(userText, ageGroup, role, history);
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "aimiko", text: responseText }]);
      speak(responseText);

      // 2. Synchronize conversation to backend database
      if (token) {
        api.buddy.chat({
          message: userText,
          role: role || "student",
          age_group: ageGroup,
          conversation_id: activeConvId,
          mode: "chat",
        }).then((res) => {
          if (res.conversation_id && !activeConvId) {
            setActiveConvId(res.conversation_id);
          }
        }).catch((err) => console.warn("Background chat history sync notice:", err));
      } else {
        setGuestCount((prev) => prev + 1);
      }
    } catch (error: any) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: "aimiko", text: `I encountered an issue connecting to Groq LPU: ${error.message}` }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Header */}
      <header className="h-13 flex items-center justify-between border-b border-border/60 px-5 bg-background/80 backdrop-blur-xl sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg border border-border bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <AimikoAvatar size="sm" animate />
          <div>
            <p className="font-semibold text-foreground text-sm leading-none">Chat with AIMIKO</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Always here to help</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleVoice}
          className={`h-8 w-8 rounded-lg border transition-colors ${
            isVoiceOn
              ? "text-primary bg-primary/10 border-primary/20 hover:bg-primary/15"
              : "text-muted-foreground border-border hover:bg-secondary"
          }`}
          title={isVoiceOn ? "Mute voice" : "Enable voice"}
        >
          {isVoiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 max-w-3xl w-full mx-auto custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
          >
            {msg.sender === "aimiko" && <AimikoAvatar size="sm" className="mt-1 shrink-0" />}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "aimiko-gradient text-primary-foreground rounded-br-sm"
                  : "bg-card border border-border/70 text-foreground rounded-bl-sm"
              }`}
            >
              {msg.sender === "user" ? msg.text : parseAndRenderMessage(msg.text)}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex gap-3 animate-fade-in">
            <AimikoThinking />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border/60 bg-background/80 backdrop-blur-xl px-4 md:px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto flex gap-2.5">
          <Button
            onClick={toggleListening}
            size="icon"
            className={`rounded-xl h-11 w-11 shrink-0 border transition-all press ${
              isListening
                ? "bg-red-500 hover:bg-red-600 text-white border-red-400 animate-pulse"
                : "bg-secondary hover:bg-muted text-muted-foreground border-border"
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder={isListening ? "Listening..." : "Ask AIMIKO anything..."}
            className="flex-1 rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
            disabled={isListening}
          />

          <Button
            onClick={handleSend}
            disabled={!input.trim()}
            size="icon"
            className="rounded-xl h-11 w-11 aimiko-gradient text-primary-foreground border-0 shadow-md shadow-primary/20 disabled:opacity-40 press shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Guest Action-Gating Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-card border border-border/80 rounded-2xl p-6 shadow-2xl space-y-5 animate-pop-in">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mx-auto">
              <Lock className="h-6 w-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Save Conversation & Continue</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have reached the free guest preview limit. Create a free account or sign in to continue chatting, unlock persistent memory, and sync notes and tasks across your devices.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 rounded-xl aimiko-gradient text-primary-foreground font-semibold press"
              >
                Sign In or Create Account
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAuthModal(false)}
                className="w-full h-11 rounded-xl press"
              >
                Continue Browsing
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>100% Free • Zero Credit Card Required</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function parseAndRenderMessage(text: string) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, index) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n([\s\S]*?)```/);
      const language = match ? match[1] : "code";
      const code = match ? match[2] : part.slice(3, -3);
      return (
        <div key={index} className="my-3 rounded-xl overflow-hidden border border-border bg-zinc-950 dark:bg-zinc-900 text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 text-zinc-400 border-b border-zinc-800">
            <span className="uppercase text-[10px] font-semibold tracking-wider">{language || "code"}</span>
            <button
              onClick={() => navigator.clipboard.writeText(code.trim())}
              className="text-[10px] hover:text-zinc-200 transition-colors"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-100 whitespace-pre leading-relaxed">
            <code>{code.trim()}</code>
          </pre>
        </div>
      );
    }

    const lines = part.split("\n");
    let isInsideTable = false;
    let tableRows: string[][] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, lIndex) => {
      if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
        const cells = line.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.every((c) => c.startsWith("-"))) return;
        isInsideTable = true;
        tableRows.push(cells);
        return;
      } else if (isInsideTable) {
        elements.push(renderTable(tableRows, `table-${lIndex}`));
        isInsideTable = false;
        tableRows = [];
      }

      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        elements.push(
          <ul key={lIndex} className="list-disc pl-5 my-1 text-sm space-y-0.5">
            <li>{parseInlineFormatting(line.trim().substring(2))}</li>
          </ul>
        );
        return;
      }

      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        elements.push(
          <ol key={lIndex} className="list-decimal pl-5 my-1 text-sm space-y-0.5">
            <li>{parseInlineFormatting(numMatch[2])}</li>
          </ol>
        );
        return;
      }

      if (line.trim()) {
        elements.push(
          <p key={lIndex} className="my-1 leading-relaxed text-sm">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    });

    if (isInsideTable && tableRows.length > 0) elements.push(renderTable(tableRows, "table-end"));
    return <div key={index} className="space-y-0.5">{elements}</div>;
  });
}

function parseInlineFormatting(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index} className="bg-secondary px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function renderTable(rows: string[][], key: string) {
  if (rows.length === 0) return null;
  const headers = rows[0];
  const body = rows.slice(1);
  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-border shadow-sm max-w-full">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-secondary border-b border-border">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-semibold text-foreground whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card/50">
          {body.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-secondary/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-muted-foreground whitespace-nowrap">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
