export const APP_NAME = "HIVE";
export const APP_TAGLINE = "Learn Together. Grow Smarter.";

export const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export const SLOT_TYPE_LABELS: Record<string, string> = {
  lecture_cm: "Lecture (CM)",
  tutorial_td: "Tutorial (TD)",
  practical_tp: "Practical (TP)",
  examination: "Examination",
};

export const TASK_CATEGORY_LABELS: Record<string, string> = {
  assignment: "Assignment",
  exam: "Exam",
  hackathon: "Hackathon",
  internship: "Internship",
  scholarship: "Scholarship",
  event: "Event",
};

export const DOCUMENT_STATUS_LABELS: Record<string, string> = {
  uploaded: "Queued",
  extracting: "Extracting text",
  chunking: "Splitting into sections",
  embedding: "Indexing for AI",
  indexed: "Ready",
  failed: "Failed",
};

/** AI anti-hallucination contract — returned verbatim when retrieval is insufficient. */
export const INSUFFICIENT_CONTEXT_MESSAGE =
  "I cannot find sufficient information to answer this question in the academic materials currently available.";

export const DEFAULT_AI_DAILY_LIMIT = 20;

/** Only these extensions may enter the document pipeline. */
export const ALLOWED_DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".pptx", ".txt", ".md"] as const;
export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024;

/** Supported MIME types (magic bytes must also be verified server-side). */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
] as const;
