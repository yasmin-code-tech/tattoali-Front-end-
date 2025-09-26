import { useMemo, useState, useEffect } from "react";
import Layout from '../../baselayout/Layout'
import { marcarSessaoRealizada, cancelarSessao, buscarSessoesPendentesCliente, buscarSessoesRealizadasCliente, adicionarSessao, buscarSessoesPendentesPorData, buscarSessoesRealizadasPorData, buscarSessoesCanceladasPorData } from '../../services/agendaService'
import { criarCliente } from '../../services/clienteService'
import ModalMarcarSessao from "../../components/ModalMarcarSessao";
import ModalDetalhesCliente from '../../components/ModalDetalhesCliente'
import ModalConfirmarSessaoRealizada from "../../components/ModalConfirmarSessaoRealizada";
import ModalCancelarSessao from "../../components/ModalCancelarSessao";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";



export default function Agenda() {

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [todasSessoesDoDia, setTodasSessoesDoDia] = useState([]); // Todas as sessões da data
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalMarcarSessao, setModalMarcarSessao] = useState(false);
  const [modalDetalhesCliente, setModalDetalhesCliente] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalRealizadaOpen, setModalRealizadaOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null);
  const [filtroVisualizacao, setFiltroVisualizacao] = useState('pendentes'); // 'pendentes', 'realizadas', 'canceladas'

  const chaveData = useMemo(() => {
    console.log('=== CALCULANDO chaveData ===');
    console.log('dataSelecionada:', dataSelecionada);
    console.log('Tipo:', typeof dataSelecionada);
    
    if (!dataSelecionada || isNaN(dataSelecionada.getTime())) {
      console.log('Data inválida, usando data atual');
      const dataAtual = new Date().toISOString().split('T')[0];
      console.log('Data atual:', dataAtual);
      return dataAtual;
    }
    
    const dataFormatada = dataSelecionada.toISOString().split('T')[0];
    console.log('Data formatada:', dataFormatada);
    return dataFormatada;
  }, [dataSelecionada]);

  
  const carregarAgendaDoDia = async (data) => {
    console.log('=== CARREGANDO AGENDA ===');
    console.log('Data recebida:', data);
    console.log('Tipo da data:', typeof data);
    console.log('Filtro atual:', filtroVisualizacao);
    
    // Validar se a data é válida
    if (!data || data === 'undefined' || data === 'null') {
      console.log('Data inválida recebida, usando data atual');
      data = new Date().toISOString().split('T')[0];
      console.log('Data corrigida:', data);
    }
    
    setLoading(true);
    setErro(null);
    
    try {
      let sessoes = [];
      
      // Chamar a API específica baseada no filtro atual
      switch (filtroVisualizacao) {
        case 'pendentes':
          console.log('Chamando buscarSessoesPendentesPorData com data:', data);
          sessoes = await buscarSessoesPendentesPorData(data);
          break;
        case 'realizadas':
          console.log('Chamando buscarSessoesRealizadasPorData com data:', data);
          sessoes = await buscarSessoesRealizadasPorData(data);
          break;
        case 'canceladas':
          console.log('Chamando buscarSessoesCanceladasPorData com data:', data);
          sessoes = await buscarSessoesCanceladasPorData(data);
          break;
        default:
          console.log('Chamando buscarSessoesPendentesPorData (default) com data:', data);
          sessoes = await buscarSessoesPendentesPorData(data);
      }
      
      console.log('Sessões retornadas:', sessoes);
      setTodasSessoesDoDia(Array.isArray(sessoes) ? sessoes : []);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      setErro(error.message);
      setTodasSessoesDoDia([]);
    } finally {
      setLoading(false);
    }
  };

  // Função para obter as sessões baseadas no filtro atual
  const getSessoesAtuais = () => {
    return Array.isArray(todasSessoesDoDia) ? todasSessoesDoDia : [];
  };

  const handleFiltroChange = (novoFiltro) => {
    setFiltroVisualizacao(novoFiltro);
    // O useEffect vai automaticamente recarregar os dados quando filtroVisualizacao mudar
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
    console.log('Agenda: handleMarcarSessao chamado');
    console.log('Agenda: modalMarcarSessao antes:', modalMarcarSessao);
    setModalMarcarSessao(true);
    console.log('Agenda: setModalMarcarSessao(true) executado');
  };

  const handleVerDetalhesCliente = async (sessao) => {
    try {
      // Buscar sessões pendentes e realizadas do cliente separadamente
      const [sessoesPendentes, sessoesRealizadas] = await Promise.all([
        buscarSessoesPendentesCliente(sessao.cliente_id),
        buscarSessoesRealizadasCliente(sessao.cliente_id)
      ]);
      
      // Criar objeto cliente com dados da sessão e sessões separadas
      const cliente = {
        id: sessao.cliente_id,
        nome: sessao.cliente?.nome || 'Cliente não encontrado',
        contato: sessao.cliente?.telefone || 'Contato não informado',
        endereco: 'Endereço não informado',
        observacoes: 'Observações não informadas',
        sessoes: sessoesRealizadas.map(sessao => ({
          data: sessao.data_atendimento,
          numeroSessao: sessao.numero_sessao,
          descricao: sessao.descricao,
          valor: sessao.valor_sessao || '0'
        })),
        proximasSessoes: sessoesPendentes.map(sessao => ({
          data: sessao.data_atendimento,
          horario: new Date(sessao.data_atendimento).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          numeroSessao: sessao.numero_sessao,
          descricao: sessao.descricao,
          valor: sessao.valor_sessao || '0'
        }))
      };
      
      setClienteSelecionado(cliente);
      setModalDetalhesCliente(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      setErro('Falha ao carregar detalhes do cliente');
    }
  };

  const handleModalSuccess = async (dados = null) => {
    if (dados) {
      // Se tem cliente, é cadastro de cliente
      if (dados.nome) {
        console.log('Novo cliente cadastrado:', dados);
        try {
          const clienteCriado = await criarCliente(dados);
          console.log('Cliente criado no backend:', clienteCriado);
        } catch (error) {
          console.error('Erro ao criar cliente:', error);
        }
      }
      // Se tem sessoes, é cadastro de sessões
      else if (dados.sessoes) {
        console.log('Novas sessões para cadastrar:', dados);
        try {
          for (const sessao of dados.sessoes) {
            console.log('Criando sessão:', sessao);
            const sessaoCriada = await adicionarSessao(sessao);
            console.log('Sessão criada no backend:', sessaoCriada);
          }
        } catch (error) {
          console.error('Erro ao criar sessões:', error);
        }
      }
    }
    carregarAgendaDoDia(chaveData);
  };

  const handleSessaoRealizada = () => {
      console.log("Sessão realizada (placeholder)");
  };

  const handleSessaoCancelada = (sessao) => {
    setSessaoSelecionada(sessao);
    setModalCancelarOpen(true);
  };

  const handleSessaoRealizadaPorCliente = (sessao) => {
    setSessaoSelecionada(sessao);
    setModalRealizadaOpen(true);
  };

  const confirmarSessaoRealizada = async (sessao) => {
    try {
      await marcarSessaoRealizada(sessao.sessao_id);
      setModalRealizadaOpen(false);
      setSessaoSelecionada(null);
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      console.error('Erro ao marcar sessão como realizada:', error);
      setErro('Falha ao marcar sessão como realizada');
    }
  };

  const confirmarSessaoCancelada = async (sessao, motivo) => {
    try {
      await cancelarSessao(sessao.sessao_id, motivo || 'Cancelado pelo tatuador');
      setModalCancelarOpen(false);
      setSessaoSelecionada(null);
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      console.error('Erro ao cancelar sessão:', error);
      setErro('Falha ao cancelar sessão');
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

  // useEffect para carregar dados iniciais e quando o filtro muda
  useEffect(() => {
    carregarAgendaDoDia(chaveData);
  }, [chaveData, filtroVisualizacao]);

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

        {/* Filtros de Visualização */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => handleFiltroChange('pendentes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroVisualizacao === 'pendentes'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sessões Pendentes
            </button>
            <button
              onClick={() => handleFiltroChange('realizadas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroVisualizacao === 'realizadas'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sessões Realizadas
            </button>
            <button
              onClick={() => handleFiltroChange('canceladas')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filtroVisualizacao === 'canceladas'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Sessões Canceladas
            </button>
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
        {!loading && todasSessoesDoDia.length === 0 ? (
          <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">
              {filtroVisualizacao === 'pendentes' && `Sem agendamentos para ${dataSelecionada.toLocaleDateString('pt-BR')}`}
              {filtroVisualizacao === 'realizadas' && `Nenhuma sessão realizada em ${dataSelecionada.toLocaleDateString('pt-BR')}`}
              {filtroVisualizacao === 'canceladas' && `Nenhuma sessão cancelada em ${dataSelecionada.toLocaleDateString('pt-BR')}`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filtroVisualizacao === 'pendentes' && 'Adicione um cliente para criar o primeiro horário do dia.'}
              {filtroVisualizacao === 'realizadas' && 'Não há sessões concluídas registradas para esta data.'}
              {filtroVisualizacao === 'canceladas' && 'Não há sessões canceladas registradas para esta data.'}
            </p>

            {filtroVisualizacao === 'pendentes' && (
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
            )}
          </div>
        ) : !loading && getSessoesAtuais().length === 0 ? (
          <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
            <svg className="w-10 h-10 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">
              {filtroVisualizacao === 'realizadas' && `Nenhuma sessão realizada em ${dataSelecionada.toLocaleDateString('pt-BR')}`}
              {filtroVisualizacao === 'canceladas' && `Nenhuma sessão cancelada em ${dataSelecionada.toLocaleDateString('pt-BR')}`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filtroVisualizacao === 'realizadas' && 'Não há sessões concluídas registradas para esta data.'}
              {filtroVisualizacao === 'canceladas' && 'Não há sessões canceladas registradas para esta data.'}
            </p>
            <button
              onClick={() => setFiltroVisualizacao('pendentes')}
              className="btn-secondary px-6 py-3 rounded-lg font-semibold"
            >
              Ver Sessões Pendentes
            </button>
          </div>
        ) : !loading ? (
          <div className="space-y-4">
            {getSessoesAtuais().map((sessao) => (
              <div key={sessao.sessao_id} className="card p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                    {sessao.cliente?.nome?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{sessao.cliente?.nome || 'Cliente não encontrado'}</span>
                      <span className="text-gray-400 text-sm">{sessao.data_atendimento ? new Date(sessao.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      <span className="text-gray-500 text-xs">Sessão {sessao.numero_sessao}</span>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{sessao.descricao || 'Sem descrição'}</p>
                    <p className="text-green-400 text-sm">R$ {sessao.valor_sessao || '0,00'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3 self-stretch md:self-auto">
                  <button
                    onClick={() => handleVerDetalhesCliente(sessao)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium w-full sm:w-auto transition-colors"
                  >
                    Detalhes
                  </button>
                  {filtroVisualizacao === 'pendentes' && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
            <svg className="w-8 h-8 text-gray-500 mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <h3 className="text-white text-lg font-semibold mb-2">Carregando agenda...</h3>
            <p className="text-gray-400">Buscando sessões do dia</p>
          </div>
        )}

      
        
        <ModalCadastrarCliente
          isOpen={modalNovoCliente}
          onClose={() => setModalNovoCliente(false)}
          onSave={(novoCliente) => handleModalSuccess(novoCliente)}
        />

        <ModalMarcarSessao
          isOpen={modalMarcarSessao}
          onClose={() => {
            console.log('Agenda: Fechando modal marcar sessão');
            setModalMarcarSessao(false);
          }}
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

        <ModalConfirmarSessaoRealizada
          isOpen={modalRealizadaOpen}
          onClose={() => setModalRealizadaOpen(false)}
          onConfirm={confirmarSessaoRealizada}
          sessao={sessaoSelecionada}
        />

        <ModalCancelarSessao
          isOpen={modalCancelarOpen}
          onClose={() => setModalCancelarOpen(false)}
          onConfirm={confirmarSessaoCancelada}
          sessao={sessaoSelecionada}
        />
      </div>
      </Layout>
    </div>
  );
}


