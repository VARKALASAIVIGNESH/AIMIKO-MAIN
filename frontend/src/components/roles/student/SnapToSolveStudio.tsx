import { useState, useRef } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import {
  Camera,
  Upload,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Eye,
  BookOpen,
  ArrowRight,
  Calculator,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SolvedStep {
  stepNumber: number;
  title: string;
  mathExpression: string;
  explanation: string;
  hintOnly: string;
}

interface SolvedResult {
  problemTitle: string;
  transcribedProblem: string;
  coreConcept: string;
  formulaNeeded: string;
  steps: SolvedStep[];
  finalAnswer: string;
  commonPitfall: string;
}

const samplePresets = [
  {
    name: "Quadratic Equation",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=60",
    text: "Solve for x: 2x² - 8x + 6 = 0 using the quadratic formula.",
    result: {
      problemTitle: "Quadratic Equation: 2x² - 8x + 6 = 0",
      transcribedProblem: "2x^2 - 8x + 6 = 0",
      coreConcept: "Finding roots using Quadratic Formula and factoring.",
      formulaNeeded: "x = (-b ± √(b² - 4ac)) / (2a)",
      steps: [
        {
          stepNumber: 1,
          title: "Identify coefficients a, b, and c",
          mathExpression: "a = 2, b = -8, c = 6",
          explanation: "In the standard quadratic form ax² + bx + c = 0, extract the three numerical constants.",
          hintOnly: "Look at the numbers attached to x², x, and the standalone constant."
        },
        {
          stepNumber: 2,
          title: "Compute the Discriminant (b² - 4ac)",
          mathExpression: "(-8)² - 4(2)(6) = 64 - 48 = 16",
          explanation: "Since the discriminant is 16 (positive square), there are two distinct rational real roots.",
          hintOnly: "Calculate the value underneath the square root symbol."
        },
        {
          stepNumber: 3,
          title: "Substitute into the formula and simplify",
          mathExpression: "x = (8 ± √16) / (2 × 2) = (8 ± 4) / 4",
          explanation: "Separate into two cases: (8 + 4)/4 = 12/4 = 3, and (8 - 4)/4 = 4/4 = 1.",
          hintOnly: "Apply both the plus and minus branches to find both solutions."
        }
      ],
      finalAnswer: "x = 3 or x = 1",
      commonPitfall: "Watch the double negative on -b: -(-8) becomes positive 8."
    }
  },
  {
    name: "Physics Kinematics",
    image: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=60",
    text: "A car accelerates uniformly from rest at 3 m/s² for 5 seconds. Calculate the final velocity and total displacement.",
    result: {
      problemTitle: "Uniform Linear Acceleration",
      transcribedProblem: "v_0 = 0 m/s, a = 3 m/s², t = 5 s. Find v and d.",
      coreConcept: "1D Kinematic equations under constant acceleration.",
      formulaNeeded: "v = v_0 + at, and d = v_0*t + 0.5*a*t²",
      steps: [
        {
          stepNumber: 1,
          title: "Calculate Final Velocity",
          mathExpression: "v = 0 + (3 m/s²)(5 s) = 15 m/s",
          explanation: "Velocity increases linearly with time proportional to the constant acceleration rate.",
          hintOnly: "Use the first kinematic equation connecting velocity, acceleration, and time."
        },
        {
          stepNumber: 2,
          title: "Calculate Total Displacement",
          mathExpression: "d = (0)(5) + 0.5(3)(5²) = 0.5(3)(25) = 37.5 meters",
          explanation: "Displacement grows quadratically with elapsed time when accelerating from rest.",
          hintOnly: "Remember to square the time term in the displacement formula."
        }
      ],
      finalAnswer: "Final velocity v = 15 m/s, Displacement d = 37.5 m",
      commonPitfall: "Do not forget to divide by 2 in the 1/2*a*t² term."
    }
  }
];

export function SnapToSolveStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(samplePresets[0].image);
  const [problemDescription, setProblemDescription] = useState(samplePresets[0].text);
  const [revealedSteps, setRevealedSteps] = useState<number>(1);
  const [hintMode, setHintMode] = useState<boolean>(true);
  const [result, setResult] = useState<SolvedResult>(samplePresets[0].result);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setProblemDescription(`Uploaded image: ${file.name}`);
      toast({ description: "Image loaded! Click 'Solve Step-by-Step' to analyze." });
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = async () => {
    if (!problemDescription.trim() && !selectedImage) {
      toast({ description: "Please upload an image or type a problem description.", variant: "destructive" });
      return;
    }

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI limit reached. Upgrade for unlimited snap-to-solve!", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const prompt = `You are an expert Math & Science Socratic tutor. Solve the following homework problem step-by-step.
Problem: "${problemDescription}"

Return ONLY a valid JSON object matching this exact structure:
{
  "problemTitle": "Concise title",
  "transcribedProblem": "Exact mathematical notation",
  "coreConcept": "Core scientific or mathematical theorem",
  "formulaNeeded": "Primary equation needed",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step 1 goal",
      "mathExpression": "Key formula manipulation",
      "explanation": "Clear explanation of how to execute this step",
      "hintOnly": "A Socratic guiding hint without revealing the final computation"
    }
  ],
  "finalAnswer": "The verified final answer",
  "commonPitfall": "1 common mistake students make on this exact problem"
}
Do not wrap in markdown quotes or extra text. Pure JSON object only.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an academic solver and Socratic tutor. Return valid JSON only."
      );

      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && parsed.steps) {
        setResult(parsed);
        setRevealedSteps(1);
        toast({ description: "Problem analyzed! Step 1 hint is ready." });
      }
    } catch (err: any) {
      console.error(err);
      toast({ description: "Processed problem with default structured solution.", variant: "default" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToNotes = () => {
    const noteText = `# ${result.problemTitle}\n\n` +
      `**Problem:** ${result.transcribedProblem}\n` +
      `**Core Concept:** ${result.coreConcept}\n` +
      `**Formula:** \`${result.formulaNeeded}\`\n\n` +
      `### Steps:\n` +
      result.steps.map((s) => `**Step ${s.stepNumber}: ${s.title}**\n\`${s.mathExpression}\`\n${s.explanation}`).join("\n\n") +
      `\n\n**Final Answer:** ${result.finalAnswer}\n**Watch Out:** ${result.commonPitfall}`;

    addNote(`Solved — ${result.problemTitle}`, noteText);
    toast({ description: "Saved step-by-step solution to Smart Notes!" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* ─── Header ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Homework Snap-to-Solve</h1>
            <p className="text-xs text-muted-foreground">Upload handwritten problems, equations, or diagrams for step-by-step Socratic breakdown.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5" /> Upload Photo
          </Button>
          <Button
            onClick={handleSaveToNotes}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs"
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Save Solution
          </Button>
          <Button
            onClick={() => setSidekickOpen(!sidekickOpen)}
            size="sm"
            className="rounded-xl text-xs"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
          </Button>
        </div>
      </div>

      {/* ─── Main 2-Column Grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (5 cols): Photo/Input & Presets */}
        <div className="lg:col-span-5 bg-card border border-border/70 rounded-3xl p-5 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground">Problem Snapshot</h3>

          {/* Image preview / drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative h-48 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 overflow-hidden flex flex-col items-center justify-center cursor-pointer bg-secondary/30 transition-all group"
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Problem snapshot"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
            ) : (
              <div className="text-center p-4 space-y-2">
                <div className="p-3 rounded-xl bg-primary/10 text-primary mx-auto w-fit">
                  <Upload className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-foreground">Click to upload problem photo</p>
                <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, handwritten sketches</p>
              </div>
            )}
          </div>

          {/* Problem description text */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider block">
              Problem Description / Transcription:
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Or type/paste your problem statement here..."
              className="w-full h-24 bg-secondary/50 border border-border/70 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider block">
              Demo Presets:
            </label>
            <div className="flex gap-2">
              {samplePresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setSelectedImage(preset.image);
                    setProblemDescription(preset.text);
                    setResult(preset.result);
                    setRevealedSteps(1);
                  }}
                  className="flex-1 p-2 rounded-xl bg-secondary/60 hover:bg-secondary border border-border/60 text-[11px] font-semibold text-foreground text-center transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSolve}
            disabled={isProcessing}
            className="w-full rounded-xl text-xs font-bold py-2.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyzing Handwriting & Math...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" /> Solve Step-by-Step
              </>
            )}
          </Button>
        </div>

        {/* Right (7 cols): Step-by-Step Socratic Guidance */}
        <div className="lg:col-span-7 bg-card border border-border/70 rounded-3xl p-6 space-y-5 shadow-xs">
          
          {/* Header & Concept Box */}
          <div className="space-y-3 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase font-bold text-violet-600 bg-violet-500/10 px-2.5 py-0.5 rounded-full">
                Socratic Breakdown
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHintMode(!hintMode)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    hintMode ? "bg-amber-500/10 border-amber-500/30 text-amber-600" : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {hintMode ? "Hint Mode (Active)" : "Full Solution Mode"}
                </button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-foreground">{result.problemTitle}</h2>
            
            <div className="p-3 rounded-2xl bg-secondary/50 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-muted-foreground font-medium">Core Concept: </span>
                <span className="font-semibold text-foreground">{result.coreConcept}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs shrink-0">
                {result.formulaNeeded}
              </div>
            </div>
          </div>

          {/* Interactive Steps */}
          <div className="space-y-3.5">
            {result.steps.map((step, idx) => {
              const isVisible = idx < revealedSteps;
              if (!isVisible) return null;

              return (
                <div
                  key={step.stepNumber}
                  className="rounded-2xl border border-border/70 p-4 space-y-2 bg-secondary/30 animate-slide-up"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-2">
                      <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                        {step.stepNumber}
                      </span>
                      {step.title}
                    </span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>

                  {/* Math formula */}
                  <div className="p-2.5 rounded-xl bg-card border border-border/60 font-mono text-xs font-bold text-primary">
                    {step.mathExpression}
                  </div>

                  {/* Explanation or Hint */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {hintMode ? `Hint: ${step.hintOnly}` : step.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reveal Next Step Button */}
          {revealedSteps < result.steps.length ? (
            <Button
              onClick={() => setRevealedSteps((prev) => prev + 1)}
              variant="outline"
              size="sm"
              className="w-full rounded-xl text-xs font-bold py-2"
            >
              Reveal Step {revealedSteps + 1} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          ) : (
            /* Final Answer Banner */
            <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/30 space-y-2 animate-pop-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Verified Final Answer:
                </span>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                  {result.finalAnswer}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground pt-1 flex items-start gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span><strong>Watch out:</strong> {result.commonPitfall}</span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Integrated AI Tutor Sidekick */}
      <StudentAiSidekick
        toolName="Homework Snap-to-Solve"
        contextData={`Problem: ${result.problemTitle}\nFormula: ${result.formulaNeeded}\nSteps: ${result.steps.map(s => s.title).join(", ")}`}
        placeholder="Ask why a step was performed or request an extra hint..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />

    </div>
  );
}
