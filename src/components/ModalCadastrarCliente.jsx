import React, { useState } from 'react';

const ModalCadastrarCliente = ({ isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [contato, setContato] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    const novoCliente = { nome, contato, endereco, observacoes };
    if (onSave) onSave(novoCliente);
    onClose();
    setNome('');
    setContato('');
    setEndereco('');
    setObservacoes('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-lg mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cadastrar Novo Cliente</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
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
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações adicionais"
              rows="3"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            Cadastrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCadastrarCliente;
