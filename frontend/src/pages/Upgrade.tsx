import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAimiko } from "@/context/AimikoContext";
import { ArrowLeft, Check, Sparkles, CreditCard, ShieldCheck, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Upgrade() {
  const navigate = useNavigate();
  const { billingTier, setBillingTier, addNotification } = useAimiko();
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"details" | "processing" | "success">("details");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);

  const startPaymentSimulation = () => {
    setPaymentStep("details");
    setShowPaymentModal(true);
  };

  const handlePay = () => {
    setPaymentStep("processing");
    setTimeout(() => {
      setPaymentStep("success");
      setBillingTier("premium");
      addNotification("Successfully upgraded to AIMIKO Premium!");
      triggerConfetti();
    }, 2000);
  };

  const triggerConfetti = () => {
    const colors = ["bg-red-500", "bg-indigo-500", "bg-yellow-500", "bg-emerald-500", "bg-pink-500"];
    const particles = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(particles);
  };

  return (
    <div className="p-6 md:p-10 max-h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      {/* Immersive Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Content */}
      <div className="max-w-4xl w-full mx-auto flex flex-col justify-center items-center gap-8 relative z-10 animate-pop-in">
        
        {/* Upgrade Header */}
        <div className="text-center space-y-3 max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 border border-primary/20 rounded-full text-xs font-black text-primary tracking-widest uppercase text-[10px]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Premium Plan Options</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight text-foreground">
            Upgrade Your Plan
          </h1>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto uppercase tracking-wide">
            Unlock 100 daily prompts, dynamic checklists, custom tools, and full conversational access to AIMIKO.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl mt-4">
          
          {/* Freemium Card */}
          <div className="tech-card border-border bg-card/60 p-8 flex flex-col justify-between relative shadow-lg">
            {billingTier === "freemium" && (
              <span className="absolute -top-3 left-6 bg-background text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-border text-primary">
                Current Plan
              </span>
            )}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-foreground uppercase tracking-wide">Free Plan</h3>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">Perfect for simple workflow trials & quick checks.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-foreground">$0</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase font-black">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-muted-foreground border-t border-border/40 pt-6 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>5 daily AI prompts (Standard models)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Basic study & creator helper access</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Analytical charts and CSV inputs locked</span>
                </li>
                <li className="flex items-center gap-2 opacity-40">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Lean Startup Canvas boards locked</span>
                </li>
              </ul>
            </div>
            <Button variant="ghost" className="w-full mt-8 rounded-2xl py-6 border border-border bg-background/40 text-xs font-black uppercase tracking-wider" disabled>
              {billingTier === "freemium" ? "Active Plan" : "Access Tier"}
            </Button>
          </div>

          {/* Premium Card */}
          <div className="tech-card border-2 border-primary bg-card/65 p-8 flex flex-col justify-between relative shadow-xl glow-purple">
            <span className="absolute -top-3 right-6 aimiko-gradient text-[9px] uppercase font-black tracking-widest text-primary-foreground px-3 py-1.5 rounded-full shadow-md animate-pulse">
              Best Value
            </span>
            {billingTier === "premium" && (
              <span className="absolute -top-3 left-6 bg-background text-[9px] uppercase font-black tracking-widest px-3 py-1.5 rounded-full border border-border text-primary">
                Current Plan
              </span>
            )}
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-display font-black text-foreground flex items-center gap-1.5 uppercase tracking-wide">
                  Premium Plan <Zap className="h-4 w-4 text-primary fill-primary animate-pulse" />
                </h3>
                <p className="text-xs text-muted-foreground font-semibold leading-relaxed">Full analytics dashboard integration & execution widgets.</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-display font-black text-foreground">$12</span>
                <span className="text-[10px] text-muted-foreground font-mono uppercase font-black">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-foreground/90 border-t border-border/40 pt-6 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>100 daily AI prompts (High-speed Turbo models)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Interactive CSV dataset graphs & visualizations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Interactive Business Model Canvas boards</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span>Code sandbox sandboxes & customized SWOT workspaces</span>
                </li>
              </ul>
            </div>
            <Button
              className="w-full mt-8 rounded-2xl py-6 aimiko-gradient text-primary-foreground border-0 hover:opacity-95 shadow-lg text-xs font-black uppercase tracking-widest hover-bounce"
              onClick={startPaymentSimulation}
              disabled={billingTier === "premium"}
            >
              {billingTier === "premium" ? "Active Plan" : "Upgrade to Premium"}
            </Button>
          </div>

        </div>
      </div>

      {/* Razorpay Simulated Modal Overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-card/90 p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-black text-white text-lg">A</div>
                <div className="space-y-0.5">
                  <h4 className="font-display font-black text-xs text-foreground uppercase tracking-wider">AIMIKO Secure Checkout</h4>
                  <p className="text-[9px] font-mono text-muted-foreground uppercase">Sandbox Mode</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider cursor-pointer"
                disabled={paymentStep === "processing"}
              >
                ✕ Cancel
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {paymentStep === "details" && (
                <div className="space-y-4">
                  <div className="bg-background/80 border border-border/40 p-4 rounded-2xl flex justify-between items-center text-xs font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider text-[10px]">Total Amount</span>
                    <span className="text-foreground font-black">$12.00 / month</span>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[9px] uppercase font-black text-primary tracking-widest block">Contact Info</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                    />
                  </div>

                  <Button 
                    onClick={handlePay}
                    disabled={!phone.trim() || !email.trim()}
                    className="w-full py-6 rounded-xl text-xs uppercase font-black tracking-widest bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 hover-bounce border-0 mt-4 shadow-lg shadow-primary/25"
                  >
                    <CreditCard className="h-4 w-4" />
                    Complete Sandbox Payment
                  </Button>
                </div>
              )}

              {paymentStep === "processing" && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div>
                    <h5 className="font-display font-black text-xs text-foreground uppercase tracking-wider">Processing payment securely...</h5>
                    <p className="text-[10px] text-muted-foreground font-semibold mt-1">Please wait, validating sandbox transaction details.</p>
                  </div>
                </div>
              )}

              {paymentStep === "success" && (
                <div className="py-10 flex flex-col items-center justify-center gap-6 text-center animate-pop-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-500/10">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h5 className="font-display font-black text-base text-foreground tracking-widest">PAYMENT SUCCESSFUL</h5>
                    <p className="text-xs text-muted-foreground font-semibold">AIMIKO Premium has been unlocked successfully.</p>
                  </div>
                  <Button 
                    onClick={() => {
                      setShowPaymentModal(false);
                      navigate("/dashboard");
                    }} 
                    className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider hover-bounce"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confetti Visual Elements */}
      {confetti.map((particle) => (
        <div
          key={particle.id}
          className={`absolute top-0 w-2 h-5 rounded ${particle.color} animate-confetti pointer-events-none`}
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );
}
