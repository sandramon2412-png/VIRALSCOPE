import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

interface KanbanCard {
  id?: string;
  title?: string;
  content?: string;
  text?: string;
  [key: string]: unknown;
}

interface KanbanColumn {
  id?: string;
  title?: string;
  name?: string;
  cards?: KanbanCard[];
  [key: string]: unknown;
}

interface ExportBody {
  canalNombre: string;
  proyecto?: {
    nombre?: string;
    handle?: string;
    nicho?: string;
    descripcion?: string;
    faceless?: boolean;
    creadoEn?: string;
    [key: string]: unknown;
  };
  kanban?: KanbanColumn[];
  plan?: {
    videos?: unknown[];
    [key: string]: unknown;
  };
}

function cardToText(card: KanbanCard): string {
  return card.title ?? card.content ?? card.text ?? JSON.stringify(card);
}

function columnsToText(columns: KanbanColumn[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const col of columns) {
    const colName = (col.title ?? col.name ?? "columna").toLowerCase().trim();
    const lines = (col.cards ?? []).map((c, i) => `${i + 1}. ${cardToText(c)}`);
    result[colName] = lines.length > 0 ? lines.join("\n") : "(sin tarjetas)";
  }
  return result;
}

export async function POST(req: NextRequest) {
  let body: ExportBody;
  try {
    body = (await req.json()) as ExportBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { canalNombre, proyecto, kanban, plan } = body;

  if (!canalNombre) {
    return NextResponse.json({ error: "canalNombre is required" }, { status: 400 });
  }

  const safe = canalNombre.replace(/[^a-zA-Z0-9_\-]/g, "-");
  const zip = new JSZip();
  const root = zip.folder(`canal-${safe}`);
  if (!root) {
    return NextResponse.json({ error: "Failed to create zip folder" }, { status: 500 });
  }

  // README.txt
  const readmeLines = [
    `ViralScope — Exportación de proyecto`,
    `=====================================`,
    `Canal: ${canalNombre}`,
    `Exportado: ${new Date().toLocaleString("es-ES")}`,
    ``,
    `Contenido del ZIP:`,
    `  branding/info.txt       — Información del canal`,
    `  kanban/ideas.txt        — Ideas pendientes`,
    `  kanban/guion.txt        — Videos en guion`,
    `  kanban/otros.txt        — Otras columnas del Kanban`,
    plan ? `  plan/plan-30-videos.txt — Plan de 30 videos` : "",
    ``,
    `Generado por ViralScope — https://viralscope.app`,
  ].filter(l => l !== undefined);
  root.file("README.txt", readmeLines.join("\n"));

  // branding/info.txt
  const brandingFolder = root.folder("branding");
  if (brandingFolder) {
    const infoLines = [
      `=== Información del canal ===`,
      ``,
      `Nombre: ${proyecto?.nombre ?? canalNombre}`,
      `Handle: ${proyecto?.handle ?? ""}`,
      `Nicho: ${proyecto?.nicho ?? ""}`,
      `Descripción: ${proyecto?.descripcion ?? ""}`,
      `Faceless: ${proyecto?.faceless ? "Sí" : "No"}`,
      `Creado: ${proyecto?.creadoEn ? new Date(proyecto.creadoEn).toLocaleDateString("es-ES") : ""}`,
    ];
    brandingFolder.file("info.txt", infoLines.join("\n"));
  }

  // kanban/
  const kanbanFolder = root.folder("kanban");
  if (kanbanFolder) {
    if (kanban && Array.isArray(kanban) && kanban.length > 0) {
      const colTexts = columnsToText(kanban);

      // ideas.txt — look for "ideas" column
      const ideasKey = Object.keys(colTexts).find(k => k.includes("idea")) ?? null;
      const ideasContent = ideasKey
        ? `=== Ideas ===\n\n${colTexts[ideasKey]}`
        : "=== Ideas ===\n\n(sin datos)";
      kanbanFolder.file("ideas.txt", ideasContent);

      // guion.txt — look for "guion" column
      const guionKey = Object.keys(colTexts).find(k => k.includes("guion") || k.includes("guión") || k.includes("script")) ?? null;
      const guionContent = guionKey
        ? `=== Guión ===\n\n${colTexts[guionKey]}`
        : "=== Guión ===\n\n(sin datos)";
      kanbanFolder.file("guion.txt", guionContent);

      // otros.txt — all other columns
      const otherKeys = Object.keys(colTexts).filter(k => k !== ideasKey && k !== guionKey);
      if (otherKeys.length > 0) {
        const otrosSections = otherKeys.map(k => `=== ${k} ===\n\n${colTexts[k]}`);
        kanbanFolder.file("otros.txt", otrosSections.join("\n\n---\n\n"));
      } else {
        kanbanFolder.file("otros.txt", "(sin otras columnas)");
      }
    } else {
      kanbanFolder.file("ideas.txt", "=== Ideas ===\n\n(sin datos)");
      kanbanFolder.file("guion.txt", "=== Guión ===\n\n(sin datos)");
      kanbanFolder.file("otros.txt", "(sin otras columnas)");
    }
  }

  // plan/plan-30-videos.txt
  if (plan) {
    const planFolder = root.folder("plan");
    if (planFolder) {
      const videos = plan.videos;
      let planText = "=== Plan de 30 videos ===\n\n";
      if (Array.isArray(videos) && videos.length > 0) {
        planText += videos
          .map((v, i) => {
            if (typeof v === "string") return `${i + 1}. ${v}`;
            if (typeof v === "object" && v !== null) {
              const obj = v as Record<string, unknown>;
              const titulo = obj.titulo ?? obj.title ?? obj.nombre ?? JSON.stringify(v);
              const semana = obj.semana ?? obj.week ?? "";
              return `${i + 1}. ${titulo}${semana ? ` (Semana ${semana})` : ""}`;
            }
            return `${i + 1}. ${String(v)}`;
          })
          .join("\n");
      } else {
        planText += JSON.stringify(plan, null, 2);
      }
      planFolder.file("plan-30-videos.txt", planText);
    }
  }

  // Generate ZIP buffer
  const uint8 = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(uint8.buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="viralscope-${safe}.zip"`,
    },
  });
}
