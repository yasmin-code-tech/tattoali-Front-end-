import { api } from '../lib/api'; 

/**
 * ROTA: GET /api/perfil
 * Busca os dados do perfil do tatuador autenticado.
 */
export async function buscarPerfilTatuador() {
  try {
    const perfil = await api.get('/api/perfil');
    return perfil;
  } catch (error) {
    console.error("Erro em buscarPerfilTatuador:", error);
    throw error;
  }
}

/**
 * Avaliações recebidas pelo tatuador (média no front a partir da lista).
 * ROTA: GET /api/tatuador/:user_id/reviews
 */
export async function buscarReviewsDoTatuador(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id) || id < 1) {
    throw new Error("user_id inválido");
  }
  return api.get(`/api/tatuador/${id}/reviews`);
}

/**
 * ROTA: GET /api/style
 * Busca todos os estilos de tatuagem disponíveis.
 */
/**
 * ROTA: GET /api/bairro
 * Lista bairros (cadastro pode chamar sem token).
 */
export async function buscarBairros() {
  try {
    return await api.get("/api/bairro");
  } catch (error) {
    console.error("Erro em buscarBairros:", error);
    throw error;
  }
}

export async function buscarTodosEstilos() {
  try {
    const estilos = await api.get('/api/style');
    return estilos;
  } catch (error) {
    console.error("Erro em buscarTodosEstilos:", error);
    throw error;
  }
}

/**
 * ROTA: PUT /api/perfil
 * Atualiza os dados de TEXTO do perfil do tatuador.
 * @param {object} perfilData - Objeto JSON com os dados (nome, bio, estilos, etc).
 */
export async function atualizarDadosPerfil(perfilData) {
  try {
    // ✅ MÉTODO PUT para /api/perfil
    const perfilAtualizado = await api.put('/api/perfil', perfilData);
    return perfilAtualizado;
  } catch (error) {
    console.error("Erro em atualizarDadosPerfil:", error);
    throw error;
  }
}

/**
 * ROTA: POST /api/image/perfil
 * Faz o upload de uma nova foto de perfil.
 * @param {FormData} imagemFormData - Objeto FormData contendo o arquivo da imagem.
 */
export async function atualizarFotoPerfil(imagemFormData) {
  try {
    const resposta = await api.post('/api/image/perfil', imagemFormData);
    return resposta;
  } catch (error) {
    console.error("Erro em atualizarFotoPerfil:", error);
    throw error;
  }
}

/**
 * ROTA: DELETE /api/perfil
 * Deleta o perfil do tatuador autenticado.
 */
export async function deletarPerfilTatuador() {
  try {
    const resultado = await api.del('/api/perfil');
    return resultado;
  } catch (error) {
    console.error("Erro em deletarPerfilTatuador:", error);
    throw error;
  }
}