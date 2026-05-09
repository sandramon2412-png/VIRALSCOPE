"use client";

import GlobalNav from "@/components/GlobalNav";
import Link from "next/link";
import {
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Clock,
  Users,
  Play,
  Shield,
  Briefcase,
} from "lucide-react";

const STEPS = [
  {
    num: 1,
    title: "Verifica que cumples los requisitos",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "from-emerald-500 to-green-400",
    items: [
      "Entra a YouTube Studio → Monetización",
      "YouTube te muestra una barra de progreso con tus horas y suscriptores actuales",
      "Si no cumples aún: activa notificaciones para cuando los alcances",
    ],
    tip: "Puedes ver tu progreso exacto en YouTube Studio > Monetización > Visión general",
  },
  {
    num: 2,
    title: "Activa la 2FA en tu cuenta de Google",
    icon: <Shield className="w-5 h-5" />,
    color: "from-blue-500 to-cyan-400",
    items: [
      "Ve a myaccount.google.com → Seguridad → Verificación en dos pasos",
      "⚠️ OBLIGATORIO: YouTube requiere 2FA activo para aplicar",
      "Usa la app Google Authenticator o un número de teléfono",
    ],
    tip: "Sin 2FA activo, el botón de solicitud no aparecerá",
  },
  {
    num: 3,
    title: "Lee y acepta las políticas",
    icon: <Play className="w-5 h-5" />,
    color: "from-violet-500 to-purple-400",
    items: [
      "Lee las Políticas de monetización de YouTube",
      "Acepta los Términos del Programa de Socios de YouTube",
      "Revisa las Directrices de la comunidad",
      "⚠️ Importante: violaciones activas bloquean la solicitud",
    ],
    tip: null,
  },
  {
    num: 4,
    title: "Crea o vincula tu cuenta de AdSense",
    icon: <DollarSign className="w-5 h-5" />,
    color: "from-yellow-500 to-amber-400",
    items: [
      "YouTube Studio → Monetización → Inscribirse",
      "Si ya tienes AdSense: vincula la cuenta existente",
      "Si no tienes: YouTube te guía para crear una nueva",
      "⚠️ Solo puedes tener UNA cuenta de AdSense por persona",
      "El proceso de aprobación de AdSense toma 2-4 semanas",
    ],
    tip: null,
  },
  {
    num: 5,
    title: "Envía la solicitud",
    icon: <CheckCircle className="w-5 h-5" />,
    color: "from-emerald-500 to-teal-400",
    items: [
      "YouTube Studio → Monetización → Iniciar",
      'Haz clic en "Solicitar" o "Inscribirse en el Programa de Socios"',
      "YouTube revisará tu canal manualmente (puede tomar 1 mes o más)",
      "Recibirás un email cuando la revisión esté completa",
    ],
    tip: null,
  },
  {
    num: 6,
    title: "Espera la revisión manual",
    icon: <Clock className="w-5 h-5" />,
    color: "from-orange-500 to-red-400",
    items: [
      "El equipo de YouTube revisa: contenido original, cumplimiento de políticas, calidad general",
      "Tiempo promedio: 2-4 semanas (puede extenderse)",
      "Si te rechazan: puedes volver a solicitar después de 30 días",
    ],
    tip: "Sigue publicando durante la espera — más contenido = mejor señal",
  },
  {
    num: 7,
    title: "Configura tus preferencias de anuncios",
    icon: <Users className="w-5 h-5" />,
    color: "from-pink-500 to-rose-400",
    items: [
      "Una vez aprobado: ve a YouTube Studio → Monetización → Anuncios",
      "Activa los tipos de anuncio: display, superpuestos, antes del video, durante el video (para videos +8min)",
      "Configura categorías de contenido sensible que quieres excluir",
    ],
    tip: "Los anuncios durante el video (mid-roll) son los más rentables — actívalos en videos de más de 8 minutos",
  },
];

const COMMON_MISTAKES = [
  "❌ Contenido sin declarar (usar música, clips con copyright sin licencia)",
  "❌ Contenido reutilizado sin valor agregado (compilaciones sin edición)",
  "❌ Thumbnails engañosas (clickbait que no corresponde al contenido)",
  "❌ Canal demasiado nuevo con pocos videos (menos de 10-15 videos)",
  "❌ Videos con contenido para adultos sin restricción de edad",
  "❌ Título o descripción con spam de palabras clave",
];

const RPM_TABLE = [
  { nicho: "Finanzas / Inversiones", rpm: "$8 - $18", ganancia: "$800 - $1,800" },
  { nicho: "Legal / Seguros", rpm: "$12 - $28", ganancia: "$1,200 - $2,800" },
  { nicho: "Software / SaaS", rpm: "$6 - $14", ganancia: "$600 - $1,400" },
  { nicho: "Salud / Bienestar", rpm: "$4 - $10", ganancia: "$400 - $1,000" },
  { nicho: "Educación", rpm: "$3 - $8", ganancia: "$300 - $800" },
  { nicho: "Entretenimiento", rpm: "$1 - $3", ganancia: "$100 - $300" },
  { nicho: "Gaming", rpm: "$1 - $4", ganancia: "$100 - $400" },
  { nicho: "Curiosidades / Viral", rpm: "$2 - $5", ganancia: "$200 - $500" },
];

const OTHER_INCOME = [
  {
    icon: "🤝",
    title: "Patrocinios",
    req: "desde 10K subs",
    range: "$200-$2,000 por video",
  },
  {
    icon: "⭐",
    title: "Membresías",
    req: "desde 1K subs",
    range: "$2-$25/mes por miembro",
  },
  {
    icon: "💝",
    title: "Super Thanks",
    req: "desde 5K subs",
    range: "Propinas directas",
  },
  {
    icon: "🔗",
    title: "Marketing de afiliados",
    req: "Sin requisitos",
    range: "$10-$200 por venta",
  },
  {
    icon: "📦",
    title: "Productos digitales",
    req: "Sin requisitos",
    range: "Margen del 90%+",
  },
];

