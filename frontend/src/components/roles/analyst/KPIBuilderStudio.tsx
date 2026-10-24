import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Target,
  Sparkles,
  Calculator,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function KPIBuilderStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [businessModel, setBusinessModel] = useState<"saas" | "ecommerce" | "marketplace">("saas");
  const [cac, setCac] = useState(250);
  const [arpu, setArpu] = useState(79);
  const [churnRate, setChurnRate] = useState(3.5); // % per month
  const [grossMargin, setGrossMargin] = useState(80); // %
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // Computations
  const monthlyChurnDecimal = Math.max(churnRate / 100, 0.001);
  const customerLifespanMonths = 1 / monthlyChurnDecimal;
  const ltv = Math.round(customerLifespanMonths * arpu * (grossMargin / 100));
  const ltvToCacRatio = (ltv / Math.max(cac, 1)).toFixed(1);
  const paybackMonths = (cac / Math.max(arpu * (grossMargin / 100), 1)).toFixed(1);

  const isHealthy = Number(ltvToCacRatio) >= 3.0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Data Analyst Studio
            </span>
            <span className="text-xs text-muted-foreground">• Unit Economics & Metric Architecture</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-500" /> KPI Architecture & Unit Economics Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Model LTV, CAC payback velocity, churn sensitivities, and executive dashboard formulas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Unit Economics Advisor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interactive Formula Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Business Model
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "saas", label: "B2B SaaS" },
                { id: "ecommerce", label: "E-Commerce" },
                { id: "marketplace", label: "Marketplace" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setBusinessModel(m.id as any)}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                    businessModel === m.id
                      ? "border-primary bg-primary/10 text-primary shadow-xs"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Customer Acquisition Cost (CAC)</span>
                  <span className="font-mono text-primary font-bold">${cac}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1500"
                  step="10"
                  value={cac}
                  onChange={(e) => setCac(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Monthly ARPU (Avg Revenue / User)</span>
                  <span className="font-mono text-primary font-bold">${arpu}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={arpu}
                  onChange={(e) => setArpu(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Monthly Churn Rate</span>
                  <span className="font-mono text-primary font-bold">{churnRate}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={churnRate}
                  onChange={(e) => setChurnRate(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-foreground">Gross Margin %</span>
                  <span className="font-mono text-primary font-bold">{grossMargin}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  step="5"
                  value={grossMargin}
                  onChange={(e) => setGrossMargin(Number(e.target.value))}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Computed Health & Scorecard */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                Calculated Lifetime Value (LTV)
              </span>
              <p className="text-2xl font-black text-foreground mt-1 font-mono">${ltv}</p>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                Avg Lifespan: {customerLifespanMonths.toFixed(1)} months
              </span>
            </div>

            <div className={`rounded-2xl p-4 border shadow-xs ${
              isHealthy ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" : "bg-amber-500/10 border-amber-500/30 text-amber-500"
            }`}>
              <span className="text-[10px] uppercase font-bold block">
                LTV : CAC Ratio (Benchmark: &gt; 3.0x)
              </span>
              <p className="text-2xl font-black mt-1 font-mono">{ltvToCacRatio}x</p>
              <span className="text-[10px] font-semibold mt-0.5 block">
                {isHealthy ? "✓ Sustainable Unit Economics" : "⚠️ High Customer Acquisition Cost"}
              </span>
            </div>
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Calculator className="h-4 w-4 text-primary" /> Payback Velocity & Growth Health
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="flex justify-between border-b border-border/40 pb-2">
                <span>CAC Payback Period:</span>
                <span className="font-mono font-bold text-foreground">{paybackMonths} months</span>
              </p>
              <p className="flex justify-between border-b border-border/40 pb-2">
                <span>Net Retention Target:</span>
                <span className="font-mono font-bold text-foreground">&gt; 115% NRR for top-quartile</span>
              </p>
              <p className="flex justify-between pt-1">
                <span>Magic Number Capital Efficiency:</span>
                <span className="font-mono font-bold text-foreground">0.85 (Strong expansion runway)</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="KPI Builder Studio"
        roleLabel="VP of Strategic Finance & Analytics"
        contextData={`Model: ${businessModel}. LTV: $${ltv}. CAC: $${cac}. LTV:CAC Ratio: ${ltvToCacRatio}x`}
        placeholder="Ask how to reduce CAC, build expansion revenue loops, or model cohort churn..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
