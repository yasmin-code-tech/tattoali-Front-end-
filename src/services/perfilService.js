const mockPerfil = {
  nome: "Alex Tattoo Artist",
  bio: "Tatuador Profissional há 8 anos",
  endereco: "Rua das Artes, 123 - Vila Madalena, São Paulo - SP",
  instagram: "@alex.tattoos",
  especialidades: ["Realismo", "Tribal", "Floral", "Blackwork", "Aquarela"],
  contatos: {
    whatsapp: "(11) 99999-9999",
    email: "alex@tattoali.com"
  },
  avatarUrl: null // ou a URL de uma imagem
};

export const buscarPerfilTatuador = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPerfil);
    }, 1000);
  });
};