import type { SessionStats, SessionConfig } from "../types";

interface Props {
  stats: SessionStats;
  config: SessionConfig;
  onNewSession: () => void;
}

/**
 * Post-session summary panel.
 *
 * Shows the student what happened, how much they struggled, and whether they
 * got there on their own. Designed to feel like a report card from a good
 * teacher — honest, not punitive.
 */
export default function SessionSummary({ stats, config, onNewSession }: Props) {
  const duration = formatDuration(stats.startedAt, stats.endedAt);
  const selfSolved = !stats.gaveUp;

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Result banner */}
        <div
          className={`
          rounded-2xl p-6 mb-4 text-center
          ${
            selfSolved
              ? "bg-sage-500/10 dark:bg-sage-500/20 border border-sage-500/30"
              : "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30"
          }
        `}
        >
          <div className="text-3xl mb-2">{selfSolved ? "◈" : "◇"}</div>
          <h2 className="text-lg font-semibold text-ink-900 dark:text-ink-100 mb-1">
            {selfSolved ? "You worked through it." : "You chose to see the answer."}
          </h2>
          <p className="text-sm text-ink-500 dark:text-ink-400">
            {selfSolved
              ? "That's the point. The struggle is where learning happens."
              : "That's okay — knowing the answer is the starting point for understanding it."}
          </p>
        </div>

        {/* Stats card */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 p-6 space-y-5">
          <h3 className="text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-widest">
            Session recap
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <StatBlock
              value={String(stats.userMessages)}
              label="Your messages"
            />
            <StatBlock
              value={String(stats.hintsUsed)}
              label="Hints used"
              highlight={stats.hintsUsed > 3}
            />
            <StatBlock value={duration} label="Time spent" />
          </div>

          <div className="pt-2 border-t border-ink-100 dark:border-ink-800 space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-ink-500 dark:text-ink-400">Subject</span>
              <span className="text-ink-800 dark:text-ink-200 font-medium">
                {config.subject}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500 dark:text-ink-400">Level</span>
              <span className="text-ink-800 dark:text-ink-200 font-medium capitalize">
                {config.gradeLevel}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-500 dark:text-ink-400">Outcome</span>
              <span
                className={`font-medium ${
                  selfSolved
                    ? "text-sage-600 dark:text-sage-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {selfSolved ? "Solved independently" : "Gave up"}
              </span>
            </div>
          </div>

          <button
            onClick={onNewSession}
            className="w-full py-3 rounded-xl bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 text-sm font-medium hover:bg-ink-700 dark:hover:bg-ink-200 transition-colors"
          >
            Start a new session →
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-ink-400 dark:text-ink-600">
          No data is saved. This session is gone when you close the tab.
        </p>
      </div>
    </div>
  );
}

function StatBlock({
  value,
  label,
  highlight = false,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div
        className={`text-2xl font-light mb-0.5 ${
          highlight
            ? "text-amber-500 dark:text-amber-400"
            : "text-ink-900 dark:text-ink-100"
        }`}
      >
        {value}
      </div>
      <div className="text-[11px] text-ink-400 dark:text-ink-500">{label}</div>
    </div>
  );
}

function formatDuration(startedAt: string, endedAt: string): string {
  const secs = Math.round(
    (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000
  );
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}
