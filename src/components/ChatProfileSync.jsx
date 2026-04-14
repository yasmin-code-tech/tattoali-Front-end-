import { useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { api } from "../lib/api";
import { ensureChatProfile, isSupabaseConfigured } from "../lib/chatService";

/**
 * Garante linha em chat_profiles (Supabase) com auth.uid() ↔ app user_id do Postgres.
 * Roda após login quando o token e o perfil /me estão disponíveis.
 */
export default function ChatProfileSync() {
  const { token } = useAuth();
  const lastKey = useRef("");

  useEffect(() => {
    if (!token || !isSupabaseConfigured()) return;

    let cancelled = false;
    (async () => {
      try {
        const me = await api.get("/api/user/me");
        if (cancelled || !me?.user_id) return;
        const key = `${me.user_id}:${me.nome || ""}:${me.sobrenome || ""}:${me.role || ""}`;
        if (key === lastKey.current) return;
        await ensureChatProfile(token, me);
        lastKey.current = key;
      } catch {
        /* rede ou Supabase ainda não configurado */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return null;
}
