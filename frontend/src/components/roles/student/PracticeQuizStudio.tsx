import { useState } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RefreshCw,
  Trophy,
  Loader2,
  ArrowRight,
  BookOpen,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

const defaultQuiz: QuizQuestion[] = [
  {
    question: "Which organelle is known as the 'powerhouse of the cell' for generating ATP through cellular respiration?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
    answerIndex: 1,
    explanation: "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions via ATP synthesis."
  },
  {
    question: "What is the primary function of chlorophyll in plant cells?",
    options: [
      "Absorb light energy for photosynthesis",
      "Store water in vacuoles",
      "Break down carbohydrates during digestion",
      "Transport glucose to the root systems"
    ],
    answerIndex: 0,
    explanation: "Chlorophyll is a green pigment that absorbs light energy (primarily blue and red wavelengths) to drive the reactions of photosynthesis."
  },
  {
    question: "In Newtonian physics, which law states that 'For every action, there is an equal and opposite reaction'?",
    options: [
      "Newton's First Law (Inertia)",
      "Newton's Second Law (F = ma)",
      "Newton's Third Law",
      "Law of Universal Gravitation"
    ],
    answerIndex: 2,
    explanation: "Newton's Third Law states that forces always occur in matched action-reaction pairs between two interacting bodies."
  }
];

export function PracticeQuizStudio() {
  const { ageGroup, role, incrementPromptUsage, addBadge } = useAimiko();
  const { toast } = useToast();
  const [topic, setTopic] = useState("Cell Biology & Basic Physics");
  const [topicInput, setTopicInput] = useState("");
  const [questionCount, setQuestionCount] = useState(3);
  const [questions, setQuestions] = useState<QuizQuestion[]>(defaultQuiz);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidekickOpen, setSidekickOpen] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === currentQ.answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score + (selectedOption === currentQ.answerIndex ? 1 : 0) >= Math.ceil(questions.length * 0.7)) {
        addBadge("Quiz Master");
      }
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  const handleGenerateQuiz = async (customTopic?: string) => {
    const targetTopic = (customTopic || topicInput || topic).trim();
    if (!targetTopic) return;

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI limit reached. Upgrade to Pro for unlimited quizzes!", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setTopic(targetTopic);

    try {
      const prompt = `Generate a ${questionCount}-question multiple choice quiz on the topic: "${targetTopic}".
Return ONLY a valid JSON array of objects matching this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Brief explanation of why this answer is correct."
  }
]
Do not wrap in markdown or extra text. Return pure JSON array only.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are a test preparation coach. Return valid JSON quiz data only."
      );

      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        setQuestions(parsed);
        handleRestart();
        setTopicInput("");
        toast({ description: `Generated ${parsed.length}-question quiz on "${targetTopic}"!` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ description: "Failed to generate custom quiz. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const scorePercentage = Math.round((score / questions.length) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      
      {/* ─── Header & Quiz Topic Controls ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Practice Quiz Studio</h1>
              <p className="text-xs text-muted-foreground">Active recall test with instant feedback and step-by-step explanations.</p>
            </div>
          </div>

          <Button
            onClick={() => setSidekickOpen(!sidekickOpen)}
            size="sm"
            className="rounded-xl text-xs font-semibold"
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
          </Button>
        </div>

        {/* Generator input */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            placeholder={`Current: "${topic}" — Enter any topic for a new quiz...`}
            onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()}
            className="flex-1 rounded-2xl bg-secondary/60 border border-border/70 px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />

          <div className="flex gap-2">
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="rounded-2xl bg-secondary/60 border border-border/70 px-3 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>

            <Button
              onClick={() => handleGenerateQuiz()}
              disabled={isGenerating}
              className="rounded-2xl text-xs font-semibold px-4 shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start New Quiz
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] text-muted-foreground font-medium">Quick Topics:</span>
          {["Basic Algebra & Quadratics", "Photosynthesis", "World War II", "JavaScript Promises"].map((preset) => (
            <button
              key={preset}
              onClick={() => handleGenerateQuiz(preset)}
              className="px-2.5 py-1 rounded-lg bg-secondary/50 hover:bg-secondary border border-border/60 text-[11px] font-medium text-foreground transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Interactive Quiz View ─── */}
      {!isFinished ? (
        <div className="bg-card border border-border/70 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
          
          {/* Question Indicator & Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-primary font-bold">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-muted-foreground">
                Score: {score} / {currentIndex + (isAnswered ? 1 : 0)}
              </span>
            </div>
            
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="pt-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground leading-snug">
              {currentQ.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.answerIndex;
              
              let styleClass = "bg-secondary/50 border-border/70 hover:border-primary/40 text-foreground";
              if (isAnswered) {
                if (isCorrect) {
                  styleClass = "bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold";
                } else if (isSelected && !isCorrect) {
                  styleClass = "bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300 font-semibold";
                } else {
                  styleClass = "bg-secondary/30 border-border/40 text-muted-foreground opacity-60";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all ${styleClass}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-card border border-border/80 flex items-center justify-center font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>

                  {isAnswered && isCorrect && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isCorrect && (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Answer Explanation & Next Button */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-secondary/70 border border-border/70 space-y-3 animate-slide-up">
              <div className="flex items-start gap-2">
                <div className="p-1 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Explanation</h4>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="rounded-xl text-xs font-bold px-4"
                >
                  {currentIndex < questions.length - 1 ? (
                    <>
                      Next Question <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </>
                  ) : (
                    <>
                      View Final Score <Trophy className="ml-1 h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ─── Final Score Summary ─── */
        <div className="bg-card border border-border/70 rounded-3xl p-8 text-center space-y-6 shadow-xs animate-pop-in">
          <div className="h-16 w-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
            <Trophy className="h-8 w-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-foreground">Quiz Completed!</h2>
            <p className="text-xs text-muted-foreground">Topic: {topic}</p>
          </div>

          <div className="max-w-xs mx-auto p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <p className="text-3xl font-black text-primary">{score} / {questions.length}</p>
            <p className="text-xs font-semibold text-muted-foreground mt-1">
              Score: {scorePercentage}% {scorePercentage >= 80 ? "— Excellent Mastery!" : "— Good Effort!"}
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Button
              onClick={handleRestart}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Retake Quiz
            </Button>
            <Button
              onClick={() => handleGenerateQuiz()}
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate New Quiz
            </Button>
          </div>
        </div>
      )}

      {/* Integrated AI Assistant */}
      <StudentAiSidekick
        toolName="Practice Quiz Studio"
        contextData={`Active quiz on "${topic}". Current question: "${currentQ?.question}". Answer: "${currentQ?.options[currentQ?.answerIndex]}"`}
        placeholder="Ask why this option is correct or ask for a hint..."
        isOpen={sidekickOpen}
        onClose={() => setSidekickOpen(false)}
      />

    </div>
  );
}
