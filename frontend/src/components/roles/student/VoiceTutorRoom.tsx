import { useState, useEffect, useRef } from "react";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  Radio,
  RefreshCw,
  Zap,
  HelpCircle,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface VoiceMessage {
  id: number;
  speaker: "student" | "aimiko";
  text: string;
}

export function VoiceTutorRoom() {
  const { ageGroup, role, incrementPromptUsage, userName } = useAimiko();
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [mode, setMode] = useState<"socratic" | "direct">("socratic");
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 1,
      speaker: "aimiko",
      text: `Hello ${userName || "friend"}! I am your live conversational voice tutor. Tap the microphone and tell me what concept or homework problem you would like to work through out loud.`
    }
  ]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const currentTranscript = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setTranscript(currentTranscript);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }

      if ("speechSynthesis" in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      recognitionRef.current?.abort();
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    // Clean markdown symbols for cleaner audio narration
    const cleanText = text.replace(/[*#`_~[\]()]/g, "").replace(/\n+/g, " ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    const voices = synthRef.current.getVoices();
    const sweetVoice = voices.find(v => v.name.includes("Samantha") || v.name.includes("Google US English") || v.name.includes("Natural"));
    if (sweetVoice) utterance.voice = sweetVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleProcessUserSpeech = async (spokenText: string) => {
    const text = spokenText.trim();
    if (!text) return;

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI limit reached. Upgrade for unlimited voice tutoring.", variant: "destructive" });
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now(), speaker: "student", text }]);
    setTranscript("");
    setIsThinking(true);

    try {
      const systemInstruction = mode === "socratic"
        ? `You are AIMIKO, a warm, patient, and conversational live voice tutor. Use the Socratic method: encourage the student, ask a thoughtful guiding question, or give a vivid real-world analogy. Keep spoken responses under 3 short conversational sentences so it flows naturally in voice chat.`
        : `You are AIMIKO, a clear, concise AI tutor. Explain the answer directly and intuitively in under 3 conversational spoken sentences.`;

      const history = messages.map(m => ({
        role: m.speaker === "student" ? "user" as const : "assistant" as const,
        content: m.text
      }));

      const reply = await generateAIResponse(text, ageGroup, role, history, systemInstruction);
      setMessages((prev) => [...prev, { id: Date.now() + 1, speaker: "aimiko", text: reply }]);
      speakResponse(reply);
    } catch (err: any) {
      console.error(err);
      toast({ description: "Voice response error. Please try again.", variant: "destructive" });
    } finally {
      setIsThinking(false);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      toast({ description: "Speech recognition is not supported in this browser.", variant: "destructive" });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      if (transcript.trim()) {
        handleProcessUserSpeech(transcript);
      }
    } else {
      synthRef.current?.cancel();
      setIsSpeaking(false);
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const handleStopSpeaking = () => {
    synthRef.current?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* ─── Header ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Radio className="h-5 w-5 animate-pulse text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Live Voice Tutor Room</h1>
            <p className="text-xs text-muted-foreground">Speak out loud with AIMIKO for real-time Socratic hints and voice explanations.</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("socratic")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              mode === "socratic"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            }`}
          >
            Socratic Hint Mode
          </button>
          <button
            onClick={() => setMode("direct")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              mode === "direct"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
            }`}
          >
            Direct Answer Mode
          </button>
        </div>
      </div>

      {/* ─── Center Interactive Voice Orb & Soundwave ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-6 shadow-xs relative overflow-hidden">
        
        {/* Soft Ambient Glows */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${
          isSpeaking || isListening ? "opacity-100" : "opacity-30"
        }`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-tr from-violet-500/20 via-pink-400/20 to-sky-400/20 blur-3xl" />
        </div>

        {/* Animated Mascot Avatar / Sound Orb */}
        <div className="relative z-10">
          <div className={`p-4 rounded-full border-4 transition-all duration-300 shadow-xl ${
            isListening
              ? "border-red-500 bg-red-500/10 scale-110 animate-pulse ring-8 ring-red-500/20"
              : isSpeaking
              ? "border-primary bg-primary/10 scale-105 ring-8 ring-primary/20 animate-bounce-subtle"
              : "border-border/80 bg-secondary/50"
          }`}>
            <AimikoAvatar size="lg" animate={isSpeaking || isListening} />
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isListening
                ? "bg-red-500/10 text-red-600 border border-red-500/20 animate-pulse"
                : isSpeaking
                ? "bg-primary/10 text-primary border border-primary/20"
                : isThinking
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-secondary text-muted-foreground border border-border"
            }`}>
              {isListening && "Listening to you..."}
              {isSpeaking && "Speaking response..."}
              {isThinking && "Thinking..."}
              {!isListening && !isSpeaking && !isThinking && "Ready to talk"}
            </span>
          </div>
        </div>

        {/* Live Spoken Transcript or Prompt */}
        <div className="max-w-md w-full min-h-[50px] flex items-center justify-center relative z-10">
          {transcript ? (
            <p className="text-sm font-semibold text-foreground italic bg-secondary/80 px-4 py-2 rounded-2xl border border-border">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {isListening
                ? "Speak now into your microphone..."
                : isSpeaking
                ? "AIMIKO is explaining your concept..."
                : "Click the mic button below to talk."}
            </p>
          )}
        </div>

        {/* Mic Control Buttons */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={toggleMic}
            className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
              isListening
                ? "bg-red-500 text-white ring-4 ring-red-500/30"
                : "bg-primary text-primary-foreground shadow-primary/30"
            }`}
          >
            {isListening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
          </button>

          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="h-11 w-11 rounded-full bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Mute spoken response"
            >
              <VolumeX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Conversation Starter Chips */}
        <div className="flex flex-wrap justify-center gap-2 pt-2 relative z-10 max-w-lg">
          <span className="text-[11px] text-muted-foreground font-medium w-full text-center">Or click to ask out loud:</span>
          {[
            "Why is the sky blue during the day?",
            "Explain what a derivative is using cars.",
            "Quiz me on the 3 laws of thermodynamics."
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => handleProcessUserSpeech(promptText)}
              className="px-3 py-1.5 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/60 text-xs font-medium text-foreground transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

      </div>

      {/* ─── Dialogue Transcript History ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 space-y-3 shadow-xs max-h-72 overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Voice Dialogue Stream</h3>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 p-3 rounded-2xl ${
              m.speaker === "student"
                ? "bg-primary/5 border border-primary/20 text-foreground"
                : "bg-secondary/40 border border-border/60 text-foreground"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {m.speaker === "student" ? (
                <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  U
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full bg-secondary text-primary flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
            <div className="flex-1 text-xs leading-relaxed font-medium">
              <span className="font-bold block text-[11px] text-muted-foreground mb-0.5">
                {m.speaker === "student" ? "You" : "AIMIKO Voice"}
              </span>
              <p>{m.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

    </div>
  );
}
