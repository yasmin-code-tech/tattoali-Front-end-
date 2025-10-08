import { api } from "../lib/api";

/**
 * Cria um novo cliente
 * @param {Object} dadosCliente - Dados do cliente
 * @param {string} dadosCliente.nome - Nome do cliente
 * @param {string} dadosCliente.telefone - Telefone do cliente
 * @param {string} dadosCliente.descricao - Descrição/observações do cliente
 * @returns {Promise<Object>} Cliente criado
 */
export const criarCliente = async (dadosCliente) => {
  try {
    console.log('Criando novo cliente:', dadosCliente);
    
    // Mapear dados do frontend para o formato do backend
    const dadosBackend = {
      nome: dadosCliente.nome,
      telefone: dadosCliente.telefone || dadosCliente.contato,
      descricao: dadosCliente.descricao || dadosCliente.observacoes,
      endereco: dadosCliente.endereco || ''
    };
    
    console.log('Dados do frontend:', dadosCliente);
    console.log('Dados para o backend:', dadosBackend);
    
    const response = await api.post('/api/client', dadosBackend);
    console.log('Cliente criado com sucesso:', response);
    console.log('Tipo da resposta:', typeof response);
    return response;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    throw new Error('Falha ao cadastrar cliente');
  }
};

/**
 * Busca todos os clientes
 * @returns {Promise<Array>} Lista de clientes
 */
export const buscarClientes = async () => {
  try {
    console.log('Buscando clientes...');
    
    const response = await api.get('/api/client');
    console.log('Resposta da API de clientes:', response);
    console.log('Tipo da resposta:', typeof response);
    console.log('É array?', Array.isArray(response));
    
    // A resposta já é o array de clientes, não precisa de .data
    const clientes = response;
    console.log('Clientes finais:', clientes);
    
    // Garantir que sempre retornamos um array
    return Array.isArray(clientes) ? clientes : [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    throw new Error('Falha ao carregar clientes');
  }
};

/**
 * Busca um cliente por ID
 * @param {string} clienteId - ID do cliente
 * @returns {Promise<Object>} Dados do cliente
 */
export const buscarClientePorId = async (clienteId) => {
  try {
    console.log('Buscando cliente por ID:', clienteId);
    
    const response = await api.get(`/api/client/${clienteId}`);
    console.log('Cliente encontrado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw new Error('Falha ao carregar dados do cliente');
  }
};


