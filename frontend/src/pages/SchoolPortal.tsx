import { useState, useEffect } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  BookOpen, 
  GraduationCap, 
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Calculator, 
  FileText, 
  Sparkles,
  ClipboardList
} from "lucide-react";

interface Assignment {
  id: string;
  subject: string;
  title: string;
  dueDate: string;
  completed: boolean;
  aiNotes?: string;
}

interface CourseGrade {
  id: string;
  name: string;
  credits: number;
  gradeValue: number; // 4.0 scale
}

interface Announcement {
  id: string;
  sender: string;
  title: string;
  body: string;
  date: string;
  pinned: boolean;
}

const defaultAnnouncements: Announcement[] = [
  {
    id: "1",
    sender: "Principal's Office",
    title: "Annual Science Fair Registration Open",
    body: "Register your projects by next Friday. AIMIKO is available to help outline prototype pitches and boards!",
    date: "2 days ago",
    pinned: true,
  },
  {
    id: "2",
    sender: "Department of Student Affairs",
    title: "Summer Internship Fair - June 15",
    body: "Over 40 startup partners and companies will be hiring. Pre-schedule resume critique reviews.",
    date: "4 days ago",
    pinned: false,
  },
  {
    id: "3",
    sender: "Library Committee",
    title: "Extended Study Hours for Midterms",
    body: "The central study hall will remain open 24/7. Quiet study cubicles can be booked in advance.",
    date: "1 week ago",
    pinned: false,
  },
];

