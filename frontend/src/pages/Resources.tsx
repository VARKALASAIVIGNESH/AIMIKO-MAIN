import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Sparkles,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowUpRight,
  Search,
  ChevronRight,
  ExternalLink,
  Bot,
  Zap,
  Terminal,
  FileText,
  Video,
  Users,
  Compass
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainNavbar from "@/components/MainNavbar";

export default function Resources() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const RESOURCES = [
    {
      id: "miko-agent-guide",
      category: "agents",
      title: "MIKO Autonomous Agent: Architecture & Permission Blueprint",
      desc: "Understand how MIKO safely translates user natural language intentions into API calls, transit bookings, and commerce transactions with permission-first controls.",
      tag: "Agent Core",
      color: "#7c3aed",
      readTime: "6 min read",
      icon: Bot,
      link: "/miko",
    },
    {
      id: "aimigo-mobility-guide",
      category: "guides",
      title: "AIMIGO Commute Orchestration & Multi-Modal Routing",
      desc: "Learn how AIMIGO compares metro, cab surge fares, and micro-mobility docks in real-time to save 40+ minutes on daily travel.",
      tag: "Mobility",
      color: "#0284c7",
      readTime: "5 min read",
      icon: Compass,
      link: "/aimigo",
    },
    {
      id: "works-ai-workforce",
      category: "enterprise",
      title: "Deploying AI Employees with AIMIKO Works",
      desc: "Step-by-step tutorial on provisioning autonomous CRM agents, lead outreach bots, and custom automated email responders for your business.",
      tag: "Enterprise",
      color: "#ec4899",
      readTime: "8 min read",
      icon: Zap,
      link: "/works",
    },
    {
      id: "pulse-sql-analysis",
      category: "data",
      title: "Zero-Code Text-to-SQL & Business Data Forecasting with Pulse",
      desc: "How to connect PostgreSQL, CSVs, and Stripe exports to AIMIKO Pulse for conversational data analytics and automated charts.",
      tag: "Analytics",
      color: "#059669",
      readTime: "4 min read",
      icon: Terminal,
      link: "/pulse",
    },
    {
      id: "learn-study-coach",
      category: "guides",
      title: "Maximizing Academic Retention with AIMIKO Learn",
      desc: "Best practices for students and educators using adaptive tutoring, step-by-step calculus solving, and rubric-based grading.",
      tag: "Education",
      color: "#f59e0b",
      readTime: "5 min read",
      icon: BookOpen,
      link: "/learn",
    },
    {
      id: "security-privacy-whitepaper",
      category: "security",
      title: "AIMIKO Zero-Knowledge Data Privacy & SOC 2 Whitepaper",
      desc: "Comprehensive breakdown of encryption-at-rest, user-controlled memory deletion, and our strict 'No Customer Data for LLM Training' guarantee.",
      tag: "Security",
      color: "#10b981",
      readTime: "10 min read",
      icon: ShieldCheck,
      link: "#security",
    },
    {
      id: "chrome-extension-setup",
      category: "tools",
      title: "Installing & Using the AIMIKO Chrome Extension Co-Pilot",
      desc: "Highlight text anywhere on the web to instantly summarize articles, draft email responses, and query MIKO from any browser tab.",
      tag: "Extension",
      color: "#6366f1",
      readTime: "3 min read",
      icon: Code2,
      link: "/chrome-extension",
    },
    {
      id: "api-webhook-reference",
      category: "developers",
      title: "AIMIKO REST & WebSocket Developer API Reference",
      desc: "Integrate MIKO capabilities, user personas, and automated workflows directly into your web, mobile, or iOS application.",
      tag: "API Docs",
      color: "#8b5cf6",
      readTime: "Developer API",
      icon: Terminal,
      link: "#api",
    },
  ];

  const filteredResources = RESOURCES.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || r.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfcfe] via-[#f8f5ff] to-[#f2edfe] dark:from-[#0b0f19] dark:via-[#0f172a] dark:to-[#171126] text-slate-800 dark:text-slate-100 font-sans antialiased overflow-x-hidden">
      {/* ─── Top Navbar ─── */}
      <MainNavbar />

      {/* ─── Hero Section ─── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-950/80 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-violet-500" />
          <span>AIMIKO Knowledge Base & Developer Hub</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
          Everything you need to master{" "}
          <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-sky-500 bg-clip-text text-transparent">
            AIMIKO.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Explore comprehensive guides, agent developer documentation, tutorial walkthroughs, and security specifications across the entire AIMIKO ecosystem.
        </p>

        {/* Search Input Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, agents, SQL tutorials, API docs..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-md shadow-violet-500/5"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {[
            { id: "all", label: "All Resources" },
            { id: "agents", label: "MIKO Agents" },
            { id: "guides", label: "Product Guides" },
            { id: "enterprise", label: "Enterprise & Works" },
            { id: "data", label: "Data & Pulse" },
            { id: "security", label: "Security & Privacy" },
            { id: "developers", label: "Developers & API" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === c.id
                  ? "bg-violet-600 text-white shadow-md shadow-violet-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Resource Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (item.link.startsWith("/")) {
                    navigate(item.link);
                  }
                }}
                className="group p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-xl hover:border-violet-300 dark:hover:border-violet-700 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div
                      style={{ background: `${item.color}15`, color: item.color }}
                      className="p-3 rounded-2xl flex items-center justify-center"
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                      {item.readTime}
                    </span>
                  </div>

                  <span
                    style={{ color: item.color, background: `${item.color}12` }}
                    className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md mb-3"
                  >
                    {item.tag}
                  </span>

                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-violet-600 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-4">
                  <span className="text-xs font-bold text-violet-600 group-hover:underline flex items-center gap-1">
                    Explore Guide <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Developer & Community Quick Links ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-violet-900 to-purple-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <Terminal className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">MIKO Agent SDK</h3>
              <p className="text-xs text-purple-200 leading-relaxed mb-6">
                Build custom agent plugins, register real-world action triggers, and connect proprietary enterprise APIs.
              </p>
            </div>
            <Button
              onClick={() => navigate("/miko")}
              className="bg-white text-violet-900 font-bold rounded-xl text-xs"
            >
              View Agent Docs
            </Button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-sky-900 to-blue-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <Code2 className="w-8 h-8 text-sky-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Browser Co-Pilot</h3>
              <p className="text-xs text-sky-200 leading-relaxed mb-6">
                Install our official Chrome extension to bring AIMIKO intelligence and text summarization to any tab.
              </p>
            </div>
            <Button
              onClick={() => navigate("/chrome-extension")}
              className="bg-white text-sky-900 font-bold rounded-xl text-xs"
            >
              Get Chrome Extension
            </Button>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-900 to-teal-950 text-white shadow-xl flex flex-col justify-between">
            <div>
              <Users className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold mb-2">Community & Discord</h3>
              <p className="text-xs text-emerald-200 leading-relaxed mb-6">
                Join our Discord community of AI creators, developers, founders, and students to share custom workflows.
              </p>
            </div>
            <Button
              onClick={() => navigate("/network")}
              className="bg-white text-emerald-900 font-bold rounded-xl text-xs"
            >
              Join the Network
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white/50 dark:bg-[#0b0f19]/50 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 AIMIKO. All rights reserved. One AI Ecosystem for Every Stage of Life & Work.</p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/pricing")} className="hover:text-violet-600">Pricing</button>
            <button onClick={() => navigate("/about")} className="hover:text-violet-600">About Us</button>
            <button onClick={() => navigate("/buddy")} className="hover:text-violet-600">Launch App</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
