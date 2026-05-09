import { AnalysisResult } from "@/lib/types";
import { Lightbulb, Tag, DollarSign, User, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  analysis: AnalysisResult;
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-200">{value}/10</span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

const competitionColors = {
  baja: "text-green-400 bg-green-400/10",
  media: "text-yellow-400 bg-yellow-400/10",
  alta: "text-red-400 bg-red-400/10",
};

export default function AnalysisPanel({ analysis }: Props) {
  return (
    <div className="mt-2 space-y-4 border-t border-slate-700/50 pt-4">
      {/* Why viral */}
      <div className="flex gap-2">
        <Zap className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <p className="text-slate-300 text-xs leading-relaxed">{analysis.whyViral}</p>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <DollarSign className="w-3.5 h-3.5 text-green-400 mx-auto mb-1" />
          <div className="text-slate-100 font-semibold">{analysis.estimatedRPM}</div>
          <div className="text-slate-500">RPM est.</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <Target className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
          <div className={cn("font-semibold capitalize px-1 rounded", competitionColors[analysis.competition])}>
            {analysis.competition}
          </div>
          <div className="text-slate-500">competencia</div>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2 text-center">
          <User className="w-3.5 h-3.5 text-violet-400 mx-auto mb-1" />
          <div className={cn("font-semibold", analysis.facelessFriendly ? "text-green-400" : "text-slate-400")}>
            {analysis.facelessFriendly ? "Sí" : "No"}
          </div>
          <div className="text-slate-500">faceless</div>
        </div>
      </div>

      {/* Score bars */}
      <div className="space-y-2">
        <ScoreBar label="Oportunidad" value={analysis.opportunity} color="bg-green-500" />
        <ScoreBar label="Dificultad" value={analysis.difficulty} color="bg-orange-500" />
      </div>

      {/* Content ideas */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-semibold text-slate-300">Ideas de contenido</span>
        </div>
        <ul className="space-y-1">
          {analysis.contentIdeas.map((idea, i) => (
            <li key={i} className="text-xs text-slate-400 flex gap-1.5">
              <span className="text-violet-500 shrink-0">{i + 1}.</span>
              {idea}
            </li>
          ))}
        </ul>
      </div>

      {/* Title ideas */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Tag className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Títulos sugeridos</span>
        </div>
        <ul className="space-y-1.5">
          {analysis.titleIdeas.map((title, i) => (
            <li
              key={i}
              className="text-xs text-slate-300 bg-slate-900/50 rounded-lg px-3 py-2 border border-slate-700/50"
            >
              {title}
            </li>
          ))}
        </ul>
      </div>

      {/* Keywords */}
      <div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.keywords.map((kw, i) => (
            <span
              key={i}
              className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full px-2.5 py-0.5"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
