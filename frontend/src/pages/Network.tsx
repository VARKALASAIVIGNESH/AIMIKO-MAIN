import { useState, useEffect } from "react";
import { useAimiko, Role } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Search, 
  MessageSquare, 
  Check, 
  UserPlus, 
  Sparkles, 
  X, 
  Send, 
  Filter, 
  Cpu,
  BookOpen,
  Palette,
  Code2,
  Briefcase,
  Rocket,
  GraduationCap,
  BarChart3,
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Connection {
  id: string;
  name: string;
  initials: string;
  role: string;
  ageGroup: string;
  interest: string;
  bio: string;
  isConnected: boolean;
}

const mockConnections: Connection[] = [
  // Kids Theme connections
  { id: "k1", name: "Barnaby Vance", initials: "BV", role: "student", ageGroup: "kids", interest: "Science & Nature", bio: "I like learning about outer space and drawing rocket ships!", isConnected: false },
  { id: "k2", name: "Luna Spark", initials: "LS", role: "creator", ageGroup: "kids", interest: "Storytelling", bio: "Let's write a creative adventure with animated stories!", isConnected: false },
  { id: "k3", name: "Pixel Dev", initials: "PD", role: "developer", ageGroup: "kids", interest: "Scratch Games", bio: "Learning how to make jumpy games in scratch coding blocks.", isConnected: false },
  
  // Teens/College connections
  { id: "tc1", name: "Alex Rivera", initials: "AR", role: "developer", ageGroup: "college", interest: "React & AI Tooling", bio: "Building a SaaS frontend in React. Love talking system architecture.", isConnected: false },
  { id: "tc2", name: "Priya Patel", initials: "PP", role: "job_seeker", ageGroup: "college", interest: "Interview Prep", bio: "Prepping for SWE internship rounds. Let's practice mock interviews together!", isConnected: false },
  { id: "tc3", name: "Tyler Kim", initials: "TK", role: "creator", ageGroup: "teens", interest: "Video Editing", bio: "Making dev vlogs and YouTube short coding tutorials.", isConnected: false },
  { id: "tc4", name: "Marcus Brody", initials: "MB", role: "student", ageGroup: "teens", interest: "Chemistry & STEM", bio: "High schooler preparing for AP Chemistry exams. Let's study!", isConnected: false },

  // Adults/Seniors connections
  { id: "as1", name: "Arthur Pendelton", initials: "AP", role: "creator", ageGroup: "seniors", interest: "Writing Memoirs", bio: "Documenting local historical archives and family history memoirs.", isConnected: false },
  { id: "as2", name: "Elena Rostova", initials: "ER", role: "founder", ageGroup: "adults", interest: "Green Energy Tech", bio: "Founder of a community carbon tracking startup. Looking for collaborators.", isConnected: false },
  { id: "as3", name: "Professor Jenkins", initials: "PJ", role: "teacher", ageGroup: "seniors", interest: "Astronomy lectures", bio: "Retired professor sharing astronomy lesson plans for students.", isConnected: false },
  { id: "as4", name: "Sarah Vance", initials: "SV", role: "analyst", ageGroup: "adults", interest: "Market Research", bio: "Fintech analyst sharing SWOT insights and CSV templates.", isConnected: false },
];

const connectionReplies: Record<string, string[]> = {
  k1: [
    "Hi there! Do you want to hear a cool fact about Mars? It has the biggest volcano in the solar system!",
    "Let's be study buddies! My favorite subject is science.",
    "Learning is fun! What is your favorite science topic?"
  ],
  k2: [
    "Let's write a creative story together! Where should our characters go first?",
    "I'm drawing a cosmic forest right now. You can help me brainstorm some ideas!",
    "Tell me your favorite story themes and we can make a custom storyboard!"
  ],
  k3: [
    "Hello! I just added a double-jump feature to my game. Want to test it?",
    "Coding is like a puzzle! What projects are you working on right now?",
    "If you need simple code tips, just ask me!"
  ],
  tc1: [
    "Hey! Great connecting. Are you currently working on a React project? Let's check schemas.",
    "Nice! I'm optimizing page rendering components right now. What's your dev focus?",
    "We should pair program sometime! Let me know if you run into any weird syntax issues."
  ],
  tc2: [
    "Hey there! Thanks for reaching out. Are you also preparing for interview loops?",
    "I've been drilling data structures on Leetcode. Let's run a Mock interview session!",
    "Do you want to practice answering 'Tell me about yourself' templates?"
  ],
  tc3: [
    "Yo! What's up! Glad to connect. Do you write code or make videos?",
    "I'm editing a new TikTok coding short. What content hooks work best for you?",
    "Check out my profile workspace! I share custom script outlines here."
  ],
  tc4: [
    "Hi! Always happy to meet study partners. What topics are you working on in school?",
    "Organic chemistry is rough, but my AIMIKO study bot generated awesome flashcards.",
    "Let's review formulas together. Just send me a question!"
  ],
  as1: [
    "Good day. Thank you for connecting. I'm currently editing my third chapter on local family history.",
    "Memoirs are a beautiful way to share our life lessons. What are you looking to write?",
    "It is never too late to tell your story. How can I help you frame your memoirs?"
  ],
  as2: [
    "Hello! Great to meet fellow founders. What is your startup value proposition?",
    "Running a lean business canvas has been a lifesaver. Let's trade templates!",
    "Funding rounds are tricky in green tech, but we're making great progress."
  ],
  as3: [
    "Hello! I hope you are having an inquisitive day. Astronomy is the study of everything above us!",
    "Are you teaching children or grandchildren? I have some fun worksheets ready to share.",
    "The universe is full of mysteries waiting to be solved. Let's talk stars!"
  ],
  as4: [
    "Hi there! I parsed some interesting SaaS revenue tables this morning. What metrics are you tracking?",
    "Let's trade SWOT analysis grids! They really help clear up market strategies.",
    "Always happy to discuss data columns, tables, and Recharts visualization strategies."
  ]
};

