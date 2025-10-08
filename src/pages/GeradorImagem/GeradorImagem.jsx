import React, { useState } from "react";
import Layout from "../../baselayout/Layout";
import { Image as ImageIcon } from "lucide-react";

export default function GeradorImagemChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);

  const handleEnviarPrompt = () => {
    if (!prompt.trim()) return;

    // Adiciona mensagem do usuário
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    // Placeholder de geração de imagem
    const placeholderUrl = `https://placehold.co/600x600?text=${encodeURIComponent(
      prompt || "Imagem+Gerada"
    )}`;

    // Resposta do sistema
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: "Aqui está a imagem gerada. Está ok ou quer refazer?",
          image: placeholderUrl,
        },
      ]);
    }, 500);

    setPrompt("");
  };

  const handleRefazer = (msgIndex) => {
    // Remove a mensagem do sistema com a imagem e deixa o usuário enviar novamente
    setMessages((prev) => prev.filter((_, i) => i !== msgIndex));
  };

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto flex flex-col h-[90vh]">
        <h1 className="text-3xl font-bold text-white mb-6">Gerador de Imagem por IA</h1>

        {/* Área de chat */}
        <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 px-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`p-4 rounded-xl max-w-[70%] break-words shadow-md ${
                  msg.role === "user"
                    ? "bg-red-600 text-white self-end"
                    : "bg-[#111111] text-white border border-gray-700 self-start"
                }`}
              >
                <p className="text-sm">{msg.content}</p>

                {msg.image && (
                  <div className="mt-3">
                    <img
                      src={msg.image}
                      alt="Imagem gerada"
                      className="w-full h-auto rounded-lg border border-gray-700"
                    />
                    <div className="flex justify-end mt-2 gap-2">
                      <button
                        onClick={() => handleRefazer(index)}
                        className="px-4 py-2 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-sm font-medium transition"
                      >
                        Refazer
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2">
          <textarea
            rows={2}
            placeholder="Digite o prompt da imagem..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1 bg-[#111111] text-white placeholder-gray-500 border border-gray-700 rounded-xl p-4 resize-none focus:outline-none focus:border-red-600"
          />
          <button
            onClick={handleEnviarPrompt}
            disabled={!prompt.trim()}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition ${
              prompt.trim()
                ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            Enviar
          </button>
        </div>
      </div>
    </Layout>
  );
}
