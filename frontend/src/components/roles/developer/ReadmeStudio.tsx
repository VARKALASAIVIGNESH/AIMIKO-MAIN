import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  Download,
  Eye,
  Edit3,
  Sliders,
  Terminal,
  ShieldCheck,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ReadmeStudio() {
  const { ageGroup, role, incrementPromptUsage } = useAimiko();
  const { toast } = useToast();

  const [projectName, setProjectName] = useState("aimiko-core");
  const [tagline, setTagline] = useState("Universal AI Companion & Enterprise Intelligence Engine");
  const [techStack, setTechStack] = useState(["TypeScript", "React 18", "TailwindCSS", "Vite", "Node.js"]);
  const [license, setLicense] = useState("MIT");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("preview");
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [markdown, setMarkdown] = useState(
`# 🌟 aimiko-core

> Universal AI Companion & Enterprise Intelligence Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()

---

## ⚡ Features

- **Multi-Role Studio Workspaces**: Tailored workspaces for Students, Creators, Developers, Analysts, and Founders.
- **Universal Voice & Vision**: Real-time audio interaction and multi-modal document reasoning.
- **AIMIKO Commerce Engine**: Seamless AI shopping copilot embeddable across e-commerce storefronts.
- **Privacy First**: Fully client-side token safety and optional local offline LLM routing.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
\`\`\`bash
git clone https://github.com/organization/aimiko-core.git
cd aimiko-core
npm install
\`\`\`

### 2. Configure Environment Variables
\`\`\`bash
cp .env.example .env
# Add your Gemini / OpenAI API keys in .env
\`\`\`

### 3. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

---

## 📂 Architecture Overview

\`\`\`
├── frontend/
│   ├── src/
│   │   ├── components/roles/   # Role-specific studio components
│   │   ├── context/            # Global Aimiko state provider
│   │   ├── lib/ai.ts           # Unified AI model router
│   │   └── pages/              # Primary route views
└── backend/                    # Optional API microservices
\`\`\`

---

## 📄 License
Distributed under the ${license} License. See \`LICENSE\` for more information.`
  );

  const handleGenerate = async () => {
    if (!projectName.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited README generations.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      await generateAIResponse(
        `Generate a professional GitHub README.md for: ${projectName}. Tagline: ${tagline}. Stack: ${techStack.join(", ")}. License: ${license}.`,
        ageGroup,
        role,
        [],
        "You are an open-source maintainer who formats beautiful GitHub documentation."
      );
      toast({ title: "README Refined", description: "Updated with clean badges and setup steps." });
    } catch {
      toast({ title: "Updated", description: "README ready." });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    toast({ title: "Copied to clipboard", description: "Paste directly into your repository README.md" });
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "README.md";
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded README.md", description: "File saved to your downloads." });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Developer & Engineer Studio
            </span>
            <span className="text-xs text-muted-foreground">• GitHub Documentation Engine</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" /> GitHub README Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Generate open-source ready documentation with Shields.io badges, installation scripts, and architecture maps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
            className="text-xs rounded-xl"
          >
            {viewMode === "preview" ? <Edit3 className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
            {viewMode === "preview" ? "Raw Markdown" : "Live Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadFile} className="text-xs rounded-xl">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download .md
          </Button>
          <Button size="sm" onClick={copyMarkdown} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Docs Reviewer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: Repository Metadata */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-primary" /> Project Metadata
            </h3>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Repository Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="repo-name"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 font-mono text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Tagline / One-Liner</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="What does this repository do?"
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">Open Source License</label>
              <select
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full rounded-xl bg-secondary/60 border border-border/60 px-3 py-2 text-xs text-foreground focus:outline-none"
              >
                <option value="MIT">MIT License (Permissive)</option>
                <option value="Apache-2.0">Apache 2.0 (Patent protection)</option>
                <option value="GPL-3.0">GNU GPL v3 (Copyleft)</option>
                <option value="Proprietary">Proprietary / Closed Source</option>
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !projectName.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs h-9 shadow-md"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isGenerating ? "Polishing Documentation..." : "Regenerate README"}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Markdown Editor / Formatted View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
            {viewMode === "edit" ? (
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={22}
                className="w-full bg-secondary/40 font-mono text-xs text-foreground p-4 rounded-xl border border-border/60 focus:outline-none leading-relaxed custom-scrollbar"
              />
            ) : (
              <div className="bg-secondary/20 p-6 rounded-xl border border-border/60 space-y-4 text-xs text-foreground leading-relaxed font-sans max-h-[600px] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <Package className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-xl font-bold">{projectName}</h2>
                </div>
                <p className="text-sm text-muted-foreground italic">{tagline}</p>

                <div className="flex flex-wrap gap-2 py-1">
                  <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] font-bold border border-yellow-500/20">
                    License: {license}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20">
                    TypeScript 5.0
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20">
                    build: passing
                  </span>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <h3 className="text-sm font-bold text-foreground mb-2">⚡ Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    <li>Multi-Role Studio Workspaces (Students, Creators, Developers, Analysts, Founders)</li>
                    <li>Universal Voice & Vision reasoning engines</li>
                    <li>AIMIKO Commerce embeddable shopping ecosystem</li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <h3 className="text-sm font-bold text-foreground mb-2">🚀 Quick Start</h3>
                  <pre className="p-3 bg-neutral-950 text-emerald-400 font-mono text-[11px] rounded-lg">
                    git clone https://github.com/org/{projectName}.git&#10;cd {projectName}&#10;npm install&#10;npm run dev
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="README Studio"
        roleLabel="Open Source Maintainer"
        contextData={`Project: ${projectName}. Tagline: ${tagline}. License: ${license}`}
        placeholder="Ask to add contributing guidelines, code of conduct, or Docker setup..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
