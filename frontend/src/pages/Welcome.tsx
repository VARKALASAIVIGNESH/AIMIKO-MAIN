import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AimikoGuideChatbot } from "@/components/AimikoGuideChatbot";
import MainNavbar from "@/components/MainNavbar";
import { ChevronDown, Globe, ArrowUpRight, Play, CheckCircle2, ChevronRight, Zap, Shield, BarChart3, Users, Sparkles, ArrowUp } from "lucide-react";

/* ─── Icons — Brand Character Mascot Logos ─── */
const LifeIcon = () => (
  <img
    src="/brand/mascot_life.png"
    alt="AIMIKO Life"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const AgencyIcon = () => (
  <img
    src="/brand/mascot_agency.png"
    alt="AIMIKO Agency"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const AnalyzerIcon = () => (
  <img
    src="/brand/mascot_analyzer.png"
    alt="AIMIKO Analyzer"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const MoveIcon = () => (
  <img
    src="/brand/mascot_move.png"
    alt="AIMIKO Move"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const CommerceIcon = () => (
  <img
    src="/brand/mascot_commerce.png"
    alt="AIMIKO Commerce"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const SchoolIcon = () => (
  <img
    src="/brand/mascot_school.png"
    alt="AIMIKO School"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

const MikoIcon = () => (
  <img
    src="/brand/mascot_miko.png"
    alt="MIKO"
    style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 12 }}
  />
);

/* ─── Products — precomputed 7-node orbit positions (660×660 orbit, R=250) ── */
const PRODUCTS = [
  {
    id: "buddy",
    title: "AIMIKO Buddy",
    sub: "Your AI Buddy",
    desc: "Personal AI companion for learning, productivity, habit tracking, creators, developers, and founders.",
    route: "/buddy",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: LifeIcon,
    features: [
      "Personal AI continuous learning companion",
      "Goal, habit & productivity tracking",
      "Career growth, networking & creator tools",
    ],
    pos: { top: 28, left: 256 },
  },
  {
    id: "works",
    title: "AIMIKO Works",
    sub: "Your AI Workforce",
    desc: "Autonomous AI employee agents, automated workflows, custom chatbots, and business consulting.",
    route: "/agency",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: AgencyIcon,
    features: [
      "Autonomous AI employee agents & workflows",
      "Custom AI systems, chatbots & integrations",
      "Enterprise automation & AI consulting",
    ],
    pos: { top: 122, left: 452 },
  },
  {
    id: "pulse",
    title: "AIMIKO Pulse",
    sub: "Talk to your data",
    desc: "Upload business data and get instant natural language SQL, auto KPI insights, reports, and forecasts.",
    route: "/business-analysis",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: AnalyzerIcon,
    features: [
      "Talk to SQL, CSV & business datasets",
      "Automated AI insights, forecasts & KPI reports",
      "Executive recommendations & chart intelligence",
    ],
    pos: { top: 334, left: 500 },
  },
  {
    id: "aimigo",
    title: "AIMIGO",
    sub: "Travel with me...",
    desc: "One intelligent AI orchestration layer to plan, compare, and coordinate journeys across transit, cabs, and last-mile EV.",
    route: "/move",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: MoveIcon,
    features: [
      "Multi-provider mobility comparison (Metro, Cabs, EV)",
      "Synchronized transfer optimization & zero platform wait",
      "Daily commute intelligence & surge avoidance",
    ],
    pos: { top: 503, left: 364 },
  },
  {
    id: "learn",
    title: "AIMIKO Learn",
    sub: "Dont learn......",
    desc: "24/7 personalized AI study tutor, step-by-step problem solver, assignment help, and curriculum mastery.",
    route: "/learn",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: SchoolIcon,
    features: [
      "Personalized 24/7 AI tutoring & study coach",
      "Teacher assignment generator & grading tools",
      "Comprehensive student, parent & admin analytics",
    ],
    pos: { top: 503, left: 148 },
  },
  {
    id: "commerce",
    title: "AIMIKO Commerce",
    sub: "Shop smart. Sell faster.",
    desc: "AI shopping assistants, 24/7 sales agents, store personalization, customer insights, and commerce analytics.",
    route: "/commerce",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: CommerceIcon,
    features: [
      "AI shopping assistants & 24/7 sales agents",
      "Real-time storefront personalization engine",
      "Customer behavioral insights & marketing analytics",
    ],
    pos: { top: 334, left: 12 },
  },
  {
    id: "miko",
    title: "MIKO",
    sub: "AI that actually acts",
    desc: "Turns your intentions into real-world actions — understands, plans, compares options, asks permission, and executes.",
    route: "/miko",
    color: "#7c3aed",
    bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)",
    Icon: MikoIcon,
    features: [
      "Autonomous task planning & multi-service execution",
      "Permission-first architecture & spending controls",
      "Cross-ecosystem integration (Buddy, Works, Pulse, AIMIGO)",
    ],
    pos: { top: 122, left: 61 },
  },
];

/* ─── Orbit config ────────────────────────────────────────────────────────── */
const ORBIT_SIZE = 660;
const ORBIT_R    = 250;
const ORBIT_CX   = 330;
const ORBIT_CY   = 330;
const ORBIT_SPEED = "34s";

/* ─── Pastel Ecosystem Canvas Node Colors ────────────────────────── */
const PASTEL_COLORS = [
  'rgba(167, 139, 250, 0.75)',
  'rgba(244, 114, 182, 0.75)',
  'rgba(96, 165, 250, 0.75)',
  'rgba(45, 212, 191, 0.75)',
  'rgba(192, 132, 252, 0.75)',
  'rgba(56, 189, 248, 0.75)',
  'rgba(244, 114, 182, 0.75)',
];

export default function Welcome() {
  const navigate = useNavigate();
  const featuresRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [showOpening, setShowOpening] = useState(true);
  const [isAwakening, setIsAwakening] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string|null>(null);

  // Auto progression: fading writing reveal -> automatic snappy swipe up transition
  useEffect(() => {
    const awakenTimer = setTimeout(() => setIsAwakening(true), 150);
    const autoEnterTimer = setTimeout(triggerEnter, 2600);
    return () => {
      clearTimeout(awakenTimer);
      clearTimeout(autoEnterTimer);
    };
  }, []);

  const triggerEnter = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => setShowOpening(false), 850);
  };

  const scrollToFeatures = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (featuresRef.current) {
      const navHeight = 64;
      const targetTop = featuresRef.current.offsetTop - navHeight;
      window.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  };

  // Light-Mode Abstract Ecosystem Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H / 2;

    // 7 primary ecosystem nodes orbiting smoothly
    const primaryNodes = Array.from({ length: 7 }, (_, i) => {
      const baseAngle = (i * (360 / 7) - 90) * (Math.PI / 180);
      return {
        baseAngle,
        radius: 170,
        r: 5.5,
        color: PASTEL_COLORS[i],
        speed: 0.003,
      };
    });

    // Secondary organic micro-points
    const microPoints = Array.from({ length: 18 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: Math.random() * 220 + 80,
      r: Math.random() * 2.2 + 1.2,
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
      speed: (Math.random() * 0.004 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    }));

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, W, H);

      // Compute current positions of 5 primary ecosystem points
      const pPositions = primaryNodes.map((pn) => {
        pn.baseAngle += pn.speed;
        return {
          x: cx + Math.cos(pn.baseAngle) * pn.radius,
          y: cy + Math.sin(pn.baseAngle) * (pn.radius * 0.82),
          r: pn.r,
          color: pn.color,
        };
      });

      // Compute current positions of micro-points
      const mPositions = microPoints.map((mp) => {
        mp.angle += mp.speed;
        return {
          x: cx + Math.cos(mp.angle) * mp.radius,
          y: cy + Math.sin(mp.angle) * (mp.radius * 0.8),
          r: mp.r,
          color: mp.color,
        };
      });

      const allPoints = [...pPositions, ...mPositions];

      // Draw delicate translucent organic connecting lines
      for (let i = 0; i < allPoints.length; i++) {
        for (let j = i + 1; j < allPoints.length; j++) {
          const dx = allPoints[i].x - allPoints[j].x;
          const dy = allPoints[i].y - allPoints[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            const alpha = (1 - d / 180) * 0.18;
            ctx.beginPath();
            ctx.moveTo(allPoints[i].x, allPoints[i].y);
            ctx.lineTo(allPoints[j].x, allPoints[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();
          }
        }
      }

      // Draw soft luminous halos & points
      allPoints.forEach((pt) => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = pt.color.replace('0.75', '0.08');
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.color;
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const ringDots = Array.from({ length: 30 }).map((_, i) => {
    const a = ((i * 12) - 90) * Math.PI / 180;
    return { cx: ORBIT_CX + Math.cos(a) * ORBIT_R, cy: ORBIT_CY + Math.sin(a) * ORBIT_R };
  });

  const [activeNavDropdown, setActiveNavDropdown] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif", overflowX: "clip" }}>

      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(180px); opacity: 0; }
        }
        @keyframes radar-sweep {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes particle-flow {
          0% { stroke-dashoffset: 120; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes beam-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes float-bubble {
          0% { transform: translateY(20px) scale(0.9); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(-25px) scale(1); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.08); opacity: 0.3; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes line-trace {
          0% { stroke-dashoffset: 300; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes pulse-dot {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════════
          ULTRA-PREMIUM LIGHT-MODE OPENING EXPERIENCE
      ══════════════════════════════════════════════════════════════════════ */}
      {showOpening && (
        <div
          onClick={triggerEnter}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "linear-gradient(135deg, #fdfbfe 0%, #f7f2fe 30%, #fcf0f7 65%, #f0f6ff 100%)",
            cursor: "pointer",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 1.1s cubic-bezier(0.77,0,0.175,1), opacity 1.1s ease",
            transform: isTransitioning ? "translateY(-100%)" : "translateY(0)",
            opacity: isTransitioning ? 0.88 : 1,
          }}
        >
          {/* Subtle breathing background atmospheric aura */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 720,
              height: 460,
              borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, rgba(221, 205, 255, 0.42) 0%, rgba(252, 215, 240, 0.32) 40%, rgba(215, 235, 255, 0.22) 70%, transparent 88%)",
              pointerEvents: "none",
              zIndex: 1,
              filter: "blur(40px)",
              transition: "opacity 2.5s ease, transform 3s ease",
              opacity: isAwakening ? 1 : 0.3,
            }}
          />

          {/* Organic Abstract Ecosystem Canvas */}
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              opacity: isAwakening ? 1 : 0,
              transition: "opacity 2s ease",
            }}
          />

          {/* Central Sophisticated Wordmark with Fading Writing Reveal */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              textAlign: "center",
              transition: "transform 0.85s cubic-bezier(0.77,0,0.175,1), opacity 0.85s ease",
              transform: isTransitioning ? "translateY(-40px) scale(0.95)" : "scale(1)",
            }}
          >
            <h1
              style={{
                fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,sans-serif",
                fontWeight: 700,
                fontSize: "clamp(3.8rem,8.5vw,7.2rem)",
                letterSpacing: isAwakening ? "0.38em" : "0.55em",
                textIndent: "0.38em",
                color: "#0c0c18",
                margin: 0,
                userSelect: "none",
                transition: "opacity 1.8s cubic-bezier(0.25,1,0.5,1), filter 1.8s cubic-bezier(0.25,1,0.5,1), letter-spacing 1.8s cubic-bezier(0.25,1,0.5,1)",
                filter: isAwakening ? "blur(0px)" : "blur(14px)",
                opacity: isAwakening ? 0.95 : 0,
              }}
            >
              AIMIKO
            </h1>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN LANDING PAGE
      ══════════════════════════════════════════════════════════════════════ */}
      <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#fdf8ff 0%,#f8f0ff 30%,#fff2fb 60%,#fdf8ff 100%)" }}>

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <MainNavbar onProductsClick={scrollToFeatures} />

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1400, margin: "0 auto", padding: "0 2.5rem", minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", gap: "1.5rem", position: "relative", zIndex: 1, overflow: "visible" }}>
          {/* LEFT: Copy */}
          <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#7c3aed", fontWeight: 600, fontSize: 13 }}>
              <span style={{ color: "#e91e8c" }}>✦</span> AI THAT WORKS FOR YOU
            </div>
            <div>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(2rem,3.2vw,3.3rem)", letterSpacing: "-0.04em", lineHeight: 1.06, color: "#0c0c18", margin: 0 }}>One AI Ecosystem.</h1>
              <h1 style={{ fontWeight: 900, fontSize: "clamp(2rem,3.2vw,3.3rem)", letterSpacing: "-0.04em", lineHeight: 1.06, margin: "4px 0 0" }}>
                <span style={{ color: "#0c0c18" }}>Limitless </span>
                <span style={{ color: "#e91e8c" }}>Possibilities.</span>
              </h1>
            </div>
            <p style={{ color: "#6b6b80", fontSize: 15, lineHeight: 1.72, maxWidth: 400, margin: 0 }}>
              AIMIKO is your all-in-one AI ecosystem designed to empower individuals, businesses, and organizations to think bigger, work smarter, and grow faster.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={scrollToFeatures}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#0c0c18", color: "white", fontWeight: 700, fontSize: 14, border: "none", borderRadius: 12, padding: "13px 24px", cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Explore AIMIKO <ArrowUpRight size={15} />
              </button>
              <button
                onClick={scrollToFeatures}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", color: "#3d3d52", fontWeight: 600, fontSize: 14, border: "1.5px solid rgba(139,92,246,0.22)", borderRadius: 12, padding: "12px 20px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.5)";
                  (e.currentTarget as HTMLElement).style.color = "#0c0c18";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.22)";
                  (e.currentTarget as HTMLElement).style.color = "#3d3d52";
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid rgba(139,92,246,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Play size={11} fill="#7c3aed" color="#7c3aed" />
                </div>
                Watch Overview
              </button>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>
                <span style={{ color: "#7c3aed" }}>5 Powerful Products.</span>
                <span style={{ color: "#e91e8c" }}> 1 Seamless Ecosystem.</span>
              </div>
              <div style={{ color: "#8888a0", fontSize: 12.5, fontWeight: 500, letterSpacing: "0.02em" }}>
                Integrated &nbsp;•&nbsp; Intelligent &nbsp;•&nbsp; Scalable &nbsp;•&nbsp; Secure &nbsp;•&nbsp; Future-Ready
              </div>
            </div>
          </div>

          {/* RIGHT: ORBIT HUB */}
          <div style={{ flex: "0 0 60%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", minHeight: 620, overflow: "visible" }}>
            <div style={{ position: "absolute", top: "5%", left: "5%", right: "-5%", bottom: "5%", background: "radial-gradient(ellipse at 52% 46%,rgba(255,190,240,0.55) 0%,rgba(210,180,255,0.42) 30%,rgba(255,200,235,0.28) 55%,transparent 72%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ position: "relative", width: ORBIT_SIZE, height: ORBIT_SIZE, flexShrink: 0, overflow: "visible" }}>
              <div style={{ position: "absolute", top: 0, left: 0, width: ORBIT_SIZE, height: ORBIT_SIZE, animation: `orbit-spin ${ORBIT_SPEED} linear infinite`, overflow: "visible" }}>
                <svg style={{ position: "absolute", top: 0, left: 0, width: ORBIT_SIZE, height: ORBIT_SIZE, pointerEvents: "none", overflow: "visible" }}>
                  <defs>
                    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#c4b0f8" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#f0b8d8" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#c4b0f8" stopOpacity="0.55" />
                    </linearGradient>
                  </defs>
                  <circle cx={ORBIT_CX} cy={ORBIT_CY} r={ORBIT_R} fill="none" stroke="url(#ringGrad)" strokeWidth="1.8" />
                  {ringDots.map((d, i) => (
                    <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill="rgba(196,176,240,0.5)" />
                  ))}
                </svg>

                {PRODUCTS.map((p) => {
                  const isHov = hoveredCard === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(p.route)}
                      onMouseEnter={() => setHoveredCard(p.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        position: "absolute",
                        top: p.pos.top,
                        left: p.pos.left,
                        width: 148,
                        height: 104,
                        boxSizing: "border-box",
                        padding: "10px 10px 10px",
                        cursor: "pointer",
                        background: isHov ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.92)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255,255,255,0.95)",
                        borderRadius: 20,
                        boxShadow: isHov
                          ? `0 16px 44px rgba(139,92,246,0.18),0 4px 16px rgba(0,0,0,0.09)`
                          : "0 8px 24px rgba(139,92,246,0.10),0 2px 6px rgba(0,0,0,0.05)",
                        transition: "box-shadow 0.2s,transform 0.2s,background 0.2s",
                        transform: isHov ? "scale(1.06)" : "scale(1)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        gap: 4,
                        zIndex: 10,
                        animation: `counter-spin ${ORBIT_SPEED} linear infinite`,
                      }}
                    >
                      <p.Icon />
                      <div style={{ fontWeight: 800, fontSize: 12.5, color: "#0c0c18", lineHeight: 1.2 }}>{p.title}</div>
                      <div style={{ fontSize: 10, color: "#8888a0", lineHeight: 1.3, whiteSpace: "pre-line" }}>{p.sub}</div>
                    </div>
                  );
                })}
              </div>

              {/* CENTER 3D GLOSSY SPHERE */}
              <div
                onClick={() => navigate("/buddy")}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: 186,
                  height: 186,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 36% 30%,
                    rgba(255,255,255,0.98) 0%,
                    rgba(242,235,255,0.93) 22%,
                    rgba(222,210,252,0.88) 48%,
                    rgba(202,188,245,0.85) 72%,
                    rgba(182,168,238,0.82) 100%
                  )`,
                  boxShadow: `
                    inset -12px -14px 26px rgba(100,80,200,0.13),
                    inset 10px 10px 22px rgba(255,255,255,0.92),
                    0 30px 80px rgba(139,92,246,0.28),
                    0 10px 32px rgba(0,0,0,0.10)
                  `,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 20,
                  cursor: "pointer",
                  transition: "box-shadow 0.25s,transform 0.25s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translate(-50%,-50%) scale(1.04)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.transform = "translate(-50%,-50%) scale(1)";
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: "-0.02em", color: "#3d3050" }}>AIMIKO</span>
                <span style={{ fontSize: 12, color: "#9090b0", fontWeight: 500, marginTop: 4 }}>AI Ecosystem</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ────────────────────────────────────────────────────── */}
        <div ref={featuresRef} style={{ background: "rgba(255,255,255,0.58)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(139,92,246,0.08)", padding: "1.6rem 2.5rem 5rem" }}>
          <div style={{ maxWidth: 1140, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "2.2rem" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 9999, background: "rgba(124,58,237,0.07)", color: "#7c3aed", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 16 }}>
                <Sparkles size={13} /> PRODUCTS & SERVICES
              </div>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(1.9rem,3.2vw,2.8rem)", letterSpacing: "-0.04em", color: "#0c0c18", margin: "0 0 14px" }}>
                Everything you need,<br /><span style={{ color: "#7c3aed" }}>all in one place.</span>
              </h2>
              <p style={{ color: "#6b6b80", fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
                Each AIMIKO product is fully integrated — share data, workflows, and AI intelligence seamlessly across the entire ecosystem.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.4rem" }}>
              {PRODUCTS.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate(p.route)}
                  style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1.4fr" : "1.4fr 1fr", gap: "2.5rem", background: "rgba(255,255,255,0.92)", border: "1px solid rgba(139,92,246,0.09)", borderRadius: 24, padding: "2.5rem", cursor: "pointer", transition: "transform 0.22s,box-shadow 0.22s,border-color 0.22s", alignItems: "center" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-3px)";
                    el.style.boxShadow = `0 20px 50px ${p.color}18`;
                    el.style.borderColor = `${p.color}22`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "none";
                    el.style.borderColor = "rgba(139,92,246,0.09)";
                  }}
                >
                  <div style={{ order: i % 2 === 0 ? 0 : 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                      <div style={{ padding: 12, borderRadius: 16, background: p.bg, flexShrink: 0 }}><p.Icon /></div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 20, color: "#0c0c18", letterSpacing: "-0.03em" }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: p.color, fontWeight: 600, marginTop: 3 }}>{p.sub.replace("\n", " ")}</div>
                      </div>
                    </div>
                    <p style={{ color: "#6b6b80", fontSize: 14.5, lineHeight: 1.72, marginBottom: 20 }}>{p.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                      {p.features.map((f) => (
                        <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "#3d3d52" }}>
                          <CheckCircle2 size={15} color={p.color} style={{ flexShrink: 0 }} />{f}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(p.route); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#0c0c18", color: "white", fontWeight: 700, fontSize: 14, border: "none", borderRadius: 12, padding: "12px 22px", cursor: "pointer", transition: "opacity 0.15s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                    >
                      Open {p.title} <ChevronRight size={14} />
                    </button>
                  </div>
                  {/* ── 5 PURE FUTURISTIC ANIMATED MOTION GRAPHICS ── */}
                  <div
                    style={{
                      order: i % 2 === 0 ? 1 : 0,
                      height: 250,
                      width: "100%",
                      borderRadius: 22,
                      background: `linear-gradient(135deg, ${p.bg} 0%, rgba(255,255,255,0.95) 100%)`,
                      position: "relative",
                      overflow: "hidden",
                      border: `1.5px solid ${p.color}18`,
                      boxShadow: `0 18px 45px ${p.color}12, inset 0 2px 10px rgba(255,255,255,0.8)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {/* Pillar Badge */}
                    <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 12px", borderRadius: 9999, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)", fontSize: 11, fontWeight: 700, color: p.color, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", zIndex: 10 }}>
                      Product 0{i + 1}
                    </div>

                    {/* ── 1. AIMIKO BUDDY: LIVE NEURAL PULSE & AI COACH CORE ── */}
                    {(p.id === "buddy" || p.id === "life") && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(236,72,153,0.3)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 20 40 Q 70 80 120 80 T 220 120" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="2" strokeDasharray="6 6" />
                          <path d="M 30 130 Q 80 80 120 80 T 210 30" fill="none" stroke="rgba(236,72,153,0.3)" strokeWidth="2" strokeDasharray="6 6" />
                          <path d="M 20 40 Q 70 80 120 80 T 220 120" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3s linear infinite" }} />
                          <path d="M 30 130 Q 80 80 120 80 T 210 30" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 2.5s linear infinite reverse" }} />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(124,58,237,0.2)", padding: "6px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#7c3aed", animation: "float 3s ease-in-out infinite" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8" }} />
                          AI Buddy Active
                        </div>

                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(236,72,153,0.25)", padding: "6px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(236,72,153,0.15)", fontSize: 11, fontWeight: 700, color: "#db2777", animation: "float 3.5s ease-in-out 0.5s infinite" }}>
                          ✦ Habit: 87% Completed
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(124,58,237,0.25)",
                            boxShadow: "0 14px 35px rgba(124,58,237,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_life.png"
                              alt="AIMIKO Buddy"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 2. AIMIKO WORKS: LIVE NEURAL AGENT NETWORK ── */}
                    {(p.id === "works" || p.id === "agency") && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(6,182,212,0.3)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 20 50 Q 80 110 130 70 T 220 110" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="2" strokeDasharray="6 6" />
                          <path d="M 30 110 Q 80 40 130 90 T 210 50" fill="none" stroke="rgba(6,182,212,0.3)" strokeWidth="2" strokeDasharray="6 6" />
                          <path d="M 20 50 Q 80 110 130 70 T 220 110" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3s linear infinite" }} />
                          <path d="M 30 110 Q 80 40 130 90 T 210 50" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 2.5s linear infinite reverse" }} />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(124,58,237,0.2)", padding: "6px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(124,58,237,0.12)", display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "#7c3aed", animation: "float 3s ease-in-out infinite" }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 8px #ec4899" }} />
                          AI Workforce Active
                        </div>

                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(6,182,212,0.25)", padding: "6px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(6,182,212,0.15)", fontSize: 11, fontWeight: 700, color: "#0284c7", animation: "float 3.5s ease-in-out 0.5s infinite" }}>
                          1,420 Tasks Automated
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(124,58,237,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(6,182,212,0.3)",
                            boxShadow: "0 14px 35px rgba(6,182,212,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_agency.png"
                              alt="AIMIKO Works"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 3. AIMIKO PULSE: LIVE DATA WAVE & SQL STREAM ── */}
                    {(p.id === "pulse" || p.id === "analyzer") && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(236,72,153,0.3)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 10 95 Q 65 35 125 80 T 230 45" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="2.5" />
                          <path d="M 10 95 Q 65 35 125 80 T 230 45" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3s linear infinite" }} />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(6,182,212,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(6,182,212,0.12)", fontSize: 11, fontWeight: 800, color: "#0284c7", animation: "float 3.2s ease-in-out infinite" }}>
                          Talk to Data: 0.04s SQL
                        </div>
                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(236,72,153,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(236,72,153,0.15)", fontSize: 11, fontWeight: 800, color: "#db2777", animation: "float 3.6s ease-in-out 0.6s infinite" }}>
                          AI Forecast: +28.4% MRR
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(124,58,237,0.25)",
                            boxShadow: "0 14px 35px rgba(124,58,237,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_analyzer.png"
                              alt="AIMIKO Pulse"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 4. AIMIKO LEARN: LIVE TUTOR MATRIX & KNOWLEDGE RESONANCE ── */}
                    {(p.id === "learn" || p.id === "school") && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(6,182,212,0.3)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 10 90 Q 60 20 120 80 T 230 40" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="2.5" />
                          <path d="M 10 90 Q 60 20 120 80 T 230 40" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3s linear infinite" }} />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(124,58,237,0.2)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(124,58,237,0.12)", fontSize: 11, fontWeight: 800, color: "#7c3aed", animation: "float 3.2s ease-in-out infinite" }}>
                          Instant AI Study Coach
                        </div>
                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(236,72,153,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(236,72,153,0.15)", fontSize: 11, fontWeight: 800, color: "#db2777", animation: "float 3.6s ease-in-out 0.6s infinite" }}>
                          24/7 Tutor: 94% Mastery
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.35) 0%, rgba(236,72,153,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(124,58,237,0.25)",
                            boxShadow: "0 14px 35px rgba(124,58,237,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_school.png"
                              alt="AIMIKO Learn"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 5. AIMIKO COMMERCE: LIVE TRANSACTION STREAM & RADAR ── */}
                    {p.id === "commerce" && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(236,72,153,0.3)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 10 120 Q 70 40 130 90 T 230 30" fill="none" stroke="rgba(236,72,153,0.3)" strokeWidth="2.5" />
                          <path d="M 10 120 Q 70 40 130 90 T 230 30" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3s linear infinite" }} />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(236,72,153,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(236,72,153,0.15)", fontSize: 11, fontWeight: 800, color: "#db2777", animation: "float 3s ease-in-out infinite" }}>
                          +$149.00 AI Upsell
                        </div>
                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "linear-gradient(135deg,#ec4899,#7c3aed)", color: "white", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(124,58,237,0.35)", fontSize: 11, fontWeight: 800, animation: "float 3.5s ease-in-out 0.5s infinite" }}>
                          +18.4% Sales Lift
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(236,72,153,0.35) 0%, rgba(124,58,237,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(236,72,153,0.3)",
                            boxShadow: "0 14px 35px rgba(236,72,153,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_commerce.png"
                              alt="AIMIKO Commerce"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 6. AIMIGO: LIVE MULTI-LEG TRANSIT STREAM & ORCHESTRATION ── */}
                    {(p.id === "aimigo" || p.id === "move") && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(56,189,248,0.35)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <path d="M 15 130 C 60 130, 80 40, 140 40 C 190 40, 200 110, 230 110" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="2.5" />
                          <path d="M 15 130 C 60 130, 80 40, 140 40 C 190 40, 200 110, 230 110" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeDasharray="35 170" style={{ animation: "particle-flow 3s linear infinite" }} />
                          <circle cx="20" cy="130" r="4" fill="#38bdf8" />
                          <circle cx="95" cy="80" r="4" fill="#ec4899" />
                          <circle cx="140" cy="40" r="4" fill="#7c3aed" />
                          <circle cx="225" cy="110" r="4" fill="#38bdf8" />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(56,189,248,0.3)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(56,189,248,0.15)", fontSize: 11, fontWeight: 800, color: "#0284c7", animation: "float 3s ease-in-out infinite" }}>
                          Multi-Leg Sync: 38 min
                        </div>
                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(236,72,153,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(236,72,153,0.15)", fontSize: 11, fontWeight: 800, color: "#db2777", animation: "float 3.5s ease-in-out 0.5s infinite" }}>
                          -430g CO₂ Offset
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.35) 0%, rgba(124,58,237,0.2) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(56,189,248,0.3)",
                            boxShadow: "0 14px 35px rgba(56,189,248,0.2), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_move.png"
                              alt="AIMIGO"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── 7. MIKO: LIVE AUTONOMOUS AGENT ACTION LOOP ── */}
                    {p.id === "miko" && (
                      <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <div style={{ position: "absolute", width: 130, height: 130, borderRadius: "50%", border: "2px solid rgba(236,72,153,0.35)", animation: "pulse-ring 3s ease-out infinite" }} />
                        <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", border: "1.5px dashed rgba(124,58,237,0.35)", animation: "pulse-ring 3s ease-out 1s infinite" }} />

                        <svg viewBox="0 0 240 160" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                          <ellipse cx="120" cy="80" rx="90" ry="50" fill="none" stroke="rgba(236,72,153,0.25)" strokeWidth="2" strokeDasharray="6 6" />
                          <ellipse cx="120" cy="80" rx="90" ry="50" fill="none" stroke="#ec4899" strokeWidth="2.5" strokeDasharray="30 180" style={{ animation: "particle-flow 3.5s linear infinite" }} />
                          <circle cx="30" cy="80" r="3.5" fill="#38bdf8" />
                          <circle cx="120" cy="30" r="3.5" fill="#7c3aed" />
                          <circle cx="210" cy="80" r="3.5" fill="#ec4899" />
                          <circle cx="120" cy="130" r="3.5" fill="#10b981" />
                        </svg>

                        <div style={{ position: "absolute", top: 18, left: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(16,185,129,0.3)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(16,185,129,0.15)", fontSize: 11, fontWeight: 800, color: "#059669", animation: "float 3s ease-in-out infinite" }}>
                          Action Approved: ₹76
                        </div>
                        <div style={{ position: "absolute", bottom: 18, right: 16, background: "rgba(255,255,255,0.94)", backdropFilter: "blur(8px)", border: "1px solid rgba(124,58,237,0.25)", padding: "5px 12px", borderRadius: 12, boxShadow: "0 6px 16px rgba(124,58,237,0.15)", fontSize: 11, fontWeight: 800, color: "#7c3aed", animation: "float 3.5s ease-in-out 0.5s infinite" }}>
                          Permission Verified
                        </div>

                        {/* Center Mascot Showcase Badge */}
                        <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", animation: "float 3s ease-in-out infinite" }}>
                          <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.4) 0%, rgba(236,72,153,0.25) 60%, transparent 80%)", filter: "blur(14px)", zIndex: -1 }} />
                          <div style={{
                            width: 86,
                            height: 86,
                            borderRadius: 24,
                            background: "rgba(255,255,255,0.96)",
                            backdropFilter: "blur(16px)",
                            WebkitBackdropFilter: "blur(16px)",
                            border: "1.5px solid rgba(124,58,237,0.28)",
                            boxShadow: "0 14px 35px rgba(124,58,237,0.22), 0 4px 12px rgba(0,0,0,0.06)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 6,
                          }}>
                            <img
                              src="/brand/mascot_miko.png"
                              alt="MIKO Agent"
                              style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 18 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <div style={{ padding: "6rem 2.5rem", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2 style={{ fontWeight: 900, fontSize: "clamp(1.8rem,3vw,2.6rem)", letterSpacing: "-0.04em", color: "#0c0c18", margin: "0 0 12px" }}>
                How <span style={{ color: "#7c3aed" }}>AIMIKO</span> works
              </h2>
              <p style={{ color: "#6b6b80", fontSize: 15, maxWidth: 400, margin: "0 auto" }}>Three simple steps to unlock the full power of the AIMIKO ecosystem.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.4rem" }}>
              {[
                { num: "01", title: "Choose your role & age", body: "AIMIKO adapts its interface, AI tools, and tone entirely to who you are — student, founder, developer, or senior.", icon: <Users size={22} color="#7c3aed" /> },
                { num: "02", title: "Connect your products", body: "Buddy, Works, Pulse, AIMIGO, MIKO, Learn, Commerce — integrate any combination. Your data and workflows flow seamlessly between them.", icon: <Zap size={22} color="#7c3aed" /> },
                { num: "03", title: "Let AI do the heavy lifting", body: "From writing to analysis, to autonomous agents, to real-time tutoring — AIMIKO handles it while you focus on results.", icon: <Sparkles size={22} color="#7c3aed" /> },
              ].map((s) => (
                <div key={s.num} style={{ padding: "2rem", background: "rgba(255,255,255,0.86)", border: "1px solid rgba(139,92,246,0.09)", borderRadius: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ padding: 10, borderRadius: 14, background: "rgba(124,58,237,0.08)" }}>{s.icon}</div>
                    <span style={{ fontWeight: 900, fontSize: 32, color: "rgba(124,58,237,0.2)", letterSpacing: "-0.05em" }}>{s.num}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 18, color: "#0c0c18", letterSpacing: "-0.025em", marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ color: "#6b6b80", fontSize: 14, lineHeight: 1.72, margin: 0 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <div style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(139,92,246,0.07)", borderBottom: "1px solid rgba(139,92,246,0.07)", padding: "4rem 2.5rem" }}>
          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "2rem", textAlign: "center" }}>
            {[{ val: "7+", label: "Integrated Products" }, { val: "50K+", label: "Active Users" }, { val: "99.9%", label: "Platform Uptime" }, { val: "10x", label: "Faster AI Workflows" }].map((s) => (
              <div key={s.val}>
                <div style={{ fontWeight: 900, fontSize: "2.4rem", letterSpacing: "-0.04em", color: "#7c3aed", lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: "#6b6b80", fontWeight: 500, marginTop: 6 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <div style={{ padding: "6rem 2.5rem", textAlign: "center" }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "6px 18px", borderRadius: 9999, background: "rgba(124,58,237,0.08)", color: "#7c3aed", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 20 }}>
              <Shield size={13} /> ENTERPRISE-READY · SOC 2 COMPLIANT
            </div>
            <h2 style={{ fontWeight: 900, fontSize: "clamp(2rem,3.2vw,2.8rem)", letterSpacing: "-0.04em", color: "#0c0c18", margin: "0 0 14px" }}>
              Ready to build with <span style={{ color: "#7c3aed" }}>AIMIKO?</span>
            </h2>
            <p style={{ color: "#6b6b80", fontSize: 15, lineHeight: 1.72, marginBottom: 32 }}>Join thousands of individuals and enterprises already using AIMIKO to think bigger, work smarter, and grow faster.</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/buddy")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "#0c0c18", color: "white", fontWeight: 700, fontSize: 15, border: "none", borderRadius: 14, padding: "15px 30px", cursor: "pointer", transition: "opacity 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Get Started Free <ArrowUpRight size={16} />
              </button>
              <button
                onClick={() => navigate("/agency")}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", color: "#3d3d52", fontWeight: 600, fontSize: 15, border: "1.5px solid rgba(139,92,246,0.22)", borderRadius: 14, padding: "14px 26px", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.48)";
                  (e.currentTarget as HTMLElement).style.color = "#0c0c18";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.22)";
                  (e.currentTarget as HTMLElement).style.color = "#3d3d52";
                }}
              >
                <BarChart3 size={15} color="#7c3aed" /> Enterprise Demo
              </button>
            </div>
          </div>
        </div>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer style={{ borderTop: "1px solid rgba(139,92,246,0.07)", padding: "2rem 2.5rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontWeight: 900, fontSize: 17, letterSpacing: "-0.03em", color: "#0c0c18" }}>AIMIKO</span>
            <div style={{ display: "flex", gap: "1.4rem" }}>
              {[
                ["Pricing", "/pricing"],
                ["Resources", "/resources"],
                ["About", "/about"],
                ["Privacy", "/privacy"],
                ["Terms", "/terms"],
                ["Buddy", "/buddy"],
                ["Works", "/works"],
                ["Pulse", "/pulse"],
                ["AIMIGO", "/aimigo"],
                ["Learn", "/learn"],
                ["Commerce", "/commerce"],
                ["MIKO", "/miko"],
              ].map(([l, r]) => (
                <button
                  key={l}
                  onClick={() => navigate(r)}
                  style={{ background: "none", border: "none", color: "#9999aa", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "color 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#0c0c18")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9999aa")}
                >
                  {l}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 12, color: "#c5c5d2" }}>© 2026 AIMIKO Ecosystem. All rights reserved.</span>
          </div>
        </footer>
      </div>

      <AimikoGuideChatbot />
    </div>
  );
}
