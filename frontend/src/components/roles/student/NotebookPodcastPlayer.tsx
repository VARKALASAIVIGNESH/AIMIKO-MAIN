import { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Sparkles,
  Headphones,
  User,
  Bot,
  FastForward,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PodcastLine {
  speaker: "Alex" | "Maya";
  role: string;
  avatarColor: string;
  text: string;
}

const defaultPodcastScript: PodcastLine[] = [
  {
    speaker: "Alex",
    role: "The Inquisitive Host",
    avatarColor: "bg-blue-500",
    text: "Welcome back to the AIMIKO Deep Dive! Today, we are tearing into cellular respiration, and honestly Maya, I always get mixed up about where all this ATP actually gets minted."
  },
  {
    speaker: "Maya",
    role: "The Science Co-Host",
    avatarColor: "bg-pink-500",
    text: "Great question Alex! Think of your cell like a giant energy currency exchange. Glycolysis is just the opening bell in the cytoplasm, yielding a quick 2 ATP profit. But the real goldmine happens inside the mitochondria during the electron transport chain!"
  },
  {
    speaker: "Alex",
    role: "The Inquisitive Host",
    avatarColor: "bg-blue-500",
    text: "Wait, so why do we need oxygen then? Is it just burning fuel like a fire?"
  },
  {
    speaker: "Maya",
    role: "The Science Co-Host",
    avatarColor: "bg-pink-500",
    text: "Exactly! Oxygen is the ultimate electron catcher at the very end of the conveyor belt. Without oxygen catching those electrons, the entire cellular power grid backs up and shuts down instantly."
  },
  {
    speaker: "Alex",
    role: "The Inquisitive Host",
    avatarColor: "bg-blue-500",
    text: "Boom. That makes total sense. So 1 glucose molecule nets around 36 to 38 ATP when all three stages run smoothly!"
  }
];

interface NotebookPodcastPlayerProps {
  topicTitle?: string;
  customScript?: PodcastLine[];
  onGenerateNew?: () => void;
  isGenerating?: boolean;
}

export function NotebookPodcastPlayer({
  topicTitle = "Cellular Respiration Deep Dive",
  customScript = defaultPodcastScript,
  onGenerateNew,
  isGenerating = false
}: NotebookPodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const script = customScript.length > 0 ? customScript : defaultPodcastScript;
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  const playLine = (index: number) => {
    if (!synthRef.current || index >= script.length) {
      setIsPlaying(false);
      setCurrentLineIndex(0);
      return;
    }

    synthRef.current.cancel();
    const line = script[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    activeUtteranceRef.current = utterance;

    // Set voice characteristics based on speaker
    const voices = synthRef.current.getVoices();
    if (line.speaker === "Alex") {
      utterance.pitch = 0.95;
      utterance.rate = 1.05 * playbackSpeed;
      const maleVoice = voices.find(v => v.name.includes("Male") || v.name.includes("David") || v.name.includes("Google US English"));
      if (maleVoice) utterance.voice = maleVoice;
    } else {
      utterance.pitch = 1.15;
      utterance.rate = 1.0 * playbackSpeed;
      const femaleVoice = voices.find(v => v.name.includes("Female") || v.name.includes("Zira") || v.name.includes("Samantha"));
      if (femaleVoice) utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      if (index + 1 < script.length) {
        setCurrentLineIndex(index + 1);
        playLine(index + 1);
      } else {
        setIsPlaying(false);
        setCurrentLineIndex(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    synthRef.current.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (!synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      playLine(currentLineIndex);
    }
  };

  const handleRestart = () => {
    synthRef.current?.cancel();
    setCurrentLineIndex(0);
    if (isPlaying) {
      playLine(0);
    }
  };

  const currentSpeaker = script[currentLineIndex]?.speaker || "Alex";

  return (
    <div className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-secondary/30 p-6 space-y-6 shadow-sm">
      
      {/* ─── Header Banner ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-violet-600 to-pink-500 flex items-center justify-center text-white shadow-md">
            <Headphones className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-foreground">{topicTitle}</h3>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                2-Host AI Podcast
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Alex & Maya break down your material into an engaging audio dialogue.</p>
          </div>
        </div>

        {onGenerateNew && (
          <Button
            onClick={onGenerateNew}
            disabled={isGenerating}
            size="sm"
            variant="outline"
            className="rounded-xl text-xs"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating Script...
              </>
            ) : (
              <>
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Re-Generate Podcast
              </>
            )}
          </Button>
        )}
      </div>

      {/* ─── Animated Soundwave Visualizer & Player Controls ─── */}
      <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Playback buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePlay}
            className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </button>

          <button
            onClick={handleRestart}
            className="h-9 w-9 rounded-full bg-secondary hover:bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Restart from beginning"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <div>
            <p className="text-xs font-bold text-foreground">
              {isPlaying ? `Speaking: ${currentSpeaker}` : "Audio Ready"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Line {currentLineIndex + 1} of {script.length}
            </p>
          </div>
        </div>

        {/* Dynamic Soundwave Bars */}
        <div className="flex items-center gap-1 h-8 px-4">
          {[40, 75, 55, 90, 60, 100, 45, 80, 65, 95, 50, 85, 70, 40].map((height, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isPlaying
                  ? currentSpeaker === "Alex"
                    ? "bg-blue-500 animate-pulse"
                    : "bg-pink-500 animate-pulse"
                  : "bg-muted-foreground/30"
              }`}
              style={{
                height: isPlaying ? `${Math.max(20, (height * ((i % 3) + 1)) % 100)}%` : "25%",
                animationDelay: `${i * 70}ms`
              }}
            />
          ))}
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] text-muted-foreground font-medium">Speed:</span>
          {[1.0, 1.25, 1.5].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors ${
                playbackSpeed === spd
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary"
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>

      </div>

      {/* ─── Synchronized Live Transcript ─── */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
        {script.map((line, idx) => {
          const isActive = idx === currentLineIndex && isPlaying;
          const isAlex = line.speaker === "Alex";

          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentLineIndex(idx);
                if (isPlaying) playLine(idx);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? isAlex
                    ? "bg-blue-500/10 border-blue-500/40 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-pink-500/10 border-pink-500/40 shadow-xs ring-1 ring-pink-500/20"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-6 w-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${
                    isAlex ? "bg-blue-600" : "bg-pink-600"
                  }`}>
                    {line.speaker[0]}
                  </span>
                  <span className="text-xs font-bold text-foreground">{line.speaker}</span>
                  <span className="text-[10px] text-muted-foreground">({line.role})</span>
                </div>

                {isActive && (
                  <span className="text-[10px] font-bold text-primary flex items-center gap-1 animate-pulse">
                    <Volume2 className="h-3 w-3" /> Live
                  </span>
                )}
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-medium pl-8">
                {line.text}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
