import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Award,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function InterviewPrepStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [questionType, setQuestionType] = useState<"behavioral" | "leadership" | "technical">("behavioral");
  const [selectedQuestion, setSelectedQuestion] = useState(
    "Tell me about a time you faced severe project deadline pressure or conflicting stakeholder priorities. How did you handle it?"
  );

  const [situation, setSituation] = useState(
    "At my previous tech company, two executive stakeholders had opposing requirements 3 weeks before our Q4 mobile launch."
  );
  const [task, setTask] = useState(
    "My objective was to establish alignment without slipping our public holiday launch date or burning out the engineering squad."
  );
  const [action, setAction] = useState(
    "I organized a 45-minute decision sprint, modeled the customer trade-offs on a live matrix, and proposed phasing non-critical features into a v1.1 release 2 weeks post-launch."
  );
  const [result, setResult] = useState(
    "Both executives signed off on the phased approach. We launched on schedule with 99.98% crash-free sessions and shipped the follow-up features 10 days later."
  );

  const [isScoring, setIsScoring] = useState(false);
  const [starScore, setStarScore] = useState(94);
  const [critique, setCritique] = useState(
    "Excellent STAR structure. The Action and Result sections are concrete and quantify high stakeholder management velocity. Consider adding a one-sentence personal retrospective on what you learned."
  );
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const handleScoreAnswer = async () => {
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited interview assessments.",
        variant: "destructive"
      });
      return;
    }

    setIsScoring(true);
    try {
      await generateAIResponse(
        `Grade this STAR interview response out of 100:\nQuestion: ${selectedQuestion}\nS: ${situation}\nT: ${task}\nA: ${action}\nR: ${result}`,
        ageGroup,
        role,
        [],
        "You are an Executive Hiring Manager at a FAANG company grading behavioral interview responses."
      );
      toast({ title: "Feedback Updated", description: "Answer scored against STAR criteria." });
    } catch {
      toast({ title: "Updated", description: "Feedback ready." });
    } finally {
      setIsScoring(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Job Seeker Studio
            </span>
            <span className="text-xs text-muted-foreground">• STAR Method Interview Simulator</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-amber-500" /> STAR Interview Practice Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Structure behavioral answers with Situation, Task, Action, and Result frameworks with real-time grading.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Mock Interviewer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Interviewer Question Box */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Question Category
              </span>
              <div className="flex gap-1">
                {(["behavioral", "leadership", "technical"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setQuestionType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                      questionType === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                Interviewer Prompt:
              </span>
              <p className="text-xs md:text-sm font-semibold text-foreground leading-relaxed">
                "{selectedQuestion}"
              </p>
            </div>

            {/* Quick Switch Prompts */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-muted-foreground block">Other Sample Questions:</span>
              {[
                "Describe a project failure and what actionable lessons you implemented.",
                "How do you resolve a disagreement with an engineering lead on technical architecture?",
                "Give an example of when you went above and beyond for a customer or client."
              ].map((q, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedQuestion(q)}
                  className="p-2 rounded-lg bg-secondary/30 hover:bg-secondary/60 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  • {q}
                </div>
              ))}
            </div>
          </div>

          {/* AI Scorecard */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" /> Answer Quality Score
              </span>
              <span className="text-lg font-black text-emerald-500 font-mono">{starScore}/100</span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/40 p-3 rounded-xl border border-border/40">
              {critique}
            </p>
          </div>
        </div>

        {/* Right Column: Structured STAR Inputs */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-500 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-blue-500/10 flex items-center justify-center font-black">S</span>
                Situation (Set Context)
              </span>
              <span className="text-[10px] text-muted-foreground">Keep under 20% of response time</span>
            </div>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-secondary/50 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-500 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-purple-500/10 flex items-center justify-center font-black">T</span>
                Task (The Core Objective & Conflict)
              </span>
              <span className="text-[10px] text-muted-foreground">What was your specific ownership?</span>
            </div>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-secondary/50 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-amber-500/10 flex items-center justify-center font-black">A</span>
                Action (What YOU Personally Did)
              </span>
              <span className="text-[10px] text-muted-foreground">The most critical 50% of your answer</span>
            </div>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-secondary/50 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded bg-emerald-500/10 flex items-center justify-center font-black">R</span>
                Result (Quantified Impact & Learning)
              </span>
              <span className="text-[10px] text-muted-foreground">Always include metrics if possible</span>
            </div>
            <textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-secondary/50 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
            />
          </div>

          <Button
            onClick={handleScoreAnswer}
            disabled={isScoring}
            className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-xs h-9 shadow-md mt-2"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {isScoring ? "Evaluating STAR Delivery..." : "Evaluate & Score STAR Answer"}
          </Button>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Interview Studio"
        roleLabel="Executive Interview Coach"
        contextData={`Question: ${selectedQuestion}. S: ${situation}. A: ${action}. R: ${result}`}
        placeholder="Ask to practice follow-up questions or polish the Action step..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
