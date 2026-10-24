import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import {
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Lightbulb,
  Gamepad2,
  Pizza,
  Rocket,
  Smile,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type AnalogyStyle = "pizza" | "games" | "playground" | "space";

interface AnalogyResult {
  concept: string;
  textbookDefinition: string;
  analogyStory: string;
  whyItMatters: string;
  funFact: string;
}

const defaultAnalogy: AnalogyResult = {
  concept: "Quantum Superposition",
  textbookDefinition: "A fundamental principle of quantum mechanics where a physical system exists simultaneously in multiple quantum states until observed or measured.",
  analogyStory: "Imagine you have a magical spinning coin on a table. While it is spinning at high speed, it is neither purely 'Heads' nor purely 'Tails'—it is both at the exact same time! Only when you slam your hand down to stop it (making a measurement) does it pick one side.",
  whyItMatters: "Quantum computers use this trick (called qubits) to test millions of math puzzle solutions all at once instead of one by one like ordinary computers.",
  funFact: "Schrödinger used a funny imaginary cat in a box to show how bizarre this rule seems to human intuition!"
};

export function ExplainLikeIm10Studio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();
  const [concept, setConcept] = useState("Quantum Superposition");
  const [conceptInput, setConceptInput] = useState("");
  const [style, setStyle] = useState<AnalogyStyle>("games");
  const [result, setResult] = useState<AnalogyResult>(defaultAnalogy);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const handleGenerateAnalogy = async (targetConcept?: string, targetStyle = style) => {
    const query = (targetConcept || conceptInput || concept).trim();
    if (!query) return;

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI quota reached. Upgrade to Pro for unlimited explanations!", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setConcept(query);
    setStyle(targetStyle);

    let stylePrompt = "using everyday childhood analogies";
    if (targetStyle === "pizza") stylePrompt = "using food, pizza, ice cream, or cooking recipes as the core analogy";
    else if (targetStyle === "games") stylePrompt = "using video game mechanics (Minecraft, Roblox, leveling up, inventory) as the analogy";
    else if (targetStyle === "space") stylePrompt = "using spaceship adventures, alien worlds, and astronauts as the analogy";
    else if (targetStyle === "playground") stylePrompt = "using playground games, toys, LEGOs, and recess as the analogy";

    try {
      const prompt = `Explain the concept "${query}" to a 10-year-old student ${stylePrompt}.
Return ONLY a valid JSON object matching this exact structure:
{
  "concept": "${query}",
  "textbookDefinition": "1 sentence textbook definition",
  "analogyStory": "2-3 paragraphs of a fun, vivid, simple analogy that demystifies it completely",
  "whyItMatters": "1-2 sentences on why this concept is important in real life",
  "funFact": "1 surprising, fun fact about it"
}
Do not include markdown tags or extra commentary. Return pure JSON object only.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an expert science communicator for kids. Return valid JSON only."
      );

      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (parsed && parsed.analogyStory) {
        setResult(parsed);
        setConceptInput("");
        toast({ description: `Explained "${query}" in simple terms!` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ description: "Failed to generate explanation. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = `# ${result.concept} (Explained Like I'm 10)\n\n**The Textbook:**\n${result.textbookDefinition}\n\n**The Analogy:**\n${result.analogyStory}\n\n**Why It Matters:**\n${result.whyItMatters}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ description: "Copied explanation to clipboard" });
  };

  const handleSaveToNotes = () => {
    const noteContent = `# ${result.concept} (ELI10 Analogy)\n\n${result.analogyStory}\n\n**Why It Matters:** ${result.whyItMatters}\n\n**Fun Fact:** ${result.funFact}`;
    addNote(`ELI10 — ${result.concept}`, noteContent);
    toast({ description: "Saved analogy to Smart Notes!" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* ─── Header & Input Controls ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Explain Like I'm 10 (ELI10)</h1>
              <p className="text-xs text-muted-foreground">Demystify complex, intimidating terms with fun real-world analogies.</p>
            </div>
          </div>

          <Button
            onClick={() => setSidekickOpen(!sidekickOpen)}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
          </Button>
        </div>

        {/* Input Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <input
            type="text"
            value={conceptInput}
            onChange={(e) => setConceptInput(e.target.value)}
            placeholder={`Current: "${concept}" — Type any complex concept to simplify...`}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateAnalogy()}
            className="flex-1 rounded-2xl bg-secondary/60 border border-border/70 px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <Button
            onClick={() => handleGenerateAnalogy()}
            disabled={isGenerating}
            className="rounded-2xl text-xs font-semibold px-4 shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Simplifying...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Simplify Concept
              </>
            )}
          </Button>
        </div>

        {/* Analogy Style Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground font-medium">Analogy Style:</span>
          {[
            { id: "games", label: "Video Games", icon: Gamepad2 },
            { id: "pizza", label: "Food & Snacks", icon: Pizza },
            { id: "playground", label: "Toys & LEGO", icon: Smile },
            { id: "space", label: "Space Voyage", icon: Rocket }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleGenerateAnalogy(undefined, id as AnalogyStyle)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border transition-colors ${
                style === id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/60 hover:bg-secondary border-border/60 text-foreground"
              }`}
            >
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs pt-1">
          <span className="text-[11px] text-muted-foreground font-medium">Try explaining:</span>
          {["Economic Inflation", "CRISPR Gene Editing", "Black Holes & Event Horizons", "Neural Networks"].map((preset) => (
            <button
              key={preset}
              onClick={() => handleGenerateAnalogy(preset)}
              className="px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/60 text-[11px] font-medium text-foreground transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Interactive Analogy Card ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
        
        {/* Card Header & Action buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div>
            <span className="text-[10.5px] uppercase font-bold text-sky-600 bg-sky-500/10 px-2.5 py-0.5 rounded-full">
              ELI10 Breakdown
            </span>
            <h2 className="text-xl font-bold text-foreground mt-1">{result.concept}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              onClick={handleSaveToNotes}
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs font-semibold rounded-xl"
            >
              <BookOpen className="h-3.5 w-3.5 mr-1.5 text-primary" /> Save to Notes
            </Button>
          </div>
        </div>

        {/* 1. Textbook Jargon */}
        <div className="p-3.5 rounded-2xl bg-secondary/50 border border-border/60 space-y-1">
          <p className="text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider">
            What textbooks say (Complex):
          </p>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{result.textbookDefinition}"
          </p>
        </div>

        {/* 2. The 10-Year-Old Story Analogy */}
        <div className="p-5 rounded-3xl bg-primary/[0.04] border border-primary/20 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Smile className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-foreground">The Simple Analogy:</h3>
          </div>
          <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium pt-1">
            {result.analogyStory}
          </p>
        </div>

        {/* 3. Why It Matters in Real Life */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Why It Matters:</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {result.whyItMatters}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/60 border border-border/60 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Fun Fact:</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              {result.funFact}
            </p>
          </div>
        </div>

      </div>

      {/* Integrated AI Assistant */}
      <StudentAiSidekick
        toolName="Explain Like I'm 10"
        contextData={`Concept: ${result.concept}. Analogy: ${result.analogyStory}`}
        placeholder="Ask a follow-up question or request an even simpler analogy..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />

    </div>
  );
}
