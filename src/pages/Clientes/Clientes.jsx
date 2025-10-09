import React, { useState } from "react";
import Layout from '../../baselayout/Layout';
import { FiUser, FiPlus } from "react-icons/fi";

import ModalAtualizarCliente from "../../components/ModalAtualizarCliente";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";
import ModalDetalhesCliente from "../../components/ModalDetalhesCliente";
import { buscarSessoesRealizadasCliente, buscarSessoesPendentesCliente, buscarSessoesCanceladasCliente } from '../../services/agendaService';

const ClienteCard = ({ id, nome, contato, descricao, onAtualizar, onVerDetalhes }) => (
  <div className="bg-[#111111] border border-gray-700 hover:border-red-600 transition rounded-xl p-6">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-white">{nome}</h3>
    </div>
    <p className="text-gray-400 text-sm mb-2">{contato}</p>
    <p className="text-gray-300 mb-4">{descricao}</p>

    <div className="flex justify-between items-center">
      <button
        onClick={() => onAtualizar({ id, nome, contato, descricao })}
        className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Atualizar Cliente
      </button>

      <button
        onClick={() => onVerDetalhes({ id, nome, contato, descricao })}
        className="bg-red-600 hover:bg-red-700 text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Detalhes
      </button>
    </div>
  </div>
);

export default function Clientes() {
  const clientesMock = [
    { id: 1, nome: "Maria Clara Santos", contato: "(11) 98765-4321", descricao: "Tatuagem floral no braço direito", endereco: "Rua das Flores, 123 - São Paulo/SP" },
    { id: 2, nome: "João Silva", contato: "(11) 99876-5432", descricao: "Tatuagem tribal nas costas", endereco: "Av. Paulista, 456 - São Paulo/SP" },
    { id: 3, nome: "Ana Santos", contato: "(11) 97654-3210", descricao: "Retoque em tatuagem antiga", endereco: "Rua Augusta, 789 - São Paulo/SP" },
    { id: 4, nome: "Carlos Mendes", contato: "(11) 96543-2109", descricao: "Tatuagem realista no antebraço", endereco: "Rua Oscar Freire, 321 - São Paulo/SP" },
  ];

  const [clientes, setClientes] = useState(clientesMock);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalAtualizarOpen, setModalAtualizarOpen] = useState(false);
  const [modalCadastrarOpen, setModalCadastrarOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleBuscarClientes = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
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

  const handleAbrirModalDetalhes = async (cliente) => {
    try {
      const [sessoesRealizadas, sessoesPendentes, sessoesCanceladas] = await Promise.all([
        buscarSessoesRealizadasCliente(cliente.id),
        buscarSessoesPendentesCliente(cliente.id),
        buscarSessoesCanceladasCliente(cliente.id)
      ]);

      const clienteParaModal = {
        ...cliente,
        endereco: cliente.endereco || 'Endereço não informado',
        observacoes: cliente.descricao,
        sessoes: sessoesRealizadas.map(sessao => ({
          data: sessao.data_atendimento,
          numeroSessao: sessao.numero_sessao,
          descricao: sessao.descricao,
          valor: sessao.valor_sessao || '0'
        })),
        proximasSessoes: sessoesPendentes.map(sessao => ({
          data: sessao.data_atendimento,
          horario: new Date(sessao.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          numeroSessao: sessao.numero_sessao,
          descricao: sessao.descricao,
          valor: sessao.valor_sessao || '0'
        })),
        sessoesCanceladas: sessoesCanceladas.map(sessao => ({
          data: sessao.data_atendimento,
          numeroSessao: sessao.numero_sessao,
          descricao: sessao.descricao,
          valor: sessao.valor_sessao || '0',
          motivo: sessao.motivo || ''
        }))
      };
      
      setClienteSelecionado(clienteParaModal);
      setModalDetalhesOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      const clienteParaModal = {
        ...cliente,
        endereco: cliente.endereco || 'Endereço não informado',
        observacoes: cliente.descricao,
        sessoes: [],
        proximasSessoes: [],
        sessoesCanceladas: []
      };
      setClienteSelecionado(clienteParaModal);
      setModalDetalhesOpen(true);
    }
  };

  const handleAbrirModalCadastrar = () => {
    setModalCadastrarOpen(true);
  };

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Clientes</h1>
            <p className="text-gray-400">Gerencie informações dos seus clientes</p>
          </div>

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
                className={`ml-2 px-4 py-2 rounded-lg font-medium text-white transition ${loading ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"}`}
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>

            {/* Botão minimalista adicionar cliente com react-icons */}
            <button
              onClick={handleAbrirModalCadastrar}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition"
              title="Adicionar Cliente"
            >
              <FiUser className="w-5 h-5" />
              <FiPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

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

      <ModalDetalhesCliente
        isOpen={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        cliente={clienteSelecionado}
        onEditClient={(cliente) => handleAbrirModalAtualizar(cliente)}
      />

      <ModalCadastrarCliente
        isOpen={modalCadastrarOpen}
        onClose={() => setModalCadastrarOpen(false)}
        onSave={(novoCliente) => {
          const clienteComId = {
            ...novoCliente,
            id: Date.now(),
            contato: novoCliente.contato,
            descricao: novoCliente.observacoes || 'Sem descrição'
          };
          setClientes(prev => [...prev, clienteComId]);
          setModalCadastrarOpen(false);
        }}
      />
    </Layout>
  );
}
