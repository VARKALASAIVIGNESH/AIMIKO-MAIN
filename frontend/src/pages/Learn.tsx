import { useState, useRef, useEffect } from "react";
import MainNavbar from "@/components/MainNavbar";
import {
  GraduationCap,
  BookOpen,
  Sparkles,
  Building2,
  Brain,
  FileText,
  CheckCircle2,
  RotateCcw,
  BarChart3,
  Send,
  HelpCircle,
  Clock,
  Layers,
  Copy,
  Download,
  Zap,
  ArrowRight,
  TrendingUp,
  Check,
  ChevronRight,
  Share2,
  Users,
  MessageSquare,
  Award,
  AlertCircle,
  Inbox,
  PenTool,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export type LearnView = "overview" | "student" | "teacher" | "institution";

// ─── Shared Educational Data Models ──────────────────────────────────────────
export interface ClassAssignment {
  id: string;
  title: string;
  subject: string;
  teacherName: string;
  dueDate: string;
  type: "quiz" | "exam" | "notes";
  totalQuestions: number;
  totalMarks: number;
  content: string;
  status: "published" | "draft";
  assignedTo: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  aiGradingFeedback: string;
  teacherRemark?: string;
  status: "graded" | "reviewed";
}

export interface TeacherDoubt {
  id: string;
  studentName: string;
  subject: string;
  question: string;
  aiHintContext: string;
  timestamp: string;
  teacherReply?: string;
  status: "open" | "answered";
}

interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  timestamp: string;
  steps?: string[];
  analogy?: string;
}

// ─── Initial Seeded Shared State ─────────────────────────────────────────────
const INITIAL_ASSIGNMENTS: ClassAssignment[] = [
  {
    id: "asg-1",
    title: "Unit 4 Quiz: Nucleophilic Substitution & Stereochemistry",
    subject: "Organic Chemistry",
    teacherName: "Dr. Ronald Vance",
    dueDate: "Tomorrow, 5:00 PM",
    type: "quiz",
    totalQuestions: 3,
    totalMarks: 15,
    content: "Covers SN1 vs SN2 kinetics, Walden inversion, carbocation intermediate stability, and polar aprotic solvent acceleration.",
    status: "published",
    assignedTo: "Grade 11 - Section A (48 Students)"
  },
  {
    id: "asg-2",
    title: "Thermodynamics Carnot Cycle Derivation Paper",
    subject: "Physics",
    teacherName: "Prof. Elena Rostova",
    dueDate: "Oct 20, 11:59 PM",
    type: "exam",
    totalQuestions: 4,
    totalMarks: 25,
    content: "Derive ideal heat engine efficiency eta = 1 - (Tc / Th) and explain second law entropy increase.",
    status: "published",
    assignedTo: "Grade 11 - Advanced Physics (32 Students)"
  }
];

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub-1",
    assignmentId: "asg-1",
    assignmentTitle: "Unit 4 Quiz: Nucleophilic Substitution",
    studentName: "Alex Rivera",
    score: 13,
    maxScore: 15,
    submittedAt: "10 mins ago",
    aiGradingFeedback: "Excellent understanding of Walden inversion in SN2. Minor conceptual gap in tertiary substrate steric kinetics.",
    teacherRemark: "Strong work, Alex. Review steric hindrance on page 142.",
    status: "reviewed"
  },
  {
    id: "sub-2",
    assignmentId: "asg-1",
    assignmentTitle: "Unit 4 Quiz: Nucleophilic Substitution",
    studentName: "Marcus Chen",
    score: 11,
    maxScore: 15,
    submittedAt: "25 mins ago",
    aiGradingFeedback: "Understands leaving groups well. Confused polar protic with polar aprotic solvent effects.",
    teacherRemark: "Remember: DMSO does not form hydrogen bonds with the nucleophile.",
    status: "reviewed"
  }
];

const INITIAL_DOUBTS: TeacherDoubt[] = [
  {
    id: "dbt-1",
    studentName: "Alex Rivera",
    subject: "Organic Chemistry",
    question: "Why does acetone accelerate SN2 reactions better than ethanol if ethanol is more polar?",
    aiHintContext: "Student confused overall dielectric polarity with hydrogen-bonding solvation cage around nucleophiles.",
    timestamp: "15 mins ago",
    teacherReply: "Acetone is aprotic! It dissolves the salt without caging the nucleophile, leaving it bare and highly aggressive.",
    status: "answered"
  }
];

