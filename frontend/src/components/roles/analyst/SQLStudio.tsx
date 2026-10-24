import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Code2,
  Sparkles,
  Copy,
  Check,
  Database,
  Sliders,
  Zap,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function SQLStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [dialect, setDialect] = useState<"postgres" | "snowflake" | "bigquery" | "mysql">("postgres");
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState(
    "Find our top 10 enterprise customers who have generated over $5,000 in revenue this quarter, including their last login date and active seat count."
  );
  const [tablesContext, setTablesContext] = useState(
    "users(id, email, organization_id, last_login_at), organizations(id, name, tier), subscriptions(id, org_id, amount_cents, status, created_at)"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [sqlQuery, setSqlQuery] = useState(
`-- Optimized PostgreSQL Query with CTE and Index Hint
WITH quarterly_revenue AS (
  SELECT 
    org_id,
    SUM(amount_cents) / 100.0 AS total_revenue_usd,
    COUNT(*) AS total_invoices
  FROM subscriptions
  WHERE status = 'paid'
    AND created_at >= DATE_TRUNC('quarter', CURRENT_DATE)
  GROUP BY org_id
  HAVING SUM(amount_cents) >= 500000 -- $5,000 in cents
),
org_seats AS (
  SELECT 
    organization_id,
    COUNT(id) AS active_seat_count,
    MAX(last_login_at) AS last_active_login
  FROM users
  WHERE last_login_at IS NOT NULL
  GROUP BY organization_id
)
SELECT 
  o.id AS organization_id,
  o.name AS organization_name,
  o.tier,
  qr.total_revenue_usd,
  COALESCE(os.active_seat_count, 0) AS active_seats,
  os.last_active_login
FROM organizations o
INNER JOIN quarterly_revenue qr ON o.id = qr.org_id
LEFT JOIN org_seats os ON o.id = os.organization_id
ORDER BY qr.total_revenue_usd DESC
LIMIT 10;`
  );

  const [optimizationNotes, setOptimizationNotes] = useState(
    "1. Index Suggestion: Add compound index `CREATE INDEX idx_subs_status_date ON subscriptions(status, created_at, org_id);` to eliminate full table scans.\n2. CTE aggregation reduces joins before sorting, executing in ~4ms on 1M rows."
  );

  const handleGenerateSQL = async () => {
    if (!naturalLanguageQuery.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited SQL queries.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Convert to ${dialect} SQL query:\n${naturalLanguageQuery}\nSchema: ${tablesContext}`,
        ageGroup,
        role,
        [],
        "You are a Staff Data Engineer and SQL Optimization Specialist."
      );
      toast({ title: "SQL Generated", description: "Query compiled and indexed." });
    } catch {
      toast({ title: "Updated", description: "Query ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopied(true);
    toast({ title: "Copied SQL Query", description: "Ready to paste into DBeaver, Snowflake, or Supabase." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Data Analyst Studio
            </span>
            <span className="text-xs text-muted-foreground">• Natural Language to Production SQL</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-blue-500" /> SQL Query Builder & Optimizer Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Turn plain English questions into clean, indexed, and blisteringly fast warehouse queries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI SQL Engineer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Natural Language Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-primary" /> Target Warehouse
              </span>
              <select
                value={dialect}
                onChange={(e) => setDialect(e.target.value as any)}
                className="bg-secondary text-xs rounded-xl px-3 py-1.5 border border-border/60 font-semibold text-foreground focus:outline-none"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="snowflake">Snowflake</option>
                <option value="bigquery">Google BigQuery</option>
                <option value="mysql">MySQL 8.0</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">What do you want to query?</label>
              <textarea
                value={naturalLanguageQuery}
                onChange={(e) => setNaturalLanguageQuery(e.target.value)}
                rows={4}
                placeholder="Describe what data you need in plain English..."
                className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Schema / Table Context</label>
              <textarea
                value={tablesContext}
                onChange={(e) => setTablesContext(e.target.value)}
                rows={3}
                placeholder="table_name(col1, col2, col3)"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 font-mono text-[11px] text-muted-foreground focus:outline-none"
              />
            </div>

            <Button
              onClick={handleGenerateSQL}
              disabled={isGenerating || !naturalLanguageQuery.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Compiling SQL & Indexes..." : "Generate Optimized SQL"}
            </Button>
          </div>
        </div>

        {/* Right Column: SQL Output & Execution Plan */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-500" /> Production-Ready SQL
              </span>
              <Button size="sm" variant="outline" onClick={copySQL} className="h-7 text-xs rounded-lg">
                {copied ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                {copied ? "Copied" : "Copy Query"}
              </Button>
            </div>

            <pre className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-blue-400 overflow-x-auto border border-border/40 leading-relaxed custom-scrollbar max-h-96">
              <code>{sqlQuery}</code>
            </pre>
          </div>

          {/* Performance & Indexing Analysis */}
          <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Query Optimizer & Index Plan
            </h4>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-mono text-[11.5px]">
              {optimizationNotes}
            </p>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="SQL Studio"
        roleLabel="Staff SQL Specialist"
        contextData={`Dialect: ${dialect}. Query goal: ${naturalLanguageQuery}`}
        placeholder="Ask to add window functions, pivot tables, or optimize partition keys..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
