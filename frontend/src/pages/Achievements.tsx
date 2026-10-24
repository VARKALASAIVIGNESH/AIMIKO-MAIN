import { useState, useEffect } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Flame, 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Lock, 
  Crown,
  Check
} from "lucide-react";

interface BadgeRequirement {
  name: string;
  desc: string;
  icon: any;
  colorClass: string;
  qualifierCheck: (contextData: any) => boolean;
  unlockedHint: string;
  lockedHint: string;
}

const badgeRequirements: BadgeRequirement[] = [
  {
    name: "Habit Builder",
    desc: "Maintain a study streak of 3 consecutive days.",
    icon: Flame,
    colorClass: "from-orange-500 to-amber-500",
    qualifierCheck: (data) => data.streakDays >= 3,
    unlockedHint: "Unlocked! Streak has crossed 3 days.",
    lockedHint: "Interactions needed: ",
  },
  {
    name: "Visionary Planner",
    desc: "Set at least 2 active goals in your planner.",
    icon: TrendingUp,
    colorClass: "from-indigo-500 to-cyan-500",
    qualifierCheck: (data) => data.goalsCount >= 2,
    unlockedHint: "Unlocked! You have mapped your roadmap.",
    lockedHint: "Add active goals in Planner: ",
  },
  {
    name: "Task Crusher",
    desc: "Complete 3 planning tasks in your checklist.",
    icon: CheckCircle2,
    colorClass: "from-emerald-500 to-teal-500",
    qualifierCheck: (data) => data.completedTasksCount >= 3,
    unlockedHint: "Unlocked! 3+ checklist items completed.",
    lockedHint: "Tasks needed to complete: ",
  },
  {
    name: "Ecosystem Socialite",
    desc: "Make 2 active peer connections in the network.",
    icon: Users,
    colorClass: "from-pink-500 to-rose-500",
    qualifierCheck: (data) => data.connectionsCount >= 2,
    unlockedHint: "Unlocked! Connected with 2+ partners.",
    lockedHint: "Make connections in Network: ",
  },
  {
    name: "Knowledge Collector",
    desc: "Save 2 or more summaries in your notes workspace.",
    icon: BookOpen,
    colorClass: "from-purple-500 to-violet-500",
    qualifierCheck: (data) => data.notesCount >= 2,
    unlockedHint: "Unlocked! 2+ documents saved.",
    lockedHint: "Create study notes: ",
  },
  {
    name: "Premium Explorer",
    desc: "Unlock premium AI capability features.",
    icon: Crown,
    colorClass: "from-amber-500 to-yellow-500",
    qualifierCheck: (data) => data.billingTier === "premium",
    unlockedHint: "Unlocked! Premium membership tier.",
    lockedHint: "Upgrade account to Premium tier",
  },
];

