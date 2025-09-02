// src/lib/api.js
import { loadAuth, clearAuth } from "../auth/auth-storage";

const baseURL = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:3000";
const USE_MOCK = import.meta?.env?.VITE_USE_MOCK_AUTH === "true";

console.log("[api] USE_MOCK =", USE_MOCK);
console.log("[api] VITE_USE_MOCK_AUTH =", import.meta.env.VITE_USE_MOCK_AUTH);
 // deve imprimir true quando o mock estiver ON

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function apiFetch(path, options = {}) {
  if (USE_MOCK) {
    return mockApiFetch(path, options);
  }

  // --- modo real (quando tiver backend) ---
  const auth = loadAuth();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (auth?.token) headers.set("Authorization", `Bearer ${auth.token}`);

  const res = await fetch(baseURL + path, { ...options, headers });

  if (res.status === 401) clearAuth();

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const err = new Error(data?.message || "Erro na requisição");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** -------------------- MOCKS -------------------- **/
async function mockApiFetch(path, options = {}) {
  await sleep(400 + Math.random() * 200);

  const method = (options.method || "GET").toUpperCase();
  const auth = loadAuth();

  if (path === "/auth/login" && method === "POST") {
    const body = safeParse(options.body) || {};
    const email = body.email || "demo@tattooali.com";
    const name = email.split("@")[0];

    if (!body.password || String(body.password).length < 3) {
      const err = new Error("Credenciais inválidas (mock)");
      err.status = 401;
      err.data = { message: "Credenciais inválidas (mock)" };
      throw err;
    }

    return {
      token: "mock-token-123",
      user: { id: "1", name: capitalize(name), email },
    };
  }

  if (path === "/auth/me" && method === "GET") {
    if (!auth?.token) {
      const err = new Error("Não autenticado (mock)");
      err.status = 401;
      err.data = { message: "Não autenticado (mock)" };
      throw err;
    }
    return auth.user || { id: "1", name: "Tatuador", email: "demo@tattooali.com" };
  }

  return null;
}

function safeParse(x) {
  try { return typeof x === "string" ? JSON.parse(x) : x; } catch { return null; }
}
function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}
