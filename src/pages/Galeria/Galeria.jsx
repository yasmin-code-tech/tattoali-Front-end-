import { useEffect, useState } from "react";
import Layout from "../../baselayout/Layout";
import { Images, Camera, Plus } from "lucide-react";
import ModalFoto from "../../components/ModalFoto";
import ModalUploadFoto from "../../components/ModalUploadFoto";
import ModalConfirmarExclusaoFoto from "../../components/ModalConfirmarExclusaoFoto";
import { galeriaService } from "../../services/galeriaService";
import { notifySuccess, notifyError } from "../../services/notificationService";

export default function Galeria() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [novaFoto, setNovaFoto] = useState({ file: null, descricao: "" });
  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [fotoParaExcluir, setFotoParaExcluir] = useState(null);

  

 
  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const photos = await galeriaService.getAllPhotosByUser();
      // A API retorna o array diretamente, não um objeto com 'data'
      const photosArray = Array.isArray(photos) ? photos : [];
      console.log('📸 Fotos recebidas do backend:', photosArray);
      
      // O backend retorna apenas o filePath (ex: "galeria/imagem.jpg")
      // Construímos a URL completa usando a URL do bucket
      const BUCKET_PUB_URL = import.meta.env.VITE_BUCKET_PUB_URL || 'https://pub-a2e43516b1984deb95bc4adfd3070bed.r2.dev';
      const photosWithFullUrl = photosArray.map(photo => {
        console.log('📸 Foto individual:', photo);
        return {
          ...photo,
          url: photo.url?.startsWith('http') ? photo.url : `${BUCKET_PUB_URL}/${photo.url}`
        };
      });
      setPortfolio(photosWithFullUrl);
    } catch (error) {
      console.error(error);
      setErro("Falha ao carregar o portfólio do servidor.");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchPortfolio();
  }, []);

  // Abre o modal de confirmação de exclusão
  const handleAbrirModalExclusao = (foto) => {
    setFotoParaExcluir(foto);
    setModalExclusaoOpen(true);
  };

  // Atualizar descrição da foto
  const handleUpdateDescription = async (fotoId, novaDescricao) => {
    try {
      await galeriaService.updatePhotoDescription(fotoId, novaDescricao);
      notifySuccess('Descrição atualizada com sucesso!');
      // Atualiza a foto na lista local
      setPortfolio((prev) => prev.map((item) => {
        const itemId = item.id || item.photo_id || item.photoId;
        if (itemId === fotoId) {
          return { ...item, descricao: novaDescricao };
        }
        return item;
      }));
      // Atualiza a foto selecionada se for a mesma
      if (fotoSelecionada) {
        const fotoIdSelecionada = fotoSelecionada.id || fotoSelecionada.photo_id || fotoSelecionada.photoId;
        if (fotoIdSelecionada === fotoId) {
          setFotoSelecionada({ ...fotoSelecionada, descricao: novaDescricao });
        }
      }
      // Recarrega a galeria para garantir sincronização
      await fetchPortfolio();
    } catch (error) {
      console.error('❌ Erro ao atualizar descrição:', error);
      const errorMessage = error?.data?.mensagem || error?.data?.message || error?.message || "Erro ao atualizar descrição. Tente novamente.";
      notifyError(errorMessage);
      throw error;
    }
  };

  // Deletar foto (chamado pelo modal de confirmação)
  const handleConfirmarExclusao = async (foto) => {
    // O backend pode retornar 'id' ou outro campo
    const fotoId = foto.id || foto.photo_id || foto.photoId;
    console.log('🗑️ Galeria - Deletando foto:', { foto, fotoId });
    
    if (!fotoId) {
      console.error('ID da foto não encontrado:', foto);
      notifyError("Erro: ID da foto não encontrado.");
      throw new Error("ID da foto não encontrado");
    }

    try {
      await galeriaService.deletePhoto(fotoId);
      // Fecha o modal primeiro para evitar que a imagem tente carregar
      setFotoSelecionada(null);
      // Remove a foto da lista local
      setPortfolio((prev) => prev.filter((item) => {
        const itemId = item.id || item.photo_id || item.photoId;
        return itemId !== fotoId;
      }));
      // Recarrega a galeria para garantir sincronização
      await fetchPortfolio();
      notifySuccess('Foto excluída com sucesso!');
      // Fecha o modal de confirmação
      setModalExclusaoOpen(false);
      setFotoParaExcluir(null);
    } catch (error) {
      console.error('❌ Erro ao deletar foto:', error);
      const errorMessage = error?.data?.mensagem || error?.data?.message || error?.message || "Erro ao deletar foto. Tente novamente.";
      notifyError(errorMessage);
      throw error; // Re-lança o erro para o modal não fechar
    }
  };

  // Upload de nova foto
  const handleUploadSubmit = async (fotoData) => {
    if (!fotoData || !fotoData.file) {
      notifyError("Selecione uma imagem antes de enviar!");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", fotoData.file);
      if (fotoData.descricao) {
        formData.append("descricao", fotoData.descricao);
      }

      // Debug: verifica se o arquivo está no FormData
      console.log('📤 Enviando foto:', {
        fileName: fotoData.file.name,
        fileSize: fotoData.file.size,
        fileType: fotoData.file.type,
        hasDescricao: !!fotoData.descricao
      });

      await galeriaService.uploadPhoto(formData);
      
      // Recarrega a galeria para mostrar a nova foto
      await fetchPortfolio();
      
      // Notifica sucesso
      notifySuccess('Foto adicionada com sucesso!');
      
      // Fecha o modal e limpa o estado
      setShowUploadModal(false);
      setNovaFoto({ file: null, descricao: "" });
    } catch (error) {
      console.error('❌ Erro ao enviar foto:', error);
      const errorMessage = error?.data?.mensagem || error?.data?.message || error?.message || "Erro ao enviar foto. Tente novamente.";
      notifyError(errorMessage);
      // Re-lança o erro para o modal não fechar
      throw error;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mb-4"></div>
          <p className="text-white text-lg font-medium">Carregando portfólio...</p>
          <p className="text-gray-400 text-sm mt-2">Aguarde um momento</p>
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
      <div id="galeria-screen" className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="card p-8 rounded-2xl">
            {/* Cabeçalho */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                  <Images className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Portfólio do Tatuador
              </h2>
              <p className="text-gray-400">Explore as tatuagens já realizadas</p>

              <button
                onClick={() => setShowUploadModal(true)}
                disabled={loading}
                className="mt-4 flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Adicionar Foto
              </button>
            </div>

            {/* Indicador de carregamento durante recarregamento */}
            {loading && portfolio.length > 0 && (
              <div className="flex flex-col items-center justify-center py-8 mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-3"></div>
                <p className="text-gray-400 text-sm">Atualizando portfólio...</p>
              </div>
            )}

            {/* Grid de imagens */}
            {!loading && portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {portfolio.map((item) => {
                  const itemId = item.id || item.photo_id || item.photoId || `photo-${Math.random()}`;
                  return (
                  <div
                    key={itemId}
                    className="relative group rounded-xl overflow-hidden bg-gray-900 cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setFotoSelecionada(item)}
                  >
                    <img
                      src={item.url}
                      alt={item.descricao || "Tatuagem"}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', item.url);
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagem não encontrada%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                      <Camera className="text-white w-6 h-6 mb-2" />
                      <p className="text-white text-sm font-medium text-center px-2">
                        {item.descricao || "Tatuagem artística"}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : !loading ? (
              <div className="flex flex-col items-center justify-center text-gray-400 mt-10">
                <Images className="w-10 h-10 mb-3 opacity-60" />
                <p>Nenhuma imagem adicionada ao portfólio ainda.</p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal de detalhes */}
        <ModalFoto
          foto={fotoSelecionada}
          onClose={() => setFotoSelecionada(null)}
          onDelete={handleAbrirModalExclusao}
          onUpdate={handleUpdateDescription}
        />

        {/* Modal de confirmação de exclusão */}
        <ModalConfirmarExclusaoFoto
          isOpen={modalExclusaoOpen}
          onClose={() => {
            setModalExclusaoOpen(false);
            setFotoParaExcluir(null);
          }}
          onConfirm={handleConfirmarExclusao}
          foto={fotoParaExcluir}
        />

        {/* Modal de upload */}
        {showUploadModal && (
          <ModalUploadFoto
            novaFoto={novaFoto}
            setNovaFoto={setNovaFoto}
            onClose={() => {
              setShowUploadModal(false);
              setNovaFoto({ file: null, descricao: "" });
            }}
            onSubmit={handleUploadSubmit}
          />
        )}
      </div>
    </Layout>
  );
}
