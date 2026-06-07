import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "../auth/useAuth";
import { loadAuth } from "../auth/auth-storage";
import { getJwtSub } from "../lib/jwtSub";
import {
  fetchChatThreads,
  fetchLatestMessagesForConversations,
  isSupabaseConfigured,
  subscribeToIncomingChatMessages,
} from "../lib/chatService";
import {
  loadChatLastReadMap,
  markChatConversationRead,
} from "../lib/chatReadState";

const ChatNotificationsContext = createContext(null);

function sortThreads(rows) {
  return [...rows].sort((a, b) => {
    const ta = a.last_at ? new Date(a.last_at).getTime() : 0;
    const tb = b.last_at ? new Date(b.last_at).getTime() : 0;
    return tb - ta;
  });
}

function isUnreadThread(thread, lastReadMap, latestByConv, mySub) {
  const convId = thread?.conversation_id;
  const lastAt = thread?.last_at;
  if (!convId || !lastAt) return false;
  const latest = latestByConv[convId];
  if (!latest || latest.sender_id === mySub) return false;
  const readAt = lastReadMap[convId];
  if (!readAt) return true;
  return new Date(lastAt) > new Date(readAt);
}

function buildUnreadMap(threads, lastReadMap, latestByConv, mySub) {
  const out = {};
  for (const t of threads) {
    if (isUnreadThread(t, lastReadMap, latestByConv, mySub)) {
      out[t.conversation_id] = true;
    }
  }
  return out;
}

export function ChatNotificationsProvider({ children }) {
  const { token } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadByConversationId, setUnreadByConversationId] = useState({});
  const activeConversationIdRef = useRef(null);
  const latestByConvRef = useRef({});
  const messageListenersRef = useRef(new Map());
  const hasLoadedOnceRef = useRef(false);
  const reloadInFlightRef = useRef(null);
  const reloadQueuedRef = useRef(false);

  const getAccessToken = useCallback(() => {
    const auth = loadAuth();
    return token || auth?.token || null;
  }, [token]);

  const recomputeUnread = useCallback((rows, latestByConv, mySub) => {
    const lastReadMap = loadChatLastReadMap();
    setUnreadByConversationId(buildUnreadMap(rows, lastReadMap, latestByConv, mySub));
  }, []);

  const reloadThreads = useCallback(async ({ silent = false } = {}) => {
    const t = getAccessToken();
    if (!t || !isSupabaseConfigured()) {
      setThreads([]);
      setUnreadByConversationId({});
      setLoading(false);
      hasLoadedOnceRef.current = false;
      return;
    }

    if (reloadInFlightRef.current) {
      reloadQueuedRef.current = true;
      return reloadInFlightRef.current;
    }

    const showSpinner = !silent && !hasLoadedOnceRef.current;
    if (showSpinner) {
      setLoading(true);
      setError(null);
    }

    const run = (async () => {
      try {
        const rows = await fetchChatThreads(t);
        const mySub = getJwtSub(t);
        const convIds = rows.map((r) => r.conversation_id).filter(Boolean);
        const latestByConv = await fetchLatestMessagesForConversations(t, convIds);
        latestByConvRef.current = latestByConv;
        const sorted = sortThreads(rows);
        setThreads(sorted);
        recomputeUnread(sorted, latestByConv, mySub);
        hasLoadedOnceRef.current = true;
      } catch (e) {
        if (!silent || !hasLoadedOnceRef.current) {
          setError(e?.message || "Não foi possível carregar as conversas.");
          setThreads([]);
          setUnreadByConversationId({});
        }
      } finally {
        if (showSpinner) setLoading(false);
        reloadInFlightRef.current = null;
        if (reloadQueuedRef.current) {
          reloadQueuedRef.current = false;
          reloadThreads({ silent: true });
        }
      }
    })();

    reloadInFlightRef.current = run;
    return run;
  }, [getAccessToken, recomputeUnread]);

  const markConversationRead = useCallback(
    (conversationId, atIso) => {
      if (!conversationId) return;
      markChatConversationRead(conversationId, atIso);
      setUnreadByConversationId((prev) => {
        if (!prev[conversationId]) return prev;
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
    },
    [],
  );

  const setActiveConversationId = useCallback(
    (conversationId) => {
      activeConversationIdRef.current = conversationId;
      if (conversationId) markConversationRead(conversationId);
    },
    [markConversationRead],
  );

  const registerConversationMessageListener = useCallback((conversationId, cb) => {
    if (!conversationId || typeof cb !== "function") return () => {};
    messageListenersRef.current.set(conversationId, cb);
    return () => {
      messageListenersRef.current.delete(conversationId);
    };
  }, []);

  const bumpThreadPreview = useCallback(
    (msg) => {
      setThreads((prev) => {
        const idx = prev.findIndex((t) => t.conversation_id === msg.conversation_id);
        if (idx === -1) {
          reloadThreads({ silent: true });
          return prev;
        }
        const updated = {
          ...prev[idx],
          last_body: msg.body,
          last_at: msg.created_at,
        };
        const next = [...prev];
        next[idx] = updated;
        return sortThreads(next);
      });
    },
    [reloadThreads],
  );

  useEffect(() => {
    reloadThreads({ silent: false });
  }, [reloadThreads]);

  useEffect(() => {
    const t = getAccessToken();
    if (!t || !isSupabaseConfigured()) return undefined;

    const unsub = subscribeToIncomingChatMessages(t, (msg) => {
      const mySub = getJwtSub(t);
      latestByConvRef.current = {
        ...latestByConvRef.current,
        [msg.conversation_id]: msg,
      };
      bumpThreadPreview(msg);

      const listener = messageListenersRef.current.get(msg.conversation_id);
      listener?.(msg);

      if (msg.sender_id === mySub) return;

      const activeId = activeConversationIdRef.current;
      if (activeId === msg.conversation_id) {
        markConversationRead(msg.conversation_id, msg.created_at);
        return;
      }

      setUnreadByConversationId((prev) => ({
        ...prev,
        [msg.conversation_id]: true,
      }));
    });

    return unsub;
  }, [getAccessToken, bumpThreadPreview, markConversationRead]);

  /** Fallback: atualiza lista se o Realtime falhar (mesmo padrão do app mobile). */
  useEffect(() => {
    const t = getAccessToken();
    if (!t || !isSupabaseConfigured()) return undefined;
    const id = setInterval(() => {
      reloadThreads({ silent: true });
    }, 8000);
    return () => clearInterval(id);
  }, [getAccessToken, reloadThreads]);

  const unreadCount = useMemo(
    () => Object.keys(unreadByConversationId).length,
    [unreadByConversationId],
  );

  const value = useMemo(
    () => ({
      threads,
      loading,
      error,
      unreadCount,
      hasUnread: unreadCount > 0,
      unreadByConversationId,
      reloadThreads,
      markConversationRead,
      setActiveConversationId,
      registerConversationMessageListener,
    }),
    [
      threads,
      loading,
      error,
      unreadCount,
      unreadByConversationId,
      reloadThreads,
      markConversationRead,
      setActiveConversationId,
      registerConversationMessageListener,
    ],
  );

  return (
    <ChatNotificationsContext.Provider value={value}>{children}</ChatNotificationsContext.Provider>
  );
}

export function useChatNotifications() {
  const ctx = useContext(ChatNotificationsContext);
  if (!ctx) {
    throw new Error("useChatNotifications deve ser usado dentro de ChatNotificationsProvider");
  }
  return ctx;
}
