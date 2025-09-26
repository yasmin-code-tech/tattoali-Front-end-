import { api } from "../lib/api";


/**
 * Marca uma sessão como realizada
 * @param {string} sessaoId - ID da sessão
 * @returns {Promise<Object>} Sessão atualizada
 */
export const marcarSessaoRealizada = async (sessaoId) => {
  console.log('Marcando sessão como realizada:', sessaoId);
  try {
    const response = await api.put(`/api/sessions/realizar/${sessaoId}`, { realizado: true });
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
    const response = await api.put(`/api/sessions/realizar/${sessaoId}`, { realizado: false });
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
  console.log('Buscando sessões realizadas do cliente:', clienteId);
  try {
    const response = await api.get(`/api/sessions/cliente/${clienteId}/realizadas`);
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('Falha ao carregar sessões realizadas do cliente:', error?.message);
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


// Função para buscar sessões pendentes por data
export const buscarSessoesPendentesPorData = async (data) => {
  console.log('=== BUSCANDO SESSÕES PENDENTES ===');
  console.log('Data recebida:', data);
  console.log('Tipo da data:', typeof data);
  console.log('URL que será chamada:', `/api/sessions/pendentes?data=${data}`);
  
  // Validar se a data é válida antes de fazer a requisição
  if (!data || data === 'undefined' || data === 'null' || isNaN(Date.parse(data))) {
    console.log('Data inválida detectada, usando data atual');
    data = new Date().toISOString().split('T')[0];
    console.log('Data corrigida:', data);
  }
  
  try {
    console.log('Fazendo requisição para buscarSessoesPendentesPorData...');
    // Codificar a URL corretamente
    const url = `/api/sessions/pendentes?data=${encodeURIComponent(data)}`;
    console.log('URL codificada:', url);
    const response = await api.get(url);
    console.log('Resposta da API:', response);
    console.log('Tipo da resposta:', typeof response);
    console.log('É array?', Array.isArray(response));
    return Array.isArray(response) ? response : [];
  } catch (error) {
    console.error('=== ERRO AO BUSCAR SESSÕES PENDENTES ===');
    console.error('Erro:', error);
    console.error('Mensagem:', error?.message);
    console.error('Status:', error?.status);
    console.error('Data:', error?.data);
    console.error('Stack:', error?.stack);
    return [];
  }
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
  console.log('Data parseada:', Date.parse(data));
  console.log('É válida?', !isNaN(Date.parse(data)));
  console.log('URL que será chamada:', `/api/sessions/canceladas?data=${data}`);
  
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