export default function Network() {
  const { role, ageGroup, userName, interests, goals } = useAimiko();
  const { toast } = useToast();
  
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [matchingMode, setMatchingMode] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // Chat drawer states
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([]);
  const [messageInput, setMessageInput] = useState("");

  // Load and hydrate connections state
  useEffect(() => {
    const stored = localStorage.getItem("aimiko_network_connections");
    if (stored) {
      try {
        setConnections(JSON.parse(stored));
      } catch (e) {
        setConnections(mockConnections);
      }
    } else {
      setConnections(mockConnections);
      localStorage.setItem("aimiko_network_connections", JSON.stringify(mockConnections));
    }
  }, []);

  const saveConnections = (updated: Connection[]) => {
    setConnections(updated);
    localStorage.setItem("aimiko_network_connections", JSON.stringify(updated));
  };

  const handleToggleConnect = (id: string, name: string) => {
    const updated = connections.map((conn) => {
      if (conn.id === id) {
        const nextState = !conn.isConnected;
        toast({
          title: nextState ? "Connected!" : "Connection Removed",
          description: nextState 
            ? `You are now connected with ${name}.` 
            : `You disconnected from ${name}.`,
        });
        return { ...conn, isConnected: nextState };
      }
      return conn;
    });
    saveConnections(updated);
  };

  const handleRunSmartMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchingMode(true);
      toast({
        title: "AI Matching Completed",
        description: "AIMIKO successfully scanned interests and matched relevant partners.",
      });
    }, 1500);
  };

  // Open Chat Drawer
  const handleOpenChat = (conn: Connection) => {
    setActiveChatId(conn.id);
    setChatMessages([
      { 
        sender: "bot", 
        text: `Hello! I'm ${conn.name}. Great connecting with you. Let's chat about ${conn.interest}!`, 
        time: "Just now" 
      }
    ]);
  };

  // Send Direct Message
  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;

    const userText = messageInput.trim();
    const newMsg = { sender: "user" as const, text: userText, time: "Just now" };
    
    setChatMessages((prev) => [...prev, newMsg]);
    setMessageInput("");

    // Simulate reply delay
    setTimeout(() => {
      const replies = connectionReplies[activeChatId] || [
        "That's very interesting! Tell me more.",
        "I totally agree. AIMIKO has been helping me organize this topic.",
        "Let's work together on this roadmap!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev, 
        { sender: "bot" as const, text: randomReply, time: "Just now" }
      ]);
    }, 1000);
  };

  // Filter connections based on query, role, and smart match mode
  const filteredConnections = connections.filter((conn) => {
    // 1. Search Query text
    const matchesSearch = 
      conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.interest.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.bio.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Role Filter
    const matchesRole = roleFilter === "all" || conn.role === roleFilter;

    // 3. AI Smart Match Mode: Match if interest is shared, or role matches, or ages align
    if (matchingMode) {
      const isAgeMatch = conn.ageGroup === ageGroup;
      const isRoleMatch = conn.role === role;
      const sharesInterest = interests.some(interest => 
        conn.interest.toLowerCase().includes(interest.toLowerCase()) || 
        conn.bio.toLowerCase().includes(interest.toLowerCase())
      );
      return matchesSearch && matchesRole && (isAgeMatch || isRoleMatch || sharesInterest);
    }

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      
      {/* Header Panel */}
      <div className="tech-card glow-purple border-border bg-card/60 p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-pop-in">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-background border border-border text-primary">
            <Users className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-black tracking-wider uppercase text-foreground">
              Peer Network
            </h1>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">
              Find peers, share templates, and connect with study buddies sharing similar roles.
            </p>
          </div>
        </div>

        <Button
          onClick={handleRunSmartMatching}
          disabled={isMatching}
          className="rounded-xl px-5 py-3 font-bold bg-gradient-to-r from-primary to-purple-600 border-0 hover-bounce text-white flex items-center gap-2"
        >
          {isMatching ? (
            <>
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Matching...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 animate-wiggle" /> AI Smart Match
            </>
          )}
        </Button>
      </div>

      {/* Profile summary status bar */}
      <div className="grid gap-4 sm:grid-cols-3 mt-8">
        <div className="tech-card border-border/40 bg-background/45 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-black tracking-widest text-primary">My Role</span>
          <span className="text-base font-display font-black text-foreground capitalize mt-2">{role?.replace("_", " ") || "student"}</span>
        </div>
        <div className="tech-card border-border/40 bg-background/45 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-black tracking-widest text-primary">My Age Group</span>
          <span className="text-base font-display font-black text-foreground capitalize mt-2">{ageGroup || "college"}</span>
        </div>
        <div className="tech-card border-border/40 bg-background/45 p-5 shadow-sm flex flex-col justify-between">
          <span className="text-[9px] uppercase font-black tracking-widest text-primary">Connections</span>
          <span className="text-base font-display font-black text-foreground mt-2">
            {connections.filter(c => c.isConnected).length} Active
          </span>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="tech-card border-border bg-card/60 p-4 flex flex-col md:flex-row gap-4 items-center justify-between mt-8">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search connections..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {matchingMode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMatchingMode(false)}
              className="rounded-xl text-xs py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20"
            >
              Show All Profiles
            </Button>
          )}
        </div>
      </div>

      {/* Connections Directory */}
      <div className="space-y-4 mt-8">
        <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest px-1">
          {matchingMode ? "AI Recommended Connections" : "Member Directory"}
        </h2>

        {filteredConnections.length === 0 ? (
          <div className="text-center py-16 tech-card border-border bg-card/60 p-6 shadow-inner">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
            <p className="text-xs text-muted-foreground leading-relaxed italic">No matches found in active session databases.</p>
            {matchingMode && (
              <button 
                onClick={() => setMatchingMode(false)}
                className="text-xs text-primary underline mt-2 block mx-auto font-black uppercase tracking-wider hover:text-foreground"
              >
                Clear AI Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredConnections.map((conn) => (
              <div 
                key={conn.id} 
                className="tech-card border-border hover:border-primary/30 bg-card/60 p-6 flex flex-col justify-between shadow-lg hover-lift gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/15 via-purple-500/10 to-sky-500/10 border border-primary/20 flex items-center justify-center font-black text-xs text-primary shrink-0 shadow-sm">
                    {conn.initials}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-display font-black text-foreground text-xs tracking-wider">{conn.name}</h3>
                      <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-black uppercase tracking-wider">
                        {conn.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Focus: <strong className="text-foreground">{conn.interest}</strong>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed pt-1.5 font-semibold">
                      {conn.bio}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-border/40 pt-4 mt-2">
                  {conn.isConnected && (
                    <Button
                      onClick={() => handleOpenChat(conn)}
                      variant="secondary"
                      size="sm"
                      className="rounded-xl text-xs flex items-center gap-1.5 hover:bg-secondary/50 border border-border"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Message
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => handleToggleConnect(conn.id, conn.name)}
                    variant={conn.isConnected ? "secondary" : "default"}
                    size="sm"
                    className="rounded-xl text-xs flex items-center gap-1.5 font-bold hover-bounce"
                  >
                    {conn.isConnected ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-500 animate-pulse" /> Connected
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" /> Connect
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Smart Match explanation helper card */}
      <div className="tech-card border-border bg-card/60 p-6 shadow-md flex items-start gap-4 mt-8">
        <div className="p-3 bg-background text-primary rounded-2xl border border-border">
          <Cpu className="h-5 w-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-black text-sm text-foreground uppercase tracking-wide">How AIMIKO Matchmaker Works</h4>
          <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
            AIMIKO reads your active profile tags, matching you with developers, founders, or studiers who share your exact goals, interests, or can help cover weak learning areas recorded in your Planner.
          </p>
        </div>
      </div>

      {/* Chat DM drawer overlay */}
      {activeChatId && (
        <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-right duration-250">
          
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-card/60">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                {connections.find((c) => c.id === activeChatId)?.initials}
              </span>
              <div className="space-y-0.5">
                <h3 className="font-display font-black text-xs text-foreground uppercase tracking-wider">
                  {connections.find((c) => c.id === activeChatId)?.name}
                </h3>
                <p className="text-[9px] text-primary/80 font-black uppercase tracking-widest">
                  {connections.find((c) => c.id === activeChatId)?.role}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveChatId(null)}
              className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex flex-col max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div 
                  className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-semibold shadow-md ${
                    msg.sender === "user" 
                      ? "aimiko-gradient text-primary-foreground rounded-tr-none" 
                      : "bg-card border border-border text-foreground rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[9px] text-muted-foreground mt-1 px-1 font-mono">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Message Form */}
          <div className="p-4 border-t border-border flex items-center gap-2 bg-card">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background border border-border text-xs rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <Button
              onClick={handleSendMessage}
              className="rounded-xl px-4 py-2.5 flex items-center justify-center font-bold hover-bounce"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
