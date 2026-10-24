import React, { useEffect, useRef, useState } from "react";
import { Download, Sparkles, CheckCircle2 } from "lucide-react";

export interface AimikoCardProps {
  name: string;
  queueNumber: number;
  poseId: number; // 1 to 5
  onCardRendered?: (dataUrl: string) => void;
}

export const POSE_CONFIGS: Record<
  number,
  {
    name: string;
    tagline: string;
    description: string;
    imagePath: string;
    nameStyle: {
      type: "tshirt" | "badge" | "ribbon" | "sticker" | "marquee";
      yPercent: number; // Y position as percentage of 1080
      fontSize: number;
      fontColor: string;
      letterSpacing: number;
      archFactor?: number;
    };
  }
> = {
  1: {
    name: "The Classic",
    tagline: "Standing Bold & Confident",
    description: "The timeless AIMIKO silhouette with an early collector badge.",
    imagePath: "/assets/mascot/pose1.png",
    nameStyle: {
      type: "badge",
      yPercent: 0.88,
      fontSize: 44,
      fontColor: "#ffffff",
      letterSpacing: 4,
    },
  },
  2: {
    name: "The Welcome",
    tagline: "Waving Hello to the Future",
    description: "Warm, friendly welcome into the exclusive early circle.",
    imagePath: "/assets/mascot/pose2.png",
    nameStyle: {
      type: "ribbon",
      yPercent: 0.86,
      fontSize: 42,
      fontColor: "#ffffff",
      letterSpacing: 3,
    },
  },
  3: {
    name: "The Personal One",
    tagline: "Your Name on the Oversized T-Shirt",
    description: "Turned around with your name screen-printed across the cotton back.",
    imagePath: "/assets/mascot/pose3.png",
    nameStyle: {
      type: "tshirt",
      yPercent: 0.44, // Upper back across shoulder blades
      fontSize: 48,
      fontColor: "#3b2c21", // Warm screenprint ink color
      letterSpacing: 6,
      archFactor: 0.05,
    },
  },
  4: {
    name: "The Hype One",
    tagline: "Official Thumbs-Up of Approval",
    description: "Energy, excitement, and guaranteed priority entry.",
    imagePath: "/assets/mascot/pose4.png",
    nameStyle: {
      type: "sticker",
      yPercent: 0.88,
      fontSize: 42,
      fontColor: "#ffffff",
      letterSpacing: 3,
    },
  },
  5: {
    name: "The Celebration",
    tagline: "Confetti Burst & Festive Vibes",
    description: "Celebrating your day-one status as a digital pioneer.",
    imagePath: "/assets/mascot/pose5.png",
    nameStyle: {
      type: "marquee",
      yPercent: 0.87,
      fontSize: 40,
      fontColor: "#ffffff",
      letterSpacing: 4,
    },
  },
};

