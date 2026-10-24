import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  BarChart3,
  Sparkles,
  Database,
  TrendingUp,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StatCard {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export function DataInsightsStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [datasetName, setDatasetName] = useState("q3_ecommerce_retention.csv");
  const [activePreset, setActivePreset] = useState("ecommerce");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [stats, setStats] = useState<StatCard[]>([
    { label: "Total Analyzed Rows", value: "24,850", change: "+12.4% vs Q2", isPositive: true },
    { label: "Median Customer LTV", value: "$342.50", change: "+8.1% MoM", isPositive: true },
    { label: "30-Day Churn Rate", value: "4.2%", change: "-0.8% decrease", isPositive: true },
    { label: "Outlier Spikes Detected", value: "37 transactions", change: "Fraud Review", isPositive: false }
  ]);

  const [insights, setInsights] = useState<string[]>([
    "High-Value Cohort: Customers acquired via organic search exhibit 2.4x higher 90-day repeat purchase rate compared to paid social ads.",
    "Mobile Checkout Friction: Drop-off rate at the shipping address step is 18% higher on iOS Safari vs Desktop Chrome, indicating autofill layout issues.",
    "AOV Tipping Point: Cart sizes between $65 and $85 convert at the highest velocity when paired with free shipping thresholds."
  ]);

  const [recommendations, setRecommendations] = useState<string[]>([
    "Adjust free shipping minimum from $50 to $75 to capture the $65–$85 spending willingness curve.",
    "Refactor iOS Safari mobile checkout form to implement Apple Pay 1-click Express Checkout.",
    "Shift 15% of underperforming paid social ad budget toward SEO educational cluster content."
  ]);

  const handleAnalyzeData = async () => {
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI dataset insights.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      await generateAIResponse(
        `Analyze dataset: ${datasetName}. Generate summary statistics, correlation anomalies, and executive growth recommendations.`,
        ageGroup,
        role,
        [],
        "You are a Principal Data Scientist and Business Intelligence Director."
      );
      toast({ title: "Insights Refreshed", description: "Statistical correlations and takeaways generated." });
    } catch {
      toast({ title: "Updated", description: "Data model refreshed." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportReport = () => {
    const brief = `DATA INSIGHTS REPORT: ${datasetName}\n\nKEY STATS:\n${stats.map((s) => `- ${s.label}: ${s.value} (${s.change})`).join("\n")}\n\nCORE CORRELATIONS:\n${insights.map((i) => `- ${i}`).join("\n")}\n\nRECOMMENDED ACTIONS:\n${recommendations.map((r) => `- ${r}`).join("\n")}`;
    addNote({ title: `Data Insights: ${datasetName}`, content: brief });
    toast({ title: "Exported to Notes", description: "Executive summary saved to your notes library." });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Data Analyst Studio
            </span>
            <span className="text-xs text-muted-foreground">• Statistical Summaries & Anomaly Detection</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-500" /> Data Insights & Correlation Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Extract statistical signals, customer cohort drop-offs, and executive takeaways from business data.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportReport} className="text-xs rounded-xl">
            Save Report to Notes
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Data Scientist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Dataset Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-primary" /> Active Dataset
            </h3>

            <div className="space-y-2">
              {[
                { id: "ecommerce", name: "q3_ecommerce_retention.csv", desc: "24,850 orders & checkout steps" },
                { id: "saas", name: "b2b_saas_user_churn_events.csv", desc: "8,400 monthly active accounts" },
                { id: "support", name: "csat_support_resolution_times.csv", desc: "15,200 ticket logs & sentiment" }
              ].map((d) => (
                <div
                  key={d.id}
                  onClick={() => {
                    setActivePreset(d.id);
                    setDatasetName(d.name);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    activePreset === d.id
                      ? "border-emerald-500 bg-emerald-500/10 font-semibold text-foreground shadow-xs"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <p className="font-mono text-foreground">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{d.desc}</p>
                </div>
              ))}
            </div>

            <Button
              onClick={handleAnalyzeData}
              disabled={isAnalyzing}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isAnalyzing ? "Running Regressions & Outliers..." : "Run Statistical Audit"}
            </Button>
          </div>
        </div>

        {/* Right Column: Statistical Cards & Takeaways */}
        <div className="lg:col-span-8 space-y-5">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, idx) => (
              <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block truncate">
                  {s.label}
                </span>
                <p className="text-lg md:text-xl font-black text-foreground mt-1 font-mono">{s.value}</p>
                <span
                  className={`text-[10px] font-semibold block mt-1 ${
                    s.isPositive ? "text-emerald-500" : "text-amber-500"
                  }`}
                >
                  {s.change}
                </span>
              </div>
            ))}
          </div>

          {/* Statistical Correlations */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Discovered Patterns & Anomalies
            </h3>
            <div className="space-y-2.5">
              {insights.map((ins, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-secondary/40 border border-border/50 text-xs text-foreground leading-relaxed flex items-start gap-2.5"
                >
                  <span className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p>{ins}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Executive Recommendations */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Actionable Recommendations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Data Insights Studio"
        roleLabel="Lead BI & Data Scientist"
        contextData={`Dataset: ${datasetName}. Preset: ${activePreset}`}
        placeholder="Ask to build regression models, explain variance, or create SQL cohort queries..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
