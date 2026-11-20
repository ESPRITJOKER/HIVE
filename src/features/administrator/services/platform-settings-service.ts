import "server-only";

import { getServerSupabase } from "@/lib/supabase/server";
import { MAX_DOCUMENT_BYTES } from "@/lib/constants";
import type { SessionContext } from "@/lib/permissions/guards";
import type { SystemSettingsInput } from "@/lib/validations/phase3";

export const MAX_UPLOAD_KEY = "max_upload_mb";
export const DEFAULT_MAX_UPLOAD_MB = 10;
const HARD_CAP_MB = Math.floor(MAX_DOCUMENT_BYTES / (1024 * 1024));

/**
 * Reads a single setting through the definer RPC. Students and representatives
 * can enforce the configured limit without being able to read or change the
 * admin-only settings table.
 */
export async function getMaxUploadMb(): Promise<number> {
  const supabase = await getServerSupabase();
  if (!supabase) return DEFAULT_MAX_UPLOAD_MB;

  const { data, error } = await supabase.rpc("platform_setting", { p_key: MAX_UPLOAD_KEY });
  if (error || data === null || data === undefined) return DEFAULT_MAX_UPLOAD_MB;

  const value = typeof data === "number" ? data : Number(Array.isArray(data) ? data[0] : data);
  if (!Number.isFinite(value) || value < 1 || value > HARD_CAP_MB) return DEFAULT_MAX_UPLOAD_MB;
  return Math.floor(value);
}

export async function getMaxUploadBytes(): Promise<number> {
  return (await getMaxUploadMb()) * 1024 * 1024;
}

/** Administrator-only read of the full persisted settings form. */
export async function getSystemSettings(
  session: SessionContext,
): Promise<{ maxUploadMb: number; persisted: boolean }> {
  if (session.role !== "administrator") return { maxUploadMb: DEFAULT_MAX_UPLOAD_MB, persisted: false };
  const supabase = await getServerSupabase();
  if (!supabase) return { maxUploadMb: DEFAULT_MAX_UPLOAD_MB, persisted: false };

  const { data } = await supabase.from("platform_settings").select("value").eq("key", MAX_UPLOAD_KEY).maybeSingle();
  const raw = data?.value;
  const value = raw && typeof raw === "object" && !Array.isArray(raw)
    ? (raw as Record<string, unknown>).mb
    : raw;
  const mb = typeof value === "number" ? value : Number(value);
  return {
    maxUploadMb: Number.isFinite(mb) && mb >= 1 && mb <= HARD_CAP_MB
      ? Math.floor(mb)
      : DEFAULT_MAX_UPLOAD_MB,
    persisted: data !== null,
  };
}

/** Persists validated settings. Callers must already have enforced admin role. */
export async function saveSystemSettings(
  session: SessionContext,
  input: SystemSettingsInput,
): Promise<boolean> {
  const supabase = await getServerSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from("platform_settings").upsert(
    {
      key: MAX_UPLOAD_KEY,
      value: { mb: input.maxUploadMb },
      description: "Maximum document upload size in megabytes",
      updated_by: session.userId,
    },
    { onConflict: "key" },
  );
  return !error;
}
