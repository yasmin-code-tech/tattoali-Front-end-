import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const ModalEsqueciSenha = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Função para limpar o estado do modal
  const limparEstado = () => {
    setEmail('');
    setIsLoading(false);
    setMessage('');
    setIsSuccess(false);
  };

  // Limpar campos quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      limparEstado();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Por favor, digite seu e-mail.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await api.post('/api/user/recuperar-senha', { email });
      
      setIsSuccess(true);
      setMessage(response.message || 'Instruções para redefinir sua senha foram enviadas para o seu e-mail.');
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Erro ao enviar e-mail de recuperação. Tente novamente.';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    limparEstado();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-lg mx-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Recuperar Senha</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">E-mail</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail cadastrado"
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              required
              disabled={isLoading}
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              isSuccess 
                ? 'bg-green-900 text-green-300 border border-green-700' 
                : 'bg-red-900 text-red-300 border border-red-700'
            }`}>
              {message}
            </div>
          )}

          {/* Instructions */}
          <div className="text-gray-400 text-sm">
            <p>Digite o e-mail associado à sua conta e enviaremos instruções para redefinir sua senha.</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-60"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Instruções'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEsqueciSenha;
