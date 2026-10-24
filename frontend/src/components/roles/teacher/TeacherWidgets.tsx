import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { Plus, Trash2, BookOpen, Clock, FileSpreadsheet, Sparkles } from "lucide-react";

interface TeacherWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

interface WorksheetQuestion {
  question: string;
  answer: string;
}

export function TeacherWidgets({ activeToolLabel, suggestedPrompt, onClose }: TeacherWidgetsProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [grade, setGrade] = useState("4th Grade");
  const [duration, setDuration] = useState("50 minutes");
  const [lessonPlan, setLessonPlan] = useState<string | null>(null);

  // --- Worksheet States ---
  const [worksheetTopic, setWorksheetTopic] = useState("Math Division");
  const [worksheetQuestions, setWorksheetQuestions] = useState<WorksheetQuestion[]>([
    { question: "12 ÷ 3 = ?", answer: "4" },
    { question: "36 ÷ 6 = ?", answer: "6" },
    { question: "81 ÷ 9 = ?", answer: "9" },
    { question: "100 ÷ 10 = ?", answer: "10" }
  ]);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  const handleGenerateLessonPlan = async () => {
    if (!topic.trim()) return;
    setAiLoading(true);
    setLessonPlan(null);
    try {
      const prompt = `Create a detailed ${duration} lesson plan teaching "${topic}" under subject "${subject}" for ${grade} students. 
Include:
1. Lesson Objective (2 sentences)
2. Materials Needed
3. Activity Breakdown (e.g. Warm-up 10m, Guided practice 20m, Exit ticket 10m)
Use standard markdown bullet points.`;
      
      const response = await generateAIResponse(prompt, "adults", "teacher");
      setLessonPlan(response);
    } catch (e) {
      console.error(e);
      setLessonPlan("Failed to generate a custom lesson plan. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!newQ.trim() || !newA.trim()) return;
    setWorksheetQuestions(prev => [...prev, { question: newQ.trim(), answer: newA.trim() }]);
    setNewQ("");
    setNewA("");
  };

  const handleDeleteQuestion = (idx: number) => {
    setWorksheetQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="glass-bubble relative space-y-8 animate-pop-in border-border/60 shadow-2xl max-w-full overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-xs font-semibold px-4 py-2 rounded-full cursor-pointer transition-all duration-200 bg-secondary hover:bg-muted border border-border text-foreground shadow-sm hover-bounce"
      >
        ✕ Close Tool
      </button>

      <div className="flex items-center gap-3 border-b border-border pb-4">
        <AimikoAvatar size="sm" />
        <div>
          <h2 className="text-lg font-display font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">AIMIKO Educator Suite 🎓</p>
        </div>
      </div>

      {/* 1. Lesson Plan Generator */}
      {activeToolLabel === "Lesson Plan Generator" && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">Specify the subject details below to compile a modular, time-blocked curriculum lesson plan.</p>
          
          <div className="grid md:grid-cols-2 gap-4 bg-muted p-5 rounded-2xl border border-border shadow-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Subject Area</label>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Science, Mathematics, English"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Lesson Topic</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Laws of gravity, Fractions, Prepositions"
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all shadow-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none cursor-pointer transition shadow-xs"
              >
                <option value="Kindergarten">Kindergarten</option>
                <option value="2nd Grade">2nd Grade</option>
                <option value="4th Grade">4th Grade</option>
                <option value="Middle School">Middle School</option>
                <option value="High School">High School</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none cursor-pointer transition shadow-xs"
              >
                <option value="30 minutes">30 minutes</option>
                <option value="45 minutes">45 minutes</option>
                <option value="50 minutes">50 minutes</option>
                <option value="90 minutes">90 minutes</option>
              </select>
            </div>
          </div>

          <Button onClick={handleGenerateLessonPlan} className="w-full text-xs rounded-xl py-3 flex items-center justify-center gap-2 hover-bounce font-bold shadow-md" disabled={aiLoading || !topic.trim()}>
            <Sparkles className="h-4 w-4" /> Create Lesson Plan ⚡
          </Button>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-card/30 rounded-2xl border border-border/40 text-xs text-muted-foreground font-medium">
              🐒 Writing objectives and calculating activity time splits...
            </div>
          ) : lessonPlan && (
            <div className="bg-card/40 p-6 rounded-2xl border border-border/60 shadow-md text-xs leading-relaxed text-foreground whitespace-pre-wrap font-medium animate-slide-up-bounce">
              {lessonPlan}
            </div>
          )}
        </div>
      )}

      {/* 2. Quiz & Task Builder (Scaffolding Student Worksheets) */}
      {activeToolLabel === "Quiz & Task Builder" && (
        <div className="space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">Create study questions, build worksheets, and add keys for class assignments.</p>
          
          <div className="space-y-4 bg-muted/50 p-5 rounded-2xl border border-border shadow-sm">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <FileSpreadsheet className="h-4 w-4 text-primary animate-bounce-slow" /> Worksheet Questions List
            </span>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {worksheetQuestions.map((q, idx) => (
                <div key={idx} className="flex justify-between items-center group bg-card border border-border/40 p-3.5 rounded-xl text-xs font-medium hover:scale-[1.01] transition-all shadow-xs animate-pop-in">
                  <span className="font-mono text-foreground/90">{q.question}</span>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded text-[10px] font-bold">Key: {q.answer}</span>
                    <button 
                      onClick={() => handleDeleteQuestion(idx)} 
                      className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Custom Question */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-4 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Question / Problem</label>
                <input
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                  placeholder="e.g. 8 x 7 = ?"
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-xs"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">Correct Answer</label>
                <input
                  value={newA}
                  onChange={(e) => setNewA(e.target.value)}
                  placeholder="e.g. 56"
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition shadow-xs"
                />
              </div>
              <Button onClick={handleAddQuestion} className="text-xs rounded-xl py-2.5 flex items-center justify-center gap-1.5 hover-bounce font-bold shadow-md">
                <Plus className="h-4 w-4" /> Add Problem
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeToolLabel !== "Lesson Plan Generator" && 
       activeToolLabel !== "Quiz & Task Builder" && (
         <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
