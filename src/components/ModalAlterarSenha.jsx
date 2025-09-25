import { useState } from "react";

export default function ModalAlterarSenha({ isOpen, onClose }) {
  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  });
  const [showPass, setShowPass] = useState(false);

  if (!isOpen) {
    return null;
  }
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e) => {
    setSenhas(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (senhas.nova !== senhas.confirmar) {
      alert("A nova senha e a confirmação não coincidem!");
      return;
    }
    alert("Senha alterada com sucesso! (Simulação)");
    onClose();
  };

  const getConfirmarInputClass = () => {
    if (senhas.confirmar.length === 0) {
      return "input-field"; // Classe padrão
    }
    return senhas.nova === senhas.confirmar
      ? "input-field border-green-500" // Senhas coincidem
      : "input-field border-red-500"; // Senhas não coincidem
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="card p-8 rounded-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Alterar Senha</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
            <label className="block text-sm font-medium text-white mb-2">Confirmar Nova Senha</label>
            <div className="relative">
              <input 
                type={showPass ? "text" : "password"}
                name="confirmar"
                value={senhas.confirmar}
                onChange={handleChange}
                className={`${getConfirmarInputClass()} w-full px-4 py-3 pr-12 rounded-lg`}
                placeholder="Confirme a nova senha"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer">
              Cancelar
            </button>
            <button type="button" onClick={handleSubmit} className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}