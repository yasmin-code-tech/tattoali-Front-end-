import { useEffect, useState, useCallback } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Layout from "../../baselayout/Layout";
import { useAuth } from "../../auth/useAuth";
import { loadAuth } from "../../auth/auth-storage";
import {
  fetchChatThreads,
  isSupabaseConfigured,
} from "../../lib/chatService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageCircle } from "lucide-react";

function formatWhen(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return format(d, "dd/MM HH:mm", { locale: ptBR });
  } catch {
    return "";
  }
}

export default function ChatLayout() {
  const { token } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    const auth = loadAuth();
    const t = token || auth?.token;
    if (!t) {
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env do front.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchChatThreads(t);
      setThreads(rows);
    } catch (e) {
      setError(e?.message || "Não foi possível carregar as conversas.");
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isSupabaseConfigured()) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-white mb-2">Mensagens</h1>
          <p className="text-gray-400 text-sm mb-4">
            Defina as variáveis <code className="text-red-400">VITE_SUPABASE_URL</code> e{" "}
            <code className="text-red-400">VITE_SUPABASE_ANON_KEY</code> no arquivo{" "}
            <code className="text-gray-300">.env</code> e rode o SQL em{" "}
            <code className="text-gray-300">supabase/chat_schema.sql</code> no painel do Supabase.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:bg-transparent sm:backdrop-blur-none">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Mensagens</h1>
              <p className="text-gray-400 text-sm">Conversas com clientes (Supabase)</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-red-900/50 bg-red-950/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[420px] rounded-2xl border border-gray-700 bg-[#111111] overflow-hidden shadow-xl">
          <aside className="w-full md:w-[min(100%,320px)] md:shrink-0 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col bg-[#0d0d0d] max-h-[38vh] md:max-h-none">
            <div className="px-3 py-2.5 border-b border-gray-800 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Conversas
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading ? (
                <p className="p-4 text-gray-500 text-sm">Carregando…</p>
              ) : threads.filter((row) => row.peer_app_user_id != null).length === 0 ? (
                <p className="p-4 text-gray-500 text-sm leading-relaxed">
                  Nenhuma conversa ainda. Abra o chat a partir de um cliente que já tenha conta no app (CPF
                  igual ao cadastro).
                </p>
              ) : (
                <ul className="p-2 space-y-1">
                  {threads
                    .filter((row) => row.peer_app_user_id != null)
                    .map((row) => {
                      const peerId = row.peer_app_user_id;
                      return (
                        <li key={row.conversation_id}>
                          <NavLink
                            to={`/chat/${peerId}`}
                            className={({ isActive }) =>
                              [
                                "flex gap-3 items-start rounded-xl px-3 py-3 transition-colors border",
                                isActive
                                  ? "bg-gray-800/90 border-red-900/50 text-white"
                                  : "border-transparent hover:bg-gray-900/80 text-gray-200",
                              ].join(" ")
                            }
                          >
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg shrink-0 border border-gray-700">
                              💬
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2">
                                <span className="font-semibold text-white truncate">
                                  {row.peer_name || "Usuário"}
                                </span>
                                <span className="text-[11px] text-gray-500 shrink-0">
                                  {formatWhen(row.last_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 truncate mt-0.5">
                                {row.last_body || "Sem mensagens"}
                              </p>
                            </div>
                          </NavLink>
                        </li>
                      );
                    })}
                </ul>
              )}
            </div>
            <div className="p-3 border-t border-gray-800">
              <NavLink
                to="/clientes"
                className="text-sm text-red-500 hover:text-red-400 hover:underline"
              >
                ← Voltar para Clientes
              </NavLink>
            </div>
          </aside>

          <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0a0a0a]">
            <Outlet context={{ threads, reloadThreads: load }} />
          </section>
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: #141414; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #3f3f3f; border-radius: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
    </Layout>
  );
}
