import { NextRequest, NextResponse } from "next/server";

function getDateString(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const metric = req.nextUrl.searchParams.get("metric");

  if (!token) {
    return NextResponse.json({ error: "No token", code: 401 }, { status: 401 });
  }

  const headers = { Authorization: `Bearer ${token}` };

  try {
    if (metric === "channel") {
      const url =
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&mine=true";
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "YouTube API error", code: res.status },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (metric === "analytics") {
      const startDate = getDateString(30);
      const endDate = getDateString(0);
      const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost,likes,comments&dimensions=day`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "YouTube Analytics API error", code: res.status },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (metric === "topvideos") {
      const startDate = getDateString(28);
      const endDate = getDateString(0);
      const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewPercentage,likes,comments,subscribersGained,impressions,impressionClickThroughRate&dimensions=video&sort=-views&maxResults=10`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "YouTube Analytics API error", code: res.status },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (metric === "video_details") {
      const videoIds = req.nextUrl.searchParams.get("videoIds");
      if (!videoIds) {
        return NextResponse.json({ error: "No videoIds provided", code: 400 }, { status: 400 });
      }
      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoIds)}`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "YouTube Data API error", code: res.status },
          { status: res.status }
        );
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (metric === "retention") {
      const startDate = getDateString(28);
      const endDate = getDateString(0);
      const url = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=${startDate}&endDate=${endDate}&metrics=relativeRetentionPerformance,audienceWatchRatio&dimensions=elapsedVideoTimeRatio&sort=elapsedVideoTimeRatio&maxResults=100`;
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return NextResponse.json(
          { error: (err as { error?: { message?: string } }).error?.message ?? "YouTube Analytics API error", code: res.status },
          { status: res.status }
        );
      }
      const raw = await res.json() as {
        rows?: Array<[number, number, number]>;
        columnHeaders?: Array<{ name: string }>;
      };

      const rows = raw.rows ?? [];

      interface CurvaPoint {
        porcentajeTiempo: number;
        retencion: number;
        rendimiento: number;
      }

      const curva: CurvaPoint[] = rows.map(r => ({
        porcentajeTiempo: Math.round(Number(r[0]) * 100),
        retencion: Math.round(Number(r[2]) * 100 * 100) / 100,
        rendimiento: Math.round(Number(r[1]) * 100) / 100,
      }));

      const promedioGeneral =
        curva.length > 0
          ? Math.round((curva.reduce((s, p) => s + p.retencion, 0) / curva.length) * 10) / 10
          : 0;

      interface PuntoCritico {
        tiempo: number;
        severidad: "Alta" | "Media" | "Baja";
        recomendacion: string;
      }

      const puntosCriticos: PuntoCritico[] = [];

      function getRecomendacion(tiempo: number): string {
        if (tiempo <= 10) return "El hook no está funcionando — mejora los primeros 30 segundos";
        if (tiempo <= 30) return "La intro es muy larga — llega al contenido más rápido";
        if (tiempo <= 60) return "Añade un pattern interrupt aquí (cambio de ritmo, pregunta, dato sorpresa)";
        if (tiempo <= 80) return "Haz el CTA antes del minuto 70% del video";
        return "El cierre es muy predecible — añade algo sorprendente al final";
      }

      for (let i = 1; i < curva.length; i++) {
        const drop = curva[i - 1].retencion - curva[i].retencion;
        if (drop > 5) {
          const severidad: "Alta" | "Media" | "Baja" =
            drop > 15 ? "Alta" : drop > 8 ? "Media" : "Baja";
          puntosCriticos.push({
            tiempo: curva[i].porcentajeTiempo,
            severidad,
            recomendacion: getRecomendacion(curva[i].porcentajeTiempo),
          });
        }
      }

      return NextResponse.json({ curva, promedioGeneral, puntosCriticos });
    }

    return NextResponse.json({ error: "Unknown metric", code: 400 }, { status: 400 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, code: 500 }, { status: 500 });
  }
}
