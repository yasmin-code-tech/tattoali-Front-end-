import { loadAuth, clearAuth, saveAuth } from "../auth/auth-storage";

const baseURL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

const USE_MOCK = String(import.meta?.env?.VITE_USE_MOCK_AUTH || "").trim().toLowerCase() === "true";

console.debug("[api] VITE_USE_MOCK_AUTH raw =", import.meta.env.VITE_USE_MOCK_AUTH);
console.debug("[api] USE_MOCK computed =", USE_MOCK);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let refreshing = null;


export async function apiFetch(path, options = {}) {
  console.debug("[apiFetch] USE_MOCK:", USE_MOCK, "path:", path, "method:", options.method || "GET");

  if (USE_MOCK) {
    return mockApiFetch(path, options);
  }

  const url = path.startsWith("http") ? path : baseURL + path;

 
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  
  const auth = loadAuth(); // { token, refreshToken, user? }
  console.log('Auth carregado:', auth);
  if (auth?.token) {
    headers.set("Authorization", `Bearer ${auth.token}`);
    console.log('Token adicionado ao header:', auth.token);
  }


  const init = {
    method: options.method || "GET",
    headers,
    body:
      options.body instanceof FormData
        ? options.body
        : options.body && typeof options.body !== "string"
          ? JSON.stringify(options.body)
          : options.body,
    signal: options.signal,
  };

  console.log('Fazendo requisição para:', url);
  console.log('Headers:', Object.fromEntries(headers.entries()));
  console.log('Body:', options.body);
  
  let res = await fetch(url, init);
  console.log('Resposta recebida:', res.status, res.statusText);
  
  if (res.status === 401 && auth?.refreshToken) {
    try {
      await ensureRefreshToken(auth.refreshToken);
      const newAuth = loadAuth();
      const retryHeaders = new Headers(headers);
      if (newAuth?.token) retryHeaders.set("Authorization", `Bearer ${newAuth.token}`);
      res = await fetch(url, { ...init, headers: retryHeaders });
    } catch {
      clearAuth();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      throw await toApiError(res);
    }
  }


  if (!res.ok) {
    console.log('Erro na resposta:', res.status, res.statusText);
    throw await toApiError(res);
  }
  
  const body = await parseBody(res);
  console.log('Corpo da resposta:', body);
  return body;
}

export const api = {
  get: (p, opt) => apiFetch(p, { ...opt, method: "GET" }),
  post: (p, body, opt) => apiFetch(p, { ...opt, method: "POST", body }),
  put: (p, body, opt) => apiFetch(p, { ...opt, method: "PUT", body }),
  patch: (p, body, opt) => apiFetch(p, { ...opt, method: "PATCH", body }),
  del: (p, opt) => apiFetch(p, { ...opt, method: "DELETE" }),
};


async function ensureRefreshToken(refreshToken) {
  if (!refreshing) {
    refreshing = doRefresh(refreshToken)
      .catch((e) => {
        throw e;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

async function doRefresh(refreshToken) {
  const res = await fetch(baseURL + "/api/user/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw await toApiError(res);
  }

  const data = await parseBody(res);
  const newToken =
    data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
  const newRefresh = data?.refreshToken || data?.data?.refreshToken || refreshToken;

  if (!newToken) {
    throw new Error("Refresh falhou: token ausente.");
  }

  // salva no storage (você precisa expor saveAuth no auth-storage)
  const current = loadAuth() || {};
  saveAuth({ ...current, token: newToken, refreshToken: newRefresh });
  return newToken;
}

/**
 * Parse genérico de corpo (json/text)
 */
async function parseBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

/**
 * Converte Response em Error com status e data
 */
async function toApiError(res) {
  const body = await parseBody(res);
  const err = new Error(body?.message || body?.error ||`HTTP ${res.status}`);
  err.status = res.status;
  err.data = body;
  return err;
}

/** -------------------- MOCKS -------------------- **/
async function mockApiFetch(path, options = {}) {
  await sleep(400 + Math.random() * 200);

  const method = (options.method || "GET").toUpperCase();
  const auth = loadAuth();

  // ajuste paths mockados conforme seus componentes
  if ((path === "/auth/login" || path === "/api/user/login") && method === "POST") {
    const body = safeParse(options.body) || {};
    const email = body.email || "demo@tattooali.com";
    if (!body.senha || String(body.senha).length < 3) {
      const err = new Error("Credenciais inválidas (mock)");
      err.status = 401;
      err.data = { message: "Credenciais inválidas (mock)" };
      throw err;
    }
    return {
      token: "mock-token-123",
      refreshToken: "mock-refresh-456",
      user: { id: "1", name: email.split("@")[0], email },
    };
  }

  if ((path === "/auth/me" || path === "/api/user/me") && method === "GET") {
    if (!auth?.token) {
      const err = new Error("Não autenticado (mock)");
      err.status = 401;
      err.data = { message: "Não autenticado (mock)" };
      throw err;
    }
    return auth.user || { id: "1", name: "Tatuador", email: "demo@tattooali.com" };
  }

  if ((path === "/auth/refresh" || path === "/api/user/refresh") && method === "POST") {
    return { token: "mock-token-123-refreshed", refreshToken: "mock-refresh-456" };
  }

  // Mock para recuperação de senha
  if ((path === "/auth/forgot-password" || path === "/api/user/forgot-password") && method === "POST") {
    const body = safeParse(options.body) || {};
    const email = body.email;
    
    if (!email) {
      const err = new Error("E-mail é obrigatório");
      err.status = 400;
      err.data = { message: "E-mail é obrigatório" };
      throw err;
    }

    // Simula envio de e-mail de recuperação
    return { 
      message: "Instruções para redefinir sua senha foram enviadas para o seu e-mail.",
      success: true 
    };
  }

  // Mock para clientes
  if (path === "/api/client" && method === "GET") {
    if (!auth?.token) {
      const err = new Error("Não autenticado (mock)");
      err.status = 401;
      err.data = { message: "Não autenticado (mock)" };
      throw err;
    }
    return [
      { client_id: 1, nome: "João Silva", telefone: "(11) 99999-1111", descricao: "Cliente VIP" },
      { client_id: 2, nome: "Maria Souza", telefone: "(11) 88888-2222", descricao: "Prefere manhã" },
      { client_id: 3, nome: "Carlos Oliveira", telefone: "(11) 77777-3333", descricao: "Primeira tatuagem" }
    ];
  }

  // Mock para sessões
  if (path.startsWith("/api/sessions") && method === "GET") {
    if (!auth?.token) {
      const err = new Error("Não autenticado (mock)");
      err.status = 401;
      err.data = { message: "Não autenticado (mock)" };
      throw err;
    }
    return [];
  }

  return null;
}

function safeParse(x) {
  try {
    if (x instanceof FormData) return null;
    return typeof x === "string" ? JSON.parse(x) : x;
  } catch {
    return null;
  }
}