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

/**
 * Busca todas as imagens geradas pelo usuário autenticado
 * O token do usuário é enviado automaticamente via header Authorization pelo api.js
 * O backend extrai o ID do usuário do token e retorna apenas as imagens daquele usuário
 * @returns {Promise<Array>} Lista de imagens geradas
 */
export async function getGeneratedImages() {
  try {
    // GET /api/generate/images - O token é enviado automaticamente no header Authorization
    const response = await api.get("/api/generate/images");
    // O backend deve retornar um array de objetos com: { id, imageUrl, prompt, createdAt, ... }
    return Array.isArray(response) ? response : response?.data || response?.images || [];
  } catch (error) {
    console.error("Erro ao buscar imagens geradas:", error);
    throw new Error("Falha ao carregar imagens geradas");
  }
}


