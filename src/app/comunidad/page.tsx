"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GlobalNav from "@/components/GlobalNav";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type Categoria = "todos" | "general" | "logro" | "pregunta" | "tip" | "canal";

interface ComunidadPost {
  id: string;
  user_id: string;
  user_email: string;
  contenido: string;
  categoria: string;
  likes: number;
  canal_url: string | null;
  created_at: string;
}

interface TopContribuidor {
  user_email: string;
  post_count: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-pink-600",
  "bg-emerald-600",
  "bg-blue-600",
  "bg-orange-600",
  "bg-teal-600",
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return "ahora mismo";
  if (diff < 3600) {
    const m = Math.floor(diff / 60);
    return `hace ${m} min`;
  }
  if (diff < 86400) {
    const h = Math.floor(diff / 3600);
    return `hace ${h}h`;
  }
  const d = Math.floor(diff / 86400);
  if (d === 1) return "ayer";
  return `hace ${d} días`;
}

function makeLinksClickable(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-violet-400 underline hover:text-violet-300 break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

const CATEGORIAS: { value: Categoria; label: string; color: string }[] = [
  { value: "todos",    label: "🌐 Todos",     color: "bg-slate-700 text-slate-200" },
  { value: "logro",   label: "🏆 Logros",    color: "bg-yellow-600/30 text-yellow-300 border border-yellow-600/40" },
  { value: "pregunta",label: "❓ Preguntas", color: "bg-blue-600/30 text-blue-300 border border-blue-600/40" },
  { value: "tip",     label: "💡 Tips",      color: "bg-emerald-600/30 text-emerald-300 border border-emerald-600/40" },
  { value: "canal",   label: "📺 Canales",   color: "bg-pink-600/30 text-pink-300 border border-pink-600/40" },
  { value: "general", label: "💬 General",   color: "bg-violet-600/30 text-violet-300 border border-violet-600/40" },
];

function categoriaBadge(categoria: string): string {
  const found = CATEGORIAS.find(c => c.value === categoria);
  return found ? found.color : "bg-slate-700 text-slate-300";
}

function categoriaLabel(categoria: string): string {
  const found = CATEGORIAS.find(c => c.value === categoria);
  return found ? found.label : categoria;
}

// ─── Graceful placeholder when Supabase is not configured ────────────────────

const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("https://") &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 10;

function ComingSoonPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <GlobalNav />
      <main className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-5xl">👥</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Comunidad próximamente</h1>
        <p className="text-slate-400 text-base">
          La comunidad ViralScope estará disponible en breve. Configura Supabase para activarla.
        </p>
      </main>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: ComunidadPost;
  userId: string | null;
  likedPostIds: Set<string>;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  isNew?: boolean;
}

