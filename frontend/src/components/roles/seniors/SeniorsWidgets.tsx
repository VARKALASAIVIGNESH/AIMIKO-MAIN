import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AimikoAvatar } from "@/components/AimikoAvatar";
import { generateAIResponse } from "@/lib/ai";
import { GenericToolWidget } from "../GenericToolWidget";
import { Search, ShieldAlert, BookOpen, Smartphone, HelpCircle, ArrowRight, ShieldCheck, Heart, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SeniorsWidgetsProps {
  activeToolLabel: string;
  suggestedPrompt?: string;
  onClose: () => void;
}

export function SeniorsWidgets({ activeToolLabel, suggestedPrompt, onClose }: SeniorsWidgetsProps) {
  const { toast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  // --- Hobby Planner States ---
  const [hobbyCategory, setHobbyCategory] = useState("gardening");
  const [hobbyIdeas, setHobbyIdeas] = useState<string[]>([
    "Herb gardening (starting with simple mint or basil in pots) 🌿",
    "Bird watching in the local park with small binoculars 🐦",
    "Soft watercolor painting (flowers and quiet landscapes) 🎨"
  ]);

  // --- Modern App Guide States ---
  const [selectedApp, setSelectedApp] = useState("whatsapp");
  const appGuides: Record<string, { desc: string; steps: string[] }> = {
    whatsapp: {
      desc: "WhatsApp is a free messaging app that lets you talk, send photos, and make phone or video calls to family members anywhere in the world.",
      steps: [
        "🟢 Open the app and tap on a family member's contact name.",
        "✍️ Type your message in the text box at the bottom and press the paper airplane send button.",
        "📞 Tap the phone icon for voice, or the video-camera icon to see them on screen in real-time!"
      ]
    },
    zoom: {
      desc: "Zoom is an app that allows you to join group video calls. It is commonly used for family get-togethers, classes, or club meetings.",
      steps: [
        "🔗 Click the invitation link sent to your email or text message.",
        "🖥️ Tap 'Join with Video' so others can see your smiling face.",
        "🎙️ Tap 'Join Audio' and make sure the little microphone icon is not red (not muted) so they can hear you!"
      ]
    },
    youtube: {
      desc: "YouTube is like a giant library of millions of free videos, television clips, songs, and cooking guides.",
      steps: [
        "🔍 Tap the magnifying glass icon at the top of the screen to open the search bar.",
        "🗣️ Type or speak what you want to find (e.g. '1960s classic music' or 'how to bake apple pie').",
        "📺 Tap any video picture to play it, and pinch the screen to make it larger!"
      ]
    }
  };

  // --- Cyber-Safety States ---
  const [emailText, setEmailText] = useState("");
  const [safetyChecklist, setSafetyChecklist] = useState<string[]>([]);
  const [isSafe, setIsSafe] = useState<boolean | null>(null);

  // --- Memoir Builder States ---
  const [lifeEra, setLifeEra] = useState("childhood");
  const [eraMemory, setEraMemory] = useState("");
  const [memoirChapter, setMemoirChapter] = useState("");

  const handleHobbyPlan = async () => {
    setAiLoading(true);
    try {
      const prompt = `Recommend 3 relaxing starting hobbies for seniors interested in: "${hobbyCategory}". Present as a highly warm, simple list under 3 lines total with emojis.`;
      const response = await generateAIResponse(prompt, "seniors", "student");
      setHobbyIdeas(response.split("\n").filter(l => l.trim().length > 0));
      toast({ title: "Hobby Plan Compiled! 🌸", description: "Read through the ideas AIMIKO found." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCyberSafetyCheck = () => {
    if (!emailText.trim()) return;
    const text = emailText.toLowerCase();
    
    // Heuristic scan
    const redFlags: string[] = [];
    if (text.includes("urgent") || text.includes("immediately") || text.includes("hurry")) {
      redFlags.push("⚠️ High pressure words forcing you to act immediately.");
    }
    if (text.includes("bank") || text.includes("password") || text.includes("account is locked") || text.includes("ssn")) {
      redFlags.push("⚠️ Requests sensitive financial or login information.");
    }
    if (text.includes("click here") || text.includes("http") || text.includes(".ru") || text.includes("link")) {
      redFlags.push("⚠️ Asks you to click on external web links.");
    }
    if (text.includes("gift card") || text.includes("crypto") || text.includes("transfer money")) {
      redFlags.push("⚠️ Requests payment through gift cards or digital wire transfers.");
    }

    if (redFlags.length > 0) {
      setSafetyChecklist(redFlags);
      setIsSafe(false);
      toast({ variant: "destructive", title: "Warning Flagged! 🛡️", description: "Be careful of this message!" });
    } else {
      setSafetyChecklist(["✓ No immediate high-risk scam indicators found. However, always verify directly with the sender before answering!"]);
      setIsSafe(true);
      toast({ title: "Scan Completed", description: "Message appears safe." });
    }
  };

  const handleDraftMemoir = async () => {
    if (!eraMemory.trim()) return;
    setAiLoading(true);
    setMemoirChapter("");
    try {
      const prompt = `Ghostwrite a beautiful, warm memoir chapter outline based on this memory: "${eraMemory}". Era context: ${lifeEra}. Make the prose extremely nostalgic and structured under 4 sentences total.`;
      const response = await generateAIResponse(prompt, "seniors", "creator");
      setMemoirChapter(response);
      toast({ title: "Memoir Draft Ready! ✍️", description: "A nostalgic summary was created." });
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="glass-bubble border-2 border-amber-500/30 dark:border-amber-500/10 p-6 md:p-8 shadow-2xl glow-blue animate-pop-in space-y-6 relative text-[17px]">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-amber-800 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-400 hover:scale-105 active:scale-95 px-4 py-2 rounded-full font-black text-xs cursor-pointer transition-all duration-300"
      >
        ✕ Close Cozy Space
      </button>

      <div className="flex items-center gap-3">
        <AimikoAvatar size="sm" animate />
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">{activeToolLabel}</h2>
          <p className="text-xs text-amber-600 font-bold uppercase tracking-widest flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 fill-amber-500 text-amber-500 animate-pulse" /> AIMIKO Seniors Cozy Space 🏡
          </p>
        </div>
      </div>

      {/* 1. Hobby Discovery Planner */}
      {activeToolLabel === "Hobby Discovery Planner" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-sm text-muted-foreground font-semibold">Select a category below to discover warm, relaxing hobbies with AIMIKO! 🌸</p>
          
          <div className="flex gap-3">
            <select
              value={hobbyCategory}
              onChange={(e) => setHobbyCategory(e.target.value)}
              className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-amber-400 cursor-pointer font-bold"
            >
              <option value="outdoors & nature">Outdoors & Nature 🌲</option>
              <option value="crafts & painting">Crafts & Painting 🎨</option>
              <option value="reading & puzzles">Reading & Puzzles 🧩</option>
              <option value="gentle exercises">Gentle Exercises 🚶‍♂️</option>
            </select>
            <Button onClick={handleHobbyPlan} className="text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-2xl px-6 py-3 font-black shadow-md" disabled={aiLoading}>
              Discover 🌸
            </Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-amber-500/5 rounded-3xl border border-amber-200/20 text-sm text-muted-foreground font-semibold">
              🌸 Finding beautiful starting hobbies for you...
            </div>
          ) : (
            <div className="bg-card p-6 rounded-[2rem] border border-border space-y-4 animate-pop-in">
              <span className="text-xs uppercase font-black text-amber-600 tracking-wider block">Recommended Hobbies:</span>
              <ul className="space-y-3">
                {hobbyIdeas.map((idea, idx) => (
                  <li key={idx} className="bg-background/40 border border-amber-200/10 p-4 rounded-2xl font-bold">
                    {idea}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 2. Cozy Modern App Guide */}
      {activeToolLabel === "Modern App Guide" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-sm text-muted-foreground font-semibold">Select a modern application below to see a step-by-step description of how to use it without any complex tech jargon! 📱</p>
          
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(appGuides).map(appKey => (
              <button
                key={appKey}
                onClick={() => setSelectedApp(appKey)}
                className={`p-4 text-center border-2 text-sm capitalize rounded-2xl cursor-pointer transition ${
                  selectedApp === appKey ? "bg-amber-500/10 border-amber-500 text-amber-600 font-black" : "bg-card border-border hover:border-amber-400 text-foreground"
                }`}
              >
                {appKey}
              </button>
            ))}
          </div>

          <div className="bg-card border border-border p-6 rounded-[2rem] space-y-4 animate-pop-in">
            <div>
              <span className="text-xs uppercase font-black text-muted-foreground tracking-wider block">What is this?</span>
              <p className="text-foreground mt-1.5 font-bold leading-relaxed">{appGuides[selectedApp].desc}</p>
            </div>
            <div className="border-t border-amber-200/20 pt-4">
              <span className="text-xs uppercase font-black text-amber-600 tracking-wider block">How to use it (3 Steps)</span>
              <ul className="space-y-3 mt-3">
                {appGuides[selectedApp].steps.map((step, i) => (
                  <li key={i} className="bg-background/40 border border-amber-200/10 p-3.5 rounded-2xl font-bold flex items-start gap-3">
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-full h-6 w-6 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">{i+1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 3. Cyber-Safety Scam Scanner */}
      {activeToolLabel === "Cyber-Safety Checker" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-sm text-muted-foreground font-semibold font-medium">Paste any text message, email, or letter you received below. AIMIKO will check it for red flags! 🛡️</p>
          <textarea
            value={emailText}
            onChange={(e) => setEmailText(e.target.value)}
            placeholder="e.g. Urgent! Your bank account was locked. Click here immediately to input your password..."
            className="w-full min-h-[110px] bg-card border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:border-amber-400 resize-none font-bold"
          />
          <Button onClick={handleCyberSafetyCheck} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-3.5 font-black shadow-md">
            Scan Message Safety 🛡️
          </Button>

          {isSafe !== null && (
            <div className={`p-6 rounded-[2rem] border-2 animate-pop-in space-y-3 ${
              isSafe ? "bg-green-500/5 border-green-500/20 text-green-700" : "bg-red-500/5 border-red-500/20 text-red-600"
            }`}>
              <div className="flex items-center gap-2.5 font-black uppercase text-xs tracking-wider">
                {isSafe ? <ShieldCheck className="h-5 w-5 shrink-0 text-green-600" /> : <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />}
                <span>{isSafe ? "Message Appears Safe" : "Warning: Potential scam flag detected!"}</span>
              </div>
              <ul className="space-y-2 font-bold text-xs pl-1">
                {safetyChecklist.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 4. Memoir Ghostwriter Outline Builder */}
      {activeToolLabel === "Memoir Ghostwriter" && (
        <div className="space-y-4 animate-slide-up-bounce">
          <p className="text-sm text-muted-foreground font-semibold">Choose a lifetime era and type a brief memory. AIMIKO will draft a nostalgic memoir outline for your family! ✍️</p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["childhood", "school years", "career days", "family time"].map(era => (
              <button
                key={era}
                onClick={() => setLifeEra(era)}
                className={`p-3 border-2 text-xs capitalize rounded-2xl cursor-pointer transition font-black ${
                  lifeEra === era ? "bg-amber-500/10 border-amber-500 text-amber-600" : "bg-card border-border text-foreground"
                }`}
              >
                {era}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <textarea
              value={eraMemory}
              onChange={(e) => setEraMemory(e.target.value)}
              placeholder="e.g. In the summer of 1970, my friends and I built a treehouse behind my house and spent our afternoons playing there."
              className="w-full min-h-[90px] bg-card border border-border rounded-2xl p-4 text-sm text-foreground focus:outline-none focus:border-amber-400 resize-none font-bold"
            />
            <Button onClick={handleDraftMemoir} className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-3.5 font-black" disabled={aiLoading || !eraMemory.trim()}>
              Draft Memoir Outline ✍️
            </Button>
          </div>

          {aiLoading ? (
            <div className="p-8 text-center animate-pulse bg-amber-500/5 rounded-3xl border border-amber-200/20 text-sm text-muted-foreground font-semibold">
              🐒 Ghostwriting beautiful nostalgic outline chapters...
            </div>
          ) : memoirChapter && (
            <div className="bg-card border border-border p-6 rounded-[2rem] leading-relaxed text-foreground whitespace-pre-wrap font-bold animate-pop-in">
              {memoirChapter}
            </div>
          )}
        </div>
      )}

      {activeToolLabel !== "Hobby Discovery Planner" && 
       activeToolLabel !== "Modern App Guide" && 
       activeToolLabel !== "Cyber-Safety Checker" && 
       activeToolLabel !== "Memoir Ghostwriter" && (
         <GenericToolWidget label={activeToolLabel} suggestedPrompt={suggestedPrompt} />
      )}
    </div>
  );
}
