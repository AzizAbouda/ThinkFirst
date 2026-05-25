import { useState, useEffect } from "react";
import type { SessionConfig } from "./types";
import SessionSetup from "./components/SessionSetup";
import ChatWindow from "./components/ChatWindow";

type Screen = "setup" | "chat";

/**
 * App-level state: which screen is active, the session config, and the theme.
 *
 * Theme is persisted in localStorage so it survives a page refresh — the
 * only state we persist, since everything else is intentionally ephemeral.
 *
 * Future extensibility:
 *   - Add a Router here when teacher/student dashboards land
 *   - Pass a userId/sessionId down from here when auth is added
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [config, setConfig] = useState<SessionConfig | null>(null);
  const [isDark, setIsDark] = useState(() => {
    // Respect OS preference on first load; after that use saved choice
    const saved = localStorage.getItem("thinkfirst-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Apply dark class to <html> whenever isDark changes
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("thinkfirst-theme", isDark ? "dark" : "light");
  }, [isDark]);

  function handleStart(sessionConfig: SessionConfig) {
    setConfig(sessionConfig);
    setScreen("chat");
  }

  function handleNewSession() {
    setConfig(null);
    setScreen("setup");
  }

  function toggleTheme() {
    setIsDark((d) => !d);
  }

  if (screen === "chat" && config) {
    return (
      <ChatWindow
        config={config}
        onNewSession={handleNewSession}
        onToggleTheme={toggleTheme}
        isDark={isDark}
      />
    );
  }

  return (
    <>
      {/* Theme toggle on setup screen lives in the top-right corner */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-500 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors shadow-sm text-base"
        >
          {isDark ? "○" : "●"}
        </button>
      </div>
      <SessionSetup onStart={handleStart} />
    </>
  );
}
