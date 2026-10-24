import { useState, useRef } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import { NotebookPodcastPlayer, PodcastLine } from "./NotebookPodcastPlayer";
import {
  FileText,
  Upload,
  Sparkles,
  Copy,
  BookOpen,
  Check,
  Loader2,
  ListOrdered,
  Layers,
  Key,
  HelpCircle,
  Headphones,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type SummaryMode = "takeaways" | "formulas" | "cheatsheet" | "flashcards" | "podcast";

const samplePastedText = `Cellular respiration is a set of metabolic reactions and processes that take place in the cells of organisms to convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The reactions involved in respiration are catabolic reactions, which break large molecules into smaller ones, releasing energy because weak high-energy bonds, in particular in molecular oxygen, are replaced by stronger bonds in the products.

The overall chemical equation is:
C6H12O6 + 6 O2 -> 6 CO2 + 6 H2O + 36-38 ATP

Respiration occurs in three major phases:
1. Glycolysis: Occurs in the cytoplasm. Breaks 1 glucose into 2 pyruvate molecules, yielding a net of 2 ATP and 2 NADH. Does not require oxygen (anaerobic).
2. The Krebs Cycle (Citric Acid Cycle): Occurs in the mitochondrial matrix. Converts acetyl-CoA into CO2, generating 2 ATP, 6 NADH, and 2 FADH2.
3. Oxidative Phosphorylation & Electron Transport Chain (ETC): Located in the inner mitochondrial membrane. Uses electrons from NADH and FADH2 across ATP synthase to generate approximately 30-34 ATP. Oxygen acts as the final electron acceptor.`;

export function PdfSummarizerStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();
  const [inputText, setInputText] = useState(samplePastedText);
  const [summaryMode, setSummaryMode] = useState<SummaryMode>("takeaways");
  const [summaryOutput, setSummaryOutput] = useState<string>("");
  const [podcastScript, setPodcastScript] = useState<PodcastLine[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast({ description: "Please upload a valid PDF file.", variant: "destructive" });
      return;
    }

    toast({ description: `Reading ${file.name}...` });

    try {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = async () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        let text = "";
        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          text += pageText + "\n\n";
        }

        if (text.trim()) {
          setInputText(text.trim());
          toast({ description: `Loaded PDF: ${file.name} (${wordCount} words)` });
        }
      };
      document.body.appendChild(script);
    } catch (err: any) {
      toast({ description: "Could not read PDF directly. You can paste the text instead.", variant: "destructive" });
    }
  };

  const handleGenerateSummary = async (mode = summaryMode) => {
    if (!inputText.trim()) {
      toast({ description: "Please paste text or upload a PDF first.", variant: "destructive" });
      return;
    }

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI limit reached. Upgrade for unlimited summaries!", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    setSummaryMode(mode);

    if (mode === "podcast") {
      try {
        const prompt = `Convert the following study text into a witty, high-retention 5-line educational dialogue between two AI podcast hosts:
- Host 1: "Alex" (curious student asking why)
- Host 2: "Maya" (brilliant conceptual explainer with vivid analogies)

Return ONLY a valid JSON array of objects:
[
  {
    "speaker": "Alex",
    "role": "The Inquisitive Host",
    "avatarColor": "bg-blue-500",
    "text": "..."
  },
  {
    "speaker": "Maya",
    "role": "The Science Co-Host",
    "avatarColor": "bg-pink-500",
    "text": "..."
  }
]
SOURCE MATERIAL:
${inputText.slice(0, 4000)}

Return pure JSON array only.`;

        const response = await generateAIResponse(
          prompt,
          ageGroup,
          role,
          [],
          "You are a podcast writer. Return valid JSON only."
        );

        const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setPodcastScript(parsed);
          toast({ description: "2-Host Study Podcast generated!" });
        }
      } catch (err: any) {
        console.error(err);
        toast({ description: "Generated default podcast dialogue.", variant: "default" });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    let promptModeInstruction = "";
    if (mode === "takeaways") {
      promptModeInstruction = "Summarize the text into 4-6 high-yield bullet takeaways. Highlight crucial takeaways and concepts with bold text.";
    } else if (mode === "formulas") {
      promptModeInstruction = "Extract all key formulas, scientific laws, definitions, and equations in clean bullet points with brief explanations.";
    } else if (mode === "cheatsheet") {
      promptModeInstruction = "Format an executive 1-page exam revision cheat sheet with (1) Core Summary, (2) Key Terms & Definitions, (3) Likely Exam Pitfalls.";
    } else if (mode === "flashcards") {
      promptModeInstruction = "Convert the primary facts in this text into a 5-item Front/Back flashcard revision list.";
    }

    try {
      const prompt = `${promptModeInstruction}
      
SOURCE TEXT:
${inputText.slice(0, 5000)}

Format the output cleanly in readable markdown.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an academic summarizer. Synthesize clear, high-yield study materials."
      );

      setSummaryOutput(response);
      toast({ description: "Summary generated successfully!" });
    } catch (err: any) {
      console.error(err);
      toast({ description: "Failed to generate summary. Please try again.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryOutput) return;
    navigator.clipboard.writeText(summaryOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ description: "Copied summary to clipboard" });
  };

  const handleSaveToNotes = () => {
    if (!summaryOutput) return;
    const title = `Summary: ${summaryMode.toUpperCase()} (${new Date().toLocaleDateString()})`;
    addNote(title, summaryOutput);
    toast({ description: "Saved summary to Smart Notes!" });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* ─── Studio Header ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-500/10 text-pink-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">PDF & Notes Summarizer</h1>
            <p className="text-xs text-muted-foreground">Extract high-yield takeaways, formulas, and 2-host audio podcasts from any document.</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePdfUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="text-xs rounded-xl"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload PDF
          </Button>
          <Button
            onClick={() => setSidekickOpen(!sidekickOpen)}
            size="sm"
            className="text-xs rounded-xl font-semibold"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
          </Button>
        </div>
      </div>

      {/* ─── Main 2-Column Split Studio ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left (5 cols): Source Material Input & Mode Selector */}
        <div className="lg:col-span-5 bg-card border border-border/70 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Source Material</h3>
            <span className="text-[11px] text-muted-foreground font-medium">{wordCount} words</span>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste textbook chapter, class notes, or study material here..."
            className="w-full h-72 bg-secondary/50 border border-border/70 rounded-2xl p-3.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none custom-scrollbar leading-relaxed"
          />

          {/* Mode Selector Buttons */}
          <div className="space-y-2">
            <label className="text-[10.5px] uppercase font-bold text-muted-foreground tracking-wider block">
              Extract Mode:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "takeaways", label: "Key Takeaways", icon: ListOrdered },
                { id: "formulas", label: "Formulas & Terms", icon: Key },
                { id: "cheatsheet", label: "Exam Cheat Sheet", icon: Layers },
                { id: "podcast", label: "Audio Podcast", icon: Headphones }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => {
                    setSummaryMode(id as SummaryMode);
                    handleGenerateSummary(id as SummaryMode);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    summaryMode === id
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-secondary/60 hover:bg-secondary border-border/70 text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={() => handleGenerateSummary()}
            disabled={isProcessing || !inputText.trim()}
            className="w-full rounded-xl text-xs font-bold py-2.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Analyzing Document...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-4 w-4" /> Generate {summaryMode === "podcast" ? "Audio Podcast" : "Summary"}
              </>
            )}
          </Button>
        </div>

        {/* Right (7 cols): Formatted Summary Output or Audio Podcast Player */}
        <div className="lg:col-span-7 bg-card border border-border/70 rounded-3xl p-5 space-y-4 shadow-xs min-h-[460px] flex flex-col justify-between">
          <div>
            {summaryMode === "podcast" ? (
              <NotebookPodcastPlayer
                topicTitle="Study Material Deep Dive"
                customScript={podcastScript}
                onGenerateNew={() => handleGenerateSummary("podcast")}
                isGenerating={isProcessing}
              />
            ) : (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground capitalize">
                      {summaryMode} Output
                    </span>
                    {summaryOutput && (
                      <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    )}
                  </div>

                  {summaryOutput && (
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={handleCopy}
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        onClick={handleSaveToNotes}
                        variant="outline"
                        size="sm"
                        className="h-7 px-2.5 text-xs font-semibold rounded-lg"
                      >
                        <BookOpen className="h-3.5 w-3.5 mr-1 text-primary" /> Save Note
                      </Button>
                    </div>
                  )}
                </div>

                {/* Output View */}
                <div className="pt-4">
                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <Loader2 className="h-7 w-7 text-primary animate-spin" />
                      <p className="text-xs font-semibold text-foreground">Synthesizing high-yield study material...</p>
                      <p className="text-[11px] text-muted-foreground">Condensing paragraphs into clean structured points.</p>
                    </div>
                  ) : summaryOutput ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed text-foreground space-y-3 whitespace-pre-wrap">
                      {summaryOutput}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <div className="p-3 rounded-2xl bg-secondary text-muted-foreground">
                        <FileCode className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-foreground">No summary generated yet</h4>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Paste your notes on the left or upload a PDF, then click "Generate Summary" to extract takeaways.
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Integrated AI Assistant */}
      <StudentAiSidekick
        toolName="PDF & Notes Summarizer"
        contextData={`Document text snippet:\n${inputText.slice(0, 1000)}\n\nCurrent summary:\n${summaryOutput.slice(0, 1000)}`}
        placeholder="Ask a question about this document or request more detail..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />

    </div>
  );
}
