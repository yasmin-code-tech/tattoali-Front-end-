import { api } from "../lib/api";

// ================== SESSÕES ==================
export const getSessionsOfDay = async (userId, day, month, year) => {
  try {
    const response = await api.get("/sessions/day", { params: { userId, day, month, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar sessões do dia:", error);
    return 0;
  }
};

export const getSessionsOfMonth = async (userId, month, year) => {
  try {
    const response = await api.get("/sessions/month", { params: { userId, month, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar sessões do mês:", error);
    return 0;
  }
};

export const getSessionsOfYear = async (userId, year) => {
  try {
    const response = await api.get("/sessions/year", { params: { userId, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar sessões do ano:", error);
    return 0;
  }
};

// ================== VALORES ==================
export const getSessionsValueOfDay = async (userId, day, month, year) => {
  try {
    const response = await api.get("/sessions/value/day", { params: { userId, day, month, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar valor do dia:", error);
    return 0;
  }
};

export const getSessionsValueOfMonth = async (userId, month, year) => {
  try {
    const response = await api.get("/sessions/value/month", { params: { userId, month, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar valor do mês:", error);
    return 0;
  }
};

export const getSessionsValueOfYear = async (userId, year) => {
  try {
    const response = await api.get("/sessions/value/year", { params: { userId, year } });
    return Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;
  } catch (error) {
    console.error("Erro ao buscar valor do ano:", error);
    return 0;
  }
};
