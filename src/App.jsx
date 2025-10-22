import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from "./auth/AuthProvider";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

import Login from "./pages/Login/Login";
import Cadastro from "./pages/Cadastro/Cadastro";
import Agenda from "./pages/Agenda/Agenda";
import Perfil from "./pages/Perfil/Perfil";
import Clientes from "./pages/Clientes/Clientes";
import Dashboard from "./pages/Dashboard/Dashboard";
import GeradorImagem from "./pages/GeradorImagem/GeradorImagem";

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
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/gerador-imagem" element={<GeradorImagem />} />
            <Route path="/dashboard" element={<Dashboard />} /> 

          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
                <ToastContainer
          position="top-right"
          autoClose={3000} 
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark" 
        />
      </AuthProvider>
    </Router>
  );
}