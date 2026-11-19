import { describe, expect, it } from "vitest";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_DOCUMENT_MIME_TYPES,
  DEFAULT_AI_DAILY_LIMIT,
  INSUFFICIENT_CONTEXT_MESSAGE,
  MAX_DOCUMENT_BYTES,
} from "@/lib/constants";

describe("security and academic-integrity constants", () => {
  it("keeps the zero-cost default AI quota at 20 requests per student per day", () => {
    expect(DEFAULT_AI_DAILY_LIMIT).toBe(20);
  });

  it("uses the exact required insufficient-context response", () => {
    expect(INSUFFICIENT_CONTEXT_MESSAGE).toBe(
      "I cannot find sufficient information to answer this question in the academic materials currently available.",
    );
  });

  it("restricts upload types and enforces a size limit", () => {
    expect(ALLOWED_DOCUMENT_EXTENSIONS).not.toContain(".exe");
    expect(ALLOWED_DOCUMENT_MIME_TYPES).toContain("application/pdf");
    expect(MAX_DOCUMENT_BYTES).toBe(25 * 1024 * 1024);
  });
});
