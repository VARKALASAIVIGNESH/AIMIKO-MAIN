import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, ArrowUpRight, Globe } from "lucide-react";

interface MainNavbarProps {
  onProductsClick?: () => void;
}

export default function MainNavbar({ onProductsClick }: MainNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeNavDropdown, setActiveNavDropdown] = useState<"products" | "solutions" | null>(null);

  const pathname = location.pathname;
  const isPricing = pathname === "/pricing";
  const isResources = pathname === "/resources";
  const isAbout = pathname === "/about";

  const handleProductsClick = () => {
    if (onProductsClick) {
      onProductsClick();
    } else {
      navigate("/");
    }
  };

  return (
    <nav
      style={{
        background: "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(139,92,246,0.09)",
        padding: "0 2.5rem",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
      onMouseLeave={() => setActiveNavDropdown(null)}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        {/* Brand Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            fontWeight: 900,
            fontSize: 20,
            letterSpacing: "-0.04em",
            color: "#0c0c18",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}
        >
          AIMIKO
        </button>

        {/* Center Nav Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
          {/* Products Dropdown Trigger */}
          <button
            onClick={handleProductsClick}
            onMouseEnter={() => setActiveNavDropdown("products")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: activeNavDropdown === "products" ? "#7c3aed" : "#3d3d52",
              fontWeight: 600,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
              padding: "8px 0",
            }}
          >
            Products{" "}
            <ChevronDown
              size={12}
              style={{
                transform: activeNavDropdown === "products" ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {/* Solutions Dropdown Trigger */}
          <button
            onMouseEnter={() => setActiveNavDropdown("solutions")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: activeNavDropdown === "solutions" ? "#7c3aed" : "#3d3d52",
              fontWeight: 600,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
              padding: "8px 0",
            }}
          >
            Solutions{" "}
            <ChevronDown
              size={12}
              style={{
                transform: activeNavDropdown === "solutions" ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>

          {/* Pricing Link */}
          <button
            onClick={() => navigate("/pricing")}
            style={{
              color: isPricing ? "#7c3aed" : "#3d3d52",
              fontWeight: isPricing ? 700 : 500,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isPricing ? "#7c3aed" : "#0c0c18")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isPricing ? "#7c3aed" : "#3d3d52")}
          >
            Pricing
          </button>

          {/* Resources Link */}
          <button
            onClick={() => navigate("/resources")}
            style={{
              color: isResources ? "#7c3aed" : "#3d3d52",
              fontWeight: isResources ? 700 : 500,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isResources ? "#7c3aed" : "#0c0c18")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isResources ? "#7c3aed" : "#3d3d52")}
          >
            Resources
          </button>

          {/* About Link */}
          <button
            onClick={() => navigate("/about")}
            style={{
              color: isAbout ? "#7c3aed" : "#3d3d52",
              fontWeight: isAbout ? 700 : 500,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = isAbout ? "#7c3aed" : "#0c0c18")}
            onMouseLeave={(e) => (e.currentTarget.style.color = isAbout ? "#7c3aed" : "#3d3d52")}
          >
            About
          </button>
        </div>

        {/* Right Section */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "#3d3d52",
              fontWeight: 500,
              fontSize: 13,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <Globe size={13} /> EN <ChevronDown size={11} />
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              color: "#3d3d52",
              fontWeight: 500,
              fontSize: 14,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px 14px",
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/buddy")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#0c0c18",
              color: "white",
              fontWeight: 600,
              fontSize: 14,
              border: "none",
              borderRadius: 10,
              padding: "10px 22px",
              cursor: "pointer",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            Book a Demo <ArrowUpRight size={14} />
          </button>
        </div>

        {/* ── PRODUCTS MEGA DROPDOWN MENU ─────────────────────────────── */}
        {activeNavDropdown === "products" && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: "15%",
              transform: "translateX(-15%)",
              width: 720,
              background: "rgba(255,255,255,0.98)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(139,92,246,0.16)",
              borderRadius: 24,
              boxShadow: "0 28px 70px rgba(139,92,246,0.22), 0 4px 20px rgba(0,0,0,0.06)",
              padding: "1.2rem 1.4rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              zIndex: 100,
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {/* ── 🌟 BIG HIGHLIGHTED MIKO MASTER AGENT BAR ── */}
            <div
              onClick={() => {
                setActiveNavDropdown(null);
                navigate("/miko");
              }}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(236,72,153,0.12) 50%, rgba(56,189,248,0.10) 100%)",
                border: "1.5px solid rgba(124,58,237,0.28)",
                borderRadius: 18,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                boxShadow: "0 6px 20px rgba(124,58,237,0.10)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 14px 34px rgba(124,58,237,0.22)";
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(124,58,237,0.10)";
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.28)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.98)",
                    border: "1.5px solid rgba(124,58,237,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 14px rgba(124,58,237,0.15)",
                    flexShrink: 0,
                  }}
                >
                  <img
                    src="/brand/mascot_miko.png"
                    alt="MIKO"
                    style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 12 }}
                  />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 900, fontSize: 17, color: "#0c0c18", letterSpacing: "-0.03em" }}>
                      MIKO
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        padding: "2px 8px",
                        borderRadius: 9999,
                        background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                        color: "white",
                      }}
                    >
                      Autonomous AI Agent
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6b80", marginTop: 2, fontWeight: 500 }}>
                    <span style={{ color: "#7c3aed", fontWeight: 700 }}>AI that actually acts</span> — Turns intentions into completed real-world actions.
                  </div>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "#7c3aed",
                  background: "rgba(255,255,255,0.95)",
                  padding: "7px 16px",
                  borderRadius: 12,
                  border: "1px solid rgba(124,58,237,0.2)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
              >
                Meet MIKO <ArrowUpRight size={14} />
              </div>
            </div>

            {/* Section Divider */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", marginTop: 2 }}>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", color: "#8b8ba0", textTransform: "uppercase" }}>
                Ecosystem Modules
              </span>
              <span style={{ fontSize: 11, color: "#7c3aed", fontWeight: 600 }}>
                6 Integrated Domains
              </span>
            </div>

            {/* ── 6 DOMAINS IN ORDERED 2-COLUMN GRID ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
              {[
                { id: "buddy", title: "AIMIKO Buddy", sub: "Your AI Buddy", route: "/buddy", icon: "/brand/mascot_life.png", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)" },
                { id: "works", title: "AIMIKO Works", sub: "Your AI Workforce", route: "/works", icon: "/brand/mascot_agency.png", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)" },
                { id: "pulse", title: "AIMIKO Pulse", sub: "Talk to your data", route: "/pulse", icon: "/brand/mascot_analyzer.png", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)" },
                { id: "commerce-nav", title: "AIMIKO Commerce", sub: "Shop smart. Sell faster.", route: "/commerce", icon: "/brand/mascot_commerce.png", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)" },
                { id: "aimigo-nav", title: "AIMIKO Mobility", sub: "Zero-Cut Rides & AutoCommute", route: "/aimigo", icon: "/brand/mascot_move.png", bg: "linear-gradient(135deg,#fef3c7,#fffbeb)" },
                { id: "learn", title: "AIMIKO Learn", sub: "AI-Powered Education", route: "/learn", icon: "/brand/mascot_school.png", bg: "linear-gradient(135deg,#ede9fe,#f5f3ff)" },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setActiveNavDropdown(null);
                    navigate(p.route);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "8px 12px",
                    borderRadius: 14,
                    cursor: "pointer",
                    transition: "background 0.15s, transform 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(124,58,237,0.06)";
                    e.currentTarget.style.transform = "translateX(3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 4, flexShrink: 0 }}>
                    <img src={p.icon} alt={p.title} style={{ width: 32, height: 32, objectFit: "contain", borderRadius: 8 }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: "#0c0c18" }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: "#77778a", marginTop: 2, fontWeight: 500 }}>{p.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SOLUTIONS DROPDOWN MENU ──────────────────────────────────── */}
        {activeNavDropdown === "solutions" && (
          <div
            style={{
              position: "absolute",
              top: 60,
              left: "30%",
              transform: "translateX(-30%)",
              width: 440,
              background: "rgba(255,255,255,0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(139,92,246,0.14)",
              borderRadius: 22,
              boxShadow: "0 24px 60px rgba(139,92,246,0.18), 0 4px 16px rgba(0,0,0,0.06)",
              padding: "1.2rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
              zIndex: 100,
              animation: "fadeIn 0.2s ease-out",
            }}
          >
            {[
              { title: "For Individuals", sub: "Personal AI ecosystem for learning, productivity & careers", route: "/buddy" },
              { title: "For Businesses", sub: "AI agents/employees, enterprise automation & consulting", route: "/works" },
              { title: "For Businesses & Teams", sub: "Data insights, reports, forecasts & KPI recommendations", route: "/pulse" },
              { title: "For Schools & Universities", sub: "AI ecosystem for students, teachers, parents & admins", route: "/learn" },
              { title: "For Stores & E-Commerce", sub: "AI shopping assistants, sales agents & commerce analytics", route: "/commerce" },
            ].map((s) => (
              <div
                key={s.title}
                onClick={() => {
                  setActiveNavDropdown(null);
                  navigate(s.route);
                }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "background 0.15s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(124,58,237,0.06)";
                  e.currentTarget.style.transform = "translateX(2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "none";
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 14, color: "#7c3aed" }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: "#66667a", marginTop: 3 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
