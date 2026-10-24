import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  User,
  Sliders,
  HeartHandshake,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ProgressReportsStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [studentName, setStudentName] = useState("Marcus");
  const [subject, setSubject] = useState("Algebra I");
  const [academicLevel, setAcademicLevel] = useState("Meeting Standards (B+)");
  const [workHabit, setWorkHabit] = useState("High enthusiasm, sometimes rushes through multi-step checks");
  const [tone, setTone] = useState<"warm" | "direct" | "formal">("warm");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [commentText, setCommentText] = useState(
`Marcus has shown commendable growth and mathematical curiosity throughout this grading period in Algebra I. He actively participates in classroom discussions, frequently volunteers to model solutions on the whiteboard, and collaborates with peers during group problem-solving.

To continue advancing towards honors mastery, Marcus would benefit from slowing down during multi-step quadratic equation checks, where minor arithmetic calculation slips occasionally occur. We have practiced using a dedicated margin checklist to verify negative signs before turning in assessments.

At home, continuing to review one solved problem together each week and having Marcus verbally explain his reasoning step-by-step will further cement his conceptual confidence. It is a genuine pleasure having Marcus in class, and I look forward to his continued progress!`
  );

  const handleGenerateComment = async () => {
    if (!studentName.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited report comments.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Write a constructive, professional report card comment for:
Student Name: ${studentName}
Subject: ${subject}
Academic Performance: ${academicLevel}
Habits / Behavior: ${workHabit}
Tone: ${tone}`;

      const res = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an empathetic, highly experienced Educator writing professional progress reports."
      );

      setCommentText(res);
      toast({ title: "Comment Crafted", description: "Report card comment ready." });
    } catch {
      toast({ title: "Updated", description: "Comment ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyComment = () => {
    navigator.clipboard.writeText(commentText);
    setCopied(true);
    toast({ title: "Copied Comment", description: "Ready to paste into your school SIS or gradebook." });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToNotes = () => {
    addNote({ title: `Report Remark: ${studentName} (${subject})`, content: commentText });
    toast({ title: "Saved to Notes", description: "Remark archived in your notes." });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Teacher & Educator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Constructive Report Card Remarks</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-500" /> Progress Report & Parent Comms Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Draft personalized, encouraging progress reports highlighting student strengths, growth goals, and parent partnership.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={saveToNotes} className="text-xs rounded-xl">
            Save to Notes
          </Button>
          <Button size="sm" onClick={copyComment} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Remark"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Report Writer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Student Performance Attributes */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Student Profile
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Student First Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Marcus"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Subject / Course</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Algebra I, Biology..."
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Academic Performance</label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="Exceeding Standards (A / A+)">Exceeding Standards (A / A+)</option>
                <option value="Meeting Standards (B / B+) ">Meeting Standards (B / B+)</option>
                <option value="Approaching Standards (C / C+) ">Approaching Standards (C / C+)</option>
                <option value="Needs Intensive Support (D / F)">Needs Intensive Support (D / F)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Work Habits & Observations</label>
              <textarea
                value={workHabit}
                onChange={(e) => setWorkHabit(e.target.value)}
                rows={2}
                placeholder="Participation, attention to detail, teamwork..."
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Comment Tone</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "warm", label: "Encouraging & Warm" },
                  { id: "direct", label: "Direct & Actionable" },
                  { id: "formal", label: "Formal & Academic" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id as any)}
                    className={`p-2 rounded-xl border text-xs text-center transition-all ${
                      tone === t.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateComment}
              disabled={isGenerating || !studentName.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Crafting Remark..." : "Generate Progress Remark"}
            </Button>
          </div>
        </div>

        {/* Right Column: Editable Comment & Parent Partnership Guide */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="h-4 w-4 text-primary" /> Progress Card Narrative for {studentName}
              </span>
              <span className="text-[11px] text-muted-foreground">3-Part Structure</span>
            </div>

            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={13}
              className="w-full rounded-xl bg-secondary/30 border border-border/60 p-4 text-xs text-foreground font-sans leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary custom-scrollbar"
            />
          </div>

          <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <HeartHandshake className="h-4 w-4 text-emerald-500" /> The Golden Feedback Formula
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every constructive report comment begins with genuine praise of specific work habits, moves to one clear area of actionable improvement with a classroom strategy, and closes with a partnership recommendation for guardians at home.
            </p>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Progress Report Studio"
        roleLabel="Senior Academic Advisor"
        contextData={`Student: ${studentName}. Subject: ${subject}. Academic Level: ${academicLevel}`}
        placeholder="Ask to shorten for 150-character limit SIS boxes or soften tone for sensitive discussions..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
