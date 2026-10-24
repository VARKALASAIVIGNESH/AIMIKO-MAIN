import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import MainNavbar from "@/components/MainNavbar";
import { Baby, Gamepad2, GraduationCap, Briefcase, Heart } from "lucide-react";

const ageGroups = [
  {
    id: "kids" as const,
    label: "Kids",
    range: "Ages 5–10",
    icon: Baby,
    iconColor: "text-pink-500",
    hoverBorder: "hover:border-pink-400 hover:shadow-pink-500/10",
  },
  {
    id: "teens" as const,
    label: "Teens",
    range: "Ages 11–17",
    icon: Gamepad2,
    iconColor: "text-violet-500",
    hoverBorder: "hover:border-violet-400 hover:shadow-violet-500/10",
  },
  {
    id: "college" as const,
    label: "College",
    range: "Ages 18–22",
    icon: GraduationCap,
    iconColor: "text-orange-500",
    hoverBorder: "hover:border-orange-400 hover:shadow-orange-500/10",
  },
  {
    id: "adults" as const,
    label: "Adults",
    range: "Ages 23–50",
    icon: Briefcase,
    iconColor: "text-emerald-500",
    hoverBorder: "hover:border-emerald-400 hover:shadow-emerald-500/10",
  },
  {
    id: "seniors" as const,
    label: "Seniors",
    range: "Ages 50+",
    icon: Heart,
    iconColor: "text-amber-500",
    hoverBorder: "hover:border-amber-400 hover:shadow-amber-500/10",
  },
];

export default function AgeSelect() {
  const navigate = useNavigate();
  const { ageGroup, role, setAgeGroup, setRole } = useAimiko();

  useEffect(() => {
    if (ageGroup && role) {
      navigate("/dashboard", { replace: true });
    }
  }, [ageGroup, role, navigate]);

  const handleSelect = (id: typeof ageGroups[number]["id"]) => {
    setAgeGroup(id);
    if (id === "kids") {
      setRole("student");
      navigate("/dashboard");
    } else {
      navigate("/role-select");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#fdf8ff] via-[#f8f0ff] to-[#fff2fb] text-slate-900 relative overflow-hidden">
      {/* Unified Top Navigation Bar */}
      <MainNavbar />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-300/25 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-pink-300/25 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-2xl w-full text-center animate-pop-in space-y-10 relative z-10">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#0c0c18]">
              How old are you?
            </h1>
            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
              AIMIKO adapts its personality, tools, and suggestions based on your age group.
            </p>
          </div>

          {/* Age cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            {ageGroups.map((group, i) => (
              <button
                key={group.id}
                onClick={() => handleSelect(group.id)}
                className={`group bg-white/85 backdrop-blur-xl border border-purple-100/90 ${group.hoverBorder} rounded-2xl p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 active:scale-[0.97] animate-slide-up`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className={`p-3 rounded-xl bg-purple-50/70 border border-purple-100 ${group.iconColor} transition-transform duration-200 group-hover:scale-110 shadow-sm`}>
                  <group.icon className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-[#0c0c18] text-sm">{group.label}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{group.range}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
