import React from 'react';

const ModalDetalhesCliente = ({ isOpen, onClose, cliente, onEditClient }) => {
  if (!isOpen || !cliente) return null;

  // Função para obter as iniciais do cliente
  const getInitials = (nome) => {
    return nome
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    const numericValue = parseFloat(value);
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Calcular total investido
  const totalInvestido = cliente.sessoes?.reduce((total, sessao) => {
    const valor = parseFloat(sessao.valor) || 0;
    return total + valor;
  }, 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Detalhes do Cliente</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Cliente */}
          <div className="bg-gray-900 p-8 rounded-2xl">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {getInitials(cliente.nome)}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{cliente.nome}</h2>
                <p className="text-gray-400">{cliente.contato}</p>
              </div>
            </div>

            <div className="space-y-6">
              {cliente.contato && (
                <div>
                  <h3 className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    Contato
                  </h3>
                  <p className="text-white">{cliente.contato}</p>
                </div>
              )}

              {cliente.endereco && (
                <div>
                  <h3 className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    Endereço
                  </h3>
                  <p className="text-white">{cliente.endereco}</p>
                </div>
              )}

              {cliente.proximasSessoes && cliente.proximasSessoes.length > 0 && (
                <div>
                  <h3 className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    Próximas Sessões
                  </h3>
                  <div className="space-y-3">
                    {cliente.proximasSessoes.map((sessao, index) => (
                      <div key={index} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-white font-medium">
                            {formatDate(sessao.data)} - {sessao.horario}
                          </span>
                          <span className="text-green-400 font-semibold text-sm">
                            {formatCurrency(sessao.valor)}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {sessao.numeroSessao}ª sessão - {sessao.descricao}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {cliente.proximasSessoes && cliente.proximasSessoes.length === 0 && (
                <div>
                  <h3 className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    Próximas Sessões
                  </h3>
                  <div className="text-center text-gray-400 py-4">
                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Nenhuma sessão agendada</p>
                  </div>
                </div>
              )}

              {cliente.observacoes && (
                <div>
                  <h3 className="text-red-500 text-sm font-semibold uppercase tracking-wide mb-2">
                    Observações
                  </h3>
                  <p className="text-white">{cliente.observacoes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Histórico de Sessões */}
          <div className="bg-gray-900 p-8 rounded-2xl">
            <h3 className="text-lg font-semibold text-white mb-6">Sessões Realizadas</h3>

            <div className="space-y-4">
              {cliente.sessoes && cliente.sessoes.length > 0 ? (
                cliente.sessoes.map((sessao, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">
                        {formatDate(sessao.data)}
                      </span>
                      <span className="text-green-400 font-semibold">
                        {formatCurrency(sessao.valor)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      {sessao.numeroSessao}ª sessão - {sessao.descricao || 'Sem descrição'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>Nenhuma sessão realizada ainda</p>
                </div>
              )}
            </div>

            {cliente.sessoes && cliente.sessoes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Investido:</span>
                  <span className="text-white font-bold text-xl">
                    {formatCurrency(totalInvestido)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-8">
          <button 
            type="button" 
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
          <button 
            type="button" 
            onClick={() => {
              if (onEditClient) {
                onEditClient(cliente);
              }
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            Atualizar Cliente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhesCliente;
