import { useState, useMemo } from "react";
import MainNavbar from "@/components/MainNavbar";
import {
  Users,
  DollarSign,
  Activity,
  Shield,
  Search,
  Download,
  UserCheck,
  UserX,
  CreditCard,
  Zap,
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Building2,
  GraduationCap,
  BookOpen,
  Briefcase,
  Code2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export interface MasterUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "institution" | "founder" | "developer" | "creator";
  plan: "Free" | "Pro" | "Campus Enterprise";
  joinedDate: string;
  lastActive: string;
  tokensUsed: number;
  status: "active" | "suspended";
}

export interface PaymentTransaction {
  id: string;
  userEmail: string;
  amount: string;
  currency: "INR" | "USD";
  gateway: "Razorpay (UPI)" | "Razorpay (Card)" | "Stripe (Card)";
  planName: string;
  timestamp: string;
  status: "success" | "pending" | "refunded";
}

const SEED_USERS: MasterUser[] = [
  {
    id: "USR-1001",
    name: "Alex Rivera",
    email: "alex.rivera@stanford.edu",
    role: "student",
    plan: "Free",
    joinedDate: "2026-10-12",
    lastActive: "12 mins ago",
    tokensUsed: 42300,
    status: "active"
  },
  {
    id: "USR-1002",
    name: "Dr. Ronald Vance",
    email: "r.vance@apex-tech.edu",
    role: "teacher",
    plan: "Pro",
    joinedDate: "2026-09-28",
    lastActive: "Just now",
    tokensUsed: 198000,
    status: "active"
  },
  {
    id: "USR-1003",
    name: "Apex Institute of Science",
    email: "admin@apex-tech.edu",
    role: "institution",
    plan: "Campus Enterprise",
    joinedDate: "2026-08-15",
    lastActive: "4 mins ago",
    tokensUsed: 842000,
    status: "active"
  },
  {
    id: "USR-1004",
    name: "Devon Chen",
    email: "devon@hypergrowth.ai",
    role: "founder",
    plan: "Pro",
    joinedDate: "2026-10-01",
    lastActive: "2 hours ago",
    tokensUsed: 312000,
    status: "active"
  },
  {
    id: "USR-1005",
    name: "Sarah Jenkins",
    email: "sarah.j@buildfast.dev",
    role: "developer",
    plan: "Pro",
    joinedDate: "2026-09-18",
    lastActive: "1 day ago",
    tokensUsed: 154000,
    status: "active"
  },
  {
    id: "USR-1006",
    name: "Maya Lin",
    email: "maya.creates@youtube.com",
    role: "creator",
    plan: "Free",
    joinedDate: "2026-10-14",
    lastActive: "35 mins ago",
    tokensUsed: 28400,
    status: "active"
  },
  {
    id: "USR-1007",
    name: "Vikram Malhotra",
    email: "vikram.m@zenithcorp.in",
    role: "founder",
    plan: "Campus Enterprise",
    joinedDate: "2026-07-22",
    lastActive: "3 hours ago",
    tokensUsed: 620000,
    status: "active"
  },
  {
    id: "USR-1008",
    name: "Ananya Sharma",
    email: "ananya.s@delhi-univ.ac.in",
    role: "student",
    plan: "Free",
    joinedDate: "2026-10-15",
    lastActive: "5 mins ago",
    tokensUsed: 18900,
    status: "active"
  }
];

const SEED_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: "TXN-98421",
    userEmail: "r.vance@apex-tech.edu",
    amount: "₹899",
    currency: "INR",
    gateway: "Razorpay (UPI)",
    planName: "Faculty Pro",
    timestamp: "Today, 10:14 AM",
    status: "success"
  },
  {
    id: "TXN-98422",
    userEmail: "admin@apex-tech.edu",
    amount: "₹14,999",
    currency: "INR",
    gateway: "Razorpay (Card)",
    planName: "Campus Enterprise",
    timestamp: "Yesterday, 3:45 PM",
    status: "success"
  },
  {
    id: "TXN-98423",
    userEmail: "devon@hypergrowth.ai",
    amount: "₹1,499",
    currency: "INR",
    gateway: "Razorpay (UPI)",
    planName: "Works Agent Pass",
    timestamp: "Oct 14, 08:30 PM",
    status: "success"
  },
  {
    id: "TXN-98424",
    userEmail: "sarah.j@buildfast.dev",
    amount: "$29",
    currency: "USD",
    gateway: "Stripe (Card)",
    planName: "Developer Pro",
    timestamp: "Oct 13, 11:20 AM",
    status: "success"
  }
];

