import { useState } from "react";
import { Button } from "@/components/ui/button";
import { generateAIResponse } from "@/lib/ai";
import { useAimiko } from "@/context/AimikoContext";

import { useNavigate } from "react-router-dom";

interface GenericToolWidgetProps {
  label: string;
  suggestedPrompt?: string;
}

export function GenericToolWidget({ label, suggestedPrompt }: GenericToolWidgetProps) {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const navigate = useNavigate();
  const [aiLoading, setAiLoading] = useState(false);
  const [input, setInput] = useState(suggestedPrompt || "");
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    if (!incrementPromptUsage()) {
      if (confirm("You have reached your daily limit of 5 free prompts. Upgrade to Premium for 100 daily prompts?")) {
        navigate("/upgrade");
      }
      return;
    }
    setAiLoading(true);
    try {
      const response = await generateAIResponse(
        input,
        ageGroup || "teens",
        role || "student"
      );
      setResult(response);
    } catch (e) {
      console.error(e);
      setResult("Oops! Something went wrong generating your response.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-pop-in">
      <p className="text-xs text-muted-foreground leading-relaxed">Customize your prompt below to get instant results for <strong>{label}</strong>!</p>
      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What would you like me to do?"
          className="w-full min-h-[110px] bg-card/50 border border-border/60 rounded-2xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-inner"
        />
        <Button onClick={handleGenerate} className="w-full text-xs rounded-xl py-3 hover-bounce font-bold shadow-md">
          Generate AI Result 🚀
        </Button>
      </div>

      {aiLoading ? (
        <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
          🐒 AIMIKO is thinking and crafting the perfect response...
        </div>
      ) : result && (
        <div className="bg-card/40 p-6 rounded-2xl border border-border/60 shadow-md text-xs leading-relaxed text-foreground whitespace-pre-wrap font-medium max-h-[300px] overflow-y-auto custom-scrollbar animate-slide-up-bounce">
          {result}
        </div>
      )}
    </div>
  );
}
