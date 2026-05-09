import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const ACTION_COSTS: Record<string, number> = {
  guion: 5,
  miniatura: 3,
  crear_canal: 10,
  crear_contenido: 8,
  outlier_video: 4,
  logo_banner: 6,
  dimension: 3,
  analisis_canal: 2,
};

const DEFAULT_CREDITS = {
  credits_remaining: 50,
  credits_used: 0,
  credits_monthly_limit: 50,
  plan: "free",
  reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export async function GET() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_credits")
    .select("credits_remaining, credits_used, credits_monthly_limit, plan, reset_date")
    .eq("user_id", session.user.id)
    .single();

  if (error || !data) {
    return NextResponse.json(DEFAULT_CREDITS);
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let action: string, cost: number;
  try {
    const body = await req.json();
    action = body.action;
    cost = body.cost ?? ACTION_COSTS[action] ?? 1;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Fetch current credits
  const { data: current } = await supabase
    .from("user_credits")
    .select("credits_remaining, credits_used")
    .eq("user_id", session.user.id)
    .single();

  const currentRemaining = current?.credits_remaining ?? DEFAULT_CREDITS.credits_remaining;
  const currentUsed = current?.credits_used ?? 0;

  if (currentRemaining < cost) {
    return NextResponse.json(
      { success: false, error: "Créditos insuficientes", credits_remaining: currentRemaining },
      { status: 402 }
    );
  }

  const newRemaining = currentRemaining - cost;
  const newUsed = currentUsed + cost;

  if (!current) {
    // Row doesn't exist yet — insert it
    await supabase.from("user_credits").insert({
      user_id: session.user.id,
      credits_remaining: newRemaining,
      credits_used: newUsed,
    });
  } else {
    await supabase
      .from("user_credits")
      .update({
        credits_remaining: newRemaining,
        credits_used: newUsed,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", session.user.id);
  }

  return NextResponse.json({ success: true, credits_remaining: newRemaining });
}
