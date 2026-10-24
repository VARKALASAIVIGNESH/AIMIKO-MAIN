import { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAimiko, Role } from "@/context/AimikoContext";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { AimikoGuideChatbot } from "@/components/AimikoGuideChatbot";
import AimikoProfileModal from "@/components/AimikoProfileModal";
import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  BookOpen,
  Palette,
  Sparkles,
  Award,
  MessageCircle,
  Zap,
  Sun,
  Moon,
  CreditCard,
  Brush,
  Lightbulb,
  Code2,
  BarChart3,
  Briefcase,
  Rocket,
  GraduationCap,
  ArrowLeft,
  User,
  Camera,
  Radio,
  Brain,
  Video,
  TrendingUp,
  Search,
  Bug,
  Layers,
  FileCode,
  Target,
  HelpCircle,
  LayoutGrid,
  ChevronDown,
  KanbanSquare,
  Flame,
  Mail,
  Bot,
  LogOut,
} from "lucide-react";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const roleLabels: Record<Role, string> = {
  student: "Student",
  creator: "Content Creator",
  developer: "Developer",
  job_seeker: "Job Seeker",
  founder: "Startup Founder",
  teacher: "Educator",
};

const ROLE_ALLOWED_TOOLS: Record<Role, string[]> = {
  student: [
    "agent-playground",
    "ai-playground",
    "playground",
    "snap-to-solve",
    "homework-solver",
    "spaced-repetition",
    "flashcards",
    "learning-paths",
    "pdf-summarizer",
    "question-generator",
    "practice-quizzes",
    "explain-like-im-10",
    "school-buddy",
    "story-teller",
    "adventure-book",
    "doodle-canvas",
  ],
  creator: [
    "script-generator",
    "thumbnail-generator",
    "trend-analyzer",
    "title-seo-builder",
  ],
  developer: [
    "code-debugger",
    "api-blueprint",
    "readme-builder",
    "code-explanation",
  ],
  job_seeker: [
    "resume-optimizer",
    "cover-letter-builder",
    "interview-prep",
    "linkedin-headline",
  ],
  founder: [
    "agile-pm",
    "sprint-board",
    "project-management",
    "idea-validation",
    "business-plan",
    "pitch-deck",
    "team-equity",
  ],
  teacher: [
    "lesson-plan",
    "quiz-task-builder",
    "classroom-helper",
    "parent-reports",
  ],
};

const KIDS_ALLOWED_TOOLS = [
  "story-teller",
  "adventure-book",
  "doodle-canvas",
  "school-buddy",
  "explain-like-im-10",
];

const getRoleForTool = (toolSlug: string): Role | null => {
  for (const [r, tools] of Object.entries(ROLE_ALLOWED_TOOLS)) {
    if (tools.includes(toolSlug)) return r as Role;
  }
  return null;
};

const pageTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/chat": "AI Study Chat",
  "/planner": "Planner",
  "/notes": "Notes Library",
  "/playground": "AI Agent & Workflow Playground",
  "/mikodin": "MIKODIN Trait-Locked Network",
  "/feed": "MIKODIN Trait-Locked Network",
  "/profile": "Profile & Settings",
  "/achievements": "Achievements & Streaks",
  "/upgrade": "Upgrade Plan",

  // Student Tools
  "/tools/agent-playground": "AI Agent & Workflow Playground",
  "/tools/snap-to-solve": "Homework Snap-to-Solve",
  "/tools/voice-tutor": "Live Voice Tutor Room",
  "/tools/spaced-repetition": "Adaptive Spaced Repetition",
  "/tools/learning-paths": "Age-Based Learning Paths",
  "/tools/pdf-summarizer": "PDF & Podcast Summarizer",
  "/tools/question-generator": "Practice Quiz Generator",
  "/tools/explain-like-im-10": "Explain Like I'm 10",
  "/tools/school-buddy": "School Buddy",
  "/tools/story-teller": "Story Teller",
  "/tools/adventure-book": "Adventure Book",
  "/tools/doodle-canvas": "Doodle Canvas",

  // Creator Tools
  "/tools/script-generator": "Viral Script Studio",
  "/tools/thumbnail-generator": "High-CTR Thumbnail Studio",
  "/tools/trend-analyzer": "Viral Trend Analyzer",
  "/tools/title-seo-builder": "3-Second Hook Arena & Repurposer",

  // Developer Tools
  "/tools/code-debugger": "Code Debugger & Patch Studio",
  "/tools/api-blueprint": "API Blueprint Studio",
  "/tools/code-explanation": "Code Explainer & Big-O Studio",
  "/tools/readme-builder": "GitHub README Studio",

  // Job Seeker Tools
  "/tools/resume-optimizer": "Live ATS Resume & Keyword Matcher",
  "/tools/cover-letter-builder": "Cover Letter Studio",
  "/tools/interview-prep": "STAR Interview Practice Studio",
  "/tools/linkedin-headline": "LinkedIn Profile & Recruiter DMs",

  // Founder Tools
  "/tools/agile-pm": "AI Jira & Sprint Studio",
  "/tools/idea-validation": "Startup Idea Validator",
  "/tools/business-plan": "Lean Canvas Studio",
  "/tools/pitch-deck": "Pitch Deck Outliner Studio",
  "/tools/team-equity": "Equity & Cap Table Advisor",

  // Teacher Tools
  "/tools/lesson-plan": "Lesson Plan Studio",
  "/tools/quiz-task-builder": "Assignment & Rubric Studio",
  "/tools/classroom-helper": "Classroom Q&A & Concept Explainer",
  "/tools/parent-reports": "Progress Report & Parent Comms",
};

const getRoleNavItems = (role: Role, ageGroup: string | null) => {
  if (ageGroup === "kids") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Story Teller", url: "/tools/story-teller", icon: Palette },
      { title: "Adventure Book", url: "/tools/adventure-book", icon: Sparkles },
      { title: "Doodle Canvas", url: "/tools/doodle-canvas", icon: Brush },
      { title: "School Buddy", url: "/tools/school-buddy", icon: BookOpen },
    ];
  }

  if (role === "creator") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Script & Hook Studio", url: "/tools/script-generator", icon: Video },
      { title: "Thumbnail Concepts", url: "/tools/thumbnail-generator", icon: Palette },
      { title: "Creator AI Chat", url: "/chat", icon: MessageCircle },
      { title: "Notes & Ideas", url: "/notes", icon: FileText },
    ];
  }

  if (role === "developer") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Code Studio", url: "/tools/code-debugger", icon: Code2 },
      { title: "API Blueprint", url: "/tools/api-blueprint", icon: Layers },
      { title: "README Studio", url: "/tools/readme-builder", icon: FileText },
      { title: "AI Code Chat", url: "/chat", icon: MessageCircle },
      { title: "Code Snippets", url: "/notes", icon: FileCode },
    ];
  }

  if (role === "job_seeker") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "ATS Resume Matcher", url: "/tools/resume-optimizer", icon: FileText },
      { title: "STAR Interview Prep", url: "/tools/interview-prep", icon: HelpCircle },
      { title: "Outreach & Cover Letters", url: "/tools/cover-letter-builder", icon: BookOpen },
      { title: "AI Career Chat", url: "/chat", icon: MessageCircle },
      { title: "Career Notes", url: "/notes", icon: FileText },
    ];
  }

  if (role === "founder") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "AI Jira & Sprints", url: "/tools/agile-pm", icon: KanbanSquare },
      { title: "Idea Validation", url: "/tools/idea-validation", icon: Sparkles },
      { title: "Lean Canvas", url: "/tools/business-plan", icon: LayoutGrid },
      { title: "Pitch Deck Outliner", url: "/tools/pitch-deck", icon: Briefcase },
      { title: "AI Founder Chat", url: "/chat", icon: MessageCircle },
      { title: "Venture Notes", url: "/notes", icon: FileText },
    ];
  }

  if (role === "teacher") {
    return [
      { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
      { title: "Lesson Planner", url: "/tools/lesson-plan", icon: GraduationCap },
      { title: "Assignment Studio", url: "/tools/quiz-task-builder", icon: HelpCircle },
      { title: "Classroom Q&A", url: "/tools/classroom-helper", icon: Lightbulb },
      { title: "Progress Reports", url: "/tools/parent-reports", icon: FileText },
      { title: "AI Teaching Chat", url: "/chat", icon: MessageCircle },
      { title: "Teaching Notes", url: "/notes", icon: FileText },
    ];
  }

  // Student (Default - Essential Core Tools Only)
  return [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "AI Playground", url: "/playground", icon: Bot },
    { title: "Snap-to-Solve", url: "/tools/snap-to-solve", icon: Camera },
    { title: "Spaced Repetition", url: "/tools/spaced-repetition", icon: Brain },
    { title: "PDF & Podcast", url: "/tools/pdf-summarizer", icon: FileText },
    { title: "Practice Quiz", url: "/tools/question-generator", icon: Lightbulb },
    { title: "AI Study Chat", url: "/chat", icon: MessageCircle },
    { title: "Smart Notes", url: "/notes", icon: FileText },
  ];
};

