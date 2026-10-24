import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  TrendingUp,
  Sparkles,
  PieChart,
  BarChart,
  LineChart,
  Layers,
  Copy,
  Check,
  Code2,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ChartAdvisorStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [objective, setObjective] = useState<"trend" | "comparison" | "composition" | "correlation">("trend");
  const [dataDescription, setDataDescription] = useState("Monthly recurring revenue (MRR) by subscription tier over the last 12 months");
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const rechartsSnippet = `// Recharts (React) Implementation
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Jan', starter: 4000, pro: 2400, enterprise: 2400 },
  { month: 'Feb', starter: 4500, pro: 3200, enterprise: 3100 },
  { month: 'Mar', starter: 5100, pro: 4100, enterprise: 4800 },
  { month: 'Apr', starter: 6200, pro: 5300, enterprise: 6200 },
];

export function RevenueTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="month" stroke="#888888" />
        <YAxis stroke="#888888" />
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <Tooltip />
        <Area type="monotone" dataKey="pro" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorPro)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}`;

  const copyCode = () => {
    navigator.clipboard.writeText(rechartsSnippet);
    setCopied(true);
    toast({ title: "Copied Recharts Code", description: "Ready to paste into your React project." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-500 border border-purple-500/20">
              Data Analyst Studio
            </span>
            <span className="text-xs text-muted-foreground">• Visualization & Chart Advisor</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-purple-500" /> Chart Advisor & Visualization Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Identify the optimal visual representation for your metrics and export ready-to-render React charts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Viz Advisor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Objective & Context */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Visual Objective
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "trend", label: "Trend Over Time", icon: LineChart, best: "Stacked Area / Line" },
                { id: "comparison", label: "Category Comparison", icon: BarChart, best: "Grouped Bar" },
                { id: "composition", label: "Part-to-Whole", icon: PieChart, best: "Donut / Treemap" },
                { id: "correlation", label: "Variable Correlation", icon: Layers, best: "Scatter Plot" }
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => setObjective(o.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    objective === o.id
                      ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                      : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  <o.icon className="h-4 w-4 mb-1" />
                  <p className="text-xs">{o.label}</p>
                  <p className="text-[10px] text-muted-foreground">{o.best}</p>
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Data Context / Variables</label>
              <textarea
                value={dataDescription}
                onChange={(e) => setDataDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Visual Preview & Code Export */}
        <div className="lg:col-span-7 space-y-4">
          {/* Interactive Mock SVG Chart Box */}
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">
                  Recommended Chart Form
                </span>
                <h3 className="text-sm font-bold text-foreground">Gradient Stacked Area Chart</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                Optimal Readability
              </span>
            </div>

            {/* Simulated Clean SVG Area Chart */}
            <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-4 pb-2 bg-secondary/30 rounded-xl border border-border/40">
              {[35, 50, 45, 68, 85, 75, 92, 110, 105, 125, 140, 160].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-purple-600/80 to-indigo-500 rounded-t-md transition-all duration-300 group-hover:opacity-80"
                    style={{ height: `${(h / 160) * 120}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground font-mono">M{i + 1}</span>
                </div>
              ))}
            </div>

            {/* Golden Rule Tip */}
            <div className="bg-secondary/40 p-3 rounded-xl border border-border/50 text-xs text-muted-foreground">
              <span className="font-bold text-foreground">Why this works:</span> Area gradients communicate growth velocity without cluttering gridlines, making month-over-month trajectory instantly obvious to leadership.
            </div>
          </div>

          {/* React Recharts Code Snippet */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" /> React Recharts Starter Code
              </span>
              <Button size="sm" variant="outline" onClick={copyCode} className="h-7 text-xs rounded-lg">
                {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy React Code"}
              </Button>
            </div>

            <pre className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-purple-400 overflow-x-auto border border-border/40 leading-relaxed custom-scrollbar max-h-60">
              <code>{rechartsSnippet}</code>
            </pre>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Chart Advisor Studio"
        roleLabel="Principal Data Visualization Lead"
        contextData={`Objective: ${objective}. Context: ${dataDescription}`}
        placeholder="Ask to customize color palette, adjust mobile breakpoints, or export to Chart.js..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
