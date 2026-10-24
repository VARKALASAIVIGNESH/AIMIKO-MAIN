import { useState, useEffect } from "react";
import { Globe, MessageCircle, Sparkles, ThumbsUp, Send, Share2, Plus, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAimiko } from "@/context/AimikoContext";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}

interface Post {
  id: string;
  title: string;
  summary: string;
  author: string;
  role: string;
  likes: number;
  hasLiked?: boolean;
  comments: Comment[];
  category: "Study" | "Startup" | "Development" | "General" | "Creative";
  timestamp: string;
}

const defaultPosts: Post[] = [
  {
    id: "1",
    title: "AI-generated study notes for Organic Chemistry",
    summary: "I asked AIMIKO to summarize the latest alkanes and alkenes chapter. It broke it down into 5 visual flashcard chunks and added a cartoon mnemonic. Check it out!",
    author: "Rohan K.",
    role: "student",
    likes: 12,
    hasLiked: false,
    comments: [
      { id: "c1", author: "Aanya S.", text: "This is super helpful for my upcoming test! Thanks for sharing.", timestamp: "2 hours ago" },
      { id: "c2", author: "Dev Bot", text: "Love the mnemonics, AIMIKO is so good at these.", timestamp: "1 hour ago" }
    ],
    category: "Study",
    timestamp: "3 hours ago",
  },
  {
    id: "2",
    title: "Lean Pitch Deck Outline for Micro-SaaS",
    summary: "Created a 9-segment business canvas for a real estate reporting tool. Got feedback on monetization channels from the founder advisor bot.",
    author: "Sarah Chen",
    role: "founder",
    likes: 24,
    hasLiked: false,
    comments: [],
    category: "Startup",
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    title: "Beginner Javascript Debugging Playground",
    summary: "Sharing a small interactive debugger blueprint that lets you execute simulated sandboxed code safely. Built with React state fallbacks.",
    author: "Marcus V.",
    role: "developer",
    likes: 18,
    hasLiked: false,
    comments: [
      { id: "c3", author: "John D.", text: "Which React sandbox library did you use for the execution shell?", timestamp: "4 hours ago" }
    ],
    category: "Development",
    timestamp: "1 day ago",
  },
];

