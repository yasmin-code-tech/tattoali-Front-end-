import { getJwtSub } from "./jwtSub";
import { createSupabaseAuthed, isSupabaseConfigured } from "./supabaseClient";

export { isSupabaseConfigured };

export async function ensureChatProfile(accessToken, me) {
  if (!isSupabaseConfigured() || !accessToken || !me?.user_id) return;
  const sub = getJwtSub(accessToken);
  if (!sub) return;
  const supabase = createSupabaseAuthed(accessToken);
  const display =
    [me.nome, me.sobrenome].filter(Boolean).join(" ").trim() || me.nome || "Usuário";
  await supabase.from("chat_profiles").upsert(
    {
      id: sub,
      display_name: display.slice(0, 200),
      role: me.role ?? null,
      app_user_id: me.user_id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

export async function fetchChatThreads(accessToken) {
  const supabase = createSupabaseAuthed(accessToken);
  const { data, error } = await supabase.rpc("list_my_chat_threads");
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function resolvePeerAuthId(accessToken, peerAppUserId) {
  const supabase = createSupabaseAuthed(accessToken);
  const { data, error } = await supabase
    .from("chat_profiles")
    .select("id")
    .eq("app_user_id", peerAppUserId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function getOrCreateConversationId(accessToken, peerAuthId) {
  const supabase = createSupabaseAuthed(accessToken);
  const { data, error } = await supabase.rpc("get_or_create_conversation", {
    other_user_id: peerAuthId,
  });
  if (error) throw error;
  return data;
}

export async function fetchMessages(accessToken, conversationId) {
  const supabase = createSupabaseAuthed(accessToken);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function sendChatMessage(accessToken, conversationId, body) {
  const supabase = createSupabaseAuthed(accessToken);
  const sub = getJwtSub(accessToken);
  if (!sub) throw new Error("Token inválido para enviar mensagem.");
  const text = String(body || "").trim();
  if (!text) throw new Error("Mensagem vazia.");
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: sub,
      body: text.slice(0, 5000),
    })
    .select("id, sender_id, body, created_at")
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(accessToken, conversationId, onInsert) {
  const supabase = createSupabaseAuthed(accessToken);
  const channel = supabase
    .channel(`chat:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new && typeof onInsert === "function") onInsert(payload.new);
      },
    )
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
