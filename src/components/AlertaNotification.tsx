"use client";

import { useEffect, useState } from "react";
import { Bell, X, TrendingUp } from "lucide-react";
import Link from "next/link";

interface VideoMatch {
  id: string;
  title: string;
  outlierScore: number;
  channelTitle: string;
  viewCount?: number;
}

interface AlertaNotificationProps {
  query: string;
  videos: VideoMatch[];
}

interface Alerta {
  id: string;
  keyword: string;
  minOutlier: number;
  activa: boolean;
  matchCount: number;
  ultimoMatch?: string;
  email?: string;
  emailActivo: boolean;
}

async function sendEmailAlert(
  alerta: Alerta,
  video: VideoMatch
): Promise<void> {
  if (!alerta.email || !alerta.emailActivo) return;

  const videoUrl = `https://www.youtube.com/watch?v=${video.id}`;

  try {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: alerta.email,
        alertaKeyword: alerta.keyword,
        videoTitulo: video.title,
        videoUrl,
        outlierScore: video.outlierScore,
        views: video.viewCount ?? 0,
      }),
    });
  } catch {
    // Silently ignore email errors — notification is still shown in UI
  }
}

export default function AlertaNotification({ query, videos }: AlertaNotificationProps) {
  const [matches, setMatches] = useState<{ alerta: Alerta; video: VideoMatch }[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!query || !videos.length) return;
    setDismissed(false);

    try {
      const stored = localStorage.getItem("viralscope-alertas");
      if (!stored) return;
      const alertas: Alerta[] = JSON.parse(stored);

      const found: { alerta: Alerta; video: VideoMatch }[] = [];

      for (const alerta of alertas) {
        if (!alerta.activa) continue;
        if (!query.toLowerCase().includes(alerta.keyword.toLowerCase()) &&
            !alerta.keyword.toLowerCase().includes(query.toLowerCase())) continue;

        for (const video of videos) {
          if (video.outlierScore >= alerta.minOutlier) {
            found.push({ alerta, video });
            break; // one match per alert is enough
          }
        }
      }

      if (found.length > 0) {
        setMatches(found);
        // Update match counts in localStorage
        const updated = alertas.map(a => {
          const match = found.find(f => f.alerta.id === a.id);
          if (match) {
            return { ...a, matchCount: a.matchCount + 1, ultimoMatch: match.video.title.slice(0, 60) };
          }
          return a;
        });
        localStorage.setItem("viralscope-alertas", JSON.stringify(updated));

        // Send email alerts for matches that have email enabled
        for (const { alerta, video } of found) {
          if (alerta.email && alerta.emailActivo) {
            void sendEmailAlert(alerta, video);
          }
        }
      } else {
        setMatches([]);
      }
    } catch {}
  }, [query, videos]);

  if (!matches.length || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-4">
      <div className="bg-slate-900 border border-orange-500/40 rounded-2xl p-4 shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">🔔 Alerta activada</p>
              <p className="text-slate-500 text-xs">{matches.length} alerta{matches.length > 1 ? "s" : ""} coincide{matches.length > 1 ? "n" : ""}</p>
            </div>
          </div>
          <button onClick={() => setDismissed(true)} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 mb-3">
          {matches.slice(0, 2).map(({ alerta, video }) => (
            <div key={alerta.id} className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-orange-400" />
                <span className="text-orange-400 font-bold text-xs">{video.outlierScore}x outlier</span>
                <span className="text-slate-600 text-xs">≥{alerta.minOutlier}x umbral</span>
                {alerta.email && alerta.emailActivo && (
                  <span className="text-xs text-blue-400">✉</span>
                )}
              </div>
              <p className="text-slate-300 text-xs line-clamp-1">{video.title}</p>
            </div>
          ))}
        </div>

        <Link
          href="/alertas"
          className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-semibold transition-colors"
        >
          Ver mis alertas
        </Link>
      </div>
    </div>
  );
}
