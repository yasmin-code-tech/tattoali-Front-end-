import { api } from "../lib/api";

// ================== SESSÕES ==================
export const getSessionsOfDay = async (day, month, year) => {
  try {
    // Garante que os valores sejam números inteiros
    const diaNum = parseInt(day, 10);
    const mesNum = parseInt(month, 10);
    const anoNum = parseInt(year, 10);
    
    // Formata o dia com zero à esquerda (ex: 6 -> "06") para passar na validação do backend
    // O backend espera string com 2 dígitos para validateDia
    const dia = String(diaNum).padStart(2, '0');
    const mes = String(mesNum);
    const ano = String(anoNum);
    
    console.log("🔍 Dashboard Service - getSessionsOfDay chamado com:", { day, month, year });
    console.log("🔍 Valores formatados:", { dia, mes, ano });
    
    const response = await api.get(`/api/dashboard/sessions/day?dia=${dia}&mes=${mes}&ano=${ano}`);
    console.log("📊 Dashboard Service - Resposta recebida:", response);
    
    // O backend retorna { realizados: number, pendentes: number }
    // Retornamos apenas as sessões realizadas
    if (response && typeof response === 'object') {
      const result = Number(response.realizados || 0);
      console.log("✅ Dashboard Service - Resultado processado:", result);
      return result;
    }
    console.log("⚠️ Dashboard Service - Resposta não é objeto:", response);
    return 0;
  } catch (error) {
    console.error("❌ Dashboard Service - Erro ao buscar sessões do dia:", error);
    return 0;
  }
};

export const getSessionsOfMonth = async (month, year) => {
  try {
    const response = await api.get(`/api/dashboard/sessions/month?mes=${month}&ano=${year}`);
    
    if (response && typeof response === 'object') {
      return Number(response.realizados || 0);
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar sessões do mês:", error);
    return 0;
  }
};

export const getSessionsOfYear = async (year) => {
  try {
    const response = await api.get(`/api/dashboard/sessions/year?ano=${year}`);
    
    if (response && typeof response === 'object') {
      return Number(response.realizados || 0);
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar sessões do ano:", error);
    return 0;
  }
};

// ================== VALORES ==================
export const getSessionsValueOfDay = async (day, month, year) => {
  try {
    // Garante que os valores sejam números inteiros
    const diaNum = parseInt(day, 10);
    const mesNum = parseInt(month, 10);
    const anoNum = parseInt(year, 10);
    
    // Formata o dia com zero à esquerda (ex: 6 -> "06") para passar na validação do backend
    const dia = String(diaNum).padStart(2, '0');
    const mes = String(mesNum);
    const ano = String(anoNum);
    
    console.log("💰 Dashboard Service - getSessionsValueOfDay chamado com:", { day, month, year });
    console.log("💰 Valores formatados:", { dia, mes, ano });
    
    const response = await api.get(`/api/dashboard/sessions/value/day?dia=${dia}&mes=${mes}&ano=${ano}`);
    
    if (response && typeof response === 'object') {
      return Number(response.realizados || 0);
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar valor do dia:", error);
    return 0;
  }
};

export const getSessionsValueOfMonth = async (month, year) => {
  try {
    const response = await api.get(`/api/dashboard/sessions/value/month?mes=${month}&ano=${year}`);
    
    if (response && typeof response === 'object') {
      return Number(response.realizados || 0);
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar valor do mês:", error);
    return 0;
  }
};

export const getSessionsValueOfYear = async (year) => {
  try {
    const response = await api.get(`/api/dashboard/sessions/value/year?ano=${year}`);
    
    if (response && typeof response === 'object') {
      return Number(response.realizados || 0);
    }
    return 0;
  } catch (error) {
    console.error("Erro ao buscar valor do ano:", error);
    return 0;
  }
};
