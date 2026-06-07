import { getJwtSub } from "./jwtSub";
import { createSupabaseAuthed, ensureSupabaseRealtimeAuth, isSupabaseConfigured } from "./supabaseClient";

export { isSupabaseConfigured };

export const CHAT_IMAGE_BODY_PLACEHOLDER = "📷 Foto";

const CHAT_IMAGES_BUCKET = "chat-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function extFromMime(mimeType) {
  const m = String(mimeType || "").toLowerCase();
  if (m.includes("png")) return "png";
  if (m.includes("webp")) return "webp";
  if (m.includes("gif")) return "gif";
  return "jpg";
}

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
    .select("id, sender_id, body, image_url, created_at")
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
    .select("id, sender_id, body, image_url, created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function uploadChatImage(accessToken, conversationId, file) {
  const supabase = createSupabaseAuthed(accessToken);
  const sub = getJwtSub(accessToken);
  if (!sub) throw new Error("Token inválido.");

  const mimeType = file?.type || "image/jpeg";
  if (!String(mimeType).startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagem muito grande. Use até 5 MB.");
  }

  const ext = extFromMime(mimeType);
  const path = `${conversationId}/${sub.slice(0, 8)}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(CHAT_IMAGES_BUCKET).upload(path, file, {
    contentType: mimeType,
    upsert: false,
  });
  if (uploadError) {
    const msg = String(uploadError.message || uploadError);
    if (/bucket not found/i.test(msg)) {
      throw new Error(
        'Bucket "chat-images" não existe no Supabase. Rode o SQL de imagens do chat (supabase/chat_schema.sql) no painel do projeto.',
      );
    }
    throw uploadError;
  }

  const { data: urlData } = supabase.storage.from(CHAT_IMAGES_BUCKET).getPublicUrl(path);
  if (!urlData?.publicUrl) throw new Error("Não foi possível obter URL da imagem.");
  return urlData.publicUrl;
}

/** Envia foto (e legenda opcional) na conversa. */
export async function sendChatImageMessage(accessToken, conversationId, file, caption = "") {
  const imageUrl = await uploadChatImage(accessToken, conversationId, file);
  const supabase = createSupabaseAuthed(accessToken);
  const sub = getJwtSub(accessToken);
  if (!sub) throw new Error("Token inválido para enviar imagem.");

  const legenda = String(caption || "").trim();
  const body = legenda ? legenda.slice(0, 5000) : CHAT_IMAGE_BODY_PLACEHOLDER;

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: sub,
      body,
      image_url: imageUrl,
    })
    .select("id, sender_id, body, image_url, created_at")
    .single();
  if (error) throw error;
  return data;
}

export function subscribeToMessages(accessToken, conversationId, onInsert) {
  const supabase = createSupabaseAuthed(accessToken);
  let channel = null;
  let cancelled = false;
  const channelName = `chat:${conversationId}:${Date.now()}`;

  (async () => {
    try {
      await ensureSupabaseRealtimeAuth(supabase, accessToken);
      if (cancelled) return;
      channel = supabase
        .channel(channelName)
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
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("[chat] falha ao inscrever realtime da conversa:", e);
      }
    }
  })();

  return () => {
    cancelled = true;
    if (channel) supabase.removeChannel(channel);
  };
}

/** Realtime global: novas mensagens em qualquer conversa do usuário (RLS no Supabase). */
export function subscribeToIncomingChatMessages(accessToken, onInsert) {
  const supabase = createSupabaseAuthed(accessToken);
  let channel = null;
  let cancelled = false;
  const channelName = `chat-inbox:${Date.now()}`;

  (async () => {
    try {
      await ensureSupabaseRealtimeAuth(supabase, accessToken);
      if (cancelled) return;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
          },
          (payload) => {
            if (payload.new && typeof onInsert === "function") onInsert(payload.new);
          },
        )
        .subscribe();
    } catch (e) {
      if (import.meta.env.DEV) {
        console.warn("[chat] falha ao inscrever realtime global:", e);
      }
    }
  })();

  return () => {
    cancelled = true;
    if (channel) supabase.removeChannel(channel);
  };
}

/** Última mensagem por conversation_id (para calcular não lidas na carga inicial). */
export async function fetchLatestMessagesForConversations(accessToken, conversationIds) {
  const ids = [...new Set(conversationIds.filter(Boolean))];
  if (!ids.length) return {};
  const supabase = createSupabaseAuthed(accessToken);
  const { data, error } = await supabase
    .from("chat_messages")
    .select("conversation_id, sender_id, created_at, body")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const map = {};
  for (const row of data || []) {
    if (!map[row.conversation_id]) map[row.conversation_id] = row;
  }
  return map;
}
