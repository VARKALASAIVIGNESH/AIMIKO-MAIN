import { useState, useRef, useEffect } from "react";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { Send, X, Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

interface RoleAiSidekickProps {
  toolName: string;
  roleLabel?: string;
  contextData?: string;
  initialPrompt?: string;
  placeholder?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function RoleAiSidekick({
  toolName,
  roleLabel = "AI Assistant",
  contextData,
  initialPrompt,
  placeholder = "Ask AIMIKO for feedback or ideas...",
  isOpen: controlledIsOpen,
  onClose: controlledOnClose
}: RoleAiSidekickProps) {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const handleClose = controlledOnClose || (() => setInternalIsOpen(false));

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: `Hello! I'm your **${roleLabel}** for **${toolName}**. How can I help refine, critique, or brainstorm with you today?`
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSend(initialPrompt);
      if (controlledIsOpen === undefined) {
        setInternalIsOpen(true);
      }
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    if (!incrementPromptUsage()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "assistant",
          text: "You have reached your daily prompt quota. Upgrade to Pro for unlimited AI interactions."
        }
      ]);
      return;
    }

    const userMsg: Message = { id: Date.now(), role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsThinking(true);

    try {
      const systemHint = `You are AIMIKO acting as an expert ${roleLabel} inside the "${toolName}" studio.
Provide concise, actionable, top-tier professional advice tailored to the user's role: ${role || "professional"}.
${contextData ? `Active Studio Context:\n---\n${contextData}\n---` : ""}`;

      const history = messages.map((m) => ({
        role: m.role,
        content: m.text
      }));

      const reply = await generateAIResponse(query, ageGroup, role, history, systemHint);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: reply }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: `I encountered an issue: ${err.message}` }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-background/50 backdrop-blur-xs z-50 animate-fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-card/95 backdrop-blur-2xl border-l border-border/80 shadow-2xl z-50 flex flex-col overflow-hidden animate-slide-left">
        
        {/* Sidekick Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/60 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <AimikoAvatar size="xs" animate />
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                {roleLabel} <span className="text-[10px] text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">Copilot</span>
              </h4>
              <p className="text-[10px] text-muted-foreground">{toolName}</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="h-8 w-8 rounded-xl border border-border/60 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={`rounded-2xl p-3 max-w-[85%] leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground font-medium"
                    : "bg-secondary text-foreground border border-border/60"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
              <span>AIMIKO is analyzing...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3.5 border-t border-border/60 bg-background/90 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl bg-secondary/80 border border-border/60 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              type="submit"
              disabled={!input.trim() || isThinking}
              size="sm"
              className="h-8 px-3.5 rounded-xl text-xs font-semibold shrink-0"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>

      </div>
    </>
  );
}
