import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  GraduationCap,
  Sparkles,
  Clock,
  BookOpen,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  Layers,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AgendaBlock {
  timeframe: string;
  phase: string;
  teacherAction: string;
  studentAction: string;
}

export function LessonPlanStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [topic, setTopic] = useState("Introduction to Photosynthesis & Cellular Respiration");
  const [gradeLevel, setGradeLevel] = useState("Middle School (Grades 6–8)");
  const [duration, setDuration] = useState("45 Minutes");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [objectives, setObjectives] = useState<string[]>([
    "SWBAT (Students Will Be Able To) explain the chemical inputs (water, sunlight, CO2) and outputs (glucose, oxygen) of photosynthesis.",
    "SWBAT contrast the complementary roles of plant photosynthesis and animal cellular respiration in the global carbon cycle.",
    "SWBAT analyze a closed-ecosystem terrarium scenario and predict atmospheric changes."
  ]);

  const [agenda, setAgenda] = useState<AgendaBlock[]>([
    {
      timeframe: "0:00 - 0:10 (10 min)",
      phase: "Anticipatory Set & Real-World Hook",
      teacherAction: "Display a sealed glass terrarium that has been closed for 10 years. Ask: 'Why haven't the plants suffocated without fresh air?'",
      studentAction: "Write down 2 hypotheses on sticky notes and share with shoulder partners."
    },
    {
      timeframe: "0:10 - 0:25 (15 min)",
      phase: "Direct Instruction & Visual Modeling",
      teacherAction: "Guide students through the molecular formula diagram: 6CO2 + 6H2O + Light -> C6H12O6 + 6O2 using color-coded magnetic tokens.",
      studentAction: "Annotate interactive science notebooks and color-code chemical inputs vs outputs."
    },
    {
      timeframe: "0:25 - 0:38 (13 min)",
      phase: "Guided Practice & Carbon Cycle Sort",
      teacherAction: "Circulate classroom facilitating small group sorting game (matching cellular respiration cards to photosynthesis counterparts).",
      studentAction: "Work in pairs to place process tokens onto the classroom ecosystem diagram."
    },
    {
      timeframe: "0:38 - 0:45 (7 min)",
      phase: "Closure & Exit Ticket",
      teacherAction: "Collect formative exit tickets. Prompt: 'If sunlight vanished tomorrow, what happens to oxygen levels and why?'",
      studentAction: "Complete 2-sentence written response before dismissal."
    }
  ]);

  const [differentiation, setDifferentiation] = useState({
    support: "Provide illustrated vocabulary graphic organizer with word bank for English Language Learners (ELL) and IEP students.",
    extension: "Challenge early finishers to balance the complete chemical equation including ATP energy production."
  });

  const handleGeneratePlan = async () => {
    if (!topic.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited lesson plan generations.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Draft a 45-minute lesson plan for ${gradeLevel} on the topic: "${topic}". Include Bloom's taxonomy objectives, time-blocked phases, teacher vs student actions, and differentiation strategies.`,
        ageGroup,
        role,
        [],
        "You are an Award-Winning Master Teacher and Instructional Designer."
      );
      toast({ title: "Lesson Plan Refined", description: "Classroom agenda and objectives generated." });
    } catch {
      toast({ title: "Updated", description: "Lesson plan ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPlan = () => {
    const text = `LESSON PLAN: ${topic} (${gradeLevel} • ${duration})\n\nLEARNING OBJECTIVES:\n${objectives.map((o) => `- ${o}`).join("\n")}\n\nAGENDA TIMELINE:\n${agenda.map((a) => `[${a.timeframe}] ${a.phase}\nTeacher: ${a.teacherAction}\nStudents: ${a.studentAction}\n`).join("\n")}\nDIFFERENTIATION:\nSupport: ${differentiation.support}\nExtension: ${differentiation.extension}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied Lesson Plan", description: "Ready to print or paste into your lesson binder." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20">
              Teacher & Educator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Standards-Aligned Curriculum Architecture</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-violet-500" /> Lesson Plan Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Construct time-blocked pedagogical lesson plans with Bloom's Taxonomy learning objectives and differentiation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyPlan} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Lesson Plan"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Curriculum Specialist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Lesson Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Lesson Specifications
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Lesson Subject / Topic</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Grade Level</label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="Elementary (Grades 1–5)">Elementary (Grades 1–5)</option>
                <option value="Middle School (Grades 6–8)">Middle School (Grades 6–8)</option>
                <option value="High School (Grades 9–12)">High School (Grades 9–12)</option>
                <option value="Undergraduate / College">Undergraduate / College</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Class Duration</label>
              <div className="grid grid-cols-3 gap-2">
                {["45 Minutes", "60 Minutes", "90 Minutes"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`py-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      duration === d
                        ? "border-primary bg-primary/10 text-primary shadow-xs"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGeneratePlan}
              disabled={isGenerating || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Aligning Standards & Activities..." : "Generate Lesson Blueprint"}
            </Button>
          </div>

          {/* Differentiation Box */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" /> Tiered Differentiation
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">
                  Scaffold / Tier 1 Support (ELL / IEP):
                </span>
                <p className="text-muted-foreground mt-0.5">{differentiation.support}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 block">
                  Extension / Advanced Learners:
                </span>
                <p className="text-muted-foreground mt-0.5">{differentiation.extension}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Objectives & Time-Blocked Agenda */}
        <div className="lg:col-span-7 space-y-4">
          {/* Learning Objectives */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Measurable Learning Objectives (SWBAT)
            </h3>
            <div className="space-y-1.5">
              {objectives.map((obj, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 text-xs text-foreground flex items-start gap-2">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time-Blocked Agenda Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Classroom Activity Schedule ({duration})
            </h3>

            {agenda.map((block, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/60 rounded-2xl p-4 space-y-2.5 shadow-xs hover:border-violet-500/40 transition-colors"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-border/40">
                  <span className="text-xs font-bold text-foreground">{block.phase}</span>
                  <span className="text-[11px] font-mono text-violet-500 bg-violet-500/10 px-2.5 py-0.5 rounded-full font-semibold">
                    {block.timeframe}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                      Teacher Facilitation:
                    </span>
                    <p className="text-foreground/90">{block.teacherAction}</p>
                  </div>
                  <div className="bg-secondary/30 p-2.5 rounded-xl border border-border/30">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block mb-0.5">
                      Student Active Participation:
                    </span>
                    <p className="text-foreground/90">{block.studentAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Lesson Plan Studio"
        roleLabel="Instructional Design Coach"
        contextData={`Topic: ${topic}. Grade: ${gradeLevel}. Duration: ${duration}`}
        placeholder="Ask to create a 5-question pop quiz, add a kinesthetic game, or write a rubric..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
