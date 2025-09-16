const mockPerfil = {
  nome: "Alex Tattoo Artist",
  bio: "Tatuador Profissional há 8 anos",
  plano: "Premium",
  especialidades: ["Realismo", "Tribal", "Floral", "Blackwork", "Aquarela"],
  contatos: {
    whatsapp: "(11) 99999-9999",
    telefone: "(11) 3333-4444",
    email: "alex@tattooali.com"
  },
  avatarUrl: "https://exemplo.com/avatar.jpg" // URL da imagem de perfil
};

/**
 * Busca os dados do perfil do tatuador.
 * @returns {Promise<object>} Os dados do perfil.
 */
export const buscarPerfilTatuador = () => {
  return new Promise((resolve) => {
    // Simula um delay de rede de 1 segundo
    setTimeout(() => {
      resolve(mockPerfil);
    }, 1000);
  });
};