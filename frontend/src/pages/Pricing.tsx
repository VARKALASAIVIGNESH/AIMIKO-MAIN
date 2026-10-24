import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Clock,
  Shield,
  Zap,
  Bot,
  Layers,
  HelpCircle,
  Bell,
  Check,
  ChevronRight,
  ArrowUpRight,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MainNavbar from "@/components/MainNavbar";

export default function Pricing() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsJoined(true);
    toast.success("You're on the early-access VIP list! We'll notify you first.");
    setEmail("");
  };

  const PLANS = [
    {
      id: "beta",
      name: "Early Access Beta",
      badge: "CURRENTLY ACTIVE",
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200",
      price: "₹0",
      period: "free during beta",
      desc: "Instant access to all core AIMIKO modules with unlimited daily exploration.",
      cta: "Get Started Free",
      ctaVariant: "outline" as const,
      action: () => navigate("/buddy"),
      features: [
        "Full access to AIMIKO Buddy (Habits & Planner)",
        "AIMIGO everyday transit simulator & route comparisons",
        "AIMIKO Learn study tutor & instant explanations",
        "MIKO Autonomous Agent sandbox (100 free actions/mo)",
        "Standard Gemini & Groq fast inference",
        "Community & Discord support",
      ],
    },
    {
      id: "pro",
      name: "AIMIKO Pro",
      badge: "COMING SOON",
      badgeColor: "bg-gradient-to-r from-violet-600 to-pink-600 text-white border-transparent",
      highlight: true,
      price: billingCycle === "monthly" ? "₹799" : "₹599",
      period: "/ month",
      desc: "For power users, creators, and professionals demanding high-speed AI execution.",
      cta: "Join Pro Waitlist",
      ctaVariant: "default" as const,
      action: () => {
        const el = document.getElementById("waitlist");
        el?.scrollIntoView({ behavior: "smooth" });
      },
      features: [
        "Everything in Beta Tier, plus:",
        "Unlimited MIKO autonomous real-world actions",
        "AIMIKO Pulse: Advanced SQL queries & automated KPI forecasts",
        "AIMIKO Commerce: Multi-store price drop alerts & auto-sniper",
        "Priority GPU compute queue (Sub-50ms latency)",
        "Multi-model switching (GPT-4o, Claude 3.5, Gemini 1.5 Pro)",
        "Personalized long-term memory & cross-app sync",
      ],
    },
    {
      id: "enterprise",
      name: "AIMIKO Works (Enterprise)",
      badge: "COMING SOON",
      badgeColor: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200",
      price: "Custom",
      period: "tailored to team scale",
      desc: "Deploy autonomous AI employee squads, custom CRM pipelines & enterprise automation.",
      cta: "Request Early B2B Access",
      ctaVariant: "outline" as const,
      action: () => navigate("/agency"),
      features: [
        "Full AIMIKO Works autonomous employee suite",
        "Multi-tenant company dashboard with role-based access",
        "Custom API integrations, CRM sync & webhook triggers",
        "Enterprise-grade data isolation & SOC 2 compliant storage",
        "Dedicated account manager & 99.9% uptime SLA",
        "Custom fine-tuned LLM models trained on your company data",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfcfe] via-[#f8f5ff] to-[#f2edfe] dark:from-[#0b0f19] dark:via-[#0f172a] dark:to-[#171126] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* ─── Top Navbar ─── */}
      <MainNavbar />

      {/* ─── Hero Section ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        {/* Glowing Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
          <span>Public Beta · Official Pricing Coming Soon</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Transparent, fair pricing for{" "}
          <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-sky-500 bg-clip-text text-transparent">
            everyone.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          During our open preview, all core AIMIKO ecosystem modules are <strong>100% free</strong>. Lock in lifetime early-bird discounts before official tier rollout!
        </p>

        {/* Monthly / Yearly Billing Switcher */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-12">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              billingCycle === "monthly"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              billingCycle === "yearly"
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Yearly Billing
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-pink-500 text-white">
              SAVE 25%
            </span>
          </button>
        </div>
      </div>

      {/* ─── 3 Tier Cards ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-200 ${
                plan.highlight
                  ? "bg-white dark:bg-slate-900 border-2 border-violet-500 shadow-2xl shadow-violet-500/15 scale-[1.03] z-10"
                  : "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 via-pink-600 to-sky-500 text-white text-[11px] font-black uppercase tracking-wider shadow-md">
                  ★ Most Popular Choice
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${plan.badgeColor}`}
                  >
                    {plan.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                  {plan.desc}
                </p>

                <div className="flex items-baseline gap-1 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Included in this plan:
                  </p>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={plan.action}
                variant={plan.ctaVariant}
                size="lg"
                className={`w-full font-bold rounded-xl py-6 text-sm ${
                  plan.highlight
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-700 hover:to-pink-700 text-white shadow-lg shadow-violet-500/25"
                    : ""
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ─── VIP Early Access Waitlist Banner ─── */}
      <div id="waitlist" className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-violet-700 via-purple-700 to-pink-600 text-white relative overflow-hidden shadow-2xl shadow-purple-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-4 text-pink-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              VIP Early Access
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Lock in 50% lifetime discount on AIMIKO Pro.
            </h2>
            <p className="text-sm sm:text-base text-purple-100 mb-8 leading-relaxed">
              Join 12,000+ creators, students, and founders on the early list. You will receive priority access and beta perks the moment paid tiers go live.
            </p>

            {isJoined ? (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl text-sm font-bold border border-white/30">
                <Check className="w-5 h-5 text-emerald-300" />
                <span>You're on the VIP waitlist! Check your inbox soon.</span>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3.5 rounded-xl bg-white/95 text-slate-900 placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all shrink-0 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Claim Early Access
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ─── FAQ Section ─── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything you need to know about the AIMIKO pricing transition.
          </p>
        </div>

        <div className="space-y-4">
          {[
            {
              q: "Why is AIMIKO currently free?",
              a: "We are actively stress-testing the MIKO Autonomous Agent and ecosystem tools with our early community. Everything is free during this beta period so we can gather real-world user feedback.",
            },
            {
              q: "Will free beta users be charged when pricing launches?",
              a: "Never without your explicit consent. A permanent Free Tier will always remain available, and Pro tiers will require opt-in approval.",
            },
            {
              q: "Can I use AIMIKO for my business today?",
              a: "Yes! You can explore AIMIKO Works and AIMIKO Pulse right now. If your organization requires custom SLA, on-prem deployment, or dedicated AI employee training, reach out to our enterprise team.",
            },
            {
              q: "What payment methods will be supported?",
              a: "We will support UPI, Credit/Debit cards (Visa, MasterCard, RuPay, Amex), Net Banking, and International payments via Stripe.",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
            >
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                {item.q}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white/50 dark:bg-[#0b0f19]/50 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AIMIKO. All rights reserved. One AI Ecosystem for Every Stage of Life & Work.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/resources")} className="hover:text-violet-600">Documentation</button>
            <button onClick={() => navigate("/about")} className="hover:text-violet-600">About Us</button>
            <button onClick={() => navigate("/buddy")} className="hover:text-violet-600">Launch App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
