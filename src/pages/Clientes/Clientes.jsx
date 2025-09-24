import React, { useState } from "react";
import Layout from '../../baselayout/Layout';
import { Plus } from "lucide-react";

import ModalAtualizarCliente from "../../components/ModalAtualizarCliente";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";
import ModalDetalhesCliente from "../../components/ModalDetalhesCliente";

const ClienteCard = ({ id, nome, telefone, descricao, valor, onAtualizar, onVerDetalhes }) => (
  <div className="bg-[#111111] border border-gray-700 hover:border-red-600 transition rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-white">{nome}</h3>
      <span className="text-red-500 font-bold text-lg">{valor}</span>
    </div>
    <p className="text-gray-400 text-sm mb-2">{telefone}</p>
    <p className="text-gray-300 mb-4">{descricao}</p>

    <div className="flex gap-2">
      <button
        onClick={() => onAtualizar({ id, nome, telefone, descricao, valor })}
        className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Atualizar Cliente
      </button>

      <button
        onClick={() => onVerDetalhes({ id, nome, telefone, descricao, valor })}
        className="bg-red-600 hover:bg-red-700 text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Ver Detalhes
      </button>
    </div>
  </div>
);

export default function Clientes() {
  const clientesMock = [
    { id: 1, nome: "Maria Clara Santos", telefone: "(11) 98765-4321", descricao: "Tatuagem floral no braço direito", valor: "R$ 450" },
    { id: 2, nome: "João Silva", telefone: "(11) 99876-5432", descricao: "Tatuagem tribal nas costas", valor: "R$ 680" },
    { id: 3, nome: "Ana Santos", telefone: "(11) 97654-3210", descricao: "Retoque em tatuagem antiga", valor: "R$ 280" },
    { id: 4, nome: "Carlos Mendes", telefone: "(11) 96543-2109", descricao: "Tatuagem realista no antebraço", valor: "R$ 520" },
  ];

  const [clientes, setClientes] = useState(clientesMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // estados dos modais
  const [modalAtualizarOpen, setModalAtualizarOpen] = useState(false);
  const [modalCadastrarOpen, setModalCadastrarOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Função para remover acentos
  const removerAcentos = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const handleBuscarClientes = async () => {
    setLoading(true);
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    // aqui você pode chamar a API real. Por enquanto re-carrego o mock
    setClientes(clientesMock);
    setLoading(false);
  };

  const filteredClientes = clientes.filter(cliente =>
    removerAcentos(cliente.nome.toLowerCase()).includes(
      removerAcentos(searchTerm.toLowerCase())
    )
  );

  const handleAbrirModalAtualizar = (cliente) => {
    setClienteSelecionado(cliente);
    setModalAtualizarOpen(true);
  };

  const handleAbrirModalDetalhes = (cliente) => {
    setClienteSelecionado(cliente);
    setModalDetalhesOpen(true);
  };

  const handleAbrirModalCadastrar = () => {
    setModalCadastrarOpen(true);
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
            <p className="text-gray-400">Gerencie informações dos seus clientes</p>
          </div>

          {/* Área de busca + botões */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Pesquisar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 text-white placeholder-gray-500 focus:outline-none flex-1"
              />
              <button
                onClick={handleBuscarClientes}
                disabled={loading}
                className={`ml-2 px-4 py-2 rounded-lg font-medium text-white transition ${
                  loading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            <button
              onClick={handleAbrirModalCadastrar}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> Adicionar Cliente
            </button>
          </div>
        </div>

        {/* Grid de clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map(cliente => (
            <ClienteCard
              key={cliente.id}
              {...cliente}
              onAtualizar={handleAbrirModalAtualizar}
              onVerDetalhes={handleAbrirModalDetalhes}
            />
          ))}
        </div>

        {!loading && filteredClientes.length === 0 && (
          <p className="text-gray-400 mt-4">Nenhum cliente encontrado para "{searchTerm}".</p>
        )}
      </div>

      {/* Modal Atualizar */}
      <ModalAtualizarCliente
        isOpen={modalAtualizarOpen}
        onClose={() => setModalAtualizarOpen(false)}
        cliente={clienteSelecionado}
        onUpdate={(clienteAtualizado) => {
          setClientes(prev =>
            prev.map(c => c.id === clienteAtualizado.id ? clienteAtualizado : c)
          );
          setModalAtualizarOpen(false);
        }}
      />

      {/* Modal Detalhes */}
      <ModalDetalhesCliente
        isOpen={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        cliente={clienteSelecionado}
        onEditClient={(cliente) => handleAbrirModalAtualizar(cliente)}
      />

      {/* Modal Cadastrar */}
      <ModalCadastrarCliente
        isOpen={modalCadastrarOpen}
        onClose={() => setModalCadastrarOpen(false)}
        onSave={(novoCliente) => {
          // gera id simples — substitua pela lógica da API se houver
          setClientes(prev => [...prev, { id: prev.length + 1, ...novoCliente }]);
          setModalCadastrarOpen(false);
        }}
      />
    </Layout>
  );
}
