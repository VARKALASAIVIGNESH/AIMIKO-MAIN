import { useState, useEffect } from "react";
import { useAimiko } from "@/context/AimikoContext";
import { generateAIResponse } from "@/lib/ai";
import { StudentAiSidekick } from "./StudentAiSidekick";
import {
  Brain,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  BarChart2,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FlashcardSM2 {
  id: string;
  front: string;
  back: string;
  repetition: number;
  intervalDays: number;
  easeFactor: number;
  dueDate: string; // ISO date string
  lastReviewed?: string;
}

interface Deck {
  id: string;
  title: string;
  subject: string;
  cards: FlashcardSM2[];
}

const defaultDecks: Deck[] = [
  {
    id: "deck-1",
    title: "Organic Chemistry Reactions",
    subject: "Chemistry",
    cards: [
      {
        id: "c-1",
        front: "What is an SN2 reaction mechanism?",
        back: "A single-step (bimolecular) nucleophilic substitution where the nucleophile attacks from the backside simultaneously as the leaving group departs, leading to inversion of stereochemistry.",
        repetition: 2,
        intervalDays: 4,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      },
      {
        id: "c-2",
        front: "State Markovnikov's Rule.",
        back: "In addition reactions of HX to an asymmetrical alkene, the hydrogen atom attaches to the carbon with the greater number of hydrogen substituents ('the rich get richer').",
        repetition: 1,
        intervalDays: 1,
        easeFactor: 2.4,
        dueDate: new Date().toISOString()
      },
      {
        id: "c-3",
        front: "What reagent converts an alcohol into an alkyl chloride with inversion?",
        back: "Thionyl chloride (SOCl2) with pyridine.",
        repetition: 3,
        intervalDays: 7,
        easeFactor: 2.6,
        dueDate: new Date().toISOString()
      }
    ]
  },
  {
    id: "deck-2",
    title: "AP Physics Laws & Constants",
    subject: "Physics",
    cards: [
      {
        id: "p-1",
        front: "What is the formula for Kinetic Energy?",
        back: "KE = 1/2 * m * v²",
        repetition: 1,
        intervalDays: 2,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      },
      {
        id: "p-2",
        front: "State Coulomb's Law for electrostatic force.",
        back: "F = k * (|q1 * q2|) / r², where k ≈ 8.99 × 10⁹ N·m²/C²",
        repetition: 2,
        intervalDays: 6,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      }
    ]
  }
];

export function SpacedRepetitionStudio() {
  const { ageGroup, role, incrementPromptUsage, addBadge } = useAimiko();
  const { toast } = useToast();

  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem("aimiko_anki_decks");
    return saved ? JSON.parse(saved) : defaultDecks;
  });

  const [activeDeckId, setActiveDeckId] = useState<string>(decks[0]?.id || "deck-1");
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isCreatingDeck, setIsCreatingDeck] = useState<boolean>(false);
  const [newDeckTopic, setNewDeckTopic] = useState<string>("");
  const [isGeneratingDeck, setIsGeneratingDeck] = useState<boolean>(false);
  const [sessionReviewedCount, setSessionReviewedCount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem("aimiko_anki_decks", JSON.stringify(decks));
  }, [decks]);

  const activeDeck = decks.find((d) => d.id === activeDeckId) || decks[0];
  const activeCards = activeDeck?.cards || [];
  const currentCard = activeCards[currentCardIndex] || activeCards[0];

  // SuperMemo SM-2 Recall Calculation
  const handleRateRecall = (grade: 1 | 2 | 3 | 4) => {
    if (!currentCard) return;

    let { repetition, intervalDays, easeFactor } = currentCard;

    // SuperMemo SM-2 algorithm:
    // Grade: 1 = Again (reset), 2 = Hard, 3 = Good, 4 = Easy
    if (grade === 1) {
      repetition = 0;
      intervalDays = 1;
    } else {
      if (repetition === 0) {
        intervalDays = 1;
      } else if (repetition === 1) {
        intervalDays = grade === 2 ? 2 : grade === 3 ? 4 : 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * (grade === 4 ? 1.3 : grade === 2 ? 0.85 : 1.0));
      }
      repetition += 1;
    }

    // Update ease factor (SM-2 standard delta)
    const q = grade + 1; // map 1-4 to 2-5
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

    // Next review date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const updatedCard: FlashcardSM2 = {
      ...currentCard,
      repetition,
      intervalDays,
      easeFactor: Number(easeFactor.toFixed(2)),
      dueDate: nextDate.toISOString(),
      lastReviewed: new Date().toISOString()
    };

    setDecks((prev) =>
      prev.map((d) => {
        if (d.id === activeDeckId) {
          return {
            ...d,
            cards: d.cards.map((c) => (c.id === currentCard.id ? updatedCard : c))
          };
        }
        return d;
      })
    );

    setIsFlipped(false);
    setSessionReviewedCount((prev) => prev + 1);

    if (sessionReviewedCount + 1 >= 5) {
      addBadge("Memory Champion");
    }

    // Move to next card
    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      toast({ description: "All cards reviewed for this study session." });
      setCurrentCardIndex(0);
    }
  };

  const handleCreateDeckWithAI = async () => {
    if (!newDeckTopic.trim()) return;

    if (!incrementPromptUsage()) {
      toast({ description: "Daily AI limit reached. Upgrade for unlimited decks.", variant: "destructive" });
      return;
    }

    setIsGeneratingDeck(true);

    try {
      const prompt = `Generate a high-retention spaced repetition flashcard deck on the subject: "${newDeckTopic}".
Return ONLY a valid JSON array of 5 objects matching this exact structure:
[
  {
    "front": "Clear question / term",
    "back": "Concise, high-yield answer / definition"
  }
]
Do not include markdown or extra commentary. Return pure JSON array only.`;

      const response = await generateAIResponse(
        prompt,
        ageGroup,
        role,
        [],
        "You are a flashcard curriculum author. Return valid JSON only."
      );

      const cleaned = response.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const newDeck: Deck = {
          id: `deck-${Date.now()}`,
          title: newDeckTopic,
          subject: "Custom Study",
          cards: parsed.map((item, i) => ({
            id: `card-${Date.now()}-${i}`,
            front: item.front,
            back: item.back,
            repetition: 0,
            intervalDays: 1,
            easeFactor: 2.5,
            dueDate: new Date().toISOString()
          }))
        };

        setDecks((prev) => [newDeck, ...prev]);
        setActiveDeckId(newDeck.id);
        setCurrentCardIndex(0);
        setIsCreatingDeck(false);
        setNewDeckTopic("");
        toast({ description: `Created new deck "${newDeckTopic}" with ${parsed.length} cards.` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ description: "Failed to generate deck. Please try again.", variant: "destructive" });
    } finally {
      setIsGeneratingDeck(false);
    }
  };

  const [sidekickOpen, setSidekickOpen] = useState(false);
  const masteredCount = activeCards.filter((c) => c.intervalDays >= 5).length;
  const masteryPercentage = activeCards.length > 0 ? Math.round((masteredCount / activeCards.length) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      
      {/* ─── Header & Deck Selector ─── */}
      <div className="bg-card border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Adaptive Spaced Repetition (Anki/SM-2)</h1>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  SM-2 Algorithm
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Optimizes recall intervals (1d, 4d, 7d+) based on the scientific Ebbinghaus forgetting curve.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={() => setIsCreatingDeck(!isCreatingDeck)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create AI Deck
            </Button>
            <Button
              onClick={() => setSidekickOpen(!sidekickOpen)}
              size="sm"
              className="rounded-xl text-xs font-semibold"
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Ask AI Tutor
            </Button>
          </div>
        </div>

        {/* Deck Creator Drawer (if open) */}
        {isCreatingDeck && (
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 space-y-3 animate-slide-up">
            <h4 className="text-xs font-bold text-foreground">Create New Deck with AI</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newDeckTopic}
                onChange={(e) => setNewDeckTopic(e.target.value)}
                placeholder="e.g. World War II Key Battles, Calculus Derivatives, Spanish Verbs..."
                onKeyDown={(e) => e.key === "Enter" && handleCreateDeckWithAI()}
                className="flex-1 rounded-xl bg-background border border-border/70 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                onClick={handleCreateDeckWithAI}
                disabled={isGeneratingDeck || !newDeckTopic.trim()}
                size="sm"
                className="rounded-xl text-xs"
              >
                {isGeneratingDeck ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                Generate Deck
              </Button>
            </div>
          </div>
        )}

        {/* Deck Switcher Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium">Active Decks:</span>
          {decks.map((deck) => (
            <button
              key={deck.id}
              onClick={() => {
                setActiveDeckId(deck.id);
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                activeDeckId === deck.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-secondary/60 hover:bg-secondary border-border/60 text-foreground"
              }`}
            >
              {deck.title} ({deck.cards.length})
            </button>
          ))}
        </div>
      </div>

      {/* ─── Retention Stats Banner ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Deck Size</p>
          <p className="text-xl font-bold text-foreground mt-1">{activeCards.length} Cards</p>
        </div>
        <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Cards Reviewed</p>
          <p className="text-xl font-bold text-primary mt-1">{sessionReviewedCount} Done</p>
        </div>
        <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Current Interval</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">{currentCard?.intervalDays || 1} Days</p>
        </div>
        <div className="bg-card border border-border/70 rounded-2xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Mastery Score</p>
          <p className="text-xl font-bold text-violet-600 mt-1">{masteryPercentage}%</p>
        </div>
      </div>

      {/* ─── Interactive 3D Flip Flashcard ─── */}
      {currentCard ? (
        <div className="bg-card border border-border/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs flex flex-col items-center justify-center">
          
          <div className="w-full flex justify-between items-center text-xs font-semibold text-muted-foreground">
            <span>Card {currentCardIndex + 1} of {activeCards.length}</span>
            <span className="flex items-center gap-1 text-primary">
              <Clock className="h-3.5 w-3.5" /> Next interval: {currentCard.intervalDays}d
            </span>
          </div>

          {/* Flashcard Area */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full max-w-xl min-h-[260px] rounded-3xl border-2 border-border hover:border-primary/40 bg-secondary/30 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest bg-card px-3 py-1 rounded-full border border-border">
              {isFlipped ? "Answer (Back)" : "Question / Term (Front)"}
            </span>

            <div className="my-auto py-4">
              <h3 className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                {isFlipped ? currentCard.back : currentCard.front}
              </h3>
            </div>

            <p className="text-[11px] text-muted-foreground">
              {isFlipped ? "Tap to see question again" : "Tap card to flip & reveal answer"}
            </p>
          </div>

          {/* SuperMemo Recall Rating Buttons (Only shown when flipped) */}
          {isFlipped ? (
            <div className="w-full max-w-xl space-y-2 animate-slide-up">
              <p className="text-[11px] uppercase font-bold text-muted-foreground text-center tracking-wider">
                Rate your recall difficulty:
              </p>
              
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleRateRecall(1)}
                  className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 font-bold text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Again</span>
                  <span className="text-[10px] font-normal text-red-500">1 Day</span>
                </button>
                <button
                  onClick={() => handleRateRecall(2)}
                  className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 font-bold text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Hard</span>
                  <span className="text-[10px] font-normal text-amber-500">2 Days</span>
                </button>
                <button
                  onClick={() => handleRateRecall(3)}
                  className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-600 font-bold text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Good</span>
                  <span className="text-[10px] font-normal text-blue-500">4 Days</span>
                </button>
                <button
                  onClick={() => handleRateRecall(4)}
                  className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 font-bold text-xs flex flex-col items-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Easy</span>
                  <span className="text-[10px] font-normal text-emerald-500">7 Days</span>
                </button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setIsFlipped(true)}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs px-6"
            >
              Reveal Answer
            </Button>
          )}

        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground">
          <p>No cards in this deck yet. Click "Create AI Deck" to generate one!</p>
        </div>
      )}

      {/* Integrated AI Assistant */}
      <StudentAiSidekick
        toolName="Adaptive Spaced Repetition"
        contextData={`Deck: ${activeDeck.title}. Card: ${currentCard?.front} -> ${currentCard?.back}`}
        placeholder="Ask AI tutor for a memory mnemonic or analogy for this card..."
      />

    </div>
  );
}
