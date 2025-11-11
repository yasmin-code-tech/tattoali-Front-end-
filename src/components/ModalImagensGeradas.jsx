import React, { useState, useEffect } from 'react';
import { getGeneratedImages, deleteGeneratedImage } from '../services/imageService';
import { notifyError, notifySuccess } from '../services/notificationService';

export default function ModalImagensGeradas({ isOpen, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const carregarImagens = async () => {
    setLoading(true);
    try {
      const imagensData = await getGeneratedImages();
      console.log('📸 Imagens recebidas do backend:', imagensData);
      const imagensArray = Array.isArray(imagensData) ? imagensData : [];
      console.log('📸 Array processado:', imagensArray);
      setImages(imagensArray);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      notifyError('Erro ao carregar imagens geradas. Tente novamente.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl, prompt) => {
    try {
      // Mesma lógica usada na tela de GeradorImagem
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Falha ao baixar a imagem");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // Tenta extrair nome do arquivo da URL
      const fallback = `imagem-${Date.now()}.png`;
      const fromUrl = (() => {
        try {
          const u = new URL(imageUrl);
          const last = u.pathname.split("/").pop();
          return last || fallback;
        } catch { return fallback; }
      })();
      link.download = fromUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      notifyError(e?.message || "Não foi possível iniciar o download.");
    }
  };

  const handleDelete = async (imageId, e) => {
    e.stopPropagation();
    
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    try {
      await deleteGeneratedImage(imageId);
      setImages(prev => prev.filter(img => (img.image_id || img.id) !== imageId));
      if (selectedImage && (selectedImage.imageId || selectedImage.image_id || selectedImage.id) === imageId) {
        setSelectedImage(null);
      }
      notifySuccess('Imagem excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      notifyError('Erro ao excluir imagem. Tente novamente.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarImagens();
    } else {
      setImages([]);
      setSelectedImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        .scrollbar-red::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-red::-webkit-scrollbar-track {
          background: #1f1f1f;
          border-radius: 4px;
        }
        .scrollbar-red::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 4px;
        }
        .scrollbar-red::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
      `}</style>
      <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#111111] border border-gray-800 rounded-2xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Imagens Geradas</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-300">Carregando imagens...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-400 text-lg">Nenhuma imagem gerada ainda</p>
              <p className="text-gray-500 text-sm mt-2">Gere imagens para vê-las aqui</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-red">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((item, index) => {
                // Backend retorna { image_id, url, ... }
                const imageUrl = item.url || item.imageUrl || item.image;
                const prompt = item.prompt || item.description || null;
                const createdAt = item.createdAt || item.created_at || item.date;
                const imageId = item.image_id || item.id;
                
                console.log(`🖼️ Imagem ${index}:`, { imageUrl, imageId, item });
                
                if (!imageUrl) {
                  console.warn(`⚠️ Imagem ${index} sem URL:`, item);
                }
                
                return (
                  <div
                    key={imageId || index}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-red-600 transition-colors"
                  >
                    <div 
                      className="relative aspect-square cursor-pointer overflow-hidden bg-gray-900"
                      onClick={() => setSelectedImage({ imageUrl, prompt, createdAt, imageId })}
                    >
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={prompt || 'Imagem gerada'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('❌ Erro ao carregar imagem:', imageUrl);
                              e.target.style.display = 'none';
                              const errorDiv = e.target.nextElementSibling;
                              if (errorDiv) {
                                errorDiv.style.display = 'flex';
                              }
                            }}
                            onLoad={() => {
                              console.log('✅ Imagem carregada com sucesso:', imageUrl);
                            }}
                          />
                          <div className="hidden absolute inset-0 bg-gray-900 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">Erro ao carregar imagem</p>
                          </div>
                          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-30 transition-opacity flex items-center justify-center pointer-events-none">
                            <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <p className="text-gray-500 text-sm">URL não disponível</p>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      
                      {createdAt && (
                        <p className="text-gray-400 text-xs mb-2">
                          {formatDate(createdAt)}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(imageUrl, prompt || 'imagem-gerada');
                          }}
                          className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                        >
                          Download
                        </button>
                        <button
                          onClick={(e) => handleDelete(imageId, e)}
                          className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition"
                          title="Excluir imagem"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de visualização ampliada */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111111] border border-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Imagem Gerada</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.prompt || 'Imagem gerada'}
              className="w-full h-auto rounded-lg border border-gray-700 mb-4"
            />
            
            {selectedImage.createdAt && (
              <p className="text-gray-400 text-sm mb-4">
                <span className="font-semibold">Data:</span> {formatDate(selectedImage.createdAt)}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.prompt)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Download
              </button>
              {selectedImage.imageId && (
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('Tem certeza que deseja excluir esta imagem?')) {
                      try {
                        await deleteGeneratedImage(selectedImage.imageId);
                        setImages(prev => prev.filter(img => (img.image_id || img.id) !== selectedImage.imageId));
                        setSelectedImage(null);
                        notifySuccess('Imagem excluída com sucesso!');
                      } catch (error) {
                        console.error('Erro ao deletar imagem:', error);
                        notifyError('Erro ao excluir imagem. Tente novamente.');
                      }
                    }
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                >
                  Excluir
                </button>
              )}
              <button
                onClick={() => setSelectedImage(null)}
                className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}

