import { api } from "../lib/api";

export async function generateImage({ prompt }) {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt é obrigatório");
  }
  // Backend real: POST /api/generate retorna { image: string }
  const response = await api.post("/api/generate", { prompt });
  const imageUrl = response?.image || response?.imageUrl || response?.data?.image;
  if (!imageUrl) {
    throw new Error("Resposta inválida do servidor: URL da imagem ausente");
  }
  return { imageUrl, message: response?.message };
}


