import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { generateAIResponse } from "@/lib/ai";
import mascotAvatar from "@/assets/aimiko-avatar.png";
import {
  BookOpen,
  Sparkles,
  Brain,
  Check,
  FileText,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Star,
  Award,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  FileSpreadsheet,
  X,
  Play,
  Square,
  Wand2,
  Plus,
  Trash2,
  Flame,
  Activity,
  Lightbulb,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAimiko } from "@/context/AimikoContext";
import { useNavigate } from "react-router-dom";

interface SchoolBuddyProps {
  activeToolLabel: string;
  onClose: () => void;
}

interface SocraticStepData {
  title: string;
  steps: string[];
}

interface MagicWord {
  word: string;
  definition: string;
  flipped?: boolean;
}

interface PodcastLine {
  character: "AIMIKO" | "KIKO";
  text: string;
}

interface CustomQuizQuestion {
  q: string;
  options: string[];
  correct: number;
  fact: string;
}

export function SchoolBuddy({ activeToolLabel, onClose }: SchoolBuddyProps) {
  const { toast } = useToast();
  const { incrementPromptUsage, billingTier } = useAimiko();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(activeToolLabel);
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Confetti particles for completions
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  // TTS Speech Synthesis States
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceActiveText, setVoiceActiveText] = useState("");
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // NotebookLM Source Grounding State
  const [studySource, setStudySource] = useState<string>(() => {
    return localStorage.getItem("aimiko_kids_study_source") || "";
  });
  const [isSourceDockOpen, setIsSourceDockOpen] = useState(false);

  // Hydrate tab selection when prop changes
  useEffect(() => {
    setActiveTab(activeToolLabel);
  }, [activeToolLabel]);

  // Save study source to local storage
  const handleSaveSource = (val: string) => {
    setStudySource(val);
    localStorage.setItem("aimiko_kids_study_source", val);
  };

  // Dual-Character Voice TTS Synthesizer
  const speakText = (
    text: string,
    voiceType: "aimiko" | "kiko" | "narrator" = "narrator",
    onEndCallback?: () => void
  ) => {
    if (!("speechSynthesis" in window)) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support voice synthesis.",
      });
      return;
    }

    window.speechSynthesis.cancel(); // cancel current speech
    setVoiceActiveText(text);

    const cleanText = text
      .replace(/AIMIKO:/i, "")
      .replace(/KIKO:/i, "")
      .replace(/[\*\#\`\-\_]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtteranceRef.current = utterance;

    // Dual voice settings
    if (voiceType === "aimiko") {
      utterance.pitch = 1.35; // high pitch cute robot monkey
      utterance.rate = 1.1;
    } else if (voiceType === "kiko") {
      utterance.pitch = 0.95; // curious student monkey
      utterance.rate = 0.95;
    } else {
      utterance.pitch = 1.1; // generic narrator
      utterance.rate = 1.0;
    }

    utterance.onstart = () => {
      setIsPlayingVoice(true);
    };

    utterance.onend = () => {
      setIsPlayingVoice(false);
      setVoiceActiveText("");
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = () => {
      setIsPlayingVoice(false);
      setVoiceActiveText("");
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlayingVoice(false);
    setVoiceActiveText("");
  };

  // --- Socratic Helper States ---
  const [socraticQuestionIndex, setSocraticQuestionIndex] = useState<number | null>(null);
  const [socraticStep, setSocraticStep] = useState(0);
  const [socraticWhy, setSocraticWhy] = useState<string | null>(null);
  const [kidsSocraticQuestions, setKidsSocraticQuestions] = useState<SocraticStepData[]>([
    {
      title: "Why does it rain? 🌧️",
      steps: [
        "☀️ The warm sun shines on oceans, lakes, and puddles and turns the water into invisible warm vapor!",
        "💨 This invisible steam floats high up into the sky where it meets very cold air.",
        "☁️ The cold steam bundles together to form thick fluffy clouds, and when they get too heavy, they drop rain! 🌧️"
      ]
    },
    {
      title: "How do magnets pull? 🧲",
      steps: [
        "🧲 Magnets create an invisible force-field around them called a magnetic field.",
        "✨ Inside metals like iron, tiny parts align like soldiers pointing the exact same way.",
        "🔗 Opposite ends (North and South) attract each other and stick together with a snap! ⚡"
      ]
    }
  ]);

  // --- Magic Glossary States ---
  const [magicWords, setMagicWords] = useState<MagicWord[]>([
    { word: "Evaporation ☀️", definition: "When warm sun cooks liquid water until it turns into invisible vapor steam floating upwards!" },
    { word: "Force-field 🧲", definition: "An invisible energy shield surrounding magnets that pulls metal objects closer without even touching them!" },
    { word: "Photosynthesis 🌿", definition: "How green leaves cook delicious sugary plant-cookies using fresh air, soil water, and golden sunlight!" }
  ]);

  // --- Explain Like I'm 10 States ---
  const [kidsConcepts, setKidsConcepts] = useState<Record<string, { analogy: string; drawPrompt: string }>>({
    "The Internet 🌐": {
      analogy: "Imagine a flock of super-fast delivery birds carrying letters across the globe in less than a second! When you watch a video, the birds fly to a giant library, grab the video pictures, and bring them back to your screen instantly.",
      drawPrompt: "Draw a cute carrier pigeon wearing a high-tech pilot helmet carrying a letter in its beak!"
    },
    "Bacteria 🦠": {
      analogy: "Imagine tiny invisible helpers and little monsters! Some bacteria are friendly workers that help your tummy digest apples and milk, while others are naughty dust bunnies that make you sneeze.",
      drawPrompt: "Draw a happy tiny green bacterium waving hello with a little toolbelt!"
    }
  });
  const [flippedConcept, setFlippedConcept] = useState<Record<string, boolean>>({});

  // --- Book Summarizer States ---
  const [summarizerBookIndex, setSummarizerBookIndex] = useState<number | null>(null);
  const [summarizerSlide, setSummarizerSlide] = useState(0);
  const [customStoryCharacter, setCustomStoryCharacter] = useState("KIKO the Puppy");
  const [customStorySetting, setCustomStorySetting] = useState("the Moon");
  const [kidsBooksSummaries, setKidsBooksSummaries] = useState([
    {
      title: "The Lion and the Mouse 🐭",
      slides: [
        "A mighty Lion caught a tiny Mouse, but decided to let him go kindly. The Mouse promised, 'One day, I will help you!'",
        "Later, hunters caught the Lion in a strong rope net! He roared loudly, feeling scared and trapped.",
        "The tiny Mouse heard him, ran over, and chewed through the ropes with his sharp teeth, setting the Lion free! 🦁",
        "🌟 Moral: Little friends can be great helpers! Kindness is never wasted!"
      ]
    },
    {
      title: "The Tortoise and the Hare 🐢",
      slides: [
        "A speedy Hare made fun of a slow Tortoise and challenged him to a race, feeling 100% sure he would win.",
        "During the race, the Hare got so far ahead that he decided to take a comfortable nap under a tree.",
        "The slow Tortoise never stopped walking, step-by-step, slowly and steadily passing the sleeping Hare.",
        "🌟 Moral: Slow and steady wins the race! Never give up, no matter how slow you are!"
      ]
    }
  ]);

  // --- Dynamic AI Quiz States ---
  const [quizTopic, setQuizTopic] = useState("Science");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activeBadge, setActiveBadge] = useState<string | null>(null);
  const [kidsQuizQuestions, setKidsQuizQuestions] = useState<CustomQuizQuestion[]>([
    {
      q: "Which animal is known as the King of the Jungle? 🦁",
      options: ["Giraffe 🦒", "Lion 🦁", "Elephant 🐘"],
      correct: 1,
      fact: "Lions live in grasslands and plains, and are super strong hunters!"
    },
    {
      q: "Which of these is the largest animal in the ocean? 🐳",
      options: ["Blue Whale 🐳", "Shark 🦈", "Dolphin 🐬"],
      correct: 0,
      fact: "The Blue Whale is the biggest animal ever on Earth—even bigger than dinosaurs!"
    }
  ]);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>(() => {
    const stored = localStorage.getItem("aimiko_kids_badges");
    return stored ? JSON.parse(stored) : ["Junior Explorer 🌟"];
  });

  // --- Monkey Radio States ---
  const [podcastTopic, setPodcastTopic] = useState("How plants drink water");
  const [podcastScript, setPodcastScript] = useState<PodcastLine[]>([
    { character: "AIMIKO", text: "Welcome to Monkey Radio! 📻 I am your host, AIMIKO, the robo-monkey!" },
    { character: "KIKO", text: "And I am KIKO! Today we are learning how plants drink water! Is it through a straw? 🥤" },
    { character: "AIMIKO", text: "Haha, close! Plant roots act like tiny drinking sponges in the soil, soaking up water and climbing it up the stem!" },
    { character: "KIKO", text: "Wow! So tree stems are like giant water elevators! 🌳 Elevators up!" }
  ]);
  const [activePodcastLineIndex, setActivePodcastLineIndex] = useState<number | null>(null);
  const [isPodcastPlaying, setIsPodcastPlaying] = useState(false);

  // Trigger confetti particle effect
  const triggerConfettiEffect = () => {
    const colors = ["bg-pink-500", "bg-purple-500", "bg-yellow-500", "bg-emerald-500", "bg-orange-500", "bg-cyan-500"];
    const particles = Array.from({ length: 45 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 4000);
  };

  // Quota utility
  const checkPromptLimit = (): boolean => {
    if (!incrementPromptUsage()) {
      if (confirm("You have reached your daily limit of 5 free prompts. Upgrade to Premium for 100 daily prompts?")) {
        navigate("/upgrade");
      }
      return false;
    }
    return true;
  };

  // --- AI ACTIONS ---

  // 1. Socratic Helper Solver (Real-time AI)
  const handleAISocraticSolve = async (query: string) => {
    if (!query.trim()) return;
    if (!checkPromptLimit()) return;

    setAiLoading(true);
    setSocraticWhy(null);
    try {
      const prompt = `Explain "${query}" step-by-step for a 7 year old child. Break it down into EXACTLY 3 simple, fun steps. ${
        studySource ? `Strictly ground your steps using details from this school material: "${studySource}"` : ""
      } Format your answer as exactly 3 numbered steps starting with "1.", "2.", and "3.", each with relevant emojis, separated by newlines. Do not write any other introductory or concluding text.`;

      const response = await generateAIResponse(prompt, "kids", "student");

      const parsedSteps = response
        .split(/\n+/)
        .map(line => line.replace(/^\d+[\.\s]+/, "").trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      const newQuestion = {
        title: query,
        steps: parsedSteps.length >= 3 ? parsedSteps : [
          "✨ " + response.substring(0, 100),
          "✨ " + response.substring(100, 200),
          "✨ " + response.substring(200, 350)
        ]
      };

      setKidsSocraticQuestions(prev => [...prev, newQuestion]);
      setSocraticQuestionIndex(kidsSocraticQuestions.length);
      setSocraticStep(0);
      setCustomInput("");
      triggerConfettiEffect();
      
      // Auto-extract Magic Glossary terms
      handleAIGlossaryExtract(query);

      toast({ title: "Socratic Steps Ready! 🌧️", description: "Learn how it works step-by-step!" });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Socratic Step Deep-dive "But Why?"
  const handleAISocraticWhy = async (stepText: string) => {
    if (!checkPromptLimit()) return;
    setAiLoading(true);
    try {
      const prompt = `Explain in one simple, enthusiastic sentence with emojis why this step is true or how it works for a 7-year-old child: "${stepText}". ${
        studySource ? `Ground context in this notes source: "${studySource}"` : ""
      } Keep it extremely fun and easy to understand.`;
      
      const response = await generateAIResponse(prompt, "kids", "student");
      setSocraticWhy(response);
      speakText(response, "aimiko");
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Magic Glossary Terms Extractor
  const handleAIGlossaryExtract = async (topic: string) => {
    try {
      const prompt = `Extract exactly 3 key words or scientific concepts from this topic: "${topic}". ${
        studySource ? `Based on this note: "${studySource}"` : ""
      } For each word, provide a simple 1-sentence kid-friendly definition with emojis. Format your answer exactly as:
[TERM 1]: Word1
[DEF 1]: Definition1
[TERM 2]: Word2
[DEF 2]: Definition2
[TERM 3]: Word3
[DEF 3]: Definition3`;

      const response = await generateAIResponse(prompt, "kids", "student");
      
      const regex = /\[TERM \d\]:\s*(.*?)\n\[DEF \d\]:\s*(.*)/gi;
      const terms: MagicWord[] = [];
      let match;
      while ((match = regex.exec(response)) !== null) {
        if (match[1] && match[2]) {
          terms.push({ word: match[1].trim(), definition: match[2].trim() });
        }
      }

      if (terms.length >= 3) {
        setMagicWords(terms);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 2. Explain Like I'm 10 (Analogy Maker)
  const handleAIExplainLikeIm10 = async (query: string) => {
    if (!query.trim()) return;
    if (!checkPromptLimit()) return;

    setAiLoading(true);
    try {
      const prompt = `Explain "${query}" like I am 10 years old using a single-paragraph super fun analogy. Keep it under 3 sentences and speak cheerful kid-friendly language with emojis. ${
        studySource ? `Use this notes context: "${studySource}"` : ""
      }`;
      const drawPrompt = `Generate a single visual drawing prompt for kids based on this concept: "${query}". Format as: "Draw [action/item] with emojis!". Keep it under 10 words.`;

      const [analogyResponse, drawResponse] = await Promise.all([
        generateAIResponse(prompt, "kids", "student"),
        generateAIResponse(drawPrompt, "kids", "student")
      ]);

      setKidsConcepts(prev => ({
        ...prev,
        [query]: {
          analogy: analogyResponse.trim(),
          drawPrompt: drawResponse.replace(/Drawing prompt:/i, "").replace(/"/g, "").trim()
        }
      }));
      setCustomInput("");
      triggerConfettiEffect();
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // 3. Book summaries (Custom story creator)
  const handleAIBookSummarizer = async (query: string) => {
    if (!query.trim()) return;
    if (!checkPromptLimit()) return;

    setAiLoading(true);
    try {
      const prompt = `Write a personalized children's adventure story based on "${query}" starring "${customStoryCharacter}" in a setting of "${customStorySetting}". ${
        studySource ? `Ground it in this school notes note: "${studySource}"` : ""
      } Format the response as EXACTLY 4 paragraphs. Do not add any titles, introduction, or page numbers. Separate each of the 4 paragraphs with a double newline. Make it very cheerful and include plenty of emojis. After the 4 paragraphs, write a 5th paragraph that starts with "🌟 Moral: [lesson]".`;

      const response = await generateAIResponse(prompt, "kids", "student");
      const paragraphs = response.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);

      const newBook = {
        title: query,
        slides: paragraphs.length >= 4 ? paragraphs : [
          "Once upon a time, " + customStoryCharacter + " went on a trip to " + customStorySetting + "! 🚀",
          "They looked around and found interesting lessons to learn.",
          "Suddenly, they unlocked a magical secret code!",
          "🌟 Moral: Be curious and keep exploring your universe!"
        ]
      };

      setKidsBooksSummaries(prev => [...prev, newBook]);
      setSummarizerBookIndex(kidsBooksSummaries.length);
      setSummarizerSlide(0);
      setCustomInput("");
      triggerConfettiEffect();
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // 4. Dynamic AI Quiz Engine (Perplexity/NotebookLM style)
  const handleGenerateAIQuiz = async (topic: string) => {
    if (!topic.trim()) return;
    if (!checkPromptLimit()) return;

    setAiLoading(true);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setActiveBadge(null);

    try {
      const prompt = `Generate exactly 3 fun multiple-choice trivia questions about "${topic}" for a 7-year-old child. ${
        studySource ? `Make the questions test details from this notes note: "${studySource}"` : ""
      } Format your response STRICTLY as a JSON array like this:
[
  {
    "q": "Question text with emoji",
    "options": ["Option 1", "Option 2", "Option 3"],
    "correct": 0,
    "fact": "Did you know fun fact with emoji"
  }
]
Do not write any introductory or concluding explanation text outside the JSON array.`;

      const response = await generateAIResponse(prompt, "kids", "student");
      
      const jsonStart = response.indexOf("[");
      const jsonEnd = response.lastIndexOf("]") + 1;
      const cleanedJson = response.substring(jsonStart, jsonEnd);
      const parsed = JSON.parse(cleanedJson) as CustomQuizQuestion[];

      if (parsed.length >= 2) {
        setKidsQuizQuestions(parsed);
        toast({ title: "Custom Quiz Ready! 🎮", description: `Quiz compiled on "${topic}".` });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Compilation Error", description: "AI is a bit sleepy, loading default animal quiz!" });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectQuizAnswer = (idx: number) => {
    setSelectedOption(idx);
  };

  const submitQuizAnswer = () => {
    setIsAnswered(true);
    if (selectedOption === kidsQuizQuestions[quizIndex].correct) {
      setQuizScore(s => s + 1);
      triggerConfettiEffect();
    }
  };

  const handleNextQuizQuestion = () => {
    if (quizIndex + 1 < kidsQuizQuestions.length) {
      setQuizIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished! Determine Badge
      let badgeName = "Smart Learner 🧠";
      if (quizScore === kidsQuizQuestions.length) {
        if (quizTopic.toLowerCase().includes("space") || quizTopic.toLowerCase().includes("moon") || quizTopic.toLowerCase().includes("star")) {
          badgeName = "Space Cadet 🚀";
        } else if (quizTopic.toLowerCase().includes("dino") || quizTopic.toLowerCase().includes("fossil")) {
          badgeName = "Dino Master 🦖";
        } else if (quizTopic.toLowerCase().includes("sea") || quizTopic.toLowerCase().includes("ocean") || quizTopic.toLowerCase().includes("whale")) {
          badgeName = "Deep Sea Scout 🐙";
        } else if (studySource) {
          badgeName = "Notebook Champion 🏆";
        } else {
          badgeName = "Super Monkey Brain 🐒👑";
        }
      }
      
      setActiveBadge(badgeName);
      if (!unlockedBadges.includes(badgeName)) {
        const updated = [...unlockedBadges, badgeName];
        setUnlockedBadges(updated);
        localStorage.setItem("aimiko_kids_badges", JSON.stringify(updated));
      }
      setQuizIndex(kidsQuizQuestions.length); // go to results screen
    }
  };

  // 5. Monkey Radio Podcast Script Generator
  const handleCreateRadioShow = async () => {
    if (!podcastTopic.trim()) return;
    if (!checkPromptLimit()) return;

    setAiLoading(true);
    setIsPodcastPlaying(false);
    setActivePodcastLineIndex(null);
    stopSpeaking();

    try {
      const prompt = `Write a short, funny podcast script dialogue between AIMIKO (a smart, helpful robot monkey) and KIKO (a goofy, energetic student monkey) explaining "${podcastTopic}" to a 7-year-old child. ${
        studySource ? `Use context from this school note: "${studySource}"` : ""
      } Format your response exactly as 4 turns of dialogue starting with "AIMIKO:" or "KIKO:". Keep each turn to 1-2 simple sentences with emojis. Do not write any other introductory or concluding text.`;

      const response = await generateAIResponse(prompt, "kids", "student");
      const lines = response.split("\n").map(l => l.trim()).filter(l => l.length > 0);
      
      const parsedDialog = lines.map(line => {
        if (line.startsWith("AIMIKO:")) {
          return { character: "AIMIKO" as const, text: line.replace(/^AIMIKO:\s*/i, "") };
        } else if (line.startsWith("KIKO:")) {
          return { character: "KIKO" as const, text: line.replace(/^KIKO:\s*/i, "") };
        }
        return null;
      }).filter(Boolean) as PodcastLine[];

      if (parsedDialog.length >= 3) {
        setPodcastScript(parsedDialog);
        triggerConfettiEffect();
        toast({ title: "Radio Broadcast Ready! 📻", description: "Click Tune In to listen." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Sequenced Podcast Playback Voice Engine
  const playPodcastLine = (index: number) => {
    if (index >= podcastScript.length) {
      setIsPodcastPlaying(false);
      setActivePodcastLineIndex(null);
      triggerConfettiEffect();
      toast({ title: "Show Completed! 📻", description: "Thanks for listening to Monkey Radio!" });
      return;
    }

    setActivePodcastLineIndex(index);
    const line = podcastScript[index];
    const characterType = line.character === "AIMIKO" ? "aimiko" : "kiko";

    speakText(line.text, characterType, () => {
      // callback onEnd
      playPodcastLine(index + 1);
    });
  };

  const handleTuneInPodcast = () => {
    if (isPodcastPlaying) {
      stopSpeaking();
      setIsPodcastPlaying(false);
      setActivePodcastLineIndex(null);
    } else {
      setIsPodcastPlaying(true);
      playPodcastLine(0);
    }
  };

  // Flip cards
  const toggleFlipCard = (concept: string) => {
    setFlippedConcept(prev => ({ ...prev, [concept]: !prev[concept] }));
  };

  const tabs = [
    { id: "School Buddy Socratic Helper", label: "🌧️ Socratic Helper" },
    { id: "AIMIKO Monkey Radio", label: "📻 Monkey Radio" },
    { id: "Explain Like I'm 10", label: "🧠 Concept Analogies" },
    { id: "Book & Story Summarizer", label: "📚 Book Summaries" },
    { id: "Fun Practice Quizzes", label: "🎮 Trivia Quizzes" }
  ];

  return (
    <div className="relative overflow-hidden glass-bubble border-2 border-pink-400/30 dark:border-pink-500/10 p-6 md:p-8 shadow-2xl glow-pink animate-pop-in space-y-6">
      
      {/* Confetti Animation Layer */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className={`absolute top-0 w-3 h-7 rounded-full ${particle.color} animate-confetti pointer-events-none z-50`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}

      {/* Header Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-pink-200/40 pb-6">
        
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-pink-100 dark:bg-pink-950/40 flex items-center justify-center border border-pink-300/30 shadow-md animate-float shrink-0">
            <BookOpen className="h-8 w-8 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">School Buddy Hub</h2>
            <p className="text-xs text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1.5 mt-1">
              <Sparkles className="h-4 w-4 text-pink-500 animate-wiggle" /> Your AI Study Companion — Turning notes into audio, analogies & quizzes
            </p>
          </div>
        </div>

        {/* Right Side: Tab Buttons & Close Workspace Action */}
        <div className="flex flex-wrap items-center gap-3 lg:justify-end">
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-2 bg-pink-500/5 dark:bg-pink-950/15 p-2 rounded-3xl border border-pink-200/30 shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  stopSpeaking();
                  setActiveTab(tab.id);
                  setCustomInput("");
                  setSocraticQuestionIndex(null);
                  setSummarizerBookIndex(null);
                  setSocraticWhy(null);
                }}
                className={`text-xs font-black px-4 py-2 rounded-2xl transition-all duration-150 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-pink-600 text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-pink-500/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Close Workspace Button */}
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="text-pink-600 bg-pink-100 hover:bg-pink-200 dark:bg-pink-950/40 dark:text-pink-400 hover:scale-105 active:scale-95 px-4.5 py-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all duration-300 shadow-sm border border-pink-200/40"
          >
            ✕ Close Workspace
          </button>
        </div>

      </div>

      {/* NotebookLM Source Grounding Dock */}
      <div className="bg-card/65 border border-border rounded-xl p-4 space-y-3 shadow-md relative">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSourceDockOpen(!isSourceDockOpen)}
            className="flex items-center gap-2 text-sm font-bold text-pink-500 hover:text-pink-400 cursor-pointer"
          >
            <FileSpreadsheet className="h-4.5 w-4.5 text-pink-500 animate-pulse" />
            <span>🎒 Source Grounding Dock {studySource ? "🟢 Active" : "(Empty)"}</span>
          </button>
          {studySource && (
            <span className="text-xs text-green-500 font-bold flex items-center gap-1">
              ✓ Grounded on {studySource.split(/\s+/).length} words
            </span>
          )}
        </div>
        
        {isSourceDockOpen && (
          <div className="space-y-2 pt-2 border-t border-border/60 animate-slide-up-bounce">
            <p className="text-xs text-muted-foreground font-semibold">
              Paste school worksheets or study materials below. AIMIKO will restrict Socratic explanations, analogies, summaries, and quizzes to match your syllabus text!
            </p>
            <div className="relative">
              <textarea
                value={studySource}
                onChange={(e) => handleSaveSource(e.target.value)}
                placeholder="e.g. Photosynthesis happens in green leaves. Sunlight is absorbed by chlorophyll. Plant roots absorb soil minerals and water..."
                className="w-full min-h-[90px] bg-background/70 border border-border rounded-xl p-3 text-sm text-foreground focus:outline-none focus:border-pink-500 font-bold resize-none custom-scrollbar"
              />
              {studySource && (
                <button
                  onClick={() => handleSaveSource("")}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-500/15 rounded-full cursor-pointer transition"
                  title="Clear source notes"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 1. SOCRATIC HELPER WIDGET */}
      {activeTab === "School Buddy Socratic Helper" && (
        <div className="space-y-6 animate-slide-up-bounce">
          {aiLoading ? (
            <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-xl border border-pink-200/30 p-8 shadow-inner animate-pulse">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
              <h3 className="font-black text-lg text-foreground">AIMIKO is creating step-by-step models for you...</h3>
              <p className="text-sm text-muted-foreground">Drawing slides and compiling pictures!</p>
            </div>
          ) : socraticQuestionIndex === null ? (
            <div className="space-y-6">
              
              {/* Mascot Intro */}
              <div className="flex items-start gap-4 bg-pink-500/5 p-5 rounded-xl border border-pink-200/20">
                <div className="relative p-1.5 bg-white/90 dark:bg-black/40 rounded-full border-2 border-pink-300/30 shadow-md flex items-center justify-center h-20 w-20 shrink-0">
                  <img src={mascotAvatar} alt="Mascot" className="h-16 w-16 object-contain animate-bounce-slow" />
                </div>
                <div className="bg-card p-5 rounded-xl border border-pink-200/30 shadow-xs relative flex-1">
                  <div className="absolute top-6 -left-2.5 h-3 w-3 bg-card border-l border-b border-pink-200/30 rotate-45 hidden sm:block" />
                  <p className="text-sm font-black text-foreground leading-relaxed">
                    Hi! I'm your Socratic Buddy! Choose a question below, and we can explore how nature, science, and the world works page-by-page! 🌧️🧲
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">Choose a Question:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kidsSocraticQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSocraticQuestionIndex(idx);
                        setSocraticStep(0);
                        setSocraticWhy(null);
                      }}
                      className="p-5 bg-card/70 hover:bg-pink-500/10 text-sm text-left font-black text-foreground rounded-xl border-2 border-pink-200/20 shadow-xs hover-lift transition cursor-pointer flex justify-between items-center"
                    >
                      <span>💡 {q.title}</span>
                      <ArrowRight className="h-4 w-4 text-pink-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Socratic Solver Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAISocraticSolve(customInput);
                }}
                className="pt-4 border-t border-pink-200/20 space-y-3"
              >
                <p className="text-sm font-black text-muted-foreground tracking-widest uppercase">Or ask your own school question:</p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. Why is the sky blue? How do bees make honey?"
                    className="flex-1 bg-background border-2 border-pink-200/20 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-pink-400 transition-all font-bold"
                    required
                  />
                  <Button type="submit" className="text-sm rounded-xl px-6 py-3 font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-md">
                    <Brain className="h-4 w-4" /> Outline Steps
                  </Button>
                </div>
              </form>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Illustrated double-page style slide */}
              <div className="bg-card rounded-xl border-2 border-pink-200/25 shadow-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 min-h-[220px]">
                
                {/* Left Page (Mascot & Details) */}
                <div className="bg-pink-500/5 p-6 border-r border-dashed border-pink-200/35 flex flex-col items-center justify-center text-center gap-3">
                  <div className="relative p-1.5 bg-white/90 dark:bg-black/40 rounded-full border-2 border-pink-300/30 shadow-md flex items-center justify-center h-20 w-20 shrink-0">
                    <img src={mascotAvatar} alt="Mascot" className="h-16 w-16 object-contain animate-bounce-slow" />
                  </div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{kidsSocraticQuestions[socraticQuestionIndex].title}</h4>
                  <span className="text-xs bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 px-3 py-1.5 rounded-xl font-black">
                    Step {socraticStep + 1} of {kidsSocraticQuestions[socraticQuestionIndex].steps.length}
                  </span>
                  
                  {/* TTS Speaker Toggle */}
                  <button
                    onClick={() => {
                      if (isPlayingVoice && voiceActiveText === kidsSocraticQuestions[socraticQuestionIndex].steps[socraticStep]) {
                        stopSpeaking();
                      } else {
                        speakText(kidsSocraticQuestions[socraticQuestionIndex].steps[socraticStep], "narrator");
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-bold px-3 py-2 bg-card border border-pink-200/20 rounded-xl cursor-pointer transition shadow-xs mt-1"
                  >
                    {isPlayingVoice && voiceActiveText === kidsSocraticQuestions[socraticQuestionIndex].steps[socraticStep] ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" /> Listen
                      </>
                    )}
                  </button>
                </div>
                
                {/* Right Page (Socratic Content) */}
                <div className="p-6 flex flex-col justify-center bg-card/30 space-y-4">
                  <p className="text-sm sm:text-base leading-relaxed text-foreground font-bold italic text-center whitespace-pre-wrap animate-slide-up-bounce">
                    {kidsSocraticQuestions[socraticQuestionIndex].steps[socraticStep]}
                  </p>
                  
                  {/* But Why Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => handleAISocraticWhy(kidsSocraticQuestions[socraticQuestionIndex].steps[socraticStep])}
                      className="text-xs bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-500 font-bold px-4.5 py-2 rounded-xl cursor-pointer transition"
                    >
                      But Why? 🧐
                    </button>
                  </div>
                </div>

              </div>

              {/* Clarification Chat Bubble if triggered */}
              {socraticWhy && (
                <div className="bg-indigo-500/5 border border-indigo-500/25 rounded-xl p-4 animate-pop-in space-y-2">
                  <span className="text-xs uppercase font-black text-indigo-500 tracking-wider">AIMIKO explains further:</span>
                  <p className="text-sm font-semibold text-foreground">{socraticWhy}</p>
                </div>
              )}

              {/* Progress step bar */}
              <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-600 transition-all duration-300"
                  style={{ width: `${((socraticStep + 1) / kidsSocraticQuestions[socraticQuestionIndex].steps.length) * 100}%` }}
                />
              </div>

              {/* Navigation Controls */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled={socraticStep === 0}
                  onClick={() => {
                    setSocraticStep(s => s - 1);
                    setSocraticWhy(null);
                    stopSpeaking();
                  }}
                  className="rounded-xl flex-1 text-sm py-3.5 border-pink-200 bg-card hover:bg-pink-500/10 text-foreground font-black cursor-pointer"
                >
                  ⬅️ Back
                </Button>
                {socraticStep < kidsSocraticQuestions[socraticQuestionIndex].steps.length - 1 ? (
                  <Button
                    onClick={() => {
                      setSocraticStep(s => s + 1);
                      setSocraticWhy(null);
                      stopSpeaking();
                    }}
                    className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex-1 text-sm py-3.5 font-black cursor-pointer"
                  >
                    Next Step ➡️
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSocraticQuestionIndex(null);
                      setSocraticStep(0);
                      setSocraticWhy(null);
                      stopSpeaking();
                      triggerConfettiEffect();
                    }}
                    className="rounded-xl flex-1 text-sm py-3.5 bg-green-500 hover:bg-green-600 text-white font-black hover:scale-105 transition-all shadow-md cursor-pointer"
                  >
                    I Understand! 🎉
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Magic Glossary Terms explorer */}
          <div className="border-t border-pink-200/20 pt-6 space-y-4">
            <span className="text-sm font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="h-4.5 w-4.5 text-pink-500 animate-wiggle" /> Magic Words Glossary 🧙‍♂️
            </span>
            <p className="text-xs text-muted-foreground font-semibold">Tapping cards flips them with a special spring animation to show the meanings!</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {magicWords.map((item, idx) => {
                const [flipped, setFlipped] = useState(false);
                return (
                  <div
                    key={idx}
                    onClick={() => setFlipped(!flipped)}
                    className="relative min-h-[120px] perspective cursor-pointer"
                  >
                    <div className={`w-full h-full duration-500 transform-style transition-transform ${flipped ? "rotate-y-180" : ""}`}>
                      {/* Front Card */}
                      <div className="absolute w-full h-full backface-hidden bg-card p-4 rounded-xl border-2 border-pink-200/30 flex flex-col justify-center items-center text-center gap-2 shadow-xs hover:border-pink-500 transition-all duration-300">
                        <span className="text-xl">🪄</span>
                        <span className="font-black text-sm text-foreground">{item.word}</span>
                        <span className="text-xs font-black text-pink-500 uppercase tracking-widest mt-1">Tap to reveal</span>
                      </div>
                      
                      {/* Back Card */}
                      <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-pink-50/90 dark:bg-pink-950/20 p-4 rounded-xl border-2 border-pink-400/30 flex flex-col justify-center text-center shadow-inner">
                        <p className="text-sm leading-relaxed text-foreground font-bold">{item.definition}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* 2. AIMIKO MONKEY RADIO (New Podcast Tab) */}
      {activeTab === "AIMIKO Monkey Radio" && (
        <div className="space-y-6 animate-slide-up-bounce">
          
          {/* Instructions */}
          <div className="flex items-start gap-4 bg-pink-500/5 p-5 rounded-xl border border-pink-200/20">
            <Radio className="h-12 w-12 text-pink-500 animate-pulse shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-black text-foreground uppercase tracking-wider">📻 AIMIKO Radio Broadcasting</h4>
              <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
                Generate a funny Dialogue Podcast script between AIMIKO (robo-monkey) and KIKO (student monkey) explaining your topic, then listen to their voiced banter!
              </p>
            </div>
          </div>

          {/* Topic search / generator */}
          <div className="flex gap-2">
            <input
              value={podcastTopic}
              onChange={(e) => setPodcastTopic(e.target.value)}
              placeholder="e.g. How rainbows form, Why dinosaurs died, Photosynthesis"
              className="flex-1 bg-background border-2 border-pink-200/20 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-pink-400 transition-all font-bold"
              disabled={aiLoading}
            />
            <Button
              onClick={handleCreateRadioShow}
              className="text-sm rounded-xl px-6 py-3 font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-md"
              disabled={aiLoading || !podcastTopic.trim()}
            >
              <Wand2 className="h-4 w-4" /> Create Broadcast
            </Button>
          </div>

          {aiLoading ? (
            <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-xl border border-pink-200/30 p-8 shadow-inner animate-pulse">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
              <h3 className="font-black text-lg text-foreground">Drafting radio dialog scripts...</h3>
              <p className="text-sm text-muted-foreground">Calibrating robot monkey voices!</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Radio Controller HUD */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient(ellipse at center, rgba(219,39,119,0.06), transparent) pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <Radio className={`h-5 w-5 text-pink-500 ${isPodcastPlaying ? "animate-pulse" : ""}`} />
                    <div>
                      <p className="text-xs text-pink-500 font-black uppercase tracking-wider">Broadcasting Radio Studio</p>
                      <p className="text-sm font-black text-foreground">{podcastTopic}</p>
                    </div>
                  </div>
                  
                  {/* Waveform graphic when playing */}
                  {isPodcastPlaying && (
                    <div className="flex items-end gap-1 h-5 pl-4">
                      <div className="w-1 bg-pink-500 rounded-full animate-bar-1 h-3" />
                      <div className="w-1 bg-pink-500 rounded-full animate-bar-2 h-5" />
                      <div className="w-1 bg-pink-500 rounded-full animate-bar-3 h-2" />
                      <div className="w-1 bg-pink-500 rounded-full animate-bar-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Dialog Script Lines */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  {podcastScript.map((line, idx) => {
                    const isActive = activePodcastLineIndex === idx;
                    const isAimiko = line.character === "AIMIKO";
                    
                    return (
                      <div
                        key={idx}
                        className={`flex gap-3 items-start transition-all duration-300 p-3 rounded-xl ${
                          isActive ? "bg-pink-600/10 border border-pink-500/35 shadow-xs" : "opacity-60"
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border border-border ${
                          isAimiko ? "bg-pink-500/15" : "bg-indigo-500/15"
                        }`}>
                          {isAimiko ? (
                            <img src={mascotAvatar} alt="Aimiko" className="h-6 w-6 object-contain" />
                          ) : (
                            <span className="text-base">🐒</span>
                          )}
                        </div>
                        {/* Content text */}
                        <div className="space-y-0.5">
                          <p className={`text-xs font-black uppercase tracking-wider ${
                            isAimiko ? "text-pink-500" : "text-indigo-400"
                          }`}>{line.character}</p>
                          <p className="text-sm text-foreground font-semibold leading-relaxed">{line.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Control Action Buttons */}
                <div className="flex justify-center pt-2 border-t border-border/60">
                  <button
                    onClick={handleTuneInPodcast}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-black text-sm cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    {isPodcastPlaying ? (
                      <>
                        <Square className="h-4 w-4 fill-white text-white" /> Stop Radio
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-white text-white" /> Tune In 📻
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* 3. EXPLAIN LIKE I'M 10 */}
      {activeTab === "Explain Like I'm 10" && (
        <div className="space-y-6 animate-slide-up-bounce">
          {aiLoading ? (
            <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-xl border border-pink-200/30 p-8 shadow-inner animate-pulse">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
              <h3 className="font-black text-lg text-foreground">Baking up a fun simple analogy...</h3>
            </div>
          ) : (
            <div className="space-y-6">
              
              <div className="flex items-start gap-4 bg-pink-500/5 p-5 rounded-xl border border-pink-200/20">
                <div className="relative p-1.5 bg-white/90 dark:bg-black/40 rounded-full border-2 border-pink-300/30 shadow-md flex items-center justify-center h-20 w-20 shrink-0">
                  <img src={mascotAvatar} alt="Mascot" className="h-16 w-16 object-contain animate-bounce-slow" />
                </div>
                <div className="bg-card p-5 rounded-xl border border-pink-200/30 shadow-xs relative flex-1">
                  <div className="absolute top-6 -left-2.5 h-3 w-3 bg-card border-l border-b border-pink-200/30 rotate-45 hidden sm:block" />
                  <p className="text-sm font-black text-foreground leading-relaxed">
                    Some words are huge and scary! Tap a card below to reveal my secret analogy cookies! 🍪✨
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">Select a Concept Card:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Object.entries(kidsConcepts).map(([concept, data]) => {
                    const isFlipped = !!flippedConcept[concept];
                    return (
                      <div key={concept} className="relative min-h-[180px] perspective cursor-pointer" onClick={() => toggleFlipCard(concept)}>
                        <div className={`w-full h-full duration-500 transform-style transition-transform ${isFlipped ? "rotate-y-180" : ""}`}>
                          {/* Front View */}
                          <div className="absolute w-full h-full backface-hidden bg-card p-5 rounded-xl border-2 border-pink-200/30 flex flex-col justify-center items-center text-center gap-2 shadow-xs hover:border-pink-500 transition-all duration-300">
                            <span className="text-3xl animate-bounce-slow">💡</span>
                            <span className="font-black text-sm text-foreground">{concept}</span>
                            <span className="text-xs uppercase font-black text-pink-500 mt-2">Click to flip!</span>
                          </div>
                          
                          {/* Back View */}
                          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-pink-50/90 dark:bg-pink-950/20 p-5 rounded-xl border-2 border-pink-400/30 flex flex-col justify-between text-center shadow-inner gap-3">
                            <div className="space-y-1.5 overflow-y-auto max-h-[110px] custom-scrollbar">
                              <span className="text-xs text-pink-600 font-black uppercase tracking-wider block">Analogy</span>
                              <p className="text-sm leading-relaxed text-foreground font-semibold">
                                {data.analogy}
                              </p>
                            </div>
                            
                            {/* Sketch suggestion prompt */}
                            <div className="bg-card border border-pink-300/30 p-2 rounded-lg text-xs text-foreground font-black flex items-center justify-center gap-1.5">
                              <span>🎨 {data.drawPrompt}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAIExplainLikeIm10(customInput);
                }} 
                className="pt-4 border-t border-pink-200/20 space-y-3"
              >
                <p className="text-sm font-black text-muted-foreground tracking-widest uppercase">Or type any hard word you want simplified:</p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. Gravity, Volcanoes, Black Holes"
                    className="flex-1 bg-background border-2 border-pink-200/20 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-pink-400 transition-all font-bold"
                    required
                  />
                  <Button type="submit" className="text-sm rounded-xl px-6 py-3 font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-md">
                    <Brain className="h-4 w-4" /> Explain Concept
                  </Button>
                </div>
              </form>

            </div>
          )}
        </div>
      )}

      {/* 3. BOOK SUMMARIZER */}
      {activeTab === "Book & Story Summarizer" && (
        <div className="space-y-6 animate-slide-up-bounce">
          {aiLoading ? (
            <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-xl border border-pink-200/30 p-8 shadow-inner animate-pulse">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
              <h3 className="font-black text-lg text-foreground">Opening the fairy tale library...</h3>
            </div>
          ) : summarizerBookIndex === null ? (
            <div className="space-y-6">
              
              <div className="flex items-start gap-4 bg-pink-500/5 p-5 rounded-xl border border-pink-200/20">
                <div className="relative p-1.5 bg-white/90 dark:bg-black/40 rounded-full border-2 border-pink-300/30 shadow-md flex items-center justify-center h-20 w-20 shrink-0">
                  <img src={mascotAvatar} alt="Mascot" className="h-16 w-16 object-contain animate-bounce-slow" />
                </div>
                <div className="bg-card p-5 rounded-xl border border-pink-200/30 shadow-xs relative flex-1">
                  <div className="absolute top-6 -left-2.5 h-3 w-3 bg-card border-l border-b border-pink-200/30 rotate-45 hidden sm:block" />
                  <p className="text-sm font-black text-foreground leading-relaxed">
                    I have books of ancient fairy tales! Choose one to read pages, flip panels, and learn nice morals! 📚
                  </p>
                </div>
              </div>

              {/* Story character customization options */}
              <div className="bg-card/40 border border-border/60 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase font-black tracking-wider pl-1">Story Protagonist Name</label>
                  <input
                    value={customStoryCharacter}
                    onChange={(e) => setCustomStoryCharacter(e.target.value)}
                    placeholder="Protagonist e.g. Kiko the Pup"
                    className="w-full bg-background border-2 border-pink-200/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-pink-500 font-bold shadow-inner"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground uppercase font-black tracking-wider pl-1">Setting location</label>
                  <input
                    value={customStorySetting}
                    onChange={(e) => setCustomStorySetting(e.target.value)}
                    placeholder="e.g. Outer space, Magic forest"
                    className="w-full bg-background border-2 border-pink-200/20 rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-pink-500 font-bold shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">Choose a Storybook:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {kidsBooksSummaries.map((book, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSummarizerBookIndex(idx);
                        setSummarizerSlide(0);
                      }}
                      className="p-5 bg-card/70 hover:bg-pink-500/10 text-sm text-center font-black text-foreground rounded-xl border-2 border-pink-200/20 shadow-xs hover-lift transition cursor-pointer flex justify-between items-center"
                    >
                      <span>📖 {book.title}</span>
                      <ArrowRight className="h-4 w-4 text-pink-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAIBookSummarizer(customInput);
                }} 
                className="pt-4 border-t border-pink-200/20 space-y-3"
              >
                <p className="text-sm font-black text-muted-foreground tracking-widest uppercase">Or compile another book summary:</p>
                <div className="flex gap-2">
                  <input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="e.g. Peter Pan, Pinocchio, Cinderella"
                    className="flex-1 bg-background border-2 border-pink-200/20 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-pink-400 transition-all font-bold"
                    required
                  />
                  <Button type="submit" className="text-sm rounded-xl px-6 py-3 font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-md">
                    <FileText className="h-4 w-4" /> Summarize Book
                  </Button>
                </div>
              </form>

            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Illustrated Flipbook Visuals */}
              <div className="bg-card border-2 border-pink-200/25 rounded-xl shadow-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 min-h-[220px]">
                
                {/* Left Page (Mascot & Title) */}
                <div className="bg-pink-500/5 p-6 border-r border-dashed border-pink-200/35 flex flex-col items-center justify-center text-center gap-3">
                  <div className="relative p-1.5 bg-white/90 dark:bg-black/40 rounded-full border-2 border-pink-300/30 shadow-md flex items-center justify-center h-20 w-20 shrink-0">
                    <img src={mascotAvatar} alt="Mascot" className="h-16 w-16 object-contain animate-bounce-slow" />
                  </div>
                  <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{kidsBooksSummaries[summarizerBookIndex].title}</h4>
                  <span className="text-xs bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 px-3 py-1.5 rounded-xl font-black">
                    Page {summarizerSlide + 1} of {kidsBooksSummaries[summarizerBookIndex].slides.length}
                  </span>
                  
                  {/* Speaker audio button */}
                  <button
                    onClick={() => {
                      const text = kidsBooksSummaries[summarizerBookIndex].slides[summarizerSlide];
                      if (isPlayingVoice && voiceActiveText === text) {
                        stopSpeaking();
                      } else {
                        speakText(text, "narrator");
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-pink-500 hover:text-pink-600 font-bold px-3 py-2 bg-card border border-pink-200/20 rounded-xl cursor-pointer transition shadow-xs mt-1"
                  >
                    {isPlayingVoice && voiceActiveText === kidsBooksSummaries[summarizerBookIndex].slides[summarizerSlide] ? (
                      <>
                        <VolumeX className="h-3.5 w-3.5" /> Stop Voice
                      </>
                    ) : (
                      <>
                        <Volume2 className="h-3.5 w-3.5" /> Read Page
                      </>
                    )}
                  </button>
                </div>
                
                {/* Right Page (Story Line) */}
                <div className="p-6 flex flex-col justify-center bg-card/30">
                  <p className="text-sm sm:text-base leading-relaxed text-foreground font-bold italic text-center whitespace-pre-wrap animate-slide-up-bounce">
                    {kidsBooksSummaries[summarizerBookIndex].slides[summarizerSlide]}
                  </p>
                </div>

              </div>

              {/* Progress step bar */}
              <div className="w-full h-2 bg-pink-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-pink-600 transition-all duration-300"
                  style={{ width: `${((summarizerSlide + 1) / kidsBooksSummaries[summarizerBookIndex].slides.length) * 100}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  disabled={summarizerSlide === 0}
                  onClick={() => {
                    setSummarizerSlide(s => s - 1);
                    stopSpeaking();
                  }}
                  className="rounded-xl flex-1 text-sm py-3.5 border-pink-200 bg-card font-black cursor-pointer"
                >
                  ⬅️ Back Page
                </Button>
                {summarizerSlide < kidsBooksSummaries[summarizerBookIndex].slides.length - 1 ? (
                  <Button
                    onClick={() => {
                      setSummarizerSlide(s => s + 1);
                      stopSpeaking();
                    }}
                    className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex-1 text-sm py-3.5 font-black cursor-pointer"
                  >
                    Next Page ➡️
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setSummarizerBookIndex(null);
                      setSummarizerSlide(0);
                      stopSpeaking();
                      triggerConfettiEffect();
                    }}
                    className="rounded-xl flex-1 text-sm py-3.5 bg-green-500 hover:bg-green-600 text-white font-black shadow-md cursor-pointer"
                  >
                    Done Reading! 📖🎉
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. QUIZ WIDGET (Dynamic AI Quiz Engine) */}
      {activeTab === "Fun Practice Quizzes" && (
        <div className="space-y-6 animate-slide-up-bounce">
          
          {/* Custom Trivia Search Compiler */}
          <div className="flex gap-2">
            <input
              value={quizTopic}
              onChange={(e) => setQuizTopic(e.target.value)}
              placeholder="e.g. Oceans, Dinosaurs, Planets, Fractions"
              className="flex-1 bg-background border-2 border-pink-200/20 rounded-xl px-5 py-3 text-sm text-foreground focus:outline-none focus:border-pink-400 transition-all font-bold"
              disabled={aiLoading}
            />
            <Button
              onClick={() => handleGenerateAIQuiz(quizTopic)}
              className="text-sm rounded-xl px-6 py-3 font-black bg-pink-600 hover:bg-pink-700 text-white flex items-center gap-1.5 shadow-md"
              disabled={aiLoading || !quizTopic.trim()}
            >
              <Wand2 className="h-4 w-4" /> Compile Quiz
            </Button>
          </div>

          {aiLoading ? (
            <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-xl border border-pink-200/30 p-8 shadow-inner animate-pulse">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
              <h3 className="font-black text-lg text-foreground">Compiling dynamic questions...</h3>
            </div>
          ) : quizIndex < kidsQuizQuestions.length ? (
            <div className="space-y-6 animate-pop-in">
              
              {/* Question card */}
              <div className="bg-pink-500/5 border border-pink-200/20 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400 px-3 py-1.5 rounded-xl font-black uppercase tracking-wider">
                    Question {quizIndex + 1} of {kidsQuizQuestions.length}
                  </span>
                  <span className="text-sm text-muted-foreground font-black">
                    Score: {quizScore}/{kidsQuizQuestions.length}
                  </span>
                </div>
                
                <h3 className="text-lg font-black text-foreground">
                  {kidsQuizQuestions[quizIndex].q}
                </h3>
              </div>

              {/* Options */}
              <div className="grid gap-3">
                {kidsQuizQuestions[quizIndex].options.map((option, idx) => {
                  let btnStyle = "border-pink-200/30 bg-card hover:border-pink-500";
                  if (isAnswered) {
                    if (idx === kidsQuizQuestions[quizIndex].correct) {
                      btnStyle = "border-green-500 bg-green-500/15 text-green-600 font-black";
                    } else if (idx === selectedOption) {
                      btnStyle = "border-red-500 bg-red-500/15 text-red-600";
                    } else {
                      btnStyle = "opacity-50 border-pink-200/10 bg-card/40";
                    }
                  } else if (selectedOption === idx) {
                    btnStyle = "border-pink-600 bg-pink-500/10 text-pink-600 font-black shadow-md";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      className={`w-full p-4.5 rounded-xl text-sm text-left border-2 transition-all duration-300 cursor-pointer ${btnStyle}`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              {selectedOption !== null && !isAnswered && (
                <Button
                  onClick={submitQuizAnswer}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-xl py-3.5 font-black shadow-md cursor-pointer"
                >
                  Submit Answer
                </Button>
              )}

              {isAnswered && (
                <div className="space-y-4 animate-slide-up-bounce">
                  <div className="bg-card p-5 rounded-xl border border-pink-200/30 leading-relaxed font-bold flex gap-3 items-start shadow-inner">
                    <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl">
                      <HelpCircle className="h-5 w-5 animate-bounce-slow" />
                    </div>
                    <div>
                      <p className="text-xs text-pink-600 uppercase font-black tracking-wider">Did you know? 💡</p>
                      <p className="text-sm text-foreground mt-0.5 font-semibold leading-relaxed">{kidsQuizQuestions[quizIndex].fact}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleNextQuizQuestion}
                    className="w-full rounded-xl py-3.5 font-black shadow-md bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  >
                    {quizIndex + 1 === kidsQuizQuestions.length ? "Finish Quiz 🎉" : "Next Question ➡️"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 space-y-6 bg-card border-2 border-pink-200/20 rounded-xl p-8 shadow-md">
              <div className="w-18 h-18 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto animate-bounce">
                <Award className="h-10 w-10 text-amber-500 fill-amber-500/10" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-foreground">You Completed the Quiz!</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed font-semibold">
                  Excellent work study buddy! You answered <strong>{quizScore} out of {kidsQuizQuestions.length}</strong> questions correctly!
                </p>
              </div>

              {/* Star indicators */}
              <div className="flex justify-center gap-1.5 py-1">
                {Array.from({ length: kidsQuizQuestions.length }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-7 w-7 ${i < quizScore ? "text-amber-500 fill-amber-500" : "text-pink-200"}`} 
                  />
                ))}
              </div>

              {/* Unlocked badge reveal if perfect score */}
              {activeBadge && (
                <div className="p-4 bg-green-500/15 border-2 border-green-500/20 rounded-xl max-w-xs mx-auto animate-pop-in space-y-1.5 shadow-xs">
                  <span className="text-xs uppercase font-black text-green-600 tracking-wider">🏆 New Achievement Badge Unlocked:</span>
                  <p className="text-sm font-black text-foreground">{activeBadge}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizScore(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    setActiveBadge(null);
                    triggerConfettiEffect();
                  }}
                  variant="outline"
                  className="rounded-xl flex-1 text-sm py-3.5 border-pink-200 bg-card font-black flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-4.5 w-4.5" /> Play Again
                </Button>
                <Button
                  onClick={() => {
                    setQuizIndex(0);
                    setQuizScore(0);
                    setSelectedOption(null);
                    setIsAnswered(false);
                    onClose();
                  }}
                  className="rounded-xl bg-pink-600 hover:bg-pink-700 text-white flex-1 text-sm py-3.5 font-black cursor-pointer"
                >
                  Back to Core Console
                </Button>
              </div>
            </div>
          )}

          {/* Badge Showcase Room */}
          <div className="border-t border-pink-200/20 pt-6 space-y-3">
            <span className="text-sm font-black text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Award className="h-4.5 w-4.5 text-pink-500" /> Your Trophy Badges Room
            </span>
            <div className="flex flex-wrap gap-2">
              {unlockedBadges.map((badge, idx) => (
                <span key={idx} className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground font-black flex items-center gap-1 shadow-md">
                  🏅 {badge}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