export default function MonetizacionPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <GlobalNav />

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
            💰 Cómo Monetizar tu Canal de YouTube
          </h1>
          <p className="text-slate-400 text-lg mb-6 max-w-2xl mx-auto">
            Guía completa paso a paso para solicitar el Programa de Socios de YouTube
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-1.5 rounded-full">
              ✅ Actualizado 2026
            </span>
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm font-semibold px-4 py-1.5 rounded-full">
              🎯 Mercado Hispanohablante
            </span>
          </div>
        </div>

        {/* Section 1 — Requisitos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>📋</span> Requisitos para aplicar
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mb-5">
            {/* Tier 1 */}
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                  Tier 1
                </span>
                <span className="font-bold text-white">Monetización Básica</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  500 suscriptores
                </li>
                <li className="flex items-start gap-2">
                  <Play className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  3 videos públicos en los últimos 90 días
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  3,000 horas de visualización en los últimos 12 meses
                </li>
                <li className="flex items-start gap-2">
                  <Play className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  O 3 millones de vistas en Shorts en los últimos 90 días
                </li>
              </ul>
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                <p className="text-xs text-amber-300 font-medium">Desbloquea:</p>
                <p className="text-xs text-slate-400 mt-1">Super Thanks, membresías, productos</p>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-slate-900/50 border border-yellow-500/40 rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.05), rgba(15,23,42,0.8))" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">
                  Tier 2 ⭐
                </span>
                <span className="font-bold text-yellow-300">AdSense completo</span>
              </div>
              <ul className="space-y-2 text-slate-300 text-sm mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  1,000 suscriptores ✅
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  4,000 horas de visualización en 12 meses ✅
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  O 10 millones de vistas en Shorts en 90 días ✅
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Cuenta de AdSense vinculada
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  Sin advertencias activas de la comunidad
                </li>
              </ul>
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-3">
                <p className="text-xs text-yellow-300 font-medium">Desbloquea:</p>
                <p className="text-xs text-slate-400 mt-1">Anuncios en videos, todos los ingresos disponibles</p>
              </div>
            </div>
          </div>

          {/* Universal requirement note */}
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-200">
              <span className="font-semibold">Requisito universal:</span> residir en un país donde el Programa de Socios esté disponible. Incluye México, España, Colombia, Argentina, Chile y la mayoría de países de Latinoamérica.
            </p>
          </div>
        </section>

        {/* Section 2 — Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">🪜 Pasos para solicitar</h2>
          <div className="space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5"
              >
                <div className="flex items-start gap-4">
                  {/* Step number */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg bg-gradient-to-br ${step.color}`}
                  >
                    {step.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                      <span className={`text-transparent bg-clip-text bg-gradient-to-r ${step.color}`}>
                        {step.icon}
                      </span>
                      Paso {step.num} — {step.title}
                    </h3>
                    <ul className="space-y-1.5 mb-3">
                      {step.items.map((item, i) => (
                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                          <span className="text-slate-500 mt-0.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                    {step.tip && (
                      <div className="bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-2">
                        <p className="text-xs text-slate-400">
                          <span className="text-emerald-400 font-semibold">💡 Tip:</span>{" "}
                          {step.tip}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Common Mistakes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
            Errores comunes que retrasan la aprobación
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {COMMON_MISTAKES.map((mistake, i) => (
              <div
                key={i}
                className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4"
              >
                <p className="text-sm text-amber-200">{mistake}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4 — Earnings */}
        <section className="mb-12">
          <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-400" />
              💵 Ingresos reales por nicho en español
            </h2>
            <p className="text-slate-400 text-sm mb-6">Estimados de RPM y ganancias por 100,000 vistas</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left py-3 px-3 text-slate-400 font-semibold">Nicho</th>
                    <th className="text-center py-3 px-3 text-slate-400 font-semibold">RPM estimado</th>
                    <th className="text-right py-3 px-3 text-slate-400 font-semibold">Ganancias por 100K vistas</th>
                  </tr>
                </thead>
                <tbody>
                  {RPM_TABLE.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3 px-3 text-white font-medium">{row.nicho}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold text-center">{row.rpm}</td>
                      <td className="py-3 px-3 text-emerald-300 text-right">{row.ganancia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
              <p className="text-xs text-slate-400">
                <span className="text-amber-400 font-semibold">⚠️ Nota:</span> Los RPM varían según el país del espectador. Audiencias de España y EE.UU. generan 3-5x más que audiencias de México o Argentina en promedio.
              </p>
            </div>

            <div className="mt-5">
              <Link
                href="/calculadora"
                className="inline-flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 font-semibold px-5 py-2.5 rounded-xl transition-all text-sm"
              >
                → Usa la Calculadora de ViralScope para estimar tus ingresos exactos
              </Link>
            </div>
          </div>
        </section>

        {/* Section 5 — Other income */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Briefcase size={20} style={{ color: "#a78bfa" }} /> Fuentes adicionales de ingresos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {OTHER_INCOME.map((source, i) => (
              <div
                key={i}
                className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-colors"
              >
                <div className="text-2xl mb-2">{source.icon}</div>
                <h3 className="font-bold text-white mb-1">{source.title}</h3>
                <p className="text-xs text-slate-500 mb-2">{source.req}</p>
                <p className="text-sm text-emerald-400 font-semibold">{source.range}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
