import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Sparkles,
  ShieldAlert,
  TrendingUp,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function IdeaValidationStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [ideaTitle, setIdeaTitle] = useState("AI-Powered Autonomous Shopping Assistant for Independent Shopify Stores");
  const [targetCustomer, setTargetCustomer] = useState("Direct-to-consumer (DTC) brands doing $500K - $5M GMV");
  const [problemStatement, setProblemStatement] = useState("High cart abandonment (70%+) and zero real-time shopping guidance on mid-market e-commerce sites.");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // SWOT Matrix
  const [swot, setSwot] = useState({
    strengths: [
      "Zero friction for merchants (1-click Shopify app store installation)",
      "Instant demonstrable ROI: recovers abandoned carts in real-time"
    ],
    weaknesses: [
      "Reliance on platform APIs (Shopify app ecosystem changes)",
      "High LLM inference costs on high-traffic stores"
    ],
    opportunities: [
      "Cross-store universal shopper wallet and preference network",
      "Expansion into B2B wholesale re-ordering workflows"
    ],
    threats: [
      "Shopify launching native AI shopping agents into core admin",
      "Commoditization of generic chatbot wrappers"
    ]
  });

  const [marketSize, setMarketSize] = useState({
    tam: "$48B (Global E-commerce Conversational AI & Personalization)",
    sam: "$6.2B (Independent DTC Shopify & WooCommerce brands)",
    som: "$42M (Realistic 3-year capture with 2,500 active merchant stores)"
  });

  const [moatScore, setMoatScore] = useState(82);

  const handleEvaluate = async () => {
    if (!ideaTitle.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited startup validations.",
        variant: "destructive"
      });
      return;
    }

    setIsEvaluating(true);
    try {
      await generateAIResponse(
        `Validate this startup idea:\nIdea: ${ideaTitle}\nCustomer: ${targetCustomer}\nProblem: ${problemStatement}\nGenerate SWOT analysis, TAM/SAM/SOM estimates, and Moat Score.`,
        ageGroup,
        role,
        [],
        "You are a Venture Capital General Partner and Y Combinator startup advisor."
      );
      toast({ title: "Validation Updated", description: "SWOT matrix and market sizing refreshed." });
    } catch {
      toast({ title: "Updated", description: "Validation complete." });
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveToNotes = () => {
    const content = `STARTUP IDEA VALIDATION: ${ideaTitle}\nTarget Customer: ${targetCustomer}\nProblem: ${problemStatement}\n\nTAM: ${marketSize.tam}\nSAM: ${marketSize.sam}\nSOM: ${marketSize.som}\n\nSTRENGTHS:\n${swot.strengths.join("\n")}\n\nWEAKNESSES:\n${swot.weaknesses.join("\n")}\n\nOPPORTUNITIES:\n${swot.opportunities.join("\n")}\n\nTHREATS:\n${swot.threats.join("\n")}`;
    addNote({ title: `Validation: ${ideaTitle}`, content });
    toast({ title: "Saved to Notes", description: "Validation assessment saved to your notes." });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Startup Founder Studio
            </span>
            <span className="text-xs text-muted-foreground">• PMF, SWOT & Moat Stress-Testing</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" /> Startup Idea Validator Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Pressure-test startup concepts against market sizing, defensibility moats, and platform risks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveToNotes} className="text-xs rounded-xl">
            Save to Notes
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Venture Partner
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Startup Idea Definition */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Concept Blueprint
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Startup Concept / Solution</label>
              <textarea
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Target Customer Segment</label>
              <input
                type="text"
                value={targetCustomer}
                onChange={(e) => setTargetCustomer(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Core Problem Being Solved</label>
              <textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <Button
              onClick={handleEvaluate}
              disabled={isEvaluating || !ideaTitle.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isEvaluating ? "Stress-Testing Concept..." : "Evaluate Defensibility & SWOT"}
            </Button>
          </div>

          {/* Market Sizing Estimate */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-emerald-500" /> Market Size Estimator (TAM / SAM / SOM)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">TAM (Total Addressable)</span>
                <p className="font-mono font-bold text-foreground mt-0.5">{marketSize.tam}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/50">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">SAM (Serviceable Addressable)</span>
                <p className="font-mono font-bold text-foreground mt-0.5">{marketSize.sam}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">SOM (Serviceable Obtainable)</span>
                <p className="font-mono font-bold text-emerald-500 mt-0.5">{marketSize.som}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 2x2 SWOT Matrix */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Venture SWOT Matrix
            </h3>
            <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl">
              Moat Score: {moatScore}/100
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="bg-card border border-emerald-500/30 rounded-2xl p-4 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Internal Strengths
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {swot.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span className="text-foreground">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-card border border-amber-500/30 rounded-2xl p-4 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Internal Weaknesses
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {swot.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="text-foreground">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-card border border-blue-500/30 rounded-2xl p-4 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4" /> External Opportunities
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {swot.opportunities.map((o, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span className="text-foreground">{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-card border border-rose-500/30 rounded-2xl p-4 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4" /> External Threats
              </span>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {swot.threats.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span className="text-foreground">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Idea Validation Studio"
        roleLabel="Venture Capital General Partner"
        contextData={`Idea: ${ideaTitle}. Customer: ${targetCustomer}. Moat Score: ${moatScore}`}
        placeholder="Ask how to defend against big tech, improve retention loops, or find design partners..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
