import React from 'react';

export default function ModalConfirmarSessaoRealizada({ isOpen, onClose, onConfirm, sessao }) {
  if (!isOpen || !sessao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-45">
      <div className="bg-black border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Marcar como realizada</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-gray-300 text-sm">Confirma marcar a sessão abaixo como realizada?</p>
          <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
            <p className="text-white text-sm font-medium">{sessao.clienteNome}</p>
            <p className="text-gray-400 text-sm">{sessao.descricao || 'Sessão'}</p>
            <div className="text-gray-500 text-xs mt-1">{sessao.horario} • {sessao.duracaoMin}min</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-2 rounded-lg transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(sessao)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}


