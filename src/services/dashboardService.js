// src/services/dashboardService.js
import { api } from "../lib/api";

/**
 * Busca o total de sessões do dia para o usuário
 * @param {number} userId
 * @param {number} day
 * @param {number} month
 * @param {number} year
 * @returns {Promise<number>} Total de sessões realizadas
 */
export const getTotalSessionsOfDay = async (userId, day, month, year) => {
  try {
    const response = await api.get("/api/dashboard/sessions/day", {
      params: { userId, day, month, year }
    });

    const total = Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;

    return total;
  } catch (error) {
    console.error("Erro ao buscar total de sessões do dia:", error);
    return 0; // fallback
  }
};

/**
 * Busca o valor total das sessões do dia
 * @param {number} userId
 * @param {number} day
 * @param {number} month
 * @param {number} year
 * @returns {Promise<number>} Valor total
 */
export const getTotalSessionsValueOfDay = async (userId, day, month, year) => {
  try {
    const response = await api.get("/api/dashboard/sessions/value/day", {
      params: { userId, day, month, year }
    });

    const total = Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;

    return total;
  } catch (error) {
    console.error("Erro ao buscar valor total das sessões do dia:", error);
    return 0; // fallback
  }
};

/**
 * Busca o valor total das sessões do mês
 * @param {number} userId
 * @param {number} month
 * @param {number} year
 * @returns {Promise<number>} Valor total do mês
 */
export const getTotalSessionsValueOfMonth = async (userId, month, year) => {
  try {
    const response = await api.get("/api/dashboard/sessions/value/month", {
      params: { userId, month, year }
    });

    const total = Array.isArray(response.data)
      ? response.data.reduce((acc, item) => acc + Number(item.total || 0), 0)
      : 0;

    return total;
  } catch (error) {
    console.error("Erro ao buscar valor total das sessões do mês:", error);
    return 0; // fallback
  }
};
