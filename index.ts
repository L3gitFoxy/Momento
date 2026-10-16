// Supabase Edge Function: ai-plan
// Deploy: supabase functions deploy ai-plan --no-verify-jwt  (or with JWT)
// Secrets: supabase secrets set OPENROUTER_API_KEY=sk-or-...
// Optional: AI_MODEL=openai/gpt-4o-mini

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM = `You maintain schedules for Momento.
COLLECTING: only fixed commitments the user stated. week = fixed blocks only.
When user says no/done: JSON {"reply","done":true,"week"} with fixed only Mon-Sun.
EDIT MODE: apply user changes to the FULL week JSON precisely. Return complete week for all 7 days. No duplicate Study spam.
mon-sat / every day except Sunday = Monday through Saturday.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const key = Deno.env.get("OPENROUTER_API_KEY") || Deno.env.get("AI_API_KEY") || "";
    if (!key) {
      return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not set on Edge Function" }), {
        status: 503, headers: { ...cors, "Content-Type": "application/json" },
      });
    }
    const body = await req.json().catch(() => ({}));
    const message = String(body.message || "");
    const history = Array.isArray(body.history) ? body.history : [];
    const context = body.context || {};
    const model = Deno.env.get("AI_MODEL") || "openai/gpt-4o-mini";

    const messages = [
      { role: "system", content: SYSTEM + "\nContext: " + JSON.stringify(context).slice(0, 1500) },
      ...history.slice(-12).map((h) => ({ role: h.role === "assistant" ? "assistant" : "user", content: String(h.content || "").slice(0, 4000) })),
      { role: "user", content: message.slice(0, 6000) },
    ];

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + key,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://momento-silk.vercel.app",
        "X-Title": "Momento",
      },
      body: JSON.stringify({ model, temperature: 0.2, max_tokens: 2500, messages }),
    });
    const j = await res.json();
    if (j.error) {
      return new Response(JSON.stringify({
        reply: "Model error: " + (j.error.message || JSON.stringify(j.error)),
        done: false, week: null, error: j.error.message || "error",
      }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const raw = j.choices?.[0]?.message?.content || "";
    let parsed = null;
    try {
      const cleaned = raw.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      const start = raw.indexOf("{");
      const end = raw.lastIndexOf("}");
      if (start >= 0 && end > start) {
        try { parsed = JSON.parse(raw.slice(start, end + 1)); } catch { /* ignore */ }
      }
    }
    if (!parsed) {
      parsed = { reply: String(raw).trim().slice(0, 1000) || "Got it.", done: false, week: null };
    }
    if (parsed.week && typeof parsed.week === "object") {
      const map = {
        mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
        fri: "Friday", sat: "Saturday", sun: "Sunday",
        monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday",
        thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday",
      };
      const norm = {};
      for (const [k, v] of Object.entries(parsed.week)) {
        norm[map[String(k).toLowerCase()] || k] = v;
      }
      parsed.week = norm;
    }
    return new Response(JSON.stringify({
      reply: parsed.reply || "Got it.",
      done: !!parsed.done,
      askAnythingElse: parsed.askAnythingElse !== false,
      week: parsed.week || null,
    }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e.message || e), done: false, week: null }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
