# ViralScope — CLAUDE.md (Actualizado)

## Descripción del Proyecto
ViralScope es una plataforma SaaS para creadores de contenido en YouTube hispanohablantes. Permite crear canales desde cero con IA, analizar nichos, generar guiones, logos, banners, y gestionar la producción con un kanban integrado.

**URL de producción:** https://viralscope-mu.vercel.app  
**Repositorio GitHub:** https://github.com/sandramon2412-png/VIRALSCOPE  
**Proyecto Supabase:** https://ooytblswihtjlokyaigu.supabase.co  

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
| hls.js | 1.6.16 | Reproducción video HLS en el hero |
| ElevenLabs | Latest | Texto a voz (TTS) |
| Resend | Latest | Email transaccional |

---

## Variables de Entorno (.env.local)

```env
YOUTUBE_API_KEY=AIzaSyAqhnq9gN0WGjozaHbojf9Ns1bGqRpN3BQ
VIRALSCOPE_AI_KEY=sk-ant-api03-...         # Anthropic API Key
ELEVENLABS_API_KEY=sk_305f202a...           # ElevenLabs TTS
OPENAI_API_KEY=sk-proj-bNXan...             # OpenAI DALL-E 3
NEXT_PUBLIC_SUPABASE_URL=https://ooytblswihtjlokyaigu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...  # Supabase anon key
```

> ⚠️ Todas estas variables están también configuradas en Vercel (Settings → Environment Variables).

---

## Estructura de Archivos Completa

