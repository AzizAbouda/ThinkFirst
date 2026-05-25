import { useState } from "react";

interface Props {
  onGiveUp: () => void;
  disabled: boolean;
}

/**
 * Two-step confirmation for giving up.
 *
 * Giving up should be a deliberate act — not something triggered by an
 * accidental tap. The first click reveals a confirmation step; only the
 * second click actually fires the give-up request. This friction is
 * intentional UX.
 */
export default function GiveUpButton({ onGiveUp, disabled }: Props) {
  const [confirming, setConfirming] = useState(false);

  function handleFirstClick() {
    if (disabled) return;
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    onGiveUp();
  }

  function handleCancel() {
    setConfirming(false);
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 animate-fade-in">
        <span className="text-xs text-ink-500 dark:text-ink-400">
          Are you sure? The AI will explain the full solution.
        </span>
        <button
          onClick={handleConfirm}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500 hover:bg-amber-400 text-white transition-colors"
        >
          Yes, show me
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
        >
          Keep trying
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleFirstClick}
      disabled={disabled}
      className={`
        text-xs font-medium transition-colors
        ${
          disabled
            ? "text-ink-300 dark:text-ink-700 cursor-not-allowed"
            : "text-ink-400 dark:text-ink-500 hover:text-amber-500 dark:hover:text-amber-400 underline underline-offset-2"
        }
      `}
    >
      I give up — show me the answer
    </button>
  );
}
