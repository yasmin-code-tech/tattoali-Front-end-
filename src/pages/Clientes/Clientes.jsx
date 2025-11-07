import React, { useState, useEffect } from "react";
import Layout from '../../baselayout/Layout';
import { FiUser, FiPlus, FiArrowDown, FiArrowUp, FiTrash2 } from "react-icons/fi";

import ModalAtualizarCliente from "../../components/ModalAtualizarCliente";
import ModalCadastrarCliente from "../../components/ModalCadastrarCliente";
import ModalDetalhesCliente from "../../components/ModalDetalhesCliente";
import ModalConfirmarExclusaoCliente from "../../components/ModalConfirmarExclusaoCliente";
import { buscarSessoesRealizadasCliente, buscarSessoesPendentesCliente, buscarSessoesCanceladasCliente } from '../../services/agendaService';
import { buscarClientes, criarCliente, deletarCliente } from '../../services/clienteService';
import { notifySuccess, notifyError } from '../../services/notificationService';

const ClienteCard = ({ id, nome, contato, descricao, endereco, observacoes, onAtualizar, onVerDetalhes, onExcluir }) => {
  const handleExcluirClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ ClienteCard - Botão de exclusão clicado:', { id, nome });
    console.log('🗑️ ClienteCard - onExcluir é função?', typeof onExcluir);
    if (typeof onExcluir === 'function') {
      console.log('🗑️ ClienteCard - Chamando onExcluir...');
      onExcluir(id, nome);
    } else {
      console.error('🗑️ ClienteCard - onExcluir não é uma função!', onExcluir);
    }
  };

  return (
    <div className="bg-[#111111] border border-gray-700 hover:border-red-600 transition rounded-xl p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white">{nome}</h3>
        <button
          onClick={handleExcluirClick}
          className="text-gray-400 hover:text-red-500 transition"
          title="Excluir cliente"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      </div>
    <p className="text-gray-400 text-sm mb-2">{contato}</p>
    <p className="text-gray-300 mb-4">{descricao}</p>

    <div className="flex justify-between items-center">
      <button
        onClick={() => onAtualizar({ id, nome, contato, descricao, endereco, observacoes })}
        className="border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Atualizar Cliente
      </button>

      <button
        onClick={() => onVerDetalhes({ id, nome, contato, descricao, endereco, observacoes })}
        className="bg-red-600 hover:bg-red-700 text-white transition px-4 py-2 rounded-lg text-sm font-medium"
      >
        Detalhes
      </button>
    </div>
    </div>
  );
};

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalAtualizarOpen, setModalAtualizarOpen] = useState(false);
  const [modalCadastrarOpen, setModalCadastrarOpen] = useState(false);
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);

  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  // true = crescente, false = decrescente
  const [ordemCrescente, setOrdemCrescente] = useState(true);

  // Debug: monitora mudanças no estado do modal
  useEffect(() => {
    console.log('🟡 Estado do modal de exclusão mudou:', {
      modalExclusaoOpen,
      clienteParaExcluir
    });
  }, [modalExclusaoOpen, clienteParaExcluir]);

  const removerAcentos = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Função para carregar clientes da API
  const carregarClientes = async () => {
    try {
      setLoading(true);
      const clientesDaAPI = await buscarClientes();

      // Ordena os clientes por nome inicialmente
      const clientesOrdenados = clientesDaAPI.sort((a, b) =>
        a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
      );

      setClientes(clientesOrdenados);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      notifyError('Erro ao carregar clientes. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar clientes quando o componente monta
  useEffect(() => {
    carregarClientes();
  }, []);

  const handleBuscarClientes = async () => {
    await carregarClientes();
  };

  // Alterna a ordem crescente/decrescente
  const toggleOrdem = () => setOrdemCrescente(prev => !prev);

  const filteredClientes = clientes
    .filter(cliente =>
      removerAcentos(cliente.nome.toLowerCase()).includes(
        removerAcentos(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) =>
      ordemCrescente
        ? a.nome.localeCompare(b.nome, 'pt', { sensitivity: 'base' })
        : b.nome.localeCompare(a.nome, 'pt', { sensitivity: 'base' })
    );

  const handleAbrirModalAtualizar = (cliente) => {
    setClienteSelecionado(cliente);
    setModalAtualizarOpen(true);
  };

  const handleAbrirModalDetalhes = async (cliente) => {
    try {
      console.log('=== ABRINDO MODAL DETALHES CLIENTE ===');
      console.log('Cliente ID:', cliente.id);
      
      const [sessoesRealizadas, sessoesPendentes, sessoesCanceladas] = await Promise.all([
        buscarSessoesRealizadasCliente(cliente.id),
        buscarSessoesPendentesCliente(cliente.id),
        buscarSessoesCanceladasCliente(cliente.id)
      ]);
      
      console.log('Sessões realizadas:', sessoesRealizadas);
      console.log('Sessões pendentes:', sessoesPendentes);
      console.log('Sessões canceladas:', sessoesCanceladas);

      const clienteParaModal = {
        ...cliente,
        endereco: cliente.endereco || 'Endereço não informado',
        observacoes: cliente.observacoes || cliente.descricao || 'Sem observações',
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
        observacoes: cliente.observacoes || cliente.descricao || 'Sem observações',
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

  const handleAbrirModalExclusao = (id, nome) => {
    console.log('🔴 handleAbrirModalExclusao chamado:', { id, nome });
    console.log('🔴 Estados ANTES:', { 
      modalExclusaoOpen, 
      clienteParaExcluir 
    });
    
    const novoCliente = { id, nome };
    setClienteParaExcluir(novoCliente);
    setModalExclusaoOpen(true);
    
    // Verifica após um pequeno delay se o estado foi atualizado
    setTimeout(() => {
      console.log('🔴 Estados DEPOIS (após setState):', {
        modalExclusaoOpen: true, // Esperado
        clienteParaExcluir: novoCliente // Esperado
      });
    }, 100);
  };

  const handleConfirmarExclusao = async (id, nome) => {
    try {
      await deletarCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      setModalExclusaoOpen(false);
      setClienteParaExcluir(null);
      
      // Mostra mensagem de sucesso usando o sistema de notificações
      notifySuccess('Cliente excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      
      let errorMessage = 'Erro ao excluir cliente. Tente novamente.';
      
      if (error.message?.includes('sessões') || error.message?.includes('foreign key') || error.message?.includes('constraint')) {
        errorMessage = `Não é possível excluir o cliente "${nome}".\n\nExistem sessões vinculadas a este cliente. Exclua ou transfira as sessões antes de excluir o cliente.`;
      } else if (error.message?.includes('não encontrado')) {
        errorMessage = 'Cliente não encontrado.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostra mensagem de erro usando o sistema de notificações
      notifyError(errorMessage);
      throw error; // Re-lança o erro para que o modal possa tratar se necessário
    }
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
            
            {/* Botão adicionar cliente */}
            <button
              onClick={handleAbrirModalCadastrar}
              className="bg-red-600 hover:bg-red-700 text-white  rounded-lg flex items-center justify-center gap-2 transition"
              style={{ paddingTop: '19.0px', paddingBottom: '19.0px', paddingLeft: '19.0px', paddingRight: '19.0px' }}
              title="Adicionar Cliente"
            >
              <FiUser className="w-5 h-5" />
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

        </div>

         {/* Botão para alternar ordem */}
         <div className="mb-6">
               <button
               onClick={toggleOrdem}
               className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
               title="Alternar ordem"
             >
               Ordem {ordemCrescente ? 'A-Z' : 'Z-A'}
               {ordemCrescente ? <FiArrowDown /> : <FiArrowUp />}
             </button>
         </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClientes.map(cliente => (
            <ClienteCard
              key={cliente.id}
              id={cliente.id}
              nome={cliente.nome}
              contato={cliente.contato}
              descricao={cliente.descricao}
              endereco={cliente.endereco}
              observacoes={cliente.observacoes}
              onAtualizar={handleAbrirModalAtualizar}
              onVerDetalhes={handleAbrirModalDetalhes}
              onExcluir={handleAbrirModalExclusao}
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
        onSuccess={(clienteAtualizado) => {
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
        onSave={async (novoCliente) => {
          try {
            const clienteCriado = await criarCliente(novoCliente);
            
            // Mapear resposta do backend para formato do frontend
            const clienteMapeado = {
              ...clienteCriado,
              id: clienteCriado.client_id,
              contato: clienteCriado.telefone,
              observacoes: clienteCriado.descricao
            };
            
            setClientes(prev => [...prev, clienteMapeado]);
            setModalCadastrarOpen(false);
            // Notificação de sucesso já é exibida pelo ModalCadastrarCliente
          } catch (error) {
            console.error('Erro ao criar cliente:', error);
            notifyError('Erro ao criar cliente. Tente novamente.');
          }
        }}
      />

      <ModalConfirmarExclusaoCliente
        isOpen={modalExclusaoOpen}
        onClose={() => {
          setModalExclusaoOpen(false);
          setClienteParaExcluir(null);
        }}
        onConfirm={handleConfirmarExclusao}
        cliente={clienteParaExcluir}
      />
    </Layout>
  );
}