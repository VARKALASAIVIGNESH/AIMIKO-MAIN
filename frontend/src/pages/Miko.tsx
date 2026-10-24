import MainNavbar from "@/components/MainNavbar";

export default function Miko() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans antialiased flex flex-col">
      <MainNavbar />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-16 max-w-4xl mx-auto">
        {/* Mascot */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 mb-6 flex items-center justify-center">
          <img
            src="/brand/mascot_miko.png"
            alt="MIKO Mascot"
            className="w-full h-full object-contain drop-shadow-lg"
          />
        </div>

        {/* Meet Miko Title */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-3">
          Meet MIKO
        </h2>

        {/* Big Bold Launching Soon in distinctive different color with NO background */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-none mb-6 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
          LAUNCHING SOON
        </h1>

        {/* Flirty Surprise Line */}
        <p className="text-lg sm:text-2xl font-bold text-slate-700 max-w-xl leading-relaxed">
          You’re gonna be delightfully surprised.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 mt-2">
          Your AI that can actually act is putting on its final touches.
        </p>
      </main>
    </div>
  );
}
