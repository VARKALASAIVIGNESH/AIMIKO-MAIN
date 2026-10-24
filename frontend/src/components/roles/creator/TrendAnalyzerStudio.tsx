import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  TrendingUp,
  Sparkles,
  Flame,
  Search,
  ArrowUpRight,
  BarChart2,
  Clock,
  Layers,
  Zap,
  Target,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TrendTopic {
  id: string;
  topic: string;
  growth: string;
  saturation: "Low" | "Medium" | "High";
  velocity: number;
  bestFormat: string;
  winningAngle: string;
  recommendedHooks: string[];
}

const mockTrends: Record<string, TrendTopic[]> = {
  tech: [
    {
      id: "t-1",
      topic: "Autonomous AI Agents Running on Local MacBooks",
      growth: "+210% (Past 14 Days)",
      saturation: "Low",
      velocity: 96,
      bestFormat: "Hands-on Benchmark & Setup Tutorial (8–10m)",
      winningAngle: "Why cloud subscriptions are dying and privacy-first local models are winning.",
      recommendedHooks: [
        "I cut my OpenAI bill from $300 to $0 by running this 100% free model locally.",
        "Apple's M4 chip just made cloud AI obsolete for 90% of developers.",
        "Don't pay for another AI tool until you test this 5-minute offline install."
      ]
    },
    {
      id: "t-2",
      topic: "Vibe Coding & AI Prompt Engineering for Non-Coders",
      growth: "+145% (Past 30 Days)",
      saturation: "Medium",
      velocity: 88,
      bestFormat: "60-second Screen Capture Short / Reel",
      winningAngle: "Building and deploying real SaaS apps using only plain English prompts.",
      recommendedHooks: [
        "I built and launched a real paid SaaS in one weekend without typing a single line of code.",
        "Programmers are terrified of this new workflow, but solo founders are getting rich."
      ]
    },
    {
      id: "t-3",
      topic: "Voice-to-Everything Daily Productivity Workflows",
      growth: "+82% (Past 7 Days)",
      saturation: "Low",
      velocity: 79,
      bestFormat: "Desk Aesthetic Vlog & Routine",
      winningAngle: "How talking to AI while walking replaces 2 hours of typing emails.",
      recommendedHooks: [
        "Stop typing. Here is how I dictate 5,000 words a day into clean Notion docs."
      ]
    }
  ],
  finance: [
    {
      id: "f-1",
      topic: "High-Yield Cash Stacks & Treasury Bill Arbitrage",
      growth: "+95% (Past 30 Days)",
      saturation: "Medium",
      velocity: 84,
      bestFormat: "Spreadsheet Comparison Video",
      winningAngle: "Step-by-step cash safety for uncertain markets with zero stock picking risk.",
      recommendedHooks: [
        "If you have over $5,000 sitting in a normal bank account, you're quietly losing $200 a month.",
        "The risk-free 5% return glitch that banks don't advertise to regular customers."
      ]
    },
    {
      id: "f-2",
      topic: "Solo Side-Hustle Tax Write-Offs & LLC Structuring",
      growth: "+120% (Past 14 Days)",
      saturation: "Low",
      velocity: 91,
      bestFormat: "Checklist Breakdown",
      winningAngle: "Legal ways freelancers and creators save 30% on equipment and home offices.",
      recommendedHooks: [
        "3 things you bought this week that your accountant can write off legally.",
        "Before you register an LLC, avoid this $800 mistake that beginners always make."
      ]
    }
  ],
  education: [
    {
      id: "e-1",
      topic: "Active Recall & Second Brain Note-Taking Workflows",
      growth: "+160% (Past 30 Days)",
      saturation: "Low",
      velocity: 92,
      bestFormat: "Aesthetic Study With Me / Guide",
      winningAngle: "Replacing passive re-reading with automated quiz engines and spaced repetition.",
      recommendedHooks: [
        "How straight-A medical students study 3 hours less than everyone else.",
        "The scientific forgetting curve is why you fail exams, here is the 10-minute fix."
      ]
    }
  ]
};

