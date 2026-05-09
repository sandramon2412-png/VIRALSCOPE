import { cn } from "@/lib/utils";
import { VideoResult } from "@/lib/types";

interface Props {
  score: number;
  rating: VideoResult["viralityRating"];
  size?: "sm" | "md" | "lg";
}

const labels = {
  explosive: "EXPLOSIVO",
  high: "ALTO",
  medium: "MEDIO",
  low: "BAJO",
};

const colors = {
  explosive: "bg-red-500/20 text-red-400 border-red-500/40",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/40",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
  low: "bg-slate-500/20 text-slate-400 border-slate-500/40",
};

const glow = {
  explosive: "shadow-red-500/20",
  high: "shadow-orange-500/20",
  medium: "shadow-yellow-500/20",
  low: "",
};

export default function OutlierBadge({ score, rating, size = "md" }: Props) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 border rounded-full font-bold shadow-lg",
        colors[rating],
        glow[rating],
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-3 py-1 text-sm",
        size === "lg" && "px-4 py-2 text-base"
      )}
    >
      <span>{score}x</span>
      <span className="opacity-70 font-normal text-[10px] tracking-wider">
        {labels[rating]}
      </span>
    </div>
  );
}
