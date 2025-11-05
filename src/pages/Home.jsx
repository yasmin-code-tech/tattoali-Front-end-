import React, { useState, useEffect } from 'react';
import Layout from '../baselayout/Layout'; 
import { useAuth } from '../auth/useAuth';

import { buscarPerfilTatuador } from '../services/perfilService';
import { 
    buscarSessoesPendentesPorData,
    buscarSessoesPendentesCliente, 
    buscarSessoesRealizadasCliente, 
    buscarSessoesCanceladasCliente 
} from '../services/agendaService';
import { buscarClientes } from '../services/clienteService';
import { notifyError } from '../services/notificationService'; 
import ModalDetalhesCliente from '../components/ModalDetalhesCliente'; 

const StatCard = ({ title, value }) => (
  <div className="card p-6">
    <h3 className="text-gray-400 text-sm font-medium uppercase mb-2">{title}</h3>
    <p className="text-white text-3xl font-bold">{value}</p>
  </div>
);

const SessionItem = ({ sessao, onVerDetalhes }) => {
  const { descricao, cliente, data_atendimento } = sessao;
  const status = "Pendente";
  const horario = new Date(data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const clienteNome = cliente?.nome || 'Cliente';
  const titulo = descricao || "Sem descrição";

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
      case 'pendente':
        return 'bg-red-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-3">
      <div className="min-w-0">
        <p className="text-white font-medium truncate"><strong>Tatuagem:</strong> {titulo}</p>
        <p className="text-gray-400 text-sm">
          Cliente: {clienteNome} — {horario}
        </p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
        <span className={`py-1 px-3 rounded-md text-xs font-bold ${getStatusClass(status)} flex-grow sm:flex-grow-0 text-center`}>
          {status}
        </span>
        <button
          onClick={() => onVerDetalhes(sessao)}
          className="btn-secondary px-3 py-1 rounded-lg font-medium text-xs w-full sm:w-auto"
        >
          Detalhes
        </button>
      </div>
    </li>
  );
};


export default function Home() {
  const [nomeUsuario, setNomeUsuario] = useState('Tatuador');
  const [sessoesHoje, setSessoesHoje] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loading, setLoading] = useState(true);

  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  
  const { user } = useAuth(); 

  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        setLoading(true);

        const hojeDateObj = new Date();
        const ano = hojeDateObj.getFullYear();
        const mes = String(hojeDateObj.getMonth() + 1).padStart(2, '0'); 
        const dia = String(hojeDateObj.getDate()).padStart(2, '0');
        const hoje = `${ano}-${mes}-${dia}`; 

        console.log("Buscando dados para a data local:", hoje); 

        const [perfilData, sessoesData, clientesData] = await Promise.all([
          buscarPerfilTatuador(),
          buscarSessoesPendentesPorData(hoje), 
          buscarClientes()
        ]);

        console.log("Sessões pendentes recebidas:", sessoesData); 

        setNomeUsuario(user?.nome || perfilData?.nome || 'Tatuador'); 
        
        if (Array.isArray(sessoesData)) {
          setSessoesHoje(sessoesData);
        }
        if (Array.isArray(clientesData)) {
          setTotalClientes(clientesData.length);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        notifyError(error.message || "Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    };

    carregarDadosDashboard();
  }, [user]); 

  const stats = [
    { title: "Agendamentos de hoje", value: loading ? '...' : sessoesHoje.length },
    { title: "Clientes ativos", value: loading ? '...' : totalClientes },
  ];

  const handleVerDetalhesCliente = async (sessao) => {
    if (!sessao || !sessao.cliente_id) {
        notifyError("Informações do cliente incompletas.");
        return;
    }
    try {
      const [sessoesPendentes, sessoesRealizadas, sessoesCanceladas] = await Promise.all([
        buscarSessoesPendentesCliente(sessao.cliente_id),
        buscarSessoesRealizadasCliente(sessao.cliente_id),
        buscarSessoesCanceladasCliente(sessao.cliente_id)
      ]);
      
      const cliente = {
        id: sessao.cliente_id,
        nome: sessao.cliente?.nome || 'Cliente não encontrado',
        contato: sessao.cliente?.telefone || 'Contato não informado',
        endereco: sessao.cliente?.endereco || 'Endereço não informado',
        observacoes: sessao.cliente?.observacoes || 'Observações não informadas',
        sessoes: (sessoesRealizadas || []).map(s => ({
          data: s.data_atendimento,
          numeroSessao: s.numero_sessao,
          descricao: s.descricao,
          valor: s.valor_sessao || '0'
        })),
        proximasSessoes: (sessoesPendentes || []).map(s => ({
          data: s.data_atendimento,
          horario: new Date(s.data_atendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          numeroSessao: s.numero_sessao,
          descricao: s.descricao,
          valor: s.valor_sessao || '0'
        })),
        sessoesCanceladas: (sessoesCanceladas || []).map(s => ({
            data: s.data_atendimento,
            numeroSessao: s.numero_sessao,
            descricao: s.descricao,
            valor: s.valor_sessao || '0',
            motivo: s.motivo || ''
        }))
      };
      
      setClienteSelecionado(cliente);
      setModalDetalhesOpen(true);
    } catch (error) {
      console.error('Erro ao buscar detalhes do cliente:', error);
      notifyError(error.message || 'Falha ao carregar detalhes do cliente');
    }
  };

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        
        {/* CABEÇALHO */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              Bem-vindo de volta, <span className="text-red-600">{loading ? '...' : nomeUsuario}</span> 👋
            </h2>
            <p className="text-gray-400">Aqui está um resumo do seu dia.</p>
          </div>
        </header>

        {/* CARDS DE RESUMO */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {stats.map((stat) => (
            <StatCard key={stat.title} title={stat.title} value={stat.value} />
          ))}
        </section>

        {/* SEÇÃO DE AGENDAMENTOS */}
        <section className="mb-10">
          <h3 className="text-2xl font-semibold text-white mb-4">Próximas Sessões</h3>
          <div className="card p-6">
            <ul className="divide-y divide-gray-800">
              {loading ? (
                <p className="text-gray-400 text-center py-4">Carregando sessões...</p>
              ) : sessoesHoje.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhum agendamento pendente para hoje.</p>
              ) : (
                sessoesHoje.map((sessao) => (
                  <SessionItem 
                    key={sessao.sessao_id} 
                    sessao={sessao}
                    onVerDetalhes={handleVerDetalhesCliente}
                  />
                ))
              )}
            </ul>
          </div>
        </section>
        
      </div>

      <ModalDetalhesCliente
        isOpen={modalDetalhesOpen}
        onClose={() => setModalDetalhesOpen(false)}
        cliente={clienteSelecionado}
        onEditClient={() => {
            setModalDetalhesOpen(false);
            console.log("Abrir modal de edição (ainda não implementado na Home)");
        }}
      />
    </Layout>
  );
}