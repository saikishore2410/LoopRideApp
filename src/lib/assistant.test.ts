import { describe, expect, it } from "vitest";
import { fallbackReply, parseSseDeltas, validateChatInput } from "./assistant";
describe("RoutePulse assistant", () => {
  it("rejects missing and blank user messages", () => {
    expect(validateChatInput({ messages: [] }).ok).toBe(false);
    expect(validateChatInput({ messages: [{ role: "user", content: "  " }] }).ok).toBe(false);
  });
  it("sanitizes markup and accepts supported language", () => {
    const result = validateChatInput({ lang: "te", messages: [{ role: "user", content: "<b>Hi</b>" }] });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.messages[0].content).toBe("Hi");
  });
  it("answers a known stop question offline", () => {
    const answer = fallbackReply("When is the next bus from Ameerpet?", "en", 480);
    expect(answer).toContain("Ameerpet"); expect(answer).toContain("Demo schedule");
  });
  it("parses SSE deltas and preserves an incomplete chunk", () => {
    const parsed = parseSseDeltas('data: {"type":"response.output_text.delta","delta":"Hello"}\ndata: {"type":"response.completed"}\ndata: {"type":"response.output_text.delta",');
    expect(parsed.deltas).toEqual(["Hello"]); expect(parsed.rest).toContain('"type"');
  });
});