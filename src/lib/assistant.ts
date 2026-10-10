/**
 * RoutePulse AI — shared (client + server safe) assistant logic:
 * input validation, app-data "tools", context building and the offline FAQ fallback.
 * Real-time facts always come from app data, never from model text.
 */
import { z } from "zod";
import { ALL_ALERTS_STATIC, nextDeparturesFrom } from "./assistant-tools";
import { STOPS, type Stop } from "./transit/data";
import { fmtMin, sanitizeText } from "./transit/logic";

export type ChatRole = "user" | "assistant";
export interface ChatMessage { role: ChatRole; content: string }

export const chatInputSchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1, "Send a message first")
    .max(30, "Conversation too long — start a new chat"),
  lang: z.enum(["en", "hi", "te"]).default("en"),
  nowMin: z.number().int().min(0).max(1439).optional(),
});

export type ChatInput = z.infer<typeof chatInputSchema>;

export function validateChatInput(raw: unknown): { ok: true; data: ChatInput } | { ok: false; error: string } {
  const parsed = chatInputSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid request" };
  const messages = parsed.data.messages.map((m) => ({ role: m.role, content: sanitizeText(m.content, 1000) }));
  const last = messages[messages.length - 1];
  if (last.role !== "user" || !last.content) return { ok: false, error: "Message cannot be empty" };
  return { ok: true, data: { ...parsed.data, messages } };
}

