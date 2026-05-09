import { NextRequest, NextResponse } from "next/server";

const YT_API = "https://www.googleapis.com/youtube/v3";

interface KeywordResult {
  keyword: string;
  volumenEstimado: "Muy Alto" | "Alto" | "Medio" | "Bajo";
  totalResults: number;
  competencia: "Alta" | "Media" | "Baja";
  oportunidad: number;
  topVideoViews: number;
  cpc_estimado: string;
  sugerida: boolean;
}

async function getAutocompleteSuggestions(
  keyword: string,
  idioma: string
): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(keyword)}&hl=${idioma}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    const text = await res.text();
    // JSONP response: window.google.ac.h(["keyword",[["suggestion1",...],...],...])
    // or plain JSON array: ["keyword",[["suggestion",0],...]
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return [];
    const parsed = JSON.parse(match[0]);
    // parsed[1] is array of [suggestion, score, ...]
    const suggestions: string[] = [];
    if (Array.isArray(parsed[1])) {
      for (const item of parsed[1]) {
        if (typeof item[0] === "string" && item[0] !== keyword) {
          suggestions.push(item[0]);
        }
      }
    }
    return suggestions.slice(0, 8);
  } catch {
    return [];
  }
}

async function getTopVideoViews(
  videoId: string,
  apiKey: string
): Promise<number> {
  try {
    const res = await fetch(
      `${YT_API}/videos?part=statistics&id=${videoId}&key=${apiKey}`
    );
    const data = await res.json();
    const views = data?.items?.[0]?.statistics?.viewCount;
    return views ? parseInt(views, 10) : 0;
  } catch {
    return 0;
  }
}

function detectCpcCategory(keyword: string): string {
  const kw = keyword.toLowerCase();
  const financeKws = [
    "dinero", "finanzas", "inversion", "inversión", "trading", "crypto",
    "bitcoin", "forex", "bolsa", "banco", "credito", "crédito", "prestamo",
    "préstamo", "hipoteca", "ahorro", "retiro", "jubilacion", "jubilación",
    "money", "finance", "invest", "stock", "fund", "loan", "mortgage",
  ];
  const techKws = [
    "inteligencia artificial", "ia", "ai", "programacion", "programación",
    "software", "tecnologia", "tecnología", "app", "código", "python",
    "javascript", "machine learning", "blockchain", "coding", "tech",
    "computadora", "digital", "cyber", "robot",
  ];
  if (financeKws.some((f) => kw.includes(f))) return "finance";
  if (techKws.some((t) => kw.includes(t))) return "tech";
  return "general";
}

function getCpcEstimado(keyword: string): string {
  const cat = detectCpcCategory(keyword);
  if (cat === "finance") return "$0.50-$2.00";
  if (cat === "tech") return "$0.30-$1.50";
  return "$0.05-$0.50";
}

function getVolumenEstimado(
  totalResults: number
): "Muy Alto" | "Alto" | "Medio" | "Bajo" {
  if (totalResults > 5_000_000) return "Muy Alto";
  if (totalResults > 1_000_000) return "Alto";
  if (totalResults > 100_000) return "Medio";
  return "Bajo";
}

function getCompetencia(totalResults: number): "Alta" | "Media" | "Baja" {
  if (totalResults > 5_000_000) return "Alta";
  if (totalResults > 500_000) return "Media";
  return "Baja";
}

function getOportunidad(
  volumen: "Muy Alto" | "Alto" | "Medio" | "Bajo",
  competencia: "Alta" | "Media" | "Baja"
): number {
  if (
    (volumen === "Muy Alto" || volumen === "Alto") &&
    competencia === "Baja"
  ) {
    return Math.round(80 + Math.random() * 20);
  }
  if (volumen === "Medio" && competencia === "Media") {
    return Math.round(50 + Math.random() * 20);
  }
  if (
    (volumen === "Muy Alto" || volumen === "Alto") &&
    competencia === "Media"
  ) {
    return Math.round(55 + Math.random() * 20);
  }
  if (volumen === "Medio" && competencia === "Baja") {
    return Math.round(65 + Math.random() * 15);
  }
  if (volumen === "Bajo") {
    return Math.round(20 + Math.random() * 20);
  }
  // Alta competencia + Alto volumen
  return Math.round(30 + Math.random() * 20);
}

async function analyzeKeyword(
  term: string,
  idioma: string,
  apiKey: string,
  sugerida: boolean
): Promise<KeywordResult> {
  try {
    const searchRes = await fetch(
      `${YT_API}/search?part=snippet&q=${encodeURIComponent(term)}&type=video&maxResults=5&relevanceLanguage=${idioma}&key=${apiKey}`
    );
    const searchData = await searchRes.json();

    const totalResults: number =
      searchData?.pageInfo?.totalResults ?? 0;

    const firstVideoId: string | undefined =
      searchData?.items?.[0]?.id?.videoId;

    const topVideoViews = firstVideoId
      ? await getTopVideoViews(firstVideoId, apiKey)
      : 0;

    const volumenEstimado = getVolumenEstimado(totalResults);
    const competencia = getCompetencia(totalResults);
    const oportunidad = getOportunidad(volumenEstimado, competencia);
    const cpc_estimado = getCpcEstimado(term);

    return {
      keyword: term,
      volumenEstimado,
      totalResults,
      competencia,
      oportunidad,
      topVideoViews,
      cpc_estimado,
      sugerida,
    };
  } catch {
    return {
      keyword: term,
      volumenEstimado: "Bajo",
      totalResults: 0,
      competencia: "Baja",
      oportunidad: 20,
      topVideoViews: 0,
      cpc_estimado: getCpcEstimado(term),
      sugerida,
    };
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword");
  const idioma = searchParams.get("idioma") || "es";

  if (!keyword) {
    return NextResponse.json(
      { error: "Falta el parámetro keyword" },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "YOUTUBE_API_KEY no configurada" },
      { status: 500 }
    );
  }

  // Step 1: Get autocomplete suggestions
  const suggestions = await getAutocompleteSuggestions(keyword, idioma);

  // Step 2: Build list of terms (original + up to 8 suggestions)
  const terms: Array<{ term: string; sugerida: boolean }> = [
    { term: keyword, sugerida: false },
    ...suggestions.map((s) => ({ term: s, sugerida: true })),
  ];

  // Step 3: Analyze each term (sequential to avoid rate limits)
  const results: KeywordResult[] = [];
  for (const { term, sugerida } of terms) {
    const result = await analyzeKeyword(term, idioma, apiKey, sugerida);
    results.push(result);
  }

  return NextResponse.json({ keywords: results, query: keyword });
}
