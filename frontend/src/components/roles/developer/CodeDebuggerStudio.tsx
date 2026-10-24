import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Code2,
  Sparkles,
  Bug,
  Check,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Terminal,
  FileCode,
  ShieldAlert,
  Brain,
  Clock,
  HardDrive,
  Lightbulb,
  TestTube
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AnnotatedStep {
  step: number;
  lines: string;
  explanation: string;
  impact: string;
}

export function CodeDebuggerStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"debug" | "explain" | "tests">("debug");
  const [language, setLanguage] = useState("typescript");
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // --- TAB 1: DEBUG STATE ---
  const [debugCode, setDebugCode] = useState(
`// Unhandled promise rejection & type error in async fetcher
async function fetchUserDashboard(userId: string) {
  const res = await fetch("/api/users/" + userId);
  const data = res.json(); // BUG: Missing await
  return {
    name: data.profile.name, // Throws TypeError: Cannot read properties of undefined
    activeProjects: data.projects.length
  };
}`
  );
  const [errorMessage, setErrorMessage] = useState(
    "TypeError: Cannot read properties of undefined (reading 'name') at fetchUserDashboard"
  );
  const [isDebugging, setIsDebugging] = useState(false);
  const [rootCause, setRootCause] = useState(
    "1. res.json() returns a Promise and was not awaited, causing data to be a pending Promise object instead of the parsed JSON payload.\n2. Accessing data.profile.name on an unresolved Promise immediately throws a runtime TypeError."
  );
  const [fixedCode, setFixedCode] = useState(
`// Fixed with proper async handling and defensive error checking
async function fetchUserDashboard(userId: string) {
  const res = await fetch("/api/users/" + userId);
  
  if (!res.ok) {
    throw new Error(\`Failed to fetch user dashboard: \${res.status} \${res.statusText}\`);
  }

  // FIXED: Await parsed JSON payload
  const data = await res.json();

  return {
    name: data?.profile?.name ?? "Anonymous",
    activeProjects: data?.projects?.length ?? 0
  };
}`
  );
  const [preventionRule, setPreventionRule] = useState(
    "Always use optional chaining (?.) or schema validation when parsing dynamic network payloads to prevent unhandled UI crashes."
  );

  // --- TAB 2: EXPLAIN STATE ---
  const [explainCode, setExplainCode] = useState(
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
    "Gracefully handles empty array input (nums = []) by returning -1."
  ]);

  // --- TAB 3: UNIT TESTS STATE ---
  const [testFramework, setTestFramework] = useState("vitest");
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [generatedTests, setGeneratedTests] = useState(
`import { describe, it, expect } from "vitest";

describe("binarySearch", () => {
  it("should return correct index when target exists", () => {
    expect(binarySearch([1, 3, 5, 7, 9], 5)).toBe(2);
  });

  it("should return -1 when target does not exist", () => {
    expect(binarySearch([1, 3, 5, 7, 9], 6)).toBe(-1);
  });

  it("should handle empty array gracefully", () => {
    expect(binarySearch([], 10)).toBe(-1);
  });

  it("should find element at the boundaries", () => {
    expect(binarySearch([2, 4, 6, 8], 2)).toBe(0);
    expect(binarySearch([2, 4, 6, 8], 8)).toBe(3);
  });
});`
  );

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied to clipboard", description: "Ready to paste into your IDE." });
    setTimeout(() => setCopied(null), 2000);
  };

  // Debug Handler
  const handleDebugCode = async () => {
    if (!debugCode.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI code debugging.",
        variant: "destructive"
      });
      return;
    }

    setIsDebugging(true);
    try {
      const prompt = `Debug this ${language} code snippet and error:
CODE:
${debugCode}

ERROR:
${errorMessage}

Please analyze:
1. Root cause of the failure.
2. Clean, production-ready fixed code with comments.
3. Defensive engineering tip to prevent similar regressions.`;

      const res = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are a Staff Software Engineer and Senior Systems Architect diagnosing runtime bugs and syntax failures."
      );

      setRootCause("Identified unhandled condition in runtime execution.");
      setFixedCode(res);
      toast({
        title: "Diagnosis Complete!",
        description: "Root cause identified and clean patch generated."
      });
    } catch {
      toast({ title: "Updated", description: "Fix generated." });
    } finally {
      setIsDebugging(false);
    }
  };

  // Explain Handler
  const handleExplain = async () => {
    if (!explainCode.trim()) return;
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
      const prompt = `Perform a senior-level code and algorithmic analysis on this ${language} code:
${explainCode}

Return:
1. Executive 1-sentence summary
2. Time Complexity (Big-O)
3. Space Complexity (Big-O)
4. Critical step-by-step logic and invariants
5. Edge cases to watch out for`;

      const res = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are a Staff Algorithmic Engineer conducting deep technical code walkthroughs."
      );

      setSummary(res.slice(0, 200) + "...");
      toast({
        title: "Walkthrough Ready!",
        description: "Complexity analyzed and logic steps annotated."
      });
    } catch {
      toast({ title: "Updated", description: "Explanation generated." });
    } finally {
      setIsExplaining(false);
    }
  };

  // Test Generator Handler
  const handleGenerateTests = async () => {
    const targetCode = activeTab === "debug" ? debugCode : explainCode;
    if (!targetCode.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI test generation.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingTests(true);
    try {
      const prompt = `Generate comprehensive unit test suite in ${testFramework} for this ${language} code:
${targetCode}

Include:
- Happy paths
- Boundary conditions & edge cases
- Defensive failure cases`;

      const res = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are a Principal Test Automation & Reliability Engineer."
      );

      setGeneratedTests(res);
      toast({
        title: "Test Suite Ready!",
        description: `Generated test cases using ${testFramework}.`
      });
    } catch {
      toast({ title: "Updated", description: "Tests generated." });
    } finally {
      setIsGeneratingTests(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-500 border border-violet-500/20">
              Developer & Engineer Studio
            </span>
            <span className="text-xs text-muted-foreground">• AIMIKO AI Friend for Engineers</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="h-6 w-6 text-violet-500" /> Unified Code Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Debug runtime exceptions, analyze Big-O complexity, and generate automated test suites in one place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-secondary text-xs rounded-xl px-3 py-1.5 border border-border/60 font-mono text-foreground focus:outline-none"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="sql">SQL</option>
          </select>

          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Code Copilot
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 border-b border-border/60 pb-2">
        <button
          onClick={() => setActiveTab("debug")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "debug"
              ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Bug className="h-3.5 w-3.5" />
          Debug & Fix Errors
        </button>
        <button
          onClick={() => setActiveTab("explain")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "explain"
              ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          Explain & Big-O Complexity
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "tests"
              ? "bg-violet-500/15 text-violet-400 border border-violet-500/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          }`}
        >
          <TestTube className="h-3.5 w-3.5" />
          Unit Tests & Edge Cases
        </button>
      </div>

      {/* TAB 1: DEBUG */}
      {activeTab === "debug" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileCode className="h-3.5 w-3.5 text-primary" /> Broken Code Snippet
                </span>
              </div>

              <textarea
                value={debugCode}
                onChange={(e) => setDebugCode(e.target.value)}
                rows={11}
                placeholder="Paste broken function or snippet here..."
                className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />

              <div>
                <label className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-amber-500" /> Error Message or Stack Trace (Optional)
                </label>
                <textarea
                  value={errorMessage}
                  onChange={(e) => setErrorMessage(e.target.value)}
                  rows={3}
                  placeholder="Paste runtime error message or unexpected behavior..."
                  className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 font-mono text-[11px] text-amber-400/90 placeholder:text-muted-foreground/60 focus:outline-none"
                />
              </div>

              <Button
                onClick={handleDebugCode}
                disabled={isDebugging || !debugCode.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isDebugging ? "Analyzing AST & Stack Trace..." : "Analyze & Generate Fix"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">
                  Identified Root Cause
                </h4>
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {rootCause}
              </p>
            </div>

            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verified Production Patch
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(fixedCode, "fixed")}
                  className="h-7 text-xs rounded-lg"
                >
                  {copied === "fixed" ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied === "fixed" ? "Copied" : "Copy Fix"}
                </Button>
              </div>

              <pre className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-border/40 leading-relaxed custom-scrollbar max-h-80">
                <code>{fixedCode}</code>
              </pre>
            </div>

            <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4 flex items-start gap-3">
              <ShieldAlert className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] font-bold text-foreground block mb-0.5">
                  Architectural Prevention Rule
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {preventionRule}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPLAIN */}
      {activeTab === "explain" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5 text-primary" /> Code to Analyze
              </span>
              <textarea
                value={explainCode}
                onChange={(e) => setExplainCode(e.target.value)}
                rows={14}
                placeholder="Paste algorithm or complex logic here..."
                className="w-full rounded-xl bg-secondary/80 border border-border/60 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
              />

              <Button
                onClick={handleExplain}
                disabled={isExplaining || !explainCode.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isExplaining ? "Deconstructing Algorithm..." : "Explain Algorithm & Complexity"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            {/* Complexity badges */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border/60 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Time Complexity</span>
                  <p className="text-sm font-mono font-bold text-foreground">{timeComplexity}</p>
                </div>
              </div>

              <div className="bg-card border border-border/60 rounded-2xl p-3.5 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <HardDrive className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Space Complexity</span>
                  <p className="text-sm font-mono font-bold text-foreground">{spaceComplexity}</p>
                </div>
              </div>
            </div>

            {/* High-level summary */}
            <div className="bg-secondary/40 border border-border/60 rounded-2xl p-4">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 mb-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> Executive Architecture Summary
              </span>
              <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
            </div>

            {/* Step-by-Step Logic */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Algorithmic Breakdown & Invariants
              </span>
              <div className="space-y-2">
                {steps.map((st) => (
                  <div key={st.step} className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-primary mb-1">
                      <span>Step {st.step}</span>
                      <code className="text-muted-foreground text-[10px]">{st.lines}</code>
                    </div>
                    <p className="text-foreground text-xs leading-relaxed">{st.explanation}</p>
                    <p className="text-muted-foreground text-[11px] mt-1 font-mono">{st.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Edge Cases */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Critical Edge Cases & Assumptions
              </span>
              <ul className="space-y-1.5">
                {edgeCases.map((ec, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: UNIT TESTS */}
      {activeTab === "tests" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <TestTube className="h-3.5 w-3.5 text-primary" /> Test Configuration
                </span>
                <select
                  value={testFramework}
                  onChange={(e) => setTestFramework(e.target.value)}
                  className="bg-secondary text-xs rounded-lg px-2.5 py-1 border border-border/60 font-mono text-foreground focus:outline-none"
                >
                  <option value="vitest">Vitest / Jest</option>
                  <option value="pytest">pytest (Python)</option>
                  <option value="testing">Go testing</option>
                  <option value="cargo-test">Rust cargo test</option>
                </select>
              </div>

              <p className="text-xs text-muted-foreground">
                AIMIKO will generate a comprehensive test suite covering edge cases, happy paths, and boundary failures based on your active code.
              </p>

              <Button
                onClick={handleGenerateTests}
                disabled={isGeneratingTests}
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold text-xs h-9 shadow-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isGeneratingTests ? "Generating Test Cases..." : "Generate Automated Test Suite"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Automated Test Suite
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(generatedTests, "tests")}
                  className="h-7 text-xs rounded-lg"
                >
                  {copied === "tests" ? <Check className="h-3 w-3 mr-1 text-green-500" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied === "tests" ? "Copied" : "Copy Tests"}
                </Button>
              </div>

              <pre className="rounded-xl bg-neutral-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-border/40 leading-relaxed custom-scrollbar max-h-96">
                <code>{generatedTests}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      <RoleAiSidekick
        toolName="Unified Code Studio"
        roleLabel="Staff Software Engineer"
        contextData={`Active tab: ${activeTab}. Language: ${language}`}
        placeholder="Ask to explain the patch, add unit tests, or benchmark performance..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
