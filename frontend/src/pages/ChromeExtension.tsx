import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Chrome,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
  MessageSquare,
  Globe,
  Download,
  Copy,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";

export default function ChromeExtension() {
  const navigate = useNavigate();
  const [selectedText, setSelectedText] = useState("AIMIKO is an adaptive AI companion that tailors prompt strategies by age bracket and role.");
  const [summaryOutput, setSummaryOutput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSimulateSummarize = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setSummaryOutput("**AIMIKO Summary**: Adaptive AI platform providing age & role-tailored prompt strategies, multi-tenant enterprise tools, and companion AI engines.");
      setIsProcessing(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* Hero Header */}
      <div className="space-y-4 text-left max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-500 text-xs font-semibold">
          <Chrome className="h-3.5 w-3.5" />
          <span>Core Pillar 4 · Browser Companion</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
          AIMIKO <span className="gradient-text">Chrome Extension</span>
        </h1>

        <p className="text-muted-foreground text-sm sm:text-base font-medium leading-relaxed">
          Bring AIMIKO to every website you visit. Highlight any text on the web to summarize articles, translate technical terms, draft context-aware emails, or launch instant AI sidepanel chats.
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="lg"
            className="rounded-2xl px-6 py-5 text-xs font-semibold aimiko-gradient text-white border-0 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            onClick={() => alert("Downloading AIMIKO Chrome Extension bundle (manifest.json & background worker)...")}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Extension Zip
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-2xl px-6 py-5 text-xs font-semibold"
            onClick={() => navigate("/chat")}
          >
            <MessageSquare className="mr-2 h-4 w-4 text-primary" />
            Try Live Companion
          </Button>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Try Extension Sidepanel Sandbox</h3>
              <p className="text-xs text-muted-foreground font-medium">Highlight web text below to test instant AI actions</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            ● Extension Active
          </span>
        </div>

        {/* Text sandbox */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Simulated Webpage Text</label>
          <textarea
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            rows={3}
            className="w-full bg-secondary/60 border border-border/60 rounded-2xl p-4 text-xs sm:text-sm font-medium focus:outline-none focus:border-cyan-500 transition-colors"
          />

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              onClick={handleSimulateSummarize}
              disabled={isProcessing}
              size="sm"
              className="rounded-xl aimiko-gradient text-white text-xs font-semibold"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {isProcessing ? "Summarizing..." : "Summarize Highlight"}
            </Button>

            <Button
              onClick={() => {
                setSummaryOutput("**Simplified**: AIMIKO is an AI buddy that changes how it talks depending on how old you are and what job you do!");
              }}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              Explain Simply
            </Button>

            <Button
              onClick={() => {
                setSummaryOutput("**Drafted Email**: Hi team, I wanted to share details regarding the AIMIKO adaptive AI platform architecture. Let me know your thoughts!");
              }}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              Draft Email Response
            </Button>
          </div>
        </div>

        {/* Output box */}
        {summaryOutput && (
          <div className="p-4 rounded-2xl bg-secondary/80 border border-cyan-500/30 text-xs font-medium space-y-2 animate-pop-in">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500">Extension Popup Output</span>
            <p className="leading-relaxed">{summaryOutput}</p>
          </div>
        )}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">1-Click Article Summarizer</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Summarize 10-page articles, research PDFs, or long documentation in 3 bullet takeaways without switching tabs.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Browser Sidepanel Chat</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Open the native Chrome Sidepanel to chat with AIMIKO, reference open tab content, and ask follow-up questions.
          </p>
        </div>

        <div className="bg-card border border-border/80 rounded-3xl p-6 space-y-3">
          <div className="p-3 w-fit rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-500">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold">Local & Secure Privacy</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Connects securely to your local AIMIKO FastAPI backend (`http://127.0.0.1:8000`) or local Ollama model instance.
          </p>
        </div>
      </div>

      {/* Installation Steps */}
      <div className="bg-card border border-border/80 rounded-3xl p-8 space-y-6">
        <h3 className="text-xl font-bold">How to Install in 3 Easy Steps</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-2xl font-black text-primary">01</span>
            <h4 className="text-sm font-bold">Download & Unzip</h4>
            <p className="text-xs text-muted-foreground font-medium">Download the extension zip file and extract the contents to a local folder.</p>
          </div>

          <div className="space-y-2">
            <span className="text-2xl font-black text-primary">02</span>
            <h4 className="text-sm font-bold">Enable Developer Mode</h4>
            <p className="text-xs text-muted-foreground font-medium">Open Chrome, navigate to <code className="text-primary font-mono">chrome://extensions</code>, and toggle Developer Mode ON.</p>
          </div>

          <div className="space-y-2">
            <span className="text-2xl font-black text-primary">03</span>
            <h4 className="text-sm font-bold">Load Unpacked</h4>
            <p className="text-xs text-muted-foreground font-medium">Click "Load Unpacked" and select the unzipped AIMIKO extension folder!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