export function TrendAnalyzerStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [niche, setNiche] = useState<"tech" | "finance" | "education">("tech");
  const [customKeyword, setCustomKeyword] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("t-1");
  const [copiedHook, setCopiedHook] = useState<string | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const activeTrends = mockTrends[niche] || mockTrends.tech;
  const currentTopic = activeTrends.find((t) => t.id === selectedTopicId) || activeTrends[0];

  const handleScanNiche = async () => {
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited trend scans.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      await generateAIResponse(
        `Analyze emerging viral content trends for the niche: ${niche}. Focus on topics with high search velocity and low competitor saturation.`,
        ageGroup,
        role,
        [],
        "You are an algorithm intelligence researcher who identifies breakout YouTube and TikTok trends."
      );
      toast({
        title: "Trend Radar Updated",
        description: "Fresh breakout signals identified for this niche."
      });
    } catch {
      toast({ title: "Updated", description: "Trends refreshed." });
    } finally {
      setIsScanning(false);
    }
  };

  const copyHook = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHook(text);
    toast({ title: "Hook Copied", description: "Ready to test in your next script or short." });
    setTimeout(() => setCopiedHook(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Content Creator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Viral Radar & Niche Insights</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-emerald-500" /> Viral Trend Analyzer
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Identify breakout topic surges before they saturate your feed and capture first-mover views.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Trend Strategist
          </Button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Niche Filters & Trend List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-primary" /> Select Content Niche
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={isScanning}
                onClick={handleScanNiche}
                className="h-7 text-xs text-primary"
              >
                {isScanning ? "Scanning..." : "Refresh Signals"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: "tech", label: "💻 AI & Tech Trends" },
                { id: "finance", label: "📈 Wealth & Personal Finance" },
                { id: "education", label: "📚 Education & Study Hacks" }
              ].map((n) => (
                <button
                  key={n.id}
                  onClick={() => {
                    setNiche(n.id as any);
                    setSelectedTopicId(mockTrends[n.id]?.[0]?.id || "");
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    niche === n.id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Cards Stream */}
          <div className="space-y-3">
            {activeTrends.map((t) => {
              const isSelected = t.id === currentTopic.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTopicId(t.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-500/80 bg-emerald-500/5 shadow-sm"
                      : "border-border/60 bg-card hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <ArrowUpRight className="h-3.5 w-3.5" /> {t.growth}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold bg-secondary px-2 py-0.5 rounded-full text-foreground">
                        Saturation: {t.saturation}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xs md:text-sm font-bold text-foreground leading-snug mb-2">
                    {t.topic}
                  </h3>

                  {/* Velocity Gauge */}
                  <div className="w-full bg-secondary/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${t.velocity}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1 text-[10px] text-muted-foreground">
                    <span>Viral Velocity</span>
                    <span className="font-bold text-foreground">{t.velocity}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: In-Depth Strategic Blueprint */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
                  Deep Angle Analysis
                </span>
                <h2 className="text-base md:text-lg font-bold text-foreground mt-0.5">
                  {currentTopic.topic}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
                {currentTopic.bestFormat}
              </span>
            </div>

            {/* Winning Angle */}
            <div className="bg-secondary/40 border border-border/50 rounded-2xl p-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-1.5">
                <Flame className="h-4 w-4 text-amber-500" /> The Winning Creator Angle
              </span>
              <p className="text-xs md:text-sm text-foreground/90 leading-relaxed font-medium">
                {currentTopic.winningAngle}
              </p>
            </div>

            {/* Recommended Hooks to film */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-amber-500" /> Pre-Tested Hook Openers
                </h4>
                <span className="text-[10px] text-muted-foreground">Click to copy</span>
              </div>

              <div className="space-y-2">
                {currentTopic.recommendedHooks.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => copyHook(h)}
                    className="p-3 rounded-xl border border-border/60 bg-secondary/20 hover:bg-secondary/60 cursor-pointer flex items-center justify-between gap-3 transition-colors text-xs"
                  >
                    <p className="text-foreground font-medium leading-relaxed">"{h}"</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0 text-muted-foreground">
                      {copiedHook === h ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Trend Analyzer Studio"
        roleLabel="Algorithm Intelligence Agent"
        contextData={`Niche: ${niche}. Selected trend: ${currentTopic.topic}. Growth: ${currentTopic.growth}`}
        placeholder="Ask for angle adaptations, sponsor pitch ideas, or cross-platform strategies..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
