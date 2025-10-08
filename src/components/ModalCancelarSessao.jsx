import React, { useState, useEffect } from 'react';

export default function ModalCancelarSessao({ isOpen, onClose, onConfirm, sessao }) {
  const [motivo, setMotivo] = useState('');

  // Função para limpar o estado do modal
  const limparEstado = () => {
    setMotivo('');
  };

  // Limpar motivo quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      limparEstado();
    }
  }, [isOpen]);

  if (!isOpen || !sessao) return null;

  const handleConfirm = () => {
    onConfirm(sessao, motivo);
    limparEstado(); // Limpar motivo após confirmar
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-45">
      <div className="bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Cancelar sessão</h2>
          <button onClick={() => {
            limparEstado(); // Limpar motivo antes de fechar
            onClose();
          }} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-gray-300 text-sm">Informe um motivo para o cancelamento:</p>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
            rows={4}
            placeholder="Ex.: Cliente desmarcou, indisponibilidade, etc."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              limparEstado(); // Limpar motivo antes de fechar
              onClose();
            }}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-2 rounded-lg transition-colors font-medium"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!motivo.trim()}
            className={`flex-1 py-2 rounded-lg font-medium ${motivo.trim() ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
          >
            Confirmar Cancelamento
          </button>
        </div>
      </div>
    </div>
  );
}


