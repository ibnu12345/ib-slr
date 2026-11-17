import type { DatabaseSchema } from "./index";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

/**
 * Check if Supabase cloud persistence is configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Fetch database state from Supabase REST endpoint
 */
export async function loadStateFromSupabase(): Promise<DatabaseSchema | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_state?key=eq.main_db&select=*`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      console.warn(`Supabase load state returned status: ${res.status}`);
      return null;
    }

    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].payload) {
      return rows[0].payload as DatabaseSchema;
    }
  } catch (err) {
    console.warn("Failed to load state from Supabase, falling back to local file:", err);
  }

  return null;
}

/**
 * Save database state to Supabase REST endpoint (Upsert)
 */
export async function saveStateToSupabase(data: DatabaseSchema): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_state`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        key: "main_db",
        payload: data,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Failed to save state to Supabase:", err);
    return false;
  }
}
