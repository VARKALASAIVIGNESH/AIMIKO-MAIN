import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import {
  Compass,
  CheckCircle2,
  Circle,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
  Layers,
  ChevronRight,
  Loader2,
  RefreshCw,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Milestone {
  stage: number;
  title: string;
  duration: string;
  description: string;
  topics: string[];
  tasks: { id: string; text: string; done: boolean }[];
}

const defaultMilestones: Milestone[] = [
  {
    stage: 1,
    title: "Core Fundamentals & Terminology",
    duration: "Week 1",
    description: "Master the essential definitions, basic concepts, and prerequisite knowledge.",
    topics: ["Key Definitions", "Basic Principles", "Conceptual Foundations"],
    tasks: [
      { id: "1-1", text: "Read introductory overview & write 3 definitions", done: true },
      { id: "1-2", text: "Complete foundational quiz with 80%+ accuracy", done: true },
      { id: "1-3", text: "Create flashcard revision deck", done: false }
    ]
  },
  {
    stage: 2,
    title: "Mechanisms & Core Relationships",
    duration: "Week 2",
    description: "Connect the dots between moving components, formulas, and structural behavior.",
    topics: ["Cause & Effect Laws", "Standard Formulas", "Step-by-Step Breakdown"],
    tasks: [
      { id: "2-1", text: "Solve 5 practice problems demonstrating core mechanics", done: false },
      { id: "2-2", text: "Explain the main theorem in your own words to AI tutor", done: false }
    ]
  },
  {
    stage: 3,
    title: "Practical Application & Problem Solving",
    duration: "Week 3",
    description: "Apply concepts to real-world exam questions, case studies, and lab scenarios.",
    topics: ["Complex Problem Sets", "Real-World Examples", "Common Pitfalls"],
    tasks: [
      { id: "3-1", text: "Analyze 2 case studies / practical scenarios", done: false },
      { id: "3-2", text: "Review common mistakes and edge cases", done: false }
    ]
  },
  {
    stage: 4,
    title: "Synthesis & Exam Mastery",
    duration: "Week 4",
    description: "Consolidate learning into an executive cheat sheet and test timed recall.",
    topics: ["Comprehensive Review", "Timed Practice", "Synthesis Cheat Sheet"],
    tasks: [
      { id: "4-1", text: "Build 1-page formula & key concepts cheat sheet", done: false },
      { id: "4-2", text: "Score 90%+ on full comprehensive review quiz", done: false }
    ]
  }
];

export function LearningPathsStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();
  const [topic, setTopic] = useState("Introductory Organic Chemistry");
  const [subjectInput, setSubjectInput] = useState("");
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  // Compute overall progress
  const allTasks = milestones.flatMap((m) => m.tasks);
  const completedTasks = allTasks.filter((t) => t.done).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const handleToggleTask = (stageNum: number, taskId: string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.stage === stageNum) {
          return {
            ...m,
            tasks: m.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t))
          };
        }
        return m;
      })
    );
  };

  const handleGenerateRoadmap = async (customSubject?: string) => {
    const targetSubject = (customSubject || subjectInput || topic).trim();
    if (!targetSubject) return;

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI quota reached. Upgrade to Pro for unlimited roadmaps!", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setTopic(targetSubject);

    try {
      const prompt = `Generate a structured 4-stage learning path roadmap for a student learning "${targetSubject}" at a ${level} level.
Return ONLY a valid JSON array of 4 objects matching this structure:
[
  {
    "stage": 1,
    "title": "Short title",
    "duration": "Week 1",
    "description": "1-2 sentence description",
    "topics": ["Topic A", "Topic B", "Topic C"],
    "tasks": [
      { "id": "1-1", "text": "Task description", "done": false },
      { "id": "1-2", "text": "Task description", "done": false }
    ]
  }
]
Do not wrap in markdown quotes or extra text. Pure JSON array only.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an expert curriculum designer. Return valid JSON only."
      );

      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setMilestones(parsed);
        setActiveStage(1);
        setSubjectInput("");
        toast({ description: `Generated learning path for "${targetSubject}"!` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ description: "Failed to generate roadmap. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRoadmapToNotes = () => {
    const noteText = `# Learning Path: ${topic} (${level})\n\n` +
      milestones.map((m) => 
        `## Stage ${m.stage}: ${m.title} (${m.duration})\n${m.description}\n` +
        `**Topics:** ${m.topics.join(", ")}\n` +
        `**Tasks:**\n` + m.tasks.map((t) => `- [${t.done ? "x" : " "}] ${t.text}`).join("\n")
      ).join("\n\n");

    addNote(`Roadmap — ${topic}`, noteText);
    toast({ description: "Saved learning roadmap to Smart Notes!" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* ─── Control Header ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Compass className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground">Learning Paths Studio</h1>
                <p className="text-xs text-muted-foreground">Interactive step-by-step curriculum milestones for any subject.</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={handleSaveRoadmapToNotes}
              variant="outline"
              size="sm"
              className="text-xs rounded-xl"
            >
              <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Save to Notes
            </Button>
            <Button
              onClick={() => setSidekickOpen(!sidekickOpen)}
              size="sm"
              className="text-xs rounded-xl font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
            </Button>
          </div>
        </div>

        {/* Search & Topic Generator */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
          <input
            type="text"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder={`Current: "${topic}" — Type any subject to generate a new roadmap...`}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateRoadmap()}
            className="flex-1 rounded-2xl bg-secondary/60 border border-border/70 px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <div className="flex gap-2">
            <select
              value={level}
              onChange={(e: any) => setLevel(e.target.value)}
              className="rounded-2xl bg-secondary/60 border border-border/70 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <Button
              onClick={() => handleGenerateRoadmap()}
              disabled={isGenerating}
              className="rounded-2xl text-xs font-semibold px-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Path
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-[11px] text-muted-foreground font-medium">Quick Subjects:</span>
          {["AP Calculus AB", "World War II History", "Python Data Structures", "Cell Biology & Genetics"].map((subj) => (
            <button
              key={subj}
              onClick={() => handleGenerateRoadmap(subj)}
              className="px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/60 text-[11px] font-medium text-foreground transition-colors"
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Overall Progress Bar ─── */}
      <div className="bg-card border border-border/70 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Roadmap Completion: {progressPercent}%</p>
            <p className="text-[11px] text-muted-foreground">{completedTasks} of {allTasks.length} study tasks completed</p>
          </div>
        </div>

        <div className="w-full sm:w-64 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ─── Roadmap Visual Tree & Stages ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => {
          const isCurrentActive = activeStage === m.stage;
          const stageCompleted = m.tasks.every((t) => t.done) && m.tasks.length > 0;

          return (
            <div
              key={m.stage}
              className={`rounded-3xl border transition-all duration-200 p-5 space-y-4 ${
                stageCompleted
                  ? "bg-emerald-500/[0.03] border-emerald-500/30"
                  : isCurrentActive
                  ? "bg-card border-primary/40 shadow-sm ring-1 ring-primary/20"
                  : "bg-card border-border/70 hover:border-border"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                    stageCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrentActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}>
                    {stageCompleted ? <Check className="h-4 w-4 text-white" /> : m.stage}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {m.duration}
                    </span>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {m.title}
                    </h3>
                  </div>
                </div>

                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  stageCompleted
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {stageCompleted ? "Completed" : "In Progress"}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {m.description}
              </p>

              {/* Key Topics */}
              <div className="flex flex-wrap gap-1.5">
                {m.topics.map((t) => (
                  <span
                    key={t}
                    className="text-[10.5px] font-medium bg-secondary/80 border border-border/50 text-foreground px-2 py-0.5 rounded-md"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {/* Checkable Tasks */}
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <p className="text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider mb-2">
                  Action Milestones:
                </p>
                {m.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={() => handleToggleTask(m.stage, task.id)}
                      className="accent-primary h-3.5 w-3.5 rounded mt-0.5 cursor-pointer"
                    />
                    <span className={`flex-1 leading-snug ${task.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded AI Study Tutor Sidekick */}
      <StudentAiSidekick
        toolName="Learning Paths Studio"
        contextData={`Active subject: ${topic} (${level}). Stages: ${milestones.map((m) => m.title).join(", ")}`}
        placeholder="Ask AI tutor to explain any milestone or provide study materials..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />

    </div>
  );
}
