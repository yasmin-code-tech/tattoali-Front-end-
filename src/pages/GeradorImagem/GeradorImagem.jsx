import React, { useState, useEffect, useRef } from "react";
import Layout from "../../baselayout/Layout";
import { Image as ImageIcon } from "lucide-react";
import { generateImage } from "../../services/imageService";

export default function GeradorImagemChat() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleEnviarPrompt = async () => {
    if (!prompt.trim()) return;

    const userText = prompt;

    // Adiciona mensagem do usuário e placeholder de carregamento no chat
    const placeholderId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userText },
      { role: "system", content: "Gerando imagem...", loading: true, id: placeholderId },
    ]);
    setPrompt("");

    try {
      setLoading(true);
      const { imageUrl } = await generateImage({ prompt: userText });
      // Substitui o placeholder pela imagem final
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                role: "system",
                content: "Aqui está a imagem gerada. Está ok ou quer refazer?",
                image: imageUrl,
              }
            : m
        )
      );
    } catch (err) {
      // Substitui o placeholder por mensagem de erro
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? { role: "system", content: err?.message || "Falha ao gerar imagem. Tente novamente." }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefazer = (msgIndex) => {
    // Mantém a imagem e preenche o input com o último prompt do usuário anterior a esta mensagem
    const priorMessages = messages.slice(0, msgIndex).reverse();
    const lastUser = priorMessages.find((m) => m.role === "user");
    if (lastUser?.content) {
      setPrompt(lastUser.content);
      // foca o input para facilitar a edição
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  // Auto-scroll ao final quando mensagens mudarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Layout>
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
      <div className="p-6 max-w-4xl mx-auto flex flex-col h-[90vh] bg-gray-900/50 rounded-2xl border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-6">Gerador de Imagem por IA</h1>

        

        {/* Área de chat */}
        <div className="flex-1 overflow-y-auto mb-4 flex flex-col gap-4 px-2 ">
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

                {msg.loading && (
                  <div className="mt-3">
                    <div className="w-full h-[50px] rounded-lg border border-gray-700 bg-gray-800/40 flex items-center justify-center">
                      <svg className="w-8 h-8 animate-spin text-red-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                    </div>
                  </div>
                )}

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
                        onClick={async () => {
                          try {
                            const response = await fetch(msg.image);
                            if (!response.ok) throw new Error("Falha ao baixar a imagem");
                            const blob = await response.blob();
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            // tenta extrair nome do arquivo da URL
                            const fallback = `imagem-${Date.now()}.png`;
                            const fromUrl = (() => {
                              try {
                                const u = new URL(msg.image);
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
                            alert(e?.message || "Não foi possível iniciar o download.");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de mensagem */}
        <div className="flex gap-2">
          <textarea
            rows={2}
            placeholder="Digite o prompt da imagem..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            ref={inputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleEnviarPrompt();
              }
            }}
            className="flex-1 bg-[#111111] text-white placeholder-gray-500 border border-gray-700 rounded-xl p-4 resize-none focus:outline-none focus:border-red-600"
          />
          <button
            onClick={handleEnviarPrompt}
            disabled={!prompt.trim() || loading}
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
      {/* overlay global removido; usamos balão de loading dentro do chat */}
    </Layout>
  );
}
