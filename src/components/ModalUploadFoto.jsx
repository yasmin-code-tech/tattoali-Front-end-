import { Download } from "lucide-react";

export default function ModalUploadFoto({ novaFoto, setNovaFoto, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-red-600 p-6 rounded-2xl w-96 shadow-2xl relative">
        <h3 className="text-red-600 text-xl font-bold mb-4 text-center">
          Adicionar nova foto
        </h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {/* Upload da imagem */}
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-800 p-4 rounded-lg cursor-pointer hover:border-red-500 transition">
            {novaFoto.file ? (
              <img
                src={URL.createObjectURL(novaFoto.file)}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400">
                <Download className="w-8 h-8 mb-2 text-red-600" />
                <span className="text-gray-400">Clique para fazer upload da foto</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNovaFoto({ ...novaFoto, file: e.target.files[0] });
                }
              }}
            />
          </label>

          {/* Descrição da foto */}
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
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-800 text-white shadow-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white shadow-md transition"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
