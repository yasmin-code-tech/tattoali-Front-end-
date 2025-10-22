import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaUpload } from "react-icons/fa";

export default function ModalFoto({ foto, onClose, onEdit, onDelete }) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [descricaoEditada, setDescricaoEditada] = useState("");
  const [novaFoto, setNovaFoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Atualiza a descrição e preview ao abrir o modal
  useEffect(() => {
    if (foto) {
      setDescricaoEditada(foto.descricao || "");
      setPreviewUrl(foto.url);
      setEditMode(false);
      setNovaFoto(null);
    }
  }, [foto]);

  if (!foto) return null;

  // Lida com o upload da nova imagem
  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNovaFoto(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview imediato
    }
  };

  // Salva as alterações (imagem + descrição)
  const handleSalvarEdicao = () => {
    const fotoAtualizada = { ...foto, descricao: descricaoEditada };

    // Se uma nova foto foi selecionada, adiciona ao objeto
    if (novaFoto) {
      fotoAtualizada.novaFoto = novaFoto; // opcional — depende da forma que será enviado depois
      fotoAtualizada.url = previewUrl; // atualiza o preview localmente
    }

    onEdit(fotoAtualizada);
    setEditMode(false);
  };

  return (
    <>
      {/* Fundo do modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="relative bg-gray-900 rounded-2xl shadow-2xl p-6 w-11/12 md:w-1/2 max-w-lg border border-gray-700">
          {/* Botão de fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-xl transition"
          >
            ✕
          </button>

          {/* Imagem */}
          <img
            src={previewUrl}
            alt={descricaoEditada || "Foto do portfólio"}
            className="w-full h-60 object-cover rounded-xl mb-4"
          />

          {/* Input de imagem (aparece apenas no modo edição) */}
          {editMode && (
            <div className="flex flex-col items-center mb-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer bg-gray-800 text-gray-200 px-3 py-2 rounded-xl hover:bg-gray-700 transition">
                <FaUpload />
                Alterar Foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImagemChange}
                />
              </label>
            </div>
          )}

          {/* Descrição ou input de edição */}
          {editMode ? (
            <input
              type="text"
              value={descricaoEditada}
              onChange={(e) => setDescricaoEditada(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 transition"
              placeholder="Digite a descrição da foto"
            />
          ) : (
            <p className="text-gray-300 text-sm mb-6 text-center">
              {foto.descricao || "Sem descrição disponível."}
            </p>
          )}

          {/* Botões de ação */}
          <div className="flex justify-center gap-4">
            {editMode ? (
              <button
                onClick={handleSalvarEdicao}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-md transition"
              >
                <FaSave />
                Salvar
              </button>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl shadow-md transition"
              >
                <FaEdit />
                Editar
              </button>
            )}

            <button
              onClick={() => setConfirmandoExclusao(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
            >
              <FaTrash />
              Apagar
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
                onClick={() => {
                  onDelete(foto);
                  setConfirmandoExclusao(false);
                }}
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
