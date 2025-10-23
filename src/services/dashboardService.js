import { api } from "../lib/api";

// ================== SESSÕES ==================
export const getSessionsOfDay = async (day, month, year) => {
  try {
    console.log("🔍 Dashboard Service - getSessionsOfDay chamado com:", { day, month, year });
    const response = await api.get(`/api/dashboard/sessions/day?dia=${day}&mes=${month}&ano=${year}`);
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
    const response = await api.get(`/api/dashboard/sessions/value/day?dia=${day}&mes=${month}&ano=${year}`);
    
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
