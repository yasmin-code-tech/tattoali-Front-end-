import { useState, useCallback, useEffect, useMemo } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Layout from "../../baselayout/Layout";
import { useAuth } from "../../auth/useAuth";
import { loadAuth } from "../../auth/auth-storage";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";
import ModalMarcarSessao from "../../components/ModalMarcarSessao";
import { criarCliente, buscarMapaClientesPorAppUserId } from "../../services/clienteService";
import { adicionarSessao } from "../../services/agendaService";
import { isSupabaseConfigured } from "../../lib/chatService";
import { useChatNotifications } from "../../context/ChatNotificationsContext";
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
  const { user } = useAuth();
  const {
    threads,
    loading,
    error,
    reloadThreads,
    unreadByConversationId,
    hasUnread,
  } = useChatNotifications();
  const [modalClienteOpen, setModalClienteOpen] = useState(false);
  const [modalSessaoOpen, setModalSessaoOpen] = useState(false);
  const [clienteParaSessao, setClienteParaSessao] = useState(null);
  const [clientesPorAppUserId, setClientesPorAppUserId] = useState({});

  const hoje = useMemo(() => new Date().toISOString().split("T")[0], []);

  const authStored = loadAuth();
  const effectiveUser = user || authStored?.user;
  const roleLower = String(effectiveUser?.role ?? "").toLowerCase();
  const podeAdicionarCliente = roleLower !== "cliente";

  const recarregarClientesMap = useCallback(async () => {
    try {
      const map = await buscarMapaClientesPorAppUserId();
      setClientesPorAppUserId(map);
    } catch {
      setClientesPorAppUserId({});
    }
  }, []);

  useEffect(() => {
    if (podeAdicionarCliente) recarregarClientesMap();
  }, [podeAdicionarCliente, recarregarClientesMap]);

  const openMarcarSessaoModal = useCallback(
    (peerAppUserId) => {
      const id = Number(peerAppUserId);
      const cliente = clientesPorAppUserId[id];
      if (!cliente) return;
      setClienteParaSessao(cliente);
      setModalSessaoOpen(true);
    },
    [clientesPorAppUserId],
  );

  const handleMarcarSessaoSuccess = async ({ sessoes }) => {
    await Promise.all(sessoes.map((s) => adicionarSessao(s)));
  };

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
      <div className="flex flex-col w-full min-h-0 h-[calc(100dvh-7rem)] min-h-[480px]">
        <div className="shrink-0 pb-4">
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <MessageCircle className="w-8 h-8 text-red-600" />
              {hasUnread ? (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0a0a0a]" />
              ) : null}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Mensagens</h1>
              <p className="text-gray-400 text-sm">Conversas com clientes (Supabase)</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="shrink-0 mb-3 p-3 rounded-lg border border-red-900/50 bg-red-950/30 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-1 flex-col md:flex-row min-h-0 rounded-2xl border border-gray-700 bg-[#111111] overflow-hidden shadow-xl">
          <aside className="w-full md:w-[min(100%,320px)] md:shrink-0 border-b md:border-b-0 md:border-r border-gray-800 flex flex-col bg-[#0d0d0d] max-h-[min(38vh,280px)] md:max-h-none min-h-0">
            <div className="px-3 py-2.5 border-b border-gray-800 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Conversas
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {loading && threads.filter((row) => row.peer_app_user_id != null).length === 0 ? (
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
                      const unread = unreadByConversationId[row.conversation_id];
                      const naLista = Boolean(clientesPorAppUserId[Number(peerId)]);
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
                            <div className="relative w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-lg shrink-0 border border-gray-700">
                              💬
                              {unread ? (
                                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-[#0d0d0d]" />
                              ) : null}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between gap-2 items-start">
                                <div className="min-w-0 flex-1">
                                  <span
                                    className={`block truncate ${unread ? "font-bold text-white" : "font-semibold text-white"}`}
                                  >
                                    {row.peer_name || "Usuário"}
                                  </span>
                                  {naLista ? (
                                    <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-400/90 bg-green-950/40 border border-green-900/40 rounded px-1.5 py-0.5">
                                      Na lista
                                    </span>
                                  ) : null}
                                </div>
                                <span className="text-[11px] text-gray-500 shrink-0">
                                  {formatWhen(row.last_at)}
                                </span>
                              </div>
                              <p
                                className={`text-sm truncate mt-0.5 ${unread ? "text-gray-200" : "text-gray-400"}`}
                              >
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
                className="inline-block text-sm text-red-500 hover:text-red-400 hover:underline"
              >
                ← Voltar para Clientes
              </NavLink>
            </div>
          </aside>

          <section className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#0a0a0a]">
            <Outlet
              context={{
                threads,
                reloadThreads,
                clientesPorAppUserId,
                openAdicionarClienteModal: () => setModalClienteOpen(true),
                openMarcarSessaoModal,
                podeAdicionarCliente,
              }}
            />
          </section>

          <ModalCadastrarCliente
            isOpen={modalClienteOpen}
            onClose={() => setModalClienteOpen(false)}
            defaultClienteJaNoApp
            onSave={async (novoCliente) => {
              await criarCliente(novoCliente);
              await recarregarClientesMap();
            }}
            onClienteVinculado={recarregarClientesMap}
          />

          <ModalMarcarSessao
            isOpen={modalSessaoOpen}
            onClose={() => {
              setModalSessaoOpen(false);
              setClienteParaSessao(null);
            }}
            dataSelecionada={hoje}
            clienteInicial={clienteParaSessao}
            onSuccess={handleMarcarSessaoSuccess}
          />
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
