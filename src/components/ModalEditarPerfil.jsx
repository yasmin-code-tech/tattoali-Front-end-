import { useState, useEffect, useRef } from "react";

// Lista de estilos disponíveis (pode ser movida para um arquivo de configuração)
const ALL_STYLES = [
  "Realismo", "Tribal", "Floral", "Blackwork", "Aquarela", 
  "Neotrad", "Old School", "Pontilhismo", "Geométrico", "Japonês", 
  "Lettering", "Maori", "Biomecânico"
];

export default function ModalEditarPerfil({ isOpen, onClose, perfilAtual, onSuccess }) {
  // Estado geral para campos de texto
  const [formData, setFormData] = useState({});
  
  // Estado para os estilos selecionados pelo usuário
  const [selectedStyles, setSelectedStyles] = useState([]);

  // Estados para o upload de imagem
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);

  // Efeito para carregar os dados do perfil no formulário quando o modal abre
  useEffect(() => {
    if (isOpen && perfilAtual) {
      setFormData({
        nome: perfilAtual.nome || '',
        bio: perfilAtual.bio || '',
        whatsapp: perfilAtual.contatos?.whatsapp || '',
        email: perfilAtual.contatos?.email || '',
        endereco: perfilAtual.endereco || '',
        instagram: perfilAtual.instagram || '',
      });
      // Carrega os estilos que já estavam salvos no perfil
      setSelectedStyles(perfilAtual.especialidades || []);
      // Reseta a prévia da imagem ao abrir, mostrando a imagem atual se existir
      setImagePreview(perfilAtual.avatarUrl || null); 
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); // Armazena o arquivo para upload
      setImagePreview(URL.createObjectURL(file)); // Cria uma URL local para a prévia
    }
  };

  // Função para adicionar ou remover um estilo da lista de selecionados
  const handleToggleStyle = (style) => {
    if (selectedStyles.includes(style)) {
      // Se o estilo já está selecionado, remove
      setSelectedStyles(selectedStyles.filter(s => s !== style));
    } else {
      // Se não está, adiciona
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      especialidades: selectedStyles, // Salva a lista de estilos atualizada
      novaFoto: profileImageFile,
    };
    console.log("Salvando perfil:", finalData);
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
        
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Seção de Upload de Avatar */}
          <div className="text-center">
            <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-800 flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img src={imagePreview} alt="Prévia do perfil" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-16 h-16 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="file-upload" onClick={() => fileInputRef.current.click()}>
              <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-400 text-sm">Clique para fazer upload da foto</p>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>
          </div>
          
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
              <div>
                <label className="block text-sm font-medium text-white mb-2">Endereço do Estúdio</label>
                <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" placeholder="Rua, número, cidade..."/>
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
              <div>
                <label className="block text-sm font-medium text-white mb-2">Instagram</label>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" placeholder="@seuinstagram"/>
              </div>
            </div>
          </div>
          
          {/* Seção de Estilos de Tatuagem */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Estilos de Tatuagem</label>
            {/* Estilos Disponíveis */}
            <div className="mb-4 p-4 border border-gray-700 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Clique para adicionar</h4>
                <div className="flex flex-wrap gap-2">
                    {ALL_STYLES.map((style) => (
                        !selectedStyles.includes(style) && (
                            <button
                                key={style}
                                type="button"
                                onClick={() => handleToggleStyle(style)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1 rounded-full text-sm transition-colors"
                            >
                                + {style}
                            </button>
                        )
                    ))}
                </div>
            </div>
            
            {/* Estilos Selecionados */}
            <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Selecionados</h4>
                <div className="flex flex-wrap min-h-[40px] p-2 border border-dashed border-gray-600 rounded-lg">
                    {selectedStyles.length > 0 ? selectedStyles.map((style) => (
                        <span key={style} className="specialty-tag">
                            {style}
                            <span 
                                className="remove-tag" 
                                onClick={() => handleToggleStyle(style)}
                            >
                                ×
                            </span>
                        </span>
                    )) : (
                        <p className="text-sm text-gray-500 p-2">Nenhum estilo selecionado.</p>
                    )}
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