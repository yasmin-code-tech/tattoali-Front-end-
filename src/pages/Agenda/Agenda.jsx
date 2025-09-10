import React from 'react'
import { useMemo } from "react";

import Layout from '../../baselayout/Layout'
export default function Agenda() {
  // Data “bonita” no topo (ex.: 15 de março, 2024)
  const dataDeHoje = useMemo(() => {
    return new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const handleAdicionarCliente = () => {
    // TODO: abrir modal de novo cliente
    console.log("Abrir modal: Adicionar Cliente");
  };

  const handleSessaoRealizada = () => {
    // Sem lista por enquanto; deixei o botão aqui só para manter o layout
    console.log("Sessão realizada (placeholder)");
  };

  return (
    <div id="agenda-screen" className="min-h-screen lg:ml-64 p-6">
        <Layout><div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
            <p className="text-gray-400">Gerencie seus agendamentos do dia</p>
          </div>

          <button
            onClick={handleAdicionarCliente}
            className="btn-primary px-6 py-3 rounded-lg font-semibold mt-4 lg:mt-0 inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M12 6v12m6-6H6" />
            </svg>
            Adicionar Cliente
          </button>
        </div>

        {/* Date Display */}
        <div className="mb-8">
          <div className="card p-4 rounded-lg inline-block">
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white font-medium">{dataDeHoje}</span>
            </div>
          </div>
        </div>

        {/* Empty state (sem lista ainda) */}
        <div className="card p-10 rounded-2xl flex flex-col items-center text-center">
          <svg className="w-10 h-10 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-white text-lg font-semibold mb-2">Sem agendamentos por enquanto</h3>
          <p className="text-gray-400 mb-6">Adicione um cliente para criar o primeiro horário do dia.</p>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAdicionarCliente}
              className="btn-primary px-6 py-3 rounded-lg font-semibold"
            >
              Adicionar Cliente
            </button>

            {/* Mantendo o botão “Sessão Realizada” como pedido (placeholder) */}
            <button
              onClick={handleSessaoRealizada}
              className="border border-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Sessão Realizada
            </button>
          </div>
        </div>
      </div>
      </Layout>
    </div>
  );
}


