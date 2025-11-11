import React, { useState, useEffect } from "react";
import { FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function ModalFoto({ foto, onClose, onDelete, onUpdate }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (foto) {
      // O backend retorna apenas o filePath (ex: "galeria/imagem.jpg")
      // Construímos a URL completa usando a URL do bucket
      const BUCKET_PUB_URL = import.meta.env.VITE_BUCKET_PUB_URL || 'https://pub-a2e43516b1984deb95bc4adfd3070bed.r2.dev';
      const fullUrl = foto.url?.startsWith('http') ? foto.url : (foto.url ? `${BUCKET_PUB_URL}/${foto.url}` : '');
      setPreviewUrl(fullUrl || '');
      // Inicializa a descrição quando a foto muda
      setDescricao(foto.descricao || '');
      setEditMode(false);
    } else {
      setPreviewUrl('');
      setDescricao('');
      setEditMode(false);
    }
  }, [foto]);

  if (!foto) return null;

  const handleSaveDescription = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    try {
      const fotoId = foto.id || foto.photo_id || foto.photoId;
      if (!fotoId) {
        console.error('ID da foto não encontrado');
        return;
      }
      
      await onUpdate(fotoId, descricao);
      setEditMode(false);
    } catch (error) {
      console.error('Erro ao salvar descrição:', error);
      // O erro será tratado no componente pai
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setDescricao(foto.descricao || '');
    setEditMode(false);
  };

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
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700 flex flex-col scrollbar-red">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white text-2xl transition bg-gray-900/80 rounded-full p-2"
          >
            ✕
          </button>

          <div className="flex-1 flex items-center justify-center p-6">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={foto.descricao || "Foto do portfólio"}
                className="max-w-full max-h-[70vh] w-auto h-auto object-contain rounded-xl"
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', previewUrl);
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                }}
              />
            ) : (
              <div className="w-full h-96 bg-gray-800 rounded-xl flex items-center justify-center">
                <p className="text-gray-500">Carregando imagem...</p>
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 p-6">
            {/* Área de descrição - modo edição ou visualização */}
            {editMode ? (
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">
                  Descrição da foto
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Digite a descrição da foto..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isSaving}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="px-4 py-2 border border-gray-600 text-gray-300 hover:text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaTimes /> Cancelar
                  </button>
                  <button
                    onClick={handleSaveDescription}
                    disabled={isSaving}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <FaSave /> {isSaving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <p className="text-gray-300 text-sm text-center mb-2">
                  {foto.descricao || "Sem descrição disponível."}
                </p>
                {onUpdate && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setEditMode(true)}
                      className="text-gray-400 hover:text-white text-sm transition flex items-center gap-1"
                    >
                      <FaEdit className="w-3 h-3" /> Editar descrição
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // Chama a função onDelete que está em Galeria.jsx
                  // Ela abre o modal de confirmação
                  onDelete(foto);
                }}
                disabled={editMode || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaTrash /> Apagar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
