import React, { useState } from "react";
import Layout from "../../baselayout/Layout";
import { Image as ImageIcon } from "lucide-react";

export default function GeradorImagem() {
  const [prompt, setPrompt] = useState("");
  const [imagemGerada, setImagemGerada] = useState(null);

  const handleGerarImagem = () => {
    // Placeholder temporário até integração com backend
    const placeholderUrl = `https://placehold.co/600x600?text=${encodeURIComponent(
      prompt || "Imagem+Gerada"
    )}`;
    setImagemGerada(placeholderUrl);
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Gerador de Imagem por IA</h1>
          <p className="text-gray-400">Digite um prompt e visualize a imagem gerada automaticamente</p>
        </div>

        {/* Campo de Prompt - #112 */}
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-gray-300 font-medium mb-2">
            Descreva a imagem que deseja gerar:
          </label>
          <textarea
            id="prompt"
            rows={5}
            placeholder="Ex: Um samurai cibernético lutando em uma cidade futurista ao pôr do sol..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-[#111111] text-white placeholder-gray-500 border border-gray-700 focus:border-red-600 rounded-xl p-4 resize-none focus:outline-none transition"
          />
        </div>

        {/* Botão Gerar - #113 */}
        <div className="flex justify-end mb-10">
          <button
            onClick={handleGerarImagem}
            disabled={!prompt.trim()}
            className={`px-8 py-4 rounded-xl font-semibold transition ${
              prompt.trim()
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Gerar Imagem
          </button>
        </div>

        {/* Área de exibição da imagem - #114 */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon className="text-red-500 w-6 h-6" /> Resultado
          </h2>

          {!imagemGerada ? (
            <p className="text-gray-500 text-sm">
              Nenhuma imagem gerada ainda. Digite um prompt acima e clique em "Gerar Imagem".
            </p>
          ) : (
            <div className="bg-[#111111] border border-gray-800 hover:border-red-600 transition rounded-xl overflow-hidden w-full max-w-[600px] mx-auto">
              <img
                src={imagemGerada}
                alt="Imagem gerada"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
