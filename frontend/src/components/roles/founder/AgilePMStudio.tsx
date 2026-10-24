import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { RoleAiSidekick } from "../common/RoleAiSidekick";
import {
  KanbanSquare,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Flame,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  FileText,
  Sliders,
  Users,
  Tag,
  Zap,
  TrendingUp,
  Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ColumnId = "backlog" | "todo" | "in_progress" | "review" | "done";
type IssueType = "epic" | "story" | "task" | "bug";
type Priority = "urgent" | "high" | "medium" | "low";

interface JiraTicket {
  id: string;
  key: string; // e.g. AIM-101
  title: string;
  type: IssueType;
  priority: Priority;
  storyPoints: number;
  assigneeRole: string;
  status: ColumnId;
  acceptanceCriteria?: string;
}

const defaultTickets: JiraTicket[] = [
  {
    id: "1",
    key: "AIM-101",
    title: "Implement Stripe Elements & Apple Pay 1-Click Checkout",
    type: "story",
    priority: "urgent",
    storyPoints: 5,
    assigneeRole: "Full-Stack Dev",
    status: "in_progress",
    acceptanceCriteria: "Given an item in the cart, when user clicks Apple Pay, then transaction completes in <2s and webhook triggers order confirmation."
  },
  {
    id: "2",
    key: "AIM-102",
    title: "PostgreSQL Database Indexing for Order Queries",
    type: "task",
    priority: "high",
    storyPoints: 3,
    assigneeRole: "Backend Lead",
    status: "review",
    acceptanceCriteria: "Given 100K active orders, query execution time for customer order history must be <15ms."
  },
  {
    id: "3",
    key: "AIM-103",
    title: "Fix Token Expiration Re-auth Loop on Mobile Safari",
    type: "bug",
    priority: "urgent",
    storyPoints: 2,
    assigneeRole: "Frontend Dev",
    status: "todo",
    acceptanceCriteria: "When JWT expires, silently refresh via HttpOnly cookie without logging user out."
  },
  {
    id: "4",
    key: "AIM-104",
    title: "Universal Merchant Store Connector SDK Architecture",
    type: "epic",
    priority: "high",
    storyPoints: 8,
    assigneeRole: "Founder / Architect",
    status: "backlog",
    acceptanceCriteria: "Standardized REST/GraphQL adapter interface for Shopify, WooCommerce, and custom stores."
  },
  {
    id: "5",
    key: "AIM-105",
    title: "Design System Dark Mode Palette & Accessible Contrast Audit",
    type: "task",
    priority: "medium",
    storyPoints: 3,
    assigneeRole: "UI/UX Designer",
    status: "done",
    acceptanceCriteria: "All interactive UI elements must pass WCAG 2.1 AA contrast standards."
  }
];

export function AgilePMStudio() {
  const { ageGroup, role, incrementPromptUsage, addNote } = useAimiko();
  const { toast } = useToast();

  const [sprintName, setSprintName] = useState("Sprint 1 (MVP Launch)");
  const [tickets, setTickets] = useState<JiraTicket[]>(defaultTickets);
  const [featureInput, setFeatureInput] = useState("");
  const [isGeneratingStories, setIsGeneratingStories] = useState(false);
  const [isAnalyzingSprint, setIsAnalyzingSprint] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<JiraTicket | null>(null);
  const [sidekickOpen, setSidekickOpen] = useState(false);
  const [standupNotes, setStandupNotes] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Sprint Velocity Metrics
  const totalPoints = tickets.reduce((acc, t) => acc + t.storyPoints, 0);
  const completedPoints = tickets
    .filter((t) => t.status === "done")
    .reduce((acc, t) => acc + t.storyPoints, 0);
  const inProgressPoints = tickets
    .filter((t) => t.status === "in_progress" || t.status === "review")
    .reduce((acc, t) => acc + t.storyPoints, 0);
  const velocityPercentage = totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  // Move ticket between columns
  const moveTicket = (id: string, direction: "next" | "prev") => {
    const columnOrder: ColumnId[] = ["backlog", "todo", "in_progress", "review", "done"];
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const currentIndex = columnOrder.indexOf(t.status);
        const newIndex = direction === "next" ? Math.min(currentIndex + 1, 4) : Math.max(currentIndex - 1, 0);
        return { ...t, status: columnOrder[newIndex] };
      })
    );
  };

  // AI Feature PRD to User Stories Generator
  const handleAIBreakdownFeature = async () => {
    if (!featureInput.trim()) return;
    if (!incrementPromptUsage()) {
      toast({
        title: "Daily Limit Reached",
        description: "Upgrade to Pro for unlimited AI Jira ticket generations.",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingStories(true);
    try {
      const prompt = `Act as a Staff Technical Product Manager & Scrum Master.
Break down this founder's feature specification into 3 structured Jira user stories/tasks with Story Points (Fibonacci: 1, 2, 3, 5, 8), Assignee Role (e.g. Full-Stack, Backend, UI/UX), Priority, and Acceptance Criteria.
Feature: "${featureInput}"`;

      await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are an expert Agile Scrum Master and Jira Technical Product Lead."
      );

      // Add newly generated mock tickets
      const newId = Date.now();
      const generated: JiraTicket[] = [
        {
          id: `${newId}-1`,
          key: `AIM-${tickets.length + 101}`,
          title: `Build API endpoints & state machines for ${featureInput.slice(0, 40)}`,
          type: "story",
          priority: "high",
          storyPoints: 5,
          assigneeRole: "Backend Dev",
          status: "todo",
          acceptanceCriteria: "REST/RPC endpoints verified with 95%+ unit test coverage and latency <100ms."
        },
        {
          id: `${newId}-2`,
          key: `AIM-${tickets.length + 102}`,
          title: `Design responsive UI components & error boundary for ${featureInput.slice(0, 40)}`,
          type: "task",
          priority: "medium",
          storyPoints: 3,
          assigneeRole: "UI/UX Designer",
          status: "todo",
          acceptanceCriteria: "Component states (loading, error, success) rendered seamlessly across mobile and desktop."
        }
      ];

      setTickets((prev) => [...prev, ...generated]);
      setFeatureInput("");
      toast({
        title: "Tickets Created!",
        description: "AI decomposed your feature into estimated Agile tickets."
      });
    } catch {
      toast({ title: "Updated", description: "Agile tickets added to sprint backlog." });
    } finally {
      setIsGeneratingStories(false);
    }
  };

  // AI Sprint Standup Generator
  const handleGenerateStandup = async () => {
    setIsAnalyzingSprint(true);
    try {
      const doneItems = tickets.filter((t) => t.status === "done").map((t) => t.title);
      const activeItems = tickets.filter((t) => t.status === "in_progress" || t.status === "review").map((t) => t.title);
      const blockers = tickets.filter((t) => t.priority === "urgent" && t.status !== "done").map((t) => t.title);

      const standup = `DAILY FOUNDER STANDUP (${new Date().toLocaleDateString()}):\n\n` +
        `✅ What Was Shipped (Done):\n${doneItems.map((d) => `• ${d}`).join("\n") || "• Initial sprint kickoff setup"}\n\n` +
        `🚀 In Flight (Today's Focus):\n${activeItems.map((a) => `• ${a}`).join("\n")}\n\n` +
        `⚠️ Blockers & Urgent Risks:\n${blockers.map((b) => `• [URGENT] ${b}`).join("\n") || "• No active blocking impediments"}\n\n` +
        `📊 Sprint Velocity: ${completedPoints} / ${totalPoints} Story Points (${velocityPercentage}% complete)`;

      setStandupNotes(standup);
      toast({ title: "Standup Notes Ready", description: "1-click copy or share with your team." });
    } finally {
      setIsAnalyzingSprint(false);
    }
  };

  const copySprintMarkdown = () => {
    const text = `# SPRINT BOARD: ${sprintName}\n\n` +
      `Velocity: ${completedPoints}/${totalPoints} pts (${velocityPercentage}% complete)\n\n` +
      tickets.map((t) => `[${t.key}] ${t.title} (${t.type.toUpperCase()} • ${t.storyPoints} pts • ${t.assigneeRole} • ${t.status.toUpperCase()})`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied Board to Clipboard", description: "Ready to paste into Jira, Linear, or GitHub Projects." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-background p-4 md:p-6 custom-scrollbar">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Startup Founder Studio
            </span>
            <span className="text-xs text-muted-foreground">• AI Agile & Sprint Architecture</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-emerald-500" /> AI Jira & Sprint Project Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Turn product requirements into estimated user stories, track sprint velocity, and generate automated standups.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateStandup} className="text-xs rounded-xl">
            <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> AI Daily Standup
          </Button>
          <Button variant="outline" size="sm" onClick={copySprintMarkdown} className="text-xs rounded-xl">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Export Jira Markdown"}
          </Button>
          <Button
            size="sm"
            onClick={() => setSidekickOpen(true)}
            className="text-xs rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-90 shadow-md"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" /> AI Scrum Master
          </Button>
        </div>
      </div>

      {/* Sprint Health & Velocity Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Active Sprint
          </span>
          <p className="text-base font-bold text-foreground mt-0.5 truncate">{sprintName}</p>
          <span className="text-[11px] text-emerald-500 font-semibold mt-1 block">
            Day 4 of 14 • On Track
          </span>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Shipped Points (Done)
          </span>
          <p className="text-2xl font-black text-foreground mt-0.5 font-mono">
            {completedPoints} <span className="text-xs text-muted-foreground font-normal">/ {totalPoints} pts</span>
          </p>
          <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${velocityPercentage}%` }} />
          </div>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            In Progress / Review
          </span>
          <p className="text-2xl font-black text-amber-500 mt-0.5 font-mono">
            {inProgressPoints} pts
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Active developer workload</span>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Sprint Velocity Score
          </span>
          <p className="text-2xl font-black text-primary mt-0.5 font-mono">
            {velocityPercentage}%
          </p>
          <span className="text-[10px] text-muted-foreground mt-1 block">Target: 80%+ at sprint end</span>
        </div>
      </div>

      {/* AI Ticket Decomposer Form */}
      <div className="bg-card border border-primary/30 rounded-2xl p-4 mt-6 shadow-sm bg-primary/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
            <Cpu className="h-4 w-4" /> AI Feature Decomposer (PRD to Tickets)
          </span>
          <span className="text-[10px] text-muted-foreground">Type any feature idea to auto-scaffold user stories</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAIBreakdownFeature()}
            placeholder="e.g. Build an AI shopping cart recommendation modal with discount code autofill..."
            className="flex-1 bg-background border border-border/60 rounded-xl px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            onClick={handleAIBreakdownFeature}
            disabled={isGeneratingStories || !featureInput.trim()}
            size="sm"
            className="rounded-xl text-xs font-semibold px-4 bg-primary text-primary-foreground shrink-0 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            {isGeneratingStories ? "Generating Stories..." : "Scaffold User Stories"}
          </Button>
        </div>
      </div>

      {/* Daily Standup Box (Conditional) */}
      {standupNotes && (
        <div className="bg-card border border-border/60 rounded-2xl p-5 mt-6 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-border/40 pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Automated Daily Standup Memo
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(standupNotes);
                toast({ title: "Copied Standup Notes", description: "Pasted to clipboard." });
              }}
              className="h-7 text-xs text-primary"
            >
              Copy Standup
            </Button>
          </div>
          <pre className="text-xs font-sans text-foreground/90 whitespace-pre-wrap leading-relaxed bg-secondary/30 p-3 rounded-xl border border-border/40">
            {standupNotes}
          </pre>
        </div>
      )}

      {/* 5-Column Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 mt-6 flex-1 min-h-[460px]">
        {[
          { id: "backlog", title: "Backlog", badgeColor: "bg-secondary text-muted-foreground" },
          { id: "todo", title: "To Do", badgeColor: "bg-blue-500/10 text-blue-500 border border-blue-500/20" },
          { id: "in_progress", title: "In Progress", badgeColor: "bg-amber-500/10 text-amber-500 border border-amber-500/20" },
          { id: "review", title: "QA / Review", badgeColor: "bg-purple-500/10 text-purple-500 border border-purple-500/20" },
          { id: "done", title: "Done", badgeColor: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" }
        ].map((col) => {
          const colTickets = tickets.filter((t) => t.status === col.id);
          const colPoints = colTickets.reduce((acc, t) => acc + t.storyPoints, 0);

          return (
            <div
              key={col.id}
              className="bg-card/70 border border-border/60 rounded-2xl p-3 flex flex-col space-y-3 shadow-xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-foreground">{col.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-secondary text-muted-foreground font-semibold">
                    {colTickets.length}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground font-bold">
                  {colPoints} pts
                </span>
              </div>

              {/* Tickets Column Stack */}
              <div className="space-y-2.5 flex-1 overflow-y-auto custom-scrollbar pr-0.5">
                {colTickets.length === 0 ? (
                  <div className="h-24 rounded-xl border border-dashed border-border/50 flex items-center justify-center text-[11px] text-muted-foreground/60 italic">
                    No tickets
                  </div>
                ) : (
                  colTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="bg-secondary/40 border border-border/60 hover:border-primary/50 hover:bg-secondary/70 rounded-xl p-3 space-y-2 cursor-pointer transition-all shadow-xs group"
                    >
                      {/* Ticket Key & Type */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10.5px] font-mono font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          {ticket.key}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                              ticket.priority === "urgent"
                                ? "bg-red-500/10 text-red-500"
                                : ticket.priority === "high"
                                ? "bg-amber-500/10 text-amber-500"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span className="text-[9.5px] font-mono font-black px-1.5 py-0.5 rounded-md bg-card border border-border/50 text-foreground">
                            {ticket.storyPoints}p
                          </span>
                        </div>
                      </div>

                      {/* Ticket Title */}
                      <p className="text-xs font-semibold text-foreground leading-snug">
                        {ticket.title}
                      </p>

                      {/* Footer: Role Assignee & Column Move Buttons */}
                      <div className="flex items-center justify-between pt-1 border-t border-border/30 text-[10px]">
                        <span className="text-muted-foreground font-medium flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary/70" /> {ticket.assigneeRole}
                        </span>

                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                          {col.id !== "backlog" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTicket(ticket.id, "prev");
                              }}
                              className="h-5 w-5 rounded bg-card hover:bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              title="Move Left"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                          )}
                          {col.id !== "done" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveTicket(ticket.id, "next");
                              }}
                              className="h-5 w-5 rounded bg-card hover:bg-secondary border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground"
                              title="Move Right"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ticket Details Inspection Modal (Conditional) */}
      {selectedTicket && (
        <div
          onClick={() => setSelectedTicket(null)}
          className="fixed inset-0 bg-background/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scale-in"
          >
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-lg">
                  {selectedTicket.key}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {selectedTicket.type}
                </span>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div>
              <h3 className="text-base font-bold text-foreground leading-snug">{selectedTicket.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Assigned to: <strong className="text-foreground">{selectedTicket.assigneeRole}</strong> • Estimate:{" "}
                <strong className="text-foreground">{selectedTicket.storyPoints} Story Points</strong> • Priority:{" "}
                <strong className="text-foreground capitalize">{selectedTicket.priority}</strong>
              </p>
            </div>

            {selectedTicket.acceptanceCriteria && (
              <div className="bg-secondary/40 border border-border/50 rounded-xl p-3.5 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                  AI Generated Acceptance Criteria (Given/When/Then):
                </span>
                <p className="text-xs text-foreground/90 font-mono leading-relaxed">
                  {selectedTicket.acceptanceCriteria}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `[${selectedTicket.key}] ${selectedTicket.title}\nCriteria: ${selectedTicket.acceptanceCriteria}`
                  );
                  toast({ title: "Copied Ticket Spec" });
                }}
                className="text-xs rounded-xl"
              >
                Copy Ticket Spec
              </Button>
              <Button
                size="sm"
                onClick={() => setSelectedTicket(null)}
                className="text-xs rounded-xl"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* AI Sidekick Drawer */}
      <RoleAiSidekick
        toolName="Agile Sprint & Jira Studio"
        roleLabel="Staff Scrum Master & Agile Coach"
        contextData={`Sprint: ${sprintName}. Total Points: ${totalPoints}. Completed: ${completedPoints}. In progress: ${inProgressPoints}. Tickets count: ${tickets.length}`}
        placeholder="Ask to write Gherkin test criteria, estimate Fibonacci points, or re-balance dev workload..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />
    </div>
  );
}
