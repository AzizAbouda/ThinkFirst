export type Subject =
  | "Math"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "History"
  | "Literature"
  | "Other";

export type GradeLevel = "primary" | "secondary" | "university";

export interface SessionConfig {
  subject: Subject;
  gradeLevel: GradeLevel;
  studentName?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** ISO timestamp */
  timestamp: string;
}

export interface SessionStats {
  totalMessages: number;
  userMessages: number;
  /** Approximate — incremented each time a Stage-3+ response is detected */
  hintsUsed: number;
  gaveUp: boolean;
  finalAnswer?: string;
  startedAt: string;
  endedAt: string;
}
