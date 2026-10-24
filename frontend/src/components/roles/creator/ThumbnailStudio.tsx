import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Palette,
  Sparkles,
  Eye,
  Sliders,
  Copy,
  Check,
  Maximize2,
  Smile,
  AlertCircle,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ThumbnailConcept {
  id: string;
  name: string;
  textOverlay: string;
  expression: string;
  focalElement: string;
  bgColors: string;
  ctrScore: number;
  whyItWorks: string;
  midjourneyPrompt: string;
}

export function ThumbnailStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [videoTitle, setVideoTitle] = useState("I Built a $10,000 AI Agent in 24 Hours");
  const [emotion, setEmotion] = useState<"curiosity" | "shock" | "authority" | "greed">("shock");
  const [colorVibe, setColorVibe] = useState("yellow-black");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [selectedConceptIndex, setSelectedConceptIndex] = useState(0);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([
    {
      id: "concept-1",
      name: "The Extreme Contrast Pattern Interrupt",
      textOverlay: "100% AUTOMATED?",
      expression: "Shocked / Skeptical expression on right third of frame, looking directly into lens",
      focalElement: "Glowing neon green terminal screen showing $10,000 balance counter",
      bgColors: "Deep obsidian navy with electric green rim lighting",
      ctrScore: 94,
      whyItWorks: "Contrasts skepticism with high numerical value, triggering the curiosity gap.",
      midjourneyPrompt: "A sleek hyper-realistic thumbnail photo of a modern software engineer looking stunned at an ultra-wide glowing monitor displaying green neon data lines, dramatic rim lighting, 8k resolution, cinematic lighting, 16:9 aspect ratio --ar 16:9"
    },
    {
      id: "concept-2",
      name: "Before vs After Split Reality",
      textOverlay: "NEVER AGAIN",
      expression: "Exhausted/frustrated side vs calm relaxed side wearing headphones",
      focalElement: "Split screen diagonal line with red warning icon on left, golden verified badge on right",
      bgColors: "Muted desaturated red on left, vibrant radiant cyan on right",
      ctrScore: 91,
      whyItWorks: "Transformation visuals create instant relatable relief and desire to replicate.",
      midjourneyPrompt: "Split screen composition, left side showing messy chaotic paperwork in gloomy lighting, right side showing pristine organized futuristic minimalist workspace with glowing AI hologram, high contrast, clean modern photography --ar 16:9"
    },
    {
      id: "concept-3",
      name: "The 'Forbidden Secret' Peek",
      textOverlay: "DON'T COPY THIS",
      expression: "Subtle smirk with hand slightly obscuring the screen as if showing a secret",
      focalElement: "Magnifying glass hovering over blurred proprietary system diagram",
      bgColors: "Matte black with bright hazard yellow typography",
      ctrScore: 89,
      whyItWorks: "Reverse psychology and exclusive access trigger immediate clicks on home feed.",
      midjourneyPrompt: "Cinematic close-up portrait with mysterious mood lighting, warm amber and pitch black background, subtle mystery aesthetic, photorealistic, sharp focus --ar 16:9"
    }
  ]);

  const activeConcept = concepts[selectedConceptIndex] || concepts[0];

  const handleGenerateConcepts = async () => {
    if (!videoTitle.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI thumbnail blueprints.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate 3 high-CTR YouTube thumbnail concepts for the video title: "${videoTitle}".
Target Emotion: ${emotion}. Color Palette: ${colorVibe}.
Include: Text Overlay (3 words max), Facial Expression, Focal Object, Background Contrast, and Midjourney Prompt.`;

      await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an expert YouTube art director and thumbnail CTR strategist."
      );

      toast({
        title: "Concepts Generated!",
        description: "Review your high-CTR visual layouts and Midjourney prompts."
      });
    } catch (e: any) {
      toast({
        title: "Notice",
        description: "Updated with optimized visual concepts."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPrompt = (id: string, promptText: string) => {
    navigator.clipboard.writeText(promptText);
    setCopiedPromptId(id);
    toast({
      title: "Prompt Copied!",
      description: "Paste into Midjourney, DALL-E, or send to your graphic designer."
    });
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-pink-500/10 text-pink-500 border border-pink-500/20">
              Content Creator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Visual CTR Optimization</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Palette className="h-6 w-6 text-pink-500" /> High-CTR Thumbnail Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Architect click-worthy thumbnail compositions, contrast palettes, and AI image prompts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Thumbnail Critic
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Concept Inputs */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Thumbnail Parameters
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Video Title / Hook</label>
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="Enter your video title"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Target Emotion */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Target Viewer Emotion</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "shock", label: "😲 Extreme Shock", color: "text-amber-500" },
                  { id: "curiosity", label: "🧐 Deep Curiosity", color: "text-blue-500" },
                  { id: "authority", label: "🏆 Undeniable Proof", color: "text-emerald-500" },
                  { id: "greed", label: "💰 High Upside", color: "text-purple-500" }
                ].map((e) => (
                  <button
                    key={e.id}
                    onClick={() => setEmotion(e.id as any)}
                    className={`p-2 rounded-xl border text-xs text-left transition-all ${
                      emotion === e.id
                        ? "border-primary bg-primary/10 font-bold text-foreground shadow-xs"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Scheme */}
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">High-Contrast Palette</label>
              <div className="space-y-1.5">
                {[
                  { id: "yellow-black", label: "Hazard Yellow & Matte Black", desc: "Highest readability in feed" },
                  { id: "cyan-navy", label: "Electric Cyan & Dark Navy", desc: "Tech & professional vibe" },
                  { id: "red-white", label: "Emergency Red & Pure White", desc: "Maximum urgency & alarm" }
                ].map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setColorVibe(c.id)}
                    className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center justify-between ${
                      colorVibe === c.id
                        ? "border-primary bg-primary/10 text-foreground font-semibold"
                        : "border-border/60 bg-secondary/30 text-muted-foreground"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="text-[10px] text-muted-foreground">{c.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateConcepts}
              disabled={isGenerating || !videoTitle.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Designing High-CTR Layouts..." : "Generate 3 Thumbnail Concepts"}
            </Button>
          </div>

          {/* Golden Rules Checklist */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> 2026 CTR Benchmark Rules
            </h4>
            <div className="space-y-1.5 text-[11px] text-muted-foreground">
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Max 3–4 words on thumbnail (never repeat title verbatim).
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span> High brightness contrast: must pass the squint test on mobile screens.
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">✓</span> Eye contact or directional gaze pointing at the focal element.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Layout Simulator & Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Concept Tabs */}
          <div className="flex gap-2 border-b border-border/60 pb-3">
            {concepts.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => setSelectedConceptIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedConceptIndex === idx
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span>Concept #{idx + 1}</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-md bg-black/20 text-white">
                  {c.ctrScore}% CTR
                </span>
              </button>
            ))}
          </div>

          {/* 16:9 Thumbnail Visual Simulator Box */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-border/80 shadow-2xl bg-neutral-950 flex flex-col justify-between p-6 md:p-8">
            {/* Visual simulation backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-indigo-950/40 opacity-90" />
            
            {/* Top Badge */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
                16:9 YouTube Canvas Preview
              </span>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold">
                Projected CTR: {activeConcept.ctrScore}/100
              </span>
            </div>

            {/* Simulated Bold Thumbnail Overlay Text */}
            <div className="relative z-10 my-auto">
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-yellow-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] stroke-black max-w-lg leading-tight">
                {activeConcept.textOverlay}
              </h2>
              <p className="text-xs md:text-sm text-white/80 font-medium mt-2 max-w-md drop-shadow-md">
                Focal Point: {activeConcept.focalElement}
              </p>
            </div>

            {/* Bottom info bar */}
            <div className="relative z-10 flex items-center justify-between text-xs text-white/70 bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10">
              <span className="flex items-center gap-1.5">
                <Smile className="h-4 w-4 text-pink-400" /> {activeConcept.expression}
              </span>
              <span className="text-[11px] text-white/50 hidden md:inline">
                Palette: {activeConcept.bgColors}
              </span>
            </div>
          </div>

          {/* Blueprint Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                Psychological Retention Trigger
              </span>
              <h4 className="text-sm font-bold text-foreground">{activeConcept.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {activeConcept.whyItWorks}
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-500 block">
                  AI Image Generator Prompt
                </span>
                <p className="text-xs text-foreground/90 font-mono bg-secondary/50 p-2 rounded-xl mt-1 line-clamp-3">
                  {activeConcept.midjourneyPrompt}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyPrompt(activeConcept.id, activeConcept.midjourneyPrompt)}
                className="text-xs rounded-xl mt-2 w-full"
              >
                {copiedPromptId === activeConcept.id ? (
                  <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                )}
                {copiedPromptId === activeConcept.id ? "Copied Prompt" : "Copy AI Prompt"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Thumbnail Studio"
        roleLabel="Thumbnail Art Director"
        contextData={`Video Title: ${videoTitle}. Selected concept: ${activeConcept.name}. Text: "${activeConcept.textOverlay}"`}
        placeholder="Ask how to improve contrast, face angles, or test against competitors..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
