"use client";
import { useState, useEffect } from "react";

interface Credits {
  credits_remaining: number;
  credits_used: number;
  credits_monthly_limit: number;
  plan: string;
  reset_date: string;
}

export function useCredits() {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits")
      .then(r => r.json())
      .then(data => { setCredits(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function deductCredits(action: string, cost: number): Promise<boolean> {
    const res = await fetch("/api/credits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, cost })
    });
    const data = await res.json();
    if (data.success) {
      setCredits(prev => prev ? { ...prev, credits_remaining: data.credits_remaining } : null);
      return true;
    }
    return false;
  }

  return { credits, loading, deductCredits };
}
