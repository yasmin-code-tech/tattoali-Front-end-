import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";

export default function AlterarSenha() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [senhas, setSenhas] = useState({
    nova: '',
    confirmar: ''
  });
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  // Captura o token da URL ao montar o componente
  useEffect(() => {
    // Tenta capturar diferentes formatos de token que o Supabase pode enviar
    const token = 
      searchParams.get('access-token') || 
      searchParams.get('access_token') || 
      searchParams.get('accessToken') ||
      searchParams.get('token');
    
    // Se não encontrou nos query params, tenta no hash (Supabase às vezes usa hash)
    let hashToken = null;
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      hashToken = 
        hashParams.get('access-token') || 
        hashParams.get('access_token') || 
        hashParams.get('accessToken') ||
        hashParams.get('token');
    }
    
    const finalToken = token || hashToken;
    
    if (!finalToken) {
      setMessage('Token de recuperação inválido ou ausente.');
      setIsSuccess(false);
    } else {
      setAccessToken(finalToken);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    setSenhas(prev => ({ ...prev, [e.target.name]: e.target.value }));
    // Limpa mensagem de erro ao digitar
    if (message && !isSuccess) {
      setMessage('');
    }
  };

  const getConfirmarInputClass = () => {
    if (senhas.confirmar.length === 0) {
      return "input-field"; // Classe padrão
    }
    return senhas.nova === senhas.confirmar
      ? "input-field border-green-500" // Senhas coincidem
      : "input-field border-red-500"; // Senhas não coincidem
  };

  const validatePassword = (password) => {
    // Mínimo 6 caracteres
    if (password.length < 6) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accessToken) {
      setMessage('Token de recuperação inválido ou ausente.');
      setIsSuccess(false);
      return;
    }

    // Validações
    if (!senhas.nova || !senhas.confirmar) {
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
      // Envia o token e a nova senha para o backend
      const response = await api.post('/api/user/alterar-senha', {
        'token': accessToken,
        'novaSenha': senhas.nova
      });

      setIsSuccess(true);
      setMessage(response.message || 'Senha alterada com sucesso! Redirecionando para o login...');
      
      // Redireciona para o login após 2 segundos
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (error) {
      const errorMessage = error?.data?.message || error?.message || 'Erro ao alterar senha. Tente novamente.';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-black">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Redefinir Senha</h2>
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

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {!accessToken ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">Token de recuperação inválido ou ausente.</p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn-primary px-6 py-2 rounded-lg font-medium"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nova Senha</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"} 
                    name="nova"
                    value={senhas.nova}
                    onChange={handleChange}
                    className="input-field w-full px-4 py-3 pr-12 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600"
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
                    className={`${getConfirmarInputClass()} w-full px-4 py-3 pr-12 rounded-lg bg-gray-900 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-600`}
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
                  onClick={() => navigate('/login')}
                  className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium"
                  disabled={isLoading || isSuccess}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? 'Alterando...' : isSuccess ? 'Sucesso!' : 'Redefinir Senha'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

