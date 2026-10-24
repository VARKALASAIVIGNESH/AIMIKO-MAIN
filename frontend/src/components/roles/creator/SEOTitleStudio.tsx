import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Flame,
  Sparkles,
  Copy,
  Check,
  Video,
  Eye,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Zap,
  Repeat
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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

export function SEOTitleStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"hook_arena" | "repurposer">("hook_arena");
  const [topic, setTopic] = useState("Why 90% of programmers quit in their first year");
  const [targetPlatform, setTargetPlatform] = useState<"tiktok_reels" | "youtube_shorts" | "longform">("tiktok_reels");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // 5 Psychological Hook Variations
  const [hooks, setHooks] = useState<HookBattleOption[]>([
    {
      psychology: "Negative FOMO & Loss Aversion",
      hookLine: "If you're still learning to code like this in 2026, you're literally wasting 80% of your time.",
      retentionScore: 94,
      deliveryTip: "Start deadpan directly into the camera. Cut audio on the word 'wasting'.",
      visualCue: "[Fast text on screen: 80% WASTED + red glitch flash]"
    },
    {
      psychology: "Curiosity Gap & The Secret Rule",
      hookLine: "There's an unwritten rule that senior developers never tell beginners. Here it is.",
      retentionScore: 92,
      deliveryTip: "Lean slightly closer to the mic; whisper-conversational tone.",
      visualCue: "[Visual blur behind you, high-contrast subtitles centered]"
    },
    {
      psychology: "Contrarian / Hot Take",
      hookLine: "Stop watching coding tutorials. It's giving you fake dopamine and zero real skills.",
      retentionScore: 89,
      deliveryTip: "High energy, hand gesture slap on 'Stop'. Immediate pattern interrupt.",
      visualCue: "[Cross out a tutorial screenshot on screen with big red X]"
    },
    {
      psychology: "Visual Shock & Relatability",
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
      title: "Clip #1: The Tutorial Trap",
      hook: "Why tutorial hell is keeping you unemployed in tech.",
      corePayload: "When you follow a 10-hour tutorial, your brain isn't solving problems — it's just typing along. The moment you close the tab, you can't build a single form. Fix this by building the exact same project without watching the video.",
      callToAction: "Save this so you don't forget when you start your next project."
    },
    {
      title: "Clip #2: The 20-Minute Error Rule",
      hook: "The #1 rule junior devs break that burns them out.",
      corePayload: "If you've been stuck on a bug for more than 20 minutes without writing a single console log, you're not debugging — you're guessing. Step back, write out the state changes on paper, then solve it.",
      callToAction: "Share this with a fellow coder who needs this today."
    }
  ]);

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
        `Generate 5 viral 3-second psychological hooks for:
Topic: ${topic}
Platform: ${targetPlatform}
Styles: Negative FOMO, Curiosity Gap, Contrarian Hot Take, Visual Shock, High-Stakes Case Study. Include visual cue and delivery tip.`,
        ageGroup,
        role,
        [],
        "You are an elite short-form retention engineer and viral creator consultant."
      );
      toast({
        title: "Hooks Generated",
        description: "5 psychological hook variants generated with retention metrics!"
      });
    } catch {
      toast({ title: "Updated", description: "Hooks refreshed." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({ title: "Copied to clipboard", description: "Ready to paste into your script or camera app." });
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Creator Viral Engine
            </span>
            <span className="text-xs text-muted-foreground">• 3-Second Hook Arena & Shorts Repurposer</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Flame className="h-6 w-6 text-rose-500" /> 3-Second Viral Hook Arena & Repurposer
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            The first 3 seconds decide if your video gets 500 views or 500,000 views. Test 5 psychological hooks and repurpose topics into short-form gold.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-secondary/80 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab("hook_arena")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "hook_arena"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Flame className="h-3 w-3 inline mr-1 text-rose-500" /> Hook Battle Arena
            </button>
            <button
              onClick={() => setActiveTab("repurposer")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "repurposer"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Repeat className="h-3 w-3 inline mr-1 text-purple-500" /> Shorts Repurposer
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:opacity-90 shadow-md font-bold"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Viral Strategist
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Topic & Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Video Idea or Content Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="What is your video about?"
                className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Target Format & Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "tiktok_reels", label: "TikTok / Reels" },
                  { id: "youtube_shorts", label: "YT Shorts" },
                  { id: "longform", label: "Longform Intro" }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setTargetPlatform(p.id as any)}
                    className={`py-2 px-2 text-center rounded-xl text-[11px] font-bold border transition-all ${
                      targetPlatform === p.id
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                        : "bg-secondary/40 text-muted-foreground border-border/40 hover:bg-secondary"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateHooks}
              disabled={isGenerating || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Simulating Viral Retention..." : "Generate 5 Competing Hooks"}
            </Button>
          </div>

          {/* Retention Psychology Cheat Sheet */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-rose-500" /> The 3-Second Retention Law
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Never start with <span className="line-through text-red-500">"Hey guys, today we are going to..."</span>. Start in media res (middle of the action), disrupt the scrolling habit with sudden movement or a contrarian claim, and answer why the viewer should care within 3.5 seconds.
            </p>
          </div>
        </div>

        {/* Right Column: Hook Arena or Repurposer Cards */}
        <div className="lg:col-span-7 space-y-3">
          {activeTab === "hook_arena" && (
            <>
              {hooks.map((h, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 hover:border-rose-500/40 transition-all shadow-xs relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                      #{idx + 1} {h.psychology}
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ⚡ {h.retentionScore}% Retention Score
                    </span>
                  </div>

                  <p className="text-sm md:text-base font-bold text-foreground leading-snug">
                    "{h.hookLine}"
                  </p>

                  <div className="bg-secondary/40 border border-border/30 rounded-xl p-2.5 space-y-1 text-[11px]">
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">🎬 Visual Direction:</strong> {h.visualCue}
                    </div>
                    <div className="text-muted-foreground">
                      <strong className="text-foreground">🎙️ Delivery Tip:</strong> {h.deliveryTip}
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(h.hookLine)}
                      className="h-7 text-xs rounded-lg"
                    >
                      {copiedText === h.hookLine ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedText === h.hookLine ? "Copied" : "Copy Hook Line"}
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}

          {activeTab === "repurposer" && (
            <>
              {repurposedClips.map((clip, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 hover:border-purple-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                      {clip.title}
                    </span>
                    <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-semibold text-muted-foreground">
                      ~35 seconds
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block mb-0.5">
                        Hook (0:00 - 0:04)
                      </span>
                      <p className="font-bold text-foreground">"{clip.hook}"</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Core Punchline (0:04 - 0:30)
                      </span>
                      <p className="text-foreground leading-relaxed">{clip.corePayload}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                        Call To Action (0:30 - 0:35)
                      </span>
                      <p className="text-foreground italic">"{clip.callToAction}"</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          `HOOK: ${clip.hook}\n\nBODY:\n${clip.corePayload}\n\nCTA: ${clip.callToAction}`
                        )
                      }
                      className="h-7 text-xs rounded-lg"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy Full Clip Script
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <RoleAiSidekick
        toolName="3-Second Hook Arena"
        roleLabel="Viral Retention Director"
        contextData={`Topic: ${topic}. Format: ${targetPlatform}`}
        placeholder="Ask to tailor for a TikTok trend, increase controversy, or adapt for a tech audience..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
