// src/auth/AuthProvider.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./context";

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

//   async function login({ email, password }) {
//   try {
//     const res = await axios.post("http://localhost:3000/auth/login", {
//       email,
//       password,
//     });

//     const { token } = res.data; // backend deve retornar { token: "..." }
//     localStorage.setItem("authToken", token);
//     setToken(token);
//     axios.defaults.headers.common.Authorization = `Bearer ${token}`;

//     // opcional: buscar dados do usuário
//     // const me = await axios.get("http://localhost:3000/auth/me");
//     // setUser(me.data);

//     navigate("/agenda", { replace: true });
//   } catch (err) {
//     console.error("[Auth] erro no login", err);
//     throw err;
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
    //login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
