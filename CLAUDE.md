# ViralScope — CLAUDE.md

## Descripción del Proyecto
ViralScope es una plataforma SaaS para creadores de contenido en YouTube hispanohablantes. Permite crear canales desde cero con IA, analizar nichos, generar guiones, logos, banners, y gestionar la producción con un kanban integrado.

---

## Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.1 | Framework (App Router, Turbopack) |
| TypeScript | Latest | Tipado estático |
| Tailwind CSS | Latest | Estilos (tema oscuro) |
| Supabase | Latest | Autenticación y base de datos |
| Anthropic Claude | claude-haiku-4-5-20251001 | IA para generación de contenido |
| OpenAI DALL-E 3 | Latest | Generación de imágenes (logos/banners) |
| Lucide React | Latest | Iconografía |

---

## Estructura de Archivos

```
app/src/
├── app/
│   ├── layout.tsx              # Root layout con AuthProvider + FloatingAssistant
│   ├── page.tsx                # Landing page principal
│   ├── api/                    # API Routes (Next.js Route Handlers)
│   │   ├── crear-canal/        # Genera identidad completa del canal (IA)
│   │   ├── logo/               # Genera logo y banner con DALL-E 3
│   │   ├── guion/              # Genera guiones con streaming
│   │   ├── crear-contenido/    # Pipeline de creación: títulos→hook→guion→SEO→miniaturas
│   │   ├── download-image/     # Proxy para descargar imágenes (evita CORS)
│   │   ├── search/             # Búsqueda de videos en YouTube
│   │   ├── plan/               # Plan de 30 videos
│   │   ├── titulos/            # Generador de títulos virales
│   │   ├── hooks/              # Generador de hooks
│   │   ├── miniatura/          # Análisis y generación de miniaturas
│   │   ├── outlier/            # Cálculo de Outlier Score
│   │   ├── emular/             # Emulación de canales
│   │   ├── canal/              # Análisis de canal
│   │   ├── competencia/        # Análisis de competencia
│   │   ├── seo/                # Optimización SEO
│   │   ├── hashtags/           # Generador de hashtags
│   │   ├── branding/           # Branding del canal
│   │   └── assistant/          # Chat assistant (FloatingAssistant)
│   ├── crear-canal/            # Wizard completo de creación de canal (6 pasos)
│   ├── crear-contenido/        # Pipeline de producción de video
│   ├── guion/                  # Editor de guiones con streaming
│   ├── kanban/                 # Tablero Kanban de producción
│   ├── proyectos/              # Lista de proyectos/canales
│   ├── titulos/                # Generador de títulos
│   ├── hooks/                  # Banco de hooks
│   ├── plantillas/             # Plantillas de guión
│   ├── calculadora/            # Calculadora de ingresos YouTube
│   ├── rpm-paises/             # RPM por país y nicho
│   ├── miniatura/              # Analizador de miniaturas
│   ├── plan/                   # Planificador de 30 videos
│   ├── dashboard/              # Dashboard principal
│   ├── outlier/                # Análisis Outlier Score
│   ├── trending/               # Videos en tendencia
│   ├── emular/                 # Emulador de canales
│   ├── canal/                  # Análisis de canal específico
│   ├── pricing/                # Página de precios
│   ├── landing/                # Landing page alternativa
│   └── login/                  # Autenticación
├── components/
│   ├── GlobalNav.tsx           # Navegación principal (todas las páginas)
│   ├── FloatingAssistant.tsx   # Chat widget IA flotante
│   ├── AuthContext.tsx         # Contexto de autenticación Supabase
│   └── ProtectedRoute.tsx      # HOC para rutas protegidas
└── lib/
    └── utils.ts                # formatNumber(), cn(), utilidades
```

---

## Convenciones de Código

### Tema Visual
- **Fondo base**: `bg-slate-950` (negro azulado)
- **Superficies**: `bg-slate-800/40`, `bg-slate-900/60`
- **Bordes**: `border-slate-700/50`
- **Texto primario**: `text-slate-100` / `text-white`
- **Texto secundario**: `text-slate-400`, `text-slate-500`
- **Color de acento**: `#a78bfa` (violet-400) — usado en TODOS los iconos

### Iconos (Lucide React)
- **Un solo color** en toda la app: `style={{ color: "#a78bfa" }}`
- Tamaños: 11px–32px según contexto
- **Nunca usar emojis** como iconos — siempre Lucide

