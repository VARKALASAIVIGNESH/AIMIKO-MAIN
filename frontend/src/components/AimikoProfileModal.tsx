import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Key,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  GraduationCap,
  BookOpen,
  School,
  Target,
  ShieldAlert,
} from "lucide-react";
import { testAIConnection } from "@/lib/ai";

interface AimikoProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROQ_MODELS = [
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B (Groq LPU)", badge: "Flagship Intelligence · 128k" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B (Groq LPU)", badge: "Ultra-Fast · Instant" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B (Groq LPU)", badge: "Reasoning & Coding" },
];

export default function AimikoProfileModal({ isOpen, onClose }: AimikoProfileModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userName, setUserName, ageGroup, role, setRole } = useAimiko();

  const [activeTab, setActiveTab] = useState<"profile" | "byok" | "session">("profile");

  // User Profile States
  const [name, setName] = useState(userName || "");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [subjects, setSubjects] = useState("");
  const [goal, setGoal] = useState("");

  // BYOK States
  const [provider, setProvider] = useState<"groq" | "openrouter">("groq");
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    latencyMs?: number;
    message?: string;
  }>({ tested: false, success: false });

  // Load existing configuration from localStorage on open
  useEffect(() => {
    if (isOpen) {
      try {
        const storedUser = localStorage.getItem("aimiko_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.full_name) setName(parsed.full_name);
        }
      } catch (e) {
        console.warn("Could not parse aimiko_user", e);
      }

      // Load Buddy learning details
      setSchool(localStorage.getItem("aimiko_student_school") || "");
      setGrade(localStorage.getItem("aimiko_student_grade") || "");
      setSubjects(localStorage.getItem("aimiko_student_subjects") || "");
      setGoal(localStorage.getItem("aimiko_student_goal") || "");

      // Load BYOK settings (Groq Cloud Focus)
      const savedKey =
        localStorage.getItem("aimiko_ai_key") ||
        import.meta.env.VITE_GROQ_API_KEY ||
        "";
      const savedModel = localStorage.getItem("aimiko_ai_model") || "openai/gpt-oss-120b";

      setProvider("groq");
      setApiKey(savedKey);
      setSelectedModel(savedModel);
      setTestStatus({ tested: !!savedKey, success: !!savedKey });
    }
  }, [isOpen]);

  // Test the BYOK API Key live
  const handleTestKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Groq Cloud API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestStatus({ tested: false, success: false });

    try {
      const res = await testAIConnection("groq", apiKey.trim(), selectedModel);
      setTestStatus({
        tested: true,
        success: res.success,
        latencyMs: res.latencyMs,
        message: res.message,
      });

      if (res.success) {
        toast({
          title: "Connection Successful",
          description: `Connected to ${selectedModel} via Groq LPU in ${res.latencyMs}ms.`,
        });
      } else {
        toast({
          title: "Connection Failed",
          description: res.message || "Please verify your Groq API key and quota.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setTestStatus({
        tested: true,
        success: false,
        message: err.message || "Failed to contact Groq API.",
      });
      toast({
        title: "Test Error",
        description: err.message || "Network error while validating key.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save BYOK Settings to LocalStorage & Backend DB
  const handleSaveAIConfig = async () => {
    localStorage.setItem("aimiko_ai_provider", "groq");
    localStorage.setItem("aimiko_ai_key", apiKey.trim());
    localStorage.setItem("aimiko_ai_model", selectedModel);

    try {
      const token = localStorage.getItem("aimiko_token");
      if (token) {
        await fetch("http://127.0.0.1:8000/api/v1/auth/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            groq_api_key: apiKey.trim()
          })
        });
      }
    } catch (e) {
      console.warn("Could not sync groq key to backend:", e);
    }

    toast({
      title: "AI Configuration Saved",
      description: `AIMIKO Buddy is linked to Groq Cloud (${selectedModel}).`,
    });
  };

  // Save Profile Details to LocalStorage & Backend DB
  const handleSaveProfile = async () => {
    if (name.trim()) {
      setUserName(name.trim());
      try {
        const storedUser = localStorage.getItem("aimiko_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.full_name = name.trim();
          localStorage.setItem("aimiko_user", JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn("Update user local", e);
      }
    }

    localStorage.setItem("aimiko_student_school", school.trim());
    localStorage.setItem("aimiko_student_grade", grade.trim());
    localStorage.setItem("aimiko_student_subjects", subjects.trim());
    localStorage.setItem("aimiko_student_goal", goal.trim());

    try {
      const token = localStorage.getItem("aimiko_token");
      if (token) {
        await fetch("http://127.0.0.1:8000/api/v1/auth/profile", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: name.trim(),
            school_or_company: school.trim(),
            headline: grade.trim() ? `${grade.trim()} • ${subjects.trim()}` : subjects.trim(),
            bio: goal.trim(),
            skills: subjects.trim(),
            groq_api_key: apiKey.trim()
          })
        });
      }
    } catch (e) {
      console.warn("Could not sync profile to backend DB:", e);
    }

    toast({
      title: "Profile Updated & Saved to DB",
      description: "AIMIKO Buddy learning preferences have been synchronized.",
    });
  };

  // Log Out: Clean sweep of session
  const handleLogOut = () => {
    localStorage.removeItem("aimiko_token");
    localStorage.removeItem("aimiko_user");
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    toast({
      title: "Logged Out Successfully",
      description: "Your session has been ended. You can now test account creation or sign-in.",
    });
    onClose();
    navigate("/login", { replace: true });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        {/* Header Hero */}
        <div className="p-6 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-purple-200 dark:border-purple-700/80 shadow-md p-1 flex items-center justify-center">
                <img
                  src="/brand/mascot_miko.png"
                  alt="AIMIKO Mascot"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
            </div>

            <div>
              <DialogTitle className="text-lg font-black text-slate-950 dark:text-white flex items-center gap-2">
                <span>{name || "AIMIKO User"}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  {role || "Student"}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                {email || "AIMIKO Companion Workspace"}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab("profile")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "profile"
                ? "border-purple-600 text-purple-700 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>Buddy Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("byok")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "byok"
                ? "border-purple-600 text-purple-700 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>AI Key (BYOK)</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </button>

          <button
            onClick={() => setActiveTab("session")}
            className={`py-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "session"
                ? "border-purple-600 text-purple-700 dark:text-purple-400"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Session & Logout</span>
          </button>
        </div>

        {/* Tab 1: Buddy Profile & Learning Details */}
        {activeTab === "profile" && (
          <div className="p-6 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <School className="h-3.5 w-3.5 text-purple-600" /> School or College Name
                </label>
                <input
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Stanford University or Lincoln High"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5 text-purple-600" /> Grade or Academic Level
                </label>
                <input
                  type="text"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="e.g. 11th Grade, Undergrad Year 2, Masters"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-purple-600" /> Focus Subjects / Interests
              </label>
              <input
                type="text"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                placeholder="e.g. Calculus, Physics, AI/ML, World History"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-purple-600" /> Primary Goal with AIMIKO Buddy
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Ace upcoming finals & build a daily study routine"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="w-full h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer mt-2"
            >
              Save Profile Preferences
            </Button>
          </div>
        )}

        {/* Tab 2: Bring Your Own Key (Groq Cloud) */}
        {activeTab === "byok" && (
          <div className="p-6 space-y-5 text-xs">
            {/* Active Provider Card: Groq Cloud */}
            <div className="p-4 rounded-2xl border border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-purple-600" /> Groq Cloud LPU Engine
                </span>
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Ultra-Fast · Free Tier Active
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                AIMIKO Buddy uses Groq LPU hardware for instant, sub-second responses and step-by-step reasoning.
              </p>
            </div>

            {/* In-App Guide Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-[11px]">
                Groq Cloud API Key Instructions:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline inline-flex items-center gap-0.5"
                  >
                    console.groq.com/keys <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
                  </a>{" "}
                  (Free with Google or GitHub).
                </li>
                <li>Click <strong>&quot;Create API Key&quot;</strong>, name it <code>AIMIKO</code>, and copy it.</li>
                <li>Paste your key below (starts with <code>gsk_...</code>). Your pre-configured key is ready to test below!</li>
              </ol>
            </div>

            {/* Model Selector */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">Choose Groq LLM Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer"
              >
                {GROQ_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.badge})
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Groq API Key (starts with gsk_)
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="gsk_..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Test Status Banner */}
            {testStatus.tested && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                  testStatus.success
                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-800 dark:text-emerald-300"
                    : "bg-red-50 dark:bg-red-950/20 border-red-300 text-red-800 dark:text-red-300"
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                )}
                <div className="leading-snug">
                  <span className="font-bold">
                    {testStatus.success ? "Key Verified & Connected!" : "Key Test Failed"}
                  </span>
                  {testStatus.latencyMs && (
                    <span className="ml-1 text-[11px] opacity-80">({testStatus.latencyMs}ms latency)</span>
                  )}
                  {testStatus.message && <p className="text-[11px] mt-0.5">{testStatus.message}</p>}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                disabled={isTesting || !apiKey.trim()}
                onClick={handleTestKey}
                className="flex-1 h-10 rounded-xl font-bold text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isTesting ? "Testing Key..." : "Test Connection"}
              </Button>

              <Button
                type="button"
                onClick={handleSaveAIConfig}
                disabled={!apiKey.trim()}
                className="flex-1 h-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 cursor-pointer"
              >
                Save AI Settings
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Session & Security / Log Out */}
        {activeTab === "session" && (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white">Active Session Details</span>
              <div className="space-y-1 text-slate-600 dark:text-slate-400">
                <p><strong>Account:</strong> {email || "Logged in via Google"}</p>
                <p><strong>Companion Module:</strong> AIMIKO Buddy</p>
                <p><strong>Security:</strong> AES-256 JWT Encrypted Session</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-3">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
                <ShieldAlert className="h-4 w-4" />
                <span>Log Out of AIMIKO</span>
              </div>
              <p className="text-[11px] text-red-600/90 dark:text-red-400/90 leading-relaxed">
                Logging out clears your active local session token and cookies. You can sign back in or test creating a brand new account anytime.
              </p>
              <Button
                type="button"
                onClick={handleLogOut}
                className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Confirm & Log Out</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
