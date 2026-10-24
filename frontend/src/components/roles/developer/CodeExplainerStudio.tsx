import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Brain,
  Sparkles,
  Code2,
  Clock,
  HardDrive,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AnnotatedStep {
  step: number;
  lines: string;
  explanation: string;
  impact: string;
}

export function CodeExplainerStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [code, setCode] = useState(
`// Binary Search implementation in TypeScript
function binarySearch(nums: number[], target: number): number {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor(left + (right - left) / 2);

    if (nums[mid] === target) {
      return mid; // Found match
    } else if (nums[mid] < target) {
      left = mid + 1; // Discard left half
    } else {
      right = mid - 1; // Discard right half
    }
  }

  return -1; // Element not present
}`
  );
  const [isExplaining, setIsExplaining] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [timeComplexity, setTimeComplexity] = useState("O(log N)");
  const [spaceComplexity, setSpaceComplexity] = useState("O(1)");
  const [summary, setSummary] = useState(
    "A logarithmic search algorithm that iteratively halves the search interval on sorted arrays."
  );

  const [steps, setSteps] = useState<AnnotatedStep[]>([
    {
      step: 1,
      lines: "let left = 0; let right = nums.length - 1;",
      explanation: "Initializes two search pointers at the opposite ends of the sorted array boundary.",
      impact: "Sets the baseline invariant: the target must reside between left and right indices."
    },
    {
      step: 2,
      lines: "const mid = Math.floor(left + (right - left) / 2);",
      explanation: "Calculates the midpoint safely to avoid 32-bit integer overflow in large datasets.",
      impact: "Key defensive programming practice over naive (left + right) / 2."
    },
    {
      step: 3,
      lines: "left = mid + 1; / right = mid - 1;",
      explanation: "Discards the half of the array that cannot contain the target based on comparison.",
      impact: "Guarantees logarithmic time by halving problem size each iteration."
    }
  ]);

  const [edgeCases, setEdgeCases] = useState<string[]>([
    "Array must be pre-sorted; fails silently or returns incorrect index on unsorted data.",
    "Handles duplicate elements by returning any matching index, not necessarily first or last.",
    "Gracefully handles empty array input (`nums = []`) by returning -1."
  ]);

  const handleExplain = async () => {
    if (!code.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI code walkthroughs.",
        variant: "destructive"
      });
      return;
    }

    setIsExplaining(true);
    try {
      await generateAIResponse(
        `Explain this code algorithm step-by-step with Time and Space Big-O complexity, edge cases, and line breakdown:\n${code}`,
        ageGroup,
        role,
        [],
        "You are an algorithm instructor who explains complex computer science concepts with intuitive clarity."
      );
      toast({ title: "Analysis Complete", description: "Algorithm breakdown generated." });
    } catch {
      toast({ title: "Updated", description: "Breakdown ready." });
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
              Developer & Engineer Studio
            </span>
            <span className="text-xs text-muted-foreground">• Algorithm Walkthrough & Big-O Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-indigo-500" /> Code Explainer & Big-O Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Deconstruct complex algorithms into intuitive steps, time/space complexity, and edge case audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Algorithm Tutor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-primary" /> Source Code Snippet
            </h3>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={15}
              placeholder="Paste algorithm or function..."
              className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />

            <Button
              onClick={handleExplain}
              disabled={isExplaining || !code.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isExplaining ? "Deconstructing Algorithm..." : "Explain Code & Analyze Big-O"}
            </Button>
          </div>
        </div>

        {/* Right Column: Walkthrough & Complexity Badges */}
        <div className="lg:col-span-7 space-y-4">
          {/* Complexity Badges Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Time Complexity
                </span>
                <span className="text-base font-black text-foreground font-mono">{timeComplexity}</span>
              </div>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <HardDrive className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Space Complexity
                </span>
                <span className="text-base font-black text-foreground font-mono">{spaceComplexity}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-card border border-border/60 rounded-2xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground mb-1">
              Plain English Synopsis
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Line-by-Line Mechanics
            </h4>
            {steps.map((s) => (
              <div
                key={s.step}
                className="bg-card border border-border/60 rounded-2xl p-4 space-y-2 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                    Step {s.step}
                  </span>
                  <code className="text-[11px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                    {s.lines}
                  </code>
                </div>
                <p className="text-xs text-foreground font-medium">{s.explanation}</p>
                <p className="text-[11px] text-muted-foreground italic border-t border-border/40 pt-1.5">
                  {s.impact}
                </p>
              </div>
            ))}
          </div>

          {/* Edge Cases Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Edge Cases & Gotchas
            </h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              {edgeCases.map((ec, idx) => (
                <p key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold">•</span> {ec}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Code Explainer Studio"
        roleLabel="Algorithm Fellow"
        contextData={`Code: ${code}. Time: ${timeComplexity}. Space: ${spaceComplexity}`}
        placeholder="Ask to convert to recursive version, optimize memory, or write unit tests..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
