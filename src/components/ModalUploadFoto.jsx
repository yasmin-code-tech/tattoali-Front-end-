import { Download, X } from "lucide-react";
import { galeriaService } from "../services/galeriaService"; // <-- ajustado para galeriaService
import { useState, useEffect } from "react";

export default function ModalUploadFoto({ novaFoto, setNovaFoto, onClose, onSubmit }) {
  const [enviando, setEnviando] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Atualiza preview da imagem
  useEffect(() => {
    if (!novaFoto.file) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(novaFoto.file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl); // limpa memória
  }, [novaFoto.file]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNovaFoto((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novaFoto.file) {
      alert("Selecione uma imagem antes de enviar!");
      return;
    }

    try {
      setEnviando(true);

      // Cria FormData para enviar imagem + descrição
      const formData = new FormData();
      formData.append("image", novaFoto.file);
      if (novaFoto.descricao) {
        formData.append("descricao", novaFoto.descricao);
      }

      // Chamada real ao backend via galeriaService
      const fotoCriada = await galeriaService.uploadPhoto(formData);

      // Atualiza estado do componente pai
      onSubmit(fotoCriada);

      // Limpa campos e fecha modal
      setNovaFoto({ file: null, descricao: "" });
      onClose();
    } catch (error) {
      console.error("Erro ao enviar a foto:", error);
      alert("Falha ao enviar a foto. Verifique sua conexão e tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative bg-gray-900 border border-red-600 p-6 rounded-2xl w-96 shadow-2xl">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-red-600 text-xl font-bold mb-4 text-center">
          Adicionar nova foto
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Upload da imagem */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 p-4 rounded-xl cursor-pointer hover:border-red-500 transition">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Download className="w-8 h-8 mb-2 text-red-600" />
                <span className="text-gray-400">Clique para selecionar uma imagem</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          {/* Campo de descrição */}
          <input
            type="text"
            placeholder="Descrição (opcional)"
            value={novaFoto.descricao}
            onChange={(e) =>
              setNovaFoto((prev) => ({ ...prev, descricao: e.target.value }))
            }
            className="px-3 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />

          {/* Botões */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={enviando}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white shadow-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className={`px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-md transition ${
                enviando ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {enviando ? "Enviando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
