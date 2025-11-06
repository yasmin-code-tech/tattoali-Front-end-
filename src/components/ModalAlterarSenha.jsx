import { useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../auth/useAuth";

export default function ModalAlterarSenha({ isOpen, onClose }) {
  const { token } = useAuth();
  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const limparEstado = () => {
    setSenhas({
      atual: '',
      nova: '',
      confirmar: ''
    });
    setIsLoading(false);
    setMessage('');
    setIsSuccess(false);
  };

  const handleClose = () => {
    limparEstado();
    onClose();
  };

  const handleChange = (e) => {
    setSenhas(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpa mensagem de erro ao digitar
    if (message && !isSuccess) {
      setMessage('');
    }
  };

  const validatePassword = (password) => {
    // Mínimo 6 caracteres
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    return "";
  };

  const getConfirmarInputClass = () => {
    if (senhas.confirmar.length === 0) {
      return "input-field"; // Classe padrão
    }
    return senhas.nova === senhas.confirmar
      ? "input-field border-green-500" // Senhas coincidem
      : "input-field border-red-500"; // Senhas não coincidem
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validações
    if (!senhas.atual || !senhas.nova || !senhas.confirmar) {
      setMessage('Por favor, preencha todos os campos.');
      setIsSuccess(false);
      return;
    }

    const passwordError = validatePassword(senhas.nova);
    if (passwordError) {
      setMessage(passwordError);
      setIsSuccess(false);
      return;
    }

    if (senhas.nova !== senhas.confirmar) {
      setMessage('A nova senha e a confirmação não coincidem.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Envia o token do Supabase (obtido no login) no body da requisição
      // O backend usa supabase.auth.getUser(token) para validar e obter o userId
      // O token no header (via api.js) também é enviado automaticamente para autenticação da rota
      if (!token) {
        setMessage('Você precisa estar autenticado para alterar a senha.');
        setIsSuccess(false);
        setIsLoading(false);
        return;
      }

      const response = await api.post('/api/user/alterar-senha', {
        token: token, // Token do Supabase (mesmo tipo usado na recuperação de senha)
        novaSenha: senhas.nova
      });

      setIsSuccess(true);
      setMessage(response.message || 'Senha alterada com sucesso!');
      
      // Fecha o modal após 2 segundos
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error?.data?.message || error?.data?.error || error?.message || 'Erro ao alterar senha. Tente novamente.';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="card p-8 rounded-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Alterar Senha</h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-white cursor-pointer"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isSuccess 
              ? 'bg-green-900 text-green-300 border border-green-700' 
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            {message}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Senha Atual</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"} 
                name="atual"
                value={senhas.atual}
                onChange={handleChange}
                className="input-field w-full px-4 py-3 pr-12 rounded-lg"
                placeholder="Digite sua senha atual"
                disabled={isLoading || isSuccess}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading || isSuccess}
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nova Senha</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                name="nova"
                value={senhas.nova}
                onChange={handleChange}
                className="input-field w-full px-4 py-3 pr-12 rounded-lg"
                placeholder="Digite a nova senha"
                disabled={isLoading || isSuccess}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading || isSuccess}
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {senhas.nova && validatePassword(senhas.nova) && (
              <p className="text-red-500 text-xs mt-1">{validatePassword(senhas.nova)}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                name="confirmar"
                value={senhas.confirmar}
                onChange={handleChange}
                className={`${getConfirmarInputClass()} w-full px-4 py-3 pr-12 rounded-lg`}
                placeholder="Confirme a nova senha"
                disabled={isLoading || isSuccess}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isLoading || isSuccess}
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* FEEDBACK VISUAL em tempo real */}
            {senhas.confirmar.length > 0 && (
              senhas.nova === senhas.confirmar ? (
                <p className="text-green-500 text-xs mt-1">As senhas coincidem!</p>
              ) : (
                <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
              )
            )}
          </div>

          <div className="flex space-x-4 pt-4">
            <button 
              type="button" 
              onClick={handleClose}
              className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer"
              disabled={isLoading || isSuccess}
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={isLoading || isSuccess}
            >
              {isLoading ? 'Alterando...' : isSuccess ? 'Sucesso!' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}