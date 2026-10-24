import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import mascotAvatar from "@/assets/aimiko-avatar.png";
import { generateAIResponse } from "@/lib/ai";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Wand2, BookOpen, Volume2, VolumeX } from "lucide-react";

interface StoryToyCreatorProps {
  activeToolLabel: string;
  onClose: () => void;
}

export function StoryToyCreator({ activeToolLabel, onClose }: StoryToyCreatorProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");

  // Confetti particles for completions
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  // TTS Speech Synthesis States
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [voiceActiveText, setVoiceActiveText] = useState("");
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- Story Teller States ---
  const [storySlide, setStorySlide] = useState(0);
  const [storyTitle, setStoryTitle] = useState("The Space Adventure");
  const [kidsStorySlides, setKidsStorySlides] = useState<string[]>([
    "Once upon a time, in a magical glowing forest, lived a little monkey named KIKO. 🐒 KIKO loved looking at the stars and wanted to touch them!",
    "One day, KIKO met AIMIKO, a brilliant robo-monkey with shining jetpack boots. 🚀 AIMIKO said, 'Grab my hand, KIKO! Today we are visiting the Moon!'",
    "They zoomed through fluffy clouds, higher than airplanes, straight into space! The Earth looked like a giant glowing blue marble below. 🌍",
    "On the Moon, they bounced super high because of weak gravity! They drew a smiley face in the dust and decided to always explore together. 🌕✨"
  ]);

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

  const handleCreateAIStory = async (topic: string) => {
    if (!topic.trim()) return;
    setAiLoading(true);
    try {
      const prompt = `Write a short, simple children's story about "${topic}" suitable for a 6-year-old. Format the response as EXACTLY 4 paragraphs. Do not add any introductory or concluding text, titles, or page numbers. Separate each of the 4 paragraphs with a double newline. Make it very cheerful and include plenty of emojis.`;
      const response = await generateAIResponse(prompt, "kids", "creator");
      const paragraphs = response.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
      
      if (paragraphs.length >= 4) {
        setKidsStorySlides(paragraphs.slice(0, 4));
      } else {
        const sentences = response.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 1);
        if (sentences.length >= 4) {
          setKidsStorySlides([
            sentences[0] + ".",
            sentences[1] + ".",
            sentences[2] + ".",
            sentences.slice(3).join(" ") + "."
          ]);
        } else {
          setKidsStorySlides([
            response.substring(0, Math.floor(response.length / 4)) + "...",
            response.substring(Math.floor(response.length / 4), Math.floor(response.length / 2)) + "...",
            response.substring(Math.floor(response.length / 2), Math.floor((3 * response.length) / 4)) + "...",
            response.substring(Math.floor((3 * response.length) / 4))
          ]);
        }
      }
      setStoryTitle(topic);
      setStorySlide(0);
      setCustomInput("");
      triggerConfettiEffect();
      toast({
        title: "Story Created! 📖",
        description: `AIMIKO wrote a custom adventure about "${topic}"!`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Story failed",
        description: "AIMIKO got a little sleepy. Try another theme!",
      });
    } finally {
      setAiLoading(false);
    }
  };

  // TTS Voice Synthesis Engine
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

    window.speechSynthesis.cancel();
    setVoiceActiveText(text);

    const cleanText = text
      .replace(/AIMIKO:/i, "")
      .replace(/KIKO:/i, "")
      .replace(/[\*\#\`\-\_]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtteranceRef.current = utterance;

    if (voiceType === "aimiko") {
      utterance.pitch = 1.35;
      utterance.rate = 1.1;
    } else if (voiceType === "kiko") {
      utterance.pitch = 0.95;
      utterance.rate = 0.95;
    } else {
      utterance.pitch = 1.1;
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

  // Stop speaking when story slide changes
  useEffect(() => {
    stopSpeaking();
  }, [storySlide]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleClose = () => {
    setStorySlide(0);
    stopSpeaking();
    onClose();
  };

  return (
    <div className="relative overflow-hidden glass-bubble border-2 border-orange-400/30 dark:border-orange-500/10 p-6 md:p-8 shadow-2xl glow-blue animate-pop-in space-y-6">
      
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-200/40 pb-6">
        
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[1.75rem] bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center border border-orange-300/30 shadow-md animate-float shrink-0">
            <BookOpen className="h-8 w-8 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Story Teller</h2>
            <p className="text-xs text-orange-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
              <Sparkles className="h-4 w-4 text-orange-500 animate-wiggle" /> Create magical adventures with AIMIKO!
            </p>
          </div>
        </div>

        {/* Right Side: Close Workspace Button */}
        <button
          onClick={handleClose}
          className="text-orange-600 bg-orange-100 hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-400 hover:scale-105 active:scale-95 px-4.5 py-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all duration-300 shadow-sm border border-orange-200/40"
        >
          ✕ Close Workspace
        </button>
      </div>

      {/* STORY TELLER CONTENT */}
      <div className="space-y-6 animate-slide-up-bounce">
        {aiLoading ? (
          <div className="text-center py-12 space-y-4 bg-card/50 backdrop-blur-md rounded-[2rem] border border-border p-8 shadow-inner animate-pulse">
            <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 mx-auto animate-bounce" />
            <h3 className="font-black text-lg text-foreground">AIMIKO is writing an adventure story...</h3>
            <p className="text-xs text-muted-foreground">Stretching ideas and adding cartoon expressions!</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Illustrated double-page style slide */}
            <div className="bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden grid grid-cols-1 sm:grid-cols-2 min-h-[240px]">
              
              {/* Left Page (Mascot & Details) */}
              <div className="bg-orange-500/5 p-6 border-r border-dashed border-orange-200/35 flex flex-col items-center justify-center text-center gap-3">
                <div className="relative p-2 bg-white/90 dark:bg-black/40 rounded-full border-2 border-orange-300/30 shadow-md flex items-center justify-center h-24 w-24 shrink-0">
                  <img src={mascotAvatar} alt="Mascot" className="h-20 w-20 object-contain animate-bounce-slow" />
                </div>
                <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{storyTitle}</h4>
                <span className="text-[9px] bg-orange-100 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400 px-3 py-1 rounded-md font-black">
                  Page {storySlide + 1} of {kidsStorySlides.length}
                </span>
                
                {/* Speaker audio button */}
                <button
                  onClick={() => {
                    const text = kidsStorySlides[storySlide];
                    if (isPlayingVoice && voiceActiveText === text) {
                      stopSpeaking();
                    } else {
                      speakText(text, "narrator");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-bold px-3 py-2 bg-card border border-orange-200/20 rounded-xl cursor-pointer transition shadow-xs mt-1"
                >
                  {isPlayingVoice && voiceActiveText === kidsStorySlides[storySlide] ? (
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
              
              {/* Right Page (Story Content) */}
              <div className="p-6 flex flex-col justify-center bg-card/40">
                <p className="text-xs sm:text-sm leading-relaxed text-foreground font-bold italic text-center whitespace-pre-wrap animate-slide-up-bounce">
                  {kidsStorySlides[storySlide]}
                </p>
              </div>

            </div>

            {/* Progress step bar */}
            <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-orange-600 transition-all duration-300"
                style={{ width: `${((storySlide + 1) / kidsStorySlides.length) * 100}%` }}
              />
            </div>

            {/* Navigation Controls */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                disabled={storySlide === 0}
                onClick={() => setStorySlide(s => s - 1)}
                className="rounded-2xl flex-1 text-xs py-3.5 border-orange-200 bg-white font-black"
              >
                ⬅️ Back Page
              </Button>
              {storySlide < kidsStorySlides.length - 1 ? (
                <Button
                  onClick={() => setStorySlide(s => s + 1)}
                  className="rounded-2xl bg-orange-600 hover:bg-orange-700 text-white flex-1 text-xs py-3.5 font-black"
                >
                  Next Page ➡️
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setStorySlide(0);
                    triggerConfettiEffect();
                    toast({ title: "Read completed! 🏁", description: "You've read the entire storybook!" });
                  }}
                  className="rounded-2xl flex-1 text-xs py-3.5 bg-green-500 hover:bg-green-600 text-white font-black shadow-md"
                >
                  Read Again! 📚🎉
                </Button>
              )}
            </div>

            {/* Write Another Story */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateAIStory(customInput);
              }}
              className="pt-4 border-t border-orange-200/20 space-y-3"
            >
              <p className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Write another story adventure:</p>
              <div className="flex gap-2">
                <input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. A tiny dragon who lost his magic bubble"
                  className="flex-1 bg-card border border-border rounded-2xl px-5 py-3 text-xs text-foreground focus:outline-none focus:border-orange-400 transition-all font-bold"
                  required
                />
                <Button type="submit" className="text-xs rounded-2xl px-6 py-3 font-black bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 shadow-md">
                  <Wand2 className="h-4 w-4" /> Write Story
                </Button>
              </div>
            </form>

          </div>
        )}
      </div>
    </div>
  );
}
