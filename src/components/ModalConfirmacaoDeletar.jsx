import React from "react";

export default function ModalConfirmacao({ 
  mensagem = "Tem certeza?", 
  onConfirm, 
  onCancel 
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 text-center shadow-2xl">
        <p className="text-gray-200 mb-6 font-medium">{mensagem}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md transition"
          >
            Continuar
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl shadow-md transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