function AppSidebar({
  onOpenProfile,
  onLogOut,
}: {
  onOpenProfile?: () => void;
  onLogOut?: () => void;
}) {
  const { role, billingTier, ageGroup } = useAimiko();
  const activeRole = role || "student";
  const items = getRoleNavItems(activeRole, ageGroup);

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar text-sidebar-foreground">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo & Workspace Role Switcher */}
        <div className="p-3.5 flex items-center gap-2.5 border-b border-sidebar-border shrink-0">
          <AimikoAvatar size="sm" animate />
          <div className="group-data-[collapsible=icon]:hidden flex flex-col overflow-hidden flex-1 min-w-0">
            <span className="font-black text-xs tracking-widest gradient-text uppercase leading-none">
              AIMIKO
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/60">
                {roleLabels[activeRole] || activeRole}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                AI friend for everyone
              </span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <SidebarGroup className="flex-1 py-3">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sidebar-foreground/75 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150 font-semibold text-xs"
                      activeClassName="bg-primary/12 text-primary font-bold shadow-xs"
                    >
                      <item.icon className="h-4 w-4 shrink-0 text-primary/80" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Tier badge & Quick Logout at bottom */}
        <div className="p-3 border-t border-sidebar-border shrink-0 group-data-[collapsible=icon]:hidden space-y-2">
          <div className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold ${
            billingTier === "premium"
              ? "bg-primary/12 text-primary"
              : "bg-muted/60 text-muted-foreground"
          }`}>
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span>{billingTier === "premium" ? "Premium Plan" : "Free Plan"}</span>
            </div>
            <button
              onClick={() => onOpenProfile?.()}
              className="text-[10px] text-purple-600 dark:text-purple-400 font-bold hover:underline cursor-pointer"
            >
              Settings
            </button>
          </div>

          <button
            onClick={() => onLogOut?.()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" />
            <span>Log Out</span>
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function Layout() {
  const { role, billingTier, promptsUsedToday, dailyPromptsLimit, ageGroup, themeMode, toggleThemeMode } = useAimiko();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleLogOut = () => {
    localStorage.removeItem("aimiko_token");
    localStorage.removeItem("aimiko_user");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const token = localStorage.getItem("aimiko_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    fetch("/api/v1/auth/me", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Invalid session");
        }
      })
      .catch(() => {
        localStorage.removeItem("aimiko_token");
        localStorage.removeItem("aimiko_user");
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  useEffect(() => {
    // Strict Role and Age Access Firewall:
    // If a user navigates to a tool outside their selected role or age bracket, immediately redirect them to /dashboard
    if (location.pathname.startsWith("/tools/")) {
      const slug = location.pathname.replace("/tools/", "").split("/")[0].toLowerCase();
      const userRole = role || "student";

      // Age isolation for kids: only kid-appropriate tools allowed
      if (ageGroup === "kids" && !KIDS_ALLOWED_TOOLS.includes(slug)) {
        navigate("/dashboard", { replace: true });
        return;
      }

      // Role isolation: verify tool belongs to current role
      const allowedTools = ROLE_ALLOWED_TOOLS[userRole] || [];
      if (!allowedTools.includes(slug)) {
        navigate("/dashboard", { replace: true });
        return;
      }
    }

    // Agent Playground is strictly for Student role
    if (location.pathname === "/playground" && role && role !== "student") {
      navigate("/dashboard", { replace: true });
    }
  }, [location.pathname, role, ageGroup, navigate]);

  const currentTitle = (() => {
    const exact = pageTitle[location.pathname];
    if (exact) return exact;
    if (location.pathname.startsWith("/tools/")) return "AI Tool";
    return "AIMIKO";
  })();

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full bg-background text-foreground theme-${ageGroup || "adults"} relative`}>
        {/* Subtle background dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-[0.35] z-0" />
        {/* Soft ambient glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/6 rounded-full blur-[100px] pointer-events-none z-0" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/6 rounded-full blur-[100px] pointer-events-none z-0" />

        <AppSidebar
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onLogOut={handleLogOut}
        />

        <div className="flex-1 flex flex-col min-h-screen z-10 relative overflow-hidden">
          {/* Header */}
          <header className="h-14 flex items-center justify-between border-b border-border/60 px-5 bg-background/80 backdrop-blur-xl sticky top-0 z-50 shrink-0">
            <div className="flex items-center gap-2.5">
              <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground cursor-pointer" />
              
              {/* Squircle back button matching requested design */}
              {location.pathname !== "/dashboard" && (
                <button
                  onClick={() => navigate(-1)}
                  className="h-8 w-8 rounded-xl border border-border/80 bg-secondary/60 hover:bg-secondary hover:border-primary/40 text-foreground transition-all flex items-center justify-center shadow-xs cursor-pointer group"
                  title="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-700 transition-transform group-hover:-translate-x-0.5" />
                </button>
              )}

              <div className="h-4 w-px bg-border" />
              <h2 className="text-sm font-semibold text-foreground">{currentTitle}</h2>
            </div>

            <div className="flex items-center gap-2.5">
              {/* MIKODIN Global Header Pill */}
              <button
                onClick={() => navigate("/mikodin")}
                className={`h-8 px-3 rounded-full border text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  location.pathname === "/mikodin"
                    ? "bg-purple-600 text-white border-purple-500 shadow-purple-500/25"
                    : "bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30"
                }`}
                title="Open MIKODIN Peer Network"
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-500 fill-current" />
                <span className="font-black tracking-tight">MIKODIN</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* AI prompts pill */}
              <div className="hidden md:flex items-center gap-2 bg-secondary/80 border border-border/60 rounded-full px-3.5 py-1.5 text-xs">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground font-medium">
                  <strong className="text-foreground font-semibold">{promptsUsedToday}</strong>
                  <span className="mx-0.5">/</span>
                  <span>{dailyPromptsLimit}</span>
                </span>
                {billingTier === "freemium" && (
                  <button
                    onClick={() => navigate("/upgrade")}
                    className="ml-1 text-primary font-semibold hover:underline underline-offset-2 transition-colors"
                  >
                    Upgrade
                  </button>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={toggleThemeMode}
                className="h-8 w-8 rounded-lg border border-border bg-secondary/60 hover:bg-secondary transition-colors flex items-center justify-center text-muted-foreground hover:text-foreground"
                title={themeMode === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {themeMode === "light"
                  ? <Moon className="h-3.5 w-3.5" />
                  : <Sun className="h-3.5 w-3.5" />
                }
              </button>

              {/* AIMIKO Mascot Profile Button (Exact Match to Picture) */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="relative p-0.5 rounded-full bg-white dark:bg-slate-900 border-2 border-purple-200 dark:border-purple-700/80 shadow-md hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                title="AIMIKO Buddy Profile & AI Settings"
              >
                <img
                  src="/brand/mascot_miko.png"
                  alt="AIMIKO Profile"
                  className="w-8 h-8 rounded-full object-contain p-0.5"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <Outlet />
          </main>
        </div>
      </div>
      <AimikoGuideChatbot />
      <AimikoProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </SidebarProvider>
  );
}
