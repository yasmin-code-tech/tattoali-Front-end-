import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

export default function Cadastro() {
  const { register } = useAuth();

  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    contato: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    documento: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setSubmitError("");
    setSuccess("");
  };

  // ✅ Campo de documento (apenas dígitos, máx 14)
  const handleDocumentChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const limitedValue = value.slice(0, 14);
    setForm((prev) => ({ ...prev, documento: limitedValue }));
    setErrors((prev) => ({ ...prev, documento: "" }));
    setSubmitError("");
    setSuccess("");
  };

  // ✅ Função para formatar e validar o telefone
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    const limitedValue = value.slice(0, 11);
    setForm((prev) => ({ ...prev, contato: limitedValue }));
    setErrors((prev) => ({ ...prev, contato: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.nome.trim()) errs.nome = "Informe o nome.";
    if (!form.sobrenome.trim()) errs.sobrenome = "Informe o sobrenome.";

    if (!form.email.trim()) errs.email = "Informe o e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "E-mail inválido.";

    if (!form.senha || form.senha.length < 6)
      errs.senha = "A senha deve ter no mínimo 6 caracteres.";

    if (form.senha !== form.confirmarSenha)
      errs.confirmarSenha = "As senhas não coincidem.";

    // Mantive sua regra: 11 (CPF) OU 14 (CNPJ).
    // Se quiser forçar só CPF (11), troque a condição.
    
    // ✅ Validação de nome: apenas letras e espaços, mínimo 2 caracteres
    if (!form.nome.trim()) {
      errs.nome = "Informe o nome.";
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(form.nome)) {
      errs.nome = "Nome deve conter apenas letras (mín. 2 caracteres).";
    }
    
    // ✅ Validação de sobrenome: apenas letras e espaços, mínimo 2 caracteres
    if (!form.sobrenome.trim()) {
      errs.sobrenome = "Informe o sobrenome.";
    } else if (!/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(form.sobrenome)) {
      errs.sobrenome = "Sobrenome deve conter apenas letras (mín. 2 caracteres).";
    }
    
    // ✅ Validação de email
    if (!form.email.trim()) {
      errs.email = "Informe o e-mail.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "E-mail inválido.";
    }
    
    // ✅ Validação de telefone (opcional): 10 ou 11 dígitos
    if (form.contato && !/^[0-9]{10,11}$/.test(form.contato)) {
      errs.contato = "Telefone inválido (10 ou 11 dígitos).";
    }
    
    // ✅ Validação de senha: mínimo 6 caracteres, pelo menos 1 letra e 1 número
    if (!form.senha) {
      errs.senha = "Informe a senha.";
    } else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.senha)) {
      errs.senha = "A senha deve ter pelo menos 6 caracteres, incluindo letras e números.";
    }
    
    // ✅ Validação de confirmação de senha
    if (form.senha !== form.confirmarSenha) {
      errs.confirmarSenha = "As senhas não coincidem.";
    }
    
    // ✅ Validação de documento: 11 (CPF) ou 14 (CNPJ) dígitos
    if (!form.documento.trim()) {
      errs.documento = "Informe o CPF ou CNPJ.";
    } else if (!/(^\d{11}$)|(^\d{14}$)/.test(form.documento)) {
      errs.documento = "Documento inválido (11 dígitos para CPF ou 14 para CNPJ).";
    }

    if (form.contato && form.contato.length < 8)
      errs.contato = "Contato muito curto (mín. 8 dígitos).";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    setSubmitError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      // Mapeia para o formato do backend
      await register({
        nome: form.nome,
        sobrenome: form.sobrenome,
        cpf: form.documento,        // 👈 back espera "cpf"
        email: form.email,
        password: form.senha,       // 👈 será enviado como "senha" no AuthProvider
        telefone: form.contato || undefined, // opcional
      });

      // Se o back só retorna mensagem e o AuthProvider navega para /login,
      // este success pode nem aparecer, mas deixei caso mude o fluxo
      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login…");
    } catch (err) {
      setSubmitError(err.message || "Falha no cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <Link
        to="/login"
        className="absolute top-6 left-6 text-gray-300 hover:text-white transition"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cadastro</h1>
          <p className="text-gray-400">Preencha seus dados para começar</p>
        </div>

        <div className="card p-8 rounded-2xl">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">Nome</label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className={`input-field w-full px-4 py-3 rounded-lg ${errors.nome ? "border-red-600" : ""}`}
                  placeholder="Seu nome"
                  autoComplete="given-name"
                />
                {errors.nome && <p className="mt-1 text-sm text-red-500">{errors.nome}</p>}
                <input 
                  type="text" 
                  name="nome" 
                  value={form.nome} 
                  onChange={handleChange} 
                  className={`input-field w-full px-4 py-3 rounded-lg ${errors.nome ? "border-red-600" : ""}`} 
                  placeholder="Seu nome" 
                />
                {errors.nome && (<p className="mt-1 text-sm text-red-500">{errors.nome}</p>)}
              </div>

              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">Sobrenome</label>
                <input
                  type="text"
                  name="sobrenome"
                  value={form.sobrenome}
                  onChange={handleChange}
                  className={`input-field w-full px-4 py-3 rounded-lg ${errors.sobrenome ? "border-red-600" : ""}`}
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                />
                {errors.sobrenome && <p className="mt-1 text-sm text-red-500">{errors.sobrenome}</p>}
                <input 
                  type="text" 
                  name="sobrenome" 
                  value={form.sobrenome} 
                  onChange={handleChange} 
                  className={`input-field w-full px-4 py-3 rounded-lg ${errors.sobrenome ? "border-red-600" : ""}`} 
                  placeholder="Seu sobrenome"
                />
                {errors.sobrenome && (<p className="mt-1 text-sm text-red-500">{errors.sobrenome}</p>)}
              </div>
            </div>

            {/* CPF/CNPJ */}
            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">CPF ou CNPJ</label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleDocumentChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.documento ? "border-red-600" : ""}`}
                placeholder="Apenas números"
                inputMode="numeric"
                autoComplete="off"
              />
              {errors.documento && <p className="mt-1 text-sm text-red-500">{errors.documento}</p>}
            </div>

            {/* Contato */}
            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">Contato (opcional)</label>
              <input
                type="text"
                name="contato"
                value={form.contato}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.contato ? "border-red-600" : ""}`}
                placeholder="(DDD) 90000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
              {errors.contato && <p className="mt-1 text-sm text-red-500">{errors.contato}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">E-mail</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.email ? "border-red-600" : ""}`}
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Senhas */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Senha</label>
              <input
                type={showPass ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.senha ? "border-red-600" : ""}`}
                placeholder="Crie uma senha"
                autoComplete="new-password"
              />
              {errors.senha && <p className="mt-1 text-sm text-red-500">{errors.senha}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirmar Senha</label>
              <input
                type={showPass ? "text" : "password"}
                name="confirmarSenha"
                value={form.confirmarSenha}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.confirmarSenha ? "border-red-600" : ""}`}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
              />
              {errors.confirmarSenha && <p className="mt-1 text-sm text-red-500">{errors.confirmarSenha}</p>}
            </div>

            {/* Mostrar/ocultar senha */}
            <div className="text-left">
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}/>
              <input 
                type="text" 
                name="contato" 
                value={form.contato} 
                onChange={handlePhoneChange} 
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.contato ? "border-red-600" : ""}`} 
                placeholder="Apenas números com DDD"
                inputMode="numeric"
              />
              
              {errors.contato && (<p className="mt-1 text-sm text-red-500">{errors.contato}</p>)}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">E-mail</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.email ? "border-red-600" : ""}`} 
                placeholder="seu@email.com"
              />
              {errors.email && (<p className="mt-1 text-sm text-red-500">{errors.email}</p>)}
            </div>
            
            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Senha</label>
              <input 
                type={showPass ? "text" : "password"} 
                name="senha" 
                value={form.senha} 
                onChange={handleChange} 
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.senha ? "border-red-600" : ""}`} 
                placeholder="Crie uma senha"
              />
              {errors.senha && (<p className="mt-1 text-sm text-red-500">{errors.senha}</p>)}
            </div>
            
            {/* Confirmar Senha */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Confirmar Senha</label>
              <input 
                type={showPass ? "text" : "password"} 
                name="confirmarSenha" 
                value={form.confirmarSenha} 
                onChange={handleChange} 
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.confirmarSenha ? "border-red-600" : ""}`} 
                placeholder="Confirme sua senha"
              />
              {errors.confirmarSenha && (<p className="mt-1 text-sm text-red-500">{errors.confirmarSenha}</p>)}
            </div>
            
            <div className="text-left">
              <button 
                type="button" 
                onClick={() => setShowPass((s) => !s)} 
                className="text-sm text-gray-300 hover:text-white"
              >
                {showPass ? "Ocultar senhas" : "Mostrar senhas"}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 rounded-lg font-semibold text-base disabled:opacity-60"
            >
              {submitting ? "Criando conta..." : "Criar conta"}
            </button>

            {/* Feedback */}
            {submitError && <div className="mt-2 text-sm text-red-400">{submitError}</div>}
            {success && <div className="mt-2 text-sm text-green-400">{success}</div>}
            
            <button 
              type="submit" 
              className="btn-primary w-full py-3 rounded-lg font-semibold text-base"
            >
              Criar conta
            </button>
            
            {success && (<div className="mt-2 text-sm text-green-400">{success}</div>)}
          </form>
        </div>
      </div>
    </div>
  );
}
