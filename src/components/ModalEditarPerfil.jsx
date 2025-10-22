import { useState, useEffect, useRef } from "react";
import { atualizarDadosPerfil, atualizarFotoPerfil, buscarTodosEstilos } from "../services/perfilService";
import { notifySuccess, notifyError } from "../services/notificationService"; 

const FALLBACK_STYLES = [
  "Realismo", "Tribal", "Floral", "Blackwork", "Aquarela", "Neotrad", "Old School", "Pontilhismo", "Geométrico", "Japonês", "Lettering", "Maori", "Biomecânico"
];

export default function ModalEditarPerfil({ isOpen, onClose, perfilAtual, onSuccess }) {
  const [formData, setFormData] = useState({});
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [allApiStyles, setAllApiStyles] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
        try {
            const stylesFromApi = await buscarTodosEstilos();
            setAllApiStyles(stylesFromApi);
        } catch (error) {
            console.error("Não foi possível carregar os estilos da API, usando fallback.", error);
            setAllApiStyles(FALLBACK_STYLES.map(s => ({ id: s, nome: s })));
        }
    };

    if (isOpen) {
      loadData(); 
      if (perfilAtual) {
        setFormData({
          nome: perfilAtual.nome || '',
          sobrenome: perfilAtual.sobrenome || '',
          bio: perfilAtual.bio || '',
          whatsapp: perfilAtual.whatsapp || '',
          email: perfilAtual.email || '',
          endereco: perfilAtual.endereco || '',
          instagram: perfilAtual.instagram || '',
        });
        setSelectedStyles(perfilAtual.Styles?.map(s => s.nome) || []);
        setImagePreview(perfilAtual.foto || null);
        setProfileImageFile(null);
        setSubmitError(null);
      }
    }
  }, [isOpen, perfilAtual]); 

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleToggleStyle = (styleName) => {
    setSelectedStyles(prev =>
      prev.includes(styleName) ? prev.filter(s => s !== styleName) : [...prev, styleName]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true); 
    setSubmitError(null); 

    try {
      const updatePromises = [];

      const estiloIds = selectedStyles.map(styleName => {
          const styleObj = allApiStyles.find(s => s.nome === styleName);
          return styleObj ? styleObj.id : null;
      }).filter(id => id !== null); 

      const payloadTexto = {
        ...formData,
        especialidades: estiloIds, 
      };

      updatePromises.push(atualizarDadosPerfil(payloadTexto));

      if (profileImageFile) {
        const formDataImg = new FormData();
        formDataImg.append('image', profileImageFile); 
        updatePromises.push(atualizarFotoPerfil(formDataImg));
      }

      await Promise.all(updatePromises);

      notifySuccess("Perfil atualizado com sucesso!"); 
      onSuccess(); 
      onClose();   

    } catch (error) {
      const errorMessage = error.message || "Erro ao salvar. Tente novamente.";
      notifyError(errorMessage); 
      setSubmitError(errorMessage); 
      console.error("Erro no handleSubmit:", error); 
    } finally {
      setIsSubmitting(false); 
    }
  };

  return (
    <div onClick={handleOverlayClick} className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
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
          <div className="text-center">
            <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-700">
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
                <input type="text" name="nome" value={formData.nome || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Sobrenome</label>
                <input type="text" name="sobrenome" value={formData.sobrenome || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Bio</label>
                <textarea name="bio" value={formData.bio || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg h-24 resize-none" placeholder="Conte um pouco sobre você..."></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Endereço do Estúdio</label>
                <input type="text" name="endereco" value={formData.endereco || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" placeholder="Rua, número, cidade..."/>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
                <input type="tel" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">E-mail</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Instagram</label>
                <input type="text" name="instagram" value={formData.instagram || ''} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg" placeholder="@seuinstagram"/>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">Estilos de Tatuagem</label>
            <div className="mb-4 p-4 border border-gray-700 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Clique para adicionar</h4>
                <div className="flex flex-wrap gap-2">
                    {allApiStyles.map((style) => (
                        !selectedStyles.includes(style.nome) && (
                            <button key={style.id} type="button" onClick={() => handleToggleStyle(style.nome)}
                                className="bg-gray-700 text-gray-300 hover:bg-gray-600 px-3 py-1 rounded-full text-sm transition-colors">
                                + {style.nome}
                            </button>
                        )
                    ))}
                </div>
            </div>

            <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">Selecionados</h4>
                <div className="flex flex-wrap min-h-[40px] p-2 border border-dashed border-gray-600 rounded-lg">
                    {selectedStyles.length > 0 ? selectedStyles.map((styleName) => (
                        <span key={styleName} className="specialty-tag">
                            {styleName}
                            <span className="remove-tag" onClick={() => handleToggleStyle(styleName)}>×</span>
                        </span>
                    )) : (
                        <p className="text-sm text-gray-500 p-2">Nenhum estilo selecionado.</p>
                    )}
                </div>
            </div>
          </div>

          {submitError && (
            <div className="text-center p-3 bg-red-900/50 text-red-300 rounded-lg text-sm">
              {submitError}
            </div>
          )}

          <div className="flex space-x-4 pt-4">
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
              onClick={handleSubmit}
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
              ) : ( "Salvar Alterações" )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}