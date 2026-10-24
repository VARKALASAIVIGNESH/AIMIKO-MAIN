import React, { useState } from "react";
import { Copy, Check, Share2, X, MessageCircle, Send } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  queueNumber: number;
}

export default function ShareModal({ isOpen, onClose, name, queueNumber }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = "https://www.aimiko.in";
  const shareText = `I just joined early access for AIMIKO as Member #${queueNumber}! 🐒 Got my personalized digital companion card. Claim yours before spots close:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareWhatsapp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, "_blank");
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-6 relative animate-pop-in">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-500/20">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0c0c18]">Invite Your Circle</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every friend who joins using your link boosts your spot for early beta drops and special edition companion outfits.
          </p>
        </div>

        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={shareWhatsapp}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all font-semibold text-xs border border-[#25D366]/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-6 h-6" />
            WhatsApp
          </button>

          <button
            onClick={shareTwitter}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-black/5 text-slate-800 hover:bg-black/10 transition-all font-semibold text-xs border border-slate-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span className="text-lg font-black leading-none">𝕏</span>
            X / Twitter
          </button>

          <button
            onClick={shareLinkedIn}
            className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20 transition-all font-semibold text-xs border border-[#0077b5]/20 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-5 h-5" />
            LinkedIn
          </button>
        </div>

        {/* Copy Link Input Box */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200">
          <input
            type="text"
            readOnly
            value={`${shareUrl}?ref=${queueNumber}`}
            className="flex-1 bg-transparent px-3 text-xs font-mono text-slate-600 outline-none"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
