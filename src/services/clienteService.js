import { api } from "../lib/api";
import { cpfDigitos } from "../utils/cpf";

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

    const rawFone = dadosCliente.telefone || dadosCliente.contato || '';
    const telefoneDigitos = String(rawFone).replace(/\D/g, '');

    const dadosBackend = {
      nome: (dadosCliente.nome || '').trim(),
      telefone: telefoneDigitos,
      cpf: cpfDigitos(dadosCliente.cpf),
      descricao: dadosCliente.descricao || dadosCliente.observacoes || '',
      endereco: dadosCliente.endereco || '',
    };

    console.log('Dados para o backend:', dadosBackend);

    const response = await api.post('/api/client', dadosBackend);
    console.log('Cliente criado com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    const msg =
      error?.data?.error ||
      error?.message ||
      'Falha ao cadastrar cliente';
    throw new Error(msg);
  }
};

/**
 * Atualiza um cliente existente
 * @param {Object} clienteAtualizado - Dados do cliente
 * @param {number} clienteAtualizado.id - ID do cliente
 * @param {string} clienteAtualizado.nome
 * @param {string} clienteAtualizado.contato
 * @param {string} clienteAtualizado.endereco
 * @param {string} clienteAtualizado.descricao
 * @param {string} clienteAtualizado.observacoes
 * @returns {Promise<Object>} Cliente atualizado
 */
export const atualizarCliente = async (clienteAtualizado) => {
  try {
    const fone = String(clienteAtualizado.contato ?? clienteAtualizado.telefone ?? '').replace(/\D/g, '');
    const dadosBackend = {
      nome: clienteAtualizado.nome,
      telefone: fone,
      descricao: clienteAtualizado.observacoes || '',
      endereco: clienteAtualizado.endereco || '',
    };
    if (clienteAtualizado.cpf != null && String(clienteAtualizado.cpf).replace(/\D/g, '').length > 0) {
      dadosBackend.cpf = cpfDigitos(clienteAtualizado.cpf);
    }

    const response = await api.put(`/api/client/${clienteAtualizado.id}`, dadosBackend);
    console.log('Cliente atualizado com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    const msg =
      error?.data?.error || error?.message || 'Falha ao atualizar cliente';
    throw new Error(msg);
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
    console.log('Clientes retornados:', response);

    // Mapear client_id para id e campos para compatibilidade com o frontend
    const clientesMapeados = Array.isArray(response) 
      ? response.map(cliente => ({
          ...cliente,
          id: cliente.client_id, // Mapear client_id para id
          contato: cliente.telefone, // Mapear telefone para contato
          observacoes: cliente.descricao // Mapear descricao para observacoes
        }))
      : [];

    console.log('Clientes mapeados:', clientesMapeados);
    return clientesMapeados;
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
    console.log('Cliente encontrado:', response);

    // Mapear client_id para id e campos para compatibilidade com o frontend
    const clienteMapeado = {
      ...response,
      id: response.client_id, // Mapear client_id para id
      contato: response.telefone, // Mapear telefone para contato
      observacoes: response.descricao // Mapear descricao para observacoes
    };

    return clienteMapeado;
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    throw new Error('Falha ao carregar dados do cliente');
  }
};
/**
 * Deleta um cliente
 * @param {number} clienteId - ID do cliente a ser deletado
 * @returns {Promise<Object>} Confirmação da exclusão
 */
export const deletarCliente = async (clienteId) => {
  try {
    console.log('Deletando cliente:', clienteId);

    const response = await api.del(`/api/client/${clienteId}`);
    console.log('Cliente deletado com sucesso:', response);
    return response;
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    
    // Trata erros específicos do backend
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Falha ao deletar cliente');
  }
};