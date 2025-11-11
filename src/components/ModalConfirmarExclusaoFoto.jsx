import React, { useState, useEffect } from 'react';

export default function ModalConfirmarExclusaoFoto({ isOpen, onClose, onConfirm, foto }) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reseta o estado de loading quando o modal abre ou fecha
    if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen, foto]);

  if (!isOpen || !foto) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      handleClose();
    }
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(foto);
      // Se chegou aqui, a exclusão foi bem-sucedida e o modal será fechado pelo componente pai
      // O loading será resetado quando o modal fechar (via useEffect)
    } catch (error) {
      // O erro será tratado na função onConfirm
      // Não fechamos o modal aqui para que o usuário possa ver a mensagem de erro
      console.error('Erro ao excluir foto:', error);
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reseta o loading antes de fechar
    setIsLoading(false);
    onClose();
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
      style={{ zIndex: 9999 }}
    >
      <div 
        className="bg-[#111111] border border-gray-800 rounded-2xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Confirmar Exclusão</h2>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-600/20 rounded-full p-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          
          <p className="text-gray-300 text-center mb-2">
            Tem certeza que deseja excluir esta foto?
          </p>
          {foto.descricao && (
            <p className="text-white font-semibold text-center mb-4">
              "{foto.descricao}"
            </p>
          )}
          <p className="text-red-400 text-sm text-center">
            Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
          </button>
        </div>
      </div>
    </div>
  );
}