```
app/src/
├── app/
│   ├── layout.tsx                  # Root layout: AuthProvider + FloatingAssistant
│   ├── page.tsx                    # Dashboard principal con buscador YouTube + Onboarding wizard
│   ├── landing/page.tsx            # Marketing landing page con pricing (VIDEO HERO AQUÍ)
│   ├── login/page.tsx              # Autenticación Supabase
│   ├── auth/callback/page.tsx      # OAuth callback
│   ├── dashboard/page.tsx          # Dashboard de usuario logueado
│   ├── pricing/page.tsx            # Página de precios
│   │
│   ├── api/                        # API Routes (Next.js Route Handlers)
│   │   ├── crear-canal/route.ts    # Identidad completa del canal (IA) — max_tokens:4000
│   │   ├── logo/route.ts           # Logo (1024×1024) y banner (1792×1024) con DALL-E 3
│   │   ├── guion/route.ts          # Guiones con streaming SSE — soporta "60 seg" a "20 min"
│   │   ├── crear-contenido/route.ts # Pipeline: títulos→hook→guion→seo→miniaturas
│   │   ├── download-image/route.ts  # Proxy CORS para imágenes DALL-E
│   │   ├── search/route.ts          # Búsqueda YouTube Data API v3
│   │   ├── plan/route.ts            # Plan de 30 videos
│   │   ├── titulos/route.ts         # Generador de títulos virales
│   │   ├── hooks/route.ts           # Generador de hooks
│   │   ├── miniatura/route.ts       # Análisis de miniaturas
│   │   ├── miniatura/analizar/route.ts # Análisis avanzado miniatura
│   │   ├── miniatura/image/route.ts    # Generación con DALL-E 3
│   │   ├── outlier/route.ts         # Cálculo Outlier Score
│   │   ├── emular/route.ts          # Emulación de canales
│   │   ├── canal/route.ts           # Análisis de canal
│   │   ├── competencia/route.ts     # Análisis de competencia
│   │   ├── seo/route.ts             # Optimización SEO
│   │   ├── hashtags/route.ts        # Generador de hashtags
│   │   ├── branding/route.ts        # Branding del canal
│   │   ├── assistant/route.ts       # Chat IA flotante (FloatingAssistant)
│   │   ├── trending/route.ts        # Videos en tendencia
│   │   ├── top-channels/route.ts    # Top canales
│   │   ├── nichos/route.ts          # Nichos rentables
│   │   ├── ab-test/route.ts         # A/B test de thumbnails/títulos
│   │   ├── analyze/route.ts         # Análisis general
│   │   ├── branding/route.ts        # Branding IA
│   │   ├── comentarios/route.ts     # Análisis de comentarios
│   │   ├── credits/route.ts         # Sistema de créditos
│   │   ├── dimension/route.ts       # Dimensiones de video
│   │   ├── email/route.ts           # Email con Resend
│   │   ├── export/route.ts          # Exportar a PDF/ZIP
│   │   ├── faceswap/route.ts        # Face swap para miniaturas
│   │   ├── tts/route.ts             # Text-to-speech ElevenLabs
│   │   └── youtube-analytics/route.ts # YouTube Analytics
│   │
│   ├── crear-canal/page.tsx         # Wizard 6 pasos de creación de canal
│   ├── crear-contenido/page.tsx     # Pipeline de producción de video (5 pasos)
│   ├── guion/page.tsx               # Editor de guiones con streaming
│   ├── kanban/page.tsx              # Tablero Kanban de producción
│   ├── proyectos/page.tsx           # Lista de proyectos/canales
│   ├── titulos/page.tsx             # Generador de títulos
│   ├── hooks/page.tsx               # Banco de hooks
│   ├── plantillas/page.tsx          # Plantillas de guión
│   ├── plantillas-capcut/page.tsx   # Plantillas CapCut
│   ├── calculadora/page.tsx         # Calculadora de ingresos YouTube
│   ├── rpm-paises/page.tsx          # RPM por país y nicho
│   ├── miniatura/page.tsx           # Analizador de miniaturas
│   ├── plan/page.tsx                # Planificador de 30 videos ← tiene Suspense wrapper
│   ├── outlier/page.tsx             # Análisis Outlier Score
│   ├── trending/page.tsx            # Videos en tendencia
│   ├── emular/page.tsx              # Emulador de canales
│   ├── canal/page.tsx               # Análisis de canal específico
│   ├── competencia/page.tsx         # Análisis de competencia
│   ├── seo/page.tsx                 # SEO de videos
│   ├── branding/page.tsx            # Branding con IA
│   ├── logo/page.tsx                # Generador de logo/banner
│   ├── hashtags/page.tsx            # Generador de hashtags
│   ├── ab-test/page.tsx             # A/B test
│   ├── dimension/page.tsx           # Dimensiones de video
│   ├── nichos/page.tsx              # Nichos rentables
│   ├── top-channels/page.tsx        # Top canales
│   ├── academia/page.tsx            # Academia/recursos educativos
│   ├── alertas/page.tsx             # Alertas de tendencias
│   ├── calendario/page.tsx          # Calendario de publicaciones
│   ├── comentarios/page.tsx         # Análisis de comentarios
│   ├── comunidad/page.tsx           # Comunidad
│   ├── guia/page.tsx                # Guía de uso
│   ├── monetizacion/page.tsx        # Monetización
│   ├── perfil/page.tsx              # Perfil de usuario
│   ├── prompts-edicion/page.tsx     # Prompts para edición de video
│   └── recursos/page.tsx            # Recursos útiles
│
├── components/
│   ├── GlobalNav.tsx                # Navegación principal (todas las páginas)
│   ├── FloatingAssistant.tsx        # Chat widget IA flotante
│   ├── VideoCard.tsx                # Card de video con Outlier Score
│   ├── WelcomeBanner.tsx            # Banner de bienvenida
│   ├── AlertaNotification.tsx       # Notificaciones de alertas
│   ├── AnalysisPanel.tsx            # Panel de análisis
│   ├── OutlierBadge.tsx             # Badge del Outlier Score
│   ├── NavAuth.tsx                  # Autenticación en nav
│   └── ProtectedRoute.tsx           # HOC para rutas protegidas
│
├── contexts/
│   └── AuthContext.tsx              # Contexto de autenticación Supabase
│
├── hooks/
│   ├── useCredits.ts                # Hook para sistema de créditos
│   └── useGuardar.ts                # Hook para guardar videos favoritos
│
└── lib/
    ├── types.ts                     # SearchResponse, VideoResult, etc.
    ├── canal-types.ts               # Tipos para crear-canal
    ├── nichos.ts                    # Lista de nichos disponibles
    ├── supabase.ts                  # Cliente Supabase
    └── utils.ts                     # formatNumber(), cn(), utilidades
```

