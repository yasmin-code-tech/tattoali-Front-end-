import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { galeriaService } from "../services/galeriaService"; 

export default function ModalFoto({ foto, onClose, onDelete }) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (foto) {
      // O backend retorna apenas o filePath (ex: "galeria/imagem.jpg")
      // Construímos a URL completa usando a URL do bucket
      const BUCKET_PUB_URL = import.meta.env.VITE_BUCKET_PUB_URL || 'https://pub-a2e43516b1984deb95bc4adfd3070bed.r2.dev';
      const fullUrl = foto.url?.startsWith('http') ? foto.url : `${BUCKET_PUB_URL}/${foto.url}`;
      setPreviewUrl(fullUrl);
    }
  }, [foto]);

  if (!foto) return null;

  const handleDeletarFoto = async () => {
    try {
      await galeriaService.deletePhoto(foto.id);
      onDelete(foto);
      setConfirmandoExclusao(false);
      onClose();
    } catch (error) {
      console.error("Erro ao deletar foto:", error);
      alert("Falha ao apagar a foto. Tente novamente.");
    }
  };

  return (
    <>
      {/* Modal principal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-6 w-11/12 md:w-1/2 max-w-lg border border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-xl transition"
          >
            ✕
          </button>

          <img
            src={previewUrl}
            alt={foto.descricao || "Foto do portfólio"}
            className="w-full h-60 object-cover rounded-xl mb-4"
            onError={(e) => {
              console.error('Erro ao carregar imagem:', previewUrl);
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
            }}
          />

          <p className="text-gray-300 text-sm mb-6 text-center">
            {foto.descricao || "Sem descrição disponível."}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setConfirmandoExclusao(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
            >
              <FaTrash /> Apagar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmandoExclusao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 text-center shadow-2xl">
            <p className="text-gray-200 mb-6 font-medium">
              Tem certeza que deseja apagar esta foto?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDeletarFoto}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
              >
                Continuar
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl shadow-md transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
