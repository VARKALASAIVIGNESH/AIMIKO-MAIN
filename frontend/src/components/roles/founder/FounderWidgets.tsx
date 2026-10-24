import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { Plus, Trash2, Rocket, Share2, Sparkles } from "lucide-react";

interface FounderWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

interface LeanCanvas {
  problem: string[];
  solution: string[];
  metrics: string[];
  uvp: string[];
  advantage: string[];
  channels: string[];
  segments: string[];
  cost: string[];
  revenue: string[];
}

const defaultCanvas: LeanCanvas = {
  problem: ["No easy way to book a pet walker", "Pet owners lack schedule flexibility"],
  solution: ["A mobile pet walker connection app", "Verified real-time location mapping"],
  metrics: ["Active monthly users", "Walker retention rate"],
  uvp: ["Trustworthy pet walks within 15 minutes of requesting"],
  advantage: ["First-mover partnership with local veterinary networks"],
  channels: ["Social media local targeting", "Flyers at dog parks"],
  segments: ["Busy urban professionals", "Seniors needing pet care assistance"],
  cost: ["App server hosting fees", "Walker background verification checks"],
  revenue: ["15% transaction commission fee", "Premium walkers prioritization subscription"]
};

export function FounderWidgets({ activeToolLabel, suggestedPrompt, onClose }: FounderWidgetsProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [startupIdea, setStartupIdea] = useState("");
  const [canvas, setCanvas] = useState<LeanCanvas>(defaultCanvas);
  
  // Note creation states
  const [activeSegment, setActiveSegment] = useState<keyof LeanCanvas>("problem");
  const [newNote, setNewNote] = useState("");

  const handlePrepopulateCanvas = async () => {
    if (!startupIdea.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Formulate a detailed, high-impact Lean Business Model Canvas for this startup concept: "${startupIdea}". Format the response strictly as a JSON object:
{
  "problem": ["Prob A", "Prob B"],
  "solution": ["Sol A"],
  "metrics": ["Metric A"],
  "uvp": ["UVP A"],
  "advantage": ["Adv A"],
  "channels": ["Channel A"],
  "segments": ["Seg A"],
  "cost": ["Cost A"],
  "revenue": ["Rev A"]
}`;
      const response = await generateAIResponse(prompt, "adults", "founder");
      
      try {
        const cleanedJson = response.substring(
          response.indexOf("{"),
          response.lastIndexOf("}") + 1
        );
        const parsed = JSON.parse(cleanedJson) as LeanCanvas;
        setCanvas(parsed);
      } catch {
        // Mock pre-population based on input keywords
        setCanvas({
          problem: [`Customer pain points relating to: ${startupIdea}`, "Lack of simplified automation"],
          solution: ["Custom integrated software platform", "Real-time automated scheduling"],
          metrics: ["Customer conversion cost", "Retention rate index"],
          uvp: ["Fully automated, fast-delivery AI optimization"],
          advantage: ["Custom AI matching algorithms built from scratch"],
          channels: ["Direct sales outbound", "Search engine optimization"],
          segments: ["Enterprise early adopters", "Tech-savvy managers"],
          cost: ["Database hosting & compute fees", "API key utilization cost"],
          revenue: ["Tiered monthly subscriptions", "Enterprise custom setups pricing"]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setCanvas(prev => ({
      ...prev,
      [activeSegment]: [...prev[activeSegment], newNote.trim()]
    }));
    setNewNote("");
  };

  const handleDeleteNote = (segment: keyof LeanCanvas, idx: number) => {
    setCanvas(prev => ({
      ...prev,
      [segment]: prev[segment].filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="glass-bubble relative space-y-8 animate-pop-in border-border/60 shadow-2xl max-w-full overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 bg-secondary hover:bg-muted border border-border text-foreground shadow-sm hover-bounce"
      >
        ✕ Close Tool
      </button>

      <div className="flex items-center gap-3 border-b border-border pb-4">
        <AimikoAvatar size="sm" />
        <div>
          <h2 className="text-lg font-display font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">AIMIKO Startup Incubator 🚀</p>
        </div>
      </div>

      {activeToolLabel === "Idea Validation Suite" && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">Type your business concept below. AIMIKO will pre-populate the Lean Canvas board for you!</p>
          
          <div className="flex flex-col sm:flex-row gap-3 bg-muted p-3 rounded-2xl border border-border shadow-xs">
            <input
              value={startupIdea}
              onChange={(e) => setStartupIdea(e.target.value)}
              placeholder="e.g. On-demand pet walking platform for busy urban areas"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={aiLoading}
            />
            <Button onClick={handlePrepopulateCanvas} className="text-xs rounded-xl px-5 py-2.5 flex items-center justify-center gap-1.5 hover-bounce font-bold shadow-md" disabled={aiLoading || !startupIdea.trim()}>
              <Sparkles className="h-4 w-4" /> Pre-populate Board
            </Button>
          </div>

          {aiLoading && (
            <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
              🐒 Shaping business segments and compiling canvas panels...
            </div>
          )}

          {/* Interactive Lean Canvas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 border border-border p-5 rounded-3xl bg-background/50 shadow-inner">
            
            {/* Column 1: Problem */}
            <div className="md:col-span-1 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[200px] hover-lift transition shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-primary">Problem</span>
                <ul className="space-y-3 mt-3">
                  {canvas.problem.map((item, idx) => (
                    <li key={idx} className="bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-3 rounded-xl text-[10px] relative group border border-amber-200/50 dark:border-amber-900/30 leading-relaxed shadow-xs hover:rotate-1 hover:scale-105 transition-all duration-200">
                      <span>{item}</span>
                      <button onClick={() => handleDeleteNote("problem", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 2: Solution & Channels */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[100px] hover-lift transition shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-primary">Solution</span>
                  <ul className="space-y-3 mt-3">
                    {canvas.solution.map((item, idx) => (
                      <li key={idx} className="bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 p-3 rounded-xl text-[10px] relative group border border-blue-200/50 dark:border-blue-900/30 leading-relaxed shadow-xs hover:-rotate-1 hover:scale-105 transition-all duration-200">
                        <span>{item}</span>
                        <button onClick={() => handleDeleteNote("solution", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[100px] hover-lift transition shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-primary">Channels</span>
                  <ul className="space-y-3 mt-3">
                    {canvas.channels.map((item, idx) => (
                      <li key={idx} className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 p-3 rounded-xl text-[10px] relative group border border-indigo-200/50 dark:border-indigo-900/30 leading-relaxed shadow-xs hover:rotate-1 hover:scale-105 transition-all duration-200">
                        <span>{item}</span>
                        <button onClick={() => handleDeleteNote("channels", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 3: UVP & Advantage */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[100px] hover-lift transition shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-primary">Value Prop</span>
                  <ul className="space-y-3 mt-3">
                    {canvas.uvp.map((item, idx) => (
                      <li key={idx} className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 p-3 rounded-xl text-[10px] relative group border border-emerald-200/50 dark:border-emerald-900/30 leading-relaxed shadow-xs hover:-rotate-1 hover:scale-105 transition-all duration-200 font-bold">
                        <span>{item}</span>
                        <button onClick={() => handleDeleteNote("uvp", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex-1 flex flex-col justify-between min-h-[100px] hover-lift transition shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-wider text-primary">Unfair Advantage</span>
                  <ul className="space-y-3 mt-3">
                    {canvas.advantage.map((item, idx) => (
                      <li key={idx} className="bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 p-3 rounded-xl text-[10px] relative group border border-purple-200/50 dark:border-purple-900/30 leading-relaxed shadow-xs hover:rotate-1 hover:scale-105 transition-all duration-200">
                        <span>{item}</span>
                        <button onClick={() => handleDeleteNote("advantage", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 4: Key Metrics */}
            <div className="md:col-span-1 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[200px] hover-lift transition shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-primary">Key Metrics</span>
                <ul className="space-y-3 mt-3">
                  {canvas.metrics.map((item, idx) => (
                    <li key={idx} className="bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-200 p-3 rounded-xl text-[10px] relative group border border-orange-200/50 dark:border-orange-900/30 leading-relaxed shadow-xs hover:-rotate-1 hover:scale-105 transition-all duration-200">
                      <span>{item}</span>
                      <button onClick={() => handleDeleteNote("metrics", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Column 5: Customer Segments */}
            <div className="md:col-span-1 bg-card border border-border rounded-2xl p-4 flex flex-col justify-between min-h-[200px] hover-lift transition shadow-xs">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-primary">Customer Segments</span>
                <ul className="space-y-3 mt-3">
                  {canvas.segments.map((item, idx) => (
                    <li key={idx} className="bg-pink-100 dark:bg-pink-950/40 text-pink-900 dark:text-pink-200 p-3 rounded-xl text-[10px] relative group border border-pink-200/50 dark:border-pink-900/30 leading-relaxed shadow-xs hover:rotate-1 hover:scale-105 transition-all duration-200">
                      <span>{item}</span>
                      <button onClick={() => handleDeleteNote("segments", idx)} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 text-[10px] p-0.5 cursor-pointer transition-opacity">✕</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>

          {/* Add custom note to Canvas */}
          <div className="bg-muted/30 border border-border p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end shadow-sm">
            <div className="space-y-1.5 w-full sm:w-1/3">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Target Segment</label>
              <select
                value={activeSegment}
                onChange={(e) => setActiveSegment(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none cursor-pointer transition shadow-xs"
              >
                <option value="problem">Problem</option>
                <option value="solution">Solution</option>
                <option value="metrics">Key Metrics</option>
                <option value="uvp">Value Proposition</option>
                <option value="advantage">Unfair Advantage</option>
                <option value="channels">Channels</option>
                <option value="segments">Customer Segments</option>
              </select>
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Note Content</label>
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="e.g. Expand into local pet grooming groups"
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none transition shadow-xs"
              />
            </div>
            <Button onClick={handleAddNote} className="text-xs rounded-xl py-2.5 px-5 flex items-center justify-center gap-1.5 hover-bounce font-bold shadow-md">
              <Plus className="h-4 w-4" /> Add Note
            </Button>
          </div>
        </div>
      )}

      {activeToolLabel !== "Idea Validation Suite" && (
        <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
