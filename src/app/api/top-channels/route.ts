// GET /api/top-channels?nicho=finanzas&max=12&idioma=es
import { NextRequest, NextResponse } from "next/server";
const YT = "https://www.googleapis.com/youtube/v3";
export const revalidate = 3600; // cache 1 hour

export interface TopChannel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  country: string;
  handle: string;
  avgViewsEstimate: number;
  growthScore: number;
}

export async function GET(req: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "API Key no configurada" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const nicho = searchParams.get("nicho") || "finanzas personales";
  const max = Math.min(parseInt(searchParams.get("max") || "12"), 20);
  const idioma = searchParams.get("idioma") || "es";

  try {
    // Search channels
    const searchUrl = `${YT}/search?part=snippet&type=channel&q=${encodeURIComponent(nicho)}&maxResults=${max}&relevanceLanguage=${idioma}&key=${apiKey}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (!searchData.items?.length) return NextResponse.json({ channels: [] });

    const channelIds = searchData.items.map((i: { id: { channelId: string } }) => i.id.channelId).join(",");

    // Get channel details
    const detailUrl = `${YT}/channels?part=statistics,snippet,brandingSettings&id=${channelIds}&key=${apiKey}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    const channels: TopChannel[] = (detailData.items || []).map((ch: {
      id: string;
      snippet: { title: string; description: string; thumbnails?: { high?: { url: string } }; country?: string; customUrl?: string };
      statistics: { subscriberCount?: string; viewCount?: string; videoCount?: string };
    }) => {
      const subs = parseInt(ch.statistics.subscriberCount || "0");
      const views = parseInt(ch.statistics.viewCount || "0");
      const videos = parseInt(ch.statistics.videoCount || "1");
      const avgViews = Math.round(views / Math.max(videos, 1));
      return {
        id: ch.id,
        title: ch.snippet.title,
        description: ch.snippet.description?.slice(0, 200) || "",
        thumbnail: ch.snippet.thumbnails?.high?.url || "",
        subscriberCount: subs,
        viewCount: views,
        videoCount: videos,
        country: ch.snippet.country || "–",
        handle: ch.snippet.customUrl || "",
        avgViewsEstimate: avgViews,
        growthScore: Math.round((subs / 1000) + (views / 1000000)),
      };
    });

    // Sort by subscriber count
    channels.sort((a, b) => b.subscriberCount - a.subscriberCount);

    return NextResponse.json({ channels });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Error buscando canales" }, { status: 500 });
  }
}
