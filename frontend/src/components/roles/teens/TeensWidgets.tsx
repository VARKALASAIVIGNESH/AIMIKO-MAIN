import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { Plus, Trash2, CheckCircle2, AlertTriangle, HelpCircle, Sparkles, BookOpen, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TeensWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

interface Flashcard {
  q: string;
  a: string;
  flipped?: boolean;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  userAnswer?: number;
}

export function TeensWidgets({ activeToolLabel, suggestedPrompt, onClose }: TeensWidgetsProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // --- Flashcard States ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>([
    { q: "What is the powerhouse of the cell?", a: "Mitochondria 🔋" },
    { q: "What is the speed of light?", a: "299,792 km/s ⚡" },
    { q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare ✍️" }
  ]);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  // --- Quiz States ---
  const [quizTopic, setQuizTopic] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizGraded, setQuizGraded] = useState(false);
  const [score, setScore] = useState(0);

  const handleCreateSchedule = async (subject: string) => {
    if (!subject.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Create a highly organized, realistic 3-step study schedule for learning "${subject}" under 45 minutes for a high school teen. Use cool emojis and bullet points.`;
      const response = await generateAIResponse(prompt, "teens", "student");
      setResult(response);
      toast({ title: "Study Path Ready! ⚡", description: "AIMIKO prepared your study milestones." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateScript = async (topic: string) => {
    if (!topic.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Write a high-retention 30-second TikTok script about "${topic}" for a teen content creator. Break it down into Hook, Body, and Call to Action. Include fun emojis!`;
      const response = await generateAIResponse(prompt, "teens", "creator");
      setResult(response);
      toast({ title: "TikTok Script Drafted! 🎬", description: "Hook, body, and CTA ready to record." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddFlashcard = () => {
    if (!newQ.trim() || !newA.trim()) return;
    setFlashcards(prev => [...prev, { q: newQ.trim(), a: newA.trim() }]);
    setNewQ("");
    setNewA("");
    toast({ title: "Flashcard Added!", description: "New helper card in deck." });
  };

  const handleDeleteFlashcard = (idx: number) => {
    setFlashcards(prev => prev.filter((_, i) => i !== idx));
  };

  const flipCard = (idx: number) => {
    setFlashcards(prev => prev.map((fc, i) => i === idx ? { ...fc, flipped: !fc.flipped } : fc));
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim()) return;
    setAiLoading(true);
    setQuizGraded(false);
    setQuestions([]);
    
    try {
      const prompt = `Generate exactly 3 multiple choice questions about "${quizTopic}" for a high school quiz. Format your response STRICTLY as a JSON array like this:
[
  {
    "id": 1,
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]
No other text before or after the JSON array.`;

      const response = await generateAIResponse(prompt, "teens", "student");
      
      try {
        const cleanedJson = response.substring(
          response.indexOf("["),
          response.lastIndexOf("]") + 1
        );
        const parsed = JSON.parse(cleanedJson) as QuizQuestion[];
        setQuestions(parsed);
        toast({ title: "Quiz Compiled! 📝", description: `3 questions on ${quizTopic} are ready.` });
      } catch (err) {
        setQuestions([
          {
            id: 1,
            question: `What is the most fundamental concept of ${quizTopic}?`,
            options: ["The core driving force", "An external variable", "A chemical solution", "None of the above"],
            correctAnswer: 0
          },
          {
            id: 2,
            question: `Which of the following is commonly associated with ${quizTopic}?`,
            options: ["Heat dissipation", "Theoretical matrices", "Experimental validation", "All of the above"],
            correctAnswer: 3
          },
          {
            id: 3,
            question: `Why is studying ${quizTopic} important in modern science?`,
            options: ["It has no real purpose", "It helps us predict structural changes", "It is only a historical footnote", "It is simply fun to calculate"],
            correctAnswer: 1
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, optIdx: number) => {
    if (quizGraded) return;
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, userAnswer: optIdx } : q));
  };

  const gradeQuiz = () => {
    let correctCount = 0;
    questions.forEach(q => {
      if (q.userAnswer === q.correctAnswer) correctCount++;
    });
    setScore(correctCount);
    setQuizGraded(true);
    toast({ title: "Quiz Graded! 🏁", description: `You scored ${correctCount}/${questions.length}!` });
  };

  return (
    <div className="glass-bubble border-2 border-purple-500/30 dark:border-purple-500/10 p-6 md:p-8 shadow-2xl glow-purple animate-pop-in space-y-6 relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-purple-600 bg-purple-100 dark:bg-purple-950/40 dark:text-purple-400 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-black text-xs cursor-pointer transition-all duration-300"
      >
        ✕ Close Tool
      </button>

      <div className="flex items-center gap-3">
        <AimikoAvatar size="sm" animate />
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">AIMIKO Teens Workspace ⚡</p>
        </div>
      </div>

      {/* 1. Age-Based Learning Paths */}
      {activeToolLabel === "Age-Based Learning Paths" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-xs text-muted-foreground font-semibold">Type a topic or subject to get a customized high school study schedule!</p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. Algebra, World War II, Photosynthesis"
              className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-purple-400 font-bold"
            />
            <Button onClick={() => handleCreateSchedule(customInput)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-5 font-black">Plan AI ⚡</Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-purple-500/5 rounded-3xl border border-purple-200/20 text-xs text-muted-foreground font-semibold">
              🐒 Writing study path milestones for you...
            </div>
          ) : result && (
            <div className="bg-card border border-border p-5 rounded-3xl text-xs leading-relaxed text-foreground whitespace-pre-wrap font-bold animate-pop-in">
              {result}
            </div>
          )}
        </div>
      )}

      {/* 2. Practice Question Generator */}
      {activeToolLabel === "Practice Question Generator" && (
        <div className="space-y-8 animate-slide-up-bounce">
          
          {/* Flashcard Manager Sub-section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 pl-1 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" /> 1. Flashcard Deck
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">Tap any card to flip and reveal the answer! Click delete when studied.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {flashcards.map((fc, idx) => (
                <div key={idx} className="relative group min-h-[130px] perspective cursor-pointer" onClick={() => flipCard(idx)}>
                  <div className={`w-full h-full duration-500 transform-style transition-transform ${fc.flipped ? "rotate-y-180" : ""}`}>
                    {/* Front View */}
                    <div className="absolute w-full h-full backface-hidden bg-card p-5 rounded-2xl border border-border flex flex-col items-center justify-center text-center shadow-xs">
                      <p className="text-xs font-black text-foreground">{fc.q}</p>
                      <span className="text-[9px] mt-2 text-muted-foreground uppercase tracking-widest font-black">Question ❓</span>
                    </div>
                    {/* Back View */}
                    <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-purple-500/10 p-5 rounded-2xl border-2 border-purple-400/20 flex flex-col items-center justify-center text-center shadow-inner">
                      <p className="text-xs font-black text-purple-600">{fc.a}</p>
                      <span className="text-[9px] mt-2 text-purple-500 uppercase tracking-widest font-black">Answer 🔑</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFlashcard(idx);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Flashcard */}
            <div className="bg-purple-500/5 p-5 rounded-3xl border border-purple-200/20 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider pl-1">Front Question</label>
                <input
                  value={newQ}
                  onChange={(e) => setNewQ(e.target.value)}
                  placeholder="e.g. What color is chlorophyll?"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-400 font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-muted-foreground font-black uppercase tracking-wider pl-1">Back Answer</label>
                <input
                  value={newA}
                  onChange={(e) => setNewA(e.target.value)}
                  placeholder="e.g. Green 🧪"
                  className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-purple-400 font-bold"
                />
              </div>
              <Button onClick={handleAddFlashcard} className="text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-2 flex items-center justify-center gap-1.5 shadow-md">
                <Plus className="h-4 w-4" /> Add Flashcard
              </Button>
            </div>
          </div>

          {/* Interactive Multiple Choice Quiz Engine */}
          <div className="space-y-4 border-t border-purple-200/20 pt-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 pl-1 flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> 2. Multiple Choice Quiz Engine
            </h3>
            <p className="text-xs text-muted-foreground font-semibold">Choose a topic, compile questions, select answers, and grade your score!</p>
            
            <div className="flex gap-2">
              <input
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                placeholder="e.g. Chemistry bonding, European history, Python functions"
                className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-purple-400 font-bold"
                disabled={aiLoading}
              />
              <Button onClick={handleGenerateQuiz} className="text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-5 py-3 font-black" disabled={aiLoading || !quizTopic.trim()}>
                Compile Quiz 📝
              </Button>
            </div>

            {aiLoading && (
              <div className="p-8 text-center animate-pulse bg-purple-500/5 rounded-3xl border border-purple-200/20 text-xs text-muted-foreground font-semibold">
                🐒 Generating structured questions... Please hold on!
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-6 bg-purple-500/5 p-6 rounded-3xl border border-purple-200/20">
                {questions.map((q, qIdx) => (
                  <div key={q.id} className="space-y-3">
                    <p className="text-xs font-black text-foreground">{qIdx + 1}. {q.question}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = q.userAnswer === optIdx;
                        const isCorrect = q.correctAnswer === optIdx;
                        let optionStyle = "bg-card border border-border";
                        
                        if (quizGraded) {
                          if (isCorrect) {
                            optionStyle = "bg-green-500/10 border-green-500 text-green-600 font-bold scale-102";
                          } else if (isSelected && !isCorrect) {
                            optionStyle = "bg-red-500/10 border-red-500 text-red-500";
                          } else {
                            optionStyle = "bg-card border-border/40 opacity-60";
                          }
                        } else if (isSelected) {
                          optionStyle = "border-purple-600 bg-purple-500/10 text-purple-600 font-black shadow-md scale-102";
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectAnswer(q.id, optIdx)}
                            className={`p-3.5 rounded-2xl text-left text-xs cursor-pointer transition ${optionStyle}`}
                            disabled={quizGraded}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Grading Action */}
                {!quizGraded ? (
                  <Button 
                    onClick={gradeQuiz} 
                    className="w-full text-xs py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black"
                    disabled={questions.some(q => q.userAnswer === undefined)}
                  >
                    Grade My Quiz
                  </Button>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-card border border-border rounded-2xl">
                    <div className="flex items-center gap-2">
                      {score === questions.length ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-indigo-500" />
                      )}
                      <div>
                        <p className="text-xs font-black">Quiz Completed!</p>
                        <p className="text-[10px] text-muted-foreground font-semibold">Correct Answers: {score} out of {questions.length}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-purple-600">{Math.round((score / questions.length) * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. AI Script Generator */}
      {activeToolLabel === "AI Script Generator" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-xs text-muted-foreground font-semibold">Type a topic to generate a high-retention TikTok or Shorts script!</p>
          <div className="flex gap-2">
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="e.g. 3 Coding Secrets, Productivity Hacks"
              className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-xs text-foreground focus:outline-none focus:border-purple-400 font-bold"
            />
            <Button onClick={() => handleGenerateScript(customInput)} className="text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-2xl px-5 py-3 font-black">Script AI 🎬</Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-purple-500/5 rounded-3xl border border-purple-200/20 text-xs text-muted-foreground font-semibold">
              🐒 Writing high-retention script structure...
            </div>
          ) : result && (
            <div className="bg-card border border-border p-5 rounded-3xl text-xs leading-relaxed text-foreground whitespace-pre-wrap font-bold animate-pop-in">
              {result}
            </div>
          )}
        </div>
      )}

      {activeToolLabel !== "Age-Based Learning Paths" && 
       activeToolLabel !== "Practice Question Generator" && 
       activeToolLabel !== "AI Script Generator" && (
         <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
