import { useMemo, useState, useEffect } from "react";
import Layout from '../../baselayout/Layout';
import { 
    marcarSessaoRealizada, 
    cancelarSessao, 
    buscarSessoesPendentesCliente, 
    buscarSessoesRealizadasCliente, 
    adicionarSessao, 
    buscarSessoesPendentesPorData, 
    buscarSessoesRealizadasPorData, 
    buscarSessoesCanceladasPorData 
    // Lembre-se de importar a função de busca por nome, ex: buscarSessoesPorNome
} from '../../services/agendaService';
import { criarCliente } from '../../services/clienteService';
import ModalMarcarSessao from "../../components/ModalMarcarSessao";
import ModalDetalhesCliente from '../../components/ModalDetalhesCliente';
import ModalConfirmarSessaoRealizada from "../../components/ModalConfirmarSessaoRealizada";
import ModalCancelarSessao from "../../components/ModalCancelarSessao";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";
import { notifySuccess, notifyWarn, notifyError } from "../../services/notificationService";

export default function Agenda() {

  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [todasSessoesDoDia, setTodasSessoesDoDia] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null); 
  const [modalNovoCliente, setModalNovoCliente] = useState(false);
  const [modalMarcarSessao, setModalMarcarSessao] = useState(false);
  const [modalDetalhesCliente, setModalDetalhesCliente] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [modalRealizadaOpen, setModalRealizadaOpen] = useState(false);
  const [modalCancelarOpen, setModalCancelarOpen] = useState(false);
  const [sessaoSelecionada, setSessaoSelecionada] = useState(null);
  const [filtroVisualizacao, setFiltroVisualizacao] = useState('pendentes'); 

  // ✅ NOVOS ESTADOS ADICIONADOS
  const [ordemHorario, setOrdemHorario] = useState('asc'); // 'asc' ou 'desc'
  const [filtroBusca, setFiltroBusca] = useState('data'); // 'data' ou 'nome'
  const [valorBusca, setValorBusca] = useState(''); // valor da busca por nome

  const chaveData = useMemo(() => {
    // ... (lógica original do useMemo)
    if (!dataSelecionada || isNaN(dataSelecionada.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return dataSelecionada.toISOString().split('T')[0];
  }, [dataSelecionada]);

  const carregarAgendaDoDia = async (data) => {
    // ... (lógica original do carregarAgendaDoDia)
    const dataValida = data || new Date().toISOString().split('T')[0];
    setLoading(true); 
    setErro(null); 
    try {
      let sessoes = [];
      switch (filtroVisualizacao) {
        case 'pendentes':
          sessoes = await buscarSessoesPendentesPorData(dataValida);
          break;
        case 'realizadas':
          sessoes = await buscarSessoesRealizadasPorData(dataValida);
          break;
        case 'canceladas':
          sessoes = await buscarSessoesCanceladasPorData(dataValida);
          break;
        default: 
          sessoes = await buscarSessoesPendentesPorData(dataValida);
      }
      setTodasSessoesDoDia(Array.isArray(sessoes) ? sessoes : []);
    } catch (error) {
      const errorMessage = error.message || "Falha ao carregar a agenda.";
      setErro(errorMessage); 
      notifyError(errorMessage); 
      setTodasSessoesDoDia([]); 
    } finally {
      setLoading(false); 
    }
  };

  // ✅ FUNÇÃO ATUALIZADA PARA ORDENAR
  const getSessoesAtuais = () => {
    const sessoes = Array.isArray(todasSessoesDoDia) ? [...todasSessoesDoDia] : [];
  
    sessoes.sort((a, b) => {
      const horaA = a?.data_atendimento ? new Date(a.data_atendimento).getTime() : Infinity;
      const horaB = b?.data_atendimento ? new Date(b.data_atendimento).getTime() : Infinity;
      return ordemHorario === 'asc' ? horaA - horaB : horaB - horaA;
    });
  
    return sessoes;
  };

  const handleFiltroChange = (novoFiltro) => {
    setFiltroVisualizacao(novoFiltro);
  };
  
  const handleAdicionarCliente = () => setModalNovoCliente(true);
  const handleMarcarSessao = () => setModalMarcarSessao(true);

  const handleVerDetalhesCliente = async (sessao) => {
    // ... (lógica original do handleVerDetalhesCliente)
    if (!sessao || !sessao.cliente_id) {
        notifyError("Informações do cliente incompletas.");
        return;
    }
    try {
      const [sessoesPendentes, sessoesRealizadas] = await Promise.all([
        buscarSessoesPendentesCliente(sessao.cliente_id),
        buscarSessoesRealizadasCliente(sessao.cliente_id)
      ]);
      const cliente = {
        id: sessao.cliente_id,
        nome: sessao.cliente?.nome || 'Cliente não encontrado',
        contato: sessao.cliente?.telefone || 'Contato não informado',
        endereco: sessao.cliente?.endereco || 'Endereço não informado',
        observacoes: sessao.cliente?.observacoes || 'Observações não informadas',
        sessoes: sessoesRealizadas.map(s => ({ data: s.data_atendimento, numeroSessao: s.numero_sessao, descricao: s.descricao, valor: s.valor_sessao || '0' })),
        proximasSessoes: sessoesPendentes.map(s => ({ data: s.data_atendimento, horario: new Date(s.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), numeroSessao: s.numero_sessao, descricao: s.descricao, valor: s.valor_sessao || '0' }))
      };
      setClienteSelecionado(cliente); 
      setModalDetalhesCliente(true); 
    } catch (error) {
      const errorMessage = error.message || 'Falha ao carregar detalhes do cliente';
      console.error('Erro ao buscar detalhes do cliente:', error);
      setErro(errorMessage);
      notifyError(errorMessage); 
    }
  };

  const handleModalSuccess = async (dados = null) => {
    // ... (lógica original do handleModalSuccess, sem notificações)
    if (dados) {
      if (dados.nome) {
        try {
          await criarCliente(dados); 
          console.log('Cliente criado no backend com sucesso.');
        } catch (error) {
          const errorMessage = error.message || "Falha ao cadastrar cliente.";
          console.error('Erro ao criar cliente:', error);
          setErro(errorMessage);
        }
      }
      else if (dados.sessoes && Array.isArray(dados.sessoes)) {
        try {
          await Promise.all(dados.sessoes.map(sessao => adicionarSessao(sessao)));
          console.log('Sessões criadas no backend com sucesso.');
        } catch (error) {
          const errorMessage = error.message || "Falha ao marcar sessão.";
          console.error('Erro ao criar sessões:', error);
          setErro(errorMessage);
        }
      }
    }
    carregarAgendaDoDia(chaveData);
  };

  const abrirModalConfirmarRealizada = (sessao) => {
    setSessaoSelecionada(sessao);
    setModalRealizadaOpen(true);
  };
  const abrirModalConfirmarCancelada = (sessao) => {
    setSessaoSelecionada(sessao);
    setModalCancelarOpen(true);
  };

  const confirmarSessaoRealizada = async (sessao) => {
    // ... (lógica original com notificações)
    if (!sessao || !sessao.sessao_id) {
        notifyError("Erro interno: ID da sessão inválido.");
        return;
    }
    try {
      await marcarSessaoRealizada(sessao.sessao_id);
      notifySuccess("Sessão realizada com sucesso!"); 
      setModalRealizadaOpen(false);
      setSessaoSelecionada(null);
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      const errorMessage = error.message || 'Falha ao marcar sessão como realizada';
      console.error('Erro ao marcar sessão como realizada:', error);
      setErro(errorMessage);
      notifyError(errorMessage); 
    }
  };

  const confirmarSessaoCancelada = async (sessao, motivo) => {
    // ... (lógica original com notificações)
    if (!sessao || !sessao.sessao_id) {
        notifyError("Erro interno: ID da sessão inválido.");
        return;
    }
    try {
      await cancelarSessao(sessao.sessao_id, motivo || 'Cancelado pelo tatuador');
      notifySuccess("Sessão cancelada com sucesso."); // Trocado de Warn para Success
      setModalCancelarOpen(false);
      setSessaoSelecionada(null);
      carregarAgendaDoDia(chaveData);
    } catch (error) {
      const errorMessage = error.message || 'Falha ao cancelar sessão';
      console.error('Erro ao cancelar sessão:', error);
      setErro(errorMessage);
      notifyError(errorMessage); 
    }
  };

  const handleDataChange = (e) => {
    const valor = e.target.value; 
    if (valor) {
      const nova = new Date(valor + 'T00:00:00'); 
      if (!isNaN(nova.getTime())) {
        setDataSelecionada(nova);
      }
    }
  };

  // ✅ FUNÇÃO ATUALIZADA para lidar com busca por data ou nome
  const handleBuscarAgenda = () => {
    if(filtroBusca === 'data'){
      carregarAgendaDoDia(chaveData);
    } else {
      // Buscar por nome usando valorBusca
      console.log("Busca por nome:", valorBusca);
      // Aqui você precisará chamar a função do serviço que filtra sessões por nome
      // Por exemplo: buscarSessoesPorNome(valorBusca)
      notifyWarn("A busca por nome ainda não foi implementada.");
    }
  };

  // ✅ useEffect ATUALIZADO para nova lógica de busca
  useEffect(() => {
    if (filtroBusca === 'data') {
      carregarAgendaDoDia(chaveData);
    }
    // Se o filtro for 'nome', a busca é acionada apenas pelo botão 'handleBuscarAgenda'
  }, [chaveData, filtroVisualizacao, filtroBusca]); // Adiciona filtroBusca

  return (
    <div id="agenda-screen" className="min-h-screen p-6">
      <Layout>
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho da Página */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
              <p className="text-gray-400">Gerencie seus agendamentos</p>
            </div>
          </div>
          
          {/* Seletor de Data e Botões de Ação */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              
              {/* ✅ INÍCIO DO BLOCO DE BUSCA ATUALIZADO */}
              <div className="card p-4 rounded-lg inline-flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <label className="text-gray-300 text-sm font-medium">Buscar por:</label>
                </div>
                <select
                  value={filtroBusca}
                  onChange={e => setFiltroBusca(e.target.value)}
                  className="input-field bg-gray-800 border-gray-600 px-2 py-2 rounded-lg text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                >
                  <option value="data">Data</option>
                  <option value="nome">Nome</option>
                </select>

                {/* Input condicional: Data ou Nome */}
                {filtroBusca === 'data' ? (
                  <input
                    type="date"
                    value={chaveData}
                    onChange={handleDataChange}
                    className="input-field bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none min-w-[140px]"
                  />
                ) : (
                  <input
                    type="text"
                    placeholder="Digite o nome do cliente"
                    value={valorBusca}
                    onChange={(e) => setValorBusca(e.target.value)}
                    className="input-field bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none min-w-[140px]"
                  />
                )}

                <button
                  onClick={handleBuscarAgenda}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm inline-flex items-center gap-2 ${
                    loading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'btn-primary hover:bg-red-700'
                  }`}
                  title="Buscar agenda do dia"
                >
                  {loading ? ( 
                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg> 
                  ) : ( 
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg> 
                  )}
                  {loading ? 'Buscando...' : 'Buscar'}
                </button>
              </div>
              {/* ✅ FIM DO BLOCO DE BUSCA ATUALIZADO */}

              {/* Botões de Ação (Adicionar Cliente / Marcar Sessão) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <button onClick={handleAdicionarCliente} className="btn-primary px-6 py-3 rounded-lg font-semibold text-sm inline-flex items-center justify-center w-full sm:w-auto">
                  Adicionar Cliente
                </button>
                <button onClick={handleMarcarSessao} className="btn-secondary px-6 py-3 rounded-lg font-medium text-sm inline-flex items-center justify-center w-full sm:w-auto">
                  Marcar Sessão
                </button>
              </div>
            </div>
          </div>

          {/* ✅ SEÇÃO DE FILTROS E ORDENAÇÃO ATUALIZADA */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* Lado Esquerdo: Filtros de Visualização */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <button onClick={() => handleFiltroChange('pendentes')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ filtroVisualizacao === 'pendentes' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}>
                Pendentes
              </button>
              <button onClick={() => handleFiltroChange('realizadas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ filtroVisualizacao === 'realizadas' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}>
                Realizadas
              </button>
              <button onClick={() => handleFiltroChange('canceladas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ filtroVisualizacao === 'canceladas' ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600' }`}>
                Canceladas
              </button>
            </div>
            {/* Lado Direito: Botão de Ordenação */}
            <button
              onClick={() => setOrdemHorario(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                ordemHorario === 'asc' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={ordemHorario === 'asc' ? 'Mostrar mais tarde primeiro' : 'Mostrar mais cedo primeiro'}
            >
              {ordemHorario === 'asc' ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                  </svg>
                  <span>Mais Cedo</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>Mais Tarde</span>
                </>
              )}
            </button>
          </div>

          {/* Mensagem de erro (Opcional) */}
          {erro && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex items-center gap-2">
               <svg className="w-5 h-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span className="text-red-400 text-sm flex-grow">{erro}</span>
               <button onClick={() => setErro(null)} className="ml-auto text-red-400 hover:text-red-300 flex-shrink-0">
                   <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                   </svg>
               </button>
            </div>
          )}

          {/* Conteúdo Principal: Loading, Estado Vazio ou Lista de Sessões */}
          {loading ? (
             <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
                 <svg className="w-8 h-8 text-gray-500 mb-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 <h3 className="text-white text-lg font-semibold mb-2">Carregando agenda...</h3>
             </div>
          ) : getSessoesAtuais().length === 0 ? (
            <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
              <svg className="w-10 h-10 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {filtroVisualizacao === 'pendentes' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />}
                {filtroVisualizacao === 'realizadas' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                {filtroVisualizacao === 'canceladas' && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />}
              </svg>
              <h3 className="text-white text-lg font-semibold mb-2">
                {filtroVisualizacao === 'pendentes' && `Sem agendamentos pendentes para ${dataSelecionada ? dataSelecionada.toLocaleDateString('pt-BR') : 'hoje'}`}
                {filtroVisualizacao === 'realizadas' && `Nenhuma sessão realizada em ${dataSelecionada ? dataSelecionada.toLocaleDateString('pt-BR') : 'hoje'}`}
                {filtroVisualizacao === 'canceladas' && `Nenhuma sessão cancelada em ${dataSelecionada ? dataSelecionada.toLocaleDateString('pt-BR') : 'hoje'}`}
              </h3>
              <p className="text-gray-400 mb-6 max-w-md">
                {filtroVisualizacao === 'pendentes' && 'Parece que não há nada agendado para esta data. Que tal marcar uma nova sessão?'}
                {filtroVisualizacao === 'realizadas' && 'Ainda não há sessões concluídas registradas para este dia.'}
                {filtroVisualizacao === 'canceladas' && 'Nenhuma sessão foi cancelada nesta data.'}
              </p>
              {filtroVisualizacao === 'pendentes' && (
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-center">
                  <button onClick={handleAdicionarCliente} className="btn-primary px-6 py-3 rounded-lg font-semibold w-full sm:w-auto">
                    Adicionar Cliente
                  </button>
                  <button onClick={handleMarcarSessao} className="btn-secondary px-6 py-3 rounded-lg font-medium w-full sm:w-auto">
                    Marcar Sessão
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {getSessoesAtuais().map((sessao) => (
                <div key={sessao.sessao_id} className="card p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                      {sessao.cliente?.nome?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                        <span 
                          className="text-white font-semibold hover:text-red-400 cursor-pointer truncate" 
                          onClick={() => handleVerDetalhesCliente(sessao)}
                          title={sessao.cliente?.nome || 'Cliente não encontrado'}
                        >
                            {sessao.cliente?.nome || 'Cliente não encontrado'}
                        </span>
                        <span className="text-gray-400 text-xs">
                            {sessao.data_atendimento ? new Date(sessao.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário ?'}
                        </span>
                        <span className="text-gray-500 text-xs bg-gray-800 px-1.5 py-0.5 rounded">
                            Sessão {sessao.numero_sessao}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm truncate" title={sessao.descricao || 'Sem descrição'}>{sessao.descricao || 'Sem descrição'}</p>
                      <p className="text-green-400 text-sm font-medium mt-1">R$ {sessao.valor_sessao || '0,00'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 flex-shrink-0 mt-2 md:mt-0">
                    <button
                      onClick={() => handleVerDetalhesCliente(sessao)}
                      className="btn-secondary px-4 py-2 rounded-lg font-medium text-xs w-full sm:w-auto"
                    >
                      Detalhes
                    </button>
                    {filtroVisualizacao === 'pendentes' && (
                      <>
                        <button
                          onClick={() => abrirModalConfirmarRealizada(sessao)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-xs w-full sm:w-auto"
                        >
                          Marcar como Realizada
                        </button>
                        <button
                          onClick={() => abrirModalConfirmarCancelada(sessao)}
                          className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-lg transition-colors font-medium text-xs w-full sm:w-auto"
                        >
                          Cancelar Sessão
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Renderização dos Modais */}
          <ModalCadastrarCliente
            isOpen={modalNovoCliente}
            onClose={() => setModalNovoCliente(false)}
            onSave={handleModalSuccess} 
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
            // onEditClient={(cliente) => { /* ... */ }}
          />
          <ModalConfirmarSessaoRealizada
            isOpen={modalRealizadaOpen}
            onClose={() => { setModalRealizadaOpen(false); setSessaoSelecionada(null); }}
            onConfirm={confirmarSessaoRealizada} 
            sessao={sessaoSelecionada}
          />
          <ModalCancelarSessao
            isOpen={modalCancelarOpen}
            onClose={() => { setModalCancelarOpen(false); setSessaoSelecionada(null); }}
            onConfirm={confirmarSessaoCancelada} 
            sessao={sessaoSelecionada}
          />
        </div>
      </Layout>
    </div>
  );
}