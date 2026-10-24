import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  Briefcase,
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  HelpCircle,
  Eye,
  Sliders,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SlideOutline {
  slideNumber: number;
  title: string;
  keyTakeaway: string;
  bullets: string[];
  visualCue: string;
  investorTrap: string;
}

export function PitchDeckStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("Aimiko");
  const [fundingRound, setFundingRound] = useState("Seed ($1.5M)");
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const [slides, setSlides] = useState<SlideOutline[]>([
    {
      slideNumber: 1,
      title: "Title & The 1-Line Hook",
      keyTakeaway: "Aimiko is the universal AI shopping ecosystem bringing smart purchasing agents directly onto merchant storefronts.",
      bullets: [
        "Company Name & Logo",
        "Clear High-Concept Pitch: 'The Stripe for AI Shopping Assistance'",
        "Presenter Names & Founding Credentials"
      ],
      visualCue: "Hero screenshot of the AI assistant answering a product question on a live store mockup.",
      investorTrap: "Don't sound like a generic ChatGPT wrapper. Highlight the proprietary store connector architecture."
    },
    {
      slideNumber: 2,
      title: "The Urgent Problem",
      keyTakeaway: "70% of digital shoppers abandon carts because finding answers, comparing variants, and verifying discounts takes too much friction.",
      bullets: [
        "$4 Trillion in abandoned shopping carts globally each year",
        "Merchants spend huge ad budgets acquiring visitors who bounce without buying",
        "Static FAQ pages and slow ticket support fail modern high-intent shoppers"
      ],
      visualCue: "Leaky funnel diagram showing 10,000 visitors dropping down to only 120 completed checkouts.",
      investorTrap: "Prove that merchants actually care about this pain point and will actively pay software subscriptions to fix it."
    },
    {
      slideNumber: 3,
      title: "The Solution & 'Why Now'",
      keyTakeaway: "Aimiko embeds in 1 click, answers inventory queries in real-time, recommends valid offers, and recovers lost carts autonomously.",
      bullets: [
        "Autonomous store agent with live inventory & checkout sync",
        "Zero latency reasoning via local & cached inference",
        "Why Now: Consumer readiness for conversational commerce has reached mainstream inflection"
      ],
      visualCue: "Split-screen comparing tedious manual browsing vs instantaneous AIMIKO AI purchase flow.",
      investorTrap: "Show why big platforms (Shopify/Amazon) won't easily replicate your cross-store network advantage."
    },
    {
      slideNumber: 4,
      title: "Market Size & Opportunity",
      keyTakeaway: "$48B Conversational AI & Personalization market, with a $6.2B immediate addressable beachhead in independent DTC stores.",
      bullets: [
        "TAM: $48B global digital retail assistance software",
        "SAM: $6.2B (2.1M independent Shopify, WooCommerce & BigCommerce stores)",
        "SOM: $42M ARR beachhead target (2,500 mid-market brands)"
      ],
      visualCue: "Three concentric TAM/SAM/SOM circles with clear bottom-up merchant calculations.",
      investorTrap: "Avoid vague top-down Gartner numbers; show bottom-up math (Number of stores × Average Annual Contract Value)."
    },
    {
      slideNumber: 5,
      title: "Product & Defensible Tech Moat",
      keyTakeaway: "Proprietary multi-store shopping intent graph with universal buyer profiles and sub-100ms latency.",
      bullets: [
        "Plug-and-play connector SDK for Shopify, WooCommerce, and custom headless stacks",
        "Universal buyer memory: cross-store preference continuity",
        "High-margin inference architecture requiring 80% fewer cloud LLM calls"
      ],
      visualCue: "Clean architecture blueprint showing Store Connector -> AIMIKO Engine -> LLM Gateway.",
      investorTrap: "Show deep proprietary technology, not just prompt engineering."
    },
    {
      slideNumber: 6,
      title: "Traction & Early Velocity",
      keyTakeaway: "Demonstrable pilot results showing a 14% lift in completed checkouts and 4.8/5 shopper satisfaction.",
      bullets: [
        "15 pilot e-commerce merchant stores integrated",
        "$180K in incremental shopping cart revenue unlocked",
        "42% repeat engagement rate among shoppers"
      ],
      visualCue: "Up-and-to-the-right cohort retention chart and merchant quote testimonials.",
      investorTrap: "Be upfront about whether traction is paid pilots or free trials; VCs test metric definitions immediately."
    },
    {
      slideNumber: 7,
      title: "Business Model & Unit Economics",
      keyTakeaway: "Predictable B2B SaaS subscription ($99 - $499/mo) with low CAC and strong expansion revenue.",
      bullets: [
        "Starter ($99/mo) • Growth ($249/mo) • Enterprise Custom ($499+/mo)",
        "Target LTV: $4,200 | CAC: $650 (6.4x LTV:CAC ratio)",
        "Payback period under 5 months"
      ],
      visualCue: "Clean 3-tier pricing matrix with gross margin breakdown (85%+ software margins).",
      investorTrap: "Make sure customer acquisition costs factor in Shopify app store rev-share and paid marketing."
    },
    {
      slideNumber: 8,
      title: "Competitive Landscape",
      keyTakeaway: "Unlike generic support bots or native single-store widgets, Aimiko provides universal cross-store shopping intelligence.",
      bullets: [
        "2x2 Matrix: Proactive Shopping vs Passive Support, Universal Network vs Single-Store Island",
        "Legacy live chat: High manual labor, slow response",
        "Aimiko: Instant, autonomous, revenue-generating"
      ],
      visualCue: "2x2 positioning grid placing Aimiko in top-right quadrant (Autonomous & Cross-Store).",
      investorTrap: "Never claim you have 'no competitors'. Acknowledge Zendesk, Gorgias, and Klarna, and articulate your wedge."
    },
    {
      slideNumber: 9,
      title: "The Founding Team",
      keyTakeaway: "World-class blend of e-commerce scaling, distributed systems engineering, and AI product design.",
      bullets: [
        "Founder & CEO: Ex-FinTech/E-commerce growth lead",
        "CTO: Distributed systems engineer with high-concurrency background",
        "Key advisors from top retail tech brands"
      ],
      visualCue: "Founder headshots with logos of previous successful ventures or Tier-1 institutions.",
      investorTrap: "Explain why THIS team has an unfair advantage to win this specific market."
    },
    {
      slideNumber: 10,
      title: "The Ask & 18-Month Milestones",
      keyTakeaway: "Raising $1.5M Seed to reach $1.2M ARR and 600 active paying stores over the next 18 months.",
      bullets: [
        "Use of Funds: 60% Engineering & AI Infra, 30% GTM & Merchant Growth, 10% Ops",
        "Key Milestone 1: Scale to 250 active stores at $500K ARR in 9 months",
        "Key Milestone 2: Launch universal shopper network to hit $1.2M ARR Series A readiness"
      ],
      visualCue: "Milestone timeline bar showing capital deployment against ARR targets.",
      investorTrap: "Be precise on what milestone this round unlocks for the next valuation markup."
    }
  ]);

  const activeSlide = slides[selectedSlideIndex];

  const copyDeckOutline = () => {
    const text = slides.map((s) => `SLIDE ${s.slideNumber}: ${s.title}\nTakeaway: ${s.keyTakeaway}\nBullets:\n${s.bullets.map((b) => `  - ${b}`).join("\n")}\nVisual: ${s.visualCue}\nVC Trap: ${s.investorTrap}\n`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied 10-Slide Deck Outline", description: "Ready to paste into Pitch, Keynote, or Google Slides." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Startup Founder Studio
            </span>
            <span className="text-xs text-muted-foreground">• 10-Slide Investor Deck Architecture</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-amber-500" /> Pitch Deck Outliner Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Structure an institutional-grade 10-slide venture deck with bullet talking points, visual cues, and VC traps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyDeckOutline} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy Deck Outline"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Pitch Coach
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Column: 10 Slide Navigation Grid */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Canonical 10 Slides
          </h3>
          <div className="space-y-1.5">
            {slides.map((s, idx) => (
              <div
                key={s.slideNumber}
                onClick={() => setSelectedSlideIndex(idx)}
                className={`p-3 rounded-xl border text-xs cursor-pointer flex items-center justify-between transition-all ${
                  selectedSlideIndex === idx
                    ? "border-amber-500 bg-amber-500/10 font-bold text-foreground shadow-xs"
                    : "border-border/60 bg-card hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-secondary flex items-center justify-center text-[10px] font-mono">
                    {s.slideNumber}
                  </span>
                  <span className="truncate max-w-[200px]">{s.title}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Slide Blueprint Details */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  Slide {activeSlide.slideNumber} of 10
                </span>
                <h2 className="text-lg font-bold text-foreground mt-0.5">{activeSlide.title}</h2>
              </div>
            </div>

            {/* Core Takeaway */}
            <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                The One Sentence the Investor Must Remember:
              </span>
              <p className="text-xs md:text-sm font-semibold text-foreground leading-relaxed">
                "{activeSlide.keyTakeaway}"
              </p>
            </div>

            {/* Slide Bullets */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground block">
                Slide Content Bullets:
              </span>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {activeSlide.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 bg-secondary/20 p-2.5 rounded-lg border border-border/40">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="text-foreground">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual Direction & VC Trap */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <div className="bg-card border border-border/50 rounded-xl p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 block">
                  Visual Layout Cue:
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeSlide.visualCue}
                </p>
              </div>

              <div className="bg-card border border-amber-500/30 rounded-xl p-3 space-y-1 bg-amber-500/5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block">
                  VC Gotcha / Trap to Avoid:
                </span>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {activeSlide.investorTrap}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleAiSidekick
        toolName="Pitch Deck Studio"
        roleLabel="Venture Pitch Coach"
        contextData={`Company: ${companyName}. Slide: ${activeSlide.slideNumber} - ${activeSlide.title}. Takeaway: ${activeSlide.keyTakeaway}`}
        placeholder="Ask how to handle tough questions on this slide or strengthen the narrative arc..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
