const DEFAULT_AVATAR = "/brand/mascot_miko.png";

interface AimikoAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  animate?: boolean;
  className?: string;
  src?: string;
}

const sizes = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
  xl: "w-36 h-36",
};

export function AimikoAvatar({ size = "md", animate = false, className = "", src = DEFAULT_AVATAR }: AimikoAvatarProps) {
  return (
    <div className="inline-block relative group">
      <img
        src={src}
        alt="AIMIKO"
        className={`${sizes[size]} rounded-3xl object-contain p-1 bg-card/40 backdrop-blur-xs border border-border/60 shadow-md transition-all duration-300 group-hover:scale-110 active:scale-95 group-hover:rotate-3 ${animate ? "animate-float" : ""} ${className}`}
        width={144}
        height={144}
      />
      {size === "xl" && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full p-2 text-[10px] font-black border-2 border-background shadow-md">
          ONLINE
        </div>
      )}
    </div>
  );
}

export function AimikoThinking() {
  return (
    <div className="flex items-center gap-3 animate-pulse bg-card/50 backdrop-blur-md px-4 py-3 rounded-2xl border border-border/60">
      <AimikoAvatar size="sm" animate />
      <div className="flex flex-col">
        <span className="text-xs text-foreground font-black flex items-center gap-1.5">
          AIMIKO is thinking
          <span className="flex items-center gap-0.5 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary thinking-dot animate-bounce [animation-delay:0.4s]" />
          </span>
        </span>
        <span className="text-[10px] text-muted-foreground font-semibold">Stretching brain folds...</span>
      </div>
    </div>
  );
}
