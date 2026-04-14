import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useOutletContext, Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { loadAuth } from "../../auth/auth-storage";
import { getJwtSub } from "../../lib/jwtSub";
import {
  fetchMessages,
  getOrCreateConversationId,
  resolvePeerAuthId,
  sendChatMessage,
  subscribeToMessages,
  isSupabaseConfigured,
} from "../../lib/chatService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function bubbleTime(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return format(d, "HH:mm", { locale: ptBR });
  } catch {
    return "";
  }
}

export default function ChatConversa() {
  const { peerAppUserId: peerParam } = useParams();
  const { token } = useAuth();
  const {
    threads = [],
    reloadThreads,
    openAdicionarClienteModal,
    podeAdicionarCliente = false,
  } = useOutletContext() || {};
  const peerAppUserId = Number.parseInt(String(peerParam || ""), 10);

  const threadMeta = threads.find((r) => Number(r.peer_app_user_id) === peerAppUserId);
  const peerDisplayName = threadMeta?.peer_name?.trim() || `Cliente #${peerAppUserId}`;

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const scrollEnd = () => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const setup = useCallback(async () => {
    const auth = loadAuth();
    const t = token || auth?.token;
    if (!t || !Number.isFinite(peerAppUserId) || peerAppUserId < 1) {
      setError("Sessão inválida ou contato inválido.");
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Supabase não configurado no front.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const peerAuth = await resolvePeerAuthId(t, peerAppUserId);
      if (!peerAuth) {
        setError(
          "Este usuário ainda não sincronizou o perfil de chat (precisa abrir o app ou o web logado pelo menos uma vez após configurar o Supabase).",
        );
        setLoading(false);
        return;
      }
      const conv = await getOrCreateConversationId(t, peerAuth);
      if (!conv) throw new Error("Não foi possível abrir a conversa.");
      setConversationId(conv);
      const rows = await fetchMessages(t, conv);
      setMessages(rows);
      scrollEnd();
    } catch (e) {
      setError(e?.message || "Falha ao carregar o chat.");
    } finally {
      setLoading(false);
    }
  }, [token, peerAppUserId]);

  useEffect(() => {
    setup();
  }, [setup]);

  useEffect(() => {
    const auth = loadAuth();
    const t = token || auth?.token;
    if (!conversationId || !t) return undefined;
    const unsub = subscribeToMessages(t, conversationId, (row) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === row.id)) return prev;
        return [...prev, row];
      });
      scrollEnd();
    });
    return unsub;
  }, [conversationId, token]);

  useEffect(() => {
    scrollEnd();
  }, [messages.length]);

  const mySub = (() => {
    const auth = loadAuth();
    const t = token || auth?.token;
    return t ? getJwtSub(t) : null;
  })();

  async function handleSend(e) {
    e.preventDefault();
    const auth = loadAuth();
    const t = token || auth?.token;
    const text = input.trim();
    if (!text || !conversationId || !t) return;
    setInput("");
    try {
      const row = await sendChatMessage(t, conversationId, text);
      setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
      scrollEnd();
      reloadThreads?.();
    } catch (err) {
      setInput(text);
      setError(err?.message || "Falha ao enviar.");
    }
  }

  if (!isSupabaseConfigured()) {
    return (
      <div className="p-6">
        <p className="text-gray-400">Configure o Supabase no .env do front.</p>
        <Link to="/chat" className="text-red-500 text-sm mt-4 inline-block">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 flex-1">
      <div className="shrink-0 px-4 py-3 border-b border-gray-800 flex items-center gap-3 bg-[#111111]">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg border border-gray-700">
          💬
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-white font-semibold truncate">{peerDisplayName}</h2>
          <p className="text-xs text-gray-500">Chat TattooAli</p>
        </div>
        {podeAdicionarCliente && typeof openAdicionarClienteModal === "function" ? (
          <button
            type="button"
            onClick={() => openAdicionarClienteModal()}
            className="shrink-0 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-500 border border-red-500 rounded-lg px-3 py-2 transition-colors shadow-md shadow-red-900/30"
          >
            Adicionar cliente
          </button>
        ) : null}
      </div>

      {error && (
        <div className="shrink-0 mx-3 mt-3 p-3 rounded-lg border border-red-900/50 bg-red-950/30 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 scrollbar-chat">
        {loading ? (
          <p className="text-gray-500 text-sm">Carregando mensagens…</p>
        ) : (
          messages.map((m) => {
            const mine = mySub && m.sender_id === mySub;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[min(85%,520px)] rounded-2xl px-4 py-2.5 shadow-md ${
                    mine
                      ? "bg-red-600 text-white rounded-br-md"
                      : "bg-[#1a1a1a] text-gray-100 border border-gray-700 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-red-100/80" : "text-gray-500"}`}>
                    {bubbleTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="shrink-0 flex gap-2 p-4 border-t border-gray-800 bg-[#111111]"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma mensagem…"
          className="flex-1 bg-[#111111] text-white placeholder-gray-500 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-600"
          disabled={!conversationId || !!error}
        />
        <button
          type="submit"
          disabled={!input.trim() || !conversationId}
          className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Enviar
        </button>
      </form>

      <style>{`
        .scrollbar-chat::-webkit-scrollbar { width: 8px; }
        .scrollbar-chat::-webkit-scrollbar-track { background: #0a0a0a; border-radius: 4px; }
        .scrollbar-chat::-webkit-scrollbar-thumb { background: #dc2626; border-radius: 4px; }
        .scrollbar-chat::-webkit-scrollbar-thumb:hover { background: #b91c1c; }
      `}</style>
    </div>
  );
}