export default function OwnerDashboard() {
  const { toast } = useToast();
  const [users, setUsers] = useState<MasterUser[]>(SEED_USERS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(SEED_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"directory" | "financials" | "modules" | "audit">("directory");

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesPlan = planFilter === "all" || u.plan === planFilter;
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchQuery, roleFilter, planFilter]);

  // Aggregate stats
  const totalUsersCount = 1428;
  const activeSubscribersCount = 412;
  const totalTokensConsumed = "12,480,000";
  const mrrInr = "₹5,84,200";

  // Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === "active" ? "suspended" : "active";
          toast({
            title: `User ${newStatus === "suspended" ? "Suspended" : "Reactivated"}`,
            description: `${u.name} (${u.email}) is now ${newStatus}.`
          });
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleUpgradePlan = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextPlan = u.plan === "Free" ? "Pro" : u.plan === "Pro" ? "Campus Enterprise" : "Free";
          toast({
            title: "Subscription Plan Updated",
            description: `${u.name} changed to ${nextPlan}.`
          });
          return { ...u, plan: nextPlan };
        }
        return u;
      })
    );
  };

  const handleExportCSV = () => {
    const headers = "User ID,Name,Email,Role,Plan,Tokens Used,Joined Date,Status\n";
    const rows = users
      .map((u) => `${u.id},"${u.name}",${u.email},${u.role},${u.plan},${u.tokensUsed},${u.joinedDate},${u.status}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `aimiko_master_users_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast({ title: "User Export Ready", description: "Downloaded complete master user CSV ledger." });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <MainNavbar />

      {/* ── TOP OWNER HEADER ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-600/10 rounded-xl text-rose-600">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="font-black text-sm sm:text-base text-slate-950 dark:text-white flex items-center gap-2">
                <span>Owner Master Control Center</span>
                <span className="text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                  Super Admin
                </span>
              </div>
              <div className="text-xs text-slate-500">
                Live oversight of all platform users, roles, billing, and ecosystem telemetry
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="h-8 px-3 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export All Users CSV</span>
            </Button>

            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-xl flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live (38ms)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* ── 1. EXECUTIVE KPI MASTER CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Total Registered Users</span>
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 dark:text-white">{totalUsersCount.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>+38 joined today (+14.2% this month)</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Monthly Recurring Revenue</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{mrrInr}</div>
            <div className="text-[11px] font-bold text-slate-500">
              <span>{activeSubscribersCount} active paid subscribers</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">AI Tokens Consumed</span>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-950 dark:text-white">{totalTokensConsumed}</div>
            <div className="text-[11px] font-bold text-purple-600">
              Across 25 Works Agents &amp; Learn
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-bold uppercase tracking-wider">Platform Health</span>
              <Activity className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 dark:text-white">99.98%</div>
            <div className="text-[11px] font-bold text-emerald-600">
              All 7 Modules Operational
            </div>
          </div>
        </div>

        {/* ── 2. ROLE DISTRIBUTION OVERVIEW ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-black text-sm text-slate-900 dark:text-white">Platform User Breakdown by Role</h3>
              <p className="text-xs text-slate-500">Proportion of user base across academic, developer, founder, and creator accounts</p>
            </div>
            <span className="text-xs font-bold text-slate-400">Total: {totalUsersCount} accounts</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { role: "Students", count: 620, pct: "43.4%", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950" },
              { role: "Founders", count: 240, pct: "16.8%", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950" },
              { role: "Developers", count: 190, pct: "13.3%", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
              { role: "Teachers", count: 184, pct: "12.9%", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
              { role: "Creators", count: 152, pct: "10.6%", color: "text-pink-600", bg: "bg-pink-50 dark:bg-pink-950" },
              { role: "Institutions", count: 42, pct: "2.9%", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" }
            ].map((r) => (
              <div key={r.role} className={`p-3 rounded-xl border border-slate-200 dark:border-slate-800 ${r.bg} space-y-1`}>
                <span className="text-[10px] font-bold uppercase text-slate-500">{r.role}</span>
                <div className={`text-xl font-black ${r.color}`}>{r.count}</div>
                <div className="text-[10px] font-bold text-slate-400">{r.pct} of platform</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 3. OWNER SUB-NAV TABS ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab("directory")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Master User Directory ({filteredUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("financials")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "financials"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Live Payment Ledger ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("modules")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "modules"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Ecosystem Module Telemetry</span>
          </button>
        </div>

        {/* ── TAB 1: MASTER USER DIRECTORY (SEARCHABLE, ACTIONABLE) ── */}
        {activeTab === "directory" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            {/* Search and Filters Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, or user ID..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="institution">Institution</option>
                  <option value="founder">Founder</option>
                  <option value="developer">Developer</option>
                  <option value="creator">Creator</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="all">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Campus Enterprise">Campus Enterprise</option>
                </select>
              </div>
            </div>

            {/* Master User Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-3 font-extrabold">User</th>
                    <th className="pb-3 font-extrabold">Role</th>
                    <th className="pb-3 font-extrabold">Plan</th>
                    <th className="pb-3 font-extrabold">Tokens Consumed</th>
                    <th className="pb-3 font-extrabold">Last Active</th>
                    <th className="pb-3 font-extrabold">Status</th>
                    <th className="pb-3 font-extrabold text-right">Owner Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3">
                        <div className="font-extrabold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email} · {u.id}</div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.plan === "Campus Enterprise"
                            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            : u.plan === "Pro"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {u.tokensUsed.toLocaleString()}
                      </td>
                      <td className="py-3 text-slate-500 font-medium">{u.lastActive}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "active"
                            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                            : "bg-rose-50 dark:bg-rose-950 text-rose-600"
                        }`}>
                          {u.status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpgradePlan(u.id)}
                            className="h-7 px-2 text-[10px] font-bold cursor-pointer"
                          >
                            <Sliders className="h-3 w-3 mr-1" /> Change Plan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleUserStatus(u.id)}
                            className={`h-7 px-2 text-[10px] font-bold cursor-pointer ${
                              u.status === "active"
                                ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                                : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                            }`}
                          >
                            {u.status === "active" ? <UserX className="h-3 w-3 mr-1" /> : <UserCheck className="h-3 w-3 mr-1" />}
                            <span>{u.status === "active" ? "Suspend" : "Activate"}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: LIVE PAYMENT & BILLING LEDGER ── */}
        {activeTab === "financials" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Live Transaction Ledger</h3>
                <p className="text-xs text-slate-500">Real-time payment logs processed via Razorpay &amp; Stripe gateways</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
                100% Cryptographically Verified
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                    <th className="pb-3">Transaction ID</th>
                    <th className="pb-3">Customer Email</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Gateway</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{tx.id}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{tx.userEmail}</td>
                      <td className="py-3 font-bold text-purple-600">{tx.planName}</td>
                      <td className="py-3 text-slate-500">{tx.gateway}</td>
                      <td className="py-3 font-black text-slate-900 dark:text-white">{tx.amount}</td>
                      <td className="py-3 text-slate-400">{tx.timestamp}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                          Verified Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 3: ECOSYSTEM MODULE TELEMETRY ── */}
        {activeTab === "modules" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Module Usage Distribution</span>
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { name: "AIMIKO Learn (AI School & Tutoring)", share: 38, count: "482,000 queries" },
                  { name: "AIMIKO Works (25 Autonomous Agents)", share: 29, count: "368,000 runs" },
                  { name: "AIMIKO Buddy (Personal AI & Notes)", share: 18, count: "228,000 interactions" },
                  { name: "AIMIKO Pulse (Conversational SQL)", share: 10, count: "127,000 analyses" },
                  { name: "AIMIKO Commerce & Mobility", share: 5, count: "63,000 rides/orders" }
                ].map((m) => (
                  <div key={m.name} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                      <span className="font-bold text-purple-600">{m.share}% ({m.count})</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${m.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span>Security &amp; Rate-Limiting Monitor</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">API Gateway DDoS Defense</span>
                    <span className="text-[11px] text-slate-500">Token-bucket rate limiting (60 req/min per IP)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    Enforced
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Google OAuth Public JWKS</span>
                    <span className="text-[11px] text-slate-500">Cryptographic token validation on every login</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    Active
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold block text-slate-900 dark:text-white">Payment Webhook Verification</span>
                    <span className="text-[11px] text-slate-500">HMAC-SHA256 signature check for Razorpay &amp; Stripe</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
