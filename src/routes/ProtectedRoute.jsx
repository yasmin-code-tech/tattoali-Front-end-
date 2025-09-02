import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function ProtectedRoute() {
  const { token, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return <div style={{ padding: 24, color: "white" }}>Carregando…</div>;
  }

  return token
    ? <Outlet />                 // ✅ libera todas as rotas-filhas
    : <Navigate to="/login" replace state={{ from: location }} />;
}