export default function SchoolPortal() {
  const { role, ageGroup } = useAimiko();
  const { toast } = useToast();
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<"assignments" | "grades" | "bulletin">("assignments");

  // Assignments States
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [selectedAiNotes, setSelectedAiNotes] = useState<string | null>(null);

  // Grade Calculator States
  const [courses, setCourses] = useState<CourseGrade[]>([
    { id: "1", name: "Calculus I", credits: 4, gradeValue: 4.0 },
    { id: "2", name: "Physics & Lab", credits: 4, gradeValue: 3.7 },
    { id: "3", name: "Intro to Python", credits: 3, gradeValue: 4.0 },
  ]);
  const [courseName, setCourseName] = useState("");
  const [courseCredits, setCourseCredits] = useState(3);
  const [courseGrade, setCourseGrade] = useState(4.0);

  // Bulletin States
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");

  // Hydrate assignments
  useEffect(() => {
    const stored = localStorage.getItem("aimiko_school_assignments");
    if (stored) {
      try {
        setAssignments(JSON.parse(stored));
      } catch (e) {
        setAssignments([]);
      }
    } else {
      const init = [
        { id: "a1", subject: "Math", title: "Algebra Chapter 3 Homework Problems", dueDate: "2026-06-14", completed: false },
        { id: "a2", subject: "Chemistry", title: "Organic Compounds Lab Report", dueDate: "2026-06-18", completed: false }
      ];
      setAssignments(init);
      localStorage.setItem("aimiko_school_assignments", JSON.stringify(init));
    }
  }, []);

  const saveAssignments = (updated: Assignment[]) => {
    setAssignments(updated);
    localStorage.setItem("aimiko_school_assignments", JSON.stringify(updated));
  };

  // Add Assignment
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newTitle.trim() || !newDueDate) return;

    const newAss: Assignment = {
      id: Date.now().toString(),
      subject: newSubject.trim(),
      title: newTitle.trim(),
      dueDate: newDueDate,
      completed: false,
    };

    const updated = [...assignments, newAss];
    saveAssignments(updated);

    setNewSubject("");
    setNewTitle("");
    setNewDueDate("");
    toast({
      title: "Assignment Added",
      description: `"${newAss.title}" has been added to your homework tracker.`,
    });
  };

  // Toggle Complete Assignment
  const handleToggleAssignment = (id: string) => {
    const updated = assignments.map((a) => {
      if (a.id === id) {
        const next = !a.completed;
        if (next) {
          toast({ title: "Task completed!", description: "Keep up the excellent study momentum!" });
        }
        return { ...a, completed: next };
      }
      return a;
    });
    saveAssignments(updated);
  };

  // Delete Assignment
  const handleDeleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    saveAssignments(updated);
  };

  // Generate AI study notes for Assignment
  const handleGenerateStudyGuide = (id: string) => {
    const item = assignments.find((a) => a.id === id);
    if (!item) return;

    toast({
      title: "Consulting AIMIKO...",
      description: "Auto-generating study roadmap based on assignment title.",
    });

    setTimeout(() => {
      const generatedNotes = `AIMIKO Study Companion Guide for:\n"${item.title}" (${item.subject})\n\nKey Concept Outlines:\n1. Core Theories: Refresh yourself on primary textbook definitions before solving.\n2. Step-by-Step Logic: Break calculation sub-parts down to prevent margin errors.\n3. Common Pitfalls: Watch units, signs, and verify steps.\n\nRecommended Resources:\n- OpenStax Chapter resources & lecture slides.\n- Check class discussion board for similar problem solving hints.\n\nHappy Learning, keep it up!`;
      
      const updated = assignments.map((a) => {
        if (a.id === id) {
          return { ...a, aiNotes: generatedNotes };
        }
        return a;
      });
      saveAssignments(updated);
      setSelectedAiNotes(generatedNotes);
    }, 1200);
  };

  // Grade Calculator Handlers
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    const newCourse = {
      id: Date.now().toString(),
      name: courseName.trim(),
      credits: courseCredits,
      gradeValue: courseGrade,
    };

    setCourses([...courses, newCourse]);
    setCourseName("");
    toast({
      title: "Course Added",
      description: `Logged ${newCourse.name} successfully.`,
    });
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  const calculateGpa = () => {
    if (courses.length === 0) return "0.00";
    let totalPoints = 0;
    let totalCredits = 0;
    courses.forEach((c) => {
      totalPoints += c.gradeValue * c.credits;
      totalCredits += c.credits;
    });
    return (totalPoints / totalCredits).toFixed(2);
  };

  // Bulletin Announcement Post
  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    const newPost: Announcement = {
      id: Date.now().toString(),
      sender: "Ecosystem Member (Me)",
      title: postTitle.trim(),
      body: postBody.trim(),
      date: "Just now",
      pinned: false,
    };

    setAnnouncements([newPost, ...announcements]);
    setPostTitle("");
    setPostBody("");
    toast({
      title: "Notice Posted",
      description: "Your announcement is now visible on the bulletin.",
    });
  };

  return (
    <div className="p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 animate-pop-in">
        
        {/* Page Title Header Card */}
        <div className="tech-card glow-purple border-border bg-card/60 p-6 md:p-8 shadow-xl flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-background border border-border text-primary">
            <Building2 className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-black tracking-wider uppercase text-foreground">
              School Portal
            </h1>
            <p className="text-xs text-muted-foreground font-semibold leading-relaxed mt-1">
              Keep track of homework assignments, calculate your GPA, and stay updated with school notices.
            </p>
          </div>
        </div>

        {/* Tabs navigation panel */}
        <div className="flex border-b border-border gap-6 select-none">
          <button
            onClick={() => setActiveTab("assignments")}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === "assignments" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab("grades")}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === "grades" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            GPA Calculator
          </button>
          <button
            onClick={() => setActiveTab("bulletin")}
            className={`pb-3 text-xs font-black uppercase tracking-widest transition-all relative cursor-pointer ${
              activeTab === "bulletin" 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            School Bulletin
          </button>
        </div>

        {/* Tab 1: Assignments Dashboard */}
        {activeTab === "assignments" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            {/* Assignment List */}
            <div className="tech-card border-border bg-card/60 p-6 shadow-md space-y-5">
              <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2.5">
                <ClipboardList className="h-4 w-4 text-primary" /> Active Homework Tasks
              </h2>

              {assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground leading-relaxed italic py-4">No academic assignments found. Register your first task below.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((ass) => (
                    <div 
                      key={ass.id} 
                      className={`bg-background/40 border rounded-2xl p-4 flex flex-col justify-between gap-3 transition-all duration-300 ${
                        ass.completed 
                          ? "border-border/40 opacity-50" 
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                             type="checkbox"
                             checked={ass.completed}
                             onChange={() => handleToggleAssignment(ass.id)}
                             className="mt-1 h-4 w-4 cursor-pointer accent-primary shrink-0"
                           />
                          <div>
                            <h4 className={`text-xs font-black tracking-wide ${ass.completed ? "line-through text-muted-foreground font-semibold" : "text-foreground"}`}>
                              {ass.title}
                            </h4>
                            <div className="flex gap-2 items-center mt-1.5 flex-wrap">
                              <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-black uppercase tracking-wider">
                                {ass.subject}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                Due: {new Date(ass.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteAssignment(ass.id)}
                          className="text-muted-foreground hover:text-red-500 p-1.5 rounded-lg hover:bg-white/5 transition shrink-0 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {!ass.completed && (
                        <div className="flex justify-end gap-2 border-t border-border/40 pt-3 mt-1.5">
                          {ass.aiNotes && (
                            <Button
                              onClick={() => setSelectedAiNotes(ass.aiNotes || null)}
                              variant="secondary"
                              size="sm"
                              className="text-[10px] h-7 px-3 rounded-lg font-bold"
                            >
                              View Guide
                            </Button>
                          )}
                          <Button
                            onClick={() => handleGenerateStudyGuide(ass.id)}
                            variant="outline"
                            size="sm"
                            className="text-[10px] h-7 px-3 rounded-lg border-primary/30 text-primary hover:bg-primary/5 flex items-center gap-1 font-bold hover-bounce"
                          >
                            <Sparkles className="h-3 w-3" /> Outline Study Plan
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Add Assignment Form */}
              <form onSubmit={handleAddAssignment} className="border-t border-border pt-5 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                  Log New Class Task
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Subject (e.g. Physics)"
                    className="bg-background border border-border text-xs rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                    required
                  />
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Homework task details..."
                    className="bg-background border border-border text-xs rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                    required
                  />
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="bg-background border border-border text-xs rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="w-full rounded-xl py-4 flex items-center justify-center gap-2 font-bold hover-bounce">
                  <Plus className="h-4 w-4" /> Save Assignment Module
                </Button>
              </form>
            </div>

            {/* AI Guide Notes Sidebar */}
            <div className="tech-card border-border bg-card/60 p-6 shadow-md space-y-4">
              <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2.5">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" /> AIMIKO Study Assistant
              </h2>

              {selectedAiNotes ? (
                <div className="bg-background/45 border border-border rounded-2xl p-4 space-y-4">
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-semibold">
                    {selectedAiNotes}
                  </p>
                  <Button 
                    onClick={() => setSelectedAiNotes(null)} 
                    variant="ghost" 
                    size="sm" 
                    className="w-full rounded-xl text-xs py-2 hover:bg-primary/5 border border-border font-bold"
                  >
                    Clear Preview
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground space-y-3">
                  <FileText className="h-8 w-8 mx-auto text-muted-foreground/60 animate-pulse" />
                  <p className="text-[10px] max-w-xs mx-auto leading-relaxed font-semibold">
                    Click "Outline Study Plan" on any assignment. AIMIKO will structure core concepts, flashcard guides, and learning advice instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: GPA Calculator */}
        {activeTab === "grades" && (
          <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
            {/* Active Courses */}
            <div className="tech-card border-border bg-card/60 p-6 shadow-md space-y-5">
              <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2.5">
                <ClipboardList className="h-4 w-4 text-primary" /> Active Subject Grades
              </h2>

              <div className="space-y-2">
                {courses.length === 0 ? (
                  <p className="text-xs text-muted-foreground leading-relaxed italic py-4">No course grades logged. Calibrate your GPA scale below.</p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="bg-background/40 border border-border/40 rounded-2xl p-4 flex justify-between items-center text-xs font-semibold">
                      <div className="space-y-1">
                        <h4 className="font-display font-black text-foreground text-xs tracking-wider">{course.name}</h4>
                        <p className="text-muted-foreground mt-0.5">Credits: {course.credits} &bull; GPA: {course.gradeValue.toFixed(1)}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)} 
                        className="text-muted-foreground hover:text-red-500 p-1.5 hover:bg-white/5 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add Course */}
              <form onSubmit={handleAddCourse} className="border-t border-border pt-5 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block">
                  Log New Subject
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Name</label>
                    <input
                      type="text"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Literature"
                      className="w-full bg-background border border-border text-xs rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Credits</label>
                    <select
                      value={courseCredits}
                      onChange={(e) => setCourseCredits(Number(e.target.value))}
                      className="w-full bg-background border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none font-semibold"
                    >
                      {[1, 2, 3, 4, 5].map(c => <option key={c} value={c} className="bg-card">{c} Credits</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Grade Equivalent</label>
                    <select
                      value={courseGrade}
                      onChange={(e) => setCourseGrade(Number(e.target.value))}
                      className="w-full bg-background border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none font-semibold"
                    >
                      <option value={4.0} className="bg-card">A (4.0)</option>
                      <option value={3.7} className="bg-card">A- (3.7)</option>
                      <option value={3.3} className="bg-card">B+ (3.3)</option>
                      <option value={3.0} className="bg-card">B (3.0)</option>
                      <option value={2.7} className="bg-card">B- (2.7)</option>
                      <option value={2.3} className="bg-card">C+ (2.3)</option>
                      <option value={2.0} className="bg-card">C (2.0)</option>
                      <option value={0.0} className="bg-card">F (0.0)</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" size="sm" className="w-full rounded-xl py-4 flex items-center justify-center gap-2 font-bold hover-bounce">
                  <Plus className="h-4 w-4" /> Save Course Grade
                </Button>
              </form>
            </div>

            {/* Projected GPA Results Card */}
            <div className="tech-card border-border bg-card/60 p-6 shadow-md flex flex-col justify-between gap-6">
              <div className="space-y-2 text-center border-b border-border/40 pb-4">
                <Calculator className="h-6 w-6 text-primary mx-auto animate-pulse" />
                <h3 className="font-display font-black text-sm text-foreground uppercase tracking-widest">Projected GPA Index</h3>
                <p className="text-[10px] text-muted-foreground font-semibold">Calculated across your active course credit-weights.</p>
              </div>
              
              <div className="bg-background border border-border/40 rounded-3xl py-8 text-center shadow-inner">
                <span className="text-5xl font-display font-black text-primary">
                  {calculateGpa()}
                </span>
                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-2">Current GPA Scale</p>
              </div>

              <p className="text-[10px] text-muted-foreground text-center leading-relaxed font-semibold">
                Maintain an average GPA above 3.5 to qualify for academic accomplishments and honor roll badges on AIMIKO's achievements showcase.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Bulletin Announcement Notice Board */}
        {activeTab === "bulletin" && (
          <div className="space-y-6">
            <div className="tech-card border-border bg-card/60 p-6 shadow-md space-y-4">
              <h2 className="font-display font-black text-sm text-foreground uppercase tracking-widest flex items-center gap-2 border-b border-border/40 pb-2.5">
                <Megaphone className="h-4 w-4 text-primary animate-pulse" /> Active Announcement Telemetry
              </h2>

              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div 
                    key={ann.id} 
                    className={`bg-background/40 border rounded-2xl p-5 space-y-2 relative transition-all duration-300 ${
                      ann.pinned 
                        ? "border-primary/20 shadow-lg shadow-primary/[0.02]" 
                        : "border-border/40"
                    }`}
                  >
                    {ann.pinned && (
                      <span className="absolute top-4 right-4 text-[9px] bg-primary/10 text-primary border border-primary/25 rounded-md px-2.5 py-0.5 font-black uppercase tracking-widest">
                        PINNED
                      </span>
                    )}
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground font-mono uppercase">{ann.sender} &bull; {ann.date}</span>
                      <h4 className="text-xs font-black text-foreground tracking-wide">{ann.title}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                      {ann.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Notice Poster */}
            <div className="tech-card border-border bg-card/60 p-6 shadow-md">
              <h3 className="font-display font-black text-sm text-foreground uppercase tracking-widest mb-4 border-b border-border/40 pb-2">Post a General Notice</h3>
              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary">Notice Title</label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Study Group meeting in Cafe"
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black tracking-widest text-primary">Announcement Message</label>
                  <textarea
                    value={postBody}
                    onChange={(e) => setPostBody(e.target.value)}
                    placeholder="Provide all location, time, and class details..."
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary/45 font-semibold leading-relaxed"
                    required
                  />
                </div>
                <Button type="submit" className="rounded-xl font-bold py-3 px-6 hover-bounce">
                  Publish Notice
                </Button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
