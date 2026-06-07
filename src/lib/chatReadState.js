const STORAGE_KEY = "tattooali_chat_last_read";

export function loadChatLastReadMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveChatLastReadMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function markChatConversationRead(conversationId, atIso = new Date().toISOString()) {
  if (!conversationId) return;
  const map = loadChatLastReadMap();
  map[conversationId] = atIso;
  saveChatLastReadMap(map);
}
