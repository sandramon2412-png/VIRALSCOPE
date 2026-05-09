"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";
import { TopChannel } from "@/app/api/top-channels/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

const COUNTRY_FLAGS: Record<string, string> = {
  ES: "🇪🇸", MX: "🇲🇽", AR: "🇦🇷", CO: "🇨🇴", CL: "🇨🇱",
  PE: "🇵🇪", VE: "🇻🇪", EC: "🇪🇨", US: "🇺🇸", GB: "🇬🇧",
  BR: "🇧🇷", PT: "🇵🇹", FR: "🇫🇷", DE: "🇩🇪", IT: "🇮🇹",
  CA: "🇨🇦", AU: "🇦🇺", IN: "🇮🇳", JP: "🇯🇵", KR: "🇰🇷",
};

function flagEmoji(country: string): string {
  return COUNTRY_FLAGS[country?.toUpperCase()] || "🌍";
}

// ─── Quick nicho pills ────────────────────────────────────────────────────────

const QUICK_NICHOS = [
  "finanzas personales", "inversión", "criptomonedas", "marketing digital",
  "productividad", "true crime", "historia", "tecnología",
  "fitness", "nutrición", "viajes", "emprendimiento",
];

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChannelSkeleton() {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 animate-pulse space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-slate-700/60" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/60 rounded w-3/4" />
          <div className="h-3 bg-slate-700/40 rounded w-1/2" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-12 bg-slate-700/40 rounded-xl" />
        ))}
      </div>
      <div className="h-9 bg-slate-700/40 rounded-xl" />
    </div>
  );
}

// ─── Channel Card ─────────────────────────────────────────────────────────────

function ChannelCard({ channel }: { channel: TopChannel }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600 transition-all duration-200 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative w-14 h-14 flex-shrink-0">
          {channel.thumbnail ? (
            <Image
              src={channel.thumbnail}
              alt={channel.title}
              fill
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xl font-bold">
              {channel.title.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm leading-snug line-clamp-1">
            {channel.title}
          </h3>
          {channel.handle && (
            <p className="text-xs text-slate-400 truncate">{channel.handle}</p>
          )}
          <span className="text-xs text-slate-500">
            {flagEmoji(channel.country)} {channel.country !== "–" ? channel.country : ""}
          </span>
        </div>
      </div>

      {/* Description */}
      {channel.description && (
        <p className="text-xs text-slate-400 line-clamp-2">{channel.description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="flex flex-col items-center bg-slate-900/50 rounded-xl py-2 px-1">
          <span className="text-slate-100 font-bold">{fmt(channel.subscriberCount)}</span>
          <span className="text-slate-500">subs</span>
        </div>
        <div className="flex flex-col items-center bg-slate-900/50 rounded-xl py-2 px-1">
          <span className="text-slate-100 font-bold">{fmt(channel.viewCount)}</span>
          <span className="text-slate-500">vistas</span>
        </div>
        <div className="flex flex-col items-center bg-slate-900/50 rounded-xl py-2 px-1">
          <span className="text-slate-100 font-bold">{fmt(channel.videoCount)}</span>
          <span className="text-slate-500">videos</span>
        </div>
      </div>

      {/* Avg views */}
      <div className="flex items-center justify-between bg-violet-950/40 border border-violet-800/30 rounded-xl px-3 py-2 text-xs">
        <span className="text-violet-300 font-semibold">~{fmt(channel.avgViewsEstimate)} vistas/video</span>
        <span className="text-slate-400">Score: {fmt(channel.growthScore)}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={`https://www.youtube.com/channel/${channel.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
        >
          📺 Ver Canal
        </a>
        <Link
          href={`/crear-canal?entry=emular&canalRef=${encodeURIComponent(
            channel.handle
              ? `https://youtube.com/${channel.handle}`
              : `https://youtube.com/channel/${channel.id}`
          )}&nicho=${encodeURIComponent("")}`}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs font-semibold transition-colors"
        >
          🎯 Emular
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function TopChannelsPage() {
  const [nicho, setNicho] = useState("finanzas personales");
  const [idioma, setIdioma] = useState("es");
  const [channels, setChannels] = useState<TopChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(overrideNicho?: string) {
    const q = overrideNicho ?? nicho;
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(`/api/top-channels?nicho=${encodeURIComponent(q)}&idioma=${idioma}&max=12`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");
      setChannels(data.channels || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error buscando canales");
      setChannels([]);
    } finally {
      setLoading(false);
    }
  }

  function handlePill(pill: string) {
    setNicho(pill);
    search(pill);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2"><Trophy size={28} style={{ color: "#a78bfa" }} /> Top Channels</h1>
          <p className="text-slate-400">Descubre los canales que más crecen en tu nicho</p>
        </div>

        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={nicho}
            onChange={e => setNicho(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Ej: finanzas personales, true crime..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm"
          />
          {/* Language toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-700/50 flex-shrink-0">
            {(["es", "en", "pt"] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setIdioma(lang)}
                className={`px-3 py-2 text-sm font-semibold transition-colors uppercase ${
                  idioma === lang
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            onClick={() => search()}
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>

        {/* Quick nicho pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {QUICK_NICHOS.map(pill => (
            <button
              key={pill}
              onClick={() => handlePill(pill)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                nicho === pill
                  ? "bg-violet-600/30 border-violet-500/60 text-violet-300"
                  : "bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600"
              }`}
            >
              {pill}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <ChannelSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && channels.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map(ch => (
              <ChannelCard key={ch.id} channel={ch} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && searched && channels.length === 0 && !error && (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <p className="text-4xl">📭</p>
            <p className="text-lg font-semibold text-slate-400">No se encontraron canales</p>
            <p className="text-sm">Prueba con otro nicho o idioma</p>
          </div>
        )}

        {/* Initial state (before first search) */}
        {!loading && !searched && (
          <div className="text-center py-16 text-slate-500 space-y-2">
            <p className="text-4xl">🔍</p>
            <p className="text-sm">Elige un nicho y pulsa Buscar para descubrir los top canales</p>
          </div>
        )}
      </main>
    </div>
  );
}
