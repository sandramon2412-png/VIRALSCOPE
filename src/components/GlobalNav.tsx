"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame, Menu, X, ChevronDown,
  Search, Zap, TrendingUp, Trophy, Tv2, Swords, Bell,
  BarChart3, KeyRound, Users, MessageSquare, Type, Mic, Image,
  Palette, Sparkles, Box, FileText, Hash, TestTube2, Layout,
  Film, PenTool, Package, BookOpen, CalendarDays, Target,
  Calculator, Globe, DollarSign, CreditCard, GraduationCap,
  FolderOpen, Wand2, Kanban,
} from "lucide-react";
import NavAuth from "@/components/NavAuth";

interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  label: string;
  links: NavLink[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Investigar",
    links: [
      { href: "/", label: "Buscador viral", icon: Search },
      { href: "/outlier", label: "Outlier por Video", icon: Zap },
      { href: "/nichos", label: "Nichos rentables", icon: TrendingUp },
      { href: "/trending", label: "Trending topics", icon: Flame },
      { href: "/top-channels", label: "Top Channels", icon: Trophy },
      { href: "/canal", label: "Análisis de canal", icon: Tv2 },
      { href: "/competencia", label: "Competencia", icon: Swords },
      { href: "/alertas", label: "Alertas", icon: Bell },
      { href: "/dashboard", label: "Mi Canal", icon: BarChart3 },
      { href: "/seo", label: "SEO de Keywords", icon: KeyRound },
      { href: "/comunidad", label: "Comunidad", icon: Users },
      { href: "/comentarios", label: "Análisis de Comentarios", icon: MessageSquare },
    ]
  },
  {
    label: "Crear",
    links: [
      { href: "/titulos", label: "Títulos virales", icon: Type },
      { href: "/hooks", label: "Banco de hooks", icon: Mic },
      { href: "/miniatura", label: "Miniaturas IA", icon: Image },
      { href: "/logo", label: "Logo + Banner", icon: Palette },
      { href: "/branding", label: "Branding con IA", icon: Sparkles },
      { href: "/dimension", label: "Dimension", icon: Box },
      { href: "/guion", label: "Generador de Guión", icon: FileText },
      { href: "/hashtags", label: "Generador de Hashtags", icon: Hash },
      { href: "/ab-test", label: "A/B Miniaturas", icon: TestTube2 },
      { href: "/plantillas", label: "Plantillas de Videos", icon: Layout },
      { href: "/plantillas-capcut", label: "Plantillas CapCut", icon: Film },
      { href: "/prompts-edicion", label: "Prompts Edición", icon: PenTool },
      { href: "/recursos", label: "Recursos por Nicho", icon: Package },
    ]
  },
  {
    label: "Planificar",
    links: [
      { href: "/guia", label: "Guía de uso", icon: BookOpen },
      { href: "/calendario", label: "Calendario", icon: CalendarDays },
      { href: "/plan", label: "Plan 30 videos", icon: CalendarDays },
      { href: "/emular", label: "Emular canal", icon: Target },
      { href: "/calculadora", label: "Calculadora", icon: Calculator },
      { href: "/rpm-paises", label: "RPM por País", icon: Globe },
      { href: "/monetizacion", label: "Guía de Monetización", icon: DollarSign },
      { href: "/pricing", label: "Precios", icon: CreditCard },
      { href: "/academia", label: "Academia", icon: GraduationCap },
    ]
  },
  {
    label: "Proyectos",
    links: [
      { href: "/proyectos", label: "Mis Proyectos", icon: FolderOpen },
      { href: "/crear-canal", label: "Crear canal con IA", icon: Wand2 },
      { href: "/kanban", label: "Kanban", icon: Kanban },
    ]
  }
];

export default function GlobalNav({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const active = activePath || pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 px-4 py-3 bg-transparent">
      {/* Pill-shaped glassmorphism nav */}
      <div
        className="max-w-6xl mx-auto rounded-full flex items-center justify-between gap-4 px-5 h-12"
        style={{
          background: "linear-gradient(135deg, rgba(29,26,45,0.85), rgba(15,12,22,0.80))",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(139,92,246,0.25)",
          boxShadow: "0 4px 32px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.04)"
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)" }}>
            <Flame className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-base tracking-tight"
            style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            ViralScope
          </span>
        </Link>

        {/* Desktop nav — dropdown groups */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {NAV_GROUPS.map(group => {
            const isGroupActive = group.links.some(l => l.href === active);
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <button className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-all ${
                  isGroupActive
                    ? "text-white bg-white/15 font-medium"
                    : "text-white/50 hover:text-white hover:bg-white/8"
                }`}>
                  {group.label}
                  <ChevronDown size={11} className={`transition-transform duration-200 ${openGroup === group.label ? "rotate-180" : ""}`} />
                </button>

                {openGroup === group.label && (
                  <div className="absolute left-0 top-full pt-2 z-50">
                    <div className="rounded-2xl shadow-2xl shadow-black/80 p-1.5 min-w-[210px]"
                      style={{
                        background: "linear-gradient(135deg, rgba(25,20,40,0.98), rgba(12,10,22,0.97))",
                        border: "1px solid rgba(139,92,246,0.25)",
                        backdropFilter: "blur(20px)",
                      }}>
                      {group.links.map(link => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                            active === link.href
                              ? "bg-white/10 text-white font-medium"
                              : "text-white/55 hover:bg-white/6 hover:text-white"
                          }`}
                        >
                          <link.icon size={13} className="opacity-60 flex-shrink-0" style={{ color: "#a78bfa" }} />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <NavAuth />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-1.5 rounded-full bg-white/8 hover:bg-white/15 transition-colors text-white/70"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-6xl rounded-2xl px-4 py-4"
          style={{
            background: "linear-gradient(135deg, rgba(25,20,40,0.97), rgba(12,10,22,0.96))",
            border: "1px solid rgba(139,92,246,0.2)",
            backdropFilter: "blur(20px)",
          }}>
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-4 last:mb-0">
              <p className="text-xs text-white/30 uppercase tracking-widest font-bold mb-2 px-1">{group.label}</p>
              <div className="grid grid-cols-2 gap-1">
                {group.links.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-xl transition-colors ${
                      active === link.href
                        ? "bg-white/15 text-white font-medium"
                        : "bg-white/4 text-white/55 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    <link.icon size={13} className="opacity-60 flex-shrink-0" style={{ color: "#a78bfa" }} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
