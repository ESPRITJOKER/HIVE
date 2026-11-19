import { z } from "zod";

export const uuidSchema = z.string().uuid("Invalid identifier.");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const searchSchema = z.object({
  query: z.string().trim().max(200).optional().default(""),
});

/** Strip control characters from user-submitted text before persistence. */
export function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}
