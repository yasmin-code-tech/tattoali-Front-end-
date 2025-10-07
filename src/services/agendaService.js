import { api } from "../lib/api";


/**
 * Marca uma sessão como realizada
 * @param {string} sessaoId - ID da sessão
 * @returns {Promise<Object>} Sessão atualizada
 */
export const marcarSessaoRealizada = async (sessaoId) => {
  console.log('Marcando sessão como realizada:', sessaoId);
  try {
    const response = await api.put(`/api/sessions/realizar/${sessaoId}`, { 
      realizado: true
    });
    return response;
  } catch (error) {
    console.error('Falha ao marcar sessão como realizada:', error?.message);
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
  console.log('Cancelando sessão:', sessaoId, 'Motivo:', motivo);
  try {
    const response = await api.put(`/api/sessions/${sessaoId}`, { 
      realizado: false,
      cancelado: true,
      motivo: motivo 
    });
    return response;
  } catch (error) {
    console.error('Falha ao cancelar sessão:', error?.message);
    throw new Error('Falha ao cancelar sessão');
  }
};

/**
 * Adiciona uma nova sessão à agenda
 * @param {Object} dadosSessao - Dados da nova sessão
 * @returns {Promise<Object>} Nova sessão criada
 */
export const adicionarSessao = async (dadosSessao) => {
  console.log('Adicionando nova sessão:', dadosSessao);
  try {
    // Mapear dados do frontend para o formato do backend
    // Combinar data e horário em um timestamp
    const dataAtendimento = dadosSessao.horario 
      ? `${dadosSessao.data}T${dadosSessao.horario}:00`
      : `${dadosSessao.data}T00:00:00`;
    
    const dadosBackend = {
      cliente_id: dadosSessao.clienteId,
      data_atendimento: dataAtendimento,
      valor_sessao: parseFloat(dadosSessao.valor),
      numero_sessao: parseInt(dadosSessao.numeroSessao),
      descricao: dadosSessao.descricao
    };
    
    const response = await api.post('/api/sessions', dadosBackend);
    console.log('Sessão criada com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Falha ao adicionar sessão:', error?.message);
    throw new Error('Falha ao adicionar sessão');
  }
};


/**
 * Busca sessões pendentes de um cliente específico
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Array>} Lista de sessões pendentes do cliente
 */
export const buscarSessoesPendentesCliente = async (clienteId) => {
  console.log('Buscando sessões pendentes do cliente:', clienteId);
  try {
    const response = await api.get(`/api/sessions/cliente/${clienteId}/pendentes`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Falha ao carregar sessões pendentes do cliente:', error?.message);
    return [];
  }
};

/**
 * Busca sessões realizadas de um cliente específico
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Array>} Lista de sessões realizadas do cliente
 */
export const buscarSessoesRealizadasCliente = async (clienteId) => {
  console.log('=== BUSCANDO SESSÕES REALIZADAS DO CLIENTE ===');
  console.log('Cliente ID:', clienteId);
  console.log('Tipo:', typeof clienteId);
  
  try {
    const url = `/api/sessions/cliente/${clienteId}/realizadas`;
    console.log('URL chamada:', url);
    const response = await api.get(url);
    console.log('Resposta da API:', response);
    console.log('Quantidade de sessões:', Array.isArray(response) ? response.length : 0);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('=== ERRO AO BUSCAR SESSÕES REALIZADAS DO CLIENTE ===');
    console.error('Erro:', error);
    console.error('Mensagem:', error?.message);
    console.error('Status:', error?.status);
    console.error('Response data:', error?.response?.data);
    return [];
  }
};

/**
 * Busca próximas sessões de um cliente específico (DEPRECATED - usar buscarSessoesPendentesCliente)
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Array>} Lista de próximas sessões do cliente
 */
export const buscarProximasSessoesCliente = async (clienteId) => {
  console.log('DEPRECATED: Usando buscarSessoesPendentesCliente em vez de buscarProximasSessoesCliente');
  return await buscarSessoesPendentesCliente(clienteId);
};


/**
 * Busca a agenda do dia (sessões agendadas/pendentes)
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de sessões agendadas para a data
 */
export const buscarAgendaDoDia = async (data) => {
  console.log('=== BUSCANDO AGENDA DO DIA ===');
  console.log('Data:', data);
  
  // Validar se a data é válida
  if (!data || data === 'undefined' || data === 'null' || isNaN(Date.parse(data))) {
    console.log('Data inválida, usando data atual');
    data = new Date().toISOString().split('T')[0];
  }
  
  try {
    const url = `/api/sessions/pendentes?data=${encodeURIComponent(data)}`;
    console.log('URL:', url);
    const response = await api.get(url);
    console.log('Sessões agendadas encontradas:', response?.length || 0);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Erro ao buscar agenda do dia:', error?.message);
    return [];
  }
};

/**
 * Busca sessões agendadas (pendentes) de uma data específica
 * Esta é a função principal para carregar a agenda do dia
 * @param {string} data - Data no formato YYYY-MM-DD
 * @returns {Promise<Array>} Lista de sessões agendadas para a data
 */
export const buscarSessoesPendentesPorData = async (data) => {
  // Usar a função clara de agenda do dia
  return await buscarAgendaDoDia(data);
};

export const buscarSessoesRealizadasPorData = async (data) => {
  console.log('=== BUSCANDO SESSÕES REALIZADAS ===');
  console.log('Data recebida:', data);
  console.log('Tipo da data:', typeof data);
  console.log('URL que será chamada:', `/api/sessions/realizadas?data=${data}`);
  
  // Validar se a data é válida antes de fazer a requisição
  if (!data || data === 'undefined' || data === 'null' || isNaN(Date.parse(data))) {
    console.log('Data inválida detectada, usando data atual');
    data = new Date().toISOString().split('T')[0];
    console.log('Data corrigida:', data);
  }
  
  try {
    console.log('Fazendo requisição para buscarSessoesRealizadasPorData...');
    // Codificar a URL corretamente
    const url = `/api/sessions/realizadas?data=${encodeURIComponent(data)}`;
    console.log('URL codificada:', url);
    const response = await api.get(url);
    console.log('Resposta da API:', response);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('=== ERRO AO BUSCAR SESSÕES REALIZADAS ===');
    console.error('Erro:', error);
    console.error('Mensagem:', error?.message);
    console.error('Status:', error?.status);
    console.error('Data:', error?.data);
    return [];
  }
};

export const buscarSessoesCanceladasPorData = async (data) => {
  console.log('=== BUSCANDO SESSÕES CANCELADAS ===');
  console.log('Data recebida:', data);
  console.log('Tipo da data:', typeof data);
  
  // Validar se a data é válida antes de fazer a requisição
  if (!data || data === 'undefined' || data === 'null' || isNaN(Date.parse(data))) {
    console.log('Data inválida detectada, usando data atual');
    data = new Date().toISOString().split('T')[0];
    console.log('Data corrigida:', data);
  }
  
  try {
    console.log('Fazendo requisição para buscarSessoesCanceladasPorData...');
    // Codificar a URL corretamente
    const url = `/api/sessions/canceladas?data=${encodeURIComponent(data)}`;
    console.log('URL codificada:', url);
    const response = await api.get(url);
    console.log('Resposta da API:', response);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('=== ERRO AO BUSCAR SESSÕES CANCELADAS ===');
    console.error('Erro:', error);
    console.error('Mensagem:', error?.message);
    console.error('Status:', error?.status);
    console.error('Data:', error?.data);
    return [];
  }
};

/**
 * Busca todas as sessões canceladas (sem filtro de data)
 * @returns {Promise<Array>} Lista de sessões canceladas
 */
export const buscarSessoesCanceladas = async () => {
  console.log('=== BUSCANDO TODAS SESSÕES CANCELADAS ===');
  try {
    const response = await api.get('/api/sessions/canceladas');
    console.log('Resposta da API:', response);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('=== ERRO AO BUSCAR SESSÕES CANCELADAS ===');
    console.error('Erro:', error?.message);
    return [];
  }
};

/**
 * Busca sessões canceladas de um cliente específico
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Array>} Lista de sessões canceladas do cliente
 */
export const buscarSessoesCanceladasCliente = async (clienteId) => {
  console.log('Buscando sessões canceladas do cliente:', clienteId);
  try {
    const response = await api.get(`/api/sessions/cliente/${clienteId}/canceladas`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Falha ao carregar sessões canceladas do cliente:', error?.message);
    return [];
  }
};
