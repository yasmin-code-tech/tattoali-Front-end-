import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/** Cliente PostgREST/Realtime autenticado com o mesmo JWT do login TattooAli. */
export function createSupabaseAuthed(accessToken) {
  if (!url || !anonKey) {
    throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
  }
  return createClient(url, anonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
