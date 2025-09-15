// src/auth/AuthProvider.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context";

// ✅ usa seu cliente centralizado e o storage unificado
import { api } from "../lib/api";
import { loadAuth, saveAuth, clearAuth } from "./auth-storage";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const navigate = useNavigate();

  // Hidrata sessão ao iniciar o app
  useEffect(() => {
    const auth = loadAuth(); 
    if (auth?.token) {
      setToken(auth.token);
      setUser(auth.user || null);
    }
    setIsBooting(false);
  }, []);

  // LOGIN via lib/api
  async function login({ email, password }) {
    try {
      const data = await api.post("/api/user/login", { email, senha: password });

      const jwt =
        data?.token ||
        data?.accessToken ||
        data?.jwt ||
        data?.data?.token ||
        data?.data?.accessToken ||
        data?.data?.jwt;

      if (!jwt) {
        console.log("[Auth] login: resposta sem token:", data);
        throw new Error("Token não retornado pelo servidor.");
      }

      const authToSave = {
        token: jwt,
        refreshToken: data?.refreshToken,
        user: data?.user || null,
      };
      saveAuth(authToSave);

      setToken(jwt);
      setUser(authToSave.user);
      navigate("/agenda", { replace: true });
    } catch (err) {
      clearAuth();
      const msg =
        err?.data?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha no login.";
      console.error("[Auth] erro no login:", err);
      throw new Error(msg);
    }
  }

  // REGISTER via lib/api
  async function register({ nome, sobrenome, cpf, email, password, telefone }) {
    try {
      const body = {
        nome,
        sobrenome,
        cpf,
        email,
        senha: password,              
        ...(telefone ? { telefone } : {}),
      };

      const res = await api.post("/api/user/register", body);

      if (!res?.message) {
        console.log("[Auth] register: resposta inesperada:", res);
      }

      navigate("/login", { replace: true });
      return res;
    } catch (err) {
      const msg =
        err?.data?.error ||
        err?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Falha no registro.";
      console.error("[Auth] erro no registro:", err);
      throw new Error(msg);
    }
  }

  function logout() {
    clearAuth();
    setUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  }

  const value = {
    token,
    user,
    isBooting,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
