import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko, AgeGroup, Role } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { 
  User, 
  Heart, 
  Sparkles, 
  Award, 
  Trash2, 
  X, 
  Check, 
  Edit, 
  Crown, 
  ShieldCheck, 
  TrendingUp,
  KanbanSquare,
  ArrowRight,
  Bot,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ageLabels: Record<AgeGroup, string> = {
  kids: "Kids (5-10)",
  teens: "Teens (11-18)",
  college: "College / University",
  adults: "Adults / Professionals",
  seniors: "Seniors (Silver Ecosystem)",
};

const roleLabels: Record<Role, string> = {
  student: "Student / Learner",
  creator: "Content Creator",
  developer: "Developer & Engineer",
  job_seeker: "Job Seeker",
  founder: "Startup Founder",
  teacher: "Teacher & Educator",
};

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    userName,
    ageGroup,
    role,
    goals,
    interests,
    weakAreas,
    billingTier,
    setUserName,
    setAgeGroup,
    setRole,
    addInterest,
    removeInterest,
    addWeakArea,
    removeWeakArea,
    addGoal,
    removeGoal,
  } = useAimiko();

  // Editing profile states
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempAge, setTempAge] = useState<AgeGroup | "">(ageGroup || "");
  const [tempRole, setTempRole] = useState<Role | "">(role || "");

  // Tag inputs
  const [interestText, setInterestText] = useState("");
  const [weakAreaText, setWeakAreaText] = useState("");
  const [goalText, setGoalText] = useState("");

  const handleSaveProfile = () => {
    if (!tempName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name.",
      });
      return;
    }

    setUserName(tempName.trim());

    setIsEditing(false);
    toast({
      title: "Profile updated!",
      description: "Your settings and theme updates are now live.",
    });
  };

  const handleAddInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!interestText.trim()) return;
    if (interests.includes(interestText.trim())) {
      toast({ title: "Already exists", description: "Interest is already in list." });
      return;
    }
    addInterest(interestText.trim());
    setInterestText("");
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    if (goals.includes(goalText.trim())) {
      toast({ title: "Already exists", description: "Goal is already in list." });
      return;
    }
    addGoal(goalText.trim());
    setGoalText("");
  };

  const handleAddWeakArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weakAreaText.trim()) return;
    if (weakAreas.includes(weakAreaText.trim())) {
      toast({ title: "Already exists", description: "Weak area is already in list." });
      return;
    }
    addWeakArea(weakAreaText.trim());
    setWeakAreaText("");
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Visual Identity Header Card */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 text-center md:text-left">
          <AimikoAvatar size="lg" animate />
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-display font-black tracking-tight text-foreground">
                {userName || "AIMIKO Friend"}
              </h1>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                billingTier === "premium"
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                  : "bg-muted text-muted-foreground border-border/30"
              } flex items-center gap-1`}>
                {billingTier === "premium" ? <Crown className="h-3 w-3 fill-amber-500" /> : null}
                {billingTier}
              </span>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Age Group: <strong className="text-foreground">{ageGroup ? ageLabels[ageGroup] : "Not Selected"}</strong> &bull; 
              Role: <strong className="text-foreground">{role ? roleLabels[role] : "Not Selected"}</strong>
            </p>
            <p className="text-xs text-muted-foreground max-w-md">
              Your profile values guide AIMIKO's customized tools and suggestions. Update them below to calibrate your workspace.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-auto">
          {isEditing ? (
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsEditing(false)} 
                variant="secondary"
                className="rounded-xl flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveProfile}
                className="rounded-xl flex-1 text-xs font-bold"
              >
                <Check className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
            </div>
          ) : (
            <Button 
              onClick={() => {
                setTempName(userName);
                setTempAge(ageGroup || "");
                setTempRole(role || "");
                setIsEditing(true);
              }}
              variant="outline"
              className="rounded-xl border-border/40 hover:bg-secondary/40 text-xs flex items-center justify-center gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Button>
          )}

          {billingTier === "freemium" && (
            <Button
              onClick={() => navigate("/upgrade")}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 border-0 hover:opacity-95 text-white font-bold text-xs"
            >
              Upgrade Tier
            </Button>
          )}
        </div>
      </div>

      {/* Profile Editor Fields Drawer */}
      {isEditing && (
        <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-md space-y-6 animate-in slide-in-from-top-2 duration-200">
          <h3 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Modify Profile Coordinates
          </h3>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Enter name..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3 text-muted-foreground" /> Age Bracket (Locked)
              </label>
              <div className="w-full bg-secondary/50 border border-border text-xs rounded-xl px-3.5 py-2.5 text-foreground font-semibold">
                {ageGroup ? ageLabels[ageGroup] : "Not Selected"}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Lock className="h-3 w-3 text-muted-foreground" /> Workspace Role (Locked)
              </label>
              <div className="w-full bg-secondary/50 border border-border text-xs rounded-xl px-3.5 py-2.5 text-foreground font-semibold">
                {role ? roleLabels[role] : "Not Selected"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Founder Dedicated Project Management Tool (AI Jira / Sprint Board) */}
      {role === "founder" && (
        <div className="bg-gradient-to-r from-card to-card/90 border border-primary/20 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <KanbanSquare className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Founder Project OS</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                  AI-Powered
                </span>
              </div>
              <h2 className="text-xl font-display font-black tracking-tight text-foreground">
                AI Jira & Sprint Project Studio
              </h2>
              <p className="text-xs text-muted-foreground max-w-xl">
                Automate agile execution for your startup. Decompose feature requests into estimated user stories, track 5-stage sprint Kanban boards, generate AI daily standups, and audit sprint health.
              </p>
            </div>

            <Button
              onClick={() => navigate("/tools/agile-pm")}
              className="rounded-xl font-bold text-xs gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              Open Sprint Board <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-background/80 border border-border/40 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Current Sprint</span>
              <p className="text-sm font-bold text-foreground">Sprint 1 (MVP Launch)</p>
              <span className="text-[10px] text-primary font-semibold">4 days remaining</span>
            </div>
            <div className="bg-background/80 border border-border/40 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Velocity Completed</span>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">28 / 42 Pts</p>
              <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: "66%" }} />
              </div>
            </div>
            <div className="bg-background/80 border border-border/40 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Sprint Health</span>
              <p className="text-sm font-bold text-foreground">94% Healthy</p>
              <span className="text-[10px] text-muted-foreground">0 Critical Blockers</span>
            </div>
            <div className="bg-background/80 border border-border/40 rounded-2xl p-3 space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">AI Capabilities</span>
              <p className="text-sm font-bold text-foreground">Autonomous</p>
              <span className="text-[10px] text-muted-foreground">Gherkin + Standups</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Parameters: Interests, Goals, Weak Areas */}
      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Interests Card */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Heart className="h-4.5 w-4.5" />
            <h3 className="text-sm font-display tracking-tight">Interests</h3>
          </div>
          
          <div className="min-h-[80px] flex flex-wrap gap-1.5">
            {interests.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No interests logged. Add topics below to match connections.</p>
            ) : (
              interests.map((interest) => (
                <span 
                  key={interest} 
                  className="inline-flex items-center gap-1 text-[11px] bg-secondary/80 text-foreground border border-border/30 rounded-xl px-2.5 py-1"
                >
                  {interest}
                  <button 
                    onClick={() => removeInterest(interest)}
                    className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleAddInterest} className="flex gap-2 border-t border-border/10 pt-4">
            <input
              type="text"
              value={interestText}
              onChange={(e) => setInterestText(e.target.value)}
              placeholder="e.g. Robotics"
              className="flex-1 bg-background border border-border text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-xl text-xs px-3">
              Add
            </Button>
          </form>
        </div>

        {/* Goals Card */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Sparkles className="h-4.5 w-4.5" />
            <h3 className="text-sm font-display tracking-tight">Active Goals</h3>
          </div>

          <div className="min-h-[80px] flex flex-wrap gap-1.5">
            {goals.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No goals logged. Add roadmap milestones below.</p>
            ) : (
              goals.map((goal) => (
                <span 
                  key={goal} 
                  className="inline-flex items-center gap-1 text-[11px] bg-secondary/80 text-foreground border border-border/30 rounded-xl px-2.5 py-1"
                >
                  {goal}
                  <button 
                    onClick={() => removeGoal(goal)}
                    className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleAddGoal} className="flex gap-2 border-t border-border/10 pt-4">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="e.g. Build startup MVP"
              className="flex-1 bg-background border border-border text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-xl text-xs px-3">
              Add
            </Button>
          </form>
        </div>

        {/* Weak Learning Areas */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <TrendingUp className="h-4.5 w-4.5" />
            <h3 className="text-sm font-display tracking-tight">Weak Areas</h3>
          </div>

          <div className="min-h-[80px] flex flex-wrap gap-1.5">
            {weakAreas.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No weak areas logged. Write down challenging subjects to study.</p>
            ) : (
              weakAreas.map((area) => (
                <span 
                  key={area} 
                  className="inline-flex items-center gap-1 text-[11px] bg-secondary/80 text-foreground border border-border/30 rounded-xl px-2.5 py-1"
                >
                  {area}
                  <button 
                    onClick={() => removeWeakArea(area)}
                    className="p-0.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <form onSubmit={handleAddWeakArea} className="flex gap-2 border-t border-border/10 pt-4">
            <input
              type="text"
              value={weakAreaText}
              onChange={(e) => setWeakAreaText(e.target.value)}
              placeholder="e.g. Calculus integrals"
              className="flex-1 bg-background border border-border text-xs rounded-xl px-3 py-2 text-foreground focus:outline-none"
            />
            <Button type="submit" size="sm" className="rounded-xl text-xs px-3">
              Add
            </Button>
          </form>
        </div>

      </div>

      {/* Security & Shield Panel */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-green-500/10 text-green-600 rounded-2xl border border-green-500/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-foreground">Offline Security Sync</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All profile coordinates, goals, and interest parameters are encrypted locally and stored strictly in your browser. Rest assured, your personal training settings never leave your sandbox.
          </p>
        </div>
      </div>

    </div>
  );
}
