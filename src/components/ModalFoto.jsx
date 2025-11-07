import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";

export default function ModalFoto({ foto, onClose, onDelete }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (foto) {
      // O backend retorna apenas o filePath (ex: "galeria/imagem.jpg")
      // Construímos a URL completa usando a URL do bucket
      const BUCKET_PUB_URL = import.meta.env.VITE_BUCKET_PUB_URL || 'https://pub-a2e43516b1984deb95bc4adfd3070bed.r2.dev';
      const fullUrl = foto.url?.startsWith('http') ? foto.url : (foto.url ? `${BUCKET_PUB_URL}/${foto.url}` : '');
      setPreviewUrl(fullUrl || '');
    } else {
      setPreviewUrl('');
    }
  }, [foto]);

  if (!foto) return null;

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700 flex flex-col">
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
            <p className="text-gray-300 text-sm mb-4 text-center">
              {foto.descricao || "Sem descrição disponível."}
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  // Chama a função onDelete que está em Galeria.jsx
                  // Ela abre o modal de confirmação
                  onDelete(foto);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
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
