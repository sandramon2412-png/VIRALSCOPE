"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { X, Send, Sparkles, SquarePen, Clock, ArrowLeft, Trash2 } from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

/* ── Constants ─────────────────────────────────────────────────────────── */

const SUGGESTIONS = [
  "💰 ¿Cuánto gana un canal de finanzas?",
  "📈 ¿Cómo aumento mi CTR?",
  "🎬 ¿Por dónde empiezo?",
];

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "¡Hola! Soy ViralBot 👋\n\nSoy experto en monetización de YouTube y en todas las herramientas de ViralScope. ¿En qué te puedo ayudar?",
};

const POS_KEY = "viralscope-assistant-pos";
const CONVOS_KEY = "viralscope-conversations";
const MAX_CONVOS = 20;

/* ── Persistence helpers ───────────────────────────────────────────────── */

function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONVOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  try {
    // Keep only the most recent MAX_CONVOS
    const trimmed = convos.slice(0, MAX_CONVOS);
    localStorage.setItem(CONVOS_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

function loadPosition(): { x: number; y: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { x: number; y: number };
  } catch {
    return null;
  }
}

function savePosition(p: { x: number; y: number }) {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

/* ── Component ─────────────────────────────────────────────────────────── */

export default function FloatingAssistant() {
  const pathname = usePathname();
  const isSalesMode = pathname === "/landing" || pathname === "/pricing";

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"chat" | "history">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const orbRef = useRef<HTMLButtonElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragging = useRef(false);
  const dragMoved = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const pos = useRef({ x: 24, y: 600 });

  /* ── Position ──────────────────────────────────────────────────────── */

  const applyPos = useCallback((x: number, y: number) => {
    pos.current = { x, y };
    if (orbRef.current) {
      orbRef.current.style.left = x + "px";
      orbRef.current.style.top = y + "px";
    }
    if (chatRef.current) {
      const cw = chatRef.current.offsetWidth || 384;
      const ch = chatRef.current.offsetHeight || 480;
      const cx = Math.max(8, Math.min(x, window.innerWidth - cw - 8));
      const cy = Math.max(8, Math.min(y - ch - 12, window.innerHeight - ch - 8));
      chatRef.current.style.left = cx + "px";
      chatRef.current.style.top = cy + "px";
    }
  }, []);

  useEffect(() => {
    const saved = loadPosition();
    const startX = saved?.x ?? 24;
    const startY = saved?.y ?? (window.innerHeight - 80);
    pos.current = { x: startX, y: startY };
    applyPos(startX, startY);
  }, [applyPos]);

  /* ── Load conversations on mount ───────────────────────────────────── */

  useEffect(() => {
    const convos = loadConversations();
    setConversations(convos);
    // Load most recent conversation as active
    if (convos.length > 0) {
      const latest = convos[0];
      setMessages(latest.messages);
      setActiveId(latest.id);
      setShowWelcome(false);
    }
  }, []);

  /* ── Auto-scroll ───────────────────────────────────────────────────── */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (open && view === "chat") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, view]);

  /* ── Save current conversation to the array ────────────────────────── */

  const persistCurrentChat = useCallback(
    (msgs: Message[], id: string | null) => {
      if (msgs.length === 0) return;
      const firstUserMsg = msgs.find((m) => m.role === "user");
      const title = firstUserMsg
        ? truncate(firstUserMsg.content, 40)
        : "Nueva conversación";

      setConversations((prev) => {
        const existing = prev.findIndex((c) => c.id === id);
        const convo: Conversation = {
          id: id || makeId(),
          title,
          messages: msgs,
          updatedAt: Date.now(),
        };
        let updated: Conversation[];
        if (existing >= 0) {
          updated = [...prev];
          updated[existing] = convo;
        } else {
          updated = [convo, ...prev];
        }
        // Sort by most recent
        updated.sort((a, b) => b.updatedAt - a.updatedAt);
        saveConversations(updated);
        return updated;
      });
    },
    []
  );

  /* ── Nuevo Chat ────────────────────────────────────────────────────── */

  const startNewChat = useCallback(() => {
    // Save current conversation first
    if (messages.length > 0) {
      persistCurrentChat(messages, activeId);
    }
    // Start fresh
    setMessages([]);
    setActiveId(null);
    setShowWelcome(true);
    setView("chat");
  }, [messages, activeId, persistCurrentChat]);

  /* ── Load a saved conversation ─────────────────────────────────────── */

  const loadConversation = useCallback(
    (convo: Conversation) => {
      // Save current before switching
      if (messages.length > 0) {
        persistCurrentChat(messages, activeId);
      }
      setMessages(convo.messages);
      setActiveId(convo.id);
      setShowWelcome(false);
      setView("chat");
    },
    [messages, activeId, persistCurrentChat]
  );

  /* ── Delete a saved conversation ───────────────────────────────────── */

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const updated = prev.filter((c) => c.id !== id);
        saveConversations(updated);
        return updated;
      });
      // If we deleted the active one, clear chat
      if (id === activeId) {
        setMessages([]);
        setActiveId(null);
        setShowWelcome(true);
      }
    },
    [activeId]
  );

  /* ── Send message ──────────────────────────────────────────────────── */

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || streaming) return;

      setShowWelcome(false);
      const userMsg: Message = { role: "user", content: trimmed };

      // If no active conversation, create a new ID
      const currentId = activeId || makeId();
      if (!activeId) setActiveId(currentId);

      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      persistCurrentChat(nextMessages, currentId);
      setInput("");
      setStreaming(true);
      setStreamingText("");

      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: nextMessages,
            mode: isSalesMode ? "sales" : "assistant",
          }),
        });

        if (!res.ok || !res.body) {
          throw new Error("Request failed");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          setStreamingText(accumulated);
        }

        const finalMessages = [
          ...nextMessages,
          { role: "assistant" as const, content: accumulated },
        ];
        setMessages(finalMessages);
        persistCurrentChat(finalMessages, currentId);
        setStreamingText("");
      } catch {
        const errorMessages = [
          ...nextMessages,
          {
            role: "assistant" as const,
            content: "Lo siento, hubo un error. Por favor intenta de nuevo. 😅",
          },
        ];
        setMessages(errorMessages);
        persistCurrentChat(errorMessages, currentId);
        setStreamingText("");
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming, isSalesMode, activeId, persistCurrentChat]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  /* ── Drag handlers (mouse) ─────────────────────────────────────────── */

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      dragging.current = true;
      dragMoved.current = false;
      dragOffset.current = {
        x: e.clientX - pos.current.x,
        y: e.clientY - pos.current.y,
      };
      if (orbRef.current) orbRef.current.style.cursor = "grabbing";
      e.preventDefault();
    },
    []
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      dragMoved.current = true;
      const x = Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - 56));
      const y = Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - 56));
      applyPos(x, y);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      if (orbRef.current) orbRef.current.style.cursor = "grab";
      savePosition(pos.current);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [applyPos]);

  /* ── Drag handlers (touch) ─────────────────────────────────────────── */

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLButtonElement>) => {
      dragging.current = true;
      dragMoved.current = false;
      const t = e.touches[0];
      dragOffset.current = {
        x: t.clientX - pos.current.x,
        y: t.clientY - pos.current.y,
      };
    },
    []
  );

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      dragMoved.current = true;
      const t = e.touches[0];
      const x = Math.max(0, Math.min(t.clientX - dragOffset.current.x, window.innerWidth - 56));
      const y = Math.max(0, Math.min(t.clientY - dragOffset.current.y, window.innerHeight - 56));
      applyPos(x, y);
      e.preventDefault();
    };
    const onTouchEnd = () => {
      dragging.current = false;
      savePosition(pos.current);
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyPos]);

  /* ── Styles ────────────────────────────────────────────────────────── */

  const orbStyle: React.CSSProperties = {
    position: "fixed",
    left: pos.current.x,
    top: pos.current.y,
    bottom: "auto",
    zIndex: 9999,
    cursor: "grab",
  };

  const chatStyle: React.CSSProperties = {
    position: "fixed",
    left: pos.current.x,
    top: Math.max(8, pos.current.y - 500),
    zIndex: 9999,
  };

  /* ── Format date ───────────────────────────────────────────────────── */

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Ahora";
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)}h`;
    return d.toLocaleDateString("es", { day: "numeric", month: "short" });
  };

  /* ── Render ────────────────────────────────────────────────────────── */

  return (
    <>
      <style>{`
        @keyframes orb-pulse {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(192,132,252,0.8)) drop-shadow(0 0 18px rgba(139,92,246,0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 12px rgba(192,132,252,1)) drop-shadow(0 0 30px rgba(139,92,246,0.9)); transform: scale(1.1); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Floating Orb */}
      <button
        ref={orbRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => {
          if (!dragMoved.current) {
            if (!open) {
              // Load conversations if not loaded yet
              if (conversations.length === 0) {
                const convos = loadConversations();
                if (convos.length > 0) {
                  setConversations(convos);
                  if (messages.length === 0) {
                    setMessages(convos[0].messages);
                    setActiveId(convos[0].id);
                    setShowWelcome(false);
                  }
                }
              }
            }
            setOpen((prev) => !prev);
          }
          dragMoved.current = false;
        }}
        style={{
          ...orbStyle,
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "transparent",
          border: "none",
          cursor: "grab",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "orb-pulse 2.5s ease-in-out infinite",
          userSelect: "none",
        }}
        aria-label="Abrir ViralBot"
      >
        <Sparkles
          size={28}
          style={{
            color: "#c084fc",
            filter:
              "drop-shadow(0 0 8px rgba(192,132,252,1)) drop-shadow(0 0 20px rgba(139,92,246,0.8))",
          }}
        />
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid #0f172a",
            animation: "pulse-dot 2s ease-in-out infinite",
          }}
        />
      </button>

      {/* Chat Window */}
      {open && (
        <div
          ref={chatRef}
          style={{
            ...chatStyle,
            width: "clamp(320px, 90vw, 384px)",
            height: "clamp(384px, 70vh, 480px)",
            display: "flex",
            flexDirection: "column",
            background: "rgba(10, 10, 20, 0.35)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            borderRadius: "1rem",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.7), rgba(236,72,153,0.7))",
              backdropFilter: "blur(8px)",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexShrink: 0,
            }}
          >
            {view === "history" ? (
              <button
                onClick={() => setView("chat")}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "none",
                  borderRadius: "50%",
                  width: 28,
                  height: 28,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label="Volver al chat"
              >
                <ArrowLeft size={14} color="white" />
              </button>
            ) : (
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={16} color="white" />
              </div>
            )}

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
              >
                {view === "history" ? "Historial" : "ViralBot"}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 11,
                  lineHeight: 1.2,
                }}
              >
                {view === "history"
                  ? `${conversations.length} conversación${conversations.length !== 1 ? "es" : ""}`
                  : isSalesMode
                    ? "Atención al Cliente · ViralScope"
                    : "IA Experta en YouTube"}
              </div>
            </div>

            {view === "chat" && (
              <>
                {/* Online indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    marginRight: 4,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#22c55e",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 11 }}>
                    En línea
                  </span>
                </div>

                {/* History button */}
                {conversations.length > 0 && (
                  <button
                    onClick={() => {
                      // Save current before viewing history
                      if (messages.length > 0) {
                        persistCurrentChat(messages, activeId);
                      }
                      setView("history");
                    }}
                    title="Ver historial"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      border: "none",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                    aria-label="Historial"
                  >
                    <Clock size={13} color="white" />
                  </button>
                )}

                {/* Nuevo Chat button */}
                <button
                  onClick={startNewChat}
                  title="Nuevo chat"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    border: "none",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label="Nuevo chat"
                >
                  <SquarePen size={13} color="white" />
                </button>
              </>
            )}

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 28,
                height: 28,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-label="Cerrar"
            >
              <X size={14} color="white" />
            </button>
          </div>

          {/* ── HISTORY VIEW ─────────────────────────────────────────── */}
          {view === "history" && (
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              {conversations.length === 0 ? (
                <div
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    textAlign: "center",
                    padding: 24,
                    fontSize: 13,
                  }}
                >
                  No hay conversaciones guardadas
                </div>
              ) : (
                conversations.map((convo) => (
                  <div
                    key={convo.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background:
                        convo.id === activeId
                          ? "rgba(124, 58, 237, 0.25)"
                          : "rgba(255,255,255,0.04)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                      border:
                        convo.id === activeId
                          ? "1px solid rgba(124, 58, 237, 0.4)"
                          : "1px solid transparent",
                    }}
                    onClick={() => loadConversation(convo)}
                    onMouseEnter={(e) => {
                      if (convo.id !== activeId)
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      if (convo.id !== activeId)
                        e.currentTarget.style.background =
                          "rgba(255,255,255,0.04)";
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.9)",
                          fontSize: 12,
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {convo.title}
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.4)",
                          fontSize: 10,
                          marginTop: 2,
                        }}
                      >
                        {convo.messages.length} mensajes · {formatDate(convo.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(convo.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 4,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0.4,
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "0.4";
                      }}
                      title="Eliminar conversación"
                    >
                      <Trash2 size={12} color="#ef4444" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── CHAT VIEW ────────────────────────────────────────────── */}
          {view === "chat" && (
            <>
              {/* Messages Area */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Welcome state */}
                {showWelcome && messages.length === 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    <MessageBubble message={WELCOME_MESSAGE} />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 11,
                          paddingLeft: 4,
                        }}
                      >
                        Preguntas frecuentes:
                      </span>
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestion(s)}
                          style={{
                            background: "rgba(124, 58, 237, 0.15)",
                            border: "1px solid rgba(124, 58, 237, 0.3)",
                            borderRadius: 12,
                            padding: "8px 12px",
                            cursor: "pointer",
                            color: "rgba(255,255,255,0.85)",
                            fontSize: 12,
                            textAlign: "left",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgba(124, 58, 237, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            (
                              e.currentTarget as HTMLButtonElement
                            ).style.background = "rgba(124, 58, 237, 0.15)";
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message bubbles */}
                {messages.map((msg, i) => (
                  <MessageBubble key={i} message={msg} />
                ))}

                {/* Streaming message */}
                {streaming && streamingText && (
                  <MessageBubble
                    message={{ role: "assistant", content: streamingText }}
                  />
                )}

                {/* Typing indicator */}
                {streaming && !streamingText && <TypingIndicator />}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleSubmit}
                style={{
                  padding: "12px 16px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(0,0,0,0.15)",
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={streaming}
                  placeholder="Pregúntame sobre YouTube..."
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    padding: "8px 12px",
                    fontSize: 13,
                    color: "white",
                    outline: "none",
                    opacity: streaming ? 0.5 : 1,
                  }}
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      streaming || !input.trim()
                        ? "rgba(124, 58, 237, 0.3)"
                        : "linear-gradient(135deg, #7c3aed, #ec4899)",
                    border: "none",
                    cursor:
                      streaming || !input.trim() ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "opacity 0.15s",
                  }}
                  aria-label="Enviar"
                >
                  <Send size={16} color="white" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "85%",
          padding: "8px 12px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser
            ? "rgba(124, 58, 237, 0.35)"
            : "rgba(255, 255, 255, 0.08)",
          fontSize: 13,
          color: "rgba(255,255,255,0.92)",
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", justifyContent: "flex-start" }}>
      <div
        style={{
          padding: "10px 14px",
          borderRadius: "18px 18px 18px 4px",
          background: "rgba(30, 41, 59, 0.85)",
          display: "flex",
          gap: 4,
          alignItems: "center",
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "rgba(139, 92, 246, 0.8)",
              display: "inline-block",
              animation: `typing 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