export function findStopsInText(text: string): Stop[] {
  const t = text.toLowerCase();
  return STOPS.filter((s) => {
    const first = s.name.toLowerCase().split(/[ (]/)[0];
    return t.includes(s.name.toLowerCase()) || (first.length > 3 && t.includes(first)) || t.includes(s.id.toLowerCase() + " ");
  });
}

/** Tool-like context from the app's own demo schedule for the model prompt. */
export function buildTransitContext(query: string, nowMin: number): string {
  const stops = findStopsInText(query).slice(0, 3);
  const lines: string[] = [`Current time: ${fmtMin(nowMin)} IST. Data source: DEMO sample (not official TSRTC, no live GPS).`];
  for (const s of stops) {
    lines.push(`Stop ${s.name} [${s.id}] — ${s.landmark}, ${s.address}; wheelchair ${s.wheelchair ? "yes" : "no"}; last-mile: ${s.lastMile.join("; ")}`);
    const deps = nextDeparturesFrom(s.id, nowMin, 4);
    if (deps.length) lines.push(`  Next demo departures: ${deps.map((d) => `${d.route} at ${fmtMin(d.time)} (+${d.delay} min demo delay)`).join(", ")}`);
  }
  if (!stops.length) lines.push(`Known demo stops: ${STOPS.map((s) => s.name).join(", ")}`);
  lines.push(`Active demo alerts: ${ALL_ALERTS_STATIC.map((a) => `${a.title} (${a.validFrom}–${a.validTo})`).join("; ")}`);
  return lines.join("\n");
}

export const SYSTEM_PROMPT = `You are RoutePulse AI, a friendly transit assistant for Hyderabad bus riders.
Rules:
- Only state times, stops, delays and fares that appear in the provided DEMO CONTEXT. If unknown, say so.
- Always remind that schedules are demo data and not an official TSRTC feed when giving times.
- Never claim live GPS tracking. Positions are simulated from schedule.
- Reply in the user's chosen language (en=English, hi=Hindi, te=Telugu). Keep replies short, use bullet lists.
- For safety emergencies, advise calling 112 (India emergency) and alerting the conductor.`;

const INTRO: Record<"en" | "hi" | "te", string> = {
  en: "",
  hi: "नमस्ते! (ऑफ़लाइन सहायता)\n\n",
  te: "నమస్తే! (ఆఫ్‌లైన్ సహాయం)\n\n",
};

/** Deterministic FAQ fallback used when no AI key is configured or the AI call fails. */
export function fallbackReply(text: string, lang: "en" | "hi" | "te" = "en", nowMin = 480): string {
  const q = sanitizeText(text).toLowerCase();
  if (!q) return "Please type a question — for example “When should I leave from Ameerpet?”";
  const stops = findStopsInText(q);
  const intro = INTRO[lang];
  const demo = "\n\n_Demo schedule · not an official TSRTC feed._";

  if (/telugu|తెలుగు|hindi|हिंदी|language/.test(q)) {
    return `${intro}I can answer in **English, हिंदी or తెలుగు**. Pick a language from the selector above the chat.\n\n- తెలుగు: "అమీర్‌పేట్ నుండి బస్ ఎప్పుడు?"\n- हिंदी: "अमीरपेट से अगली बस कब है?"`;
  }
  if (/emergency|missed|unsafe|help me|sos|112/.test(q)) {
    return `${intro}**If you feel unsafe, call 112 now.**\n\n- Tell the conductor/driver immediately.\n- Use *Missed-stop alert* on your trip page to see the next drop point and return options.\n- Use *Share trip* to send your trip link to a contact.`;
  }
  if (/delay|late|why/.test(q)) {
    const alerts = ALL_ALERTS_STATIC.map((a) => `- **${a.title}** — ${a.body}`).join("\n");
    return `${intro}Delays shown in RoutePulse come from the **demo feed** (no live GPS is connected). Current demo alerts:\n\n${alerts}\n\nOpen a trip to see the explainable ETA and confidence range.${demo}`;
  }
  if (/wheelchair|accessible|step-free|disab/.test(q)) {
    const acc = STOPS.filter((s) => s.wheelchair).slice(0, 8).map((s) => s.name).join(", ");
    return `${intro}Step-free (wheelchair) demo stops include: ${acc}.\n\nIn **Explore**, switch on *Wheelchair accessible only* to show low-floor buses between accessible stops.${demo}`;
  }
  if (/fare|price|cost|ticket|₹/.test(q)) {
    return `${intro}Fares are a **transparent demo tariff**: base fare + per-km rate (City ₹1.2/km, Express ₹1.6/km, Intercity ₹1.35/km + toll, reservation fee and GST), rounded to ₹5. Every result shows the line-by-line breakdown.${demo}`;
  }
  if (stops.length && /leave|when|next|bus|time|departure|pickup|board|stop/.test(q)) {
    const s = stops[0];
    const deps = nextDeparturesFrom(s.id, nowMin, 3);
    const list = deps.length ? deps.map((d) => `- **${d.route}** at ${fmtMin(d.time)} IST (demo delay +${d.delay} min)`).join("\n") : "- No more demo departures today.";
    return `${intro}**${s.name}** pickup point: ${s.landmark}, ${s.address}.\n\nNext departures after ${fmtMin(nowMin)} IST:\n${list}\n\nLeave so you reach the stop ~5 min early.${demo}`;
  }
  if (/pickup|stop|where|find/.test(q)) {
    return `${intro}Use **Stop Finder** to search by name or use your location (only if you allow it in Preferences). Tell me a stop name, e.g. “next bus from Hitech City”.`;
  }
  return `${intro}I'm RoutePulse AI in **offline FAQ mode**. Try:\n- “When should I leave from Ameerpet?”\n- “Why is my bus delayed?”\n- “Accessible route”\n- “Fare from MGBS to Warangal”`;
}

/** Parse a gateway SSE chunk buffer into text deltas (OpenAI Responses stream). */
export function parseSseDeltas(buffer: string): { deltas: string[]; rest: string; error?: string } {
  const deltas: string[] = [];
  let error: string | undefined;
  const parts = buffer.split("\n");
  const rest = parts.pop() ?? "";
  for (const line of parts) {
    const l = line.trim();
    if (!l.startsWith("data:")) continue;
    const payload = l.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const ev = JSON.parse(payload) as { type?: string; delta?: string; error?: { message?: string }; response?: { error?: { message?: string } } };
      if (ev.type === "response.output_text.delta" && typeof ev.delta === "string") deltas.push(ev.delta);
      if (ev.type === "error" || ev.type === "response.failed") error = ev.error?.message ?? ev.response?.error?.message ?? "AI stream failed";
    } catch {
      /* partial JSON — ignore */
    }
  }
  return { deltas, rest, error };
}