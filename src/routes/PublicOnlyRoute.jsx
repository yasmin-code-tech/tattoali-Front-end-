// src/routes/PublicOnlyRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function PublicOnlyRoute({ children }) {
  const { token, isBooting } = useAuth();
  if (isBooting) return null;
  return token ? <Navigate to="/agenda" replace /> : children;
}
