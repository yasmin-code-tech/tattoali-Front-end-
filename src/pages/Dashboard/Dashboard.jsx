import React, { useEffect, useState } from "react";
import Layout from "../../baselayout/Layout";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import * as dashboardService from "../../services/dashboardService";
import { useAuth } from "../../auth/useAuth";

export default function Dashboard() {
  const { token, isBooting } = useAuth();
  const [sessionsDay, setSessionsDay] = useState(0);
  const [sessionsMonth, setSessionsMonth] = useState(0);
  const [sessionsYear, setSessionsYear] = useState(0);

  const [revenueDay, setRevenueDay] = useState(0);
  const [revenueMonth, setRevenueMonth] = useState(0);
  const [revenueYear, setRevenueYear] = useState(0);

  const [sessionsDayChange, setSessionsDayChange] = useState(0);
  const [revenueDayChange, setRevenueDayChange] = useState(0);

  useEffect(() => {
    // Aguarda o carregamento da autenticação
    if (isBooting) {
      return;
    }
    
    if (!token) {
      console.warn("Usuário não autenticado, não é possível carregar dados do dashboard");
      return;
    }

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    async function fetchDashboard() {
      try {
        // Datas anteriores para comparação
        const prevDate = new Date(year, month - 1, day - 7);
        const prevDay = prevDate.getDate();
        const prevMonth = prevDate.getMonth() + 1;
        const prevYear = prevDate.getFullYear();

        // Busca valores atuais e anteriores
        const [
          sessionsTodayRes,
          revenueTodayRes,
          sessionsMonthRes,
          revenueMonthRes,
          sessionsYearRes,
          revenueYearRes,
          sessionsPrevDay,
          revenuePrevDay,
        ] = await Promise.all([
          dashboardService.getSessionsOfDay(day, month, year),
          dashboardService.getSessionsValueOfDay(day, month, year),
          dashboardService.getSessionsOfMonth(month, year),
          dashboardService.getSessionsValueOfMonth(month, year),
          dashboardService.getSessionsOfYear(year),
          dashboardService.getSessionsValueOfYear(year),
          dashboardService.getSessionsOfDay(prevDay, prevMonth, prevYear),
          dashboardService.getSessionsValueOfDay(prevDay, prevMonth, prevYear),
        ]);

        setSessionsDay(sessionsTodayRes || 0);
        setRevenueDay(revenueTodayRes || 0);
        setSessionsMonth(sessionsMonthRes || 0);
        setRevenueMonth(revenueMonthRes || 0);
        setSessionsYear(sessionsYearRes || 0);
        setRevenueYear(revenueYearRes || 0);

        // Calcula comparações percentuais reais
        setSessionsDayChange(
          sessionsPrevDay ? Math.round(((sessionsTodayRes - sessionsPrevDay) / sessionsPrevDay) * 100) : 0
        );
        setRevenueDayChange(
          revenuePrevDay ? Math.round(((revenueTodayRes - revenuePrevDay) / revenuePrevDay) * 100) : 0
        );
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      }
    }

    fetchDashboard();
  }, [token, isBooting]);

  const cards = [
    {
      title: "Faturamento do Dia",
      value: `R$ ${revenueDay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: <TrendingUp className="text-red-500 w-8 h-8" />,
      subtitle: revenueDayChange >= 0
        ? `+${revenueDayChange}% em relação ao mesmo dia da semana passada`
        : `${revenueDayChange}% em relação ao mesmo dia da semana passada`,
    },
    {
      title: "Faturamento do Mês",
      value: `R$ ${revenueMonth.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: <Calendar className="text-red-500 w-8 h-8" />,
      subtitle: "", // Pode implementar comparação com mês anterior se quiser
    },
    {
      title: "Faturamento do Ano",
      value: `R$ ${revenueYear.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: <Calendar className="text-red-500 w-8 h-8" />,
      subtitle: "", // Pode implementar comparação com ano passado se quiser
    },
    {
      title: "Sessões Hoje",
      value: sessionsDay,
      icon: <Activity className="text-red-500 w-8 h-8" />,
      subtitle: sessionsDayChange >= 0
        ? `+${sessionsDayChange}% em relação ao mesmo dia da semana passada`
        : `${sessionsDayChange}% em relação ao mesmo dia da semana passada`,
    },
    {
      title: "Sessões no Mês",
      value: sessionsMonth,
      icon: <Activity className="text-red-500 w-8 h-8" />,
      subtitle: "", // Pode implementar comparação com mês anterior se quiser
    },
    {
      title: "Sessões no Ano",
      value: sessionsYear,
      icon: <Activity className="text-red-500 w-8 h-8" />,
      subtitle: "", // Pode implementar comparação com ano passado se quiser
    },
  ];

  return (
    <Layout>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Visão geral dos principais indicadores</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="bg-[#111111] border border-gray-800 hover:border-red-600 transition rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-600/20 rounded-xl">{card.icon}</div>
              </div>
              <h2 className="text-xl font-semibold text-white mb-1">{card.title}</h2>
              <p className="text-3xl font-bold text-red-500">{card.value}</p>
              <p className="text-gray-400 text-sm mt-2">{card.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
