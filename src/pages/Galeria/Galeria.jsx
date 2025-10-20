import { useEffect, useState } from "react";
import Layout from "../../baselayout/Layout";
import { Images, Camera, Plus } from "lucide-react";

import ModalFoto from "../../components/ModalFoto";
import ModalUploadFoto from "../../components/ModalUploadFoto";

// Importando imagens locais
import coringa from "../../assets/coringa.webp";
import floresRealistas from "../../assets/floresRealistas.jpg";
import rosa from "../../assets/rosa.webp";

export default function Galeria() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [fotoSelecionada, setFotoSelecionada] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [novaFoto, setNovaFoto] = useState({ file: null, descricao: "" });

  useEffect(() => {
    // Simulando carregamento de dados
    setTimeout(() => {
      try {
        const dadosFicticios = [
          { id: 1, url: coringa, descricao: "Tatuagem estilo Coringa" },
          { id: 2, url: floresRealistas, descricao: "Tatuagem de flores realistas" },
          { id: 3, url: rosa, descricao: "Tatuagem de rosa" },
        ];
        setPortfolio(dadosFicticios);
      } catch (error) {
        console.error(error);
        setErro("Falha ao carregar o portfólio. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  }, []);

  // Função de editar
  const handleEdit = (foto) => {
    alert(`Editar informações da foto ${foto.id}`);
  };

  // Função de deletar
  const handleDelete = (foto) => {
    const confirm = window.confirm("Tem certeza que deseja apagar?");
    if (confirm) {
      setPortfolio((prev) => prev.filter((item) => item.id !== foto.id));
      setFotoSelecionada(null);
    }
  };

  // Função de upload
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!novaFoto.file) return alert("Escolha uma imagem!");

    const previewUrl = URL.createObjectURL(novaFoto.file);
    const newItem = {
      id: Date.now(),
      url: previewUrl,
      descricao: novaFoto.descricao || "Nova tatuagem",
    };

    setPortfolio((prev) => [newItem, ...prev]);
    setNovaFoto({ file: null, descricao: "" });
    setShowUploadModal(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <p className="text-white">Carregando portfólio...</p>
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

              {/* Botão de adicionar foto */}
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-4 flex items-center gap-2 bg-red-500 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                <Plus className="w-4 h-4" /> Adicionar Foto
              </button>
            </div>

            {/* Grid de imagens */}
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="relative group rounded-xl overflow-hidden bg-gray-900 cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setFotoSelecionada(item)}
                  >
                    <img
                      src={item.url}
                      alt={item.descricao || "Tatuagem"}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                      <Camera className="text-white w-6 h-6 mb-2" />
                      <p className="text-white text-sm font-medium text-center px-2">
                        {item.descricao || "Tatuagem artística"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 mt-10">
                <Images className="w-10 h-10 mb-3 opacity-60" />
                <p>Nenhuma imagem adicionada ao portfólio ainda.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalhes da foto */}
        <ModalFoto
          foto={fotoSelecionada}
          onClose={() => setFotoSelecionada(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Modal de upload de foto */}
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
