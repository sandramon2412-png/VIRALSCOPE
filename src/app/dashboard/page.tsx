"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Tv,
  Eye,
  Clock,
  BarChart2,
  Users,
  Play,
  Sparkles,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Activity,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GlobalNav from "@/components/GlobalNav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChannelData {
  items?: Array<{
    snippet: {
      title: string;
      description: string;
      thumbnails: { default: { url: string }; medium: { url: string } };
      customUrl?: string;
    };
    statistics: {
      viewCount: string;
      subscriberCount: string;
      videoCount: string;
    };
  }>;
}

interface AnalyticsRow {
  // [day, views, estimatedMinutesWatched, averageViewDuration, averageViewPercentage,
  //  subscribersGained, subscribersLost, likes, comments]
  [index: number]: string | number;
}

interface AnalyticsData {
  columnHeaders?: Array<{ name: string }>;
  rows?: AnalyticsRow[];
}

interface TopVideoRow {
  // [video, views, estimatedMinutesWatched, averageViewPercentage, likes, comments,
  //  subscribersGained, impressions, impressionClickThroughRate]
  [index: number]: string | number;
}

interface VideoDetail {
  id: string;
  title: string;
  thumbnail: string;
}

interface TopVideoEnriched {
  videoId: string;
  title: string;
  thumbnail: string;
  views: number;
  minutesWatched: number;
  avgViewPercentage: number;
  likes: number;
  comments: number;
  subscribersGained: number;
  impressions: number;
  ctr: number;
}

type DateRange = "7d" | "28d" | "90d";

// ─── Retention Types ──────────────────────────────────────────────────────────

interface CurvaPoint {
  porcentajeTiempo: number;
  retencion: number;
  rendimiento: number;
}

interface PuntoCritico {
  tiempo: number;
  severidad: "Alta" | "Media" | "Baja";
  recomendacion: string;
}

