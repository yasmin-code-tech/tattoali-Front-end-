import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute"; // opcional

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";

import Agenda from "./pages/Agenda/Agenda";
// importe outras páginas privadas quando criar
// import Clientes from "./Pages/Clientes/Clientes";
// import Dashboard from "./Pages/Dashboard/Dashboard";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* raiz manda pro login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* públicas */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/cadastro"
            element={
              <PublicOnlyRoute>
                <Cadastro />
              </PublicOnlyRoute>
            }
          />
          {/* grupo de PRIVADAS */}
          <Route element={<ProtectedRoute />}>
            <Route path="/agenda" element={<Agenda />} />
            {/* adicione privadas aqui */}
            {/* <Route path="/clientes" element={<Clientes />} /> */}
            {/* <Route path="/dashboard" element={<Dashboard />} /> */}
          </Route>


          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
