import { useState, useCallback, useRef } from "react";
import type { Message, SessionConfig, SessionStats } from "../types";
import { buildSystemPrompt } from "../lib/systemPrompt";

type ChatStatus = "idle" | "streaming" | "done" | "gave-up";

interface UseChatReturn {
  messages: Message[];
  status: ChatStatus;
  isStreaming: boolean;
  rateLimited: boolean;
  stats: SessionStats | null;
  sendMessage: (content: string) => Promise<void>;
  giveUp: () => Promise<void>;
  endSession: () => void;
}

export function useChat(config: SessionConfig): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Track session start time without causing re-renders
  const meta = useRef({
    startedAt: new Date().toISOString(),
  });

  const systemPrompt = useRef(buildSystemPrompt(config));

  const appendAssistantChunk = useCallback((id: string, chunk: string) => {
    setMessages((prev: Message[]) =>
      prev.map((m: Message) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      )
    );
  }, []);

  const sendToAPI = useCallback(
    async (
      allMessages: Message[],
      assistantMsgId: string,
      giveUp = false
    ): Promise<void> => {
      setStatus("streaming");

      // Build the payload the server expects
      const payload = {
        messages: allMessages.map(({ role, content }) => ({ role, content })),
        systemPrompt: systemPrompt.current,
        giveUp,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429) setRateLimited(true);
        throw new Error(`API error ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              appendAssistantChunk(assistantMsgId, data.text);
            }
            if (data.done) {
              setStatus(giveUp ? "gave-up" : "idle");
            }
            if (data.error) {
              if (data.error === "rate_limit") setRateLimited(true);
              throw new Error(data.error);
            }
          } catch {
            // Malformed SSE line — skip
          }
        }
      }
    },
    [appendAssistantChunk]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (status === "streaming") return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date().toISOString(),
      };

      const assistantMsgId = crypto.randomUUID();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...messages, userMsg, assistantMsg];
      setMessages(updatedMessages);

      try {
        // Pass history WITHOUT the empty assistant placeholder — the API
        // takes the conversation up to the last user turn, then streams the reply.
        await sendToAPI([...messages, userMsg], assistantMsgId, false);
      } catch (err) {
        console.error("sendMessage error:", err);
        setMessages((prev: Message[]) =>
          prev.map((m: Message) =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    "Sorry, something went wrong reaching the AI. Please check your connection and try again.",
                }
              : m
          )
        );
        setStatus("idle");
      }
    },
    [messages, status, sendToAPI]
  );

  const giveUp = useCallback(async () => {
    if (status === "streaming") return;

    // Inject a synthetic user message so the AI has context
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: "I give up. Please show me the full solution.",
      timestamp: new Date().toISOString(),
    };

    const assistantMsgId = crypto.randomUUID();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg, assistantMsg];
    setMessages(updatedMessages);

    try {
      await sendToAPI([...messages, userMsg], assistantMsgId, true);
    } catch (err) {
      console.error("giveUp error:", err);
      setStatus("idle");
    }
  }, [messages, status, sendToAPI]);

  const endSession = useCallback(() => {
    const userMsgs = messages.filter((m: Message) => m.role === "user");
    const lastAssistant = [...messages].reverse().find((m: Message) => m.role === "assistant");

    // Rough hint count: count assistant messages that contain hint-like patterns
    const hintCount = messages.filter(
      (m: Message) =>
        m.role === "assistant" &&
        /hint|try|think about|consider|what if|notice|look at/i.test(m.content)
    ).length;

    setStats({
      totalMessages: messages.length,
      userMessages: userMsgs.length,
      hintsUsed: hintCount,
      gaveUp: status === "gave-up",
      finalAnswer: lastAssistant?.content,
      startedAt: meta.current.startedAt,
      endedAt: new Date().toISOString(),
    });
  }, [messages, status]);

  return {
    messages,
    status,
    isStreaming: status === "streaming",
    rateLimited,
    stats,
    sendMessage,
    giveUp,
    endSession,
  };
}
