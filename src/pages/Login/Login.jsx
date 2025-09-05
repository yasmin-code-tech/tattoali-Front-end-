import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
//import { useEffect } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

//   useEffect(() => {
//   if (isAuthenticated) {
//     navigate("/agenda", { replace: true });
//   }
// }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      
      await login({ email, password: senha });

      const redirectTo = location.state?.from || "/agenda";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.data?.message || "Falha no login. Verifique suas credenciais.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gestor TattooAli</h1>
          <p className="text-gray-400">Plataforma de gestão profissional</p>
        </div>

        {/* Card */}
        <div className="card p-8 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-white mb-2 text-left">
                Usuário
              </label>
              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2 text-left">
                Senha
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 rounded-lg font-semibold text-lg disabled:opacity-60"
            >
              {submitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          {/* Barra de Criar Conta */}
          <div className="mt-6 text-center border-t border-gray-700 pt-4">
            <span className="text-gray-400">Não tem conta?</span>{" "}
            <Link to="/cadastro" className="text-red-500 hover:underline">
              Criar conta
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