---

## Convenciones de Código

### Tema Visual
- **Fondo base**: `bg-[#0a0812]` o `bg-slate-950` (negro azulado)
- **Superficies**: `bg-slate-800/40`, `bg-slate-900/60`, `rgba(255,255,255,0.04)`
- **Bordes**: `border-slate-700/50`, `rgba(139,92,246,0.2)`
- **Texto primario**: `text-slate-100` / `text-white`
- **Texto secundario**: `text-slate-400`, `text-white/45`
- **Color de acento**: `#a78bfa` (violet-400) — TODOS los iconos
- **Gradiente principal**: `linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)`

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

### Páginas con useSearchParams — OBLIGATORIO Suspense
```tsx
function PageContent() {
  const params = useSearchParams();
  // ... componente real
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PageContent />
    </Suspense>
  );
}
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
Paso 1 → Config (nicho, tipo faceless/presencial/marca, idioma)
Paso 2 → Elegir ángulo de contenido (generado por IA)
Paso 3 → Elegir nombre del canal (generado por IA)
         → saveKanbanIfEmpty(nombre, aiResult) ← SE LLAMA AQUÍ con aiResult explícito
Paso 4 → Branding:
         - Logo + Banner (DALL-E 3, colores del paletaColores del nicho)
         - Descripción del canal
         - Bio para redes sociales
         - Guión del trailer
         - Plan de 8 videos con hooks
         → "Ir al Kanban": navega a /kanban?canal=NombreCanal
```

### localStorage Keys
- `viralscope-proyectos` — lista de proyectos del usuario
- `kanban-${nombreCanal}` — columnas del kanban para ese canal

### Kanban — Carga Sincrónica (IMPORTANTE)
El kanban usa **lazy initializer** de useState para leer localStorage de forma síncrona, evitando el problema de "kanban vacío":

