import { api } from "../lib/api";

/**
 * Busca a agenda de um dia específico
 * @param {string} data - Data no formato yyyy-mm-dd
 * @returns {Promise<Array>} Lista de sessões do dia
 */
export const buscarAgendaDoDia = async (data) => {
  try {
    console.log('Buscando agenda para a data:', data);
    
    // TODO: Substituir pela URL real da API quando o backend estiver pronto
    // const response = await api.get(`/agenda/${data}`);
    // return response.data;
    
    // Simulação temporária com dados mockados
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simula delay da API
    
    const sessoesMockPorData = {
      // Exemplo: hoje tem 2 clientes
      [data]: [
        {
          id: "sessao-1",
          clienteId: "cliente-1",
          clienteNome: "João Silva",
          clienteContato: "(11) 99999-1111",
          horario: "10:00",
          descricao: "Fechamento de traço no antebraço",
          duracaoMin: 90,
          numeroSessao: "2",
          valor: "300"
        },
        {
          id: "sessao-2",
          clienteId: "cliente-2",
          clienteNome: "Maria Souza",
          clienteContato: "(11) 88888-2222",
          horario: "14:30",
          descricao: "Preenchimento de sombreamento na perna",
          duracaoMin: 120,
          numeroSessao: "1",
          valor: "450"
        },
      ],
      // Outro exemplo fixo: 2025-12-01
      "2025-12-01": [
        {
          id: "sessao-3",
          clienteId: "cliente-3",
          clienteNome: "Carlos Pereira",
          clienteContato: "(11) 77777-3333",
          horario: "09:00",
          descricao: "Primeira sessão da composição nas costas",
          duracaoMin: 180,
          numeroSessao: "1",
          valor: "500"
        },
      ],
    };
    
    return sessoesMockPorData[data] || [];
  } catch (error) {
    console.error('Erro ao buscar agenda:', error);
    throw new Error('Falha ao carregar agenda do dia');
  }
};

/**
 * Marca uma sessão como realizada
 * @param {string} sessaoId - ID da sessão
 * @returns {Promise<Object>} Sessão atualizada
 */
export const marcarSessaoRealizada = async (sessaoId) => {
  try {
    console.log('Marcando sessão como realizada:', sessaoId);
    
    // TODO: Substituir pela URL real da API
    // const response = await api.put(`/agenda/sessao/${sessaoId}/realizada`);
    // return response.data;
    
    // Simulação temporária
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      id: sessaoId, 
      status: 'realizada', 
      dataRealizacao: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Erro ao marcar sessão como realizada:', error);
    throw new Error('Falha ao marcar sessão como realizada');
  }
};

/**
 * Cancela uma sessão
 * @param {string} sessaoId - ID da sessão
 * @param {string} motivo - Motivo do cancelamento
 * @returns {Promise<Object>} Sessão cancelada
 */
export const cancelarSessao = async (sessaoId, motivo = '') => {
  try {
    console.log('Cancelando sessão:', sessaoId, 'Motivo:', motivo);
    
    // TODO: Substituir pela URL real da API
    // const response = await api.put(`/agenda/sessao/${sessaoId}/cancelada`, { motivo });
    // return response.data;
    
    // Simulação temporária
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      id: sessaoId, 
      status: 'cancelada', 
      motivo,
      dataCancelamento: new Date().toISOString() 
    };
  } catch (error) {
    console.error('Erro ao cancelar sessão:', error);
    throw new Error('Falha ao cancelar sessão');
  }
};

/**
 * Adiciona uma nova sessão à agenda
 * @param {Object} dadosSessao - Dados da nova sessão
 * @returns {Promise<Object>} Nova sessão criada
 */
export const adicionarSessao = async (dadosSessao) => {
  try {
    console.log('Adicionando nova sessão:', dadosSessao);
    
    // TODO: Substituir pela URL real da API
    // const response = await api.post('/agenda/sessao', dadosSessao);
    // return response.data;
    
    // Simulação temporária
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      id: `sessao-${Date.now()}`,
      ...dadosSessao,
      status: 'agendada',
      dataCriacao: new Date().toISOString()
    };
  } catch (error) {
    console.error('Erro ao adicionar sessão:', error);
    throw new Error('Falha ao adicionar sessão');
  }
};

/**
 * Busca estatísticas da agenda (total de sessões, realizadas, canceladas)
 * @param {string} dataInicio - Data de início no formato yyyy-mm-dd
 * @param {string} dataFim - Data de fim no formato yyyy-mm-dd
 * @returns {Promise<Object>} Estatísticas da agenda
 */
export const buscarEstatisticasAgenda = async (dataInicio, dataFim) => {
  try {
    console.log('Buscando estatísticas da agenda:', dataInicio, 'até', dataFim);
    
    // TODO: Substituir pela URL real da API
    // const response = await api.get(`/agenda/estatisticas?inicio=${dataInicio}&fim=${dataFim}`);
    // return response.data;
    
    // Simulação temporária
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return {
      totalSessoes: 15,
      sessoesRealizadas: 12,
      sessoesCanceladas: 2,
      sessoesPendentes: 1,
      faturamentoTotal: 2500.00
    };
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw new Error('Falha ao carregar estatísticas da agenda');
  }
};

/**
 * Busca próximas sessões de um cliente específico
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Array>} Lista de próximas sessões do cliente
 */
export const buscarProximasSessoesCliente = async (clienteId) => {
  try {
    console.log('Buscando próximas sessões do cliente:', clienteId);
    
    // TODO: Substituir pela URL real da API
    // const response = await api.get(`/agenda/cliente/${clienteId}/proximas`);
    // return response.data;
    
    // Simulação temporária com dados mockados
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const hoje = new Date();
    const proximasSessoesMock = [
      {
        id: "proxima-1",
        data: new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 dias
        horario: "14:00",
        numeroSessao: "2",
        descricao: "Continuação do trabalho no braço",
        valor: "300"
      },
      {
        id: "proxima-2", 
        data: new Date(hoje.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +14 dias
        horario: "10:00",
        numeroSessao: "3",
        descricao: "Finalização e retoques",
        valor: "250"
      }
    ];
    
    return proximasSessoesMock;
  } catch (error) {
    console.error('Erro ao buscar próximas sessões:', error);
    throw new Error('Falha ao carregar próximas sessões do cliente');
  }
};
