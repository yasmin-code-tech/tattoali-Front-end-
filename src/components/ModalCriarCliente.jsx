import { useState } from "react";

export default function ModalCriarCliente({ isOpen, onClose }) {
  const [cliente, setCliente] = useState({
    nome: '',
    numero: '',
    endereco: '',
    descricao: '',
    valor: '',
    dataAtendimento: '',
    numeroSessao: ''
  });

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleChange = (e) => {
    setCliente(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    // Aqui você pode enviar os dados para a API ou backend
    console.log("Dados do cliente:", cliente);
    alert("Cliente criado com sucesso! (Simulação)");
    onClose();
  };

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    >
      <div className="card p-8 rounded-2xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Criar Cliente</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Nome do Cliente</label>
            <input 
              type="text"
              name="nome"
              value={cliente.nome}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o nome do cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Número</label>
            <input 
              type="text"
              name="numero"
              value={cliente.numero}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o número de contato"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Endereço</label>
            <input 
              type="text"
              name="endereco"
              value={cliente.endereco}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o endereço"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Descrição da Tatuagem</label>
            <textarea
              name="descricao"
              value={cliente.descricao}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg resize-none"
              placeholder="Descreva como será a tatuagem desejada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Valor da Sessão</label>
            <input 
              type="number"
              name="valor"
              value={cliente.valor}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o valor da sessão"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Data do Atendimento</label>
            <input 
              type="date"
              name="dataAtendimento"
              value={cliente.dataAtendimento}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Número da Sessão</label>
            <input 
              type="number"
              name="numeroSessao"
              value={cliente.numeroSessao}
              onChange={handleChange}
              className="input-field w-full px-4 py-3 rounded-lg"
              placeholder="Digite o número da sessão"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg font-medium cursor-pointer">
              Cancelar
            </button>
            <button type="button" onClick={handleSubmit} className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
