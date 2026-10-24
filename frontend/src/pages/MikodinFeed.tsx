import { useState, useRef } from "react";
import { useAimiko, Role } from "@/context/AimikoContext";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Award,
  Share2,
  Plus,
  ShieldCheck,
  Zap,
  TrendingUp,
  Clock,
  Play,
  CheckCircle2,
  Smile,
  Gift,
  Flame,
  Image as ImageIcon,
  Video as VideoIcon,
  MessageSquare,
  ThumbsUp,
  Repeat,
  Send,
  MoreHorizontal,
  Bookmark,
  Users,
  X,
  Check,
  Upload,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import MikodinProfileSetupModal from "@/components/MikodinProfileSetupModal";

interface Comment {
  id: string;
  author: string;
  authorRole: string;
  text: string;
  timestamp: string;
  likes: number;
}

interface MikodinPost {
  id: string;
  author: string;
  authorTitle: string;
  authorRole: Role;
  authorAge: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  timestamp: string;
  category: "AgentBuilder" | "Milestone" | "Achievement" | "General";
  reactions: {
    likes: number;
    highFives: number;
    mindBlown: number;
    bigBrain: number;
    userReacted?: string;
  };
  comments: Comment[];
  repostsCount: number;
  agentMeta?: {
    name: string;
    trigger: string;
    toolsCount: number;
  };
}

const mockLinkedInPosts: MikodinPost[] = [
  {
    id: "post-1",
    author: "Leo Martinez",
    authorTitle: "Student & AI Builder | Age 12 | 7-Day Streak Achiever",
    authorRole: "student",
    authorAge: "12 yrs",
    content: "🚀 Thrilled to share that I just deployed my first autonomous AI Agent in the Playground!\n\nMeet 'Galactic Homework Guide' 🪐. When I get stuck on a science or physics question, it doesn't just hand over the answer—it gives me 3 progressive space-themed clues and reads them out loud with speech synthesis.\n\nHere is a screenshot of the agent execution pipeline running in real-time. Huge shoutout to the Socratic reasoning engine! #AgentPlayground #STEM #DailyLearning",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop",
    timestamp: "25m ago",
    category: "AgentBuilder",
    reactions: { likes: 32, highFives: 24, mindBlown: 18, bigBrain: 29, userReacted: undefined },
    comments: [
      {
        id: "c1",
        author: "Zoe Chen",
        authorRole: "Student",
        text: "This is super cool Leo! How did you connect the speech voice tool?",
        timestamp: "12m ago",
        likes: 4
      },
      {
        id: "c2",
        author: "Arjun Patel",
        authorRole: "Student",
        text: "Just tested it in the playground, the space analogies are awesome!",
        timestamp: "5m ago",
        likes: 2
      }
    ],
    repostsCount: 6,
    agentMeta: {
      name: "Galactic Homework Guide",
      trigger: "📝 Question Input",
      toolsCount: 3
    }
  },
  {
    id: "post-2",
    author: "Zoe Chen",
    authorRole: "student",
    authorTitle: "Algebra Enthusiast • Grade 7 • Golden Streak Holder",
    authorAge: "13 yrs",
    content: "🔥 Big milestone unlocked: 7-Day Math Snap-to-Solve Streak!\n\nConsistent daily practice with step-by-step Socratic hints finally made polynomial factoring click for me. No more exam anxiety heading into midterms next week. \n\nRemember: 15 minutes of active problem solving beats 3 hours of passive reading every single time. 📈 #MathMastery #StudyStreaks #MIKODIN",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=1000&auto=format&fit=crop",
    timestamp: "2h ago",
    category: "Milestone",
    reactions: { likes: 48, highFives: 36, mindBlown: 12, bigBrain: 31, userReacted: undefined },
    comments: [
      {
        id: "c3",
        author: "Maya Lin",
        authorRole: "Student",
        text: "Congrats on the streak! Keep going!",
        timestamp: "1h ago",
        likes: 3
      }
    ],
    repostsCount: 9
  },
  {
    id: "post-3",
    author: "Arjun Patel",
    authorRole: "student",
    authorTitle: "Young Coder & Robotics Club Captain | Age 12",
    authorAge: "12 yrs",
    content: "🤖 Experimenting with the 'Spot the AI Hallucination' logic challenge in the Playground.\n\nLevel 3 almost tricked me on planetary atmospheric pressure! It's wild how convincing AI can sound even when it makes things up. Learning prompt evaluation is becoming a superpower. Who else passed Level 3 today? 🧠 #AIEthics #CriticalThinking #FutureBuilders",
    timestamp: "4h ago",
    category: "Achievement",
    reactions: { likes: 27, highFives: 19, mindBlown: 22, bigBrain: 25, userReacted: undefined },
    comments: [],
    repostsCount: 4
  }
];

