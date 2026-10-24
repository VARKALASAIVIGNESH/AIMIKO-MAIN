import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  Bot,
  Layers,
  Users,
  Compass,
  Heart,
  Globe,
  Award,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  BrainCircuit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/MainNavbar";

export default function About() {
  const navigate = useNavigate();

  const MASCOTS = [
    {
      id: "buddy",
      title: "AIMIKO Buddy",
      role: "Personal Life & Habits",
      tagline: "“Your AI Buddy”",
      img: "/brand/mascot_life.png",
      color: "#7c3aed",
      desc: "Keeps your daily habits, study schedules, and energy levels on track without burnout.",
    },
    {
      id: "works",
      title: "AIMIKO Works",
      role: "Enterprise & Automation",
      tagline: "“Your AI Workforce”",
      img: "/brand/mascot_agency.png",
      color: "#06b6d4",
      desc: "Autonomous AI employees handling leads, customer support, and business operations 24/7.",
    },
    {
      id: "pulse",
      title: "AIMIKO Pulse",
      role: "Data Intelligence",
      tagline: "“Talk to your data”",
      img: "/brand/mascot_analyzer.png",
      color: "#8b5cf6",
      desc: "Turns messy spreadsheets and SQL databases into instant conversational chart insights.",
    },
    {
      id: "aimigo",
      title: "AIMIGO",
      role: "Everyday Mobility",
      tagline: "“Travel with me...”",
      img: "/brand/mascot_move.png",
      color: "#38bdf8",
      desc: "Orchestrates multi-modal city transit across metro lines, cab surges, and EV micro-mobility.",
    },
    {
      id: "learn",
      title: "AIMIKO Learn",
      role: "Academic Tutoring",
      tagline: "“Dont learn......”",
      img: "/brand/mascot_school.png",
      color: "#ec4899",
      desc: "Step-by-step 24/7 academic study tutor that explains hard concepts with zero judgment.",
    },
    {
      id: "commerce",
      title: "AIMIKO Commerce",
      role: "Shopping & Storefronts",
      tagline: "“Shop smart. Sell faster.”",
      img: "/brand/mascot_commerce.png",
      color: "#db2777",
      desc: "Autonomous deal finding for buyers, and high-converting 24/7 sales closer for merchants.",
    },
    {
      id: "miko",
      title: "MIKO",
      role: "Master Autonomous Agent",
      tagline: "“AI that actually acts”",
      img: "/brand/mascot_miko.png",
      color: "#7c3aed",
      desc: "The cross-ecosystem action brain that understands, plans, asks permission, and executes tasks.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfcfe] via-[#f8f5ff] to-[#f2edfe] dark:from-[#0b0f19] dark:via-[#0f172a] dark:to-[#171126] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* ─── Top Navbar ─── */}
      <MainNavbar />

      {/* ─── Hero Section ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>Our Story & Vision</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Building the first AI ecosystem that{" "}
          <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-sky-500 bg-clip-text text-transparent">
            actually acts.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Chatbots gave us text. <strong>AIMIKO gives you execution.</strong> We are uniting personal lifestyle intelligence with enterprise workforce automation under one permission-first roof.
        </p>
      </div>

      {/* ─── The Why / Philosophy Grid ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 mb-6">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-3">
              1. Action Over Talk
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Most AI apps simply generate text and leave the work to you. AIMIKO plans multi-step journeys, dispatches real-world bookings, and automates pipelines end-to-end.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-950 flex items-center justify-center text-pink-600 mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-3">
              2. Permission-First Autonomy
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              You always hold the steering wheel. MIKO searches and calculates options, then pauses to ask for your explicit approval before executing any payment or action.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 mb-6">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white mb-3">
              3. Cross-Domain Intelligence
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              No more switching between 10 disjointed apps. Your morning transit on AIMIGO connects to your daily planner on Buddy and your analytics in Pulse.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Meet the Mascot Universe ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-xs font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Brand Identity
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Meet the AIMIKO Mascot Universe
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-2">
            Each character represents a specialized guardian of your daily life, mobility, academics, and enterprise workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MASCOTS.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl hover:scale-[1.02] transition-all flex flex-col items-center text-center"
            >
              <div
                style={{ background: `${m.color}12`, borderColor: `${m.color}30` }}
                className="w-24 h-24 rounded-3xl p-2.5 border flex items-center justify-center mb-5 shadow-inner"
              >
                <img
                  src={m.img}
                  alt={m.title}
                  className="w-full h-full object-contain drop-shadow-md rounded-2xl"
                />
              </div>

              <span
                style={{ color: m.color }}
                className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
              >
                {m.role}
              </span>

              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
                {m.title}
              </h4>

              <p className="text-xs font-bold text-violet-600 dark:text-violet-400 mb-3">
                {m.tagline}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {m.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Stats Banner ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="rounded-3xl p-10 bg-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-violet-400 mb-1">
                7
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Integrated Modules
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-pink-400 mb-1">
                50K+
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Beta Users
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-sky-400 mb-1">
                0.04s
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Query Latency
              </div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1">
                100%
              </div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                Permission Safe
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white/50 dark:bg-[#0b0f19]/50 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AIMIKO. All rights reserved. One AI Ecosystem for Every Stage of Life & Work.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/pricing")} className="hover:text-violet-600">Pricing</button>
            <button onClick={() => navigate("/resources")} className="hover:text-violet-600">Resources</button>
            <button onClick={() => navigate("/buddy")} className="hover:text-violet-600">Launch App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
