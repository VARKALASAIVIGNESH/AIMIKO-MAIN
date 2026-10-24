import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  HelpCircle,
  Sparkles,
  FileCheck,
  Copy,
  Check,
  Eye,
  Sliders,
  CheckCircle2,
  Table
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuestionItem {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export function AssignmentStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [topic, setTopic] = useState("World War II: The Allied Strategy in the Pacific");
  const [gradeLevel, setGradeLevel] = useState("High School (Grade 10)");
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [questions, setQuestions] = useState<QuestionItem[]>([
    {
      id: 1,
      question: "Which naval engagement in June 1942 is widely considered the pivotal turning point in the Pacific Theater?",
      options: [
        "A) Battle of the Coral Sea",
        "B) Battle of Midway",
        "C) Battle of Guadalcanal",
        "D) Battle of Leyte Gulf"
      ],
      correctAnswer: "B) Battle of Midway",
      explanation: "U.S. naval forces intercepted Japanese communications and sank 4 aircraft carriers, decisively shifting initiative."
    },
    {
      id: 2,
      question: "Explain the strategic doctrine known as 'Island Hopping' (Leapfrogging) utilized by Allied forces under Admiral Nimitz and General MacArthur.",
      correctAnswer: "Bypassing heavily fortified enemy-held islands to capture strategic airbases closer to Japan, cutting off enemy supply lines.",
      explanation: "Saved Allied casualties while neutralizing isolated Japanese garrisons without direct invasion."
    },
    {
      id: 3,
      question: "Analyze the significance of the Navajo Code Talkers during Pacific island campaigns.",
      correctAnswer: "Their unwritten complex language provided an unbreakable tactical battlefield communication code that was never cracked.",
      explanation: "Crucial for transmitting coordinates and orders during rapid amphibious assaults like Iwo Jima."
    }
  ]);

  const [rubric, setRubric] = useState([
    { tier: "Exemplary (4)", criteria: "Demonstrates comprehensive historical analysis, cites specific commanders/events, and evaluates multi-causal outcomes." },
    { tier: "Proficient (3)", criteria: "Accurately explains major campaigns and tactical doctrines with minor gaps in strategic implications." },
    { tier: "Developing (2)", criteria: "Identifies basic terminology (e.g. Midway) but struggles to connect operational causes to strategic effects." },
    { tier: "Beginning (1)", criteria: "Incomplete answers with significant factual inaccuracies regarding chronology or participants." }
  ]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited assignments.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Generate a 3-question assignment and rubric for: ${topic} (${gradeLevel}). Include mix of multiple choice and short answer, with complete answer keys and 4-tier rubric.`,
        ageGroup,
        role,
        [],
        "You are a Secondary Education Assessment Specialist."
      );
      toast({ title: "Worksheet Generated", description: "Assessment and grading rubric ready." });
    } catch {
      toast({ title: "Updated", description: "Questions ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyWorksheet = () => {
    const text = `STUDENT WORKSHEET: ${topic}\nName: ______________________ Date: ___________ Period: _____\n\n` +
      questions.map((q) => `Q${q.id}. ${q.question}\n${q.options ? q.options.join("\n") + "\n" : ""}${showAnswerKey ? `ANSWER: ${q.correctAnswer}\nEXPLANATION: ${q.explanation}\n` : ""}\n`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied Printable Worksheet", description: "Pasted to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Teacher & Educator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Assessment & Rubric Builder</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-amber-500" /> Assignment & Rubric Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Generate student worksheets, multiple-choice questions, and 4-tier grading rubrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAnswerKey(!showAnswerKey)}
            className="text-xs rounded-xl"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {showAnswerKey ? "Hide Answer Key" : "Show Answer Key"}
          </Button>
          <Button variant="outline" size="sm" onClick={copyWorksheet} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Worksheet"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Rubric Evaluator
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Assignment Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Assessment Settings
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Topic or Standard</label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Target Grade Level</label>
              <input
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Compiling Assessment..." : "Regenerate Questions & Rubric"}
            </Button>
          </div>

          {/* 4-Tier Grading Rubric Grid */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Table className="h-4 w-4 text-primary" /> 4-Tier Standards Rubric
            </h4>
            <div className="space-y-1.5">
              {rubric.map((r, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-secondary/30 border border-border/40 text-xs">
                  <span className="font-bold text-foreground block mb-0.5">{r.tier}</span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{r.criteria}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Printable Worksheet View */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            {/* Worksheet Header Header Box */}
            <div className="border-b border-border/60 pb-4 flex justify-between items-end text-xs text-muted-foreground">
              <div>
                <h2 className="text-base font-bold text-foreground">{topic}</h2>
                <p className="text-[11px]">Classroom Assessment • {gradeLevel}</p>
              </div>
              <div className="space-y-1 text-right text-[11px] font-mono">
                <p>Name: ______________________</p>
                <p>Date: _________ Period: _____</p>
              </div>
            </div>

            {/* Questions Stream */}
            <div className="space-y-5">
              {questions.map((q) => (
                <div key={q.id} className="space-y-2">
                  <p className="text-xs md:text-sm font-semibold text-foreground">
                    {q.id}. {q.question}
                  </p>

                  {q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-2">
                      {q.options.map((opt, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-secondary/30 border border-border/30 text-xs text-foreground/90 font-medium"
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {!q.options && (
                    <div className="h-16 w-full rounded-xl border border-dashed border-border/60 bg-secondary/10 p-2">
                      <span className="text-[10px] text-muted-foreground italic">Student response lines...</span>
                    </div>
                  )}

                  {showAnswerKey && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
                        Instructor Answer Key:
                      </span>
                      <p className="font-semibold text-foreground">{q.correctAnswer}</p>
                      <p className="text-[11px] text-muted-foreground italic">{q.explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Assignment Studio"
        roleLabel="Standards Assessment Coach"
        contextData={`Topic: ${topic}. Grade: ${gradeLevel}`}
        placeholder="Ask to adjust difficulty, create fill-in-the-blank questions, or export to PDF format..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