export default function MikodinFeed() {
  const { userName, ageGroup, role, streakDays, addBadge } = useAimiko();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const currentRole = role || "student";
  const roleLabel =
    currentRole === "student"
      ? "Student"
      : currentRole === "founder"
      ? "Startup Founder"
      : currentRole === "developer"
      ? "Developer"
      : currentRole === "creator"
      ? "Content Creator"
      : currentRole === "job_seeker"
      ? "Job Seeker"
      : "Educator";

  const [posts, setPosts] = useState<MikodinPost[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mikodin_user_posts") || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        const sanitized = saved.map((p) => ({
          ...p,
          author: p.author || "Young Builder",
          comments: Array.isArray(p.comments) ? p.comments : [],
          reactions: {
            likes: p.reactions?.likes || 0,
            highFives: p.reactions?.highFives || 0,
            mindBlown: p.reactions?.mindBlown || 0,
            bigBrain: p.reactions?.bigBrain || 0,
            userReacted: p.reactions?.userReacted
          },
          repostsCount: typeof p.repostsCount === "number" ? p.repostsCount : 0
        }));
        return [...sanitized, ...mockLinkedInPosts];
      }
    } catch (e) {
      console.warn("Failed to parse mikodin posts:", e);
    }
    return mockLinkedInPosts;
  });

  // MIKODIN LinkedIn-style Profile Setup & Terms Gate
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(() => {
    return !localStorage.getItem("aimiko_mikodin_profile_completed");
  });
  const [userHeadline, setUserHeadline] = useState(() => {
    return localStorage.getItem("aimiko_mikodin_headline") || `${roleLabel} • AI Learner & Builder`;
  });

  // Composer Modal State
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [selectedAgentTag, setSelectedAgentTag] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // EOD Rewards
  const [eodPoints, setEodPoints] = useState(175);
  const [dailyGoal] = useState(200);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result as string);
        setMediaType(type);
        setIsComposerOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postText.trim() && !mediaPreview) return;

    const newPost: MikodinPost = {
      id: "post-" + Date.now(),
      author: userName || "Curious Builder",
      authorTitle: `${roleLabel} • Age ${ageGroup === "kids" ? "9" : "12"} • Active Learner`,
      authorRole: currentRole,
      authorAge: "12 yrs",
      content: postText,
      imageUrl: mediaType === "image" && mediaPreview ? mediaPreview : undefined,
      videoUrl: mediaType === "video" && mediaPreview ? mediaPreview : undefined,
      timestamp: "Just now",
      category: selectedAgentTag ? "AgentBuilder" : "Achievement",
      reactions: { likes: 1, highFives: 1, mindBlown: 0, bigBrain: 1, userReacted: "likes" },
      comments: [],
      repostsCount: 0,
      agentMeta: selectedAgentTag
        ? {
            name: selectedAgentTag,
            trigger: "Interactive Simulation",
            toolsCount: 3
          }
        : undefined
    };

    setPosts([newPost, ...posts]);
    setPostText("");
    setMediaPreview(null);
    setMediaType(null);
    setSelectedAgentTag(null);
    setIsComposerOpen(false);

    setEodPoints((p) => Math.min(dailyGoal, p + 50));
    addBadge("Community Pioneer");

    toast({
      title: "🎉 Post Published to MIKODIN!",
      description: "Broadcasting live to your verified peer network. +50 Mikos XP awarded!"
    });
  };

  const handleToggleReaction = (postId: string, type: "likes" | "highFives" | "mindBlown" | "bigBrain") => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const reactions = post.reactions || { likes: 0, highFives: 0, mindBlown: 0, bigBrain: 0 };
          const isCurrent = reactions.userReacted === type;
          const currentCount = reactions[type] || 0;

          return {
            ...post,
            reactions: {
              ...reactions,
              [type]: isCurrent ? Math.max(0, currentCount - 1) : currentCount + 1,
              userReacted: isCurrent ? undefined : type
            }
          };
        }
        return post;
      })
    );

    setEodPoints((p) => Math.min(dailyGoal, p + 5));
    toast({
      title: "Reaction Sent!",
      description: "You praised your peer and earned +5 Mikos daily XP!"
    });
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    const newComment: Comment = {
      id: "c-" + Date.now(),
      author: userName || "You",
      authorRole: roleLabel,
      text: text.trim(),
      timestamp: "Just now",
      likes: 0
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment]
          };
        }
        return post;
      })
    );

    setCommentInputs({ ...commentInputs, [postId]: "" });
    setExpandedComments({ ...expandedComments, [postId]: true });
    setEodPoints((p) => Math.min(dailyGoal, p + 10));

    toast({
      title: "Comment Added",
      description: "Peer discussion updated! +10 Mikos XP."
    });
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#f3f2ef] dark:bg-background custom-scrollbar">
      
      {/* LinkedIn Global Container */}
      <div className="max-w-6xl mx-auto w-full px-3 md:px-6 py-5">
        
        {/* Trait Sandbox Banner */}
        <div className="mb-4 bg-card border border-purple-500/20 rounded-2xl p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-purple-700 dark:text-purple-300">
            <span className="p-1 rounded-lg bg-purple-500/10 text-purple-600">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <span>
              <strong>MIKODIN Trait-Locked Network Active:</strong> Browsing achievements from verified peers with matching traits (<strong>{roleLabel} • Ages 11–14</strong>).
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0 bg-secondary/80 px-2.5 py-1 rounded-xl border border-border/40">
            Trait Key: {currentRole}:{ageGroup || "safe"}
          </span>
        </div>

        {/* 3-Column LinkedIn Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          
          {/* ── LEFT COLUMN: Mini Profile Card & Analytics (3 Cols) ── */}
          <div className="md:col-span-3 space-y-4">
            
            {/* User Profile Card */}
            <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-xs">
              {/* Cover Banner */}
              <div className="h-16 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 relative">
                <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
              </div>

              {/* Avatar & User Details */}
              <div className="p-4 pt-0 text-center relative space-y-2">
                <div className="-mt-8 flex justify-center">
                  <div className="ring-4 ring-card rounded-full bg-card shadow-sm inline-block">
                    <AimikoAvatar size="lg" animate />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-foreground hover:underline cursor-pointer">
                    {userName || "Young Builder"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {userHeadline}
                  </p>
                  <button
                    onClick={() => setIsProfileSetupOpen(true)}
                    className="mt-1.5 text-[10.5px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Edit MIKODIN Profile
                  </button>
                </div>

                <div className="pt-3 border-t border-border/40 space-y-2 text-left text-xs">
                  <div className="flex justify-between items-center text-muted-foreground hover:text-foreground cursor-pointer">
                    <span>Profile viewers</span>
                    <span className="font-bold text-primary">142</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground hover:text-foreground cursor-pointer">
                    <span>Post impressions</span>
                    <span className="font-bold text-primary">1,890</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground hover:text-foreground cursor-pointer">
                    <span>Active Streak</span>
                    <span className="font-bold text-amber-500">7 Days 🔥</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/40 text-left">
                  <Button
                    size="sm"
                    onClick={() => navigate("/playground")}
                    className="w-full rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 h-8 shadow-xs"
                  >
                    <Bot className="h-3.5 w-3.5" /> AI Playground
                  </Button>
                </div>
              </div>
            </div>

            {/* Trait & Safety Card */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-2.5 text-xs">
              <h4 className="font-bold text-foreground text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Safe Peer Chamber
              </h4>
              <p className="text-muted-foreground text-[11.5px] leading-relaxed">
                Zero spam, zero advertisements. All posts are verified student accomplishments, code projects, and AI agent creations.
              </p>
            </div>

          </div>

          {/* ── MIDDLE COLUMN: Main LinkedIn Stream (6 Cols) ── */}
          <div className="md:col-span-6 space-y-4">
            
            {/* LinkedIn "Start a Post" Card */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <AimikoAvatar size="sm" />
                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="flex-1 bg-secondary/80 hover:bg-secondary text-muted-foreground text-left text-xs font-medium px-4 py-3 rounded-full border border-border/60 transition-colors shadow-2xs"
                >
                  Start a post, share an achievement or agent...
                </button>
              </div>

              {/* Action Buttons Row (Media, Video, Agent, Milestone) */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs text-muted-foreground">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, "image")}
                />
                <input
                  type="file"
                  ref={videoInputRef}
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, "video")}
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-secondary transition-colors font-semibold text-blue-500"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>Media</span>
                </button>

                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-secondary transition-colors font-semibold text-emerald-500"
                >
                  <VideoIcon className="h-4 w-4" />
                  <span>Video</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedAgentTag("Cosmo Homework Detective");
                    setIsComposerOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-secondary transition-colors font-semibold text-purple-500"
                >
                  <Bot className="h-4 w-4" />
                  <span>AI Agent</span>
                </button>

                <button
                  onClick={() => {
                    setPostText("🏆 Proud to celebrate a new milestone today!");
                    setIsComposerOpen(true);
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-secondary transition-colors font-semibold text-amber-500"
                >
                  <Award className="h-4 w-4" />
                  <span>Celebrate</span>
                </button>
              </div>
            </div>

            {/* Feed Posts Stream */}
            <div className="space-y-4">
              {posts.map((post) => {
                const totalReactions =
                  (post.reactions?.likes || 0) +
                  (post.reactions?.highFives || 0) +
                  (post.reactions?.mindBlown || 0) +
                  (post.reactions?.bigBrain || 0);

                return (
                  <div
                    key={post.id}
                    className="bg-card border border-border/60 rounded-2xl p-4 md:p-5 shadow-xs space-y-3.5 transition-all"
                  >
                    {/* Post Header: Author Avatar & Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                          {(post.author || "MB").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs md:text-sm text-foreground hover:underline cursor-pointer">
                              {post.author || "Young Builder"}
                            </span>
                            <span className="text-[10px] text-muted-foreground">• 1st</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground line-clamp-1">
                            {post.authorTitle || "Student & AI Builder"}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                            <span>{post.timestamp || "Recently"}</span>
                            <span>•</span>
                            <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-0.5">
                              <ShieldCheck className="h-2.5 w-2.5" /> Verified Peer
                            </span>
                          </div>
                        </div>
                      </div>

                      <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-secondary">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="text-xs md:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </div>

                    {/* Embedded Image Attachment */}
                    {post.imageUrl && (
                      <div className="rounded-2xl overflow-hidden border border-border/40 shadow-2xs">
                        <img
                          src={post.imageUrl}
                          alt="Post attachment"
                          className="w-full h-auto max-h-96 object-cover"
                        />
                      </div>
                    )}

                    {/* Embedded Video Attachment */}
                    {post.videoUrl && (
                      <div className="rounded-2xl overflow-hidden border border-border/40 shadow-2xs bg-black">
                        <video
                          src={post.videoUrl}
                          controls
                          className="w-full h-auto max-h-96"
                        />
                      </div>
                    )}

                    {/* Playable Agent Card Attachment (if an Agent was shared) */}
                    {post.agentMeta && (
                      <div className="bg-gradient-to-r from-secondary/60 to-purple-500/10 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            <Bot className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">
                              {post.agentMeta.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Trigger: {post.agentMeta.trigger} • {post.agentMeta.toolsCount} Active Tools
                            </span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => navigate("/playground")}
                          className="rounded-xl text-xs h-8 font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1"
                        >
                          <Play className="h-3 w-3 fill-current" /> Open in Playground
                        </Button>
                      </div>
                    )}

                    {/* Social Counters Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center -space-x-1">
                          <span className="h-4 w-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center">👍</span>
                          <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center">🙌</span>
                          <span className="h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] flex items-center justify-center">🤯</span>
                        </span>
                        <span className="font-semibold text-foreground">{totalReactions}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span>{(post.comments || []).length} comments</span>
                        <span>•</span>
                        <span>{post.repostsCount || 0} reposts</span>
                      </div>
                    </div>

                    {/* LinkedIn Action Buttons (Like, Comment, Repost, Send) */}
                    <div className="grid grid-cols-4 gap-1 pt-1 border-t border-border/40 text-xs font-bold text-muted-foreground">
                      <button
                        onClick={() => handleToggleReaction(post.id, "likes")}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors hover:bg-secondary/80 ${
                          post.reactions?.userReacted === "likes"
                            ? "text-blue-600 dark:text-blue-400 font-bold"
                            : ""
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Like</span>
                      </button>

                      <button
                        onClick={() =>
                          setExpandedComments({
                            ...expandedComments,
                            [post.id]: !expandedComments[post.id]
                          })
                        }
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors hover:bg-secondary/80"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Comment</span>
                      </button>

                      <button
                        onClick={() => {
                          setPosts((prev) =>
                            prev.map((p) =>
                              p.id === post.id ? { ...p, repostsCount: p.repostsCount + 1 } : p
                            )
                          );
                          toast({ title: "Reposted to your feed!", description: "+10 Mikos XP" });
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors hover:bg-secondary/80"
                      >
                        <Repeat className="h-4 w-4" />
                        <span>Repost</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast({ title: "Link Copied!", description: "Share this post anywhere." });
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl transition-colors hover:bg-secondary/80"
                      >
                        <Send className="h-4 w-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* Inline Comment Section */}
                    {expandedComments[post.id] && (
                      <div className="pt-3 border-t border-border/40 space-y-3 animate-in fade-in duration-200">
                        {/* Comment Input */}
                        <div className="flex items-center gap-2">
                          <AimikoAvatar size="sm" />
                          <div className="flex-1 flex items-center bg-secondary/60 rounded-full px-3 py-1.5 border border-border/60">
                            <input
                              type="text"
                              value={commentInputs[post.id] || ""}
                              onChange={(e) =>
                                setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                              }
                              placeholder="Add a congratulatory thought..."
                              className="w-full bg-transparent text-xs text-foreground focus:outline-none placeholder:text-muted-foreground"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleAddComment(post.id);
                              }}
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="text-primary hover:opacity-80 p-1"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Comments List */}
                        <div className="space-y-2 pt-1">
                          {(post.comments || []).map((c) => (
                            <div
                              key={c.id}
                              className="bg-secondary/40 rounded-2xl p-3 space-y-1 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-foreground">{c.author}</span>
                                <span className="text-[10px] text-muted-foreground">{c.timestamp}</span>
                              </div>
                              <p className="text-muted-foreground leading-relaxed">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>

          {/* ── RIGHT COLUMN: MIKODIN News, EOD Rewards & Trending (3 Cols) ── */}
          <div className="md:col-span-3 space-y-4">
            
            {/* MIKODIN News Widget */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" /> MIKODIN News
                </h4>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-pointer" />
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="space-y-0.5 cursor-pointer group">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                    • AI Agent Playground v2 released
                  </span>
                  <span className="text-[10px] text-muted-foreground">1,240 builders active</span>
                </div>
                <div className="space-y-0.5 cursor-pointer group">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                    • 12-Year-Olds dominate math streaks
                  </span>
                  <span className="text-[10px] text-muted-foreground">890 daily high-fives</span>
                </div>
                <div className="space-y-0.5 cursor-pointer group">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                    • Top 5 prompt hacks for exam prep
                  </span>
                  <span className="text-[10px] text-muted-foreground">2,100 reads today</span>
                </div>
                <div className="space-y-0.5 cursor-pointer group">
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors block">
                    • New robot mascot skin drops Friday
                  </span>
                  <span className="text-[10px] text-muted-foreground">EOD Points milestone</span>
                </div>
              </div>
            </div>

            {/* EOD Rewards Hub Card */}
            <div className="bg-gradient-to-br from-card to-purple-500/10 border border-purple-500/25 rounded-2xl p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1">
                  <Gift className="h-3.5 w-3.5" /> Daily EOD Rewards
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Resets in 5h
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-2xl font-black text-foreground">
                    {eodPoints} <span className="text-xs font-normal text-muted-foreground">/ {dailyGoal} XP</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((eodPoints / dailyGoal) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (eodPoints / dailyGoal) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] pt-1 border-t border-border/40">
                <div className="flex justify-between text-muted-foreground">
                  <span>Daily Check-In</span>
                  <span className="font-bold text-emerald-500">+50 XP ✓</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Create Agent in Playground</span>
                  <span className="font-bold text-emerald-500">+100 XP ✓</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Peer High-Fives</span>
                  <span className="font-bold text-purple-500">+25 XP</span>
                </div>
              </div>
            </div>

            {/* Suggested Peers Card */}
            <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-xs space-y-3 text-xs">
              <h4 className="font-bold text-foreground">Suggested Peer Builders</h4>
              <div className="space-y-3">
                {[
                  { name: "Maya Lin", desc: "Grade 7 • Science Olympiad", initials: "ML" },
                  { name: "Samir K.", desc: "Age 12 • Python Agent Builder", initials: "SK" }
                ].map((peer, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-secondary text-foreground font-bold text-[10px] flex items-center justify-center">
                        {peer.initials}
                      </div>
                      <div>
                        <span className="font-bold text-foreground block">{peer.name}</span>
                        <span className="text-[10px] text-muted-foreground">{peer.desc}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast({ title: "Connected!", description: `You are now peers with ${peer.name}.` })}
                      className="rounded-full text-[10px] h-6 px-2.5 font-bold"
                    >
                      + Connect
                    </Button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ── RICH LINKEDIN POST COMPOSER MODAL ── */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-2xl p-5 shadow-2xl max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-3">
                <AimikoAvatar size="sm" />
                <div>
                  <span className="font-bold text-xs text-foreground block">
                    {userName || "Young Builder"}
                  </span>
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                    Post to: Verified Peers 🌐
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsComposerOpen(false);
                  setMediaPreview(null);
                  setMediaType(null);
                }}
                className="text-muted-foreground hover:text-foreground text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={4}
              placeholder="What do you want to talk about? Share an AI agent, study milestone, or project screenshot..."
              className="w-full bg-transparent border-0 text-xs md:text-sm text-foreground focus:outline-none placeholder:text-muted-foreground leading-relaxed resize-none"
              autoFocus
            />

            {/* Media Preview Box */}
            {mediaPreview && (
              <div className="relative rounded-2xl overflow-hidden border border-border/40 bg-secondary/30 max-h-56">
                <button
                  onClick={() => {
                    setMediaPreview(null);
                    setMediaType(null);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full text-xs hover:bg-black"
                >
                  ✕
                </button>
                {mediaType === "image" ? (
                  <img
                    src={mediaPreview}
                    alt="Upload preview"
                    className="w-full h-auto max-h-56 object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full h-auto max-h-56"
                  />
                )}
              </div>
            )}

            {/* Selected Agent Attachment Pill */}
            {selectedAgentTag && (
              <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/20 rounded-xl p-2.5 text-xs">
                <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Bot className="h-4 w-4" /> Attached Agent: {selectedAgentTag}
                </span>
                <button
                  onClick={() => setSelectedAgentTag(null)}
                  className="text-muted-foreground hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Media Upload Buttons in Modal Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="flex items-center gap-2 text-muted-foreground">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-secondary hover:text-blue-500 transition-colors"
                  title="Attach Photo"
                >
                  <ImageIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="p-2 rounded-lg hover:bg-secondary hover:text-emerald-500 transition-colors"
                  title="Attach Video"
                >
                  <VideoIcon className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedAgentTag("Cosmo Homework Detective")}
                  className="p-2 rounded-lg hover:bg-secondary hover:text-purple-500 transition-colors"
                  title="Attach AI Agent"
                >
                  <Bot className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsComposerOpen(false)}
                  className="rounded-xl text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreatePost}
                  disabled={!postText.trim() && !mediaPreview}
                  className="rounded-xl text-xs h-8 font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Post (+50 XP)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MIKODIN LinkedIn-style Profile Setup & Community Terms Modal */}
      <MikodinProfileSetupModal
        isOpen={isProfileSetupOpen}
        onSuccess={() => {
          setIsProfileSetupOpen(false);
          setUserHeadline(
            localStorage.getItem("aimiko_mikodin_headline") ||
              `${roleLabel} • AI Learner & Builder`
          );
        }}
        onClose={() => setIsProfileSetupOpen(false)}
      />

    </div>
  );
}
