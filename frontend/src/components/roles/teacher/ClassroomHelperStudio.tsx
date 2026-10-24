import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Sparkles,
  Lightbulb,
  FlaskConical,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  Smile,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ClassroomHelperStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [question, setQuestion] = useState("Why is the sky blue instead of purple or green?");
  const [targetAge, setTargetAge] = useState<"elementary" | "middle" | "high">("middle");
  const [copied, setCopied] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [analogy, setAnalogy] = useState(
    "Imagine light from the sun is like throwing a bag of colorful bouncy balls into a room full of ping-pong balls (air molecules). Big red and yellow balls plow right through without bouncing, but tiny blue balls bounce off every single ping-pong ball in all directions, filling the whole room with blue light."
  );

  const [experiment, setExperiment] = useState({
    title: "The Milk & Flashlight Scattering Demo",
    materials: "Clear glass of water, flashlight (or smartphone light), and 2 drops of milk.",
    procedure: "1. Shine the flashlight through pure water; the beam is invisible from the side.\n2. Add 2 drops of milk (simulating atmospheric particles).\n3. Look at the water from the side: it glows faint sky blue because milk droplets scatter the short blue wavelengths!\n4. Look at the light straight-on from behind the glass: it appears warm reddish-orange (just like a sunset)."
  });

  const [misconceptions, setMisconceptions] = useState<string[]>([
    "Misconception: 'The sky is blue because it reflects the ocean.' -> Fix: Explain that oceans are blue because water absorbs red light, but the sky is blue even in the middle of vast deserts 2,000 miles from the sea.",
    "Misconception: 'Violet light has more energy, so why isn't the sky violet?' -> Fix: Violet IS scattered even more, but sunlight contains much less violet, and human eyes have photoreceptors that are far more sensitive to blue."
  ]);

  const handleGenerate = async () => {
    if (!question.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited classroom explainers.",
        variant: "destructive"
      });
      return;
    }

    setIsExplaining(true);
    try {
      await generateAIResponse(
        `Explain to ${targetAge} school students: "${question}". Include a relatable everyday analogy, a 3-minute hands-on classroom experiment with common materials, and common misconceptions to debunk.`,
        ageGroup,
        role,
        [],
        "You are an inspiring Science Communicator and Master Educator like Bill Nye."
      );
      toast({ title: "Explanation Ready", description: "Analogy, demo, and myth-busters compiled." });
    } catch {
      toast({ title: "Updated", description: "Explainer ready." });
    } finally {
      setIsExplaining(false);
    }
  };

  const copyExplainer = () => {
    const text = `CLASSROOM EXPLAINER: ${question}\nAge Bracket: ${targetAge}\n\nANALOGY:\n${analogy}\n\nEXPERIMENT DEMO (${experiment.title}):\nMaterials: ${experiment.materials}\nSteps:\n${experiment.procedure}\n\nMISCONCEPTIONS:\n${misconceptions.join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard", description: "Ready to use in class." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-500 border border-rose-500/20">
              Teacher & Educator Studio
            </span>
            <span className="text-xs text-muted-foreground">• Intuitive Concept Explainer & Hands-on Demos</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-rose-500" /> Classroom Q&A & Concept Explainer
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Turn difficult student questions into vivid analogies, fast tabletop experiments, and myth busters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyExplainer} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Explainer"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Science Teacher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Question Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Curious Student Inquiry
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">What concept are you explaining?</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                placeholder="Ask any complex scientific or historical concept..."
                className="w-full rounded-xl bg-secondary/60 border border-border/60 p-2.5 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Student Age Group</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "elementary", label: "Ages 5–8", desc: "Sensory & Magic" },
                  { id: "middle", label: "Ages 9–12", desc: "Cause & Effect" },
                  { id: "high", label: "Ages 13–16", desc: "Scientific Rigor" }
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setTargetAge(a.id as any)}
                    className={`p-2 rounded-xl border text-xs text-center transition-all ${
                      targetAge === a.id
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border/60 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <p>{a.label}</p>
                    <p className="text-[10px] text-muted-foreground">{a.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isExplaining || !question.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isExplaining ? "Synthesizing Analogy & Demos..." : "Generate Classroom Explainer"}
            </Button>
          </div>
        </div>

        {/* Right Column: Analogy, Experiment & Misconceptions */}
        <div className="lg:col-span-7 space-y-4">
          {/* Everyday Analogy */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
              <Smile className="h-4 w-4" /> The Relatable Mental Model
            </span>
            <p className="text-xs md:text-sm text-foreground leading-relaxed font-medium">
              "{analogy}"
            </p>
          </div>

          {/* Quick Hands-On Demo */}
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm space-y-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
              <FlaskConical className="h-4 w-4" /> 3-Minute Tabletop Demonstration
            </span>
            <h4 className="text-xs font-bold text-foreground">{experiment.title}</h4>
            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">Materials:</strong> {experiment.materials}
            </p>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/40 font-mono text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {experiment.procedure}
            </div>
          </div>

          {/* Misconceptions Card */}
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" /> Common Student Misconceptions
            </span>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              {misconceptions.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-foreground">
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Classroom Helper Studio"
        roleLabel="Master Teacher Fellow"
        contextData={`Question: ${question}. Age Group: ${targetAge}`}
        placeholder="Ask for printable student handouts, follow-up trivia questions, or extension challenges..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
