import { useState, useEffect } from "react";
import Layout from '../../baselayout/Layout';
import { buscarPerfilTatuador } from '../../services/perfilService';

import ModalEditarPerfil from "../../components/ModalEditarPerfil";
import ModalAlterarSenha from "../../components/ModalAlterarSenha";

// SVGs como componentes para organização
const UserIcon = () => (
  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
  </svg>
);
const EmailIcon = () => (
    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Função para carregar ou recarregar os dados do perfil
  const carregarPerfil = async () => {
    try {
      setLoading(true);
      const dados = await buscarPerfilTatuador();
      setPerfil(dados);
    } catch (error) {     setErro("Falha ao carregar o perfil. Tente novamente mais tarde.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPerfil();
  }, []);

  // Função chamada pelo modal de edição quando o perfil é salvo com sucesso
  const handleProfileUpdateSuccess = () => {
    carregarPerfil(); // Recarrega os dados para exibir as informações atualizadas
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-white">Carregando perfil...</p>
        </div>
      </Layout>
    );
  }

  if (erro) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{erro}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div id="perfil-screen" className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Perfil do Tatuador</h1>
            <p className="text-gray-400">Suas informações profissionais</p>
          </div>

          <div className="card p-8 rounded-2xl max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-32 h-32 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserIcon />
              </div>
              <div className="text-center mb-2">
                {/* TAG PREMIUM REMOVIDA DAQUI */}
                <h2 className="text-2xl font-bold text-white">{perfil.nome}</h2>
              </div>
              <p className="text-gray-400">{perfil.bio}</p>
            </div>

            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <button onClick={() => setIsEditModalOpen(true)} className="btn-primary px-6 py-2 rounded-lg font-medium cursor-pointer">
                Editar Perfil
              </button>
              <button onClick={() => setIsPasswordModalOpen(true)} className="border border-gray-600 text-gray-300 hover:text-white px-6 py-2 rounded-lg transition-colors font-medium cursor-pointer">
                Alterar Senha
              </button>
            </div>

            <div className="mb-8">
              <h3 className="red-title text-lg font-semibold mb-4">Especialidades</h3>
              <div className="flex flex-wrap gap-3">
                {perfil.especialidades.map((especialidade) => (
                  <span key={especialidade} className="bg-red-600 text-white px-4 py-2 rounded-full text-sm">
                    {especialidade}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="red-title text-lg font-semibold mb-4">Contato</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-4 p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <WhatsAppIcon />
                  </div>
                  <div>
                    <p className="text-white font-medium">WhatsApp</p>
                    <p className="text-gray-400">{perfil.contatos.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <EmailIcon />
                  </div>
                  <div>
                    <p className="text-white font-medium">E-mail</p>
                    <p className="text-gray-400">{perfil.contatos.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModalEditarPerfil
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        perfilAtual={perfil}
        onSuccess={handleProfileUpdateSuccess}
      />
      <ModalAlterarSenha
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </Layout>
  );
}