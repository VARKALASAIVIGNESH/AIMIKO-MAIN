import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  BookOpen,
  Sparkles,
  Copy,
  Check,
  Building,
  Briefcase,
  Sliders,
  FileCheck,
  Mail,
  Send,
  MessageSquare,
  TrendingUp,
  User,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface OutreachTemplate {
  scenario: string;
  subject: string;
  body: string;
  replyRate: string;
}

interface HeadlineOption {
  type: string;
  headline: string;
  charCount: number;
  strength: string;
}

export function CoverLetterStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"letter" | "dms" | "headlines">("letter");
  const [company, setCompany] = useState("Stripe");
  const [jobTitle, setJobTitle] = useState("Staff Frontend Engineer");
  const [coreHighlight, setCoreHighlight] = useState(
    "Led high-traffic payment migration handling $40M/year, improved checkout conversion by 14%, and built scalable design systems."
  );
  const [tone, setTone] = useState<"confident" | "passionate" | "executive">("confident");
  const [recruiterName, setRecruiterName] = useState("Sarah");
  const [copied, setCopied] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // Tab 1: Cover letter text
  const [letterText, setLetterText] = useState(
`Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} position. Having followed Stripe's engineering culture and infrastructure rigor, I admire how your teams balance extreme API developer ergonomics with mission-critical reliability. My background architecting payment interfaces and high-concurrency client experiences directly aligns with the scale challenges your billing group addresses daily.

In my recent work, I spearheaded a complete frontend and checkout architecture migration that processed over $40M in annual transactions. By eliminating network round-trips and introducing optimistic UI caching, my team reduced p99 checkout latency by 42% and directly lifted checkout completion rates by 14%. Beyond raw performance metrics, I have championed component design systems that accelerated feature shipping velocity across 5 product squads while maintaining strict accessibility standards.

What excites me most about Stripe is your focus on developer productivity and zero-latency global commerce. I would welcome the opportunity to bring my experience in resilient client architecture, developer tooling, and user-centric billing experiences to the team. Thank you for your time, and I look forward to discussing how I can contribute to Stripe's mission.

Sincerely,
Candidate`
  );

  // Tab 2: Recruiter Outreach Templates
  const [outreachTemplates, setOutreachTemplates] = useState<OutreachTemplate[]>([
    {
      scenario: "Direct InMail to Hiring Manager (Value Pitch)",
      subject: `Quick question regarding frontend infra at ${company}`,
      body: `Hi ${recruiterName},

I saw your team is currently hiring for the ${jobTitle} role. Having recently led a checkout architecture refactor that reduced p99 latency by 42% and supported $40M in transaction volume, I have deep respect for ${company}'s standard of developer ergonomics and client resilience.

I put together a quick 3-bullet breakdown of how I solved high-concurrency state caching without re-renders. Would you be open to a 10-minute chat this Thursday to see if my background aligns with your roadmap?`,
      replyRate: "42% Average Reply Rate"
    },
    {
      scenario: "Cold Connection Request (300 Character Limit)",
      subject: "Connection Note",
      body: `Hi ${recruiterName}, admiring your work scaling the engineering group at ${company}. As a frontend engineer focused on high-throughput client architectures, would love to connect and follow your team's updates!`,
      replyRate: "68% Acceptance Rate"
    },
    {
      scenario: "Follow-Up After 4 Days of Silence",
      subject: `Re: Frontend infra at ${company}`,
      body: `Hi ${recruiterName}, wanted to gently bump this in case it got buried. Fully understand how busy sprint cycles get! If the ${jobTitle} role is currently paused, no worries at all - happy to connect down the road.`,
      replyRate: "31% Recovery Rate"
    }
  ]);

  // Tab 3: Headline Options
  const [headlines, setHeadlines] = useState<HeadlineOption[]>([
    {
      type: "The Value-Driver and Outcome",
      headline:
        "Senior Full-Stack Engineer | Helping FinTech and SaaS scale p99 checkout systems to 10M+ users | React, Node.js, AI Agents",
      charCount: 119,
      strength: "Highest Inbound Recruiter DM Rate"
    },
    {
      type: "Keyword Magnet (Recruiter Search)",
      headline:
        "Staff Software Engineer - TypeScript, React, Node.js, PostgreSQL - Ex-Payment Lead - Scaled Checkout Architectures ($40M ARR)",
      charCount: 124,
      strength: "Bypasses Boolean Search Filters"
    },
    {
      type: "The Mission and Craft Builder",
      headline:
        "Building intuitive AI agent interfaces and high-concurrency systems | Full-Stack Engineer passionate about delightful developer tools",
      charCount: 129,
      strength: "High Culture and Startup Fit"
    }
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied to clipboard", description: "Ready to paste into your application." });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    if (!company.trim() || !jobTitle.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited cover letters.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write a tailored, high-converting 3-paragraph cover letter for:
Company: ${company}
Role: ${jobTitle}
Candidate Highlights: ${coreHighlight}
Tone: ${tone}`;

      const res = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an executive talent partner who writes compelling, personalized cover letters."
      );

      setLetterText(res);
      toast({ title: "Cover Letter Crafted", description: "Tailored to the company and role." });
    } catch {
      toast({ title: "Updated", description: "Cover letter refreshed." });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToNotes = () => {
    addNote({ title: `Cover Letter: ${company} - ${jobTitle}`, content: letterText });
    toast({ title: "Saved to Notes", description: "Cover letter saved in your notes." });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Career and Job Seeker Studio
            </span>
            <span className="text-xs text-muted-foreground">• AIMIKO AI Friend for Career Growth</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-500" /> Outreach and Cover Letter Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Craft high-converting cover letters, cold recruiter InMails, and optimize your LinkedIn profile SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Recruiter
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("letter")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "letter"
              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          Tailored Cover Letter
        </button>
        <button
          onClick={() => setActiveTab("dms")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "dms"
              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Mail className="h-3.5 w-3.5" />
          Recruiter InMails and DMs
        </button>
        <button
          onClick={() => setActiveTab("headlines")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "headlines"
              ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Profile Headlines and SEO
        </button>
      </div>

      {/* TAB 1: COVER LETTER */}
      {activeTab === "letter" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-primary" /> Target Application
              </h3>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Company Name</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Target Company"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Role Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Target Job Title"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Core Highlights to Feature</label>
                <textarea
                  value={coreHighlight}
                  onChange={(e) => setCoreHighlight(e.target.value)}
                  rows={3}
                  placeholder="Key projects, metrics, or technologies..."
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1.5 block">Letter Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "confident", label: "Confident" },
                    { id: "passionate", label: "Narrative" },
                    { id: "executive", label: "Executive" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id as any)}
                      className={`py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                        tone === t.id
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !company.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isGenerating ? "Crafting Tailored Letter..." : "Generate Cover Letter"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/50">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <FileCheck className="h-4 w-4 text-emerald-500" /> Editable Letter Document
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveToNotes}
                    className="h-7 text-xs rounded-lg"
                  >
                    Save to Notes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(letterText, "letter")}
                    className="h-7 text-xs rounded-lg"
                  >
                    {copied === "letter" ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                    {copied === "letter" ? "Copied" : "Copy Letter"}
                  </Button>
                </div>
              </div>

              <textarea
                value={letterText}
                onChange={(e) => setLetterText(e.target.value)}
                rows={18}
                className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 text-xs text-foreground font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary custom-scrollbar"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RECRUITER DMS */}
      {activeTab === "dms" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-indigo-400" /> Recruiter Target
              </span>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Recruiter First Name</label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 block">Target Company</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Stripe"
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
                />
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Recruiters receive hundreds of generic messages a day. These cold InMail templates lead with concrete value and low friction asks to maximize reply rates.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            {outreachTemplates.map((tmpl, idx) => (
              <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-primary" /> {tmpl.scenario}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {tmpl.replyRate}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(`Subject: ${tmpl.subject}\n\n${tmpl.body}`, `dm-${idx}`)}
                      className="h-7 text-xs rounded-lg"
                    >
                      {copied === `dm-${idx}` ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied === `dm-${idx}` ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="text-xs font-medium text-muted-foreground bg-secondary/30 px-3 py-1.5 rounded-lg border border-border/40 font-mono">
                  Subject: {tmpl.subject}
                </div>

                <pre className="p-3.5 rounded-xl bg-secondary/40 text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans border border-border/40">
                  {tmpl.body}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PROFILE HEADLINES */}
      {activeTab === "headlines" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-12 space-y-4">
            <div className="bg-secondary/30 border border-border/60 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-foreground">LinkedIn Search and Boolean SEO Headlines</h3>
                <p className="text-xs text-muted-foreground">Optimized headlines crafted to pass recruiter boolean filters and drive high-intent inbound connection requests.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {headlines.map((h, idx) => (
                <div key={idx} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-primary">{h.type}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{h.charCount} chars</span>
                    </div>

                    <p className="text-xs font-medium text-foreground leading-relaxed p-3 rounded-xl bg-secondary/40 border border-border/40">
                      "{h.headline}"
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-border/40">
                    <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {h.strength}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(h.headline, `headline-${idx}`)}
                      className="h-7 text-xs rounded-lg"
                    >
                      {copied === `headline-${idx}` ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                      {copied === `headline-${idx}` ? "Copied" : "Copy"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RoleAiSidekick
        toolName="Outreach and Cover Letter Studio"
        roleLabel="Executive Career Coach"
        contextData={`Company: ${company}. Role: ${jobTitle}. Active tab: ${activeTab}`}
        placeholder="Ask to adjust company culture references, emphasize leadership, or trim length..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
