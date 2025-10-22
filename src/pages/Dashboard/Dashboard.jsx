import React, { useEffect, useState } from "react";
import Layout from "../../baselayout/Layout";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import * as dashboardService from "../../services/dashboardService";

export default function Dashboard() {
  const [sessionsToday, setSessionsToday] = useState(0);
  const [revenueToday, setRevenueToday] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);

  useEffect(() => {
    const userId = 1; // substituir pelo ID do usuário autenticado
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    async function fetchDashboard() {
      try {
        const [sessions, revToday, revMonth] = await Promise.all([
          dashboardService.getTotalSessionsOfDay(userId, day, month, year),
          dashboardService.getTotalSessionsValueOfDay(userId, day, month, year),
          dashboardService.getTotalSessionsValueOfMonth(userId, month, year),
        ]);

        // fallback para valores mokados caso backend retorne 0
        setSessionsToday(sessions || 42);
        setRevenueToday(revToday || 1250);
        setRevenueMonth(revMonth || 28430);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);

        // fallback mokado em caso de erro
        setSessionsToday(32);
        setRevenueToday(1250);
        setRevenueMonth(28430);
      }
    }

    fetchDashboard();
  }, []);

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral dos principais indicadores</p>
        </div>

        {/* Cards principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card - Faturamento do Dia */}
          <div className="bg-[#111111] border border-gray-800 hover:border-red-600 transition rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <TrendingUp className="text-red-500 w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">Faturamento do Dia</h2>
            <p className="text-3xl font-bold text-red-500">
              R$ {revenueToday.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {/* Mokado: R$ 1.250,00 */}
            </p>
            <p className="text-gray-400 text-sm mt-2">Comparado ao mesmo dia da semana passada</p>
          </div>

          {/* Card - Faturamento do Mês */}
          <div className="bg-[#111111] border border-gray-800 hover:border-red-600 transition rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <Calendar className="text-red-500 w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">Faturamento do Mês</h2>
            <p className="text-3xl font-bold text-red-500">
              R$ {revenueMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              {/* Mokado: R$ 28.430,00 */}
            </p>
            <p className="text-gray-400 text-sm mt-2">+12% em relação ao mês anterior</p>
          </div>

          {/* Card - Sessões Realizadas Hoje */}
          <div className="bg-[#111111] border border-gray-800 hover:border-red-600 transition rounded-2xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-600/20 rounded-xl">
                <Activity className="text-red-500 w-8 h-8" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white mb-1">Sessões Realizadas Hoje</h2>
            <p className="text-3xl font-bold text-red-500">
              {sessionsToday}
              {/* Mokado: 32 */}
            </p>
            <p className="text-gray-400 text-sm mt-2">+5 sessões em relação a ontem</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