function PostCard({ post, userId, likedPostIds, onLike, onDelete, isNew }: PostCardProps) {
  const isOwner = userId === post.user_id;
  const liked = likedPostIds.has(post.id);
  const initial = post.user_email[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={`bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 transition-all ${
        isNew ? "animate-fade-in" : ""
      }`}
      style={isNew ? { animation: "fadeInDown 0.4s ease both" } : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${avatarColor(post.user_id)}`}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-200 truncate">
              {maskEmail(post.user_email)}
            </span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${categoriaBadge(post.categoria)}`}>
              {categoriaLabel(post.categoria)}
            </span>
          </div>
          <p className="text-xs text-slate-500">{timeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-slate-200 leading-relaxed mb-3 break-words whitespace-pre-wrap">
        {makeLinksClickable(post.contenido)}
      </p>

      {/* Canal chip */}
      {post.canal_url && (
        <a
          href={post.canal_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs bg-blue-900/40 border border-blue-700/40 text-blue-300 hover:text-blue-200 px-3 py-1 rounded-full mb-3 transition-colors"
        >
          📺 Ver canal →
        </a>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60">
        <button
          onClick={() => userId && onLike(post.id)}
          disabled={!userId}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            liked
              ? "text-pink-400"
              : userId
              ? "text-slate-500 hover:text-pink-400"
              : "text-slate-600 cursor-not-allowed"
          }`}
        >
          {liked ? "❤️" : "🤍"} {post.likes}
        </button>

        {isOwner && (
          <button
            onClick={() => onDelete(post.id)}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors ml-auto"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ComunidadPage() {
  if (!isSupabaseConfigured) return <ComingSoonPlaceholder />;

  return <ComunidadContent />;
}

function ComunidadContent() {
  const { user } = useAuth();

  // Posts state
  const [posts, setPosts] = useState<ComunidadPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ComunidadPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState<Categoria>("todos");

  // New posts notification
  const [newPostsQueue, setNewPostsQueue] = useState<ComunidadPost[]>([]);
  const [newPostsBanner, setNewPostsBanner] = useState(0);
  const [newPostIds, setNewPostIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledDown = useRef(false);

  // Likes
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());

  // Leaderboard
  const [top, setTop] = useState<TopContribuidor[]>([]);
  const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0 });

  // Online count (use posts count as proxy)
  const [onlineCount, setOnlineCount] = useState(0);

  // Form
  const [contenido, setContenido] = useState("");
  const [categoria, setCategoria] = useState<Exclude<Categoria, "todos">>("general");
  const [canalUrl, setCanalUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Load initial data ──────────────────────────────────────────────────────
  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("comunidad_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setPosts(data as ComunidadPost[]);
      // stats
      const totalLikes = (data as ComunidadPost[]).reduce((s, p) => s + p.likes, 0);
      setStats({ totalPosts: data.length, totalLikes });
      // online proxy
      setOnlineCount(new Set((data as ComunidadPost[]).map(p => p.user_id)).size);
    }
    setLoading(false);
  }, []);

  const loadUserLikes = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("comunidad_likes")
      .select("post_id")
      .eq("user_id", user.id);
    if (data) {
      setLikedPostIds(new Set(data.map((r: { post_id: string }) => r.post_id)));
    }
  }, [user]);

  const loadLeaderboard = useCallback(async () => {
    const { data } = await supabase
      .from("comunidad_posts")
      .select("user_email")
      .limit(200);
    if (!data) return;
    const counts: Record<string, number> = {};
    for (const row of data as { user_email: string }[]) {
      counts[row.user_email] = (counts[row.user_email] ?? 0) + 1;
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([user_email, post_count]) => ({ user_email, post_count }));
    setTop(sorted);
  }, []);

  useEffect(() => {
    loadPosts();
    loadLeaderboard();
  }, [loadPosts, loadLeaderboard]);

  useEffect(() => {
    loadUserLikes();
  }, [loadUserLikes]);

  // ── Filter posts ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (catFilter === "todos") {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.categoria === catFilter));
    }
  }, [posts, catFilter]);

  // ── Real-time subscription ─────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("comunidad")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "comunidad_posts" },
        (payload) => {
          const newPost = payload.new as ComunidadPost;
          if (isScrolledDown.current) {
            setNewPostsQueue(q => [newPost, ...q]);
            setNewPostsBanner(n => n + 1);
          } else {
            setPosts(prev => {
              const exists = prev.some(p => p.id === newPost.id);
              if (exists) return prev;
              return [newPost, ...prev];
            });
            setNewPostIds(ids => new Set([...ids, newPost.id]));
            setTimeout(() => {
              setNewPostIds(ids => {
                const next = new Set(ids);
                next.delete(newPost.id);
                return next;
              });
            }, 1200);
            setStats(s => ({ ...s, totalPosts: s.totalPosts + 1 }));
            setOnlineCount(c => c + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "comunidad_posts" },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setPosts(prev => prev.filter(p => p.id !== deletedId));
          setStats(s => ({ totalPosts: Math.max(0, s.totalPosts - 1), totalLikes: s.totalLikes }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Scroll detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      isScrolledDown.current = el.scrollTop > 200;
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // ── Show queued posts ──────────────────────────────────────────────────────
  function showQueuedPosts() {
    if (newPostsQueue.length === 0) return;
    setPosts(prev => {
      const merged = [...newPostsQueue, ...prev];
      const seen = new Set<string>();
      return merged.filter(p => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    });
    const ids = new Set(newPostsQueue.map(p => p.id));
    setNewPostIds(ids);
    setTimeout(() => setNewPostIds(new Set()), 1200);
    setNewPostsQueue([]);
    setNewPostsBanner(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }

  // ── Submit post ────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !contenido.trim()) return;
    if (contenido.length > 500) {
      setFormError("Máximo 500 caracteres");
      return;
    }
    setSubmitting(true);
    setFormError(null);

    const { error } = await supabase.from("comunidad_posts").insert({
      user_id: user.id,
      user_email: user.email ?? "usuario@anon.com",
      contenido: contenido.trim(),
      categoria,
      canal_url: canalUrl.trim() || null,
    });

    if (error) {
      setFormError(error.message);
    } else {
      setContenido("");
      setCanalUrl("");
      setCategoria("general");
      loadLeaderboard();
    }
    setSubmitting(false);
  }

  // ── Like/Unlike ────────────────────────────────────────────────────────────
  async function handleLike(postId: string) {
    if (!user) return;
    const alreadyLiked = likedPostIds.has(postId);

    if (alreadyLiked) {
      // unlike
      await supabase
        .from("comunidad_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("post_id", postId);
      await supabase
        .from("comunidad_posts")
        .update({ likes: (posts.find(p => p.id === postId)?.likes ?? 1) - 1 })
        .eq("id", postId);
      setLikedPostIds(ids => {
        const next = new Set(ids);
        next.delete(postId);
        return next;
      });
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p))
      );
    } else {
      // like
      await supabase.from("comunidad_likes").insert({ user_id: user.id, post_id: postId });
      const newLikes = (posts.find(p => p.id === postId)?.likes ?? 0) + 1;
      await supabase.from("comunidad_posts").update({ likes: newLikes }).eq("id", postId);
      setLikedPostIds(ids => new Set([...ids, postId]));
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
      );
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(postId: string) {
    if (!user) return;
    await supabase.from("comunidad_posts").delete().eq("id", postId).eq("user_id", user.id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Fade-in keyframe */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <GlobalNav />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            👥{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              Comunidad ViralScope
            </span>
          </h1>
          <p className="text-slate-400 text-sm mb-3">
            Comparte tus logros, tips y canales con otros creadores hispanohablantes
          </p>
          <span className="inline-flex items-center gap-1.5 bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
            🟢 {onlineCount} creadores en línea
          </span>
        </div>

        {/* Layout */}
        <div className="flex gap-6">
          {/* Main feed column */}
          <div className="flex-1 min-w-0">
            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
              {CATEGORIAS.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCatFilter(cat.value)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
                    catFilter === cat.value
                      ? cat.color + " ring-2 ring-violet-500/50"
                      : "bg-slate-800 border-slate-700/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* New post form */}
            {user ? (
              <form
                onSubmit={handleSubmit}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 mb-5"
              >
                <textarea
                  value={contenido}
                  onChange={e => setContenido(e.target.value.slice(0, 500))}
                  placeholder="¿Qué quieres compartir? (máx. 500 caracteres)"
                  rows={3}
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 resize-none mb-2"
                />
                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIAS.filter(c => c.value !== "todos").map(cat => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategoria(cat.value as Exclude<Categoria, "todos">)}
                        className={`text-[11px] px-2.5 py-1 rounded-full font-medium transition-all border ${
                          categoria === cat.value
                            ? cat.color + " ring-1 ring-violet-500/60"
                            : "bg-slate-800 border-slate-700/50 text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  <span
                    className={`text-xs font-mono ${
                      contenido.length > 450 ? "text-orange-400" : "text-slate-500"
                    }`}
                  >
                    {contenido.length}/500
                  </span>
                </div>

                <input
                  type="url"
                  value={canalUrl}
                  onChange={e => setCanalUrl(e.target.value)}
                  placeholder="🔗 Añade tu canal de YouTube (opcional)"
                  className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 mb-3"
                />

                {formError && (
                  <p className="text-red-400 text-xs mb-2">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting || !contenido.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                  }}
                >
                  {submitting ? "Publicando…" : "Publicar"}
                </button>
              </form>
            ) : (
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 mb-5 text-center">
                <p className="text-slate-400 text-sm mb-3">
                  Inicia sesión para participar en la comunidad
                </p>
                <a
                  href="/login"
                  className="inline-block px-5 py-2 rounded-xl text-sm font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
                >
                  Iniciar sesión
                </a>
              </div>
            )}

            {/* New posts banner */}
            {newPostsBanner > 0 && (
              <button
                onClick={showQueuedPosts}
                className="w-full mb-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-700/80 hover:bg-violet-600/80 border border-violet-500/40 transition-all"
              >
                🔔 {newPostsBanner} nuevo{newPostsBanner > 1 ? "s" : ""} post
                {newPostsBanner > 1 ? "s" : ""} — ver ahora
              </button>
            )}

            {/* Feed */}
            <div ref={scrollRef} className="space-y-3 max-h-[calc(100vh-260px)] overflow-y-auto pr-1">
              {loading && (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Cargando comunidad…</p>
                </div>
              )}

              {!loading && filteredPosts.length === 0 && (
                <div className="text-center py-20">
                  <span className="text-5xl block mb-4">🚀</span>
                  <h3 className="text-xl font-bold text-slate-200 mb-2">
                    Sé el primero en compartir algo
                  </h3>
                  <p className="text-slate-500 text-sm">
                    Aún no hay posts en esta categoría. ¡Abre la conversación!
                  </p>
                </div>
              )}

              {!loading &&
                filteredPosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    userId={user?.id ?? null}
                    likedPostIds={likedPostIds}
                    onLike={handleLike}
                    onDelete={handleDelete}
                    isNew={newPostIds.has(post.id)}
                  />
                ))}
            </div>
          </div>

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex flex-col gap-4 w-64 flex-shrink-0">
            {/* Top contributors */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-3">🏆 Top Contribuidores</h3>
              {top.length === 0 ? (
                <p className="text-slate-500 text-xs">Sin datos aún</p>
              ) : (
                <ol className="space-y-2">
                  {top.map((c, i) => (
                    <li key={c.user_email} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 w-4">{i + 1}</span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 ${avatarColor(c.user_email)}`}
                      >
                        {c.user_email[0]?.toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-300 truncate flex-1">
                        {maskEmail(c.user_email)}
                      </span>
                      <span className="text-xs text-violet-400 font-semibold">{c.post_count}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {/* Stats */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-3">📊 Stats de la comunidad</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total posts</span>
                  <span className="text-sm font-bold text-violet-400">{stats.totalPosts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total likes</span>
                  <span className="text-sm font-bold text-pink-400">{stats.totalLikes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Creadores activos</span>
                  <span className="text-sm font-bold text-emerald-400">{onlineCount}</span>
                </div>
              </div>
            </div>

            {/* Category legend */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-200 mb-3">🏷️ Categorías</h3>
              <div className="space-y-1.5">
                {CATEGORIAS.filter(c => c.value !== "todos").map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCatFilter(cat.value)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                      catFilter === cat.value
                        ? cat.color
                        : "text-slate-400 hover:bg-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
