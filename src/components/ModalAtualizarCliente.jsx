import React, { useState, useEffect } from 'react';
import { notifySuccess, notifyError, notifyWarn } from "../services/notificationService";
import { atualizarCliente } from "../services/clienteService";

const ModalAtualizarCliente = ({ isOpen, onClose, onSuccess, cliente }) => {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setNome(cliente.nome || '');
      setContato(cliente.contato || cliente.telefone || '');
      setEndereco(cliente.endereco || '');
      setObservacoes(cliente.observacoes || cliente.descricao || '');
    }
  }, [cliente, isOpen]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    try {
      setLoading(true);

      if (!nome.trim()) {
        notifyWarn("O nome do cliente é obrigatório!");
        setLoading(false);
        return;
      }

      if (!contato.trim()) {
        notifyWarn("O contato do cliente é obrigatório!");
        setLoading(false);
        return;
      }

      const clienteAtualizado = { 
        id: cliente.id || cliente.client_id,
        nome,
        contato,
        endereco,
        observacoes,
        descricao: observacoes 
      };

      await atualizarCliente(clienteAtualizado);
      
      notifySuccess(`Cliente ${nome} atualizado com sucesso!`);
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(clienteAtualizado);
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      notifyError("Erro ao atualizar cliente. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-lg mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Atualizar Cliente</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Nome do Cliente</label>
            <input 
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do cliente"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Contato</label>
            <input 
              type="text"
              value={contato}
              onChange={(e) => setContato(e.target.value)}
              placeholder="Digite o telefone do cliente"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Endereço</label>
            <input 
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              placeholder="Digite o endereço completo"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações adicionais"
              rows="4"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium"
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleUpdate}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              'Salvar Alterações'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAtualizarCliente;