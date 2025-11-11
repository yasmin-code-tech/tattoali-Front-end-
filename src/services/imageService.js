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
 * Rota: GET /api/galeria-ia
 * @returns {Promise<Array>} Lista de imagens geradas
 */
export async function getGeneratedImages() {
  try {
    // GET /api/galeria-ia - O token é enviado automaticamente no header Authorization
    const response = await api.get("/api/galeria-ia");
    // O backend deve retornar um array de objetos com: { image_id, imageUrl, prompt, createdAt, ... }
    return Array.isArray(response) ? response : response?.data || response?.images || [];
  } catch (error) {
    console.error("Erro ao buscar imagens geradas:", error);
    throw new Error("Falha ao carregar imagens geradas");
  }
}

/**
 * Busca uma imagem gerada específica pelo ID
 * Rota: GET /api/galeria-ia/:id
 * @param {number|string} id - ID da imagem
 * @returns {Promise<Object>} Dados da imagem
 */
export async function getGeneratedImageById(id) {
  try {
    const response = await api.get(`/api/galeria-ia/${id}`);
    return response?.data || response;
  } catch (error) {
    console.error("Erro ao buscar imagem gerada:", error);
    throw new Error("Falha ao carregar imagem gerada");
  }
}

/**
 * Deleta uma imagem gerada específica
 * Rota: DELETE /api/galeria-ia/:id
 * @param {number|string} id - ID da imagem a ser deletada
 * @returns {Promise<Object>} Confirmação da exclusão
 */
export async function deleteGeneratedImage(id) {
  try {
    const response = await api.del(`/api/galeria-ia/${id}`);
    return response;
  } catch (error) {
    console.error("Erro ao deletar imagem gerada:", error);
    throw new Error("Falha ao deletar imagem gerada");
  }
}


