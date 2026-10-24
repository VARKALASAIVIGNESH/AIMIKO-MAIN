import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { Plus, Trash2, Mail, Copy, Check, Info } from "lucide-react";

interface AdultsWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

export function AdultsWidgets({ activeToolLabel, suggestedPrompt, onClose }: AdultsWidgetsProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // --- SWOT Analysis States ---
  const [swotData, setSwotData] = useState<{
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  }>({
    strengths: ["Strong technical foundations", "Low overhead structures"],
    weaknesses: ["Small initial customer base", "Lack of heavy marketing capital"],
    opportunities: ["Vast demand in adaptive learning AI", "Niche B2B SaaS integrations"],
    threats: ["Rapid feature updates from competitors", "Changing data compliance rules"]
  });
  const [activeQuadrant, setActiveQuadrant] = useState<"strengths" | "weaknesses" | "opportunities" | "threats">("strengths");
  const [quadItem, setQuadItem] = useState("");

  // --- Email Composer States ---
  const [emailTopic, setEmailTopic] = useState("");
  const [emailTone, setEmailTone] = useState<"professional" | "friendly" | "urgent" | "apologetic">("professional");
  const [emailLength, setEmailLength] = useState<"short" | "medium" | "detailed">("medium");
  const [includeEmojis, setIncludeEmojis] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSWOTAnalysis = async (idea: string) => {
    if (!idea.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Perform a high-impact SWOT Analysis for this business: "${idea}". Format the response strictly as a JSON object:
{
  "strengths": ["Item A", "Item B"],
  "weaknesses": ["Item C"],
  "opportunities": ["Item D"],
  "threats": ["Item E"]
}`;
      const response = await generateAIResponse(prompt, "adults", "founder");
      
      try {
        const cleanedJson = response.substring(
          response.indexOf("{"),
          response.lastIndexOf("}") + 1
        );
        const parsed = JSON.parse(cleanedJson) as typeof swotData;
        setSwotData(parsed);
      } catch {
        // Mock fallback values
        setSwotData({
          strengths: ["Unique selling proposition", "Highly adaptive interface"],
          weaknesses: ["Context window boundaries", "Initial compute overheads"],
          opportunities: ["Scale through partnerships", "Mobile integration pipelines"],
          threats: ["Competitor API pricing increases", "Regulatory compliance shifts"]
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddSwotItem = () => {
    if (!quadItem.trim()) return;
    setSwotData(prev => ({
      ...prev,
      [activeQuadrant]: [...prev[activeQuadrant], quadItem.trim()]
    }));
    setQuadItem("");
  };

  const handleDeleteSwotItem = (quad: keyof typeof swotData, idx: number) => {
    setSwotData(prev => ({
      ...prev,
      [quad]: prev[quad].filter((_, i) => i !== idx)
    }));
  };

  const handleEmailDraft = async () => {
    if (!emailTopic.trim()) return;
    setAiLoading(true);
    setEmailDraft("");
    
    try {
      const prompt = `Write a corporate email draft about: "${emailTopic}". 
Tone: ${emailTone}. 
Length: ${emailLength}. 
Include Emojis: ${includeEmojis ? "Yes" : "No"}.
Keep subject line clearly marked as "Subject: ..." and standard formatting.`;

      const response = await generateAIResponse(prompt, "adults", "analyst");
      setEmailDraft(response);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!emailDraft) return;
    navigator.clipboard.writeText(emailDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-bubble relative space-y-8 animate-pop-in border-border/60 shadow-2xl">
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
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">AIMIKO Professional Workspace 💼</p>
        </div>
      </div>

      {/* 1. Idea Validation / SWOT Dashboard */}
      {activeToolLabel === "Idea Validation Suite" && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Type your business concept below. AIMIKO will initialize your SWOT board, which you can customize further!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 bg-muted p-3 rounded-2xl border border-border">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. A micro-SaaS for real estate pricing reports"
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              disabled={aiLoading}
            />
            <Button 
              onClick={() => handleSWOTAnalysis(customInput)} 
              className="text-xs rounded-xl px-5 py-2.5 hover-bounce font-bold" 
              disabled={aiLoading || !customInput.trim()}
            >
              Build SWOT 📊
            </Button>
          </div>

          {aiLoading && (
            <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
              🐒 Analyzing market data and structuring SWOT quadrants...
            </div>
          )}

          {/* Interactive 2x2 SWOT Board */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strengths */}
            <div className="bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-5 hover-lift transition-all duration-300 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black text-emerald-500 tracking-wider">Strengths (S)</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90">
                {swotData.strengths.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center group bg-card px-3 py-2 rounded-xl border border-border/40 shadow-xs transition-all hover:scale-[1.01]">
                    <span className="leading-snug">{item}</span>
                    <button 
                      onClick={() => handleDeleteSwotItem("strengths", idx)} 
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                      title="Delete Bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-rose-500/5 dark:bg-rose-950/10 border border-rose-500/20 rounded-2xl p-5 hover-lift transition-all duration-300 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black text-rose-500 tracking-wider">Weaknesses (W)</span>
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90">
                {swotData.weaknesses.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center group bg-card px-3 py-2 rounded-xl border border-border/40 shadow-xs transition-all hover:scale-[1.01]">
                    <span className="leading-snug">{item}</span>
                    <button 
                      onClick={() => handleDeleteSwotItem("weaknesses", idx)} 
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                      title="Delete Bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Opportunities */}
            <div className="bg-sky-500/5 dark:bg-sky-950/10 border border-sky-500/20 rounded-2xl p-5 hover-lift transition-all duration-300 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black text-sky-500 tracking-wider">Opportunities (O)</span>
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-ping"></span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90">
                {swotData.opportunities.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center group bg-card px-3 py-2 rounded-xl border border-border/40 shadow-xs transition-all hover:scale-[1.01]">
                    <span className="leading-snug">{item}</span>
                    <button 
                      onClick={() => handleDeleteSwotItem("opportunities", idx)} 
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                      title="Delete Bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Threats */}
            <div className="bg-amber-500/5 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-5 hover-lift transition-all duration-300 relative shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase font-black text-amber-500 tracking-wider">Threats (T)</span>
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              </div>
              <ul className="space-y-2 text-xs text-foreground/90">
                {swotData.threats.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center group bg-card px-3 py-2 rounded-xl border border-border/40 shadow-xs transition-all hover:scale-[1.01]">
                    <span className="leading-snug">{item}</span>
                    <button 
                      onClick={() => handleDeleteSwotItem("threats", idx)} 
                      className="text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5"
                      title="Delete Bullet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Add custom items to SWOT quadrants */}
          <div className="bg-muted/30 border border-border p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-end shadow-sm">
            <div className="space-y-1.5 w-full sm:w-1/3">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Target Quadrant</label>
              <select
                value={activeQuadrant}
                onChange={(e) => setActiveQuadrant(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none cursor-pointer transition shadow-xs"
              >
                <option value="strengths">Strengths</option>
                <option value="weaknesses">Weaknesses</option>
                <option value="opportunities">Opportunities</option>
                <option value="threats">Threats</option>
              </select>
            </div>
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">SWOT Bullet Content</label>
              <input
                value={quadItem}
                onChange={(e) => setQuadItem(e.target.value)}
                placeholder="e.g. Fast response models"
                className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none transition shadow-xs"
              />
            </div>
            <Button onClick={handleAddSwotItem} className="text-xs rounded-xl py-2.5 px-5 flex items-center justify-center gap-1.5 hover-bounce font-bold shadow-md">
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
        </div>
      )}

      {/* 2. Corporate Email Composer */}
      {activeToolLabel === "AI Script Generator" && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Adjust style parameters to draft professional, context-adapted corporate emails instantly.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 bg-muted/50 p-5 rounded-2xl border border-border shadow-sm">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Tone Profile</label>
              <select
                value={emailTone}
                onChange={(e) => setEmailTone(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly / Warm</option>
                <option value="urgent">Urgent</option>
                <option value="apologetic">Apologetic</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Email Length</label>
              <select
                value={emailLength}
                onChange={(e) => setEmailLength(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="short">Short (Bullet summary)</option>
                <option value="medium">Medium (Standard)</option>
                <option value="detailed">Detailed (Thorough)</option>
              </select>
            </div>
            <div className="space-y-1.5 flex items-center h-full pt-4 pl-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-muted-foreground select-none">
                <input
                  type="checkbox"
                  checked={includeEmojis}
                  onChange={(e) => setIncludeEmojis(e.target.checked)}
                  className="accent-primary h-4.5 w-4.5 cursor-pointer rounded-lg border-border"
                />
                Include Emojis?
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground block">Email context or topics:</label>
            <textarea
              value={emailTopic}
              onChange={(e) => setEmailTopic(e.target.value)}
              placeholder="e.g. Rescheduling our marketing budget sync to Friday morning due to calendar conflict."
              className="w-full min-h-[100px] bg-card border border-border rounded-2xl p-4 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-inner"
            />
            <Button onClick={handleEmailDraft} className="w-full text-xs rounded-xl py-3 flex items-center justify-center gap-2 hover-bounce font-bold shadow-md" disabled={aiLoading || !emailTopic.trim()}>
              <Mail className="h-4 w-4" /> Generate Professional Email Draft
            </Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
              🐒 Shaping tone modifiers and writing draft...
            </div>
          ) : emailDraft && (
            <div className="relative group animate-slide-up-bounce">
              <div className="bg-card/40 p-6 rounded-2xl border border-border/60 shadow-md text-xs leading-relaxed text-foreground whitespace-pre-wrap font-medium">
                {emailDraft}
              </div>
              <button
                onClick={handleCopyEmail}
                className="absolute top-3 right-3 p-2.5 bg-card hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-xl transition shadow-sm cursor-pointer hover-bounce"
                title="Copy to Clipboard"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          )}
        </div>
      )}

      {activeToolLabel !== "Idea Validation Suite" && 
       activeToolLabel !== "AI Script Generator" && (
         <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
