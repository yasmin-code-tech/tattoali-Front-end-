// src/routes/PublicOnlyRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function PublicOnlyRoute({ children }) {
  const { token, isBooting } = useAuth();
  const location = useLocation();
  
  if (isBooting) return null;
  
  // Permite acesso às rotas de reset de senha mesmo com token (para reset de senha via email)
  if (location.pathname === "/alterar-senha" || location.pathname === "/reset-password") {
    return children;
  }
  
  return token ? <Navigate to="/agenda" replace /> : children;
}
