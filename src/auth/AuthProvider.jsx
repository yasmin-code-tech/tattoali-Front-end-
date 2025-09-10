// src/auth/AuthProvider.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./context";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser]   = useState(null);
  const [isBooting, setIsBooting] = useState(true);
  const navigate = useNavigate();

  // Hidrata token do localStorage ao iniciar o app
  useEffect(() => {
    const t = localStorage.getItem("authToken");
    if (t) {
      setToken(t);
      axios.defaults.headers.common.Authorization = `Bearer ${t}`;
      // opcional: buscar /me e setar user aqui
    }
    setIsBooting(false);
  }, []);

  async function register({ nome, sobrenome, cpf, email, password, telefone }) {
  try {
    const res = await axios.post("http://localhost:3000/api/user/register", {
      nome,
      sobrenome,
      cpf,
      email,
      senha: password,   // 👈 o back espera "senha"
      telefone,          // 👈 opcional
    });

    // se o back retornar mensagem de sucesso
    if (res.data?.message) {
      console.log(res.data.message);
      navigate("/login", { replace: true });
    }
  } catch (err) {
    console.error("[Auth] erro no registro", err);
    const msg =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err.message ||
      "Falha no registro.";
    throw new Error(msg);
  }
}

  // src/auth/AuthProvider.jsx (trecho do login)
// async function login({ email, password }) {
//   try {
//     // ⚠️ seu back recebe 'senha'
//     const res = await axios.post("http://localhost:3000/api/user/login", {
//       email,
//       senha: password,
//     });

//     // 🔎 tente várias chaves comuns / formatos aninhados
//     const jwt =
//       res.data?.token ??
//       res.data?.accessToken ??
//       res.data?.jwt ??
//       res.data?.data?.token ??
//       res.data?.data?.accessToken ??
//       res.data?.data?.jwt;

//     if (!jwt) {
//       // não salva nada se não houver token; loga p/ inspecionar a resposta
//       console.log("[Auth] login response sem token:", res.data);
//       throw new Error("Token não retornado pelo servidor.");
//     }

//     localStorage.setItem("authToken", jwt);
//     axios.defaults.headers.common.Authorization = `Bearer ${jwt}`;

//     setToken(jwt);
//     // opcional:
//     // const me = await axios.get("http://localhost:3000/api/user/me");
//     // setUser(me.data);

//     navigate("/agenda", { replace: true });
//   } catch (err) {
//     // garante que não fica lixo no storage se falhar
//     localStorage.removeItem("authToken");
//     delete axios.defaults.headers.common.Authorization;

//     const msg = err?.response?.data?.message || err.message || "Falha no login.";
//     console.error("[Auth] erro no login:", err);
//     throw new Error(msg);
//   }
// }



  // MOCK de login (troque por chamada real quando tiver backend)
   async function loginMock() {
     const fake = "fake-token-123";
    localStorage.setItem("authToken", fake);
   setToken(fake);
   axios.defaults.headers.common.Authorization = `Bearer ${fake}`;
    navigate("/agenda", { replace: true });
  }

  function logout() {
    localStorage.removeItem("authToken");
    delete axios.defaults.headers.common.Authorization;
    setUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  }

  const value = {
    token,
    user,
    isBooting,
    login: loginMock,
    // login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
