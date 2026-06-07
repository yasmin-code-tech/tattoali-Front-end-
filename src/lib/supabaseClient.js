import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

/**
 * Cliente Supabase com JWT do login TattooAli.
 * REST usa `accessToken`; Realtime exige setAuth antes de subscribe (só header não basta).
 */
export function createSupabaseAuthed(accessToken) {
  if (!url || !anonKey) {
    throw new Error("Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
  }
  return createClient(url, anonKey, {
    accessToken: async () => accessToken,
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/** Autentica o WebSocket Realtime com o mesmo JWT (obrigatório para postgres_changes + RLS). */
export async function ensureSupabaseRealtimeAuth(supabase, accessToken) {
  if (!accessToken || !supabase?.realtime?.setAuth) return;
  await supabase.realtime.setAuth(accessToken);
}
