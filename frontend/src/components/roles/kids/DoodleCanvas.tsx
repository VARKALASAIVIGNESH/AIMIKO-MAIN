import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import mascotAvatar from "@/assets/aimiko-avatar.png";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Palette, Trash2, Volume2, VolumeX, Shuffle, Eye } from "lucide-react";

interface DoodleCanvasProps {
  activeToolLabel: string;
  onClose: () => void;
}

export function DoodleCanvas({ activeToolLabel, onClose }: DoodleCanvasProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  // Drawing States
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#FF4081"); // Hot Pink default
  const [brushSize, setBrushSize] = useState(6);
  const [isRainbowMode, setIsRainbowMode] = useState(false);

  // Doodle Prompts List
  const doodlePrompts = [
    "A cute baby alien wearing a party hat 👽🎉",
    "A happy little penguin sliding down a rainbow 🐧🌈",
    "Kiko the monkey eating a giant golden banana 🐒🍌",
    "A magical cat flying in a cardboard box spaceship 🐱📦",
    "A friendly robot kicking a colorful balloon 🤖🎈",
    "A cozy cottage house built inside a giant strawberry 🍓🏠",
    "A puppy wearing goggles driving a submarine 🐶🛳️",
    "A happy little star sleeping on a soft cloud ⭐☁️"
  ];
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);

  // Kiko AI response feedback
  const [aimikoFeedback, setAimikoFeedback] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Speech TTS states
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Rainbow color state variable
  const hueRef = useRef(0);

  // Whimsical comments list
  const compliments = [
    "Oh my gosh, this is absolutely beautiful! 🌟 The colors you chose are so bright and happy. You are a super-duper artist! 🎨",
    "Wow! Kiko is amazed! 🐵 Check out those awesome brush lines! You have a wonderful imagination. Keep it up! ✨",
    "Super-duper! 🚀 This drawing looks so cute, it belongs in a magical art museum! Here are 10 stars for your creativity! ⭐",
    "This is so creative! 🌈 I love how you drew this. It makes Kiko want to dance! 💃 Keep painting, you're doing great!"
  ];

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions based on container parent
    const rect = canvas.parentElement?.getBoundingClientRect();
    canvas.width = (rect?.width || 600) - 32; // padding offset
    canvas.height = 360;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = currentColor;
    context.lineWidth = brushSize;
    contextRef.current = context;

    // Fill background with white initially
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Update brush settings in context when state changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = currentColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [currentColor, brushSize]);

  // Touch & Mouse Drawing Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;
    e.preventDefault();

    let clientX, clientY;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Rainbow Brush logic
    if (isRainbowMode) {
      const currentHue = hueRef.current;
      contextRef.current.strokeStyle = `hsl(${currentHue}, 100%, 50%)`;
      hueRef.current = (currentHue + 4) % 360;
    } else {
      contextRef.current.strokeStyle = currentColor;
    }

    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, canvas.width, canvas.height);
    toast({
      title: "Clean Slate! 🧹",
      description: "Canvas cleared! Draw something new!",
    });
  };

  const cyclePrompt = () => {
    setCurrentPromptIdx((prev) => (prev + 1) % doodlePrompts.length);
  };

  // Speak feedback TTS
  const speakFeedback = (text: string) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef.current = utterance;
    utterance.pitch = 1.35; // friendly Kiko monkey voice
    utterance.rate = 1.0;

    utterance.onstart = () => setIsPlayingVoice(true);
    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopFeedbackSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlayingVoice(false);
  };

  const handleShowAimiko = () => {
    const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    setAimikoFeedback(randomCompliment);
    setShowFeedbackModal(true);
    speakFeedback(randomCompliment);
  };

  const handleCloseFeedback = () => {
    stopFeedbackSpeech();
    setShowFeedbackModal(false);
  };

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const selectColor = (colorHex: string, isRainbow = false) => {
    setIsRainbowMode(isRainbow);
    if (!isRainbow) {
      setCurrentColor(colorHex);
    }
  };

  const colors = [
    { hex: "#FF4081", name: "Pink" },
    { hex: "#FF5722", name: "Orange" },
    { hex: "#FFEB3B", name: "Yellow" },
    { hex: "#4CAF50", name: "Green" },
    { hex: "#2196F3", name: "Blue" },
    { hex: "#9C27B0", name: "Purple" },
    { hex: "#000000", name: "Black" },
    { hex: "#FFFFFF", name: "Eraser" }, // white is eraser
  ];

  return (
    <div className="relative overflow-hidden glass-bubble border-2 border-emerald-400/30 dark:border-emerald-500/10 p-6 md:p-8 shadow-2xl glow-emerald animate-pop-in space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/40 pb-6">
        
        {/* Left Side: Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-[1.75rem] bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center border border-emerald-300/30 shadow-md animate-float shrink-0">
            <Palette className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">Doodle Canvas</h2>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
              <Sparkles className="h-4 w-4 text-emerald-500 animate-wiggle" /> Unleash your inner artist!
            </p>
          </div>
        </div>

        {/* Right Side: Close Workspace */}
        <button
          onClick={onClose}
          className="text-emerald-600 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 hover:scale-105 active:scale-95 px-4.5 py-2.5 rounded-2xl font-black text-xs cursor-pointer transition-all duration-300 shadow-sm border border-emerald-200/40"
        >
          ✕ Close Workspace
        </button>
      </div>

      {/* DOODLE PROMPT BOX */}
      <div className="bg-emerald-500/5 border border-emerald-300/10 rounded-[1.75rem] p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl shrink-0 animate-bounce">🎨</span>
          <div>
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Your Drawing Challenge:</h4>
            <p className="text-sm font-black text-foreground mt-1">{doodlePrompts[currentPromptIdx]}</p>
          </div>
        </div>
        <button
          onClick={cyclePrompt}
          className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold px-3 py-2 bg-card border border-emerald-200/20 rounded-xl cursor-pointer transition shadow-xs hover:scale-105 active:scale-95 shrink-0"
        >
          <Shuffle className="h-3.5 w-3.5" /> Different Challenge
        </button>
      </div>

      {/* CANVAS DRAWING SPACE */}
      <div className="relative border-2 border-emerald-400/20 rounded-[2.25rem] bg-white shadow-inner overflow-hidden cursor-crosshair h-[360px]">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />
      </div>

      {/* CANVAS CONTROLS PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-t border-emerald-200/20 pt-5">
        
        {/* Colors Row */}
        <div className="flex flex-wrap items-center gap-2">
          {colors.map((color) => {
            const isSelected = !isRainbowMode && currentColor === color.hex;
            const isEraser = color.name === "Eraser";
            return (
              <button
                key={color.name}
                onClick={() => selectColor(color.hex)}
                style={{ backgroundColor: color.hex }}
                className={`h-9 w-9 rounded-full border-2 transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 flex items-center justify-center ${
                  isSelected ? "border-emerald-500 scale-110 ring-2 ring-emerald-400/35" : "border-gray-300 dark:border-gray-800"
                }`}
                title={color.name}
              >
                {isEraser && <span className="text-[10px] font-black text-black">🧼</span>}
              </button>
            );
          })}
          
          {/* Rainbow Brush pod */}
          <button
            onClick={() => selectColor("", true)}
            className={`h-9 w-9 rounded-full border-2 bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 transition-all duration-200 cursor-pointer shadow-sm hover:scale-110 flex items-center justify-center ${
              isRainbowMode ? "border-emerald-500 scale-110 ring-2 ring-emerald-400/35" : "border-gray-300"
            }`}
            title="Rainbow Brush"
          >
            <span className="text-[10px] font-black text-white">🌈</span>
          </button>
        </div>

        {/* Thickness Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">Size:</span>
          <div className="flex items-center gap-2">
            {[4, 8, 14, 22].map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  brushSize === size 
                    ? "bg-emerald-600 text-white font-black scale-115" 
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-600"
                }`}
                style={{ 
                  width: `${size + 18}px`, 
                  height: `${size + 18}px`,
                  fontSize: size < 8 ? "9px" : "11px"
                }}
              >
                ●
              </button>
            ))}
          </div>
        </div>

        {/* Clear & Save Actions */}
        <div className="flex gap-3 shrink-0">
          <Button
            variant="outline"
            onClick={clearCanvas}
            className="rounded-2xl border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-black text-xs py-3.5 flex items-center gap-1.5"
          >
            <Trash2 className="h-4 w-4" /> Clear Canvas
          </Button>
          <Button
            onClick={handleShowAimiko}
            className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-3.5 flex items-center gap-1.5 shadow-md press"
          >
            <Eye className="h-4 w-4" /> Show AIMIKO! ✨
          </Button>
        </div>
      </div>

      {/* FEEDBACK MODAL DIALOG */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-2 border-emerald-400/30 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl glow-emerald animate-pop-in space-y-5 text-center">
            
            <div className="relative inline-block p-3 bg-emerald-50 rounded-full border border-emerald-100">
              <img src={mascotAvatar} alt="Mascot" className="h-24 w-24 object-contain animate-bounce-slow" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-foreground">AIMIKO's Art Review 🐵🎨</h3>
              <p className="text-sm leading-relaxed text-foreground font-bold italic p-4 bg-emerald-500/5 rounded-2xl border border-dashed border-emerald-200/30">
                "{aimikoFeedback}"
              </p>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => speakFeedback(aimikoFeedback)}
                className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold px-4 py-2.5 bg-emerald-50 border border-emerald-200/30 rounded-xl cursor-pointer transition shadow-xs"
              >
                {isPlayingVoice ? (
                  <>
                    <VolumeX className="h-4 w-4" /> Stop Audio
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" /> Listen Again
                  </>
                )}
              </button>
              <Button
                onClick={handleCloseFeedback}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-6 shadow-md"
              >
                Awesome! 👍
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