```tsx
// Correcto
<Sparkles size={20} style={{ color: "#a78bfa" }} />

// Patrón para iconos dinámicos (React.ElementType en data structures)
interface Item { icon: React.ElementType }
const Icon = item.icon;
return <Icon size={20} style={{ color: "#a78bfa" }} />;

// IIFE para iconos en línea
{(() => { const MI = item.icon; return <MI size={20} style={{ color: "#a78bfa" }} />; })()}
```

### Páginas con useSearchParams
**OBLIGATORIO**: toda página que use `useSearchParams()` debe tener Suspense:

```tsx
function PageContent() {
  const params = useSearchParams();
  // ... componente real
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>}>
      <PageContent />
    </Suspense>
  );
}
```

### Variables de Entorno
```
VIRALSCOPE_AI_KEY=      # Anthropic API Key
OPENAI_API_KEY=         # OpenAI API Key (DALL-E 3)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
YOUTUBE_API_KEY=        # YouTube Data API v3
RESEND_API_KEY=         # Email (Resend)
```

---

## Modelos de IA Usados

| Uso | Modelo |
|---|---|
| Generación de contenido (títulos, guiones, hooks, SEO) | `claude-haiku-4-5-20251001` |
| Logos y banners | DALL-E 3 via `openai` SDK |
| Streaming de guiones | `claude-haiku-4-5-20251001` con `messages.stream()` |

---

## Flujo Principal: Crear Canal (Wizard 6 pasos)

```
Paso 0 → Elegir tipo de entrada (cero / canal / emular / video / miniatura / outlier)
Paso 1 → Config (nicho, tipo faceless/presencial, idioma)
Paso 2 → Elegir ángulo de contenido (generado por IA)
Paso 3 → Elegir nombre del canal (generado por IA)
Paso 4 → Branding (logo + banner + descripción + bio + guión trailer + plan 8 videos)
         → Al hacer clic "Ir al Kanban": guarda datos en localStorage y navega
```

### localStorage Keys
- `viralscope-proyectos` — lista de proyectos del usuario
- `kanban-${nombreCanal}` — columnas del kanban para ese canal

### Kanban Pre-población
Cuando se selecciona nombre (paso 3), `saveKanbanIfEmpty(nombre, aiResult)` guarda las ideas de IA en localStorage. El kanban lee esto al cargar.

---

## API Routes Importantes

### `/api/crear-canal` (POST)
Genera identidad completa del canal. Retorna: `angulos`, `nombres`, `descripcionCanal`, `palabrasClave`, `pilares`, `audiencia`, `gancho`, `paletaColores`, `bioRedes`, `guionTrailer`, `planContenido[]`.

### `/api/logo` (POST)
Genera logo (1024×1024) o banner (1792×1024) con DALL-E 3. Claude genera el prompt primero, luego DALL-E lo ejecuta. Los colores vienen del campo `paletaColores` del canal (NO hardcodeados).

### `/api/download-image` (GET)
Proxy servidor para descargar imágenes de DALL-E (evita CORS del browser). Parámetros: `?url=...&filename=...`

### `/api/guion` (POST streaming)
Genera guión completo con streaming SSE. Soporta duraciones: `"60 seg"`, `"90 seg"`, `"3 min"`, `"5 min"` ... `"20 min"`. Videos ≤90 seg usan estructura de Shorts.

---

## Patrones a Recordar

### Descarga de imágenes (DALL-E tiene CORS)
```tsx
// NUNCA hacer fetch directo desde el browser a URLs de DALL-E
// SIEMPRE usar el proxy:
function downloadImage(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

### Parseo de duración (segundos vs minutos)
```ts
function parseDuracionAMinutos(dur: string): number {
  const val = parseInt(dur) || 10;
  return dur.toLowerCase().includes("seg") ? val / 60 : val;
}
```

---

## Comandos

```bash
npm run dev      # Servidor de desarrollo (puerto 3000)
npm run build    # Build de producción
npx tsc --noEmit # Verificar tipos sin compilar
```

---

## Notas Importantes

1. **No romper Suspense**: cualquier página nueva con `useSearchParams` DEBE envolverse en `<Suspense>`.
2. **Colores de imágenes**: NUNCA hardcodear `"morado, rosa y naranja"`. Los colores se generan dinámicamente según el nicho via `paletaColores`.
3. **Kanban key**: el key es `kanban-${nombreCanal}` — debe coincidir exactamente entre crear-canal y kanban.
4. **Lucide icons**: verificar que el icono existe antes de importar: `node --input-type=module -e "import * as l from 'lucide-react'; console.log(!!l.IconName)"`.
5. **`React.ElementType`**: para iconos en objetos de datos, usar este tipo (no `ReactNode`).
