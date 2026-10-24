import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw,
  Mail,
  User,
  Share2,
  Download,
  ArrowLeft,
  Info,
  Play,
  Video,
} from "lucide-react";
import AimikoPosterCanvas from "@/components/preregister/AimikoPosterCanvas";
import AimikoPreRegChatbot from "@/components/preregister/AimikoPreRegChatbot";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api/v1" : "https://aimiko-main.onrender.com/api/v1");

type Step = "hero" | "form" | "otp" | "animating" | "success";

export default function PreRegistration() {
  const [step, setStep] = useState<Step>("hero");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [queueNumber, setQueueNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [posterDataUrl, setPosterDataUrl] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);

  // Rotating Hero Taglines (Smoothly cycles through the 3 variations)
  const heroTaglines = [
    {
      kicker: "AIMIKO — Digital Intelligence for Everyone",
      headline: "Your life. Your work. Your world.",
      accent: "Powered by AI.",
      sub: "A smarter way to live, work, learn, and connect.",
    },
    {
      kicker: "The Unified AI Companion",
      headline: "One ecosystem.",
      accent: "A world of possibilities.",
      sub: "Personal AI. Smarter businesses. Limitless possibilities.",
    },
    {
      kicker: "Next-Generation Intelligence",
      headline: "AI for your life. AI for your work.",
      accent: "AI for what's next.",
      sub: "From everyday tasks to ambitious ideas — AI for real life.",
    },
  ];

  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroFading, setIsHeroFading] = useState(false);

  // Auto-rotate hero taglines with smooth fade every 4.2 seconds
  useEffect(() => {
    if (step !== "hero") return;
    const interval = setInterval(() => {
      setIsHeroFading(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % heroTaglines.length);
        setIsHeroFading(false);
      }, 350);
    }, 4200);
    return () => clearInterval(interval);
  }, [step]);

  // Staged animation state (3-5s)
  const [animStage, setAnimStage] = useState(0);
  const [animProgress, setAnimProgress] = useState(0);

  // Refs for 6 OTP boxes
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const stages = [
    `Welcome, ${name || "friend"}!`,
    "Getting your AIMIKO ready…",
    "Adding your personal touch…",
    "Almost there! ✨",
  ];

  // Auto-focus first OTP box when entering OTP step, or check for ?test=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testParam = params.get("test") || params.get("preview");
    const nameParam = params.get("name");
    const numParam = params.get("num") || params.get("number");
    if (testParam || nameParam || numParam) {
      if (nameParam) setName(nameParam);
      if (numParam) setQueueNumber(parseInt(numParam, 10) || 1);
      setStep("success");
    }
  }, []);

  useEffect(() => {
    if (step === "otp" && otpRefs.current[0]) {
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  // Handle Form Submit -> Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/preregister/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Unable to send verification code.");
      }

      if (data.is_verified) {
        // User is already verified, take them straight to their poster!
        setQueueNumber(data.queue_number || 1);
        setStep("success");
      } else {
        setStep("otp");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal && value !== "") return;

    const newValues = [...otpValues];

    if (cleanVal.length > 1) {
      // User pasted full OTP
      const pasted = cleanVal.slice(0, 6).split("");
      pasted.forEach((char, i) => {
        if (i < 6) newValues[i] = char;
      });
      setOtpValues(newValues);
      const nextFocus = Math.min(pasted.length, 5);
      otpRefs.current[nextFocus]?.focus();
      return;
    }

    newValues[index] = cleanVal;
    setOtpValues(newValues);

    // Auto focus next box
    if (cleanVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP & Trigger Personalization Animation
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const fullOtp = otpValues.join("");
    if (fullOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/preregister/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: fullOtp }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Invalid code. Please check and try again.");
      }

      setQueueNumber(data.queue_number || 1);
      startPersonalizationAnimation();
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed. Check the code.");
      setIsLoading(false);
    }
  };

  // 3-5 Second Personalization Animation
  const startPersonalizationAnimation = () => {
    setStep("animating");
    setIsLoading(false);
    setAnimStage(0);
    setAnimProgress(0);

    const totalDuration = 4000; // 4 seconds
    const intervalTime = 40;
    const progressStep = 100 / (totalDuration / intervalTime);

    let progress = 0;
    const timer = setInterval(() => {
      progress += progressStep;
      setAnimProgress(Math.min(Math.round(progress), 100));

      if (progress < 25) setAnimStage(0);
      else if (progress >= 25 && progress < 55) setAnimStage(1);
      else if (progress >= 55 && progress < 85) setAnimStage(2);
      else setAnimStage(3);

      if (progress >= 100) {
        clearInterval(timer);
        setTimeout(() => {
          setStep("success");
        }, 300);
      }
    }, intervalTime);
  };

  // Download Poster
  const handleDownloadPoster = () => {
    if (!posterDataUrl) return;
    const a = document.createElement("a");
    a.href = posterDataUrl;
    a.download = `AIMIKO-Poster-${name.replace(/[^a-zA-Z0-9]/g, "_") || "Member"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Share Poster (Native Web Share API with fallback)
  const handleSharePoster = async () => {
    const shareText = `I just joined early access for AIMIKO! 🐒 Got my personalized digital companion poster. Join before spots fill up:`;
    const shareUrl = "https://www.aimiko.in";

    if (navigator.share) {
      try {
        await navigator.share({
          title: "AIMIKO Early Access",
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fallback to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        alert("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert("Link copied to clipboard! Share it with your friends.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fffaf6] via-[#faf3fc] to-[#f5effa] text-[#0b132b] font-sans antialiased selection:bg-pink-200 relative overflow-hidden flex flex-col justify-between">
      {/* Soft Ambient Pastel Backlights */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-pink-200/40 via-purple-200/30 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[420px] h-[420px] bg-sky-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-[420px] h-[420px] bg-amber-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* ── 1. TOP NAVIGATION BAR ── */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between relative z-30">
        {/* AIMIKO Wordmark on the Left */}
        <div
          onClick={() => setStep("hero")}
          className="cursor-pointer group flex items-center"
        >
          <span className="font-black text-2xl sm:text-3xl tracking-tight text-[#0b132b] group-hover:opacity-85 transition-opacity">
            AIMIKO
          </span>
        </div>

        {/* About on Right + Prominent Get Early Access Button */}
        <div className="flex items-center gap-6 sm:gap-8">
          <button
            onClick={() => setShowAbout(true)}
            className="text-sm font-bold text-slate-600 hover:text-[#0b132b] transition-colors cursor-pointer"
          >
            About
          </button>

          {step !== "form" && step !== "otp" && step !== "animating" && (
            <button
              id="nav-early-access-btn"
              onClick={() => {
                setStep("form");
                setErrorMsg("");
              }}
              className="py-3 px-6 rounded-full bg-[#0b132b] text-white font-extrabold text-sm hover:bg-slate-800 shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Early Access
            </button>
          )}
        </div>
      </header>

      {/* ── MAIN VIEWPORT CONTENT ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative z-20 w-full max-w-5xl mx-auto">
        {/* ── 1. THE HERO SECTION (CREATE CURIOSITY) ── */}
        {step === "hero" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center animate-fade-in py-6">
            {/* Left Column: Typography & CTAs (7 Cols) */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Rotating Animated Hero Typography */}
              <div
                className={`space-y-6 transition-all duration-500 ease-out min-h-[260px] flex flex-col justify-center ${
                  isHeroFading
                    ? "opacity-0 -translate-y-2"
                    : "opacity-100 translate-y-0"
                }`}
              >
                {/* Kicker line */}
                <p className="text-base sm:text-lg font-bold text-slate-600 tracking-wide">
                  {heroTaglines[heroIndex].kicker}
                </p>

                {/* LARGEST TEXT */}
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-[#0b132b] tracking-tight leading-[1.04]">
                  {heroTaglines[heroIndex].headline}
                </h1>

                {/* Sub-headline */}
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-pink-600 to-amber-600">
                    {heroTaglines[heroIndex].accent}
                  </h2>
                  <p className="text-lg sm:text-xl font-medium text-slate-600 pt-1">
                    {heroTaglines[heroIndex].sub}
                  </p>
                </div>
              </div>

              {/* Tagline Rotation Indicators */}
              <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                {heroTaglines.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsHeroFading(true);
                      setTimeout(() => {
                        setHeroIndex(i);
                        setIsHeroFading(false);
                      }, 250);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      heroIndex === i
                        ? "w-8 bg-purple-700 shadow-sm"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                    title={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* CTA Action */}
              <div className="pt-2 space-y-3">
                <button
                  id="hero-early-access-btn"
                  onClick={() => {
                    setStep("form");
                    setErrorMsg("");
                  }}
                  className="py-5 px-9 rounded-full bg-gradient-to-r from-[#0b132b] via-purple-950 to-[#0b132b] text-white font-black text-lg sm:text-xl shadow-[0_15px_35px_rgba(11,19,43,0.22)] hover:shadow-[0_20px_45px_rgba(11,19,43,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-3 group"
                >
                  <span>GET EARLY ACCESS</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="text-xs sm:text-sm font-semibold text-slate-500">
                  Be among the first to join the AIMIKO journey.
                </p>
              </div>
            </div>

            {/* Right Column: 9:16 Vertical Video Frame (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[310px] aspect-[9/16] rounded-[2.5rem] bg-slate-900 border-[6px] border-white shadow-[0_25px_60px_-15px_rgba(11,19,43,0.22)] hover:shadow-[0_30px_70px_-10px_rgba(124,58,237,0.25)] transition-all overflow-hidden group">
                {/* Floating live badge */}
                <div className="absolute top-4 left-4 z-20 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-sm text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  AIMIKO Early Access
                </div>

                {/* 9:16 Video Player */}
                <video
                  src="/assets/video/hero.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                    const fb = document.getElementById("hero-video-placeholder");
                    if (fb) fb.style.display = "flex";
                  }}
                />

                {/* 9:16 Placeholder (displays until video file is placed) */}
                <div
                  id="hero-video-placeholder"
                  style={{ display: "none" }}
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#1c2541] via-[#0b132b] to-[#070b14] text-white"
                >
                  <div className="w-16 h-16 rounded-full bg-violet-600/30 border border-violet-400/40 flex items-center justify-center mb-4 text-violet-300 shadow-lg animate-pulse">
                    <Play className="w-7 h-7 translate-x-0.5 text-violet-400 fill-violet-400/20" />
                  </div>
                  <h4 className="text-base font-black text-white mb-1.5 tracking-tight">
                    9:16 Video Frame Ready
                  </h4>
                  <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mb-4">
                    Place your 9:16 vertical video at:
                  </p>
                  <code className="text-[10px] font-mono bg-black/60 border border-violet-500/30 text-violet-300 px-3 py-2 rounded-xl max-w-full break-all shadow-inner">
                    public/assets/video/hero.mp4
                  </code>
                </div>

                {/* Bottom Tag */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold tracking-wide shadow-md whitespace-nowrap flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>AIMIKO In Motion</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. THE REGISTRATION FORM (KEEP IT SIMPLE) ── */}
        {step === "form" && (
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/90 shadow-[0_25px_70px_rgba(11,19,43,0.14)] space-y-7 animate-pop-in relative">
            <button
              onClick={() => setStep("hero")}
              className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-[#0b132b] hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Form Header */}
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b132b]">
                Join AIMIKO early access.
              </h2>
              <p className="text-sm font-medium text-slate-600">
                Your journey into the digital world starts here.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Full name
                </label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-[#0b132b] text-base font-semibold focus:bg-white focus:border-[#0b132b] focus:ring-4 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
                <span className="text-[11px] font-medium text-slate-500 block pl-1">
                  The name you want displayed on your AIMIKO poster.
                </span>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                  Email address
                </label>
                <input
                  id="email-input"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 text-[#0b132b] text-base font-semibold focus:bg-white focus:border-[#0b132b] focus:ring-4 focus:ring-slate-900/10 outline-none transition-all placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Submit Button */}
              <button
                id="form-continue-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[#0b132b] text-white font-black text-base shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>CONTINUE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Caption */}
            <p className="text-xs text-center text-slate-500 leading-relaxed">
              We'll use your email to verify your registration and send AIMIKO updates.
            </p>
          </div>
        )}

        {/* ── 3. EMAIL OTP VERIFICATION (6 DIGIT BOXES) ── */}
        {step === "otp" && (
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 border border-white/90 shadow-[0_25px_70px_rgba(11,19,43,0.14)] space-y-7 animate-pop-in relative">
            <button
              onClick={() => setStep("form")}
              className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:text-[#0b132b] hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* OTP Header */}
            <div className="text-center space-y-2 pt-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0b132b]">
                One quick step! ✉️
              </h2>
              <p className="text-sm text-slate-600">
                We've sent a verification code to:
                <br />
                <span className="font-bold text-[#0b132b]">{email}</span>
              </p>
              <p className="text-xs text-slate-500 pt-1">
                Enter the six-digit code below.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}


            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-between gap-2">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-black font-mono rounded-2xl bg-slate-50 border-2 border-slate-200 text-[#0b132b] focus:bg-white focus:border-[#0b132b] focus:ring-4 focus:ring-slate-900/10 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                id="verify-email-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl bg-[#0b132b] text-white font-black text-base shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>VERIFY EMAIL</span>
                )}
              </button>

              {/* Secondary links */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 font-semibold">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="hover:text-[#0b132b] hover:underline cursor-pointer"
                >
                  Change email address
                </button>

                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="hover:text-[#0b132b] cursor-pointer"
                >
                  Didn't receive the code? Resend OTP.
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── 4. THE AIMIKO PERSONALIZATION ANIMATION (3–5s) ── */}
        {step === "animating" && (
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/90 shadow-[0_25px_70px_rgba(11,19,43,0.14)] text-center space-y-8 animate-pop-in">
            {/* Sleek Minimalist Luxury Spinner (No temporary logo) */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0b132b] border-r-purple-600 animate-spin" />
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-50 to-pink-50 flex items-center justify-center shadow-inner">
                <Sparkles className="w-7 h-7 text-purple-700 animate-pulse" />
              </div>
            </div>

            {/* Staged Text Sequence */}
            <div className="min-h-[70px] flex flex-col justify-center space-y-1">
              <h3 className="text-2xl font-black text-[#0b132b] tracking-tight animate-fade-in key={animStage}">
                {stages[animStage]}
              </h3>
              <p className="text-xs font-bold text-purple-600 animate-pulse">
                Stamping {name.toUpperCase()} onto your beige T-shirt...
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 rounded-full transition-all duration-100 ease-out"
                  style={{ width: `${animProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400">
                <span>Customizing</span>
                <span>{animProgress}%</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 5 & 6. THE PERSONALIZED POSTER REVEAL & REGISTRATION SUCCESS ── */}
        {step === "success" && (
          <div className="w-full max-w-3xl space-y-8 animate-fade-in py-4 text-center">
            {/* Success Copy */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>YOU'RE OFFICIALLY ON THE LIST! 🎉</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-[#0b132b]">
                Welcome to AIMIKO, {name}.
              </h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto font-medium">
                Your email has been verified, and your early-access registration is complete.
                Your AIMIKO journey starts here. Stay tuned for what's coming next.
              </p>
            </div>

            {/* The Actual Personalized Poster Canvas (The Highlight) */}
            <div className="py-2">
              <AimikoPosterCanvas
                name={name || "Rahul"}
                queueNumber={queueNumber}
                onPosterReady={(url) => setPosterDataUrl(url)}
              />
            </div>

            {/* Three Buttons Below Poster */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto">
              <button
                id="download-poster-btn"
                onClick={handleDownloadPoster}
                className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-[#0b132b] text-white font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>DOWNLOAD MY POSTER</span>
              </button>

              <button
                id="share-poster-btn"
                onClick={handleSharePoster}
                className="w-full sm:w-auto flex-1 py-4 px-6 rounded-2xl bg-white border-2 border-slate-200 text-[#0b132b] font-black text-sm shadow-md hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE MY POSTER</span>
              </button>
            </div>

            <div>
              <button
                id="back-home-btn"
                onClick={() => setStep("hero")}
                className="text-xs font-bold text-slate-500 hover:text-[#0b132b] underline cursor-pointer"
              >
                BACK TO AIMIKO WEBSITE
              </button>
            </div>

            {/* Footer Tagline */}
            <p className="text-xs font-bold text-slate-400 tracking-wide pt-4">
              AIMIKO — It's time for the digital world.
            </p>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-slate-500 gap-3 border-t border-slate-200/50 relative z-20">
        <div>© 2026 AIMIKO. All rights reserved. • www.aimiko.in</div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAbout(true)}
            className="hover:text-[#0b132b] transition-colors cursor-pointer"
          >
            About AIMIKO
          </button>
          <span>•</span>
          <span className="text-purple-600 font-bold">GEN-01 Launching Soon</span>
        </div>
      </footer>

      {/* ── ABOUT MODAL ── */}
      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-white space-y-6 relative animate-pop-in">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-[#0b132b] hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xl">
                A
              </div>
              <h3 className="text-2xl font-black text-[#0b132b] tracking-tight">
                About AIMIKO
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                The physical world gained instant delivery through quick-commerce and on-demand mobility.
                Now, it is time for the digital world.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                AIMIKO means <strong className="text-[#0b132b]">AI friend for everyone</strong>.
                We are building a lifelong companion that adapts to who you are — whether you are a student learning to code, a creator crafting viral hooks, a professional advancing your career, or someone seeking deep conversational intelligence.
              </p>
              <p className="text-xs text-purple-700 font-bold">
                Pre-register now at www.aimiko.in to guarantee your day-one status.
              </p>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="w-full py-3.5 rounded-2xl bg-[#0b132b] text-white font-bold text-sm hover:bg-slate-800 transition-all cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── 6. AIMIKO Pre-Registration AI Guide Chatbot (Groq Llama) ── */}
      <AimikoPreRegChatbot />
    </div>
  );
}
