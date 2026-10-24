import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

export interface AimikoPosterProps {
  name: string;
  queueNumber: number | string;
  onPosterReady?: (dataUrl: string) => void;
  // Optional fine-tuning overrides
  tshirtX?: number;
  tshirtY?: number;
  rotationDeg?: number;
  nameFontSizeOverride?: number;
  numFontSizeOverride?: number;
}

export default function AimikoPosterCanvas({
  name,
  queueNumber,
  onPosterReady,
  tshirtX = 518,
  tshirtY = 580,
  rotationDeg = -10,
  nameFontSizeOverride,
  numFontSizeOverride,
}: AimikoPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const cleanName = (name || "RAHUL").trim().toUpperCase();
  // Strip any "NO." prefix if present, pure number
  const cleanNumber = String(queueNumber || "1").replace(/^NO\.?\s*/i, "").trim() || "1";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsRendering(true);

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Load official AIMIKO poster template
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "/assets/mascot/official_poster_template.jpg";

    const renderPoster = () => {
      // 1. Draw high-res poster base
      ctx.drawImage(img, 0, 0, size, size);

      ctx.save();

      // 2. Translate to exact calibrated center and posture tilt
      ctx.translate(tshirtX, tshirtY);
      ctx.rotate((rotationDeg * Math.PI) / 180);

      // Fabric ink styling
      ctx.fillStyle = "#162f5c";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
      ctx.shadowBlur = 1.5;
      ctx.shadowOffsetY = 1;

      // ─────────────────────────────────────────────────────────────
      // 3. NAME AUTO-FIT ALGORITHM (Fits across shoulder blades: max 125px)
      // ─────────────────────────────────────────────────────────────
      const maxNameWidth = 126;
      let targetNameSize = nameFontSizeOverride || 34;

      if (!nameFontSizeOverride) {
        if (cleanName.length <= 4) targetNameSize = 36;
        else if (cleanName.length <= 6) targetNameSize = 32;
        else if (cleanName.length <= 8) targetNameSize = 28;
        else if (cleanName.length <= 10) targetNameSize = 24;
        else targetNameSize = 20;
      }

      // Test width and auto-scale down until it fits perfectly
      ctx.font = `900 ${targetNameSize}px "Outfit", "Inter", -apple-system, sans-serif`;
      let nameMetrics = ctx.measureText(cleanName);
      if (nameMetrics.width > maxNameWidth) {
        targetNameSize = Math.max(14, Math.floor(targetNameSize * (maxNameWidth / nameMetrics.width)));
        ctx.font = `900 ${targetNameSize}px "Outfit", "Inter", -apple-system, sans-serif`;
      }

      // Letter spacing tuned to word length
      try {
        const letterSpacingPx = targetNameSize <= 20 ? 1 : 2;
        (ctx as any).letterSpacing = `${letterSpacingPx}px`;
      } catch (e) {}

      // Draw Player Name
      // Dynamic Y offset: keep gap proportional between name and number
      const nameY = -30;
      ctx.fillText(cleanName, 0, nameY);

      // ─────────────────────────────────────────────────────────────
      // 4. BIG JERSEY NUMBER AUTO-FIT (Max printable width: 105px)
      // ─────────────────────────────────────────────────────────────
      const maxNumWidth = 104;
      let targetNumSize = numFontSizeOverride || 78;

      if (!numFontSizeOverride) {
        if (cleanNumber.length === 1) targetNumSize = 78;
        else if (cleanNumber.length === 2) targetNumSize = 68;
        else if (cleanNumber.length === 3) targetNumSize = 52;
        else targetNumSize = 42;
      }

      try {
        (ctx as any).letterSpacing = "0px";
      } catch (e) {}

      ctx.font = `900 ${targetNumSize}px "Outfit", "Inter", -apple-system, sans-serif`;
      let numMetrics = ctx.measureText(cleanNumber);
      if (numMetrics.width > maxNumWidth) {
        targetNumSize = Math.max(24, Math.floor(targetNumSize * (maxNumWidth / numMetrics.width)));
        ctx.font = `900 ${targetNumSize}px "Outfit", "Inter", -apple-system, sans-serif`;
      }

      // Draw Big Jersey Number
      const numberY = cleanNumber.length >= 3 ? 24 : 28;
      ctx.fillText(cleanNumber, 0, numberY);

      ctx.restore();

      // 5. Update state & emit Data URL
      const url = canvas.toDataURL("image/png");
      setDataUrl(url);
      setIsRendering(false);
      if (onPosterReady) {
        onPosterReady(url);
      }
    };

    img.onload = renderPoster;
    if (img.complete) {
      renderPoster();
    }
  }, [cleanName, cleanNumber, tshirtX, tshirtY, rotationDeg, nameFontSizeOverride, numFontSizeOverride]);

  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[460px] mx-auto rounded-[2rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(21,47,92,0.2)] border-4 border-white bg-white transition-all duration-300 hover:shadow-2xl">
      <canvas
        ref={canvasRef}
        className="w-full h-auto block aspect-square rounded-[1.8rem]"
        style={{ imageRendering: "auto" }}
      />

      {isRendering && (
        <div className="absolute inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2 text-sm font-black text-[#152e5a] animate-pulse">
            <Sparkles className="w-5 h-5 animate-spin text-amber-500" />
            Printing {cleanName} #{cleanNumber}...
          </div>
        </div>
      )}
    </div>
  );
}
