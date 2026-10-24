import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/MainNavbar";
import { api } from "@/lib/api";
import {
  BookOpen,
  Code2,
  Palette,
  BarChart3,
  Briefcase,
  Rocket,
  GraduationCap,
  ArrowRight,
  Check,
} from "lucide-react";

const roles = [
  {
    id: "student" as const,
    label: "Student",
    desc: "Study help, concept explanations, practice quizzes.",
    icon: BookOpen,
  },
  {
    id: "creator" as const,
    label: "Content Creator",
    desc: "Video scripts, thumbnail ideas, SEO titles, trend analysis.",
    icon: Palette,
  },
  {
    id: "developer" as const,
    label: "Developer & Engineer",
    desc: "Debug code, API blueprints, README builder, code explanations.",
    icon: Code2,
  },
  {
    id: "job_seeker" as const,
    label: "Job Seeker",
    desc: "Resume polishing, cover letters, interview practice.",
    icon: Briefcase,
  },
  {
    id: "founder" as const,
    label: "Startup Founder",
    desc: "Idea validation, business plans, investor pitch decks.",
    icon: Rocket,
  },
  {
    id: "teacher" as const,
    label: "Teacher & Educator",
    desc: "Lesson plans, assignments, student progress reports.",
    icon: GraduationCap,
  },
];

const getRoleDetails = (roleId: string, ageGroup: string | null) => {
  switch (roleId) {
    case "student":
      if (ageGroup === "kids") return { label: "School Buddy", desc: "Help with homework, school topics, and fun learning!" };
      if (ageGroup === "seniors") return { label: "Lifelong Learner", desc: "Explore hobbies, book summaries, and keep your mind active." };
      return { label: "Student", desc: "Study help, concept explanations, practice quizzes." };
    case "creator":
      if (ageGroup === "kids") return { label: "Story Teller", desc: "Write fun stories, get drawing prompts, and build cool crafts!" };
      if (ageGroup === "seniors") return { label: "Storyteller", desc: "Write memoirs, share experiences, or generate video ideas." };
      return { label: "Content Creator", desc: "Video scripts, thumbnail ideas, SEO titles, trend analysis." };
    case "developer":
      if (ageGroup === "seniors") return { label: "Tech Hobbyist", desc: "Learn how apps work, start coding as a hobby." };
      return { label: "Developer & Engineer", desc: "Debug code, API blueprints, README builder." };
    case "teacher":
      if (ageGroup === "seniors") return { label: "Mentor & Educator", desc: "Share life lessons, write teaching materials." };
      return { label: "Teacher & Educator", desc: "Lesson plans, assignments, student progress reports." };
    case "founder":
      if (ageGroup === "seniors") return { label: "Consultant & Advisor", desc: "Advise startups, consult businesses, or launch a side project." };
      return { label: "Startup Founder", desc: "Idea validation, business plans, investor pitch decks." };
    case "job_seeker":
      return { label: "Job Seeker", desc: "Resume polishing, cover letters, interview practice." };
    default:
      return { label: "", desc: "" };
  }
};

export default function RoleSelect() {
  const navigate = useNavigate();
  const { role, setRole, ageGroup } = useAimiko();
  const [selected, setSelected] = useState<typeof roles[number]["id"] | null>(null);

  useEffect(() => {
    if (role) {
      navigate("/dashboard", { replace: true });
      return;
    }
    if (ageGroup === "kids") {
      setRole("student");
      navigate("/dashboard");
    }
  }, [ageGroup, role, navigate, setRole]);

  const filteredRoles = roles.filter((role) => {
    if (ageGroup === "kids") return role.id === "student" || role.id === "creator";
    if (ageGroup === "teens") return role.id === "student" || role.id === "creator" || role.id === "developer";
    if (ageGroup === "seniors") return ["student", "creator", "developer", "founder", "teacher"].includes(role.id);
    return true;
  });

  const handleContinue = async () => {
    if (selected) {
      setRole(selected);
      const token = localStorage.getItem("aimiko_token");
      if (token) {
        try {
          await api.auth.updateProfile({ role: selected });
        } catch {
          // Handled via local state fallback
        }
      }
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fdf8ff] via-[#f8f0ff] to-[#fff2fb] text-slate-900 relative overflow-hidden">
      {/* Unified Top Navigation Bar */}
      <MainNavbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300/25 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-xl w-full text-center animate-pop-in space-y-8 relative z-10">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0c0c18]">
              What do you do?
            </h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Pick the role that best describes you. AIMIKO will personalize your tools accordingly.
            </p>
          </div>

          {/* Role grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1 custom-scrollbar">
            {filteredRoles.map((role, i) => {
              const isSelected = selected === role.id;
              const details = getRoleDetails(role.id, ageGroup);
              return (
                <button
                  key={role.id}
                  onClick={() => setSelected(role.id)}
                  className={`relative rounded-2xl p-4 flex items-start gap-4 text-left transition-all duration-200 border cursor-pointer animate-slide-up backdrop-blur-md ${
                    isSelected
                      ? "border-violet-500 bg-violet-50/90 shadow-lg shadow-violet-500/10 ring-2 ring-violet-400/30"
                      : "border-purple-100/90 bg-white/85 hover:border-purple-300 hover:bg-white hover:shadow-md"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-all duration-200 ${
                    isSelected ? "aimiko-gradient text-white shadow-md shadow-violet-500/30" : "bg-purple-50 text-violet-600 border border-purple-100"
                  }`}>
                    <role.icon className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <p className="font-bold text-[#0c0c18] text-sm">{details.label}</p>
                    <p className="text-xs text-slate-500 leading-snug">{details.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="shrink-0 h-5 w-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-sm">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            size="lg"
            disabled={!selected}
            onClick={handleContinue}
            className="w-full rounded-2xl py-6 font-bold text-sm aimiko-gradient text-white border-0 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.01] transition-all disabled:opacity-40 cursor-pointer"
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
