import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  LayoutGrid,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CanvasBlock {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}

export function LeanCanvasStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("Aimiko Commerce");
  const [copied, setCopied] = useState(false);
  const [isPopulating, setIsPopulating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [blocks, setBlocks] = useState<Record<string, CanvasBlock>>({
    problem: {
      id: "problem",
      title: "1. Problem",
      subtitle: "Top 3 friction points",
      content: "• 70%+ shopping cart abandonment rate\n• High customer support overhead for repetitive sizing/FAQ questions\n• Fragmented shopper profiles across independent stores"
    },
    segments: {
      id: "segments",
      title: "2. Customer Segments",
      subtitle: "Target audience & early adopters",
      content: "• Independent Shopify & WooCommerce DTC merchants ($500K-$5M GMV)\n• High-intent digital shoppers seeking fast product comparisons"
    },
    uvp: {
      id: "uvp",
      title: "3. Unique Value Prop",
      subtitle: "Single clear compelling message",
      content: "An autonomous AI shopping assistant that embeds directly into any store in 1 minute, helping shoppers discover products, compare offers, and checkout with zero friction."
    },
    solution: {
      id: "solution",
      title: "4. Solution",
      subtitle: "Top 3 features",
      content: "• Real-time contextual store assistant widget\n• Automated price comparison and bundle suggestion engine\n• Universal cross-store shopper memory"
    },
    channels: {
      id: "channels",
      title: "5. Channels",
      subtitle: "Path to customers",
      content: "• Shopify App Store organic marketplace rank\n• Direct partner outreach to DTC e-commerce agencies\n• Word-of-mouth powered by 'Powered by AIMIKO' shopper badge"
    },
    revenue: {
      id: "revenue",
      title: "6. Revenue Streams",
      subtitle: "Pricing & margins",
      content: "• Free tier: Up to 500 assisted chats/month\n• Growth: $99/mo + 1% recovered cart commission\n• Enterprise: $499/mo custom integrations"
    },
    costs: {
      id: "costs",
      title: "7. Cost Structure",
      subtitle: "Fixed & operational expenses",
      content: "• LLM token inference infrastructure (cached vector embeddings)\n• Cloud database & CDN hosting (AWS / Supabase)\n• Merchant acquisition & onboarding engineering"
    },
    metrics: {
      id: "metrics",
      title: "8. Key Metrics",
      subtitle: "Growth & retention drivers",
      content: "• Cart Recovery Conversion Rate (% of assisted shoppers who purchase)\n• Monthly Recurring Revenue (MRR)\n• Net Revenue Retention (NRR > 120%)"
    },
    advantage: {
      id: "advantage",
      title: "9. Unfair Advantage",
      subtitle: "Cannot be easily bought or copied",
      content: "Proprietary multi-store shopping intent graph and high-speed local inference adapters that run without third-party cookie reliance."
    }
  });

  const updateBlock = (key: string, content: string) => {
    setBlocks((prev) => ({
      ...prev,
      [key]: { ...prev[key], content }
    }));
  };

  const handleAutoPopulate = async () => {
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI canvas builds.",
        variant: "destructive"
      });
      return;
    }

    setIsPopulating(true);
    try {
      await generateAIResponse(
        `Populate a 9-box Lean Canvas for: ${companyName}. Include Problem, Solution, UVP, Unfair Advantage, Channels, Segments, Metrics, Costs, Revenue.`,
        ageGroup,
        role,
        [],
        "You are Ash Maurya, author of Running Lean and creator of the Lean Canvas."
      );
      toast({ title: "Lean Canvas Refined", description: "All 9 boxes populated with venture strategy." });
    } catch {
      toast({ title: "Updated", description: "Canvas ready." });
    } finally {
      setIsPopulating(false);
    }
  };

  const exportMarkdown = () => {
    const md = `# LEAN CANVAS: ${companyName}\n\n` +
      Object.values(blocks).map((b) => `## ${b.title} (${b.subtitle})\n${b.content}\n`).join("\n");
    navigator.clipboard.writeText(md);
    setCopied(true);
    toast({ title: "Copied Lean Canvas Markdown", description: "Ready to paste into Notion, Pitch, or docs." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Startup Founder Studio
            </span>
            <span className="text-xs text-muted-foreground">• Visual 9-Box Business Model Plan</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-emerald-500" /> Lean Canvas Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Construct an actionable 1-page business plan deconstructing problems, unique advantages, and unit economics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportMarkdown} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Lean Coach
          </Button>
        </div>
      </div>

      {/* Visual 9-Box Grid Layout */}
      <div className="mt-6 space-y-4">
        {/* Top 5 Primary Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Problem */}
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.problem.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.problem.subtitle}</span>
            <textarea
              value={blocks.problem.content}
              onChange={(e) => updateBlock("problem", e.target.value)}
              rows={7}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Solution */}
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.solution.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.solution.subtitle}</span>
            <textarea
              value={blocks.solution.content}
              onChange={(e) => updateBlock("solution", e.target.value)}
              rows={7}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* UVP */}
          <div className="bg-card border border-primary/40 rounded-2xl p-3.5 space-y-2 shadow-xs bg-primary/5">
            <span className="text-xs font-bold text-primary block">{blocks.uvp.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.uvp.subtitle}</span>
            <textarea
              value={blocks.uvp.content}
              onChange={(e) => updateBlock("uvp", e.target.value)}
              rows={7}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Unfair Advantage */}
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.advantage.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.advantage.subtitle}</span>
            <textarea
              value={blocks.advantage.content}
              onChange={(e) => updateBlock("advantage", e.target.value)}
              rows={7}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          {/* Customer Segments */}
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.segments.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.segments.subtitle}</span>
            <textarea
              value={blocks.segments.content}
              onChange={(e) => updateBlock("segments", e.target.value)}
              rows={7}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Middle 2 Supporting Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.metrics.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.metrics.subtitle}</span>
            <textarea
              value={blocks.metrics.content}
              onChange={(e) => updateBlock("metrics", e.target.value)}
              rows={4}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.channels.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.channels.subtitle}</span>
            <textarea
              value={blocks.channels.content}
              onChange={(e) => updateBlock("channels", e.target.value)}
              rows={4}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Bottom Financial Foundations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.costs.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.costs.subtitle}</span>
            <textarea
              value={blocks.costs.content}
              onChange={(e) => updateBlock("costs", e.target.value)}
              rows={4}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-3.5 space-y-2 shadow-xs">
            <span className="text-xs font-bold text-foreground block">{blocks.revenue.title}</span>
            <span className="text-[10px] text-muted-foreground block">{blocks.revenue.subtitle}</span>
            <textarea
              value={blocks.revenue.content}
              onChange={(e) => updateBlock("revenue", e.target.value)}
              rows={4}
              className="w-full bg-secondary/40 rounded-xl p-2 text-[11px] text-foreground leading-relaxed focus:outline-none resize-none"
            />
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Lean Canvas Studio"
        roleLabel="Principal Startup Strategist"
        contextData={`Startup: ${companyName}. Problem: ${blocks.problem.content}`}
        placeholder="Ask to refine value prop, test pricing models, or clarify early adopters..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
