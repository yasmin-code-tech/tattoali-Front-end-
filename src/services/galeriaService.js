import { api } from "../lib/api"; // instância configurada do Axios

export const galeriaService = {
  /**
   * Lista todas as fotos de um tatuador específico
  
   */
  async getAllPhotosByUser() {
    // O token já vai automático via interceptador do Axios
    const res = await api.get("/api/galeria");
    return res;
  },

  /**
   * Busca uma foto específica pelo ID
   * @param {number|string} id - ID da foto
   */
  async getPhotoById(id) {
    // GET /api/galeria/photo/:id
    return await api.get(`/api/galeria/photo/${id}`);
  },

  /**
   * Faz upload de uma nova foto (precisa de token)
   * @param {FormData} formData - Deve conter o campo 'image'
   * Nota: Não define Content-Type manualmente - o navegador define automaticamente com o boundary correto
   */
  async uploadPhoto(formData) {
    // POST /api/galeria
    // O FormData já define o Content-Type automaticamente (multipart/form-data com boundary)
    return await api.post("/api/galeria", formData);
  },

  /**
   * Deleta uma foto específica (precisa de token)
   * @param {number|string} id - ID da foto
   */
  async deletePhoto(id) {
    // DELETE /api/galeria/:id
    return await api.del(`/api/galeria/${id}`);
  },
};
