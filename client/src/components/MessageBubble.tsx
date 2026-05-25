import type { Message } from "../types";

interface Props {
  message: Message;
  isStreaming?: boolean;
}

/**
 * Renders a single chat message.
 *
 * User messages are right-aligned in a filled bubble.
 * Assistant messages are left-aligned, typeset without a bubble — like text
 * from a book, not a chat app. This is the "smart notebook" feel.
 */
export default function MessageBubble({ message, isStreaming = false }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-up">
        <div className="max-w-[75%]">
          <div className="bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-slide-up">
      {/* Tutor avatar — simple monogram */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="w-7 h-7 rounded-full bg-sage-500/20 dark:bg-sage-500/30 flex items-center justify-center">
          <span className="text-[11px] font-semibold text-sage-700 dark:text-sage-400">
            TF
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="prose-chat text-ink-800 dark:text-ink-200">
          {/* Render content with basic paragraph splitting */}
          {message.content
            ? message.content.split("\n\n").map((paragraph, i) => (
                <p key={i} className={i > 0 ? "mt-3" : ""}>
                  {paragraph.split("\n").map((line, j) => (
                    <span key={j}>
                      {j > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
              ))
            : null}

          {/* Typing indicator shown while streaming and content is empty */}
          {isStreaming && !message.content && <TypingIndicator />}

          {/* Blinking cursor while streaming */}
          {isStreaming && message.content && (
            <span className="inline-block w-0.5 h-4 bg-ink-400 dark:bg-ink-500 ml-0.5 animate-pulse align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <span className="inline-flex items-center gap-1 h-5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-ink-400 dark:bg-ink-500 animate-pulse-dot"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </span>
  );
}
