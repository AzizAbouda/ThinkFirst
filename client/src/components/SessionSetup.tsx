import { useState } from "react";
import type { SessionConfig, Subject, GradeLevel } from "../types";

interface Props {
  onStart: (config: SessionConfig) => void;
}

const SUBJECTS: Subject[] = [
  "Math",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Other",
];

const GRADE_LEVELS: { value: GradeLevel; label: string; description: string }[] =
  [
    { value: "primary", label: "Primary", description: "Ages 6–12" },
    { value: "secondary", label: "Secondary", description: "Ages 12–18" },
    { value: "university", label: "University", description: "Undergraduate+" },
  ];

const SUBJECT_ICONS: Record<Subject, string> = {
  Math: "∑",
  Physics: "⚛",
  Chemistry: "⚗",
  Biology: "🧬",
  History: "📜",
  Literature: "📖",
  Other: "◇",
};

export default function SessionSetup({ onStart }: Props) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | null>(null);
  const [studentName, setStudentName] = useState("");

  const canStart = subject !== null && gradeLevel !== null;

  function handleStart() {
    if (!subject || !gradeLevel) return;
    onStart({ subject, gradeLevel, studentName: studentName.trim() || undefined });
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-3xl font-light tracking-tight text-ink-900 dark:text-ink-50">
              Think
            </span>
            <span className="text-3xl font-semibold text-sage-600 dark:text-sage-400">
              First
            </span>
          </div>
          <p className="text-ink-500 dark:text-ink-400 text-sm font-light leading-relaxed max-w-xs mx-auto">
            An AI tutor that never gives you the answer — it helps you find it.
          </p>
        </div>

        <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-sm border border-ink-100 dark:border-ink-800 p-7 space-y-7">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-widest mb-2">
              Your name <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-600 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-widest mb-3">
              Subject
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all
                    ${
                      subject === s
                        ? "border-sage-500 bg-sage-500/10 text-sage-700 dark:text-sage-400 dark:border-sage-500"
                        : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                    }
                  `}
                >
                  <span className="text-lg leading-none">{SUBJECT_ICONS[s]}</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grade level */}
          <div>
            <label className="block text-xs font-medium text-ink-500 dark:text-ink-400 uppercase tracking-widest mb-3">
              Grade level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADE_LEVELS.map(({ value, label, description }) => (
                <button
                  key={value}
                  onClick={() => setGradeLevel(value)}
                  className={`
                    flex flex-col items-start gap-0.5 p-3.5 rounded-xl border text-left transition-all
                    ${
                      gradeLevel === value
                        ? "border-sage-500 bg-sage-500/10 text-sage-700 dark:text-sage-400 dark:border-sage-500"
                        : "border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-ink-300 dark:hover:border-ink-600 hover:bg-ink-50 dark:hover:bg-ink-800"
                    }
                  `}
                >
                  <span className="text-sm font-medium">{label}</span>
                  <span className="text-[11px] opacity-70">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`
              w-full py-3 rounded-xl text-sm font-medium transition-all
              ${
                canStart
                  ? "bg-ink-900 dark:bg-ink-100 text-white dark:text-ink-900 hover:bg-ink-700 dark:hover:bg-ink-200 shadow-sm"
                  : "bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-600 cursor-not-allowed"
              }
            `}
          >
            Begin session →
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-ink-400 dark:text-ink-600">
          The AI will guide you — not give you the answer.
        </p>
      </div>
    </div>
  );
}
