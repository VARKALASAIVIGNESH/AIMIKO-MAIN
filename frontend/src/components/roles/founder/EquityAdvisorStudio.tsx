import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Target,
  Sparkles,
  PieChart,
  Copy,
  Check,
  ShieldCheck,
  Users,
  Sliders,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FounderProfile {
  name: string;
  role: string;
  timeCommitment: number; // 100 for full-time, 50 part-time
  cashContributed: number; // in thousands
  ipContribution: number; // 0 to 100
  domainExpertise: number; // 0 to 100
}

export function EquityAdvisorStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [optionPool, setOptionPool] = useState(10); // 10% standard option pool
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [founders, setFounders] = useState<FounderProfile[]>([
    {
      name: "Founder 1 (CEO / Product)",
      role: "Vision, GTM, Fundraising",
      timeCommitment: 100,
      cashContributed: 25,
      ipContribution: 90,
      domainExpertise: 85
    },
    {
      name: "Founder 2 (CTO / Tech)",
      role: "Full-Stack Architecture, AI Engine",
      timeCommitment: 100,
      cashContributed: 10,
      ipContribution: 70,
      domainExpertise: 95
    }
  ]);

  // Compute weighted scores
  // Formula: Time (40%) + Cash (20%) + IP/Idea (20%) + Domain Expertise (20%)
  const scores = founders.map((f) => {
    const cashScore = Math.min((f.cashContributed / 50) * 100, 100);
    return f.timeCommitment * 0.4 + cashScore * 0.2 + f.ipContribution * 0.2 + f.domainExpertise * 0.2;
  });

  const totalScore = scores.reduce((a, b) => a + b, 0);
  const availableEquity = 100 - optionPool;

  const equitySplits = founders.map((f, idx) => {
    const rawPct = totalScore > 0 ? (scores[idx] / totalScore) * availableEquity : 0;
    return Math.round(rawPct * 10) / 10;
  });

  const updateFounder = (idx: number, field: keyof FounderProfile, value: any) => {
    setFounders((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const copyCapTable = () => {
    const summary = `COFOUNDER CAP TABLE SPLIT:\n` +
      founders.map((f, idx) => `- ${f.name} (${f.role}): ${equitySplits[idx]}%`).join("\n") +
      `\n- Unallocated Employee Option Pool: ${optionPool}%\n\nStandard 4-year monthly vesting with a 1-year cliff and double-trigger acceleration upon change of control.`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    toast({ title: "Cap Table Summary Copied", description: "Pasted to your clipboard." });
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
            <span className="text-xs text-muted-foreground">• Dynamic Co-founder Cap Table & Vesting</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-emerald-500" /> Equity & Cap Table Advisor Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Model objective co-founder equity splits weighted by capital, full-time commitment, and intellectual property.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyCapTable} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Cap Table"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Cap Table Legal Advisor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Founder Parameter Sliders */}
        <div className="lg:col-span-7 space-y-4">
          {founders.map((f, idx) => (
            <div key={idx} className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{f.name}</h3>
                  <p className="text-[11px] text-muted-foreground">{f.role}</p>
                </div>
                <span className="text-base font-black text-emerald-500 font-mono">
                  {equitySplits[idx]}% Equity
                </span>
              </div>

              <div className="space-y-3">
                {/* Time Commitment */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Time Commitment</span>
                    <span className="font-semibold text-foreground font-mono">
                      {f.timeCommitment === 100 ? "Full-Time (100%)" : `${f.timeCommitment}% Part-Time`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="10"
                    value={f.timeCommitment}
                    onChange={(e) => updateFounder(idx, "timeCommitment", Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* Cash Contributed */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Initial Capital Invested ($K)</span>
                    <span className="font-semibold text-foreground font-mono">${f.cashContributed}K</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={f.cashContributed}
                    onChange={(e) => updateFounder(idx, "cashContributed", Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>

                {/* IP / Idea Origin */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Initial Idea / Early IP Weight</span>
                    <span className="font-semibold text-foreground font-mono">{f.ipContribution}/100</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={f.ipContribution}
                    onChange={(e) => updateFounder(idx, "ipContribution", Number(e.target.value))}
                    className="w-full accent-primary cursor-pointer"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Visual Cap Table & Standard Clauses */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-emerald-500" /> Fully-Diluted Cap Table
            </h3>

            {/* Visual Bar Split */}
            <div className="h-8 w-full rounded-xl overflow-hidden flex border border-border/60 shadow-xs">
              {founders.map((f, idx) => (
                <div
                  key={idx}
                  className={`h-full flex items-center justify-center text-[10px] font-bold text-white transition-all ${
                    idx === 0 ? "bg-emerald-600" : "bg-blue-600"
                  }`}
                  style={{ width: `${equitySplits[idx]}%` }}
                >
                  {equitySplits[idx]}%
                </div>
              ))}
              <div
                className="h-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white transition-all"
                style={{ width: `${optionPool}%` }}
              >
                {optionPool}%
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              {founders.map((f, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? "bg-emerald-600" : "bg-blue-600"}`} />
                    <span className="text-foreground font-medium">{f.name}</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">{equitySplits[idx]}%</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600" />
                  <span className="text-muted-foreground">Unallocated Employee Option Pool</span>
                </div>
                <span className="font-mono font-bold text-foreground">{optionPool}%</span>
              </div>
            </div>
          </div>

          {/* Standard Institutional Vesting Terms Card */}
          <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-primary" /> Non-Negotiable Vesting Protections
            </h4>
            <div className="space-y-1.5 text-[11px] text-muted-foreground leading-relaxed">
              <p>• <strong>4-Year Vesting with a 1-Year Cliff:</strong> No equity is earned if a cofounder leaves within the first 12 months. Remaining equity vests monthly thereafter.</p>
              <p>• <strong>Double-Trigger Acceleration:</strong> Protects founders if the company is acquired and they are terminated without cause by new ownership.</p>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Equity Advisor Studio"
        roleLabel="Startup Legal & Cap Table Counsel"
        contextData={`Founders: ${founders.map((f, i) => `${f.name}: ${equitySplits[i]}%`).join(", ")}. Option Pool: ${optionPool}%`}
        placeholder="Ask about 83(b) election forms, advisor shares, or SAFEs..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