export default function Feed() {
  const { userName, role, notes } = useAimiko();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  
  // Modal / form states
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newCategory, setNewCategory] = useState<Post["category"]>("General");
  
  // Note-sharing helper state
  const [selectedNoteId, setSelectedNoteId] = useState("");
  
  // Comment states per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // Initialize and load posts
  useEffect(() => {
    const stored = localStorage.getItem("aimiko_feed_posts");
    if (stored) {
      try {
        setPosts(JSON.parse(stored));
      } catch (e) {
        setPosts(defaultPosts);
      }
    } else {
      setPosts(defaultPosts);
      localStorage.setItem("aimiko_feed_posts", JSON.stringify(defaultPosts));
    }
  }, []);

  const savePostsToStorage = (updatedPosts: Post[]) => {
    setPosts(updatedPosts);
    localStorage.setItem("aimiko_feed_posts", JSON.stringify(updatedPosts));
  };

  // Upvote/Like post
  const handleLike = (id: string) => {
    const updated = posts.map((post) => {
      if (post.id === id) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          likes: hasLiked ? post.likes + 1 : post.likes - 1,
          hasLiked,
        };
      }
      return post;
    });
    savePostsToStorage(updated);
  };

  // Submit a comment
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const authorName = userName.trim() || "Anonymous Friend";
    const newComment: Comment = {
      id: Date.now().toString(),
      author: authorName,
      text,
      timestamp: "Just now",
    };

    const updated = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, newComment],
        };
      }
      return post;
    });

    savePostsToStorage(updated);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    toast({
      title: "Comment added",
      description: "Your comment has been posted to the feed.",
    });
  };

  // Import content from a Note
  const handleImportNote = (noteId: string) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setNewTitle(note.title);
      setNewSummary(note.content);
      toast({
        title: "Imported from Notes",
        description: `Successfully loaded note: "${note.title}"`,
      });
    }
  };

  // Create a new post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out both the title and post content.",
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      summary: newSummary.trim(),
      author: userName.trim() || "Anonymous Friend",
      role: role || "student",
      likes: 0,
      hasLiked: false,
      comments: [],
      category: newCategory,
      timestamp: "Just now",
    };

    const updated = [newPost, ...posts];
    savePostsToStorage(updated);

    // Reset Form
    setNewTitle("");
    setNewSummary("");
    setNewCategory("General");
    setSelectedNoteId("");
    setIsComposerOpen(false);

    toast({
      title: "Post published!",
      description: "Your post is now visible to the AIMIKO community.",
    });
  };

  return (
    <div className="p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 animate-pop-in">
        
        {/* Header card with glassmorphism */}
        <div className="tech-card glow-purple border-border bg-card/60 p-6 md:p-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-background/80 border border-border text-primary">
              <Globe className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-display font-black tracking-wider uppercase text-foreground">
                Community Feed
              </h1>
              <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">
                Share your study notes, business canvases, and visual checklists with other members.
              </p>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsComposerOpen(true)}
            className="rounded-xl px-6 py-3 font-bold shadow-md hover-bounce flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Share Post
          </Button>
        </div>

        {/* Main Composer Modal Drawer */}
        {isComposerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="tech-card glow-purple bg-background border-border/80 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
              <div className="flex justify-between items-center px-6 py-4 border-b border-border">
                <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Create Post
                </h2>
                <button 
                  onClick={() => setIsComposerOpen(false)}
                  className="p-1 rounded-lg hover:bg-secondary/50 text-muted-foreground transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreatePost} className="p-6 space-y-5">
                {/* Optional Share Note Dropdown */}
                {notes.length > 0 && (
                  <div className="bg-card/60 border border-border rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                      <Share2 className="h-3 w-3" /> Share a Note
                    </span>
                    <select
                      value={selectedNoteId}
                      onChange={(e) => {
                        setSelectedNoteId(e.target.value);
                        handleImportNote(e.target.value);
                      }}
                      className="w-full bg-background border border-border text-xs rounded-xl px-3.5 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                    >
                      <option value="" className="bg-background">-- Select note to import --</option>
                      {notes.map((note) => (
                        <option key={note.id} value={note.id} className="bg-background">
                          {note.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {(["Study", "Startup", "Development", "Creative", "General"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setNewCategory(cat)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                          newCategory === cat
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary block">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. SWOT analysis for retail stores"
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary block">Content</label>
                  <textarea
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Describe your research, checklists, or summaries..."
                    rows={4}
                    className="w-full bg-card border border-border rounded-xl px-4 py-2.5 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 leading-relaxed font-semibold"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsComposerOpen(false)}
                    className="w-1/2 rounded-xl py-2.5 hover:bg-secondary/50 font-semibold text-xs border border-border"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="w-1/2 rounded-xl py-2.5 font-bold text-xs"
                  >
                    Publish Post
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Feed list layout */}
        <div className="space-y-6">
          <h2 className="font-display font-black text-lg text-foreground uppercase tracking-widest flex items-center gap-2 px-1 mb-2">
            <Sparkles className="h-4 w-4 text-primary animate-wiggle" /> Community Posts
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-16 tech-card border-border bg-card/60 p-6 shadow-inner">
              <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
              <p className="text-xs text-muted-foreground leading-relaxed italic">No modules have been published to the shared console directory.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className="tech-card border-border hover:border-primary/30 bg-card/60 p-6 shadow-lg space-y-4 hover-lift"
                >
                  {/* User card info */}
                  <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-background flex items-center justify-center font-black text-primary text-xs uppercase border border-border">
                        {post.author.slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-black text-foreground text-xs tracking-wider">{post.author}</h3>
                          <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-black uppercase tracking-wider">
                            {post.role}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{post.timestamp}</p>
                      </div>
                    </div>
                    
                    <span className="text-[10px] uppercase font-black bg-background border border-border text-muted-foreground rounded-lg px-3 py-1 tracking-wider">
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h4 className="text-base font-display font-black text-foreground tracking-wide hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold whitespace-pre-line">
                      {post.summary}
                    </p>
                  </div>

                  <hr className="border-border/40" />

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 font-black transition-all cursor-pointer ${
                          post.hasLiked 
                            ? "text-red-500 hover:scale-105" 
                            : "text-muted-foreground hover:text-red-500 hover:scale-105"
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${post.hasLiked ? "fill-red-500" : ""}`} />
                        <span className="font-mono text-xs">{post.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                        className={`flex items-center gap-2 font-black tracking-wider uppercase transition hover:text-primary cursor-pointer ${
                          activeCommentPostId === post.id ? "text-primary animate-pulse" : "text-muted-foreground"
                        }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-[10px]">{post.comments.length} Comments</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments section */}
                  {activeCommentPostId === post.id && (
                    <div className="bg-background/45 border border-border/40 rounded-2xl p-4 mt-3 space-y-4 animate-slide-up-bounce">
                      <div className="space-y-3">
                        {post.comments.length === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic tracking-wider leading-relaxed">No logs added to this module yet. Initialize conversation below.</p>
                        ) : (
                          post.comments.map((comm) => (
                            <div key={comm.id} className="text-xs border-b border-border/40 last:border-b-0 pb-2.5 last:pb-0">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-display font-black text-foreground text-xs">{comm.author}</span>
                                <span className="text-[9px] text-muted-foreground font-mono">{comm.timestamp}</span>
                              </div>
                              <p className="text-muted-foreground font-semibold leading-relaxed text-xs">{comm.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="flex-1 bg-card border border-border text-xs rounded-xl px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                        />
                        <Button
                          onClick={() => handleAddComment(post.id)}
                          className="rounded-xl px-3 py-2 flex items-center justify-center cursor-pointer"
                          size="sm"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
