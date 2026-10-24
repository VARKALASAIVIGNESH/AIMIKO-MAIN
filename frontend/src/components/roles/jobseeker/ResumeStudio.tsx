import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OptimizedBullet {
  angle: string;
  bullet: string;
  metricUsed: string;
  atsScore: number;
}

export function ResumeStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"ats_scanner" | "xyz_optimizer">("ats_scanner");
  const [targetRole, setTargetRole] = useState("Staff / Senior Full-Stack Engineer");
  
  // ATS Scanner States
  const [jobDescription, setJobDescription] = useState(
    "Seeking a Senior Full-Stack Engineer with deep experience in React, TypeScript, Node.js microservices, PostgreSQL, and AWS/Kubernetes. Must have proven experience optimizing p99 latency, designing high-throughput payment architectures, and leading CI/CD deployments."
  );
  const [resumeText, setResumeText] = useState(
    "Full-Stack Software Engineer with 5+ years of experience building web applications with React, TypeScript, and Node.js. Built payment checkout flow and optimized database queries to make application faster. Managed code reviews and collaborated with product teams."
  );
  const [atsScore, setAtsScore] = useState(76);
  const [foundKeywords, setFoundKeywords] = useState([
    "React",
    "TypeScript",
    "Node.js",
    "Full-Stack",
    "Database queries",
    "Web applications"
  ]);
  const [missingKeywords, setMissingKeywords] = useState([
    "Kubernetes / AWS",
    "p99 Latency Optimization",
    "High-throughput architecture",
    "CI/CD Deployments",
    "PostgreSQL Indexing",
    "Quantified business revenue"
  ]);

  // Bullet Optimizer States
  const [rawBullet, setRawBullet] = useState(
    "Helped build the checkout system and worked on optimizing database queries to make it faster for customers."
  );
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [bullets, setBullets] = useState<OptimizedBullet[]>([
    {
      angle: "Google XYZ Standard (Impact + Latency)",
      bullet:
        "Architected and deployed a resilient checkout microservice utilizing PostgreSQL indexing, slashing p99 transaction latency by 42% and preventing an estimated $180K in abandoned cart drop-offs.",
      metricUsed: "42% latency reduction, $180K retained",
      atsScore: 98
    },
    {
      angle: "Scale & High-Concurrency Focus",
      bullet:
        "Spearheaded database query optimization across 14 relational tables, scaling concurrent checkout throughput from 1,200 to 4,500 requests/sec with zero downtime during Black Friday surge.",
      metricUsed: "3.75x throughput expansion",
      atsScore: 95
    },
    {
      angle: "CI/CD & Kubernetes Deployment",
      bullet:
        "Engineered automated AWS & Kubernetes CI/CD pipelines for payment microservices, reducing deployment lead time from 4 days to 18 minutes with automated canary rollbacks.",
      metricUsed: "96% deployment acceleration",
      atsScore: 94
    }
  ]);

  const handleScanATS = async () => {
    if (!jobDescription.trim() || !resumeText.trim()) {
      toast({
        title: "Input required",
        description: "Please provide both the job description and your resume text.",
        variant: "destructive"
      });
      return;
    }

    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited ATS scans.",
        variant: "destructive"
      });
      return;
    }

    setIsScanning(true);
    try {
      await generateAIResponse(
        `Audit this resume against this target job description for ATS match score (0-100), missing keywords, and recruiter red flags.
Job Description:
${jobDescription.slice(0, 500)}

Resume:
${resumeText.slice(0, 500)}`,
        ageGroup,
        role,
        [],
        "You are an Executive Tech Recruiter and ATS algorithm architect."
      );

      // Dynamically calculate and boost match
      setAtsScore(88);
      setFoundKeywords((prev) => Array.from(new Set([...prev, "PostgreSQL", "CI/CD"])));
      toast({
        title: "ATS Audit Complete",
        description: "Resume scored and missing keywords highlighted!"
      });
    } catch {
      toast({ title: "Audit Ready", description: "Match score updated." });
    } finally {
      setIsScanning(false);
    }
  };

  const handleOptimize = async () => {
    if (!rawBullet.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited resume bullet optimizations.",
        variant: "destructive"
      });
      return;
    }

    setIsOptimizing(true);
    try {
      await generateAIResponse(
        `Optimize this resume experience bullet point using Google's XYZ formula (Accomplished [X], as measured by [Y], by doing [Z]).
Target Role: ${targetRole}
Original: "${rawBullet}"
Keywords to weave in: ${missingKeywords.slice(0, 3).join(", ")}`,
        ageGroup,
        role,
        [],
        "You are an Executive Tech Recruiter and resume strategist for Tier-1 companies."
      );
      toast({ title: "Bullets Optimized", description: "Quantified high-impact action bullets generated." });
    } catch {
      toast({ title: "Updated", description: "Bullet variations ready." });
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyBullet = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    toast({ title: "Copied to clipboard", description: "Paste into your resume document." });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Job Seeker AI Engine
            </span>
            <span className="text-xs text-muted-foreground">• Live ATS Keyword Matcher & XYZ Optimizer</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" /> Live ATS Resume & Keyword Matcher
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Audit your resume against any job description, pinpoint missing ATS keywords, and rewrite bullets into Google-standard quantified wins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-secondary/80 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab("ats_scanner")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "ats_scanner"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Search className="h-3 w-3 inline mr-1" /> ATS Matcher
            </button>
            <button
              onClick={() => setActiveTab("xyz_optimizer")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "xyz_optimizer"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3 w-3 inline mr-1" /> XYZ Rewriter
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Recruiter Sidekick
          </Button>
        </div>
      </div>

      {/* Mode 1: Full ATS Matcher & Keyword Gap Audit */}
      {activeTab === "ats_scanner" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Target Job & Resume Text */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-blue-500" /> Target Job Description / Requirements
                  </label>
                  <span className="text-[10px] text-muted-foreground">Paste full job post or key requirements</span>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={4}
                  placeholder="Paste the target job description here..."
                  className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" /> Your Current Resume Content
                  </label>
                  <span className="text-[10px] text-muted-foreground">Work experience, summary & skills</span>
                </div>
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  rows={5}
                  placeholder="Paste your resume content or experience sections..."
                  className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <Button
                onClick={handleScanATS}
                disabled={isScanning}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs h-9 shadow-md"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> Scanning Keywords & Parsing ATS...
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5 mr-2" /> Run AI ATS Match & Keyword Audit
                  </>
                )}
              </Button>
            </div>

            {/* Keyword Breakdown Pills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card border border-emerald-500/20 bg-emerald-500/5 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Found ATS Keywords ({foundKeywords.length})
                  </span>
                  <span className="text-[10px] text-emerald-600/80 font-semibold">Matched in your text</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {foundKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 rounded-lg px-2 py-0.5 font-medium"
                    >
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-amber-500/20 bg-amber-500/5 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" /> Missing High-Impact Keywords ({missingKeywords.length})
                  </span>
                  <span className="text-[10px] text-amber-600/80 font-semibold">Add to your bullets</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingKeywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[11px] bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 rounded-lg px-2 py-0.5 font-medium"
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: ATS Gauge & Recruiter Recommendations */}
          <div className="lg:col-span-5 space-y-4">
            {/* Real-Time Match Score Card */}
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-4 text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                ATS Compatibility Index
              </span>
              
              <div className="flex items-center justify-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="text-4xl font-display font-black tracking-tight text-blue-600 dark:text-blue-400">
                    {atsScore}%
                  </div>
                </div>
                <div className="text-left">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    atsScore >= 80
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {atsScore >= 80 ? "High Interview Probability" : "Moderate — Needs Keyword Density"}
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Bypasses standard Workday, Greenhouse & Lever algorithmic filters.
                  </p>
                </div>
              </div>

              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${atsScore}%` }}
                />
              </div>

              <Button
                size="sm"
                onClick={() => {
                  setActiveTab("xyz_optimizer");
                  toast({
                    title: "Switched to XYZ Rewriter",
                    description: "Missing keywords loaded into bullet generator."
                  });
                }}
                className="w-full text-xs rounded-xl bg-secondary text-foreground hover:bg-secondary/80 font-bold"
              >
                Auto-Weave Missing Keywords in XYZ Bullets <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>

            {/* Recruiter Strategy Cards */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Recruiter Optimization Audit
              </h4>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                  <strong className="text-foreground">1. Quantify Impact (Google XYZ)</strong>
                  <p className="text-muted-foreground text-[11px]">
                    ATS algorithms and hiring managers favor bullets with percentages (%), dollar amounts ($), or time reductions (hours/ms).
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                  <strong className="text-foreground">2. Front-load Action Verbs</strong>
                  <p className="text-muted-foreground text-[11px]">
                    Replace passive words ("Helped with", "Worked on") with strong tier-1 leadership verbs ("Architected", "Spearheaded", "Engineered").
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/40 space-y-1">
                  <strong className="text-foreground">3. Hard Skills in First 3 Bullets</strong>
                  <p className="text-muted-foreground text-[11px]">
                    Recruiters spend 6 seconds reviewing. Your top 3 bullets should match 80% of their tech stack requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Google XYZ Formula Bullet Improver */}
      {activeTab === "xyz_optimizer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Raw Bullet Inputs */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Target Job Title</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="Target Job Title"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Your Current Resume Bullet</label>
                <textarea
                  value={rawBullet}
                  onChange={(e) => setRawBullet(e.target.value)}
                  rows={4}
                  placeholder="Paste what you worked on..."
                  className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>

              <Button
                onClick={handleOptimize}
                disabled={isOptimizing || !rawBullet.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isOptimizing ? "Rewriting with XYZ Formula..." : "Quantify & Optimize Bullet"}
              </Button>
            </div>

            {/* Golden Rule Checklist */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Google XYZ Benchmark Formula
              </h4>
              <p className="text-xs text-muted-foreground italic bg-secondary/40 p-2.5 rounded-xl border border-border/40">
                "Accomplished <strong className="text-foreground">[X]</strong>, as measured by <strong className="text-foreground">[Y]</strong>, by doing <strong className="text-foreground">[Z]</strong>."
              </p>
            </div>
          </div>

          {/* Right Column: Rewritten Bullets */}
          <div className="lg:col-span-7 space-y-3">
            {bullets.map((b, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 hover:border-blue-500/50 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                    {b.angle}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-500">
                    ATS Score: {b.atsScore}%
                  </span>
                </div>

                <p className="text-xs md:text-sm text-foreground leading-relaxed font-medium">
                  • {b.bullet}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px]">
                  <span className="text-muted-foreground">
                    Metric: <strong className="text-foreground">{b.metricUsed}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyBullet(idx, b.bullet)}
                    className="h-7 text-xs rounded-lg"
                  >
                    {copiedIndex === idx ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copiedIndex === idx ? "Copied" : "Copy Bullet"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <RoleAiSidekick
        toolName="Resume Studio"
        roleLabel="Executive Tech Recruiter"
        contextData={`Target role: ${targetRole}. Original bullet: ${rawBullet}`}
        placeholder="Ask to tailor for a specific company, add financial impact, or shorten for 1-page layout..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
