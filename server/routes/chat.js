import { Router } from "express";
import OpenAI from "openai";

const router = Router();
const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const MODEL = process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4-5";

/**
 * POST /api/chat
 *
 * Body:
 *   messages   – array of { role: "user"|"assistant", content: string }
 *   systemPrompt – the Socratic system prompt built on the client
 *   giveUp     – boolean; when true, unlocks direct-answer mode
 *
 * Returns a streaming text/event-stream response so the UI can render
 * tokens incrementally (better perceived latency, no timeout risk).
 */
router.post("/", async (req, res) => {
  const { messages, systemPrompt, giveUp = false } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  // When the student gives up we append a system-level override so the AI
  // drops the Socratic constraints and explains the full solution.
  const effectiveSystem = giveUp
    ? `${systemPrompt}\n\n[OVERRIDE — student clicked "I give up"]: The student has explicitly chosen to see the answer. Drop the Socratic constraints for this one response only. Give a clear, complete, step-by-step explanation of the solution. After the explanation, ask them to reflect: where did their reasoning go wrong?`
    : systemPrompt;

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      messages: [{ role: "system", content: effectiveSystem }, ...messages],
      stream: true,
      stream_options: { include_usage: true },
    });

    let doneSent = false;
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
      if (chunk.usage) {
        res.write(`data: ${JSON.stringify({ done: true, usage: chunk.usage })}\n\n`);
        doneSent = true;
      }
    }

    if (!doneSent) {
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    }
    res.end();
  } catch (err) {
    console.error("Chat route error:", err);
    const isRateLimit = err?.status === 429;
    if (!res.headersSent) {
      res.status(isRateLimit ? 429 : 500).json({
        error: isRateLimit ? "rate_limit" : "Failed to reach AI service",
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: isRateLimit ? "rate_limit" : err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
