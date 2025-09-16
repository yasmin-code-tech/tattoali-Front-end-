import { useState, useEffect } from "react";

export default function ModalEditarPerfil({ isOpen, onClose, perfilAtual, onSuccess }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (perfilAtual) {
      setFormData({
        nome: perfilAtual.nome || '',
        bio: perfilAtual.bio || '',
        whatsapp: perfilAtual.contatos?.whatsapp || '',
        email: perfilAtual.contatos?.email || '',
      });
    }
  }, [isOpen, perfilAtual]);

  if (!isOpen) {
    return null;
  }
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    console.log("Salvando perfil:", formData);
    alert("Perfil salvo com sucesso! (Simulação)");
    onSuccess();
    onClose();
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="card p-8 rounded-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Editar Perfil do Tatuador</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Nome</label>
                <input type="text" name="nome" value={formData.nome} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg h-24 resize-none" placeholder="Conte um pouco sobre você..."></textarea>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-mail</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer">
              Cancelar
            </button>
            <button type="button" onClick={handleSubmit} className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer">
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}