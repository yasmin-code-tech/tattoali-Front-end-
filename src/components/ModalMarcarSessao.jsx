import { useState } from "react";

export default function ModalMarcarSessao({ isOpen, onClose, onSave }) {
  const [search, setSearch] = useState("");
  const [clienteSelecionado, setClienteSelecionado] = useState(null);
  const [sessoes, setSessoes] = useState([
    { data: "", numero: "1ª sessão", valor: "", descricao: "" }
  ]);

  const clientes = [
    { id: 1, nome: "João Silva", contato: "99999-1111" },
    { id: 2, nome: "Maria Souza", contato: "88888-2222" },
    { id: 3, nome: "Carlos Oliveira", contato: "77777-3333" },
  ];

  if (!isOpen) return null;

  const clientesFiltrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.contato.toLowerCase().includes(search.toLowerCase())
  );

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChangeSessao = (index, field, value) => {
    const novas = [...sessoes];
    novas[index][field] = value;
    setSessoes(novas);
  };

  const adicionarSessao = () => {
    setSessoes([...sessoes, { data: "", numero: `${sessoes.length + 1}ª sessão`, valor: "", descricao: "" }]);
  };

  const handleSave = () => {
    if (!clienteSelecionado) {
      alert("Selecione um cliente!");
      return;
    }
    onSave({ cliente: clienteSelecionado, sessoes });
    onClose();
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
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
  {clientesFiltrados.length > 0 ? (
    clientesFiltrados.map(c => (
      <label
        key={c.id}
        className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-neutral-800 
          hover:bg-neutral-700 rounded`}
      >
        <span className="text-white">{c.nome} <small className="text-gray-300">({c.contato})</small></span>
        <input
          type="radio"
          checked={clienteSelecionado?.id === c.id}
          onChange={() => setClienteSelecionado(c)}
          className="accent-red-500"
        />
      </label>
    ))
  ) : (
    <p className="p-2 text-gray-300">Nenhum cliente encontrado.</p>
  )}
</div>


          {/* Sessões */}
{clienteSelecionado && (
  <div>
    <h3 className="text-lg font-semibold mt-4 mb-2 text-white">Sessões para {clienteSelecionado.nome}</h3>
    {sessoes.map((sessao, index) => (
      <div key={index} className="p-3 mb-3 border rounded bg-neutral-800 space-y-2">
        {/* Linha 1: Data e Número */}
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
            <label className="text-white text-sm mb-1 block">Número da Sessão</label>
            <select
              value={sessao.numero}
              onChange={(e) => handleChangeSessao(index, "numero", e.target.value)}
              className="w-full p-2 rounded bg-neutral-900 border border-neutral-700 text-white"
            >
              <option className="text-black">1ª sessão</option>
              <option className="text-black">2ª sessão</option>
              <option className="text-black">3ª sessão</option>
              <option className="text-black">4ª sessão</option>
              <option className="text-black">5ª sessão</option>
            </select>
          </div>
        </div>

        {/* Linha 2: Valor e Descrição */}
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
