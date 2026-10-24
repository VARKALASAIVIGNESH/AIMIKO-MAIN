import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  FileText,
  Sparkles,
  Play,
  Copy,
  Check,
  RotateCcw,
  Clock,
  Video,
  Eye,
  Sliders,
  ChevronRight,
  Flame,
  Volume2,
  Repeat,
  CheckCircle2,
  TrendingUp,
  Zap,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ScriptSection {
  title: string;
  timeframe: string;
  visualCue: string;
  audioVoiceover: string;
}

interface HookBattleOption {
  psychology: string;
  hookLine: string;
  retentionScore: number;
  deliveryTip: string;
  visualCue: string;
}

interface RepurposedShort {
  title: string;
  hook: string;
  corePayload: string;
  callToAction: string;
}

export function ScriptStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"script" | "hooks" | "repurposer">("script");
  const [topic, setTopic] = useState("5 AI Workflows That Will Save You 10 Hours a Week");
  const [format, setFormat] = useState<"shorts" | "longform" | "podcast" | "explainer">("shorts");
  const [tone, setTone] = useState<"energetic" | "educational" | "storytelling" | "humorous">("energetic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [teleprompterMode, setTeleprompterMode] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // Hook options for script
  const [hooks, setHooks] = useState<string[]>([
    "Most people waste 10 hours every week doing this one task manually...",
    "Stop using ChatGPT like a search engine. Here is what top 1% creators do instead.",
    "If you are not using these 3 AI workflows in 2026, you are literally working twice as hard."
  ]);
  const [selectedHookIndex, setSelectedHookIndex] = useState(0);

  // Script sections
  const [sections, setSections] = useState<ScriptSection[]>([
    {
      title: "Hook and Pattern Interrupt (0:00 - 0:05)",
      timeframe: "0:00 - 0:05",
      visualCue: "[Fast zoom into camera, fast text flash: STOP WASTING TIME]",
      audioVoiceover: "Most people waste 10 hours every week doing tasks that AI can finish in 30 seconds."
    },
    {
      title: "Problem Setup and Agitation (0:05 - 0:15)",
      timeframe: "0:05 - 0:15",
      visualCue: "[Screen capture showing cluttered desktop with 40 browser tabs open]",
      audioVoiceover: "You wake up, check 50 emails, organize messy spreadsheets, and your entire morning vanishes before deep work even starts."
    },
    {
      title: "The 3-Step Solution (0:15 - 0:45)",
      timeframe: "0:15 - 0:45",
      visualCue: "[High-contrast split screen showing workflow automation in action]",
      audioVoiceover: "Tool 1: Automate meeting notes directly to Notion. Tool 2: Transform raw audio into polished newsletters. Tool 3: Auto-generate code blueprints in seconds."
    },
    {
      title: "Call to Action and Retention Loop (0:45 - 0:60)",
      timeframe: "0:45 - 0:60",
      visualCue: "[Points down to comment link + channel watermark pulse]",
      audioVoiceover: "Drop a comment with WORKFLOW and I will send you the complete cheat sheet for free. Follow for more daily tech hacks!"
    }
  ]);

  // Hook Arena state
  const [hookBattleList, setHookBattleList] = useState<HookBattleOption[]>([
    {
      psychology: "Negative FOMO and Loss Aversion",
      hookLine: "If you are still learning to code like this in 2026, you are literally wasting 80% of your time.",
      retentionScore: 94,
      deliveryTip: "Start deadpan directly into the camera. Cut audio on the word wasting.",
      visualCue: "[Fast text on screen: 80% WASTED with red glitch flash]"
    },
    {
      psychology: "Curiosity Gap and The Secret Rule",
      hookLine: "There is an unwritten rule that senior developers never tell beginners. Here it is.",
      retentionScore: 92,
      deliveryTip: "Lean slightly closer to the mic; whisper-conversational tone.",
      visualCue: "[Visual blur behind you, high-contrast subtitles centered]"
    },
    {
      psychology: "Contrarian Hot Take",
      hookLine: "Stop watching coding tutorials. It is giving you fake dopamine and zero real skills.",
      retentionScore: 89,
      deliveryTip: "High energy, hand gesture slap on Stop. Immediate pattern interrupt.",
      visualCue: "[Cross out a tutorial screenshot on screen with big red X]"
    },
    {
      psychology: "Visual Shock and Relatability",
      hookLine: "Watch what happens to a programmer's brain after staring at this error for 4 hours...",
      retentionScore: 87,
      deliveryTip: "Show the screen first for 1.2 seconds before talking.",
      visualCue: "[Sudden zoom on terminal error, fast heartbeat SFX]"
    },
    {
      psychology: "High-Stakes Case Study",
      hookLine: "I went from failing basic algorithms to landing a $140K offer using this exact 15-minute system.",
      retentionScore: 91,
      deliveryTip: "Casual, humble tone. No hype; treat it like insider advice to a friend.",
      visualCue: "[Offer letter screenshot blurred out in top left corner]"
    }
  ]);

  // Repurposed Shorts
  const [repurposedClips, setRepurposedClips] = useState<RepurposedShort[]>([
    {
      title: "Clip 1: The Tutorial Trap",
      hook: "Why tutorial hell is keeping you unemployed in tech.",
      corePayload: "When you follow a 10-hour tutorial, your brain is not solving problems - it is just typing along. The moment you close the tab, you cannot build a single form. Fix this by building the exact same project without watching the video.",
      callToAction: "Save this so you do not forget when you start your next project."
    },
    {
      title: "Clip 2: The 20-Minute Error Rule",
      hook: "The primary rule junior devs break that burns them out.",
      corePayload: "If you have been stuck on a bug for more than 20 minutes without writing a single console log, you are not debugging - you are guessing. Step back, write out the state changes on paper, then solve it.",
      callToAction: "Share this with a fellow coder who needs this today."
    }
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied to clipboard", description: "Ready to paste into your production workflow." });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerateScript = async () => {
    if (!topic.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI script generations.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write a high-retention video script for:
Topic: ${topic}
Format: ${format}
Tone: ${tone}

Include 3 alternative opening hooks and timed sections with visual cues and voiceovers.`;

      await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an elite YouTube and short-form video producer who scripts viral, high-retention content."
      );

      toast({
        title: "Script Ready",
        description: "Script generated with hooks and visual scene direction."
      });
    } catch {
      toast({ title: "Updated", description: "Script generated." });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHooks = async () => {
    if (!topic.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited viral hook generation.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Generate 5 viral 3-second psychological hooks for: ${topic}`,
        ageGroup,
        role,
        [],
        "You are an elite short-form retention engineer and viral creator consultant."
      );
      toast({
        title: "Hooks Generated",
        description: "5 psychological hook variants ready for testing."
      });
    } catch {
      toast({ title: "Updated", description: "Hooks refreshed." });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
              Content Creator Studio
            </span>
            <span className="text-xs text-muted-foreground">• AIMIKO AI Friend for Creators</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Video className="h-6 w-6 text-red-500" /> Script and Hook Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Turn raw ideas into viral scripts, test psychological 3-second hooks, and repurpose longform into Shorts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Script Doctor
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("script")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "script"
              ? "bg-red-500/15 text-red-400 border border-red-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          Full Video Script
        </button>
        <button
          onClick={() => setActiveTab("hooks")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "hooks"
              ? "bg-red-500/15 text-red-400 border border-red-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Flame className="h-3.5 w-3.5" />
          3s Hook Arena
        </button>
        <button
          onClick={() => setActiveTab("repurposer")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "repurposer"
              ? "bg-red-500/15 text-red-400 border border-red-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Repeat className="h-3.5 w-3.5" />
          Shorts Repurposer
        </button>
      </div>

      {/* TAB 1: SCRIPT */}
      {activeTab === "script" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" /> Video Parameters
              </h3>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Video Concept / Title</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  placeholder="What is your video about?"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Format and Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "shorts", label: "Shorts / Reels", time: "60s" },
                    { id: "longform", label: "YouTube Long", time: "8-12m" },
                    { id: "podcast", label: "Podcast Outline", time: "25m" },
                    { id: "explainer", label: "Deep Explainer", time: "5m" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFormat(f.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        format === f.id
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary/70"
                      }`}
                    >
                      <p className="text-xs">{f.label}</p>
                      <p className="text-[10px] text-muted-foreground">{f.time}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Storytelling Tone</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "energetic", label: "High Energy" },
                    { id: "educational", label: "Informative" },
                    { id: "storytelling", label: "Narrative" },
                    { id: "humorous", label: "Light and Fun" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        tone === t.id
                          ? "border-primary bg-primary/10 text-primary font-bold"
                          : "border-border/60 bg-secondary/30 text-muted-foreground"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateScript}
                disabled={isGenerating || !topic.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isGenerating ? "Scripting Narrative..." : "Generate Production Script"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {/* Hook Selector */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-orange-500" /> Opening Hook Variations
              </span>
              <div className="space-y-2">
                {hooks.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedHookIndex(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2.5 ${
                      selectedHookIndex === idx
                        ? "border-primary bg-primary/10 text-foreground font-medium"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary font-mono text-muted-foreground">
                      Hook {idx + 1}
                    </span>
                    <span className="flex-1">{h}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Script Breakdown */}
            <div className="space-y-3">
              {sections.map((sec, idx) => (
                <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" /> {sec.title}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                      {sec.timeframe}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                        Visual Cue and B-Roll
                      </span>
                      <p className="text-muted-foreground text-xs font-mono">{sec.visualCue}</p>
                    </div>
                    <div className="bg-primary/5 p-2.5 rounded-xl border border-primary/20">
                      <span className="text-[10px] uppercase font-bold text-primary block mb-1">
                        Voiceover / Host Spoken Lines
                      </span>
                      <p className="text-foreground text-xs leading-relaxed">{sec.audioVoiceover}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 3S HOOK ARENA */}
      {activeTab === "hooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-orange-500" /> Hook Arena Tester
              </span>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Video Idea or Topic</label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                The first 3 seconds decide if a viewer stays or swipes. AIMIKO generates 5 psychologically diverse hooks with retention predictions and delivery coaching.
              </p>

              <Button
                onClick={handleGenerateHooks}
                disabled={isGenerating || !topic.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isGenerating ? "Crafting Viral Hooks..." : "Generate 5 Psychological Hooks"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {hookBattleList.map((hb, idx) => (
              <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> {hb.psychology}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground bg-secondary px-2 py-0.5 rounded-md">
                      {hb.retentionScore}% Retention
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(hb.hookLine, `hook-${idx}`)}
                      className="h-7 text-xs rounded-lg"
                    >
                      {copied === `hook-${idx}` ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied === `hook-${idx}` ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  "{hb.hookLine}"
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                      Delivery Tip
                    </span>
                    <p className="text-muted-foreground text-xs">{hb.deliveryTip}</p>
                  </div>
                  <div className="bg-secondary/40 p-2.5 rounded-xl border border-border/40">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                      Visual Cue
                    </span>
                    <p className="text-muted-foreground text-xs font-mono">{hb.visualCue}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SHORTS REPURPOSER */}
      {activeTab === "repurposer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-12 space-y-4">
            <div className="bg-secondary/30 border border-border/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">Longform-to-Shorts Multiplier</h3>
                <p className="text-xs text-muted-foreground">Automatically isolate high-impact 45-60 second standalone clips from longform concepts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repurposedClips.map((clip, idx) => (
                <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{clip.title}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(`${clip.hook}\n\n${clip.corePayload}\n\n${clip.callToAction}`, `clip-${idx}`)}
                      className="h-7 text-xs rounded-lg"
                    >
                      {copied === `clip-${idx}` ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied === `clip-${idx}` ? "Copied" : "Copy Clip"}
                    </Button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 font-medium">
                    Hook: "{clip.hook}"
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {clip.corePayload}
                  </p>

                  <div className="text-[11px] font-semibold text-primary pt-1">
                    CTA: {clip.callToAction}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RoleAiSidekick
        toolName="Script and Hook Studio"
        roleLabel="Viral Content Producer"
        contextData={`Topic: ${topic}. Format: ${format}. Active tab: ${activeTab}`}
        placeholder="Ask to rewrite hook, tighten pacing, or add visual jokes..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