export default function AimikoCardCanvas({
  name,
  queueNumber,
  poseId,
  onCardRendered,
}: AimikoCardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const cleanName = (name || "EARLY MEMBER").toUpperCase();
  const config = POSE_CONFIGS[poseId] || POSE_CONFIGS[3];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsRendering(true);
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // Load base mascot image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = config.imagePath;

    const renderCard = (mascotImage?: HTMLImageElement) => {
      // 1. Premium background gradient
      const bgGrad = ctx.createRadialGradient(size / 2, size * 0.45, 100, size / 2, size / 2, size * 0.75);
      bgGrad.addColorStop(0, "#faf6f0");
      bgGrad.addColorStop(0.5, "#f5ede4");
      bgGrad.addColorStop(1, "#ebdcd0");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, size, size);

      // Subtle background grid / dots
      ctx.fillStyle = "rgba(180, 150, 130, 0.08)";
      for (let x = 40; x < size; x += 40) {
        for (let y = 40; y < size; y += 40) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 2. Draw mascot image if loaded
      if (mascotImage && mascotImage.complete && mascotImage.naturalWidth > 0) {
        ctx.save();
        // Soft drop shadow beneath mascot
        ctx.shadowColor = "rgba(100, 70, 50, 0.12)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 25;
        ctx.drawImage(mascotImage, 0, 0, size, size);
        ctx.restore();
      } else {
        // Fallback artistic placeholder
        ctx.fillStyle = "#8b5cf6";
        ctx.font = "bold 32px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("AIMIKO CHARACTER", size / 2, size / 2);
      }

      // 3. Name stamping logic based on pose
      const { type, yPercent, fontSize, fontColor, letterSpacing } = config.nameStyle;
      const targetY = size * yPercent;
      const targetX = size / 2;

      ctx.save();

      if (type === "tshirt") {
        // --- SCREEN-PRINTED NAME ON T-SHIRT BACK ---
        ctx.font = `900 ${fontSize}px "Outfit", "Inter", -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Slight letter spacing simulation & arch
        ctx.fillStyle = fontColor;
        ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;

        // Draw fabric stitch effect line above & below
        const textWidth = ctx.measureText(cleanName).width + 30;
        ctx.strokeStyle = "rgba(59, 44, 33, 0.18)";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.moveTo(targetX - textWidth / 2, targetY - 32);
        ctx.lineTo(targetX + textWidth / 2, targetY - 32);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(targetX - textWidth / 2, targetY + 32);
        ctx.lineTo(targetX + textWidth / 2, targetY + 32);
        ctx.stroke();

        ctx.setLineDash([]);

        // Main screenprint text with subtle ink texture
        ctx.fillText(cleanName, targetX, targetY);

        // Small streetwear sub-label
        ctx.font = `700 15px "Inter", sans-serif`;
        ctx.fillStyle = "rgba(59, 44, 33, 0.55)";
        ctx.fillText("AIMIKO CLUB • 2026", targetX, targetY + 48);

      } else {
        // --- LUXURY COLLECTOR BANNER FOR OTHER POSES ---
        const bannerWidth = 620;
        const bannerHeight = 88;
        const bannerX = (size - bannerWidth) / 2;
        const bannerY = targetY - bannerHeight / 2;

        // Banner backdrop
        ctx.shadowColor = "rgba(12, 12, 24, 0.15)";
        ctx.shadowBlur = 25;
        ctx.shadowOffsetY = 10;

        const bannerGrad = ctx.createLinearGradient(bannerX, bannerY, bannerX + bannerWidth, bannerY + bannerHeight);
        bannerGrad.addColorStop(0, "#1a1626");
        bannerGrad.addColorStop(0.5, "#251f38");
        bannerGrad.addColorStop(1, "#181424");
        ctx.fillStyle = bannerGrad;

        // Rounded rect for badge
        const r = 24;
        ctx.beginPath();
        ctx.moveTo(bannerX + r, bannerY);
        ctx.lineTo(bannerX + bannerWidth - r, bannerY);
        ctx.quadraticCurveTo(bannerX + bannerWidth, bannerY, bannerX + bannerWidth, bannerY + r);
        ctx.lineTo(bannerX + bannerWidth, bannerY + bannerHeight - r);
        ctx.quadraticCurveTo(bannerX + bannerWidth, bannerY + bannerHeight, bannerX + bannerWidth - r, bannerY + bannerHeight);
        ctx.lineTo(bannerX + r, bannerY + bannerHeight);
        ctx.quadraticCurveTo(bannerX, bannerY + bannerHeight, bannerX, bannerY + bannerHeight - r);
        ctx.lineTo(bannerX, bannerY + r);
        ctx.quadraticCurveTo(bannerX, bannerY, bannerX + r, bannerY);
        ctx.closePath();
        ctx.fill();

        // Gold border stroke
        ctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text inside banner
        ctx.shadowColor = "transparent";
        ctx.font = `800 ${fontSize - 4}px "Outfit", "Inter", sans-serif`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(cleanName, size / 2, targetY - 6);

        // Subtext in banner
        ctx.font = `700 13px "Inter", sans-serif`;
        ctx.fillStyle = "#eab308";
        ctx.fillText(`EARLY ACCESS MEMBER #${queueNumber || 1} • CERTIFIED`, size / 2, targetY + 22);
      }

      ctx.restore();

      // 4. Header Badge: Official AIMIKO Watermark & Queue Number
      ctx.save();
      // Brand pill (top left)
      const pillX = 60;
      const pillY = 60;
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.shadowColor = "rgba(0, 0, 0, 0.06)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, 210, 48, 24);
      ctx.fill();

      ctx.font = `900 18px "Outfit", sans-serif`;
      ctx.fillStyle = "#0c0c18";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("AIMIKO.IN", pillX + 22, pillY + 24);

      ctx.font = `700 12px "Inter", sans-serif`;
      ctx.fillStyle = "#8b5cf6";
      ctx.fillText("GEN-01", pillX + 130, pillY + 24);

      // Queue pill (top right)
      const qText = `MEMBER #${queueNumber || 1}`;
      ctx.font = `800 15px "Inter", sans-serif`;
      const qWidth = ctx.measureText(qText).width + 44;
      const qX = size - 60 - qWidth;
      const qY = 60;

      ctx.fillStyle = "rgba(139, 92, 246, 0.95)";
      ctx.beginPath();
      ctx.roundRect(qX, qY, qWidth, 48, 24);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(qText, qX + qWidth / 2, qY + 24);
      ctx.restore();

      // 5. Outer border frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, size - 16, size - 16);

      // 6. Update state
      const url = canvas.toDataURL("image/png");
      setDataUrl(url);
      setIsRendering(false);
      if (onCardRendered) {
        onCardRendered(url);
      }
    };

    img.onload = () => renderCard(img);
    img.onerror = () => renderCard(); // Render with fallback graphic
  }, [name, queueNumber, poseId]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `AIMIKO-EarlyAccess-${(name || "Member").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
      {/* Canvas container with luxury glass card effect */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/80 bg-white/40 backdrop-blur-md transition-all duration-300 hover:shadow-purple-500/10">
        <canvas
          ref={canvasRef}
          className="w-full h-auto max-w-[420px] aspect-square block rounded-2xl"
          style={{ imageRendering: "auto" }}
        />

        {isRendering && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              Crafting your personal card...
            </div>
          </div>
        )}
      </div>

      {/* Instant Action CTA */}
      <button
        onClick={handleDownload}
        disabled={isRendering || !dataUrl}
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-base shadow-lg shadow-purple-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
      >
        <Download className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
        DOWNLOAD YOUR AIMIKO (HD PNG)
      </button>
    </div>
  );
}
