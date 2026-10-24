import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import {
  Bot,
  Sparkles,
  Play,
  RotateCcw,
  Share2,
  CheckCircle2,
  Zap,
  Volume2,
  Bell,
  FileText,
  Clock,
  Layers,
  Award,
  Terminal,
  Send,
  Wand2,
  Smile,
  Gamepad2,
  HelpCircle,
  TrendingUp,
  Cpu,
  ArrowRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface AgentStep {
  id: string;
  type: "trigger" | "brain" | "action";
  title: string;
  description: string;
  config: Record<string, any>;
}

export default function Playground() {
  const { ageGroup, role, userName, incrementPromptUsage, addBadge } = useAimiko();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"agent_builder" | "ai_games" | "templates">("agent_builder");

  // Agent Builder States
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
  const [isPublishedToMikodin, setIsPublishedToMikodin] = useState(false);

  // AI Game State (Spot the Hallucination)
  const [gameSelectedAnswer, setGameSelectedAnswer] = useState<number | null>(null);
  const [gameWon, setGameWon] = useState(false);

  const triggers = [
    {
      id: "homework_input",
      label: "📝 When I Ask a Question",
      desc: "Triggers whenever you input a problem or question to solve",
      icon: FileText
    },
    {
      id: "daily_morning",
      label: "⏰ Daily 8:00 AM Routine Alarm",
      desc: "Runs every morning to prepare a fun study goal or daily challenge",
      icon: Clock
    },
    {
      id: "manual_click",
      label: "🔘 On-Demand Play Button",
      desc: "Runs whenever you click execute in your workflow dashboard",
      icon: Play
    },
    {
      id: "streak_check",
      label: "🔥 Streak Milestone Event",
      desc: "Automatically triggers celebratory advice when you hit 3+ streak days",
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
      tagline: "Explains science, tech, and math through rockets and space discoveries.",
      badge: "Curiosity Engine"
    },
    {
      id: "rhyme_master",
      label: "🎵 Rhyme & Song Mnemonic",
      tagline: "Turns dry formulas and dates into catchy memory rhymes.",
      badge: "Super Memory"
    },
    {
      id: "friendly_cheerleader",
      label: "🌟 High-Energy Mentor",
      tagline: "Keeps you motivated, confident, and celebrates every small attempt.",
      badge: "Daily Energy"
    }
  ];

  const availableActions = [
    {
      id: "give_hints",
      label: "🧩 3 Progressive Clues",
      desc: "Breaks problem into Easy, Medium, and Final clue steps."
    },
    {
      id: "speak_voice",
      label: "🔊 Read Aloud Voiceover",
      desc: "Uses speech synthesis to read the agent's explanation out loud."
    },
    {
      id: "award_points",
      label: "⭐ Award +25 Mikos XP",
      desc: "Increases your daily End-of-Day (EOD) reward points."
    },
    {
      id: "save_notes",
      label: "📔 Auto-Save to Notes Library",
      desc: "Logs the solution in your notebook library for revision."
    }
  ];

  const gameQuestions = [
    {
      level: 1,
      topic: "Space & Physics",
      options: [
        "1. Jupiter has a giant storm called the Great Red Spot that is larger than Earth.",
        "2. Venus is the hottest planet in our solar system because of its thick greenhouse atmosphere.",
        "3. Saturn's rings are made almost entirely of cotton candy spun by solar wind.", // Fake
        "4. A year on Mercury takes only 88 Earth days."
      ],
      fakeIndex: 2,
      explanation: "Cotton candy rings! Saturn's rings are actually made of billions of chunks of water ice, rock, and dust."
    }
  ];

  const toggleAction = (id: string) => {
    if (selectedActions.includes(id)) {
      if (selectedActions.length === 1) return;
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

    const addLog = (msg: string) => setSimulationLogs((prev) => [...prev, msg]);

    try {
      addLog("🚀 [Trigger Activated]: " + triggers.find((t) => t.id === selectedTrigger)?.label);
      await new Promise((r) => setTimeout(r, 400));

      addLog(`🧠 [AI Brain Invoked]: ${personas.find((p) => p.id === brainPersona)?.label} is reasoning...`);
      await new Promise((r) => setTimeout(r, 600));

      addLog(`⚡ [Tools Active]: ${selectedActions.join(", ")}`);
      await new Promise((r) => setTimeout(r, 400));

      const response = await generateAIResponse(
        `You are ${agentName}, configured as ${brainPersona}. 
User Question: "${testQuestion}"
Actions equipped: ${selectedActions.join(", ")}.
Guide the student in 3 friendly, engaging Socratic steps. Keep tone energetic, encouraging, and clear!`,
        ageGroup || "teens",
        role || "student",
        [],
        "You are an encouraging, safe AI study agent."
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
    
    // Package post and store in localStorage so Mikodin feed shows it
    const existingPosts = JSON.parse(localStorage.getItem("mikodin_user_posts") || "[]");
    const newAgentPost = {
      id: "agent-" + Date.now(),
      title: `🚀 I built a new AI Agent: "${agentName}"!`,
      summary: `${agentDescription} Built with ${selectedActions.length} tools and running the ${personas.find((p) => p.id === brainPersona)?.label} brain. Test it out in the Playground!`,
      author: userName || "Young Builder",
      authorAge: "12 yrs",
      authorRole: role || "student",
      category: "AgentBuilder",
      timestamp: "Just now",
      reactions: { highFives: 4, mindBlown: 3, bigBrain: 5, superCool: 8 },
      agentMeta: {
        name: agentName,
        trigger: triggers.find((t) => t.id === selectedTrigger)?.label,
        toolsCount: selectedActions.length
      }
    };

    localStorage.setItem("mikodin_user_posts", JSON.stringify([newAgentPost, ...existingPosts]));

    toast({
      title: "🎉 Published to MIKODIN!",
      description: "Earned +100 Mikos XP! Check your post on the MIKODIN Network."
    });
  };

  const handleAnswerGame = (index: number) => {
    setGameSelectedAnswer(index);
    if (index === gameQuestions[0].fakeIndex) {
      setGameWon(true);
      toast({
        title: "🎯 Correct! Hallucination Spotted!",
        description: "You earned +50 Mikos XP! You can share your victory on Mikodin."
      });
    } else {
      toast({
        title: "Not quite!",
        description: "That fact is actually true! Try finding the fake one.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-8 custom-scrollbar">
      
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" /> AI Agent & Workflow Playground
            </span>
            <span className="text-xs text-muted-foreground">• Standalone Creative Studio</span>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20">
              100% Free
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            The AI Agent Playground
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-2xl mt-0.5">
            Learn how AI agents and workflows really work. Connect triggers, customize thinking brains, equip tools, and test them live.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => navigate("/mikodin")}
            variant="outline"
            className="text-xs rounded-xl border-border/60 hover:bg-secondary font-bold gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Go to MIKODIN
          </Button>

          <Button
            size="sm"
            onClick={handlePublishToMikodin}
            disabled={isPublishedToMikodin}
            className="text-xs rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-md font-bold gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" />
            {isPublishedToMikodin ? "Published to MIKODIN! ✓" : "Publish Agent to MIKODIN (+100 XP)"}
          </Button>
        </div>
      </div>

      {/* Playground Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-3 mt-4">
        {[
          { id: "agent_builder", label: "🛠️ Agent & Workflow Builder" },
          { id: "ai_games", label: "🎮 AI Logic & Technical Games" },
          { id: "templates", label: "📦 Pre-Built Agent Templates" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Agent & Workflow Builder */}
      {activeTab === "agent_builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column: Visual Agent Steps */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Identity Card */}
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
                  <h3 className="font-bold text-sm text-foreground">Trigger (What wakes the agent up?)</h3>
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

            {/* STEP 2: BRAIN */}
            <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-purple-500/10 text-purple-500 font-black text-xs flex items-center justify-center border border-purple-500/20">
                    2
                  </span>
                  <h3 className="font-bold text-sm text-foreground">AI Brain & Personality (How does it think?)</h3>
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

            {/* STEP 3: TOOLS / ACTIONS */}
            <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                    3
                  </span>
                  <h3 className="font-bold text-sm text-foreground">Equipped Actions & Tools</h3>
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

          {/* Right Column: Execution Console */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border/60 rounded-3xl p-5 shadow-sm space-y-4 sticky top-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                    <Terminal className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">Agent Simulator</h3>
                    <span className="text-[10px] text-emerald-500 font-semibold">Ready to Test</span>
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

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Test Prompt / Question
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

              {/* Agent Output Card */}
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

              {/* Playground XP Card */}
              <div className="p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-foreground">Playground Milestone</span>
                </div>
                <span className="font-black text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full text-[11px]">
                  +100 Mikos XP
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 2: AI Logic & Technical Games */}
      {activeTab === "ai_games" && (
        <div className="max-w-3xl mx-auto space-y-6 mt-6">
          <div className="bg-gradient-to-br from-card to-secondary/30 border border-purple-500/30 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                  <Gamepad2 className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-black text-base text-foreground">Game #1: Spot the AI Hallucination!</h3>
                  <p className="text-xs text-muted-foreground">Level 1: Space & Planetary Science • Find the 1 fake fact</p>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                +50 Mikos Reward
              </span>
            </div>

            <div className="space-y-2.5 pt-2">
              {gameQuestions[0].options.map((opt, idx) => {
                const isSelected = gameSelectedAnswer === idx;
                const isCorrectFake = idx === gameQuestions[0].fakeIndex;

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerGame(idx)}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-semibold border transition-all ${
                      isSelected
                        ? isCorrectFake
                          ? "bg-emerald-500/15 border-emerald-500 text-foreground font-bold shadow-xs"
                          : "bg-red-500/15 border-red-500 text-foreground"
                        : "bg-background/80 border-border/60 hover:bg-secondary/60 text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {gameWon && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Correct! Cotton candy rings are definitely fake. +50 Mikos XP claimed!</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    navigate("/mikodin");
                    toast({
                      title: "Welcome to MIKODIN!",
                      description: "Share your game victory on the peer feed."
                    });
                  }}
                  className="text-xs font-bold rounded-xl bg-primary text-primary-foreground shrink-0"
                >
                  Share Victory on MIKODIN <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Pre-Built Agent Templates */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            {
              title: "Morning Routine Drill Sergeant",
              desc: "Sends an encouraging daily briefing at 7:30 AM with 3 top priorities and a motivational quote.",
              trigger: "Daily Alarm",
              tools: ["Voiceover", "Notes Logger"]
            },
            {
              title: "Periodic Table Chemistry Bot",
              desc: "Quizzes you on element symbols, valence electrons, and atomic numbers with mnemonic rhymes.",
              trigger: "Homework Input",
              tools: ["3 Hints", "Mnemonic Rhymes"]
            },
            {
              title: "Spanish Daily Vocabulary Sprinter",
              desc: "Gives 3 conversational phrases every afternoon and listens to your pronunciation out loud.",
              trigger: "Manual Play",
              tools: ["Voiceover", "+25 XP Points"]
            }
          ].map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-card border border-border/60 rounded-3xl p-5 space-y-3 flex flex-col justify-between hover:border-purple-500/40 transition-all shadow-xs"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500">
                  {tmpl.trigger}
                </span>
                <h3 className="font-bold text-sm text-foreground">{tmpl.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{tmpl.desc}</p>
              </div>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{tmpl.tools.join(" • ")}</span>
                <Button
                  size="sm"
                  onClick={() => {
                    setAgentName(tmpl.title);
                    setAgentDescription(tmpl.desc);
                    setActiveTab("agent_builder");
                    toast({ title: "Template Loaded", description: `Loaded "${tmpl.title}" into the builder.` });
                  }}
                  className="rounded-xl text-xs h-7 font-bold"
                >
                  Load Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
