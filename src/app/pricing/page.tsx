"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, Zap, Star, Crown } from "lucide-react";
import GlobalNav from "@/components/GlobalNav";

const FREE_FEATURES = [
  "Buscador viral (5 búsquedas/día)",
  "Análisis de canal básico",
  "Trending topics (vista limitada)",
  "3 títulos por generación",
  "1 guión por día",
  "Calculadora de ingresos",
  "Plan de 30 videos (1 por mes)",
  "Nichos TOP 100",
];

const PRO_FEATURES = [
  "Búsquedas ilimitadas",
  "Outlier por Video — kit de clonación",
  "Crear Canal con IA (proyectos ilimitados)",
  "Crear Contenido — flujo completo (Título→Hook→Guión→SEO→Miniatura)",
  "Generador de guiones ilimitado + marcadores emocionales",
  "Miniaturas IA (DALL-E 3) — 50/mes",
  "Face Swap en miniaturas",
  "Dimension — prompts cinematográficos",
  "Análisis de thumbnail con visión IA",
  "Top Channels por nicho",
  "Kanban planificador ilimitado",
  "Mis Proyectos — historial completo",
  "Alertas de nichos",
  "Exportar PDF completo",
];

const COMPARISON_ROWS = [
  { feature: "Búsquedas virales", free: "5/día", pro: "Ilimitadas" },
  { feature: "Generador de guiones", free: "1/día", pro: "Ilimitado" },
  { feature: "Títulos por generación", free: "3", pro: "Ilimitados" },
  { feature: "Miniaturas con IA", free: false, pro: "50/mes" },
  { feature: "Crear Canal con IA", free: false, pro: true },
  { feature: "Outlier por Video", free: false, pro: true },
  { feature: "Kanban planificador", free: false, pro: true },
  { feature: "Alertas de nichos", free: false, pro: true },
  { feature: "Exportar PDF", free: false, pro: true },
  { feature: "Face Swap en miniaturas", free: false, pro: true },
];

const FAQS = [
  {
    question: "¿Puedo cancelar en cualquier momento?",
    answer: "Sí, sin permanencia ni penalidades. Cancela cuando quieras desde tu panel de cuenta y no se te cobrará más.",
  },
  {
    question: "¿Necesito tarjeta de crédito para el plan gratuito?",
    answer: "No, solo tu email. Empieza gratis sin introducir ningún dato de pago.",
  },
  {
    question: "¿Qué métodos de pago aceptan?",
    answer: "Próximamente: tarjeta de crédito/débito, PayPal y transferencia bancaria.",
  },
];

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) return <Check className="w-4 h-4 text-green-400 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-white/20 mx-auto" />;
  return <span className="text-xs font-medium text-white/70">{value}</span>;
}

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  const proMonthlyPrice = annual ? "11.40" : "19";
  const proBillingNote = annual ? "facturado $137/año" : "facturado mensualmente";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <h1
            className="text-4xl sm:text-5xl font-black mb-3 tracking-tight"
            style={{
              background: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Elige tu plan
          </h1>
          <p className="text-white/50 text-lg mb-8">
            Empieza gratis. Escala cuando estés listo.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 rounded-full px-4 py-2"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}>
            <span className={`text-sm font-medium transition-colors ${!annual ? "text-white" : "text-white/40"}`}>
              Mensual
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-11 h-6 rounded-full transition-all duration-300 ${annual ? "bg-purple-600" : "bg-white/15"}`}
              aria-label="Toggle annual billing"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${annual ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? "text-white" : "text-white/40"}`}>
              Anual
            </span>
            {annual && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                }}
              >
                Ahorra 40%
              </span>
            )}
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {/* Free card */}
          <div
            className="rounded-2xl p-7 flex flex-col"
            style={{
              background: "linear-gradient(135deg, rgba(25,20,40,0.7), rgba(15,12,22,0.7))",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-white/40" />
                <span className="text-sm font-semibold text-white/50 uppercase tracking-widest">Free</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-white/40 text-sm mb-1">/mes</span>
              </div>
              <p className="text-white/30 text-sm">Para siempre</p>
            </div>

            <ul className="space-y-3 flex-1 mb-8">
              {FREE_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-white/65">
                  <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all border border-white/15 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/5"
            >
              Empezar gratis
            </Link>
          </div>

          {/* Pro card */}
          <div
            className="rounded-2xl p-7 flex flex-col relative"
            style={{
              background: "linear-gradient(135deg, rgba(88,28,220,0.15), rgba(236,72,153,0.08), rgba(15,12,22,0.80))",
              border: "1px solid rgba(139,92,246,0.5)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 40px rgba(139,92,246,0.15), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            {/* Badge */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase"
              style={{ background: "linear-gradient(135deg, #8b5cf6, #ec4899)" }}
            >
              MÁS POPULAR
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-semibold text-purple-300 uppercase tracking-widest">Pro</span>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-4xl font-black text-white">${proMonthlyPrice}</span>
                <span className="text-white/40 text-sm mb-1">/mes</span>
              </div>
              <p className="text-white/30 text-sm">{proBillingNote}</p>
            </div>

            <p className="text-xs font-semibold text-purple-300/70 uppercase tracking-widest mb-3">
              Todo lo de Free, más:
            </p>

            <ul className="space-y-3 flex-1 mb-8">
              {PRO_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-white/80">
                  <Zap className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/login?plan=pro"
              className="block w-full text-center py-3 rounded-xl font-bold text-sm transition-all text-white"
              style={{
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                boxShadow: "0 4px 20px rgba(139,92,246,0.4)",
              }}
            >
              Comenzar Pro →
            </Link>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mb-16">
          <h2 className="text-xl font-bold text-center mb-6 text-white/80">Comparativa de planes</h2>
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <th className="text-left px-5 py-3 text-white/30 font-semibold uppercase text-xs tracking-widest">
                    Característica
                  </th>
                  <th className="text-center px-5 py-3 text-white/40 font-semibold text-xs uppercase tracking-widest w-24">
                    Free
                  </th>
                  <th className="text-center px-5 py-3 font-semibold text-xs uppercase tracking-widest w-24"
                    style={{
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    style={{
                      borderBottom: i < COMPARISON_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined,
                    }}
                  >
                    <td className="px-5 py-3 text-white/60">{row.feature}</td>
                    <td className="px-5 py-3 text-center">
                      <CellValue value={row.free} />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <CellValue value={row.pro} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-bold text-center mb-6 text-white/80">Preguntas frecuentes</h2>
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl px-5 py-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="font-semibold text-white/80 mb-1.5 text-sm">{faq.question}</p>
                <p className="text-white/45 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