interface RetentionData {
  curva: CurvaPoint[];
  promedioGeneral: number;
  puntosCriticos: PuntoCritico[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ctrColor(ctr: number): string {
  if (ctr >= 5) return "text-green-400";
  if (ctr >= 2) return "text-yellow-400";
  return "text-red-400";
}

function retentionColor(pct: number): string {
  if (pct >= 50) return "text-green-400";
  if (pct >= 30) return "text-yellow-400";
  return "text-red-400";
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
        border: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 0 20px rgba(139,92,246,0.08)",
      }}
    >
      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
        {icon}
        {label}
      </div>
      <p className="text-2xl font-extrabold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ─── Bar Chart ───────────────────────────────────────────────────────────────

function ViewsChart({
  rows,
  dateRange,
}: {
  rows: AnalyticsRow[];
  dateRange: DateRange;
}) {
  const days = dateRange === "7d" ? 7 : dateRange === "28d" ? 28 : 90;
  const sliced = rows.slice(-days);
  const maxViews = Math.max(...sliced.map((r) => Number(r[1]) || 0), 1);

  return (
    <div className="flex items-end gap-0.5 h-32 w-full overflow-hidden">
      {sliced.map((row, i) => {
        const views = Number(row[1]) || 0;
        const heightPct = (views / maxViews) * 100;
        const date = String(row[0]);
        return (
          <div
            key={i}
            className="group relative flex-1 flex items-end"
            title={`${date}: ${fmtNum(views)} vistas`}
          >
            <div
              className="w-full rounded-t transition-all duration-200 group-hover:opacity-80"
              style={{
                height: `${Math.max(heightPct, 2)}%`,
                background: "linear-gradient(to top, #7c3aed, #a855f7)",
              }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap">
                <span className="font-bold">{fmtNum(views)}</span>
                <span className="text-slate-400 ml-1">{date.slice(5)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Retention Curve Component ───────────────────────────────────────────────

function severidadColor(s: "Alta" | "Media" | "Baja"): string {
  if (s === "Alta") return "text-red-400 bg-red-500/10 border-red-500/30";
  if (s === "Media") return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-blue-400 bg-blue-500/10 border-blue-500/30";
}

function retentionBarColor(pct: number): string {
  if (pct >= 60) return "#22c55e";
  if (pct >= 40) return "#eab308";
  return "#ef4444";
}

function avgRetentionBadgeColor(avg: number): string {
  if (avg >= 60) return "text-green-400 bg-green-500/10 border-green-500/30";
  if (avg >= 40) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
}

function avgRetentionEmoji(avg: number): string {
  if (avg >= 60) return "🟢";
  if (avg >= 40) return "🟡";
  return "🔴";
}

function RetentionCurveSection({ providerToken }: { providerToken: string }) {
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  const [retentionError, setRetentionError] = useState<string | null>(null);

  async function fetchRetention() {
    setRetentionLoading(true);
    setRetentionError(null);
    try {
      const res = await fetch(
        `/api/youtube-analytics?token=${encodeURIComponent(providerToken)}&metric=retention`
      );
      const data = await res.json() as RetentionData & { error?: string };
      if (data.error) throw new Error(data.error);
      setRetentionData(data);
    } catch (e) {
      setRetentionError(e instanceof Error ? e.message : "Error al cargar retención");
    } finally {
      setRetentionLoading(false);
    }
  }

  const maxRetencion = retentionData
    ? Math.max(...retentionData.curva.map(p => p.retencion), 1)
    : 100;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
        border: "1px solid rgba(139,92,246,0.2)",
      }}
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-bold text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400" />
          📊 Curva de Retención
        </h2>
        <button
          onClick={fetchRetention}
          disabled={retentionLoading}
          className="flex items-center gap-2 text-xs bg-gradient-to-r from-green-700 to-teal-700 hover:from-green-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-4 py-2 rounded-xl transition-all"
        >
          {retentionLoading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Cargando...</>
          ) : (
            <>📈 Fetch retention data</>
          )}
        </button>
      </div>

      {/* Error */}
      {retentionError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-red-300 text-sm">{retentionError}</p>
        </div>
      )}

      {/* Empty state */}
      {!retentionData && !retentionLoading && !retentionError && (
        <p className="text-slate-500 text-sm">
          Haz clic en &quot;Fetch retention data&quot; para analizar cómo retiene tu audiencia a lo largo de tus videos.
        </p>
      )}

      {/* Retention curve chart */}
      {retentionData && (
        <div className="space-y-6">
          {/* Average retention badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Retención promedio:</span>
            <span
              className={`text-sm font-bold px-3 py-1 rounded-full border ${avgRetentionBadgeColor(retentionData.promedioGeneral)}`}
            >
              {retentionData.promedioGeneral}% {avgRetentionEmoji(retentionData.promedioGeneral)}
            </span>
          </div>

          {/* Bar chart */}
          {retentionData.curva.length > 0 ? (
            <div>
              <div className="flex items-end gap-px h-36 w-full overflow-hidden rounded-lg">
                {retentionData.curva.map((point, i) => {
                  const heightPct = (point.retencion / maxRetencion) * 100;
                  return (
                    <div
                      key={i}
                      className="group relative flex-1 flex items-end"
                      title={`${point.porcentajeTiempo}% del video — ${point.retencion.toFixed(1)}% retención`}
                    >
                      <div
                        className="w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-80"
                        style={{
                          height: `${Math.max(heightPct, 2)}%`,
                          backgroundColor: retentionBarColor(point.retencion),
                        }}
                      />
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                        <div className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white whitespace-nowrap">
                          <span className="font-bold">{point.retencion.toFixed(1)}%</span>
                          <span className="text-slate-400 ml-1">@ {point.porcentajeTiempo}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* X axis labels */}
              <div className="flex justify-between mt-1.5 text-[10px] text-slate-600">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> &gt;60%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> 40-60%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> &lt;40%</span>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No hay datos de curva disponibles para este período.</p>
          )}

          {/* Critical drop-off points */}
          {retentionData.puntosCriticos.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">
                Puntos críticos de abandono
              </h3>
              <div className="space-y-2">
                {retentionData.puntosCriticos.map((punto, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-white/3 rounded-xl p-3"
                  >
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${severidadColor(punto.severidad)}`}
                    >
                      {punto.tiempo}%
                    </span>
                    <div className="flex-1 min-w-0">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border mr-2 ${severidadColor(punto.severidad)}`}
                      >
                        {punto.severidad}
                      </span>
                      <span className="text-slate-300 text-xs">{punto.recomendacion}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {retentionData.puntosCriticos.length === 0 && retentionData.curva.length > 0 && (
            <p className="text-green-400 text-sm">
              ✅ No se detectaron caídas críticas de retención. ¡Buen trabajo!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, loading: authLoading, providerToken, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [topVideos, setTopVideos] = useState<TopVideoEnriched[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("28d");
  const [aiRecs, setAiRecs] = useState<string[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  const fetchData = useCallback(async () => {
    if (!providerToken) return;
    setLoading(true);
    setError(null);

    try {
      const base = `/api/youtube-analytics?token=${encodeURIComponent(providerToken)}`;

      const [chRes, anRes, tvRes] = await Promise.all([
        fetch(`${base}&metric=channel`),
        fetch(`${base}&metric=analytics`),
        fetch(`${base}&metric=topvideos`),
      ]);

      const [ch, an, tv] = await Promise.all([
        chRes.json() as Promise<ChannelData & { error?: string }>,
        anRes.json() as Promise<AnalyticsData & { error?: string }>,
        tvRes.json() as Promise<{ rows?: TopVideoRow[]; error?: string }>,
      ]);

      if (ch.error) throw new Error(ch.error);
      if (an.error) throw new Error(an.error);

      setChannelData(ch);
      setAnalyticsData(an);

      // Enrich top videos with titles/thumbnails
      if (tv.rows && tv.rows.length > 0) {
        const videoIds = tv.rows.map((r) => String(r[0])).join(",");
        const vdRes = await fetch(`${base}&metric=video_details&videoIds=${encodeURIComponent(videoIds)}`);
        const vd = await vdRes.json() as {
          items?: Array<{
            id: string;
            snippet: {
              title: string;
              thumbnails: { default: { url: string } };
            };
          }>;
        };

        const detailMap: Record<string, VideoDetail> = {};
        (vd.items ?? []).forEach((item) => {
          detailMap[item.id] = {
            id: item.id,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.default.url,
          };
        });

        const enriched: TopVideoEnriched[] = tv.rows.map((r) => {
          const vid = String(r[0]);
          const detail = detailMap[vid];
          return {
            videoId: vid,
            title: detail?.title ?? vid,
            thumbnail: detail?.thumbnail ?? "",
            views: Number(r[1]) || 0,
            minutesWatched: Number(r[2]) || 0,
            avgViewPercentage: Number(r[3]) || 0,
            likes: Number(r[4]) || 0,
            comments: Number(r[5]) || 0,
            subscribersGained: Number(r[6]) || 0,
            impressions: Number(r[7]) || 0,
            ctr: Number(r[8]) || 0,
          };
        });
        setTopVideos(enriched);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, [providerToken]);

  useEffect(() => {
    if (providerToken) {
      fetchData();
    }
  }, [providerToken, fetchData]);

  // ── Compute aggregate stats ──────────────────────────────────────────────

  const rows = analyticsData?.rows ?? [];
  const totalViews = rows.reduce((s, r) => s + (Number(r[1]) || 0), 0);
  const totalMinutes = rows.reduce((s, r) => s + (Number(r[2]) || 0), 0);
  const totalSubsGained = rows.reduce((s, r) => s + (Number(r[5]) || 0), 0);
  const avgRetention =
    rows.length > 0
      ? rows.reduce((s, r) => s + (Number(r[4]) || 0), 0) / rows.length
      : 0;
  const avgCtr =
    topVideos.length > 0
      ? topVideos.reduce((s, v) => s + v.ctr, 0) / topVideos.length
      : 0;

  // ── AI Recommendations ───────────────────────────────────────────────────

  async function handleAnalyzeWithAI() {
    if (!channelData?.items?.[0]) return;
    setAiLoading(true);
    setAiRecs(null);

    const stats = {
      channelTitle: channelData.items[0].snippet.title,
      totalViews,
      totalMinutes,
      totalSubsGained,
      avgRetention: avgRetention.toFixed(1),
      avgCtr: avgCtr.toFixed(2),
      topVideoTitle: topVideos[0]?.title ?? "",
    };

    try {
      const res = await fetch("/api/canal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analizar_metricas",
          stats,
        }),
      });
      const data = await res.json() as { recomendaciones?: string[]; content?: string; result?: string };
      if (data.recomendaciones && Array.isArray(data.recomendaciones)) {
        setAiRecs(data.recomendaciones.slice(0, 3));
      } else {
        const text = data.content ?? data.result ?? JSON.stringify(data);
        setAiRecs([text]);
      }
    } catch {
      setAiRecs(["No se pudo conectar con el análisis de IA. Intenta más tarde."]);
    } finally {
      setAiLoading(false);
    }
  }

  // ── Loading / Auth gates ─────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  // ── "Connect YouTube" screen ──────────────────────────────────────────────

  if (!providerToken) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <GlobalNav />
        <div className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center gap-8">
          <div
            className="w-full rounded-3xl p-8 flex flex-col items-center gap-6 text-center"
            style={{
              background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
              border: "1px solid rgba(139,92,246,0.25)",
              boxShadow: "0 0 40px rgba(139,92,246,0.1)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ff0000, #cc0000)" }}
            >
              <Tv className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold mb-2">Conecta tu canal de YouTube</h1>
              <p className="text-slate-400 text-sm">
                Accede a tus estadísticas reales: CTR, impresiones, retención y más
              </p>
            </div>

            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-violet-500/25"
            >
              🔗 Conectar con Google
            </button>

            <p className="text-xs text-slate-500">
              Requiere autorización de YouTube Analytics en tu cuenta de Google
            </p>

            <div className="w-full border-t border-slate-700/50 pt-4">
              <p className="text-xs text-slate-400 font-semibold mb-3">Tendrás acceso a:</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                {[
                  "📊 CTR real",
                  "👁 Impresiones",
                  "⏱ Retención promedio",
                  "🏆 Mejores videos",
                  "👥 Suscriptores ganados",
                  "🤖 Análisis con IA",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 bg-white/4 rounded-lg px-2 py-1.5">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Connected Dashboard ───────────────────────────────────────────────────

  const channel = channelData?.items?.[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {channel?.snippet.thumbnails.medium.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={channel.snippet.thumbnails.medium.url}
                alt={channel.snippet.title}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Tv className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold">
                {channel?.snippet.title ?? "Mi Canal"}
              </h1>
              <p className="text-xs text-slate-400">
                {channel?.statistics.subscriberCount
                  ? `${fmtNum(Number(channel.statistics.subscriberCount))} suscriptores`
                  : "Dashboard de Analytics"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />}
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Stat Cards */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 h-28 animate-pulse"
                style={{ background: "rgba(25,20,45,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard
              icon={<Eye className="w-3.5 h-3.5" />}
              label="Vistas (28 días)"
              value={fmtNum(totalViews)}
              sub="Visualizaciones totales"
            />
            <StatCard
              icon={<Clock className="w-3.5 h-3.5" />}
              label="Tiempo de visualización"
              value={`${fmtNum(Math.round(totalMinutes / 60))}h`}
              sub="Horas vistas"
            />
            <StatCard
              icon={<BarChart2 className="w-3.5 h-3.5" />}
              label="CTR promedio"
              value={`${avgCtr.toFixed(2)}%`}
              sub="Tasa de clics en impresiones"
            />
            <StatCard
              icon={<Users className="w-3.5 h-3.5" />}
              label="Subs ganados"
              value={`+${fmtNum(totalSubsGained)}`}
              sub="Últimos 30 días"
            />
            <StatCard
              icon={<Play className="w-3.5 h-3.5" />}
              label="Retención promedio"
              value={`${avgRetention.toFixed(1)}%`}
              sub="Porcentaje visto"
            />
          </div>
        )}

        {/* Views Chart */}
        {rows.length > 0 && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                Vistas por día
              </h2>
              <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1">
                {(["7d", "28d", "90d"] as DateRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                      dateRange === r
                        ? "bg-violet-600 text-white font-semibold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {r === "7d" ? "7 días" : r === "28d" ? "28 días" : "90 días"}
                  </button>
                ))}
              </div>
            </div>
            <ViewsChart rows={rows} dateRange={dateRange} />
          </div>
        )}

        {/* Top Videos Table */}
        {topVideos.length > 0 && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="font-bold text-sm flex items-center gap-1.5"><Trophy size={14} style={{ color: "#a78bfa" }} /> Top 10 Videos (últimos 28 días)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-4 py-3 text-xs text-slate-500 font-semibold">Video</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">Vistas</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">CTR</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">Retención</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">Subs</th>
                    <th className="text-right px-4 py-3 text-xs text-slate-500 font-semibold">Likes</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {topVideos.map((v) => (
                    <tr
                      key={v.videoId}
                      className="border-b border-slate-800/50 hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {v.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="w-14 h-9 rounded object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-9 rounded bg-slate-800 shrink-0" />
                          )}
                          <span
                            className="text-slate-200 text-xs truncate max-w-[180px] md:max-w-xs"
                            title={v.title}
                          >
                            {v.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">{fmtNum(v.views)}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${ctrColor(v.ctr)}`}>
                        {v.ctr.toFixed(2)}%
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${retentionColor(v.avgViewPercentage)}`}>
                        {v.avgViewPercentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">+{v.subscribersGained}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{fmtNum(v.likes)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/crear-contenido?titulo=${encodeURIComponent(v.title)}&nicho=dashboard`}
                          className="text-xs bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          ✨ Crear similar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Retention Curve */}
        <RetentionCurveSection providerToken={providerToken} />

        {/* AI Recommendations */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "linear-gradient(135deg, rgba(25,20,45,0.9), rgba(15,12,28,0.85))",
            border: "1px solid rgba(139,92,246,0.2)",
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-400" />
              Recomendaciones de IA
            </h2>
            <button
              onClick={handleAnalyzeWithAI}
              disabled={aiLoading || !channelData}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2 rounded-xl transition-all"
            >
              {aiLoading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analizando...</>
              ) : (
                <>🤖 Analizar con IA</>
              )}
            </button>
          </div>

          {!aiRecs && !aiLoading && (
            <p className="text-slate-500 text-sm">
              Haz clic en &quot;Analizar con IA&quot; para obtener recomendaciones personalizadas basadas en tu CTR,
              retención y videos más vistos.
            </p>
          )}

          {aiRecs && (
            <div className="space-y-3">
              {aiRecs.map((rec, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-white/4 rounded-xl p-4"
                >
                  <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
