import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/rp/AppShell";
import { DemoBadge } from "@/components/rp/bits";
import { fallbackReply, parseSseDeltas, type ChatMessage } from "@/lib/assistant";
import { istMinutes } from "@/lib/transit/logic";
import { useAppState } from "@/lib/transit/store";

export const Route = createFileRoute("/assistant")({ component: AssistantPage });
const PROMPTS = ["When should I leave from Ameerpet?", "Find my pickup stop", "Why is my bus delayed?", "Accessible route", "Fare from MGBS to Warangal", "Help me in Telugu"];
function AssistantPage() {
  const { prefs } = useAppState(); const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! I can help with pickup points, sample departures, fares, accessibility and last-mile options. Demo schedules only; no live GPS feed is connected." }]);
  const [draft, setDraft] = useState(""); const [busy, setBusy] = useState(false); const [mode, setMode] = useState("offline"); const [notice, setNotice] = useState("");
  const lang = prefs.lang; const quickPrompts = useMemo(() => PROMPTS, []);
  async function send(text: string) {
    const content = text.trim().slice(0, 1000); if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }]; setMessages(next); setDraft(""); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(-12), lang, nowMin: istMinutes(new Date()) }) });
      if (!response.ok) throw new Error("assistant request failed");
      const type = response.headers.get("content-type") ?? "";
      if (type.includes("text/event-stream") && response.body) {
        setMode("LLM configured"); const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let reply = "";
        while (true) { const part = await reader.read(); if (part.done) break; buffer += decoder.decode(part.value, { stream: true }); const parsed = parseSseDeltas(buffer); buffer = parsed.rest; reply += parsed.deltas.join(""); if (parsed.error) throw new Error(parsed.error); setMessages([...next, { role: "assistant", content: reply }]); }
        setMessages([...next, { role: "assistant", content: reply || "The model returned an empty response. Please try again." }]);
      } else {
        const data = await response.json() as { mode?: string; reply?: string; notice?: string }; setMode(data.mode === "llm" ? "LLM configured" : "offline FAQ fallback"); setNotice(data.notice ?? "");
        setMessages([...next, { role: "assistant", content: data.reply ?? fallbackReply(content, lang) }]);
      }
    } catch { setMode("offline FAQ fallback"); setNotice("AI endpoint unavailable; showing local FAQ guidance."); setMessages([...next, { role: "assistant", content: fallbackReply(content, lang) }]); }
    finally { setBusy(false); }
  }
  return <AppShell><PageHeader title="RoutePulse AI assistant" subtitle="Transit answers grounded in the app's sample routes, landmarks and fare rules." />
    <div className="mb-4 flex flex-wrap items-center gap-3"><DemoBadge label={mode} /><span className="text-xs text-muted-foreground">Language: {lang === "te" ? "Telugu" : lang === "hi" ? "Hindi" : "English"}</span></div>
    {notice && <p role="status" className="mb-3 rounded-lg border border-warning/50 bg-warning-soft p-3 text-sm">{notice}</p>}
    <section aria-label="Chat conversation" className="flex min-h-[48vh] flex-col rounded-2xl border bg-card p-4 shadow-card"><div className="flex-1 space-y-3" aria-live="polite">
      {messages.map((m, i) => <div key={i} className={"max-w-[90%] whitespace-pre-wrap rounded-xl p-3 text-sm " + (m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}><p className="mb-1 text-[10px] font-bold uppercase tracking-wide opacity-70">{m.role === "user" ? "You" : "RoutePulse AI"}</p>{m.content}</div>)}
      {busy && <p role="status" className="text-sm text-muted-foreground">Checking transit context…</p>}</div>
      <div className="my-4 flex flex-wrap gap-2">{quickPrompts.map((p) => <button key={p} onClick={() => void send(p)} disabled={busy} className="rounded-full border px-3 py-1.5 text-xs hover:bg-muted disabled:opacity-50">{p}</button>)}</div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void send(draft); }}><label className="sr-only" htmlFor="assistant-message">Your transit question</label><input id="assistant-message" className="min-w-0 flex-1 rounded-lg border bg-background px-3 py-3 text-sm" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} placeholder="Ask about a stop, route, ETA, or fare…" /><button disabled={busy || !draft.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50">{busy ? "…" : "Send"}</button></form>
      <p className="mt-3 text-xs text-muted-foreground">Do not rely on demo ETAs for safety-critical travel. For emergencies in India call 112.</p></section>
  </AppShell>;
}