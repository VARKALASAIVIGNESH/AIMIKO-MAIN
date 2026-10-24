import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AimikoAvatar, AimikoThinking } from "@/components/AimikoAvatar";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  FileText,
  Plus,
  X,
  Copy,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Hash,
  Sparkles,
  LucideIcon,
  Paperclip,
  Loader2,
  Trophy,
  Check,
  AlertCircle,
  RefreshCw,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface StudioAction {
  label: string;
  icon: LucideIcon;
  description: string;
  promptTemplate: string;
}

export interface ToolConfig {
  name: string;
  icon: LucideIcon;
  color: string;          // e.g. "text-violet-500"
  accentBg: string;       // e.g. "bg-violet-500/10"
  accentBorder: string;   // e.g. "border-violet-500/20"
  description: string;
  suggestedPrompts: string[];
  studioActions: StudioAction[];
  systemHint: string;
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

interface ToolChatWorkspaceProps {
  config: ToolConfig;
  onClose: () => void;
}

interface Flashcard {
  front: string;
  back: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export function ToolChatWorkspace({ config, onClose }: ToolChatWorkspaceProps) {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const navigate = useNavigate();
  const { toast } = useToast();

  // === Source Panel ===
  const [sourceText, setSourceText] = useState(() => {
    return localStorage.getItem("aimiko_tool_source") || "";
  });
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [sourceInput, setSourceInput] = useState("");

  // === Studio Panel ===
  const [isStudioOpen, setIsStudioOpen] = useState(true);

  // === Chat ===
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // === Voice ===
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // === PDF Upload ===
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Flashcards & Quiz ===
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showQuizExplanation, setShowQuizExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  const [activeView, setActiveView] = useState<"chat" | "flashcards" | "quiz">("chat");
  const [isGeneratingStudy, setIsGeneratingStudy] = useState(false);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [customQuizInput, setCustomQuizInput] = useState("");

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  // Load PDF.js from CDN dynamically
  const loadPdfJs = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjsLib);
      };
      script.onerror = () => {
        reject(new Error("Failed to load PDF.js from CDN"));
      };
      document.body.appendChild(script);
    });
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ description: "Please upload a valid PDF file.", variant: "destructive" });
      return;
    }

    toast({ description: `Reading ${file.name}...` });

    try {
      const pdfjsLib = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        text += pageText + "\n";
      }

      if (!text.trim()) {
        toast({ description: "No readable text found in PDF.", variant: "destructive" });
        return;
      }

      const cleanedText = text.replace(/\s+/g, " ").trim();
      const newSource = sourceText ? sourceText + "\n\n" + cleanedText : cleanedText;
      setSourceText(newSource);
      localStorage.setItem("aimiko_tool_source", newSource);
      setIsSourceOpen(true);
      toast({ description: `Successfully loaded PDF (${file.name}) ✓` });
    } catch (error: any) {
      console.error(error);
      toast({ description: `Failed to load PDF: ${error.message}`, variant: "destructive" });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveSource = () => {
    if (!sourceInput.trim()) return;
    const combined = sourceText ? sourceText + "\n\n" + sourceInput.trim() : sourceInput.trim();
    setSourceText(combined);
    localStorage.setItem("aimiko_tool_source", combined);
    setSourceInput("");
    toast({ description: "Source added ✓" });
  };

  const clearSource = () => {
    setSourceText("");
    localStorage.removeItem("aimiko_tool_source");
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    if (!incrementPromptUsage()) {
      if (confirm("Daily limit reached. Upgrade for 100 prompts/day?")) navigate("/upgrade");
      return;
    }

    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    try {
      const systemContext = [
        config.systemHint,
        sourceText ? `\n\nIMPORTANT: The user has provided the following source material. Ground your responses to this context:\n---\n${sourceText}\n---` : ""
      ].join("");

      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));

      const responseText = await generateAIResponse(text.trim(), ageGroup, role, history, systemContext);
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: responseText }]);
    } catch (err: any) {
      setMessages((prev) => [...prev, {
        id: Date.now() + 1, role: "assistant",
        text: `Something went wrong: ${err.message}`
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const generateFlashcards = async (topic?: string, count: number = 5) => {
    if (!topic && !sourceText.trim() && messages.length === 0) {
      toast({
        description: "Write a message, enter a topic, or add a source first to generate flashcards!",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingStudy(true);
    setActiveView("flashcards");

    try {
      let studyContext = "";
      if (topic) {
        studyContext = `Generate flashcards specifically about the topic: "${topic}".`;
      } else {
        const lastResponse = [...messages].reverse().find((m) => m.role === "assistant")?.text || "";
        studyContext = [
          sourceText ? `Source text context:\n${sourceText}` : "",
          lastResponse ? `Recent chat context:\n${lastResponse}` : ""
        ].filter(Boolean).join("\n\n");
      }

      const prompt = `Based on the following request, generate a list of ${count} key concepts as front/back flashcards for revision.
      You MUST respond ONLY with a valid JSON array of objects, where each object contains exactly "front" and "back" string fields.
      Do not include markdown code block formatting (like \`\`\`json). Just return the raw JSON array.

      Request:
      ${studyContext.slice(0, 4000)}`;

      const response = await generateAIResponse(prompt, ageGroup, role, [], "You are an educational assistant that returns raw JSON data only.");
      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setFlashcards(parsed);
        setCurrentFlashcardIndex(0);
        setIsFlipped(false);
        setCustomTopicInput("");
        toast({ description: `Generated ${parsed.length} flashcards!` });
      } else {
        throw new Error("Invalid structure");
      }
    } catch (error: any) {
      console.error(error);
      toast({ description: "Failed to generate structured flashcards. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  const generateQuiz = async (topic?: string, count: number = 3) => {
    if (!topic && !sourceText.trim() && messages.length === 0) {
      toast({
        description: "Write a message, enter a topic, or add a source first to generate a quiz!",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingStudy(true);
    setActiveView("quiz");

    try {
      let studyContext = "";
      if (topic) {
        studyContext = `Generate multiple choice questions about the topic: "${topic}".`;
      } else {
        const lastResponse = [...messages].reverse().find((m) => m.role === "assistant")?.text || "";
        studyContext = [
          sourceText ? `Source text context:\n${sourceText}` : "",
          lastResponse ? `Recent chat context:\n${lastResponse}` : ""
        ].filter(Boolean).join("\n\n");
      }

      const prompt = `Based on the following request, generate a ${count}-question multiple choice quiz to test understanding.
      You MUST respond ONLY with a valid JSON array of objects, where each object contains exactly:
      - "question": string
      - "options": array of exactly 4 strings
      - "answerIndex": number (0 to 3)
      - "explanation": string

      Do not include markdown code block formatting (like \`\`\`json). Just return the raw JSON array.

      Request:
      ${studyContext.slice(0, 4000)}`;

      const response = await generateAIResponse(prompt, ageGroup, role, [], "You are a quiz host that returns raw JSON data only.");
      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuizQuestions(parsed);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowQuizExplanation(false);
        setQuizScore(0);
        setIsQuizFinished(false);
        setCustomQuizInput("");
        toast({ description: "Quiz generated!" });
      } else {
        throw new Error("Invalid structure");
      }
    } catch (error: any) {
      console.error(error);
      toast({ description: "Failed to generate structured quiz. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingStudy(false);
    }
  };

  const handleStudioAction = async (action: StudioAction) => {
    if (action.label === "Create Flashcards") {
      setActiveView("flashcards");
      return;
    }
    if (action.label === "Quiz Me") {
      setActiveView("quiz");
      return;
    }

    if (messages.length === 0) {
      toast({ description: "Start a conversation first, then use Studio actions." });
      return;
    }
    const lastResponse = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastResponse) return;

    const prompt = action.promptTemplate.replace("{{response}}", lastResponse.text);
    await sendMessage(prompt);
  };

  const handleSaveToNotes = () => {
    const lastResponse = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastResponse) {
      toast({ description: "No response to save yet." });
      return;
    }
    const title = `${config.name} — ${new Date().toLocaleDateString()}`;
    addNote(title, lastResponse.text);
    toast({ description: "Saved to Notes ✓" });
  };

  const handleCopyLast = () => {
    const lastResponse = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastResponse) return;
    navigator.clipboard.writeText(lastResponse.text);
    toast({ description: "Copied to clipboard ✓" });
  };

  const wordCount = sourceText.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-background overflow-hidden">
      {/* Sub-toolbar with Source and Studio toggles */}
      <div className="h-10 flex items-center justify-between border-b border-border/60 px-4 shrink-0 bg-secondary/30">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-md ${config.accentBg}`}>
            <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{config.description}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Source panel */}
          <button
            onClick={() => setIsSourceOpen((v) => !v)}
            className={`flex items-center gap-1.5 h-6 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              isSourceOpen
                ? `${config.accentBg} ${config.color} ${config.accentBorder}`
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <FileText className="h-3 w-3" />
            Sources {sourceText && <span className={`${config.color} ml-0.5`}>●</span>}
          </button>

          {/* Toggle Studio panel */}
          <button
            onClick={() => setIsStudioOpen((v) => !v)}
            className={`flex items-center gap-1.5 h-6 px-2.5 rounded-lg text-xs font-medium border transition-colors ${
              isStudioOpen
                ? `${config.accentBg} ${config.color} ${config.accentBorder}`
                : "border-border text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Studio
          </button>
        </div>
      </div>

      {/* Main 3-panel body */}
      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* ===== LEFT: Sources Panel ===== */}
        {isSourceOpen && (
          <div className="w-64 xl:w-72 shrink-0 border-r border-border/60 flex flex-col bg-sidebar overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border/60 shrink-0">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Sources</h3>
              <p className="text-[10px] text-muted-foreground mt-1 leading-snug">
                Paste notes or context. AIMIKO will use this to ground its responses.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {/* Existing source */}
              {sourceText && (
                <div className={`${config.accentBg} ${config.accentBorder} border rounded-xl p-3 relative`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className={`h-3.5 w-3.5 ${config.color} shrink-0`} />
                      <span className="text-xs font-semibold text-foreground">Pasted source</span>
                    </div>
                    <button onClick={clearSource} className="shrink-0 text-muted-foreground hover:text-destructive transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 line-clamp-3">{sourceText}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <Hash className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">{wordCount} words</span>
                  </div>
                </div>
              )}

              {/* Add source textarea */}
              <div className="space-y-2">
                <textarea
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder="Paste notes, a worksheet, a job description, code..."
                  className="w-full h-32 bg-background border border-border rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none custom-scrollbar leading-relaxed"
                />
                <button
                  onClick={handleSaveSource}
                  disabled={!sourceInput.trim()}
                  className={`w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs font-medium ${config.accentBg} ${config.color} border ${config.accentBorder} disabled:opacity-40 transition-colors hover:opacity-90`}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Source
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== CENTER: Chat Workspace ===== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Messages or interactive views */}
          <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 custom-scrollbar">
            {isGeneratingStudy ? (
              <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-4 animate-fade-in py-12">
                <div className={`p-4 rounded-2xl ${config.accentBg} animate-spin-slow`}>
                  <Loader2 className={`h-8 w-8 ${config.color} animate-spin`} />
                </div>
                <h3 className="text-base font-bold text-foreground">AIMIKO is crafting your study materials...</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reading recent chat messages and source context to structure custom {activeView === "flashcards" ? "flashcards" : "quiz questions"}. One moment!
                </p>
              </div>
            ) : activeView === "flashcards" ? (
              flashcards.length === 0 ? (
                !sourceText.trim() ? (
                  /* Add Resource Required Page */
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 py-12 animate-pop-in">
                    <div className="h-16 w-16 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-xl shadow-yellow-500/5">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">Add a Study Resource 📂</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To generate custom flashcards, AIMIKO needs study materials to learn from. Please upload a PDF file or paste your study notes first!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className={`p-3 rounded-xl ${config.accentBg} ${config.color} group-hover:scale-105 transition-transform`}>
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground">Upload PDF</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Chapters, worksheets...</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsSourceOpen(true);
                          toast({ description: "Paste your notes in the Sources sidebar on the left!" });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className={`p-3 rounded-xl ${config.accentBg} ${config.color} group-hover:scale-105 transition-transform`}>
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground">Paste Notes</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Text, copied articles...</p>
                        </div>
                      </button>
                    </div>

                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveView("chat")}>
                      Back to Chat
                    </Button>
                  </div>
                ) : (
                  /* Standard Generation Panel with Quantity selector */
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 py-12 animate-pop-in">
                    <div className={`h-14 w-14 rounded-2xl ${config.accentBg} flex items-center justify-center border ${config.accentBorder}`}>
                      <BookOpen className={`h-7 w-7 ${config.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">Create Flashcards 🗂️</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Learn and revise key terms. Generate flashcards from your documents, or type a custom topic below!
                      </p>
                    </div>

                    {/* Quantity selector */}
                    <div className="w-full bg-card border border-border p-5 rounded-2xl space-y-2 shadow-sm text-left">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Number of Flashcards (Max 20)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={flashcardCount}
                          onChange={(e) => setFlashcardCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                          className="w-20 rounded-xl bg-secondary border border-border px-3 py-2 text-xs text-foreground font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-xs text-muted-foreground">cards to generate</span>
                      </div>
                    </div>

                    {/* Quick topic generation */}
                    <div className="w-full bg-card border border-border p-5 rounded-2xl space-y-3 shadow-sm">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block text-left">
                        Generate by Topic
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Photosynthesis, WW2, Javascript closures..."
                          value={customTopicInput}
                          onChange={(e) => setCustomTopicInput(e.target.value)}
                          className="flex-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <Button
                          size="sm"
                          onClick={() => generateFlashcards(customTopicInput, flashcardCount)}
                          className="aimiko-gradient text-primary-foreground border-0 text-xs px-3"
                        >
                          Generate
                        </Button>
                      </div>

                      {sourceText.trim() && (
                        <>
                          <div className="flex items-center gap-2 my-2">
                            <div className="h-px bg-border flex-1" />
                            <span className="text-[9px] text-muted-foreground uppercase font-bold">Or</span>
                            <div className="h-px bg-border flex-1" />
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateFlashcards(undefined, flashcardCount)}
                            className="w-full text-xs font-semibold animate-fade-in"
                          >
                            Generate from current sources
                          </Button>
                        </>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                        <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Upload PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveView("chat")}>
                        Back to Chat
                      </Button>
                    </div>
                  </div>
                )
              ) : (
                /* Active Flashcards slideshow */
                <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[400px] py-4 space-y-6">
                  {/* Card indicator */}
                  <div className="text-xs font-semibold text-muted-foreground">
                    Card {currentFlashcardIndex + 1} of {flashcards.length}
                  </div>

                  {/* 3D Flip Card Container */}
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="perspective w-full h-72 cursor-pointer relative"
                  >
                    <div
                      className={`w-full h-full duration-500 transform-style transition-transform ${
                        isFlipped ? "rotate-y-180" : ""
                      }`}
                    >
                      {/* Front side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between items-center shadow-lg">
                        <div className="flex-1 flex items-center justify-center text-center">
                          <h4 className="text-lg font-bold text-foreground leading-relaxed px-4">
                            {flashcards[currentFlashcardIndex].front}
                          </h4>
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider bg-secondary px-3 py-1 rounded-full">
                          Tap to reveal answer
                        </div>
                      </div>

                      {/* Back side */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-card border border-border/80 rounded-3xl p-6 flex flex-col justify-between items-center shadow-lg">
                        <div className="flex-1 flex items-center justify-center text-center overflow-y-auto w-full custom-scrollbar">
                          <p className="text-sm text-muted-foreground leading-relaxed px-4 py-2 font-medium">
                            {flashcards[currentFlashcardIndex].back}
                          </p>
                        </div>
                        <div className="text-[10px] uppercase font-semibold text-primary tracking-wider bg-primary/10 px-3 py-1 rounded-full">
                          Tap to see question
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300"
                      style={{ width: `${((currentFlashcardIndex + 1) / flashcards.length) * 100}%` }}
                    />
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center justify-between w-full gap-4 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentFlashcardIndex === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setTimeout(() => setCurrentFlashcardIndex((prev) => prev - 1), 150);
                      }}
                      className="flex-1"
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentFlashcardIndex === flashcards.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                        setTimeout(() => setCurrentFlashcardIndex((prev) => prev + 1), 150);
                      }}
                      className="flex-1"
                    >
                      Next <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveView("chat")}
                    >
                      Back to Chat
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:text-primary/80"
                      onClick={() => generateFlashcards(undefined, flashcardCount)}
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Regenerate
                    </Button>
                  </div>
                </div>
              )
            ) : activeView === "quiz" ? (
              quizQuestions.length === 0 ? (
                !sourceText.trim() ? (
                  /* Add Resource Required Page */
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 py-12 animate-pop-in">
                    <div className="h-16 w-16 rounded-3xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-xl shadow-yellow-500/5">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">Add a Study Resource 📂</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        To generate custom quiz questions, AIMIKO needs study materials to learn from. Please upload a PDF file or paste your study notes first!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm pt-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className={`p-3 rounded-xl ${config.accentBg} ${config.color} group-hover:scale-105 transition-transform`}>
                          <Paperclip className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground">Upload PDF</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Chapters, worksheets...</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          setIsSourceOpen(true);
                          toast({ description: "Paste your notes in the Sources sidebar on the left!" });
                        }}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/45 transition-all duration-200 hover:shadow-md group"
                      >
                        <div className={`p-3 rounded-xl ${config.accentBg} ${config.color} group-hover:scale-105 transition-transform`}>
                          <Plus className="h-5 w-5" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-foreground">Paste Notes</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Text, copied articles...</p>
                        </div>
                      </button>
                    </div>

                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveView("chat")}>
                      Back to Chat
                    </Button>
                  </div>
                ) : (
                  /* Standard Quiz Setup Panel with Quantity Selector */
                  <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 py-12 animate-pop-in">
                    <div className={`h-14 w-14 rounded-2xl ${config.accentBg} flex items-center justify-center border ${config.accentBorder}`}>
                      <HelpCircle className={`h-7 w-7 ${config.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-foreground">Quiz Me 📝</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Test your understanding! Generate multiple-choice quiz questions from your documents, or type a custom topic below.
                      </p>
                    </div>

                    {/* Quantity selector */}
                    <div className="w-full bg-card border border-border p-5 rounded-2xl space-y-2 shadow-sm text-left">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Number of Quiz Questions (Max 20)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={quizCount}
                          onChange={(e) => setQuizCount(Math.min(20, Math.max(1, Number(e.target.value))))}
                          className="w-20 rounded-xl bg-secondary border border-border px-3 py-2 text-xs text-foreground font-semibold text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-xs text-muted-foreground">questions to generate</span>
                      </div>
                    </div>

                    {/* Quick topic generation */}
                    <div className="w-full bg-card border border-border p-5 rounded-2xl space-y-3 shadow-sm">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block text-left">
                        Quiz Topic
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. World Capitals, Fractions, CSS grid..."
                          value={customQuizInput}
                          onChange={(e) => setCustomQuizInput(e.target.value)}
                          className="flex-1 rounded-xl bg-secondary border border-border px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <Button
                          size="sm"
                          onClick={() => generateQuiz(customQuizInput, quizCount)}
                          className="aimiko-gradient text-primary-foreground border-0 text-xs px-3"
                        >
                          Start
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 my-2">
                        <div className="h-px bg-border flex-1" />
                        <span className="text-[9px] text-muted-foreground uppercase font-bold">Or</span>
                        <div className="h-px bg-border flex-1" />
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {sourceText.trim() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateQuiz(undefined, quizCount)}
                            className="w-full text-xs font-semibold"
                          >
                            Generate from current sources
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => generateQuiz("General Knowledge Trivia", quizCount)}
                          className="w-full text-xs font-semibold"
                        >
                          ✨ Take a General Trivia Quiz
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-xs">
                        <Paperclip className="mr-1.5 h-3.5 w-3.5" /> Upload PDF
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveView("chat")}>
                        Back to Chat
                      </Button>
                    </div>
                  </div>
                )
              ) : isQuizFinished ? (
                /* Quiz Score Screen */
                <div className="max-w-md mx-auto flex flex-col items-center justify-center py-10 text-center space-y-6 animate-pop-in">
                  <div className={`h-20 w-20 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-500/5 animate-wiggle`}>
                    <Trophy className="h-10 w-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">Quiz Completed!</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Great effort! Let's check how well you understood the material.
                    </p>
                  </div>

                  {/* Score Badge */}
                  <div className="bg-card border border-border p-6 rounded-2xl w-full flex items-center justify-around">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Your Score</p>
                      <p className="text-3xl font-extrabold text-foreground mt-1">
                        {quizScore} <span className="text-base font-normal text-muted-foreground">/ {quizQuestions.length}</span>
                      </p>
                    </div>
                    <div className="h-10 w-px bg-border" />
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Accuracy</p>
                      <p className="text-3xl font-extrabold text-foreground mt-1">
                        {Math.round((quizScore / quizQuestions.length) * 100)}%
                      </p>
                    </div>
                  </div>

                  {/* Score Message */}
                  <p className="text-sm font-semibold text-primary">
                    {quizScore === quizQuestions.length
                      ? "Wow, perfect score! You mastered this! 🌟"
                      : quizScore >= quizQuestions.length / 2
                      ? "Good job! You're on the right track! 👍"
                      : "Keep practicing! Review your sources and try again! 📚"}
                  </p>

                  <div className="flex gap-3 w-full">
                    <Button variant="outline" className="flex-1" onClick={() => setActiveView("chat")}>
                      Back to Chat
                    </Button>
                    <Button className="flex-1 aimiko-gradient text-primary-foreground border-0" onClick={() => generateQuiz(undefined, quizCount)}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Retry Quiz
                    </Button>
                  </div>
                </div>
              ) : (
                /* Quiz Question runner */
                <div className="max-w-xl mx-auto flex flex-col min-h-[400px] py-4 space-y-6 animate-slide-up">
                  {/* Progress header */}
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground pb-2 border-b border-border/40">
                    <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                    <span className="text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">Score: {quizScore}</span>
                  </div>

                  {/* Question block */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-foreground leading-relaxed">
                      {quizQuestions[currentQuestionIndex].question}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 gap-3">
                      {quizQuestions[currentQuestionIndex].options.map((option, idx) => {
                        const isAnswered = selectedOption !== null;
                        const isCorrectIndex = idx === quizQuestions[currentQuestionIndex].answerIndex;
                        const isSelectedIndex = idx === selectedOption;

                        let optionStyle = "bg-card border-border hover:border-primary/30 hover:bg-muted/10";
                        
                        if (isAnswered) {
                          if (isCorrectIndex) {
                            optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-semibold";
                          } else if (isSelectedIndex) {
                            optionStyle = "bg-destructive/10 border-destructive text-destructive font-semibold";
                          } else {
                            optionStyle = "opacity-50 bg-card border-border";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            disabled={isAnswered}
                            onClick={() => {
                              setSelectedOption(idx);
                              setShowQuizExplanation(true);
                              if (idx === quizQuestions[currentQuestionIndex].answerIndex) {
                                setQuizScore((s) => s + 1);
                              }
                            }}
                            className={`text-left p-4 rounded-xl border text-sm leading-relaxed transition-all flex items-start gap-3 ${optionStyle}`}
                          >
                            <span className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-xs font-semibold text-muted-foreground shrink-0 mt-0.5">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="flex-1">{option}</span>
                            {isAnswered && isCorrectIndex && (
                              <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            )}
                            {isAnswered && isSelectedIndex && !isCorrectIndex && (
                              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Explanation block */}
                  {showQuizExplanation && (
                    <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-2 animate-pop-in">
                      <p className="text-xs font-bold text-foreground">Explanation:</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {quizQuestions[currentQuestionIndex].explanation}
                      </p>
                    </div>
                  )}

                  {/* Navigation footer */}
                  {selectedOption !== null && (
                    <Button
                      onClick={() => {
                        if (currentQuestionIndex === quizQuestions.length - 1) {
                          setIsQuizFinished(true);
                        } else {
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setSelectedOption(null);
                          setShowQuizExplanation(false);
                        }
                      }}
                      className="w-full aimiko-gradient text-primary-foreground py-3 font-semibold border-0"
                    >
                      {currentQuestionIndex === quizQuestions.length - 1 ? "Finish Quiz" : "Next Question"}
                    </Button>
                  )}

                  <div className="pt-4 flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => setActiveView("chat")}
                    >
                      Back to Chat
                    </Button>
                  </div>
                </div>
              )
            ) : messages.length === 0 ? (
              // Welcome state
              <div className="max-w-2xl mx-auto space-y-8 animate-pop-in">
                {/* Tool hero */}
                <div className="text-center space-y-3 pt-8">
                  <div className={`h-14 w-14 rounded-2xl ${config.accentBg} border ${config.accentBorder} flex items-center justify-center mx-auto`}>
                    <config.icon className={`h-7 w-7 ${config.color}`} />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{config.name}</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">{config.description}</p>
                </div>

                {/* Suggested prompts */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Suggested prompts</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.suggestedPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="text-left p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/30 hover:shadow-md transition-all duration-200 group animate-slide-up"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <p className="text-sm text-foreground leading-snug group-hover:text-primary transition-colors">{prompt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {sourceText && (
                  <div className={`${config.accentBg} border ${config.accentBorder} rounded-2xl p-4 text-center`}>
                    <p className={`text-xs font-medium ${config.color}`}>
                      ✓ Source grounded · {wordCount} words · Responses will be context-aware
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Chat messages
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 animate-slide-up ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && <AimikoAvatar size="sm" className="shrink-0 mt-1" />}
                    <div
                      className={`max-w-[78%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "aimiko-gradient text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border/70 text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5">
                          {renderMarkdown(msg.text)}
                        </div>
                      )}
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
            )}
          </div>

          {/* Input bar */}
          <div className="border-t border-border/60 bg-background/80 backdrop-blur-sm px-4 md:px-8 py-4 shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2.5">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePdfUpload}
                accept="application/pdf"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 transition-colors press bg-secondary text-muted-foreground border-border hover:bg-muted"
                title="Upload PDF source"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <button
                onClick={toggleListening}
                className={`h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 transition-colors press ${
                  isListening
                    ? "bg-red-500 text-white border-red-400 animate-pulse"
                    : "bg-secondary text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
                placeholder={isListening ? "Listening..." : `Ask ${config.name}...`}
                disabled={isListening}
                className="flex-1 rounded-xl bg-card border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all"
              />

              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isThinking}
                className="h-11 w-11 rounded-xl aimiko-gradient text-primary-foreground flex items-center justify-center disabled:opacity-40 press shrink-0 shadow-md shadow-primary/15"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Studio Panel ===== */}
        {isStudioOpen && (
          <div className="w-60 xl:w-64 shrink-0 border-l border-border/60 flex flex-col bg-sidebar overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border/60 shrink-0">
              <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Studio</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Quick actions for your response</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {/* Universal actions */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 font-medium">General</p>
                <button
                  onClick={handleSaveToNotes}
                  className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/50 text-sm text-foreground transition-colors text-left"
                >
                  <Bookmark className="h-3.5 w-3.5 text-primary shrink-0" />
                  Save to Notes
                </button>
                <button
                  onClick={handleCopyLast}
                  className="w-full flex items-center gap-2.5 h-9 px-3 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/50 text-sm text-foreground transition-colors text-left"
                >
                  <Copy className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  Copy Response
                </button>
              </div>

              {/* Tool-specific studio actions */}
              {config.studioActions.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider px-1 font-medium">
                    {config.name}
                  </p>
                  {config.studioActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleStudioAction(action)}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl ${config.accentBg} border ${config.accentBorder} text-left transition-all hover:opacity-90 group`}
                    >
                      <action.icon className={`h-3.5 w-3.5 ${config.color} shrink-0 mt-0.5`} />
                      <div className="min-w-0">
                        <p className={`text-xs font-medium ${config.color}`}>{action.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{action.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Lightweight markdown renderer
function renderMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const match = part.match(/```(\w*)\n?([\s\S]*?)```/);
      const lang = match?.[1] || "code";
      const code = match?.[2] || part.slice(3, -3);
      return (
        <div key={i} className="my-3 rounded-xl overflow-hidden border border-border bg-zinc-950 text-xs">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <span className="text-[10px] uppercase text-zinc-400 font-medium tracking-wider">{lang}</span>
            <button onClick={() => navigator.clipboard.writeText(code.trim())} className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors">Copy</button>
          </div>
          <pre className="p-4 overflow-x-auto text-zinc-100 leading-relaxed"><code>{code.trim()}</code></pre>
        </div>
      );
    }

    return (
      <div key={i}>
        {text.split("\n").map((line, li) => {
          if (line.startsWith("# ")) return <h2 key={li} className="text-base font-bold text-foreground mt-3 mb-1">{line.slice(2)}</h2>;
          if (line.startsWith("## ")) return <h3 key={li} className="text-sm font-semibold text-foreground mt-2 mb-1">{line.slice(3)}</h3>;
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return <li key={li} className="ml-4 list-disc text-sm">{inlineFmt(line.slice(2))}</li>;
          }
          const numMatch = line.match(/^(\d+)\.\s(.*)/);
          if (numMatch) return <li key={li} className="ml-4 list-decimal text-sm">{inlineFmt(numMatch[2])}</li>;
          if (line.trim()) return <p key={li} className="my-1 text-sm leading-relaxed">{inlineFmt(line)}</p>;
          return <br key={li} />;
        })}
      </div>
    );
  });
}

function inlineFmt(text: string): React.ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i} className="bg-secondary px-1.5 py-0.5 rounded text-[11px] font-mono border border-border">{part.slice(1, -1)}</code>;
    return part;
  });
}
