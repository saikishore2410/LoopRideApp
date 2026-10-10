import { createFileRoute } from "@tanstack/react-router";
import { SYSTEM_PROMPT, buildTransitContext, fallbackReply, validateChatInput } from "@/lib/assistant";
import { istMinutes } from "@/lib/transit/logic";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/responses";
const MODEL = "openai/gpt-6-astra";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const v = validateChatInput(body);
        if (!v.ok) return Response.json({ error: v.error }, { status: 400 });
        const { messages, lang } = v.data;
        const nowMin = v.data.nowMin ?? istMinutes(new Date());
        const last = messages[messages.length - 1].content;

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ mode: "fallback", reply: fallbackReply(last, lang, nowMin) });
        }

        const upstream = await fetch(GATEWAY, {
          method: "POST",
          signal: request.signal,
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
            Authorization: `Bearer ${apiKey}`,
            "X-Lovable-AIG-SDK": "fetch",
          },
          body: JSON.stringify({
            model: MODEL,
            stream: true,
            store: false,
            reasoning: { effort: "low" },
            instructions: `${SYSTEM_PROMPT}\nUser language: ${lang}.\n\nDEMO CONTEXT (from RoutePulse app data):\n${buildTransitContext(last, nowMin)}`,
            input: messages.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          }),
        }).catch(() => null);

        if (!upstream || !upstream.ok || !upstream.body) {
          const status = upstream?.status ?? 502;
          const detail = upstream ? await upstream.text().catch(() => "") : "network error";
          console.error(`AI gateway failed [${status}]: ${detail.slice(0, 300)}`);
          const message =
            status === 402 ? "AI credits exhausted — showing offline answer." : status === 429 ? "AI is busy (rate limited) — showing offline answer." : "AI unavailable — showing offline answer.";
          return Response.json({ mode: "fallback", notice: message, reply: fallbackReply(last, lang, nowMin) });
        }

        const headers = new Headers({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "X-RoutePulse-Mode": "llm" });
        upstream.headers.forEach((val, key) => {
          if (key.toLowerCase().startsWith("x-lovable-aig-")) headers.set(key, val);
        });
        return new Response(upstream.body, { headers });
      },
    },
  },
});