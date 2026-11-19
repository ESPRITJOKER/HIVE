import { z } from "zod";

/**
 * SERVER-ONLY environment access.
 * Never import this module from a Client Component or a file imported by one.
 * These values must never appear in a browser bundle or in logs.
 */

const serverSchema = z.object({
  supabaseUrl: z.string().url().min(1),
  supabaseAnonKey: z.string().min(1),
  supabaseServiceRoleKey: z.string().min(1),
  geminiApiKey: z.string().min(1).optional(),
  groqApiKey: z.string().min(1).optional(),
  embeddingProvider: z.enum(["local-e5-small", "gemini"]).default("local-e5-small"),
  embeddingDimension: z.coerce.number().int().positive().default(384),
  vapidPublicKey: z.string().optional(),
  vapidPrivateKey: z.string().optional(),
  vapidSubject: z.string().default("mailto:admin@example.com"),
  aiDailyQuestionLimit: z.coerce.number().int().positive().default(20),
});

export type ServerEnv = z.infer<typeof serverSchema>;

/**
 * Reads and validates privileged configuration. Call only from server contexts.
 * Returns `null` when configuration is absent so callers can degrade gracefully;
 * it never throws raw env values in an error message.
 */
export function getServerEnv(): ServerEnv | null {
  const result = serverSchema.safeParse({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    embeddingProvider: process.env.EMBEDDING_PROVIDER,
    embeddingDimension: process.env.EMBEDDING_DIMENSION,
    vapidPublicKey: process.env.VAPID_PUBLIC_KEY,
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY,
    vapidSubject: process.env.VAPID_SUBJECT,
    aiDailyQuestionLimit: process.env.AI_DAILY_QUESTION_LIMIT,
  });

  if (!result.success) return null;
  return result.data;
}

/** Non-secret embedding configuration, safe to pass to ingestion workers. */
export function getEmbeddingConfig() {
  const env = getServerEnv();
  return {
    provider: env?.embeddingProvider ?? ("local-e5-small" as const),
    dimension: env?.embeddingDimension ?? 384,
  };
}
