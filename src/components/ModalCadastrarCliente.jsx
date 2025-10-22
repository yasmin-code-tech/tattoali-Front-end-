import React, { useState, useEffect } from 'react';
// ✅ 1. Importe notifySuccess, notifyError E notifyWarn
import { notifySuccess, notifyError, notifyWarn } from "../services/notificationService"; // Ajuste o caminho se necessário

const ModalCadastrarCliente = ({ isOpen, onClose, onSave }) => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState(''); // Mudado de 'contato' para 'telefone' para consistência
  const [endereco, setEndereco] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Limpa o formulário quando o modal é fechado ou aberto
  useEffect(() => {
    if (isOpen) {
      setNome('');
      setTelefone('');
      setEndereco('');
      setObservacoes('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    // ✅ 2. VALIDAÇÃO ATUALIZADA com notifyWarn
    if (!nome.trim() || !telefone.trim()) {
      // alert("Por favor, preencha todos os campos obrigatórios (Nome e Contato)."); // <-- REMOVIDO
      notifyWarn("Por favor, preencha todos os campos obrigatórios (Nome e Contato)."); // <-- ADICIONADO
      return;
    }

    setIsSubmitting(true);

    try {
      const novoCliente = { nome, telefone, endereco, observacoes };
      
      if (onSave) {
        await onSave(novoCliente); // Chama a função onSave (que deve ser uma Promise)
      }
      
      notifySuccess("Cliente cadastrado com sucesso!"); // Notificação de sucesso
      onClose(); // Fecha o modal

    } catch (error) {
      notifyError(error.message || "Falha ao cadastrar o cliente."); // Notificação de erro
      console.error("Erro ao cadastrar cliente:", error);
    } finally {
      setIsSubmitting(false); // Finaliza o estado de carregamento
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-lg mx-4">
        
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cadastrar Novo Cliente</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nome do Cliente</label>
            <input 
              type="text" 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Nome completo do cliente"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Contato (Telefone/WhatsApp)</label>
            <input 
              type="text" 
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="(XX) 9XXXX-XXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Endereço (Opcional)</label>
            <input 
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o endereço completo" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Observações (Opcional)</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações adicionais"
              rows="3"
              className="input-field w-full px-4 py-3 rounded-lg resize-none" 
            />
          </div>
        </div>
        <div className="flex space-x-4 pt-8">
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={isSubmitting}
            className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : ( "Cadastrar" )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCadastrarCliente;