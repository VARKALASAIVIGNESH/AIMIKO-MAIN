import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Bot,
  Sparkles,
  Play,
  RotateCcw,
  Plus,
  Share2,
  CheckCircle2,
  Zap,
  Volume2,
  Bell,
  FileText,
  Clock,
  Sliders,
  Shield,
  Layers,
  Award,
  Terminal,
  Send,
  Wand2,
  Smile,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AgentStep {
  id: string;
  type: "trigger" | "brain" | "action";
  title: string;
  description: string;
  config: Record<string, any>;
}

interface PublishedAgent {
  id: string;
  name: string;
  tagline: string;
  trigger: string;
  brainPersona: string;
  actions: string[];
  runsCount: number;
}

export function AgentPlayground() {
  const { ageGroup, role, userName, incrementPromptUsage, addBadge } = useAimiko();
  const { toast } = useToast();

  const [agentName, setAgentName] = useState("Cosmo the Homework Detective");
  const [agentDescription, setAgentDescription] = useState(
    "A fun, Socratic study agent that breaks difficult questions into friendly step-by-step clues without spoiling the answer!"
  );
  
  // 3-Step Agent Workflow Config
  const [selectedTrigger, setSelectedTrigger] = useState("homework_input");
  const [brainPersona, setBrainPersona] = useState("socratic_coach");
  const [selectedActions, setSelectedActions] = useState<string[]>([
    "speak_voice",
    "give_hints",
    "award_points"
  ]);

  // Simulation & Execution Console
  const [testQuestion, setTestQuestion] = useState("Why does the moon change shapes during the month?");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [agentOutput, setAgentOutput] = useState<string | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [isPublishedToMikodin, setIsPublishedToMikodin] = useState(false);

  const triggers = [
    {
      id: "homework_input",
      label: "📝 When I Ask a Homework Question",
      desc: "Triggers whenever you paste a textbook problem or question",
      icon: FileText
    },
    {
      id: "daily_morning",
      label: "⏰ Daily 8:00 AM Routine Alarm",
      desc: "Runs every morning to prepare a fun study goal for the day",
      icon: Clock
    },
    {
      id: "manual_click",
      label: "🔘 When I Hit the Play Button",
      desc: "Runs on demand whenever you click run in the dashboard",
      icon: Play
    },
    {
      id: "streak_check",
      label: "🔥 When My Study Streak Reaches 3 Days",
      desc: "Automatically celebrates your achievement with bonus challenges",
      icon: Award
    }
  ];

  const personas = [
    {
      id: "socratic_coach",
      label: "🧠 Socratic Detective",
      tagline: "Guides step-by-step with analogies, never gives raw answers away.",
      badge: "Anti-Cheating Verified"
    },
    {
      id: "space_explorer",
      label: "🚀 Galactic Space Guide",
      tagline: "Explains science and math through rocket ships and alien planets.",
      badge: "Kid Favorite"
    },
    {
      id: "rhyme_master",
      label: "🎵 Rhyme & Song Mnemonic",
      tagline: "Turns dry formulas and dates into catchy memory rhymes.",
      badge: "Super Memory"
    },
    {
      id: "friendly_cheerleader",
      label: "🌟 High-Five Study Cheerleader",
      tagline: "Keeps you motivated, confident, and celebrates every small attempt.",
      badge: "High Energy"
    }
  ];

  const availableActions = [
    {
      id: "give_hints",
      label: "🧩 3 Progressive Hints",
      desc: "Breaks problem into Easy, Medium, and Final clue steps."
    },
    {
      id: "speak_voice",
      label: "🔊 Read Aloud Voiceover",
      desc: "Uses speech synthesis to read the agent's explanation warmly."
    },
    {
      id: "award_points",
      label: "⭐ Award +25 Mikos XP",
      desc: "Increases your daily End-of-Day (EOD) reward points."
    },
    {
      id: "save_notes",
      label: "📔 Auto-Save to Smart Notes",
      desc: "Logs the solution in your notebook library for revision."
    }
  ];

  const toggleAction = (id: string) => {
    if (selectedActions.includes(id)) {
      if (selectedActions.length === 1) return; // Keep at least one
      setSelectedActions(selectedActions.filter((a) => a !== id));
    } else {
      setSelectedActions([...selectedActions, id]);
    }
  };

  const handleRunSimulation = async () => {
    if (!testQuestion.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Great job practicing today! Upgrade for unlimited agent runs.",
        variant: "destructive"
      });
      return;
    }

    setIsSimulating(true);
    setSimulationLogs([]);
    setAgentOutput(null);

    // Simulated Agent Execution Pipeline with step-by-step logging
    const addLog = (msg: string) => setSimulationLogs((prev) => [...prev, msg]);

    try {
      addLog("🚀 [Trigger Activated]: " + triggers.find((t) => t.id === selectedTrigger)?.label);
      await new Promise((r) => setTimeout(r, 400));

      addLog(`🧠 [AI Brain Invoked]: ${personas.find((p) => p.id === brainPersona)?.label} is thinking...`);
      await new Promise((r) => setTimeout(r, 600));

      addLog(`⚡ [Tools Active]: ${selectedActions.join(", ")}`);
      await new Promise((r) => setTimeout(r, 400));

      const response = await generateAIResponse(
        `You are ${agentName}, configured as ${brainPersona}. 
User Question: "${testQuestion}"
Actions equipped: ${selectedActions.join(", ")}.
Guide the student in 3 friendly, engaging Socratic steps. If asked about the moon phases, use simple analogies like holding a tennis ball near a lamp. Keep tone energetic and suitable for a 12-year-old student!`,
        ageGroup || "teens",
        "student",
        [],
        "You are an encouraging, safe AI study agent for children and teenagers."
      );

      addLog("✅ [Execution Successful]: Output rendered and tools applied!");
      setAgentOutput(response);

      if (selectedActions.includes("speak_voice") && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response.slice(0, 180));
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }

      toast({
        title: "Agent Simulation Ran Successfully!",
        description: "Your custom agent processed the question and executed its tools."
      });
    } catch {
      setAgentOutput(
        "Great question! Imagine you are holding a flashlight (the Sun) and looking at a friend holding a basketball (the Moon). As they walk in a circle around you (the Earth), you can only see the half lit by the light! What do you think happens when the friend is right between you and the lamp?"
      );
      addLog("✅ [Execution Complete]");
    } finally {
      setIsSimulating(false);
    }
  };

  const handlePublishToMikodin = () => {
    setIsPublishedToMikodin(true);
    addBadge("AI Agent Creator");
    
    // Store in localStorage so Mikodin feed immediately reflects it
    const existingPosts = JSON.parse(localStorage.getItem("mikodin_user_posts") || "[]");
    const newAgentPost = {
      id: "agent-" + Date.now(),
      title: `🚀 I built a new AI Agent: "${agentName}"!`,
      summary: `${agentDescription} Built with ${selectedActions.length} tools and running the ${personas.find((p) => p.id === brainPersona)?.label} brain. Test it out in the Playground!`,
      author: userName || "Young Builder",
      role: "student",
      ageGroup: ageGroup || "teens",
      likes: 1,
      hasLiked: true,
      category: "AgentBuilder",
      timestamp: "Just now",
      reactions: { highFives: 2, mindBlown: 1, bigBrain: 3, superCool: 4 },
      agentData: {
        name: agentName,
        trigger: triggers.find((t) => t.id === selectedTrigger)?.label,
        tools: selectedActions
      }
    };

    localStorage.setItem("mikodin_user_posts", JSON.stringify([newAgentPost, ...existingPosts]));

    toast({
      title: "🎉 Published to MIKODIN!",
      description: "Earned +100 Mikos XP! Your agent is now live on the Student Trait Feed."
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
              <Bot className="h-3.5 w-3.5" /> AI Agent & Workflow Playground
            </span>
            <span className="text-xs text-muted-foreground">• Free Interactive Builder</span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.2 rounded-full border border-emerald-500/20">
              Zero Code
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Build Your First Autonomous AI Agent
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5 max-w-2xl">
            Design, train, and test your own micro-agents for school, science, and daily routines. Combine triggers, AI thinking brains, and actions—then publish to Mikodin!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handlePublishToMikodin}
            disabled={isPublishedToMikodin}
            className="text-xs rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md font-bold"
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            {isPublishedToMikodin ? "Published to MIKODIN! ✓" : "Publish to MIKODIN (+100 XP)"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-purple-500" /> Agent Mentor
          </Button>
        </div>
      </div>

      {/* Main Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Visual Agent Architecture Steps */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Agent Meta Details */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
              Agent Identity
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full rounded-xl bg-secondary/80 border border-border/60 px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">What does this agent do?</label>
                <input
                  type="text"
                  value={agentDescription}
                  onChange={(e) => setAgentDescription(e.target.value)}
                  className="w-full rounded-xl bg-secondary/80 border border-border/60 px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* STEP 1: TRIGGER */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-500 font-black text-xs flex items-center justify-center border border-blue-500/20">
                  1
                </span>
                <h3 className="font-bold text-sm text-foreground">Choose Trigger (What wakes the agent up?)</h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Event Listener</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {triggers.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTrigger(t.id)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    selectedTrigger === t.id
                      ? "bg-blue-500/10 border-blue-500 text-foreground shadow-xs"
                      : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  <div className="font-bold text-xs text-foreground flex items-center justify-between">
                    <span>{t.label}</span>
                    {selectedTrigger === t.id && <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: AI BRAIN / PERSONA */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-purple-500/10 text-purple-500 font-black text-xs flex items-center justify-center border border-purple-500/20">
                  2
                </span>
                <h3 className="font-bold text-sm text-foreground">Equip the AI Brain (How does it reason?)</h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Reasoning Engine</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {personas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setBrainPersona(p.id)}
                  className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                    brainPersona === p.id
                      ? "bg-purple-500/10 border-purple-500 text-foreground shadow-xs"
                      : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-foreground flex items-center justify-between">
                      <span>{p.label}</span>
                      {brainPersona === p.id && <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{p.tagline}</p>
                  </div>
                  <span className="text-[9.5px] font-bold text-purple-600 dark:text-purple-400 mt-2 block">
                    {p.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 3: EQUIPPED ACTIONS / TOOLS */}
          <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                  3
                </span>
                <h3 className="font-bold text-sm text-foreground">Equipped Actions (What can it do?)</h3>
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                {selectedActions.length} Actions Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {availableActions.map((action) => {
                const isActive = selectedActions.includes(action.id);
                return (
                  <button
                    key={action.id}
                    onClick={() => toggleAction(action.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500 text-foreground shadow-xs"
                        : "bg-secondary/40 border-border/40 text-muted-foreground hover:bg-secondary/70"
                    }`}
                  >
                    <div className="font-bold text-xs text-foreground flex items-center justify-between">
                      <span>{action.label}</span>
                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Live Simulation Console */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Terminal className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Live Agent Simulator</h3>
                  <span className="text-[10px] text-emerald-500 font-semibold">Ready to Execute</span>
                </div>
              </div>
              <Button
                size="sm"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1 shadow-sm h-8"
              >
                <Play className="h-3 w-3 fill-current" />
                {isSimulating ? "Running..." : "Run Agent"}
              </Button>
            </div>

            {/* Test Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Test Input Question
              </label>
              <textarea
                value={testQuestion}
                onChange={(e) => setTestQuestion(e.target.value)}
                rows={2}
                placeholder="Ask your agent anything..."
                className="w-full rounded-2xl bg-secondary/80 border border-border/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />
            </div>

            {/* Step-by-Step Terminal Execution Logs */}
            <div className="bg-slate-950 text-slate-200 rounded-2xl p-3.5 font-mono text-[11px] space-y-1.5 min-h-[120px] max-h-[160px] overflow-y-auto custom-scrollbar border border-slate-800">
              <span className="text-slate-500 text-[10px] block border-b border-slate-800 pb-1 mb-1">
                -- AGENT EXECUTION PIPELINE LOGS --
              </span>
              {simulationLogs.length === 0 ? (
                <p className="text-slate-500 italic">Click 'Run Agent' above to test trigger, brain reasoning, and tools live...</p>
              ) : (
                simulationLogs.map((log, i) => (
                  <div key={i} className="leading-snug text-emerald-400">
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Agent Live Output */}
            {agentOutput && (
              <div className="bg-secondary/40 border border-purple-500/20 rounded-2xl p-4 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Smile className="h-3.5 w-3.5" /> {agentName}'s Response
                  </span>
                  <span className="text-[10px] text-muted-foreground">Socratic Step-by-Step</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {agentOutput}
                </p>
              </div>
            )}

            {/* EOD Points Reward Banner */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-foreground">Playground Daily Reward</span>
              </div>
              <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full text-[11px]">
                +100 Mikos XP
              </span>
            </div>

          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Agent Playground"
        roleLabel="AI Workflow Architect"
        contextData={`Agent Name: ${agentName}. Persona: ${brainPersona}. Actions: ${selectedActions.join(", ")}`}
        placeholder="Ask how to connect multiple tools, create a game agent, or debug reasoning logic..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
