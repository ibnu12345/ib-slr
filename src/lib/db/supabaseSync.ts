import type { DatabaseSchema } from "./index";

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://jvywlixkdazuingkbcgu.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_API_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_A3gpsLNTmVzAqLWdHaaEag_coAB0b3X";

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

// In-memory read-cache to eliminate redundant Supabase network round-trips (15s TTL)
const CACHE_TTL_MS = 15000;
const decisionsCache: Record<string, { data: any[]; timestamp: number }> = {};
const appraisalsCache: Record<string, { data: any[]; timestamp: number }> = {};
const extractionsCache: Record<string, { data: any[]; timestamp: number }> = {};

/**
 * Save project screening decisions to Supabase (fast, isolated row upsert <250ms)
 */
export async function saveProjectDecisionsToSupabase(
  projectId: string,
  decisions: any[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !projectId) return false;

  // Immediately update local memory cache
  decisionsCache[projectId] = { data: decisions, timestamp: Date.now() };

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
        key: `decisions_${projectId}`,
        payload: decisions,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Failed to save project decisions to Supabase:", err);
    return false;
  }
}

/**
 * Load project screening decisions from Supabase
 */
export async function loadProjectDecisionsFromSupabase(
  projectId: string
): Promise<any[] | null> {
  if (!isSupabaseConfigured() || !projectId) return null;

  const now = Date.now();
  if (decisionsCache[projectId] && now - decisionsCache[projectId].timestamp < CACHE_TTL_MS) {
    return decisionsCache[projectId].data;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_state?key=eq.decisions_${projectId}&select=*`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0].payload)) {
      decisionsCache[projectId] = { data: rows[0].payload, timestamp: now };
      return rows[0].payload;
    }
  } catch (err) {
    console.warn("Failed to load project decisions from Supabase:", err);
  }

  return null;
}

/**
 * Save project quality appraisal records to Supabase (fast row upsert <250ms)
 */
export async function saveProjectAppraisalsToSupabase(
  projectId: string,
  appraisals: any[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !projectId) return false;

  // Immediately update local memory cache
  appraisalsCache[projectId] = { data: appraisals, timestamp: Date.now() };

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
        key: `appraisals_${projectId}`,
        payload: appraisals,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Failed to save project appraisals to Supabase:", err);
    return false;
  }
}

/**
 * Load project quality appraisal records from Supabase
 */
export async function loadProjectAppraisalsFromSupabase(
  projectId: string
): Promise<any[] | null> {
  if (!isSupabaseConfigured() || !projectId) return null;

  const now = Date.now();
  if (appraisalsCache[projectId] && now - appraisalsCache[projectId].timestamp < CACHE_TTL_MS) {
    return appraisalsCache[projectId].data;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_state?key=eq.appraisals_${projectId}&select=*`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0].payload)) {
      appraisalsCache[projectId] = { data: rows[0].payload, timestamp: now };
      return rows[0].payload;
    }
  } catch (err) {
    console.warn("Failed to load project appraisals from Supabase:", err);
  }

  return null;
}

/**
 * Save project data extraction records to Supabase (fast row upsert <250ms)
 */
export async function saveProjectExtractionsToSupabase(
  projectId: string,
  extractions: any[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !projectId) return false;

  // Immediately update local memory cache
  extractionsCache[projectId] = { data: extractions, timestamp: Date.now() };

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
        key: `extractions_${projectId}`,
        payload: extractions,
        updated_at: new Date().toISOString(),
      }),
    });

    return res.ok;
  } catch (err) {
    console.warn("Failed to save project extractions to Supabase:", err);
    return false;
  }
}

/**
 * Load project data extraction records from Supabase
 */
export async function loadProjectExtractionsFromSupabase(
  projectId: string
): Promise<any[] | null> {
  if (!isSupabaseConfigured() || !projectId) return null;

  const now = Date.now();
  if (extractionsCache[projectId] && now - extractionsCache[projectId].timestamp < CACHE_TTL_MS) {
    return extractionsCache[projectId].data;
  }

  try {
    const endpoint = `${SUPABASE_URL.replace(/\/$/, "")}/rest/v1/app_state?key=eq.extractions_${projectId}&select=*`;
    const res = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0].payload)) {
      extractionsCache[projectId] = { data: rows[0].payload, timestamp: now };
      return rows[0].payload;
    }
  } catch (err) {
    console.warn("Failed to load project extractions from Supabase:", err);
  }

  return null;
}
