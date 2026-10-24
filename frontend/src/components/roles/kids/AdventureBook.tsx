import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import mascotAvatar from "@/assets/aimiko-avatar.png";
import { generateAIResponse } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Compass, BookOpen, Volume2, VolumeX, RefreshCw } from "lucide-react";

interface AdventureBookProps {
  activeToolLabel: string;
  onClose: () => void;
}

interface StoryPage {
  text: string;
  choices: string[];
}

export function AdventureBook({ activeToolLabel, onClose }: AdventureBookProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  
  // CYOA States
  const [storyActive, setStoryActive] = useState(false);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyHistory, setStoryHistory] = useState<StoryPage[]>([]);
  const [currentChoices, setCurrentChoices] = useState<string[]>([]);
  const [storySlide, setStorySlide] = useState(0);
  const [maxPages, setMaxPages] = useState(4);
  const [isFinished, setIsFinished] = useState(false);

  // Confetti particles for completion
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  // TTS Speech Synthesis States
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceActiveText, setVoiceActiveText] = useState("");
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const startermaps = [
    { label: "Polar Bear's Cocoa 🐻❄️", prompt: "A baby polar bear searching for hot chocolate in a snowy village" },
    { label: "Monkey's Moon Trip 🐒🌕", prompt: "A little monkey exploring the moon in shiny jetpack boots" },
    { label: "Dragon's Fire Bubble 🐉🫧", prompt: "A friendly dragon who lost his magical fire bubble" }
  ];

  const triggerConfettiEffect = () => {
    const colors = ["bg-orange-500", "bg-indigo-500", "bg-yellow-500", "bg-emerald-500", "bg-pink-500", "bg-cyan-500"];
    const particles = Array.from({ length: 40 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 100,
      delay: Math.random() * 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
    setTimeout(() => setConfetti([]), 4000);
  };

  const speakText = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support voice synthesis.",
      });
      return;
    }

    window.speechSynthesis.cancel();
    setVoiceActiveText(text);

    const cleanText = text
      .replace(/[\*\#\`\-\_]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtteranceRef.current = utterance;
    
    // Whimsical voice configuration
    utterance.pitch = 1.3;
    utterance.rate = 1.0;

    utterance.onstart = () => {
      setIsPlayingVoice(true);
    };

    utterance.onend = () => {
      setIsPlayingVoice(false);
      setVoiceActiveText("");
    };

    utterance.onerror = () => {
      setIsPlayingVoice(false);
      setVoiceActiveText("");
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlayingVoice(false);
    setVoiceActiveText("");
  };

  useEffect(() => {
    stopSpeaking();
  }, [storySlide]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleStartAdventure = async (theme: string) => {
    if (!theme.trim()) return;
    setAiLoading(true);
    stopSpeaking();
    try {
      const prompt = `Write Page 1 of an interactive Choose-Your-Own-Adventure story for a 6-year-old child about: "${theme}". 
Write exactly one cheerful paragraph of story text (2-3 sentences) with plenty of emojis.
Then, write exactly two choice options for what the kid can do next, starting each choice with a bullet point (*).`;

      const response = await generateAIResponse(
        prompt, 
        "kids", 
        null, 
        [], 
        "You are writing a Choose-Your-Own-Adventure storybook for a child. You MUST write the story text paragraph for the page first (2-3 sentences), and then list the choices at the end. Do not skip the story paragraph."
      );
      const { text, choices } = parseAIResponse(response);

      setStoryHistory([{ text, choices }]);
      setCurrentChoices(choices);
      setStoryTitle(theme);
      setStoryActive(true);
      setStorySlide(0);
      triggerConfettiEffect();
      
      toast({
        title: "Adventure Started! 🚀✨",
        description: "Let's make our own choices!",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Adventure failed",
        description: error instanceof Error ? error.message : "Kiko got lost in a storm. Try again!",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleChoosePath = async (choiceText: string) => {
    setAiLoading(true);
    stopSpeaking();
    const nextPageIndex = storyHistory.length; // starts at 0, so next is 1 (Page 2)
    const isEnding = nextPageIndex === maxPages - 1;

    // Build history text
    const fullHistory = storyHistory.map((p, i) => `Page ${i+1}: ${p.text}`).join("\n\n");

    try {
      let prompt = "";
      if (isEnding) {
        prompt = `You are continuing a Choose-Your-Own-Adventure story for a 6-year-old child about "${storyTitle}".
Here is the story so far:
${fullHistory}

The child chose: "${choiceText}".
This is Page ${nextPageIndex + 1} (the FINAL page of this chapter of the story). Write a happy, heartwarming conclusion paragraph (3-4 sentences, lots of emojis) that completes this chapter of the adventure.
Do NOT output any choices.`;
      } else {
        prompt = `You are continuing a Choose-Your-Own-Adventure story for a 6-year-old child about "${storyTitle}".
Here is the story so far:
${fullHistory}

The child chose: "${choiceText}".
Write Page ${nextPageIndex + 1} of the story (a single paragraph, 2-3 sentences, with emojis).
Then, write exactly two choice options for what the kid can do next, starting each choice with a bullet point (*).`;
      }

      const response = await generateAIResponse(
        prompt, 
        "kids", 
        null, 
        [], 
        "You are writing a Choose-Your-Own-Adventure storybook for a child. You MUST write the story text paragraph for the page first (2-3 sentences), and then list the choices at the end. Do not skip the story paragraph."
      );
      const { text, choices } = parseAIResponse(response, isEnding);

      const updatedHistory = [...storyHistory, { text, choices }];
      setStoryHistory(updatedHistory);
      setCurrentChoices(choices);
      setStorySlide(nextPageIndex);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Path blocked",
        description: error instanceof Error ? error.message : "That path is blocked by a giant sleeping turtle. Try again!",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleContinueStory = async () => {
    setAiLoading(true);
    stopSpeaking();
    const newMaxPages = maxPages + 4;
    setMaxPages(newMaxPages);
    const nextPageIndex = storyHistory.length;
    const fullHistory = storyHistory.map((p, i) => `Page ${i+1}: ${p.text}`).join("\n\n");

    try {
      const prompt = `You are continuing a Choose-Your-Own-Adventure story for a 6-year-old child about "${storyTitle}".
Here is the story so far:
${fullHistory}

The child chose to continue the adventure.
Write Page ${nextPageIndex + 1} of the story (a single paragraph, 2-3 sentences, with emojis) to continue the plot seamlessly.
Then, write exactly two choice options for what the kid can do next, starting each choice with a bullet point (*).`;

      const response = await generateAIResponse(
        prompt, 
        "kids", 
        null, 
        [], 
        "You are writing a Choose-Your-Own-Adventure storybook for a child. You MUST write the story text paragraph for the page first (2-3 sentences), and then list the choices at the end. Do not skip the story paragraph."
      );
      const { text, choices } = parseAIResponse(response, false);

      const updatedHistory = [...storyHistory, { text, choices }];
      setStoryHistory(updatedHistory);
      setCurrentChoices(choices);
      setStorySlide(nextPageIndex);
      
      toast({
        title: "Story Extended! 📖✨",
        description: `Max pages extended to ${newMaxPages}!`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Path blocked",
        description: error instanceof Error ? error.message : "The magical path is blocked. Try again!",
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleFinishStory = () => {
    setIsFinished(true);
    triggerConfettiEffect();
    toast({
      title: "Happy Ending! 🏆🎉",
      description: "You completed the adventure story book!",
    });
  };

  const parseAIResponse = (text: string, isEnding = false): StoryPage => {
    console.log("AIMIKO Adventure Book Raw Response:", text);
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    const cleanHeader = (s: string) => s.replace(/[\*\_\#\:]/g, "").trim().toLowerCase();

    if (isEnding) {
      const filteredLines = lines.filter(l => {
        const clean = cleanHeader(l);
        return (
          !l.startsWith("* ") && 
          !l.startsWith("- ") && 
          !l.startsWith("• ") &&
          !/^(choice|option|page|path)\s*\d+/i.test(clean) &&
          !/^\d+[\.\)]/i.test(clean) &&
          clean !== "choices" &&
          clean !== "options" &&
          clean !== "story" &&
          clean !== "conclusion"
        );
      });
      
      let finalText = filteredLines.join("\n\n").trim();
      finalText = finalText.replace(/^\*\*|\*\*$/g, "").trim();
      
      if (!finalText) {
        finalText = text.replace(/[\*\#]/g, "").trim();
      }
      console.log("AIMIKO Parsed Ending Story Text:", finalText);
      return { text: finalText, choices: [] };
    }

    // Identify choice lines: starting with "* ", "- ", "• ", or digits/choice keywords (excluding page number headers)
    const choiceLines = lines.filter(l => {
      const clean = cleanHeader(l);
      return (
        l.startsWith("* ") || 
        l.startsWith("- ") || 
        l.startsWith("• ") ||
        /^(choice|option|path)\s*\d+/i.test(clean) ||
        /^\d+[\.\)]/i.test(clean)
      );
    });

    const storyLines = lines.filter(l => {
      if (choiceLines.includes(l)) return false;
      const clean = cleanHeader(l);
      if (clean === "choices" || clean === "options" || clean === "story" || clean === "introduction") return false;
      if (/^page\s*\d+/i.test(clean)) return false;
      return true;
    });

    let storyText = storyLines.join("\n\n").trim();

    let choices = choiceLines.map(c => {
      let cleaned = c.replace(/^([\*\-\s•\d\.)]|choice|option|page|path|a\)|b\))+/i, "").trim();
      cleaned = cleaned.replace(/^\*\*|\*\*$/g, "").trim();
      cleaned = cleaned.replace(/^(option|choice|path)\s*\d+\s*:\s*/i, "").trim();
      return cleaned;
    });

    if (storyText.length === 0 && choiceLines.length >= 2) {
      const actualChoiceLines = choiceLines.slice(-2);
      const actualStoryLines = choiceLines.slice(0, -2);
      
      storyText = actualStoryLines.map(c => {
        let cleaned = c.replace(/^([\*\-\s•\d\.)]|choice|option|page|path|a\)|b\))+/i, "").trim();
        return cleaned.replace(/^\*\*|\*\*$/g, "").trim();
      }).join("\n\n");

      choices = actualChoiceLines.map(c => {
        let cleaned = c.replace(/^([\*\-\s•\d\.)]|choice|option|page|path|a\)|b\))+/i, "").trim();
        cleaned = cleaned.replace(/^\*\*|\*\*$/g, "").trim();
        cleaned = cleaned.replace(/^(option|choice|path)\s*\d+\s*:\s*/i, "").trim();
        return cleaned;
      });
    }

    console.log("AIMIKO Parsed Story Text:", storyText);
    console.log("AIMIKO Parsed Choices:", choices);

    if (choices.length < 2) {
      choices = ["Investigate closer! 🔍", "Explore the other path! 🧭"];
    } else {
      choices = choices.slice(0, 2);
    }

    storyText = storyText
      .replace(/^(Here is the page|Here is the story|Page \d+:?|Introduction:?)/i, "")
      .replace(/^\*\*|\*\*$/g, "")
      .trim();

    if (!storyText) {
      storyText = "An exciting path is opening up ahead! What should we do next? 🌟";
    }

    return { text: storyText, choices };
  };

  const handleRestart = () => {
    setStoryActive(false);
    setStoryHistory([]);
    setCurrentChoices([]);
    setStoryTitle("");
    setCustomInput("");
    setStorySlide(0);
    setMaxPages(4);
    setIsFinished(false);
    stopSpeaking();
  };

  const renderStoryText = (text: string) => {
    if (!text) return null;
    const trimmed = text.trim();
    
    // Find the index of the first alphabetical letter
    const firstAlphaIdx = trimmed.search(/[a-zA-Z]/);
    
    if (firstAlphaIdx === -1) {
      return text;
    }
    
    const leadingEmojis = trimmed.slice(0, firstAlphaIdx);
    const dropCapChar = trimmed.charAt(firstAlphaIdx);
    const restOfText = trimmed.slice(firstAlphaIdx + 1);
    
    return (
      <>
        {leadingEmojis && <span className="text-xl inline-block mr-1 select-none leading-none">{leadingEmojis}</span>}
        <span className="float-left text-4xl sm:text-5xl font-black text-indigo-600 mr-2 mt-0.5 font-fredoka leading-none select-none">
          {dropCapChar}
        </span>
        {restOfText}
      </>
    );
  };

  return (
    <div className="relative overflow-hidden glass-bubble border-2 border-indigo-400/30 dark:border-indigo-500/10 p-6 md:p-8 shadow-2xl glow-indigo animate-pop-in space-y-6">
      
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-200/40 pb-6">
        
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[1.75rem] bg-indigo-100 dark:bg-indigo-950/40 flex items-center justify-center border border-indigo-300/30 shadow-md animate-float shrink-0">
            <Compass className="h-8 w-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Adventure Book</h2>
            <p className="text-xs text-indigo-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
              <Sparkles className="h-4 w-4 text-indigo-500 animate-wiggle" /> Choose your own path with AIMIKO!
            </p>
          </div>
        </div>

        {/* Right Side: Close Workspace Button */}
        <button
          onClick={onClose}
          className="text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 hover:scale-105 active:scale-95 px-4.5 py-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all duration-300 shadow-sm border border-indigo-200/40"
        >
          ✕ Close Workspace
        </button>
      </div>

      {/* WORKSPACE CONTENT */}
      <div className="space-y-6">
        {aiLoading ? (
          <div className="text-center py-16 space-y-4 bg-indigo-500/5 backdrop-blur-md rounded-[2rem] border border-indigo-300/20 p-8 shadow-inner animate-pulse flex flex-col items-center justify-center">
            <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 animate-bounce" />
            <h3 className="font-black text-lg text-foreground">AIMIKO is creating the next adventure path...</h3>
            <p className="text-xs text-indigo-500/70 font-semibold">Deciding what happens next based on your choice! 🌟</p>
          </div>
        ) : !storyActive ? (
          
          /* START SCREEN */
          <div className="space-y-6 animate-slide-up-bounce">
            <div className="text-center space-y-3">
              <div className="inline-block p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full border border-indigo-100 dark:border-indigo-800">
                <img src={mascotAvatar} alt="Mascot" className="h-20 w-20 object-contain animate-float" />
              </div>
              <h3 className="text-xl font-black text-foreground">Where should our adventure start? 🚀</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Pick one of Kiko's favorite themes below or write your own custom story starter!
              </p>
            </div>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {startermaps.map((starter) => (
                <button
                  key={starter.label}
                  onClick={() => handleStartAdventure(starter.prompt)}
                  className="bg-card hover:bg-indigo-500/5 hover:border-indigo-400 border border-border/80 p-5 rounded-[2rem] text-center flex flex-col items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-sm group hover:scale-[1.03]"
                >
                  <BookOpen className="h-6 w-6 text-indigo-500 group-hover:scale-110 transition-transform" />
                  <p className="font-black text-sm text-foreground">{starter.label}</p>
                </button>
              ))}
            </div>

            {/* Custom Input Starter */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleStartAdventure(customInput);
              }}
              className="pt-4 border-t border-indigo-200/20 space-y-3"
            >
              <p className="text-[10px] font-black text-indigo-500 tracking-widest uppercase">Or invent your own starting prompt:</p>
              <div className="flex gap-2">
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. A tiny dragon who wanted to bake a marshmallow cookie 🐉🍪"
                  className="flex-1 bg-card border border-border rounded-2xl px-5 py-3 text-xs text-foreground focus:outline-none focus:border-indigo-400 transition-all font-bold"
                  required
                />
                <Button type="submit" className="text-xs rounded-2xl px-6 py-3 font-black bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md press">
                  Let's Go! 🚀
                </Button>
              </div>
            </form>
          </div>
        ) : (
          
          /* ACTIVE STORY ADVANCEMENT SCREEN */
          <div className="space-y-6 animate-slide-up-bounce">
            
            {/* Story Book Frame */}
            <div className="bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[260px]">
              
              {/* Left Page: Mascot & Meta */}
              <div className="bg-indigo-500/5 p-6 border-r border-dashed border-indigo-200/35 flex flex-col items-center justify-center text-center gap-4">
                <div className="relative p-2 bg-white/90 dark:bg-black/40 rounded-full border-2 border-indigo-300/30 shadow-md flex items-center justify-center h-24 w-24 shrink-0">
                  <img src={mascotAvatar} alt="Mascot" className="h-20 w-20 object-contain animate-bounce-slow" />
                </div>
                <div className="flex flex-col items-center">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Story Adventure</h4>
                  <p className="text-sm font-black text-foreground max-w-[220px] leading-tight mt-1 text-center whitespace-normal break-words">{storyTitle}</p>
                </div>
                <span className="text-[9px] bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 px-3 py-1 rounded-md font-black">
                  Page {storySlide + 1} of {maxPages}
                </span>
                
                {/* Voice button */}
                <button
                  onClick={() => {
                    const text = storyHistory[storySlide]?.text;
                    if (isPlayingVoice && voiceActiveText === text) {
                      stopSpeaking();
                    } else if (text) {
                      speakText(text);
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-bold px-3.5 py-2 bg-card border border-indigo-200/20 rounded-xl cursor-pointer transition shadow-xs"
                >
                  {isPlayingVoice && voiceActiveText === storyHistory[storySlide]?.text ? (
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
              
              {/* Right Page: Story Text (Parchment lined notebook layout) */}
              <div 
                className="relative p-6 flex flex-col justify-center min-h-[260px] overflow-hidden border-t md:border-t-0 md:border-l-2 border-dashed border-indigo-200/40 select-text"
                style={{
                  backgroundColor: "#fdfbf7",
                  backgroundImage: `
                    linear-gradient(90deg, transparent 44px, #fbc4c4 44px, #fbc4c4 46px, transparent 46px),
                    linear-gradient(rgba(100, 75, 50, 0.07) 1px, transparent 1px)
                  `,
                  backgroundSize: "100% 100%, 100% 2rem",
                  backgroundPosition: "0 0, 0 1.5rem",
                }}
              >
                <div className="pl-12 pr-4 py-4 text-left whitespace-pre-wrap font-quicksand font-semibold text-amber-950 text-sm sm:text-base leading-[2rem] animate-slide-up-bounce">
                  {renderStoryText(storyHistory[storySlide]?.text)}
                </div>
              </div>

            </div>

            {/* Step progress bar */}
            <div className="w-full h-2 bg-indigo-100 dark:bg-indigo-950/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300"
                style={{ width: `${((storySlide + 1) / maxPages) * 100}%` }}
              />
            </div>

            {/* Back Page Button (Navigation of read pages) */}
            <div className="flex justify-between items-center gap-3">
              <Button
                variant="outline"
                disabled={storySlide === 0}
                onClick={() => setStorySlide(s => s - 1)}
                className="rounded-2xl text-xs py-3 px-4 border-indigo-200 bg-white font-black"
              >
                ⬅️ Back Page
              </Button>

              {storySlide < storyHistory.length - 1 && (
                <Button
                  onClick={() => setStorySlide(s => s + 1)}
                  className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-3 px-4 font-black"
                >
                  Next Page ➡️
                </Button>
              )}
            </div>

            {/* CHOICE DECISION BOX */}
            <div className="pt-4 border-t border-indigo-200/20">
              {isFinished ? (
                /* Ending Screen Options */
                <div className="text-center space-y-4">
                  <div className="text-xl font-black text-green-500">🎉 Story Book Completed! 🎉</div>
                  <p className="text-xs text-muted-foreground">Kiko loved writing this adventure with you. What would you like to do now?</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button onClick={handleRestart} className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-4 px-8 shadow-md flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" /> Start a New Adventure!
                    </Button>
                    <Button onClick={onClose} variant="outline" className="rounded-2xl border-indigo-200 text-indigo-600 font-black text-xs py-4 px-8">
                      Exit Workspace
                    </Button>
                  </div>
                </div>
              ) : storySlide === maxPages - 1 && storyHistory.length === maxPages ? (
                /* We reached the end of the batch (Page 4, 8, etc.) and it's not finished yet */
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-500 tracking-widest uppercase text-center">You reached the end of this chapter! What should we do?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleContinueStory}
                      className="text-left p-5 rounded-[2rem] border border-indigo-300/40 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-4 bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 hover:from-indigo-500/15"
                    >
                      <div className="p-3 rounded-2xl shrink-0 bg-indigo-500/20 text-indigo-600">
                        <BookOpen className="h-5 w-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs sm:text-sm text-foreground leading-snug">Continue the Story! (Add 4 Pages) ➡️📖</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Keep the adventure going with new choices!</p>
                      </div>
                    </button>

                    <button
                      onClick={handleFinishStory}
                      className="text-left p-5 rounded-[2rem] border border-purple-300/40 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/15"
                    >
                      <div className="p-3 rounded-2xl shrink-0 bg-purple-500/20 text-purple-600">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-xs sm:text-sm text-foreground leading-snug">Finish & Celebrate! 🏆🎉</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">End the story here and celebrate your choice!</p>
                      </div>
                    </button>
                  </div>
                </div>
              ) : storySlide === storyHistory.length - 1 ? (
                /* Dynamic Options Choices Buttons */
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-indigo-500 tracking-widest uppercase text-center">Make your choice to continue the story:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentChoices.map((choice, idx) => (
                      <button
                        key={choice}
                        onClick={() => handleChoosePath(choice)}
                        className={`text-left p-5 rounded-[2rem] border border-indigo-300/40 cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-4 group ${
                          idx === 0 
                            ? "bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 hover:from-indigo-500/15" 
                            : "bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/15"
                        }`}
                      >
                        <div className={`p-3 rounded-2xl shrink-0 ${
                          idx === 0 ? "bg-indigo-500/20 text-indigo-600" : "bg-purple-500/20 text-purple-600"
                        }`}>
                          <Sparkles className="h-5 w-5 animate-pulse" />
                        </div>
                        <p className="font-bold text-xs sm:text-sm text-foreground leading-snug flex-1">{choice}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Middle pages navigation overlay warning */
                <div className="p-4 bg-indigo-500/5 border border-indigo-300/10 rounded-2xl text-center text-xs text-indigo-600 font-bold">
                  📖 Click "Next Page ➡️" at the top to return to the active decision panel!
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
