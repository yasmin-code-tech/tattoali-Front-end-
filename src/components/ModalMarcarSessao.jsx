import { useState, useEffect } from "react";
import { buscarClientes } from "../services/clienteService";
import { notifySuccess, notifyError, notifyWarn } from "../services/notificationService";

export default function ModalMarcarSessao({ isOpen, onClose, onSuccess, dataSelecionada }) {
  const [search, setSearch] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [sessoes, setSessoes] = useState([
    { data: dataSelecionada || "", numeroSessao: "1", valor: "", descricao: "", horario: "" }
  ]);
  const [modalKey, setModalKey] = useState(0); // Key para forçar re-render

  // Carregar clientes e resetar seleção quando o modal abrir
  useEffect(() => {
    console.log('ModalMarcarSessao useEffect executado, isOpen:', isOpen);
    if (isOpen) {
      console.log('Modal aberto, resetando seleção e carregando clientes...');
      setClienteSelecionado(null); // Resetar seleção
      setSearch(""); // Limpar busca
      setSessoes([{ data: dataSelecionada || "", numeroSessao: "1", valor: "", descricao: "", horario: "" }]); // Resetar sessões
      setModalKey(prev => prev + 1); // Forçar re-render com nova key
      carregarClientes();
    } else {
      console.log('Modal fechado');
    }
  }, [isOpen, dataSelecionada]);

  // Garantir que após carregar clientes, nenhum esteja selecionado
  useEffect(() => {
    if (clientes.length > 0 && clienteSelecionado !== null) {
      console.log('Clientes carregados mas há uma seleção prévia, resetando...');
      setClienteSelecionado(null);
    }
  }, [clientes.length]);

  const carregarClientes = async () => {
    console.log('Iniciando carregamento de clientes...');
    console.log('Função buscarClientes:', buscarClientes);
    setLoadingClientes(true);
    try {
      console.log('Chamando buscarClientes()...');
      const clientesData = await buscarClientes();
      console.log('Clientes carregados:', clientesData);
      console.log('Tipo dos dados:', typeof clientesData);
      console.log('É array?', Array.isArray(clientesData));
      
      const clientesArray = Array.isArray(clientesData) ? clientesData : [];
      console.log('Array final:', clientesArray);
      setClientes(clientesArray);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      notifyError("Erro ao carregar lista de clientes. Tente novamente.");
      setClientes([]);
    } finally {
      setLoadingClientes(false);
      console.log('Carregamento finalizado');
    }
  };

  console.log('ModalMarcarSessao renderizando, isOpen:', isOpen);
  
  if (!isOpen) {
    console.log('Modal não está aberto, retornando null');
    return null;
  }

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.telefone && c.telefone.toLowerCase().includes(search.toLowerCase()))
  );

  console.log('Clientes no estado:', clientes);
  console.log('Clientes filtrados:', clientesFiltrados);
  console.log('Loading clientes:', loadingClientes);
  console.log('Cliente selecionado:', clienteSelecionado);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChangeSessao = (index, field, value) => {
    const novas = [...sessoes];
    novas[index][field] = value;
    setSessoes(novas);
  };

  const adicionarSessao = () => {
    setSessoes([...sessoes, { data: dataSelecionada || "", horario: "", numeroSessao: `${sessoes.length + 1}`, valor: "", descricao: "" }]);
  };

  const removerSessao = (index) => {
    if (sessoes.length > 1) {
      const novasSessoes = sessoes.filter((_, i) => i !== index);
      setSessoes(novasSessoes);
    }
  };

  const handleSave = async () => {
    try {
      if (!clienteSelecionado) {
        notifyWarn("Selecione um cliente!");
        return;
      }
      
      // Validar se todas as sessões têm dados obrigatórios
      const sessoesValidas = sessoes.every(s => s.data && s.horario && s.valor && s.descricao);
      if (!sessoesValidas) {
        notifyWarn("Preencha todos os campos obrigatórios das sessões (data, horário, valor e descrição)!");
        return;
      }
      
      // Chamar onSuccess com os dados formatados
      await onSuccess({ 
        cliente: clienteSelecionado, 
        sessoes: sessoes.map(s => ({
          clienteId: clienteSelecionado.client_id || clienteSelecionado.id,
          data: s.data,
          horario: s.horario,
          numeroSessao: s.numeroSessao,
          valor: s.valor,
          descricao: s.descricao
        }))
      });
      
      notifySuccess(`${sessoes.length > 1 ? 'Sessões marcadas' : 'Sessão marcada'} com sucesso para ${clienteSelecionado.nome}!`);
      
      // Limpar estados após salvar com sucesso
      setClienteSelecionado(null);
      setSearch("");
      setSessoes([{ data: dataSelecionada || "", numeroSessao: "1", valor: "", descricao: "", horario: "" }]);
      
      onClose();
    } catch (error) {
      console.error('Erro ao marcar sessão:', error);
      notifyError("Erro ao marcar sessão. Tente novamente.");
    }
  };

  return (
    <div 
      key={modalKey}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40"
    >
      <div className="card p-8 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Marcar Sessão</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Buscar Cliente */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Buscar Cliente</label>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome ou contato..."
              className="input-field w-full px-4 py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-white"
            />
          </div>

          {/* Lista de Clientes */}
          <div className="max-h-32 overflow-y-auto border border-neutral-700 rounded">
              {loadingClientes ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mx-auto"></div>
                <p className="text-gray-300 text-sm mt-2">Carregando clientes...</p>
                </div>
            ) : clientesFiltrados.length > 0 ? (
              clientesFiltrados.map(c => {
                console.log('Renderizando cliente:', c);
                const isChecked = clienteSelecionado && (clienteSelecionado.client_id === c.client_id || clienteSelecionado.id === c.id);
                console.log(`Cliente ${c.nome} isChecked:`, isChecked, 'clienteSelecionado:', clienteSelecionado);
                return (
                  <label
                    key={c.client_id || c.id}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-neutral-800 
                      hover:bg-neutral-700 rounded`}
                    onClick={() => {
                      console.log('Label clicado, selecionando cliente:', c);
                      setClienteSelecionado(c);
                    }}
                  >
                    <span className="text-white">{c.nome} <small className="text-gray-300">({c.telefone || c.contato})</small></span>
                    <input 
                      type="radio" 
                      name="clienteSelecionado"
                      value={c.client_id || c.id}
                      checked={isChecked}
                      onChange={() => {
                        console.log('Radio onChange disparado, selecionando cliente:', c);
                        setClienteSelecionado(c);
                      }}
                      onClick={(e) => {
                        console.log('Radio clicado, selecionando cliente:', c);
                        e.stopPropagation();
                        setClienteSelecionado(c);
                      }}
                      className="accent-red-500"
                    />
                  </label>
                );
              })
            ) : (
              <div>
                <p className="p-2 text-gray-300">Nenhum cliente encontrado.</p>
                <p className="p-2 text-gray-400 text-xs">Total de clientes: {clientes.length}</p>
                <p className="p-2 text-gray-400 text-xs">Filtro: "{search}"</p>
                  </div>
              )}
          </div>


          {/* Sessões */}
          {clienteSelecionado && (
            <div>
    <h3 className="text-lg font-semibold mt-4 mb-2 text-white">Sessões para {clienteSelecionado.nome}</h3>
              {sessoes.map((sessao, index) => (
      <div key={index} className="p-3 mb-3 border rounded bg-neutral-800 space-y-2">
        {/* Header da Sessão */}
        <div className="flex justify-between items-center mb-2">
                    <h4 className="text-white font-medium">Sessão {index + 1}</h4>
                    {sessoes.length > 1 && (
                      <button
                        type="button"
              onClick={() => removerSessao(index)}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
                      >
                        Remover
                      </button>
                    )}
                  </div>
        
        {/* Linha 1: Data e Horário */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-white text-sm mb-1 block">Data</label>
                      <input 
                        type="date" 
                        value={sessao.data}
              onChange={(e) => handleChangeSessao(index, "data", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-white text-sm mb-1 block">Horário</label>
            <input
              type="time"
              value={sessao.horario}
              onChange={(e) => handleChangeSessao(index, "horario", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
                      />
                    </div>
        </div>

        {/* Linha 2: Número da Sessão */}
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="text-white text-sm mb-1 block">Número da Sessão</label>
            <input
              type="number"
              min="1"
                        value={sessao.numeroSessao}
              onChange={(e) => handleChangeSessao(index, "numeroSessao", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
              placeholder="1"
            />
          </div>
                    </div>

        {/* Linha 3: Valor e Descrição */}
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="text-white text-sm mb-1 block">Valor da Sessão</label>
                      <input 
              type="number"
              placeholder="R$ 0,00"
                        value={sessao.valor}
              onChange={(e) => handleChangeSessao(index, "valor", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white placeholder-white"
                      />
                    </div>
          <div className="flex-1">
            <label className="text-white text-sm mb-1 block">Descrição da Sessão</label>
                      <input 
                        type="text" 
              placeholder="Descrição"
                        value={sessao.descricao}
              onChange={(e) => handleChangeSessao(index, "descricao", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white placeholder-white"
                      />
                    </div>
                  </div>
                </div>
              ))}

                <button 
                  type="button" 
      onClick={adicionarSessao}
      className="w-full py-3 mt-2 border border-red-500 text-red-500 rounded hover:bg-red-500 hover:text-white transition font-medium"
    >
      + Adicionar Outra Sessão
                </button>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-4 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="button"
              onClick={handleSave}
              className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer"
            >
              Marcar Sessão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}