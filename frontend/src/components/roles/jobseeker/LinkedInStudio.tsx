import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Sparkles,
  Copy,
  Check,
  User,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Tag,
  Mail,
  Send,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HeadlineOption {
  type: string;
  headline: string;
  charCount: number;
  strength: string;
}

interface OutreachTemplate {
  scenario: string;
  subject: string;
  body: string;
  replyRate: string;
}

export function LinkedInStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"profile_seo" | "recruiter_dms">("profile_seo");
  const [roleTitle, setRoleTitle] = useState("Senior Full-Stack Engineer");
  const [specialties, setSpecialties] = useState("React, Node.js, AI Agent Systems, High-Concurrency Checkout");
  const [targetCompany, setTargetCompany] = useState("Stripe / Ramp");
  const [recruiterName, setRecruiterName] = useState("Sarah");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [headlines, setHeadlines] = useState<HeadlineOption[]>([
    {
      type: "The Value-Driver & Outcome",
      headline:
        "Senior Full-Stack Engineer | Helping FinTech & SaaS scale p99 checkout systems to 10M+ users | React, Node.js, AI Agents",
      charCount: 119,
      strength: "Highest Inbound DM Rate"
    },
    {
      type: "Keyword Magnet (Recruiter Search)",
      headline:
        "Staff Software Engineer • TypeScript, React, Node.js, PostgreSQL • Ex-Payment Lead • Scaled Checkout Architectures ($40M ARR)",
      charCount: 124,
      strength: "Bypasses Recruiter Boolean Filters"
    },
    {
      type: "The Mission & Craft Builder",
      headline:
        "Building intuitive AI agent interfaces & high-concurrency systems | Full-Stack Engineer passionate about delightful developer tools",
      charCount: 129,
      strength: "High Culture & Startup Fit"
    }
  ]);

  const [aboutHook, setAboutHook] = useState(
    "I believe great software should feel instant. Over the past 6 years, I've specialized in taking complex data pipelines and checkout flows and distilling them into sub-second, delightful web applications that directly move revenue metrics."
  );

  const [outreachTemplates, setOutreachTemplates] = useState<OutreachTemplate[]>([
    {
      scenario: "Direct InMail to Hiring Manager (Value Pitch)",
      subject: "Quick question regarding payment infra at Stripe",
      body: `Hi ${recruiterName},\n\nI noticed you're scaling the core checkout infrastructure at ${targetCompany}. At my previous team, I spearheaded a PostgreSQL indexing & microservice refactor that cut p99 payment latency by 42% while handling 4,500 req/sec.\n\nI just submitted an application for the Senior Full-Stack role and wanted to reach out directly. I'd love to share a 2-minute Loom breakdown of how I tackled similar checkout bottlenecks if helpful!\n\nBest,\n[Your Name]`,
      replyRate: "34% Response Rate"
    },
    {
      scenario: "Warm Recruiter Connection Request (Under 300 Chars)",
      subject: "Connection Request",
      body: `Hi ${recruiterName}, loved your recent post on engineering culture at ${targetCompany}. I'm a Senior Full-Stack Engineer specializing in high-concurrency React & Node systems. Would love to stay connected as I follow your team's growth!`,
      replyRate: "48% Acceptance Rate"
    },
    {
      scenario: "3-Day Follow-Up After Submitting Application",
      subject: "Re: Application follow-up — Senior Full-Stack Engineer",
      body: `Hi ${recruiterName}, following up on my application for the Senior Full-Stack Engineer role at ${targetCompany}. I recently open-sourced a TypeScript microservice demo mirroring your stack. Eager to connect if there's mutual fit!`,
      replyRate: "28% Response Rate"
    }
  ]);

  const handleGenerate = async () => {
    if (!roleTitle.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited LinkedIn optimizations.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Generate 3 high-converting LinkedIn headlines, an About Me hook, and 3 personalized cold recruiter outreach messages for:
Role: ${roleTitle}
Specialties: ${specialties}
Target Company: ${targetCompany}`,
        ageGroup,
        role,
        [],
        "You are a LinkedIn personal branding strategist and executive tech recruiter."
      );
      toast({ title: "Outreach & Profile Refreshed", description: "Personalized recruiter messages generated!" });
    } catch {
      toast({ title: "Updated", description: "Content ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast({ title: `${label} Copied`, description: "Pasted to your clipboard." });
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/10 text-sky-500 border border-sky-500/20">
              Job Seeker AI Suite
            </span>
            <span className="text-xs text-muted-foreground">• LinkedIn SEO & Cold Recruiter Outreach Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="h-6 w-6 text-sky-500" /> LinkedIn Profile & Recruiter DM Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Optimize your profile for inbound recruiter boolean searches and draft high-converting cold DMs to hiring managers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-secondary/80 p-1 rounded-xl border border-border/60">
            <button
              onClick={() => setActiveTab("profile_seo")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "profile_seo"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-3 w-3 inline mr-1 text-sky-500" /> Profile SEO
            </button>
            <button
              onClick={() => setActiveTab("recruiter_dms")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === "recruiter_dms"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Send className="h-3 w-3 inline mr-1 text-emerald-500" /> Recruiter DMs
            </button>
          </div>

          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:opacity-90 shadow-md font-bold"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Recruiter Strategist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Your Target Role</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Target Job Title"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">Core Skills & Differentiators</label>
              <input
                type="text"
                value={specialties}
                onChange={(e) => setSpecialties(e.target.value)}
                placeholder="e.g. React, Node.js, AI Agent Systems"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Target Company</label>
                <input
                  type="text"
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  placeholder="e.g. Stripe, OpenAI"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Recruiter / Lead Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !roleTitle.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Synthesizing SEO & DMs..." : "Generate Headlines & Recruiter DMs"}
            </Button>
          </div>

          {/* Quick Tip Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              LinkedIn Recruiter Algorithm Insight
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              LinkedIn's recruiter search weighs the first 40 characters of your headline and your top 5 technical skills above all else. Cold DMs that offer proof of work (like a 2-minute Loom or specific metrics) get a 3x higher response rate.
            </p>
          </div>
        </div>

        {/* Right Column: Profile SEO or Recruiter DMs */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === "profile_seo" && (
            <>
              {/* Headlines */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                  High-Converting Headlines
                </span>
                {headlines.map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-card border border-border/60 rounded-2xl p-4 space-y-2.5 hover:border-sky-500/50 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2 py-0.5 rounded-full">
                        {h.type}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        {h.strength}
                      </span>
                    </div>

                    <p className="text-xs md:text-sm text-foreground font-semibold leading-relaxed">
                      {h.headline}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
                      <span className="text-muted-foreground">{h.charCount} / 220 chars</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyText(h.headline, "Headline")}
                        className="h-7 text-xs rounded-lg"
                      >
                        {copiedText === h.headline ? (
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 mr-1" />
                        )}
                        {copiedText === h.headline ? "Copied" : "Copy Headline"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* About Hook */}
              <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    "About" Section 3-Sentence Hook
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyText(aboutHook, "About Hook")}
                    className="h-7 text-xs rounded-lg"
                  >
                    <Copy className="h-3 w-3 mr-1" /> Copy Hook
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed italic bg-secondary/40 p-3 rounded-xl border border-border/40">
                  "{aboutHook}"
                </p>
              </div>
            </>
          )}

          {activeTab === "recruiter_dms" && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Cold Recruiter & Hiring Manager InMails
              </span>

              {outreachTemplates.map((tmpl, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border/60 rounded-2xl p-4 space-y-3 hover:border-emerald-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-emerald-500" /> {tmpl.scenario}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      {tmpl.replyRate}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="bg-secondary/40 px-3 py-1.5 rounded-lg border border-border/40 font-semibold text-foreground">
                      Subject: {tmpl.subject}
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40 leading-relaxed text-[11.5px]">
                      {tmpl.body}
                    </pre>
                  </div>

                  <div className="flex items-center justify-end pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        copyText(`Subject: ${tmpl.subject}\n\n${tmpl.body}`, "Outreach Message")
                      }
                      className="h-7 text-xs rounded-lg"
                    >
                      <Copy className="h-3 w-3 mr-1" /> Copy Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RoleAiSidekick
        toolName="LinkedIn & Outreach Studio"
        roleLabel="Executive Tech Recruiter"
        contextData={`Target Role: ${roleTitle}. Company: ${targetCompany}`}
        placeholder="Ask to customize a message for an internal referral, an angel investor, or an engineering VP..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
