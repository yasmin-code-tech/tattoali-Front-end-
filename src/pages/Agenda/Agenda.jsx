import { useMemo, useState } from "react";
import Layout from '../../baselayout/Layout'
import { buscarAgendaDoDia, marcarSessaoRealizada, cancelarSessao, buscarProximasSessoesCliente } from '../../services/agendaService'
import ModalMarcarSessao from "../../components/ModalMarcarSessao";
import ModalDetalhesCliente from '../../components/ModalDetalhesCliente'
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";



export default function Agenda() {

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [sessoesDoDia, setSessoesDoDia] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalMarcarSessao, setModalMarcarSessao] = useState(false);
  const [modalDetalhesCliente, setModalDetalhesCliente] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const chaveData = useMemo(() => {
    if (!dataSelecionada || isNaN(dataSelecionada.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    
    return dataSelecionada.toISOString().split('T')[0];
  }, [dataSelecionada]);

  
  const carregarAgendaDoDia = async (data) => {
    setLoading(true);
    setErro(null);
    
    try {
      const sessoes = await buscarAgendaDoDia(data);
      setSessoesDoDia(sessoes);
    } catch (error) {
      setErro(error.message);
      setSessoesDoDia([]);
    } finally {
      setLoading(false);
    }
  };

  
  const abrirModal = (tipo, payload = {}) => {
    window.dispatchEvent(
      new CustomEvent("agenda:abrir-modal", { detail: { tipo, ...payload } })
    );
  };

  const handleAdicionarCliente = () => {
    setModalNovoCliente(true);
  };

  const handleMarcarSessao = () => {
    setModalMarcarSessao(true);
  };

  const handleVerDetalhesCliente = async (sessao) => {
    try {
      // Buscar próximas sessões do cliente
      const proximasSessoes = await buscarProximasSessoesCliente(sessao.clienteId);
      
      // Criar objeto cliente com dados da sessão e próximas sessões
      const cliente = {
        id: sessao.clienteId,
        nome: sessao.clienteNome,
        contato: sessao.clienteContato,
        endereco: 'Endereço não informado',
        observacoes: 'Observações não informadas',
        sessoes: [
          {
            data: sessao.data,
            numeroSessao: sessao.numeroSessao,
            descricao: sessao.descricao,
            valor: sessao.valor || '0'
          }
        ],
        proximasSessoes: proximasSessoes
      };
      
      setClienteSelecionado(cliente);
      setModalDetalhesCliente(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      setErro('Falha ao carregar detalhes do cliente');
    }
  };

  const handleModalSuccess = (novoCliente = null) => {
    if (novoCliente) {
      console.log('Novo cliente cadastrado:', novoCliente);
      
    }
    carregarAgendaDoDia(chaveData);
  };

  const handleSessaoRealizada = () => {
      console.log("Sessão realizada (placeholder)");
  };

  const handleSessaoCancelada = async (sessao) => {
    try {
      await cancelarSessao(sessao.id, 'Cancelado pelo tatuador');
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      console.error('Erro ao cancelar sessão:', error);
      setErro('Falha ao cancelar sessão');
    }
  };

  const handleSessaoRealizadaPorCliente = async (sessao) => {
    try {
      await marcarSessaoRealizada(sessao.id);
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      console.error('Erro ao marcar sessão como realizada:', error);
      setErro('Falha ao marcar sessão como realizada');
    }
  };

  const handleDataChange = (e) => {
    const valor = e.target.value; // yyyy-mm-dd
    console.log("Valor digitado:", valor);
    
    if (valor) {
      const nova = new Date(valor + 'T00:00:00');
      console.log("Nova data criada:", nova);
      console.log("Data original:", valor); 
      
      if (!isNaN(nova.getTime())) {
        setDataSelecionada(nova);
      }
    }
  };

  const handleBuscarAgenda = () => {
    carregarAgendaDoDia(chaveData);
  };

  return (
    <div id="agenda-screen" className="min-h-screen lg:ml-64 p-6">
        <Layout><div className="max-w-6xl mx-auto">
        {/* Header */
        }
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
            <p className="text-gray-400">Gerencie seus agendamentos do dia</p>
          </div>
        </div>
        
        {/* Seletor de Data + Ações (input à esquerda, botões à direita) */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      
            <div className="card p-4 rounded-lg inline-flex items-center gap-3 w-fit">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <label htmlFor="agenda-date" className="text-gray-300 text-sm font-medium">Data:</label>
              </div>
              <input
                id="agenda-date"
                type="date"
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-colors min-w-[140px]"
                value={chaveData}
                onChange={handleDataChange}
              />
              <button
                onClick={handleBuscarAgenda}
                disabled={loading}
                className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-2 ${
                  loading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title="Buscar agenda do dia"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-start lg:items-end gap-3">
              <button
                onClick={handleAdicionarCliente}
                className="btn-primary px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center w-full sm:w-48 lg:w-60"
              >
                
                Adicionar Cliente
              </button>
              <button
                onClick={handleMarcarSessao}
                className="border border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium text-sm inline-flex items-center justify-center w-full sm:w-48 lg:w-60"
              >
                
                Marcar Sessão
              </button>
            </div>
          </div>
        </div>

        {/* Mensagem de erro */}
        {erro && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 text-sm">{erro}</span>
              <button
                onClick={() => setErro(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Lista de sessões do dia ou estado vazio */}
        {sessoesDoDia.length === 0 ? (
          <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">Sem agendamentos por enquanto</h3>
            <p className="text-gray-400 mb-6">Adicione um cliente para criar o primeiro horário do dia.</p>

            <div className="flex flex-col gap-3 w-full sm:w-auto">
              <button
                onClick={handleAdicionarCliente}
                className="btn-primary px-6 py-3 rounded-lg font-semibold w-full sm:w-48 lg:w-52"
              >
                Adicionar Cliente
              </button>
              <button
                onClick={handleMarcarSessao}
                className="border border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium w-full sm:w-48 lg:w-52"
              >
                Marcar Sessão
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sessoesDoDia.map((sessao) => (
              <div key={sessao.id} className="card p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                    {sessao.clienteNome.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{sessao.clienteNome}</span>
                      <span className="text-gray-400 text-sm">{sessao.horario}</span>
                      <span className="text-gray-500 text-xs">{sessao.duracaoMin}min</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{sessao.descricao}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 self-stretch md:self-auto">
                  <button
                    onClick={() => handleVerDetalhesCliente(sessao)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto transition-colors"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => handleSessaoRealizadaPorCliente(sessao)}
                    className="btn-primary px-4 py-2 rounded-lg font-semibold w-full sm:w-auto"
                  >
                    Sessão Realizada
                  </button>
                  <button
                    onClick={() => handleSessaoCancelada(sessao)}
                    className="border border-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium w-full sm:w-auto"
                  >
                    Sessão Cancelada
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      
        
        <ModalCadastrarCliente
          isOpen={modalNovoCliente}
          onClose={() => setModalNovoCliente(false)}
          onSave={(novoCliente) => handleModalSuccess(novoCliente)}
        />

        <ModalMarcarSessao
          isOpen={modalMarcarSessao}
          onClose={() => setModalMarcarSessao(false)}
          onSuccess={handleModalSuccess}
          dataSelecionada={chaveData}
        />


        <ModalDetalhesCliente
          isOpen={modalDetalhesCliente}
          onClose={() => setModalDetalhesCliente(false)}
          cliente={clienteSelecionado}
          onEditClient={(cliente) => {
            console.log('Editar cliente:', cliente);
          }}
        />
      </div>
      </Layout>
    </div>
  );
}


