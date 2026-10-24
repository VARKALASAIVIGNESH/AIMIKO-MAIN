import React, { useState } from "react";
import { Download, Sparkles, Sliders, RefreshCw, Check } from "lucide-react";
import AimikoPosterCanvas from "@/components/preregister/AimikoPosterCanvas";

export default function PosterTest() {
  const [name, setName] = useState("ALEXANDER");
  const [number, setNumber] = useState<number | string>(100);
  const [posterUrl, setPosterUrl] = useState<string>("");

  // Fine-tuning calibration controls matching your exact dialed-in settings
  const [tshirtX, setTshirtX] = useState<number>(518);
  const [tshirtY, setTshirtY] = useState<number>(580);
  const [rotationDeg, setRotationDeg] = useState<number>(-10);

  // Auto-fit toggle
  const [autoScale, setAutoScale] = useState<boolean>(true);
  const [manualNameSize, setManualNameSize] = useState<number>(24);
  const [manualNumSize, setManualNumSize] = useState<number>(54);

  const presets = [
    { name: "RAHUL", num: 1 },
    { name: "VICKY", num: 7 },
    { name: "SAI", num: 2 },
    { name: "ALEXANDER", num: 23 },
    { name: "ANANYA", num: 99 },
    { name: "AIMIKO", num: 100 },
    { name: "CHRISTOPHER", num: 777 },
    { name: "BHARATH", num: 1024 },
  ];

  const handleDownload = () => {
    if (!posterUrl) return;
    const a = document.createElement("a");
    a.href = posterUrl;
    a.download = `AIMIKO-Poster-${name || "Player"}-${number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const resetCalibration = () => {
    setTshirtX(518);
    setTshirtY(580);
    setRotationDeg(-10);
    setAutoScale(true);
    setManualNameSize(24);
    setManualNumSize(54);
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center py-10 px-4">
      {/* Header */}
      <div className="text-center max-w-xl mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-bold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Smart Auto-Fit Poster Laboratory
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Name & Jersey Calibration
        </h1>
        <p className="text-sm text-slate-400">
          Smart auto-fit dynamically scales long names (e.g. ALEXANDER) and multi-digit numbers (e.g. 100, 777) so they never overflow.
        </p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="w-full flex items-center justify-between mb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
              High-Resolution 1024x1024 Canvas
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Auto-Fit Active
            </span>
          </div>

          <AimikoPosterCanvas
            name={name}
            queueNumber={number}
            tshirtX={tshirtX}
            tshirtY={tshirtY}
            rotationDeg={rotationDeg}
            nameFontSizeOverride={autoScale ? undefined : manualNameSize}
            numFontSizeOverride={autoScale ? undefined : manualNumSize}
            onPosterReady={(url) => setPosterUrl(url)}
          />

          {/* Action Buttons */}
          <div className="w-full flex gap-3 mt-6">
            <button
              onClick={handleDownload}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              Download Full-Res 1024x1024 PNG
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Test Controls */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl">
          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-400 block mb-2">
              Quick Test Presets (Short, Long & 3-Digit)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.name}
                  id={`preset-${p.name.toLowerCase()}`}
                  onClick={() => {
                    setName(p.name);
                    setNumber(p.num);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                    name === p.name && number === p.num
                      ? "bg-violet-600 text-white border-violet-400 shadow-md"
                      : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  {p.name} #{p.num}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Inputs */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                Player / User Name
              </label>
              <input
                id="test-input-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-violet-500 transition-colors uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-slate-400 block mb-1.5">
                Big Jersey Number (1, 2, 3 or 4 digits)
              </label>
              <input
                id="test-input-number"
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 1, 7, 23, 100, 777..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Micro-Adjustment Sliders */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                Live Calibration Controls
              </span>
              <button
                onClick={resetCalibration}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            {/* Smart Auto-Fit Mode Toggle */}
            <div className="p-3 rounded-xl bg-violet-950/40 border border-violet-800/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-violet-300">Intelligent Auto-Fit</div>
                <div className="text-[11px] text-slate-400">Scales long names & 3-digits automatically</div>
              </div>
              <button
                onClick={() => setAutoScale(!autoScale)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  autoScale
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {autoScale ? "ENABLED" : "MANUAL"}
              </button>
            </div>

            {/* X Position */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Horizontal Center (X)</span>
                <span className="font-mono text-violet-400">{tshirtX}px</span>
              </div>
              <input
                type="range"
                min="490"
                max="540"
                value={tshirtX}
                onChange={(e) => setTshirtX(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Y Position */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Vertical Center (Y)</span>
                <span className="font-mono text-violet-400">{tshirtY}px</span>
              </div>
              <input
                type="range"
                min="550"
                max="600"
                value={tshirtY}
                onChange={(e) => setTshirtY(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {/* Rotation Angle */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                <span>Fabric Tilt / Rotation</span>
                <span className="font-mono text-violet-400">{rotationDeg}°</span>
              </div>
              <input
                type="range"
                min="-15"
                max="0"
                step="0.5"
                value={rotationDeg}
                onChange={(e) => setRotationDeg(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer"
              />
            </div>

            {!autoScale && (
              <>
                {/* Manual Name Font Size */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Manual Name Size</span>
                    <span className="font-mono text-violet-400">{manualNameSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="40"
                    value={manualNameSize}
                    onChange={(e) => setManualNameSize(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>

                {/* Manual Number Font Size */}
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-400 mb-1">
                    <span>Manual Number Size</span>
                    <span className="font-mono text-violet-400">{manualNumSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    value={manualNumSize}
                    onChange={(e) => setManualNumSize(Number(e.target.value))}
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
