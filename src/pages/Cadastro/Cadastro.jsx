import { useState } from "react";
import { Link } from "react-router-dom";

export default function Cadastro() {
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ✅ Função específica para o campo de documento
  const handleDocumentChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove não-dígitos
    const limitedValue = value.slice(0, 14); // Limita em 14 caracteres
    setForm((prev) => ({ ...prev, documento: limitedValue }));
    setErrors((prev) => ({ ...prev, documento: "" }));
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

    // ✅ Validação de documento mais robusta
    if (!form.documento.trim()) {
      errs.documento = "Informe o CPF ou CNPJ.";
    } else if (form.documento.length !== 11 && form.documento.length !== 14) {
      errs.documento = "O documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos.";
    }

    if (form.contato && form.contato.length < 8)
      errs.contato = "Contato muito curto (mín. 8 dígitos).";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    console.log("Cadastro enviado:", form);
    setSuccess("Cadastro realizado com sucesso!");
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
              {/* Nome e Sobrenome aqui... */}
              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">Nome</label>
                <input type="text" name="nome" value={form.nome} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.nome ? "border-red-600" : ""}`} placeholder="Seu nome" />
                {errors.nome && (<p className="mt-1 text-sm text-red-500">{errors.nome}</p>)}
              </div>
              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">Sobrenome</label>
                <input type="text" name="sobrenome" value={form.sobrenome} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.sobrenome ? "border-red-600" : ""}`} placeholder="Seu sobrenome"/>
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
                onChange={handleDocumentChange} // ✅ Usando a nova função
                className={`input-field w-full px-4 py-3 rounded-lg ${errors.documento ? "border-red-600" : ""}`}
                placeholder="Apenas números"
                inputMode="numeric"
              />
              {errors.documento && (<p className="mt-1 text-sm text-red-500">{errors.documento}</p>)}
            </div>

            {/* Contato, Email, Senha, Confirmar Senha aqui... */}
            <div>
                <label className="block text-left text-sm font-medium text-white mb-2">Contato (opcional)</label>
                <input type="text" name="contato" value={form.contato} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.contato ? "border-red-600" : ""}`} placeholder="(DDD) 90000-0000"/>
                {errors.contato && (<p className="mt-1 text-sm text-red-500">{errors.contato}</p>)}
            </div>
            <div>
                <label className="block text-left text-sm font-medium text-white mb-2">E-mail</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.email ? "border-red-600" : ""}`} placeholder="seu@email.com"/>
                {errors.email && (<p className="mt-1 text-sm text-red-500">{errors.email}</p>)}
            </div>
            <div>
                <label className="block text-sm font-medium text-white mb-2">Senha</label>
                <input type={showPass ? "text" : "password"} name="senha" value={form.senha} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.senha ? "border-red-600" : ""}`} placeholder="Crie uma senha"/>
                {errors.senha && (<p className="mt-1 text-sm text-red-500">{errors.senha}</p>)}
            </div>
            <div>
                <label className="block text-sm font-medium text-white mb-2">Confirmar Senha</label>
                <input type={showPass ? "text" : "password"} name="confirmarSenha" value={form.confirmarSenha} onChange={handleChange} className={`input-field w-full px-4 py-3 rounded-lg ${errors.confirmarSenha ? "border-red-600" : ""}`} placeholder="Confirme sua senha"/>
                {errors.confirmarSenha && (<p className="mt-1 text-sm text-red-500">{errors.confirmarSenha}</p>)}
            </div>
            <div className="text-left">
                <button type="button" onClick={() => setShowPass((s) => !s)} className="text-sm text-gray-300 hover:text-white">{showPass ? "Ocultar senhas" : "Mostrar senhas"}</button>
            </div>
            <button type="submit" className="btn-primary w-full py-3 rounded-lg font-semibold text-base">Criar conta</button>
            {success && (<div className="mt-2 text-sm text-green-400">{success}</div>)}
          </form>
        </div>
      </div>
    </div>
  );
}