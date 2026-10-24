import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko, Role } from "@/context/AimikoContext";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Sparkles,
  Flame,
  ArrowRight,
  Search,
  Pencil,
  Zap,
  Target,
  Clock,
  Compass,
  Code2,
  Layers,
  Brain,
  Palette,
  TrendingUp,
  BarChart3,
  Briefcase,
  GraduationCap,
  Camera,
  Radio,
  KanbanSquare,
  Mail,
  Bot,
  Video,
  LayoutGrid,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SimpleTool {
  id: string;
  slug: string;
  title: string;
  desc: string;
  icon: any;
  suggestedPrompt: string;
}

const roleTools: Record<Role, SimpleTool[]> = {
  student: [
    {
      id: "agent-playground",
      slug: "agent-playground",
      title: "AI Agent & Workflow Playground",
      desc: "Build your own autonomous AI agents with triggers, brains, and actions.",
      icon: Bot,
      suggestedPrompt: "How do I build a homework helper agent in the playground?"
    },
    {
      id: "snap-to-solve",
      slug: "snap-to-solve",
      title: "Homework Snap-to-Solve",
      desc: "Upload photos of math equations or diagrams for step-by-step Socratic hints.",
      icon: Camera,
      suggestedPrompt: "Solve this quadratic equation step-by-step."
    },
    {
      id: "spaced-repetition",
      slug: "spaced-repetition",
      title: "Spaced Repetition (Anki)",
      desc: "Master long-term retention with the scientific SuperMemo SM-2 memory curve.",
      icon: Brain,
      suggestedPrompt: "Generate a high-retention organic chemistry deck."
    },
    {
      id: "pdf-summarizer",
      slug: "pdf-summarizer",
      title: "PDF & 2-Host Podcast",
      desc: "Extract formulas, cheat sheets, and generate 2-host audio study podcasts.",
      icon: FileText,
      suggestedPrompt: "Summarize this chapter and generate an audio podcast."
    },
    {
      id: "learning-paths",
      slug: "learning-paths",
      title: "Learning Paths",
      desc: "Step-by-step curriculum roadmaps tailored to your study level.",
      icon: Compass,
      suggestedPrompt: "Map out a study roadmap for high school chemistry."
    },
    {
      id: "question-generator",
      slug: "question-generator",
      title: "Practice Quiz Studio",
      desc: "Test active recall with custom quizzes, scoring, and instant explanations.",
      icon: HelpCircle,
      suggestedPrompt: "Generate a 5-question practice quiz on basic algebra."
    }
  ],
  creator: [
    {
      id: "script-generator",
      slug: "script-generator",
      title: "Script & Hook Studio",
      desc: "Draft viral video scripts, test 3-second psychological hooks, and repurpose longform.",
      icon: Video,
      suggestedPrompt: "Draft a 60-second YouTube shorts script with high-retention hooks."
    },
    {
      id: "thumbnail-generator",
      slug: "thumbnail-generator",
      title: "Thumbnail Concepts",
      desc: "Design high-CTR thumbnail layouts, color directions, and visual compositions.",
      icon: Palette,
      suggestedPrompt: "Give me 3 thumbnail concepts for a tech vlog."
    }
  ],
  developer: [
    {
      id: "code-debugger",
      slug: "code-debugger",
      title: "Code Studio",
      desc: "Debug errors, explain algorithms with Big-O complexity, and generate unit tests.",
      icon: Code2,
      suggestedPrompt: "Help me debug this runtime error and explain time complexity."
    },
    {
      id: "api-blueprint",
      slug: "api-blueprint",
      title: "API Blueprints",
      desc: "Scaffold REST & GraphQL endpoints with type schemas and validation.",
      icon: Layers,
      suggestedPrompt: "Generate a FastAPI endpoint template for user auth."
    },
    {
      id: "readme-builder",
      slug: "readme-builder",
      title: "README Builder",
      desc: "Generate professional GitHub documentation, badges, and setup guides.",
      icon: FileText,
      suggestedPrompt: "Create a clean README for my project."
    }
  ],
  job_seeker: [
    {
      id: "resume-optimizer",
      slug: "resume-optimizer",
      title: "ATS Resume & Keyword Matcher",
      desc: "Audit job description match score and auto-rewrite with Google XYZ formula.",
      icon: FileText,
      suggestedPrompt: "Scan my resume against this job post for missing keywords."
    },
    {
      id: "cover-letter-builder",
      slug: "cover-letter-builder",
      title: "Outreach & Cover Letters",
      desc: "Craft tailored cover letters, cold recruiter InMails, and optimize profile SEO.",
      icon: BookOpen,
      suggestedPrompt: "Draft a cover letter and cold LinkedIn DM for a Frontend Engineer role."
    },
    {
      id: "interview-prep",
      slug: "interview-prep",
      title: "STAR Interview Prep",
      desc: "Practice behavioral STAR-method questions with real-time feedback.",
      icon: HelpCircle,
      suggestedPrompt: "Give me 3 behavioral questions for a senior engineering role."
    }
  ],
  founder: [
    {
      id: "agile-pm",
      slug: "agile-pm",
      title: "AI Jira & Sprint Board",
      desc: "Kanban board, automated user story breakdowns, story points, and AI standups.",
      icon: KanbanSquare,
      suggestedPrompt: "Decompose MVP auth and checkout into sprint tickets."
    },
    {
      id: "idea-validation",
      slug: "idea-validation",
      title: "Idea Validation",
      desc: "Evaluate startup concepts against market risks, competitors, and moats.",
      icon: Sparkles,
      suggestedPrompt: "Validate my startup idea with a SWOT and competitor analysis."
    },
    {
      id: "business-plan",
      slug: "business-plan",
      title: "Lean Business Plan",
      desc: "Structure revenue models, unit economics, and distribution channels.",
      icon: LayoutGrid,
      suggestedPrompt: "Outline a lean canvas for a subscription AI service."
    },
    {
      id: "pitch-deck",
      slug: "pitch-deck",
      title: "Pitch Deck Outliner",
      desc: "Structure 10-slide investor decks with a clear, compelling narrative.",
      icon: Briefcase,
      suggestedPrompt: "Outline a 10-slide pitch deck structure for seed investors."
    }
  ],
  teacher: [
    {
      id: "lesson-plan",
      slug: "lesson-plan",
      title: "Lesson Planner",
      desc: "Draft structured 45-minute lesson plans with objectives.",
      icon: GraduationCap,
      suggestedPrompt: "Draft a 45-minute lesson plan on gravity."
    },
    {
      id: "quiz-task-builder",
      slug: "quiz-task-builder",
      title: "Assignment Builder",
      desc: "Create worksheets, homework tasks, and grading rubrics.",
      icon: HelpCircle,
      suggestedPrompt: "Generate a 5-question vocabulary quiz."
    },
    {
      id: "classroom-helper",
      slug: "classroom-helper",
      title: "Classroom Q&A",
      desc: "Simple, age-appropriate explanations for curious students.",
      icon: Sparkles,
      suggestedPrompt: "How do I explain electricity to 8-year-olds?"
    },
    {
      id: "parent-reports",
      slug: "parent-reports",
      title: "Progress Reports",
      desc: "Draft constructive student remarks for report cards.",
      icon: FileText,
      suggestedPrompt: "Draft a positive progress note for a student."
    }
  ]
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { role, userName, setUserName, billingTier, promptsUsedToday, dailyPromptsLimit } = useAimiko();
  const [nameInput, setNameInput] = useState(userName || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeRole = role || "student";
  const tools = roleTools[activeRole] || roleTools.student;
  const remainingPrompts = Math.max(0, dailyPromptsLimit - promptsUsedToday);
  const usagePercent = Math.min(100, (promptsUsedToday / dailyPromptsLimit) * 100);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      setUserName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate("/chat", { state: { initialPrompt: searchQuery.trim() } });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      
      {/* ─── Clean Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <AimikoAvatar size="md" animate />
          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name..."
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="border border-border rounded-lg px-2.5 py-1 text-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    autoFocus
                  />
                  <Button onClick={handleSaveName} size="sm" className="h-7 text-xs rounded-lg">
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                    Welcome back, {userName || "Scholar"}
                  </h1>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit Name"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Your personal AI workspace is ready. Choose a tool or ask a question.
            </p>
          </div>
        </div>

        {/* Quick Streak & Role Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span>3-Day Streak</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-secondary text-foreground text-xs font-semibold border border-border/60 flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-muted-foreground" />
            <span className="capitalize">{role || "Student"} Workspace</span>
          </div>
        </div>
      </div>

      {/* ─── Clean Prompt Bar ─── */}
      <form onSubmit={handleSearchSubmit} className="relative flex items-center">
        <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ask AIMIKO anything or type a study topic..."
          className="w-full rounded-2xl bg-card border border-border/70 pl-11 pr-24 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-xs transition-all"
        />
        <Button
          type="submit"
          disabled={!searchQuery.trim()}
          size="sm"
          className="absolute right-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs"
        >
          Ask AI
        </Button>
      </form>

      {/* ─── Main Content Grid: Tools + Simple Status ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (2 cols): Clean 4 Tool Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Workspace Tools</h2>
            <span className="text-xs text-muted-foreground">Click any tool to start</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => navigate(`/tools/${tool.slug}`, { state: { suggestedPrompt: tool.suggestedPrompt } })}
                  className="group bg-card border border-border/70 hover:border-primary/40 rounded-2xl p-5 hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-105 transition-transform duration-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 col): Clean Sidebar Overview */}
        <div className="space-y-4">
          
          {/* AI Usage Card */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">AI Energy</h3>
              </div>
              <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                {billingTier}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Prompts Available</span>
                <span className="font-semibold text-foreground">{remainingPrompts} / {dailyPromptsLimit}</span>
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(5, usagePercent)}%` }}
                />
              </div>
            </div>

            {billingTier === "freemium" && (
              <Button
                onClick={() => navigate("/upgrade")}
                variant="outline"
                size="sm"
                className="w-full rounded-xl text-xs font-semibold"
              >
                Upgrade to Pro
              </Button>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 space-y-3 shadow-xs">
            <h3 className="font-semibold text-sm text-foreground">Quick Shortcuts</h3>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => navigate("/chat")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/70 transition-colors text-foreground font-medium text-left"
              >
                <span>AI Study Chat</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/planner")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/70 transition-colors text-foreground font-medium text-left"
              >
                <span>Study Planner & Tasks</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate("/notes")}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-secondary/70 transition-colors text-foreground font-medium text-left"
              >
                <span>Smart Notes</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