```tsx
function loadColumnsFromStorage(canal: string): KanbanColumn[] {
  if (typeof window === "undefined") return DEFAULT_COLUMNS;
  try {
    const raw = localStorage.getItem(`kanban-${canal}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return DEFAULT_COLUMNS.map(def => {
          const found = parsed.find((p: KanbanColumn) => p.id === def.id);
          return found ? { ...def, cards: Array.isArray(found.cards) ? found.cards : [] } : def;
        });
      }
    }
  } catch {}
  return DEFAULT_COLUMNS;
}
// USO — lazy init:
const [columns, setColumns] = useState<KanbanColumn[]>(() => loadColumnsFromStorage(canalName));
```

---

## API Routes — Detalles Importantes

### `/api/crear-canal` (POST)
- `max_tokens: 4000`
- Genera: `angulos`, `nombres`, `descripcionCanal`, `palabrasClave`, `pilares`, `audiencia`, `gancho`, `paletaColores`, `bioRedes`, `guionTrailer`, `planContenido[]`
- `paletaColores` es niche-specific (cocina→rojos/dorados, tech→azul eléctrico, etc.)

### `/api/logo` (POST)
- Genera logo (1024×1024) o banner (1792×1024) con DALL-E 3
- `colores: aiResult?.paletaColores || ""` — NUNCA hardcodear colores
- Claude genera el prompt primero, luego DALL-E lo ejecuta

### `/api/download-image` (GET)
- Proxy servidor — evita CORS de DALL-E CDN
- Params: `?url=...&filename=...`

### `/api/guion` (POST streaming)
- SSE streaming con `messages.stream()`
- Duraciones: `"60 seg"`, `"90 seg"`, `"3 min"`, `"5 min"` ... `"20 min"`
- Videos ≤1.5 minutos usan estructura de Shorts
- Parseo crítico: `"60 seg"` ≠ 60 minutos

### `/api/crear-contenido` (POST)
- `paso`: `"titulos"` | `"hook"` | `"guion"` | `"seo"` | `"miniaturas"`
- Acepta campo `duracion` para el paso guion

---

## Patrones Críticos

### Descarga de imágenes DALL-E (CORS)
```tsx
// NUNCA hacer fetch directo desde el browser a URLs de DALL-E
function downloadImage(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = `/api/download-image?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
```

### Parseo de duración — CRÍTICO
```ts
function parseDuracionAMinutos(dur: string): number {
  const val = parseInt(dur) || 10;
  const lower = dur.toLowerCase();
  // "60 seg" = 60 segundos = 1 minuto, NO 60 minutos
  if (lower.includes("seg") || lower.includes("sec") || lower.endsWith("s")) {
    return val / 60;
  }
  return val;
}
const durMinutos = parseDuracionAMinutos(duracion);
const esCorto = durMinutos <= 1.5; // Shorts structure
```

### Video de fondo en landing/page.tsx
```tsx
// public/hero-bg.mp4 (94MB — considerar comprimir)
<video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
  <source src="/hero-bg.mp4" type="video/mp4" />
</video>
```
> ⚠️ El archivo `public/hero-bg.mp4` pesa 94MB. Está en `.gitignore` por el aviso de GitHub (>50MB). Para producción se recomienda comprimir a <10MB con Handbrake.

### Video HLS con hls.js (si se necesita en el futuro)
```tsx
// Para streams .m3u8 — hls.js v1.6.16 ya instalado
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;
  let hlsInstance: import("hls.js").default | null = null;
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = HLS_URL; // Safari — nativo
    video.play().catch(() => {});
  } else {
    import("hls.js").then(({ default: Hls }) => {
      if (!Hls.isSupported()) return;
      hlsInstance = new Hls({ autoStartLoad: true, startLevel: -1 });
      hlsInstance.loadSource(HLS_URL);
      hlsInstance.attachMedia(video);
      // CRÍTICO: llamar play() en MANIFEST_PARSED, NO confiar en autoPlay HTML
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
    });
  }
  return () => { hlsInstance?.destroy(); };
}, []);
```

---

## Despliegue (Deployment)

### Vercel
- **URL producción:** https://viralscope-mu.vercel.app
- **Cuenta:** sandramon2412-png (GitHub)
- **Auto-deploy:** cada push a `main` dispara un nuevo deploy
- **Variables de entorno:** configuradas en Vercel → Settings → Environment Variables

### GitHub
- **Repo:** https://github.com/sandramon2412-png/VIRALSCOPE
- **Rama principal:** `main`

### Supabase
- **Proyecto ID:** `ooytblswihtjlokyaigu`
- **URL:** https://ooytblswihtjlokyaigu.supabase.co
- **⚠️ IMPORTANTE:** Este proyecto pertenece a UNA CUENTA DIFERENTE al GitHub (otra dirección de email)
- **Auth → URL Configuration ya configurado:**
  - Site URL: `https://viralscope-mu.vercel.app`
  - Redirect URLs: `https://viralscope-mu.vercel.app/**`, `http://localhost:3000`, `http://localhost:3000/**`

---

## Bugs Resueltos en Esta Sesión

### 1. Kanban vacío al venir desde proyectos
- **Causa:** `saveKanbanIfEmpty` se llamaba en `step===5` via useEffect, que nunca ejecutaba si `aiResult` era null
- **Fix:** Mover la llamada a `handleSelectNombre` (paso 3) con `aiResult` pasado explícitamente; kanban usa lazy `useState(() => loadColumnsFromStorage(canal))`

### 2. Imágenes robóticas y siempre del mismo color
- **Causa:** `colores: "morado, rosa y naranja vibrante"` hardcodeados en las llamadas a la API de logo/banner
- **Fix:** Agregar `paletaColores` al resultado de `crear-canal` y pasarlo dinámicamente

### 3. Guión de "60 seg" generaba 9 minutos
- **Causa:** `parseInt("60 seg") = 60` tratado como 60 minutos
- **Fix:** `parseDuracionAMinutos()` detecta sufijo "seg" y divide entre 60

### 4. Wizard de crear-canal solo mostraba logo/banner
- **Fix:** Agregar secciones en paso 4: bio para redes, guión del trailer, plan de 8 videos con hooks

### 5. Build error en `/plan/page.tsx`
- **Causa:** `useSearchParams()` sin `<Suspense>` wrapper
- **Fix:** Separar en `PlanPageContent` + `PlanPage` con `<Suspense>`

### 6. Video de fondo en hero (landing) no reproducía
- **Causa 1:** Se colocó en `page.tsx` (dashboard) en vez de `landing/page.tsx`
- **Causa 2:** Con HLS.js, el atributo `autoPlay` HTML no dispara cuando HLS controla la fuente
- **Fix:** Llamar `video.play()` explícitamente en evento `MANIFEST_PARSED` de HLS.js

---

## GPU Local — Face Swap con ComfyUI + ReActor

La página `/miniatura` tiene una funcionalidad de **Face Swap** que usa la GPU NVIDIA local.

### Cómo funciona
- La app llama a `/api/faceswap/route.ts`
- Ese route se conecta a **ComfyUI corriendo localmente en `http://localhost:8188`**
- ComfyUI usa el nodo **ReActor** para hacer el swap de cara en la miniatura
- **Requiere GPU NVIDIA** para funcionar correctamente (CUDA)

### Setup requerido (en la máquina local)
1. Tener **ComfyUI** instalado y corriendo: `http://localhost:8188`
2. Tener el nodo **ReActor** instalado en ComfyUI
3. GPU NVIDIA con drivers CUDA actualizados
4. La app Next.js también corriendo en `localhost:3000`

### Cambiar la URL de ComfyUI
En `src/app/api/faceswap/route.ts`, línea 5:
```ts
const COMFYUI_URL = "http://localhost:8188"; // ← cambiar si es otro puerto o IP
```

### Flujo técnico
1. Usuario sube foto de su cara + miniatura generada
2. Se suben ambas imágenes a ComfyUI via API
3. Se ejecuta el workflow de ReActor
4. ComfyUI devuelve la miniatura con la cara aplicada

> ⚠️ Esta funcionalidad **solo funciona en desarrollo local** (no en Vercel), ya que requiere ComfyUI corriendo en la misma máquina.

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo (puerto 3000)
npm run build        # Build de producción
npx tsc --noEmit     # Verificar tipos sin compilar
git push origin main # Deploy automático a Vercel
```

---

## Notas Importantes (NO OLVIDAR)

1. **Suspense obligatorio** en toda página con `useSearchParams()`
2. **NUNCA hardcodear colores** para imágenes — usar `paletaColores` del nicho
3. **Kanban key** = `kanban-${nombreCanal}` — debe coincidir entre crear-canal y kanban
4. **Verificar iconos Lucide** antes de importar: `node --input-type=module -e "import * as l from 'lucide-react'; console.log(!!l.IconName)"`
5. **`React.ElementType`** para iconos en objetos de datos (no `ReactNode`)
6. **Proxy de imágenes** — NUNCA fetch directo a URLs de DALL-E desde el browser
7. **Parseo de duración** — siempre usar `parseDuracionAMinutos()` para distinguir "seg" de "min"
8. **Supabase** es de otra cuenta — para cambios en Auth/URL Configuration hay que loguearse con el email original de Supabase (no con GitHub sandramon2412-png)
9. **Video hero** — `public/hero-bg.mp4` (94MB). GitHub advierte que es >50MB pero lo acepta. Para optimizar: comprimir con Handbrake a H.264, CRF 28, 720p
10. **Puerto 3000** — puede estar ocupado por otra instancia de Next.js; verificar antes de `npm run dev`