export default function Achievements() {
  const { badges, streakDays, goals, tasks, notes, billingTier, addBadge } = useAimiko();
  const { toast } = useToast();
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  // Fetch connection count from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("aimiko_network_connections");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const activeConnections = parsed.filter((c: any) => c.isConnected).length;
        setConnectionsCount(activeConnections);
      } catch (e) {
        setConnectionsCount(0);
      }
    }
  }, []);

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  const evaluationData = {
    streakDays,
    goalsCount: goals.length,
    completedTasksCount,
    connectionsCount,
    notesCount: notes.length,
    billingTier,
  };

  // Check how many of the 6 badges are qualified
  const qualifiedBadges = badgeRequirements.filter((req) => req.qualifierCheck(evaluationData));
  const completionPercentage = Math.round((qualifiedBadges.length / badgeRequirements.length) * 100);

  const triggerConfettiEffect = () => {
    const colors = ["bg-orange-500", "bg-indigo-500", "bg-yellow-500", "bg-emerald-500", "bg-pink-500", "bg-cyan-500"];
    const particles = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
    // Clear confetti after animation
    setTimeout(() => {
      setConfetti([]);
    }, 4000);
  };

  const handleClaimBadge = (badgeName: string) => {
    addBadge(badgeName);
    triggerConfettiEffect();
    toast({
      title: "Badge Claimed!",
      description: `"${badgeName}" badge is now permanently pinned to your profile layout.`,
    });
  };

  return (
    <div className="p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      
      {/* Confetti Animation Layer */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className={`absolute top-0 w-2 h-5 rounded ${particle.color} animate-confetti pointer-events-none z-50`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      <div className="max-w-4xl mx-auto space-y-8 animate-pop-in">
        
        {/* Header Card */}
        <div className="tech-card glow-purple border-border bg-card/60 p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-background border border-border text-primary">
              <Award className="h-6 w-6 animate-bounce-slow" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-black tracking-wider uppercase text-foreground">
                Achievements & Badges
              </h1>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">
                Track your goals, complete checklists, and claim unlocked badges.
              </p>
            </div>
          </div>
        </div>

        {/* Gamification progress bar */}
        <div className="tech-card border-border bg-card/60 p-6 shadow-md space-y-4">
          <div className="flex justify-between items-center text-xs">
            <div>
              <h3 className="font-display font-black text-foreground uppercase tracking-wider">Overall Badge Progress</h3>
              <p className="text-[10px] text-muted-foreground font-semibold mt-1">
                Unlocked <strong className="text-primary">{qualifiedBadges.length}</strong> of <strong className="text-foreground">{badgeRequirements.length}</strong> badges
              </p>
            </div>
            <span className="text-xl font-display font-black text-primary">{completionPercentage}%</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-background border border-border/40 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-700" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Quick Metrics Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <div className="tech-card border-border/40 bg-background/45 p-4 text-center">
            <span className="text-2xl font-display font-black text-foreground">{streakDays}</span>
            <span className="block text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1">Study Streak</span>
          </div>
          <div className="tech-card border-border/40 bg-background/45 p-4 text-center">
            <span className="text-2xl font-display font-black text-foreground">{goals.length}</span>
            <span className="block text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1">Active Goals</span>
          </div>
          <div className="tech-card border-border/40 bg-background/45 p-4 text-center">
            <span className="text-2xl font-display font-black text-foreground">{completedTasksCount}</span>
            <span className="block text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1">Tasks Done</span>
          </div>
          <div className="tech-card border-border/40 bg-background/45 p-4 text-center">
            <span className="text-2xl font-display font-black text-foreground">{notes.length}</span>
            <span className="block text-[9px] text-muted-foreground font-black uppercase tracking-wider mt-1">Saved Notes</span>
          </div>
        </div>

        {/* Badges Grid Board */}
        <div className="space-y-4">
          <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest px-1">
            Badge Showcase Room
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {badgeRequirements.map((badge) => {
              const isQualified = badge.qualifierCheck(evaluationData);
              const isClaimed = badges.includes(badge.name);

              return (
                <div 
                  key={badge.name}
                  className={`tech-card border rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 relative ${
                    isClaimed 
                      ? "border-primary/40 shadow-sm" 
                      : isQualified 
                        ? "border-primary border-dashed animate-pulse glow-purple" 
                        : "border-border/40 bg-background/45 opacity-60"
                  }`}
                >
                  {/* Badge visual icon */}
                  <div className="space-y-4">
                    <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${badge.colorClass} flex items-center justify-center text-white shadow-sm relative`}>
                      <badge.icon className="h-5 w-5" />
                      {!isQualified && (
                        <div className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5">
                          <Lock className="h-3 w-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-black text-foreground text-sm tracking-wide">{badge.name}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                        {badge.desc}
                      </p>
                    </div>
                  </div>

                  {/* Badge claiming/locked status triggers */}
                  <div className="border-t border-border pt-4 mt-5">
                    {isClaimed ? (
                      <div className="flex items-center gap-1.5 text-xs text-primary font-black uppercase tracking-wider">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>Pinned to Profile</span>
                      </div>
                    ) : isQualified ? (
                      <Button 
                        onClick={() => handleClaimBadge(badge.name)}
                        className="w-full text-xs font-black uppercase tracking-widest rounded-xl py-2 bg-gradient-to-r from-primary to-indigo-600 text-white border-0 hover-bounce shadow-md"
                      >
                        Claim Badge
                      </Button>
                    ) : (
                      <div className="space-y-1.5 font-semibold">
                        <span className="text-[9px] uppercase font-black tracking-widest text-primary block">Prerequisites:</span>
                        <p className="text-[10px] text-muted-foreground leading-relaxed font-mono">
                          {badge.lockedHint}
                          {badge.name === "Habit Builder" && <strong className="text-foreground">{streakDays}/3 days</strong>}
                          {badge.name === "Visionary Planner" && <strong className="text-foreground">{goals.length}/2 goals</strong>}
                          {badge.name === "Task Crusher" && <strong className="text-foreground">{completedTasksCount}/3 items</strong>}
                          {badge.name === "Ecosystem Socialite" && <strong className="text-foreground">{connectionsCount}/2 friends</strong>}
                          {badge.name === "Knowledge Collector" && <strong className="text-foreground">{notes.length}/2 notes</strong>}
                          {badge.name === "Premium Explorer" && <strong className="text-foreground">freemium</strong>}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
