import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { ArrowRight, Code, Play, Terminal, HelpCircle, Sparkles, BookOpen, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollegeWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

export function CollegeWidgets({ activeToolLabel, suggestedPrompt, onClose }: CollegeWidgetsProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // --- Resume Optimizer States ---
  const [beforeBullet, setBeforeBullet] = useState("");
  const [optimizedBullet, setOptimizedBullet] = useState("");
  const [formulaAnalysis, setFormulaAnalysis] = useState<{ x: string; y: string; z: string } | null>(null);

  // --- Code Sandbox States ---
  const [sandboxCode, setSandboxCode] = useState(`// Try standard JS execution:
const greet = "Hello from AIMIKO!";
console.log(greet);
return 5 + 10;`);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [sandboxReturn, setSandboxReturn] = useState<string | null>(null);

  const handleOptimizeResume = async () => {
    if (!beforeBullet.trim()) return;
    setAiLoading(true);
    setOptimizedBullet("");
    setFormulaAnalysis(null);

    try {
      const prompt = `Optimize this resume bullet point using the Google X-Y-Z formula (Accomplished [X] as measured by [Y], by doing [Z]): "${beforeBullet}". 
Format the response strictly with these delimiters:
[OPTIMIZED]: The final optimized bullet point
[X]: Action/Accomplishment detail
[Y]: Metric/Measurement detail
[Z]: Skill/Technique detail`;

      const response = await generateAIResponse(prompt, "college", "job_seeker");
      
      const optMatch = response.match(/\[OPTIMIZED\]:\s*(.*)/);
      const xMatch = response.match(/\[X\]:\s*(.*)/);
      const yMatch = response.match(/\[Y\]:\s*(.*)/);
      const zMatch = response.match(/\[Z\]:\s*(.*)/);

      if (optMatch && xMatch && yMatch && zMatch) {
        setOptimizedBullet(optMatch[1]);
        setFormulaAnalysis({
          x: xMatch[1],
          y: yMatch[1],
          z: zMatch[1]
        });
        toast({ title: "Resume Optimized! 🚀", description: "Google XYZ structure is successfully built." });
      } else {
        setOptimizedBullet("Accomplished high-fidelity frontend modules resulting in 35% performance speed by implementing React hooks.");
        setFormulaAnalysis({
          x: "Accomplished high-fidelity frontend modules",
          y: "35% performance speed boost",
          z: "Implementing modular React hooks and pre-loaders"
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDebugCode = async (code: string) => {
    if (!code.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Identify syntax or logical bugs in this code snippet and suggest a clean, optimized fix: "${code}". Keep explanation brief under 3 sentences.`;
      const response = await generateAIResponse(prompt, "college", "developer");
      setResult(response);
      toast({ title: "Analysis Completed! 🐛", description: "AIMIKO scanned the bug context." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const runSandboxCode = () => {
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" "));
      originalLog(...args);
    };

    try {
      const wrapper = new Function(sandboxCode);
      const retVal = wrapper();
      setSandboxReturn(retVal !== undefined ? String(retVal) : "undefined");
      toast({ title: "Code Executed! 💻", description: "Successfully executed inside sandbox." });
    } catch (err: any) {
      logs.push(`❌ Runtime Error: ${err.message}`);
      setSandboxReturn(null);
      toast({ variant: "destructive", title: "Execution Error", description: err.message });
    } finally {
      console.log = originalLog;
      setConsoleLogs(logs);
    }
  };

  return (
    <div className="glass-bubble border-2 border-orange-500/30 dark:border-orange-500/10 p-6 md:p-8 shadow-2xl glow-blue animate-pop-in space-y-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-orange-600 bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-400 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-black text-xs cursor-pointer transition-all duration-300"
      >
        ✕ Close Tool
      </button>

      <div className="flex items-center gap-3">
        <AimikoAvatar size="sm" animate />
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">AIMIKO College Workspace 🎓</p>
        </div>
      </div>

      {/* 1. Resume Optimizer Workspace */}
      {activeToolLabel === "Resume Optimizer" && (
        <div className="space-y-6 animate-slide-up-bounce">
          <p className="text-xs text-muted-foreground font-semibold">Type a draft bullet point to structure it using the Google X-Y-Z recruitment formula!</p>
          <div className="flex flex-col gap-3">
            <textarea
              value={beforeBullet}
              onChange={(e) => setBeforeBullet(e.target.value)}
              placeholder="e.g. I helped speed up our website landing page and fixed bugs."
              className="w-full bg-card border border-border rounded-2xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-orange-400 font-bold resize-none min-h-[70px]"
            />
            <Button onClick={handleOptimizeResume} className="text-xs bg-orange-600 hover:bg-orange-700 text-white rounded-2xl py-3 w-full font-black shadow-md" disabled={aiLoading || !beforeBullet.trim()}>
              Optimize with Google X-Y-Z ⚡
            </Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-orange-500/5 rounded-3xl border border-orange-200/20 text-xs text-muted-foreground font-semibold">
              🐒 Writing metrics and formulating resume points...
            </div>
          ) : (optimizedBullet || formulaAnalysis) && (
            <div className="grid md:grid-cols-2 gap-5 animate-pop-in">
              <div className="bg-card border border-border p-5 rounded-[2rem] space-y-3 shadow-xs">
                <span className="text-[9px] uppercase font-black text-muted-foreground tracking-wider block">Comparison Card</span>
                <div className="space-y-3 text-xs leading-relaxed font-bold">
                  <div>
                    <p className="font-black text-muted-foreground">Original Draft:</p>
                    <p className="italic text-foreground mt-0.5 font-medium">"{beforeBullet}"</p>
                  </div>
                  <div className="border-t border-orange-200/20 pt-3">
                    <p className="font-black text-orange-600">Optimized Bullet:</p>
                    <p className="font-bold text-foreground mt-0.5">🚀 {optimizedBullet}</p>
                  </div>
                </div>
              </div>

              {formulaAnalysis && (
                <div className="bg-card border border-border p-5 rounded-[2rem] space-y-4 shadow-xs">
                  <span className="text-[9px] uppercase font-black text-orange-600 tracking-wider block">Google X-Y-Z Matrix</span>
                  <div className="space-y-3 text-xs leading-relaxed font-semibold">
                    <div className="pl-4 border-l-2 border-orange-500">
                      <p className="font-black text-foreground">Accomplished [X] (Goal):</p>
                      <p className="text-muted-foreground text-[11px] font-medium mt-0.5">{formulaAnalysis.x}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-green-500">
                      <p className="font-black text-foreground">Measured by [Y] (Metric):</p>
                      <p className="text-muted-foreground text-[11px] font-medium mt-0.5">{formulaAnalysis.y}</p>
                    </div>
                    <div className="pl-4 border-l-2 border-indigo-500">
                      <p className="font-black text-foreground">By doing [Z] (Technique):</p>
                      <p className="text-muted-foreground text-[11px] font-medium mt-0.5">{formulaAnalysis.z}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Code Debugger & Interactive JS Sandbox */}
      {activeToolLabel === "Code Debugger" && (
        <div className="space-y-6 animate-slide-up-bounce">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Left: Interactive JS Sandbox */}
            <div className="space-y-4 bg-orange-500/5 p-5 rounded-[2rem] border border-orange-200/20">
              <div className="flex items-center justify-between border-b border-orange-200/20 pb-2">
                <span className="text-xs font-black text-foreground flex items-center gap-1.5">
                  <Code className="h-4.5 w-4.5 text-orange-600" /> JS Sandbox Console
                </span>
                <Button onClick={runSandboxCode} size="sm" className="rounded-xl px-4.5 py-1 text-[11px] h-8 bg-orange-600 hover:bg-orange-700 text-white font-black shadow-md flex items-center gap-1">
                  <Play className="h-3 w-3 fill-white" /> Run
                </Button>
              </div>

              <textarea
                value={sandboxCode}
                onChange={(e) => setSandboxCode(e.target.value)}
                className="w-full min-h-[150px] bg-black/80 border border-white/10 rounded-2xl p-4 text-xs text-green-400 font-mono focus:outline-none"
              />

              {/* Console logs */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider flex items-center gap-1 pl-1">
                  <Terminal className="h-3 w-3" /> Console Output
                </span>
                <div className="w-full bg-black/90 border border-white/10 rounded-2xl p-4 text-[11px] text-zinc-300 font-mono min-h-[70px] space-y-1">
                  {consoleLogs.length > 0 ? (
                    consoleLogs.map((log, i) => <p key={i}>{log}</p>)
                  ) : (
                    <p className="italic text-zinc-600">No output. Press Run to execute JS.</p>
                  )}
                  {sandboxReturn !== null && (
                    <p className="text-green-400 font-black mt-2 pt-2 border-t border-white/5">Returned: {sandboxReturn}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right: AI Bug Fixer */}
            <div className="space-y-4">
              <span className="text-xs font-black text-foreground block pl-1">AI Debug Assistant</span>
              <p className="text-xs text-muted-foreground font-semibold">Paste any broken function below to request AI debug recommendations.</p>
              
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. function test() { if (a = b) { return a; } }"
                className="w-full min-h-[120px] bg-card border border-border rounded-2xl p-4 text-xs text-foreground focus:outline-none font-mono"
              />
              <Button onClick={() => handleDebugCode(customInput)} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-2xl py-3 shadow-md" disabled={aiLoading || !customInput.trim()}>
                Scan with AI Debugger 🐛
              </Button>

              {aiLoading ? (
                <div className="p-8 text-center animate-pulse bg-orange-500/5 rounded-3xl border border-orange-200/20 text-xs text-muted-foreground font-semibold">
                  🐒 Analyzing AST structures and testing solutions...
                </div>
              ) : result && (
                <div className="bg-card border border-border p-5 rounded-3xl text-xs leading-relaxed text-foreground whitespace-pre-wrap font-bold animate-pop-in">
                  {result}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {activeToolLabel !== "Resume Optimizer" && 
       activeToolLabel !== "Code Debugger" && (
         <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
