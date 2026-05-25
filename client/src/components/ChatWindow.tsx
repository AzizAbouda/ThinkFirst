import { useState, useRef, useEffect, KeyboardEvent } from "react";
import type { SessionConfig } from "../types";
import { useChat } from "../hooks/useChat";
import MessageBubble from "./MessageBubble";
import GiveUpButton from "./GiveUpButton";
import SessionSummary from "./SessionSummary";

interface Props {
  config: SessionConfig;
  onNewSession: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
}

export default function ChatWindow({
  config,
  onNewSession,
  onToggleTheme,
  isDark,
}: Props) {
  const { messages, isStreaming, status, rateLimited, stats, sendMessage, giveUp, endSession } =
    useChat(config);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionEnded = status === "gave-up" || status === "done";

  // Auto-scroll to bottom on new content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleEndSession() {
    endSession();
  }

  // Show summary once stats are computed
  if (stats) {
    return (
      <SessionSummary stats={stats} config={config} onNewSession={onNewSession} />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-ink-50 dark:bg-ink-950 overflow-hidden">
      {/* Top bar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 py-3.5 border-b border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-ink-900 dark:text-ink-100 text-sm">
            Think<span className="text-sage-600 dark:text-sage-400">First</span>
          </span>
          <span className="text-ink-300 dark:text-ink-700">·</span>
          <span className="text-xs text-ink-500 dark:text-ink-400">
            {config.subject}{" "}
            <span className="text-ink-300 dark:text-ink-700">·</span>{" "}
            <span className="capitalize">{config.gradeLevel}</span>
          </span>
          {config.studentName && (
            <>
              <span className="text-ink-300 dark:text-ink-700">·</span>
              <span className="text-xs text-ink-500 dark:text-ink-400">
                {config.studentName}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-ink-400 dark:text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors text-base"
          >
            {isDark ? "○" : "●"}
          </button>

          {/* End session */}
          {messages.length > 0 && !sessionEnded && (
            <button
              onClick={handleEndSession}
              className="text-xs text-ink-400 dark:text-ink-500 hover:text-ink-600 dark:hover:text-ink-300 transition-colors px-2 py-1 rounded"
            >
              End session
            </button>
          )}
        </div>
      </header>

      {/* Messages area */}
      <main className="flex-1 overflow-y-auto chat-scroll px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-5">
          {messages.length === 0 && (
            <WelcomePrompt config={config} />
          )}

          {messages.map((message, index) => {
            const isLastAssistant =
              message.role === "assistant" && index === messages.length - 1;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isStreaming={isStreaming && isLastAssistant}
              />
            );
          })}

          {/* "Session ended" notice after give-up completes */}
          {sessionEnded && !isStreaming && (
            <div className="text-center py-4 animate-fade-in">
              <p className="text-xs text-ink-400 dark:text-ink-500 mb-3">
                Session complete.
              </p>
              <button
                onClick={handleEndSession}
                className="text-xs underline underline-offset-2 text-ink-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors"
              >
                View session summary →
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Rate limit banner */}
      {rateLimited && (
        <div className="flex-shrink-0 bg-amber-50 dark:bg-amber-950 border-t border-amber-200 dark:border-amber-800 px-4 py-2.5 text-center text-xs text-amber-700 dark:text-amber-300">
          Rate limit reached for the current model. Try again later or switch to a different model.
        </div>
      )}

      {/* Input area */}
      {!sessionEnded && (
        <footer className="flex-shrink-0 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-ink-900 px-4 py-3">
          <div className="max-w-2xl mx-auto space-y-2">
            <div className="flex gap-3 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your attempt, question, or reasoning…"
                rows={1}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-600 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition disabled:opacity-50 leading-relaxed"
                style={{ minHeight: "44px", maxHeight: "160px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 flex items-center justify-center hover:bg-ink-700 dark:hover:bg-ink-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <SendIcon />
              </button>
            </div>

            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-ink-400 dark:text-ink-600">
                Shift+Enter for newline
              </span>
              <GiveUpButton onGiveUp={giveUp} disabled={isStreaming} />
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

function WelcomePrompt({ config }: { config: SessionConfig }) {
  const greeting = config.studentName ? `Hi ${config.studentName}.` : "Hello.";
  return (
    <div className="text-center py-12 animate-fade-in">
      <div className="text-ink-300 dark:text-ink-700 text-5xl mb-6 font-light">◈</div>
      <p className="text-ink-800 dark:text-ink-200 font-medium mb-2">{greeting}</p>
      <p className="text-ink-500 dark:text-ink-400 text-sm max-w-xs mx-auto leading-relaxed">
        Tell me the problem you're working on and what you've tried so far. I
        won't give you the answer — but I'll help you find it.
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