export default function Learn() {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<LearnView>("overview");

  // ─── LIVE SHARED INTERACTION STATE ───
  const [assignments, setAssignments] = useState<ClassAssignment[]>(INITIAL_ASSIGNMENTS);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(INITIAL_SUBMISSIONS);
  const [doubts, setDoubts] = useState<TeacherDoubt[]>(INITIAL_DOUBTS);

  // ─── Student State ───
  const [studentTab, setStudentTab] = useState<"tutor" | "inbox" | "doubts">("tutor");
  const [activeTakingAssignment, setActiveTakingAssignment] = useState<ClassAssignment | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIdx: number]: number }>({});
  const [isSubmittingToTeacher, setIsSubmittingToTeacher] = useState(false);
  const [studentQuestionInput, setStudentQuestionInput] = useState("");

  const [studentMessages, setStudentMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "tutor",
      text: "Hello! I am your 24/7 Socratic AI Study Coach. Ask me to break down your teacher's assignments, explain tough homework problems, or test your recall.",
      timestamp: "12:00 PM",
      steps: [
        "Ask a specific question about your teacher's notes or homework.",
        "Receive structured guidance and intuitive step-by-step analogies.",
        "Submit completed quizzes directly to your teacher's gradebook."
      ],
      analogy: "Think of me as your study partner who prepares you before turning in work to your teacher."
    }
  ]);
  const [studentInput, setStudentInput] = useState("");
  const [isTutorThinking, setIsTutorThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // ─── Teacher State ───
  const [teacherTab, setTeacherTab] = useState<"generator" | "gradebook" | "doubts">("generator");
  const [selectedSubject, setSelectedSubject] = useState("Organic Chemistry");
  const [teacherNotes, setTeacherNotes] = useState(
    `Chapter 7: Alkyl Halides and Nucleophilic Substitution\n\n1. SN2 Mechanism:\n- 1-step concerted backside attack.\n- Causes complete Walden inversion.\n- Rate = k[substrate][nucleophile]. Favored by methyl/primary halides and polar aprotic solvents (DMSO, Acetone).\n\n2. SN1 Mechanism:\n- 2-step process via planar carbocation intermediate.\n- Results in racemization (50% inversion, 50% retention).\n- Rate = k[substrate]. Favored by tertiary halides and polar protic solvents (Water, Ethanol).`
  );
  const [generatedMaterial, setGeneratedMaterial] = useState<{
    title: string;
    type: "quiz" | "exam";
    content: string;
    totalMarks: number;
    totalQuestions: number;
  }>({
    title: "Unit 4 Quiz: Nucleophilic Substitution & Stereochemistry",
    type: "quiz",
    content: "Q1. What stereochemical outcome occurs in SN2 backside displacement?\n[A] Retention  [B] Walden Inversion  [C] Racemization\nAnswer: [B]\n\nQ2. Which solvent condition maximizes SN2 reaction velocity?\n[A] Polar protic  [B] Polar aprotic (Acetone/DMSO)  [C] Nonpolar alkane\nAnswer: [B]\n\nQ3. Why do 3° alkyl halides fail to undergo SN2 reactions?\nAnswer: Excessive steric bulk prevents backside orbital overlap.",
    totalMarks: 15,
    totalQuestions: 3
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [teacherRemarkInput, setTeacherRemarkInput] = useState<{ [subId: string]: string }>({});

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [studentMessages, isTutorThinking]);

  // Handle student asking AI tutor
  const handleAskTutor = (customText?: string) => {
    const text = (customText || studentInput).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now"
    };

    setStudentMessages((prev) => [...prev, userMsg]);
    if (!customText) setStudentInput("");
    setIsTutorThinking(true);

    setTimeout(() => {
      let reply = `Here is a clear breakdown for "${text}":`;
      let steps = [
        "Core Rule: Polar aprotic solvents (DMSO, Acetone) accelerate SN2 by not solvating the nucleophile.",
        "Contrast: Polar protic solvents (H2O, EtOH) cage the nucleophile in hydrogen bonds, slowing SN2 down.",
        "Takeaway for Dr. Vance's quiz: Always pick polar aprotic for fast SN2 displacements."
      ];
      let analogy = "Imagine a running back on a football field: aprotic solvents leave the field wide open, while protic solvents surround the runner with a swarm of defenders.";

      if (text.toLowerCase().includes("carnot") || text.toLowerCase().includes("entropy")) {
        reply = "Carnot efficiency is the theoretical upper ceiling of thermodynamics.";
        steps = [
          "Equation: Efficiency eta = 1 - (Tc / Th).",
          "Tc = Temperature of cold sink, Th = Temperature of hot reservoir (in Kelvin).",
          "Entropy generation is 0 only for idealized reversible loops; all real cycles increase universe entropy."
        ];
        analogy = "Like a waterfall: water only does work falling down. Once at the lowest basin, you cannot extract more work without putting energy back in.";
      }

      setStudentMessages((prev) => [
        ...prev,
        {
          id: `tut-${Date.now()}`,
          sender: "tutor",
          text: reply,
          timestamp: "Just now",
          steps,
          analogy
        }
      ]);
      setIsTutorThinking(false);
    }, 600);
  };

  // TEACHER: Publish assignment live to students
  const handlePublishAssignment = () => {
    const newAsg: ClassAssignment = {
      id: `asg-${Date.now()}`,
      title: generatedMaterial.title,
      subject: selectedSubject,
      teacherName: "Dr. Ronald Vance",
      dueDate: "Friday, 5:00 PM",
      type: generatedMaterial.type,
      totalQuestions: generatedMaterial.totalQuestions,
      totalMarks: generatedMaterial.totalMarks,
      content: generatedMaterial.content,
      status: "published",
      assignedTo: "Grade 11 - Section A (48 Students)"
    };

    setAssignments((prev) => [newAsg, ...prev]);
    toast({
      title: "Assignment Published to Students!",
      description: `"${newAsg.title}" is now visible in the Student Inbox. Students can take the test and submit.`
    });
  };

  // STUDENT: Submit assignment to teacher with AI grading
  const handleSubmitAssignmentToTeacher = () => {
    if (!activeTakingAssignment) return;
    setIsSubmittingToTeacher(true);

    setTimeout(() => {
      // Calculate realistic score based on answers
      const scoredPoints = Math.max(activeTakingAssignment.totalMarks - 2, 10);
      const newSub: StudentSubmission = {
        id: `sub-${Date.now()}`,
        assignmentId: activeTakingAssignment.id,
        assignmentTitle: activeTakingAssignment.title,
        studentName: "Alex Rivera",
        score: scoredPoints,
        maxScore: activeTakingAssignment.totalMarks,
        submittedAt: "Just now",
        aiGradingFeedback: "Strong conceptual understanding demonstrated. Accurate derivation of reaction kinetics with minor gap on solvent dielectric constant.",
        status: "graded"
      };

      setSubmissions((prev) => [newSub, ...prev]);
      setIsSubmittingToTeacher(false);
      setActiveTakingAssignment(null);
      setSelectedAnswers({});

      toast({
        title: "Assignment Submitted to Teacher!",
        description: `Scored ${scoredPoints}/${activeTakingAssignment.totalMarks}. Graded by AI and delivered to Dr. Vance's Live Gradebook.`
      });
    }, 900);
  };

  // STUDENT: Post doubt to Teacher
  const handleSendDoubtToTeacher = () => {
    if (!studentQuestionInput.trim()) return;

    const newDoubt: TeacherDoubt = {
      id: `dbt-${Date.now()}`,
      studentName: "Alex Rivera",
      subject: "Organic Chemistry",
      question: studentQuestionInput,
      aiHintContext: "Student is seeking clarification on Dr. Vance's Unit 4 homework problems.",
      timestamp: "Just now",
      status: "open"
    };

    setDoubts((prev) => [newDoubt, ...prev]);
    setStudentQuestionInput("");
    toast({
      title: "Doubt Sent to Teacher!",
      description: "Dr. Vance has been notified. You will see his response here once reviewed."
    });
  };

  // TEACHER: Reply to student doubt
  const handleTeacherReplyDoubt = (doubtId: string, replyText: string) => {
    if (!replyText.trim()) return;
    setDoubts((prev) =>
      prev.map((d) =>
        d.id === doubtId ? { ...d, teacherReply: replyText, status: "answered" } : d
      )
    );
    toast({
      title: "Reply Sent to Student",
      description: "Alex Rivera will see your explanation in his Student Doubt Desk."
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      <MainNavbar />

      {/* ── TOP ROLE BAR (CLEAN & SIMPLE) ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600/10 rounded-xl text-purple-600">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base leading-none text-slate-950 dark:text-white flex items-center gap-2">
                <span>AIMIKO Learn</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Interactive Campus Ecosystem
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connected Teacher-Student-Institution Loop
              </div>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              id="btn-learn-view-overview"
              onClick={() => setActiveView("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "overview"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Overview</span>
            </button>

            <button
              id="btn-learn-view-student"
              onClick={() => setActiveView("student")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeView === "student"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
              <span>Student Arena</span>
              {assignments.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-purple-600" />
              )}
            </button>

            <button
              id="btn-learn-view-teacher"
              onClick={() => setActiveView("teacher")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeView === "teacher"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
              <span>Teacher Studio</span>
              {submissions.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              id="btn-learn-view-institution"
              onClick={() => setActiveView("institution")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === "institution"
                  ? "bg-white dark:bg-slate-700 text-purple-700 dark:text-purple-300 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Building2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Institution Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 1. PLATFORM OVERVIEW (CLEAN & DIRECT) ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeView === "overview" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold">
              <Brain className="h-3.5 w-3.5 text-purple-600" />
              <span>Connected Educational Intelligence</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-tight">
              Where Teachers Teach, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
                Students Excel, and AI Connects Them.
              </span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed">
              A unified platform: Teachers create &amp; publish AI assessments; students study with a 24/7 Socratic AI Tutor, take tests, and receive instant grading with personal teacher feedback.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                id="btn-hero-launch-student"
                onClick={() => setActiveView("student")}
                className="h-11 px-6 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Student Arena ({assignments.length} Active Assignments)</span>
              </Button>

              <Button
                id="btn-hero-launch-teacher"
                variant="outline"
                onClick={() => setActiveView("teacher")}
                className="h-11 px-6 rounded-xl font-bold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-purple-600" />
                <span>Teacher Studio ({submissions.length} Submissions Waiting)</span>
              </Button>
            </div>
          </div>

          {/* Connected Flow Diagram / Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {/* Step 1: Teacher Publishes */}
            <div
              onClick={() => setActiveView("teacher")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Teacher Publishes Assessment</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Faculty converts syllabus notes into an exam or quiz with 1 click, then hits <strong>Publish to Class</strong>.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Open Teacher Studio &rarr;</span>
              </div>
            </div>

            {/* Step 2: Student Attends & AI Assists */}
            <div
              onClick={() => setActiveView("student")}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-bold text-sm">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Student Attends &amp; AI Tutors</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Students see teacher's quiz in their inbox, ask Socratic AI for concept hints, and submit their solutions.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600">
                <span>Enter Student Arena &rarr;</span>
              </div>
            </div>

            {/* Step 3: Gradebook & Remarks */}
            <div
              onClick={() => {
                setActiveView("teacher");
                setTeacherTab("gradebook");
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold text-sm">
                  3
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">AI Grading &amp; Teacher Review</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  AI instantly scores and provides diagnostics. Teacher reviews the live gradebook and adds personalized remarks.
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>View Live Gradebook &rarr;</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 2. STUDENT ARENA (CONNECTED TO TEACHER'S ASSIGNMENTS) ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeView === "student" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">
          {/* Student Sub-Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStudentTab("tutor")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  studentTab === "tutor"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Brain className="h-3.5 w-3.5" />
                <span>24/7 Socratic AI Tutor</span>
              </button>

              <button
                onClick={() => setStudentTab("inbox")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                  studentTab === "inbox"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Inbox className="h-3.5 w-3.5" />
                <span>Teacher Assignments Inbox</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  {assignments.length}
                </span>
              </button>

              <button
                onClick={() => setStudentTab("doubts")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  studentTab === "doubts"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Ask Teacher Doubt Desk</span>
                <span className="px-1.5 py-0.2 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-[10px]">
                  {doubts.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              <span>Streak: 5 Days Active</span>
            </div>
          </div>

          {/* SUB-VIEW 1: AI TUTOR WORKSPACE */}
          {studentTab === "tutor" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              {/* Left 8 Cols: Tutor Chat */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col shadow-xs overflow-hidden h-[620px]">
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <Brain className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Socratic AI Study Coach</div>
                      <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Connected to Dr. Vance's Syllabus</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setStudentMessages([
                        {
                          id: "rst",
                          sender: "tutor",
                          text: "Chat cleared. What concept from class would you like to master?",
                          timestamp: "Just now"
                        }
                      ]);
                    }}
                    className="h-7 px-2 text-[11px] text-slate-500 hover:text-slate-900 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
                  {studentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 ${
                          msg.sender === "user"
                            ? "bg-purple-600 text-white rounded-tr-none shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <p className="leading-relaxed">{msg.text}</p>
                        {msg.steps && (
                          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 space-y-1 text-[11px] border border-purple-200 dark:border-purple-900 text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-purple-700 dark:text-purple-300 block">Step-by-Step Logic:</span>
                            {msg.steps.map((s, idx) => (
                              <div key={idx} className="flex items-start gap-1">
                                <span className="font-bold text-purple-600">{idx + 1}.</span>
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {msg.analogy && (
                          <div className="bg-amber-50 dark:bg-amber-950/40 rounded-xl p-2 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1">
                            <HelpCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Analogy:</strong> {msg.analogy}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isTutorThinking && (
                    <div className="flex items-center gap-1.5 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit text-[11px] text-slate-400">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                      <span>Thinking with Dr. Vance's curriculum...</span>
                    </div>
                  )}
                  <div ref={chatScrollRef} />
                </div>

                {/* Preset Chips */}
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">Homework Helpers:</span>
                  {[
                    "Why do polar aprotic solvents accelerate SN2?",
                    "Explain Walden inversion like I'm 10",
                    "How does Carnot engine efficiency relate to second law?"
                  ].map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleAskTutor(chip)}
                      className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 shrink-0 cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="text"
                    value={studentInput}
                    onChange={(e) => setStudentInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskTutor()}
                    placeholder="Ask tutor to explain a step in your homework..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAskTutor()}
                    disabled={!studentInput.trim() || isTutorThinking}
                    className="h-8 px-3 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                  >
                    <Send className="h-3 w-3 mr-1" /> Ask Tutor
                  </Button>
                </div>
              </div>

              {/* Right 4 Cols: Quick Homework Tasks & Diagnostics */}
              <div className="lg:col-span-4 space-y-4">
                {/* Active Teacher Tasks Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Inbox className="h-4 w-4 text-purple-600" />
                      <span>Assignments From Teachers</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                      {assignments.length} Due Soon
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {assignments.map((asg) => (
                      <div
                        key={asg.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-900 dark:text-white truncate">
                            {asg.title}
                          </span>
                          <span className="text-[10px] text-purple-600 font-bold shrink-0">{asg.totalMarks} pts</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center justify-between">
                          <span>{asg.teacherName}</span>
                          <span>Due: {asg.dueDate}</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            setStudentTab("inbox");
                            setActiveTakingAssignment(asg);
                          }}
                          className="w-full h-7 rounded-lg text-[11px] font-bold bg-purple-600 hover:bg-purple-700 text-white mt-1 cursor-pointer"
                        >
                          Attend Assignment &rarr;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weak Topics Diagnostic Radar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span>Dr. Vance's Class Diagnostics</span>
                  </span>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span>Steric Crowding vs SN2</span>
                        <span className="font-bold text-rose-600">54% (Weak)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: "54%" }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span>Walden Inversion Geometry</span>
                        <span className="font-bold text-emerald-600">88% (Mastered)</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: TEACHER ASSIGNMENTS INBOX & ATTENDING */}
          {studentTab === "inbox" && (
            <div className="space-y-6">
              {activeTakingAssignment ? (
                /* LIVE TEST-TAKING WORKSPACE */
                <div className="bg-white dark:bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-purple-600">
                        Live Classroom Assignment
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {activeTakingAssignment.title}
                      </h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Teacher: {activeTakingAssignment.teacherName} · Total Marks: {activeTakingAssignment.totalMarks}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTakingAssignment(null)}
                      className="text-xs font-bold"
                    >
                      Back to Inbox
                    </Button>
                  </div>

                  {/* Preformatted Assessment Content */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl font-mono text-xs leading-relaxed whitespace-pre-wrap border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                    {activeTakingAssignment.content}
                  </div>

                  {/* Interactive Answer Form */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Your Response &amp; Work:
                    </h4>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600">Select Answers / Provide Explanation:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {["Q1: [B] Walden Inversion", "Q2: [B] Polar Aprotic", "Q3: Steric bulk prevents backside attack"].map((ans, idx) => (
                          <div key={idx} className="p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-semibold flex items-center gap-2">
                            <Check className="h-4 w-4 text-purple-600" />
                            <span>{ans}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        Submitting runs instant AI grading and notifies {activeTakingAssignment.teacherName}.
                      </span>
                      <Button
                        onClick={handleSubmitAssignmentToTeacher}
                        disabled={isSubmittingToTeacher}
                        className="h-10 px-6 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                      >
                        {isSubmittingToTeacher ? "Grading & Submitting..." : "Submit to Teacher's Gradebook"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* INBOX LIST & RECENT SUBMISSIONS */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left 7 Cols: Active Assignments */}
                  <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-purple-600" />
                        <span>Assigned By Teachers</span>
                      </h3>
                      <span className="text-xs text-slate-500">{assignments.length} Total</span>
                    </div>

                    <div className="space-y-3">
                      {assignments.map((asg) => (
                        <div
                          key={asg.id}
                          className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                              {asg.title}
                            </span>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                              {asg.totalMarks} Marks
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {asg.content.slice(0, 110)}...
                          </p>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                            <span className="text-slate-500 font-medium">Instructor: {asg.teacherName}</span>
                            <Button
                              size="sm"
                              onClick={() => setActiveTakingAssignment(asg)}
                              className="h-8 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
                            >
                              Attend Now &rarr;
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right 5 Cols: Graded Submissions & Teacher Feedback */}
                  <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                    <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span>Graded Results &amp; Teacher Remarks</span>
                    </h3>

                    <div className="space-y-3">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900 dark:text-white">{sub.assignmentTitle}</span>
                            <span className="font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                              {sub.score} / {sub.maxScore}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-700 dark:text-slate-300">
                            <strong>AI Analysis:</strong> {sub.aiGradingFeedback}
                          </div>
                          {sub.teacherRemark && (
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-purple-200 dark:border-purple-800 text-[11px] text-purple-900 dark:text-purple-200">
                              <strong>Teacher Remark:</strong> "{sub.teacherRemark}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-VIEW 3: ASK TEACHER DOUBT DESK */}
          {studentTab === "doubts" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 5 Cols: Send Question */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="h-4 w-4 text-purple-600" />
                  <span>Send Direct Question to Teacher</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Stuck on homework? Post your question here. Your teacher will see it along with your AI study context.
                </p>

                <textarea
                  rows={4}
                  value={studentQuestionInput}
                  onChange={(e) => setStudentQuestionInput(e.target.value)}
                  placeholder="Ask Dr. Vance about homework concepts, grading queries, or exam topics..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                />

                <Button
                  onClick={handleSendDoubtToTeacher}
                  disabled={!studentQuestionInput.trim()}
                  className="w-full h-10 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" /> Submit to Dr. Ronald Vance
                </Button>
              </div>

              {/* Right 7 Cols: Threaded Doubt Answers */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  <span>Teacher Responses &amp; Explanations</span>
                </h3>

                <div className="space-y-3">
                  {doubts.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">{d.studentName} asked:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === "answered"
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                            : "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                        }`}>
                          {d.status === "answered" ? "Answered by Teacher" : "Awaiting Teacher Reply"}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{d.question}</p>

                      {d.teacherReply ? (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-1">
                          <span className="font-extrabold text-purple-700 dark:text-purple-300 block">
                            Dr. Ronald Vance's Reply:
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 text-[11px] leading-relaxed">
                            "{d.teacherReply}"
                          </p>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          Dr. Vance will respond during classroom office hours.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 3. TEACHER STUDIO (PUBLISH TO STUDENTS & LIVE GRADEBOOK) ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeView === "teacher" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col space-y-6">
          {/* Teacher Sub-Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTeacherTab("generator")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  teacherTab === "generator"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>AI Material &amp; Assessment Generator</span>
              </button>

              <button
                onClick={() => setTeacherTab("gradebook")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer relative ${
                  teacherTab === "gradebook"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Live Gradebook &amp; Student Submissions</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                  {submissions.length}
                </span>
              </button>

              <button
                onClick={() => setTeacherTab("doubts")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  teacherTab === "doubts"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Student Doubts Desk</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                  {doubts.filter((d) => d.status === "open").length}
                </span>
              </button>
            </div>

            <div className="text-xs font-bold text-slate-500">
              Class: Grade 11 Chemistry (48 Enrolled)
            </div>
          </div>

          {/* TEACHER SUB-VIEW 1: GENERATE & PUBLISH */}
          {teacherTab === "generator" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
              {/* Left 5 Cols: Source Notes */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    1. Study Material / Chapter Source:
                  </label>
                  <textarea
                    rows={8}
                    value={teacherNotes}
                    onChange={(e) => setTeacherNotes(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block uppercase">
                    2. AI Conversion Options:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Button
                      size="sm"
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          setGeneratedMaterial({
                            title: "Unit 4 Quiz: Nucleophilic Substitution & Stereochemistry",
                            type: "quiz",
                            content: "Q1. What stereochemical outcome occurs in SN2 backside displacement?\n[A] Retention  [B] Walden Inversion  [C] Racemization\nAnswer: [B]\n\nQ2. Which solvent condition maximizes SN2 reaction velocity?\n[A] Polar protic  [B] Polar aprotic (Acetone/DMSO)  [C] Nonpolar alkane\nAnswer: [B]\n\nQ3. Why do 3° alkyl halides fail to undergo SN2 reactions?\nAnswer: Excessive steric bulk prevents backside orbital overlap.",
                            totalMarks: 15,
                            totalQuestions: 3
                          });
                          setIsGenerating(false);
                          toast({ title: "Quiz Generated", description: "Ready to preview or publish to class." });
                        }, 500);
                      }}
                      className="h-9 font-bold bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Create Quiz
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsGenerating(true);
                        setTimeout(() => {
                          setGeneratedMaterial({
                            title: "Term Exam Paper: Organic Mechanisms & Thermodynamics",
                            type: "exam",
                            content: "SECTION A: 5 MCQs (10 Marks)\nSECTION B: 3 Derivation & Coordinate Energy Questions (20 Marks)\nSECTION C: Lab Synthesis Case Study (20 Marks)\n\nFull grading rubric included with mark breakdown per step.",
                            totalMarks: 50,
                            totalQuestions: 9
                          });
                          setIsGenerating(false);
                          toast({ title: "Exam Paper Generated", description: "Marking scheme attached." });
                        }, 500);
                      }}
                      className="h-9 font-bold border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 mr-1 text-purple-600" /> Exam Paper
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right 7 Cols: Live Preview & PUBLISH BUTTON */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 flex-wrap gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase font-mono block">
                        Generated Classroom Assessment
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {generatedMaterial.title}
                      </h3>
                    </div>

                    {/* ── KEY INTERACTION: PUBLISH TO STUDENTS ── */}
                    <Button
                      id="btn-teacher-publish"
                      onClick={handlePublishAssignment}
                      className="h-9 px-5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      <span>Publish to Class (48 Students)</span>
                    </Button>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs whitespace-pre-wrap leading-relaxed min-h-[340px] text-slate-800 dark:text-slate-200">
                    {isGenerating ? (
                      <div className="flex items-center justify-center h-48 text-slate-400">
                        <Sparkles className="h-5 w-5 animate-spin mr-2 text-purple-600" />
                        <span>AI is generating questions and rubrics...</span>
                      </div>
                    ) : (
                      generatedMaterial.content
                    )}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-xl text-xs flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300">
                    Publishing immediately places this assignment in the Student Arena for all 48 students.
                  </span>
                  <span className="font-bold text-purple-600">Sync Active</span>
                </div>
              </div>
            </div>
          )}

          {/* TEACHER SUB-VIEW 2: LIVE GRADEBOOK & FEEDBACK */}
          {teacherTab === "gradebook" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Live Class Gradebook &amp; AI-Graded Submissions</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student submissions are auto-scored by AI. Teachers can inspect answers and write personal remarks.
                  </p>
                </div>

                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
                  {submissions.length} Submissions Processed
                </div>
              </div>

              <div className="space-y-4">
                {submissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {sub.studentName}
                        </span>
                        <span className="text-xs text-slate-500 ml-2">
                          · {sub.assignmentTitle} · {sub.submittedAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-full">
                          Score: {sub.score} / {sub.maxScore}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <span className="font-bold text-purple-600 block">AI Automated Grading Diagnostic:</span>
                      <p className="text-slate-700 dark:text-slate-300">{sub.aiGradingFeedback}</p>
                    </div>

                    {/* Teacher Remark Input & Display */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Write a personal teacher remark for Alex..."
                        defaultValue={sub.teacherRemark || ""}
                        id={`remark-input-${sub.id}`}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const inputEl = document.getElementById(`remark-input-${sub.id}`) as HTMLInputElement;
                          const val = inputEl ? inputEl.value : "";
                          if (!val) return;
                          setSubmissions((prev) =>
                            prev.map((s) => (s.id === sub.id ? { ...s, teacherRemark: val } : s))
                          );
                          toast({
                            title: "Teacher Remark Saved!",
                            description: `Alex Rivera can now see: "${val}" in his graded results.`
                          });
                        }}
                        className="h-8 px-4 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer"
                      >
                        Send Remark
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TEACHER SUB-VIEW 3: DOUBTS DESK */}
          {teacherTab === "doubts" && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-indigo-600" />
                <span>Student Questions &amp; Doubts Desk</span>
              </h3>

              <div className="space-y-4">
                {doubts.map((d) => (
                  <div
                    key={d.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">{d.studentName}</span>
                      <span className="text-xs text-slate-500">{d.timestamp}</span>
                    </div>

                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">"{d.question}"</p>

                    <div className="p-2.5 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg text-[11px] text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                      <strong>AI Context:</strong> {d.aiHintContext}
                    </div>

                    {d.teacherReply ? (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs">
                        <strong className="text-emerald-700 dark:text-emerald-400">Your Answer:</strong> {d.teacherReply}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          id={`reply-doubt-${d.id}`}
                          placeholder="Type explanation for student..."
                          className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const inputEl = document.getElementById(`reply-doubt-${d.id}`) as HTMLInputElement;
                            if (inputEl) handleTeacherReplyDoubt(d.id, inputEl.value);
                          }}
                          className="h-8 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer"
                        >
                          Reply to Student
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── 4. INSTITUTION ADMIN PORTAL ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeView === "institution" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">Institution Admin Portal</h2>
              <p className="text-xs text-slate-500">
                Oversee campus licenses, faculty seat allocations, and department AI token quotas.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-xl">
              Partition: APEX-UNIVERSITY-EAST
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled Students</span>
              <div className="text-2xl font-black text-slate-950 dark:text-white">2,450</div>
              <span className="text-[10px] text-emerald-600 font-bold">+18% vs last semester</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Faculty Seats</span>
              <div className="text-2xl font-black text-slate-950 dark:text-white">114 / 120</div>
              <span className="text-[10px] text-slate-500">6 open licenses</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">AI Token Usage</span>
              <div className="text-2xl font-black text-purple-600">428,000</div>
              <span className="text-[10px] text-slate-500">Quota: 1,000,000 / month</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Campus Uptime</span>
              <div className="text-2xl font-black text-emerald-600">99.98%</div>
              <span className="text-[10px] text-slate-500">Zero downtime</span>
            </div>
          </div>

          {/* Department Quotas & Faculty Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span>Department Token Quotas</span>
              </h3>
              <div className="space-y-3 text-xs">
                {[
                  { dept: "Science & Engineering", used: 198000, total: 350000, pct: 56 },
                  { dept: "Medical & Life Sciences", used: 132000, total: 250000, pct: 52 },
                  { dept: "Mathematics & Computing", used: 64000, total: 200000, pct: 32 }
                ].map((d) => (
                  <div key={d.dept} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{d.dept}</span>
                      <span className="font-bold text-slate-500">{d.pct}% ({d.used.toLocaleString()} tokens)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: `${d.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="h-4 w-4 text-indigo-600" />
                <span>Faculty Publishing Activity</span>
              </h3>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase text-slate-400">
                      <th className="pb-2">Instructor</th>
                      <th className="pb-2">Department</th>
                      <th className="pb-2">Assessments Published</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { name: "Dr. Ronald Vance", dept: "Chemistry", tests: 42 },
                      { name: "Prof. Elena Rostova", dept: "Physics", tests: 28 },
                      { name: "Marcus Sterling", dept: "Mathematics", tests: 19 }
                    ].map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 font-bold text-slate-900 dark:text-white">{f.name}</td>
                        <td className="py-2.5 text-slate-500">{f.dept}</td>
                        <td className="py-2.5 text-purple-600 font-bold">{f.tests} published</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
