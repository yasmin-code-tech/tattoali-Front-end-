import { useState, useMemo } from "react";
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
    dataNascimento: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  // Removido fluxo em etapas: todos os campos na mesma página

  // Helpers: CPF/CNPJ validation
  const onlyDigits = (v) => (v || "").replace(/\D/g, "");

  const isValidCPF = (cpf) => {
    const s = onlyDigits(cpf);
    if (!s || s.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(s)) return false;
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i)) * (10 - i);
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(s.charAt(9))) return false;
    sum = 0;
    for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i)) * (11 - i);
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    return rev === parseInt(s.charAt(10));
  };

  const isValidCNPJ = (cnpj) => {
    const c = onlyDigits(cnpj);
    if (!c || c.length !== 14) return false;
    if (/^(\d)\1+$/.test(c)) return false;

    const peso1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    const peso2 = [6, ...peso1];

    const calcularDigito = (base, pesos) => {
      const soma = base.split("").reduce((acc, val, i) => acc + parseInt(val) * pesos[i], 0);
      const resto = soma % 11;
      return resto < 2 ? 0 : 11 - resto;
    };

    const base = c.slice(0, 12);
    const dig1 = calcularDigito(base, peso1);
    const dig2 = calcularDigito(base + String(dig1), peso2);

    return c.slice(12) === `${dig1}${dig2}`;
  };

  const validateDocumentoAlg = (value) => {
    const v = onlyDigits(value);
    if (!v) return "Informe o CPF ou CNPJ.";
    if (v.length === 11) return isValidCPF(v) ? "" : "CPF inválido.";
    if (v.length === 14) return isValidCNPJ(v) ? "" : "CNPJ inválido.";
    return "Documento inválido (11 dígitos para CPF ou 14 para CNPJ).";
  };

  // Phone mask and validation
  const formatPhoneBR = (digits) => {
    const d = onlyDigits(digits).slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  const isValidPhoneBR = (value) => {
    const d = onlyDigits(value);
    return /^\d{10,11}$/.test(d);
  };

  // Password strength
  const passwordScore = useMemo(() => {
    const p = form.senha || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score; // 0..5
  }, [form.senha]);

  const passwordStrengthLabel = ["Muito fraca", "Fraca", "Ok", "Boa", "Forte", "Excelente"][passwordScore] || "";

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    // Real-time field-level validation
    const name = e.target.name;
    setErrors((prev) => ({ ...prev, [name]: fieldValidate(name, e.target.value) }));
    setSubmitError("");
    setSuccess("");
  };

  // ✅ Campo de documento (apenas dígitos, máx 14)
  const handleDocumentChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 14);
    setForm((prev) => ({ ...prev, documento: value }));
    setErrors((prev) => ({ ...prev, documento: validateDocumentoAlg(value) }));
    setSubmitError("");
    setSuccess("");
  };

  // ✅ Campo de contato (apenas dígitos, máx 11)
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const digits = onlyDigits(raw).slice(0, 11);
    const masked = formatPhoneBR(digits);
    setForm((prev) => ({ ...prev, contato: masked }));
    setErrors((prev) => ({ ...prev, contato: digits ? (isValidPhoneBR(digits) ? "" : "Telefone inválido (10 ou 11 dígitos).") : "" }));
  };

  const isAdult = (isoDate) => {
    if (!isoDate) return false;
    const birth = new Date(isoDate + "T00:00:00");
    if (isNaN(birth.getTime())) return false;
    const today = new Date();
    const eighteen = new Date(birth.getFullYear() + 18, birth.getMonth(), birth.getDate());
    return today >= eighteen;
  };

  const fieldValidate = (name, value) => {
    switch (name) {
      case "nome":
        if (!value.trim() || !/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(value)) return "Nome deve conter apenas letras (mín. 2 caracteres).";
        return "";
      case "sobrenome":
        if (!value.trim() || !/^[a-zA-ZÀ-ÿ\s]{2,}$/.test(value)) return "Sobrenome deve conter apenas letras (mín. 2 caracteres).";
        return "";
      case "email":
        if (!value.trim()) return "Informe o e-mail.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "E-mail inválido.";
        return "";
      case "senha":
        if (!value) return "Informe a senha.";
        if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(value)) return "A senha deve ter pelo menos 6 caracteres, incluindo letras e números.";
        return form.confirmarSenha && value !== form.confirmarSenha ? "As senhas não coincidem." : "";
      case "confirmarSenha":
        if (value !== form.senha) return "As senhas não coincidem.";
        return "";
      case "documento":
        return validateDocumentoAlg(value);
      case "contato":
        if (!value) return "";
        return isValidPhoneBR(value) ? "" : "Telefone inválido (10 ou 11 dígitos).";
      case "dataNascimento":
        if (!value) return "Informe a data de nascimento.";
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Data no formato AAAA-MM-DD (ano com 4 dígitos).";
        return isAdult(value) ? "" : "É necessário ter 18 anos ou mais.";
      default:
        return "";
    }
  };

  const validate = () => {
    const errs = {};

    errs.nome = fieldValidate("nome", form.nome) || "";
    errs.sobrenome = fieldValidate("sobrenome", form.sobrenome) || "";
    errs.documento = fieldValidate("documento", form.documento) || "";
    errs.dataNascimento = fieldValidate("dataNascimento", form.dataNascimento) || "";
    errs.email = fieldValidate("email", form.email) || "";
    errs.contato = fieldValidate("contato", form.contato) || "";
    errs.senha = fieldValidate("senha", form.senha) || "";
    errs.confirmarSenha = fieldValidate("confirmarSenha", form.confirmarSenha) || "";

    Object.keys(errs).forEach((k) => { if (!errs[k]) delete errs[k]; });
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
        cpf: form.documento,
        email: form.email,
        password: form.senha,
        telefone: onlyDigits(form.contato) || undefined,
      });

      setSuccess("Cadastro realizado com sucesso! Redirecionando para o login…");
    } catch (err) {
      setSubmitError(err.message || "Falha no cadastro.");
    } finally {
      setSubmitting(false);
    }
  };

  // Removido canGoNext (wizard)

  const StrengthBar = () => (
    <div className="mt-2">
      <div className="h-2 bg-gray-700 rounded">
        <div
          className={`h-2 rounded ${passwordScore >= 4 ? "bg-green-500" : passwordScore >= 2 ? "bg-yellow-500" : "bg-red-500"}`}
          style={{ width: `${(passwordScore/5)*100}%` }}
        />
      </div>
      {form.senha ? (
        <div className="text-xs text-gray-300 mt-1">Força da senha: {passwordStrengthLabel}</div>
      ) : null}
    </div>
  );

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
              {/* Nome */}
              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className={`input-field w-full px-4 py-3 rounded-lg ${
                    errors.nome ? "border-red-600" : ""
                  }`}
                  placeholder="Seu nome"
                  autoComplete="given-name"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-500">{errors.nome}</p>
                )}
              </div>

              {/* Sobrenome */}
              <div>
                <label className="block text-left text-sm font-medium text-white mb-2">
                  Sobrenome
                </label>
                <input
                  type="text"
                  name="sobrenome"
                  value={form.sobrenome}
                  onChange={handleChange}
                  className={`input-field w-full px-4 py-3 rounded-lg ${
                    errors.sobrenome ? "border-red-600" : ""
                  }`}
                  placeholder="Seu sobrenome"
                  autoComplete="family-name"
                />
                {errors.sobrenome && (
                  <p className="mt-1 text-sm text-red-500">{errors.sobrenome}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">
                CPF ou CNPJ
              </label>
              <input
                type="text"
                name="documento"
                value={form.documento}
                onChange={handleDocumentChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.documento ? "border-red-600" : ""
                }`}
                placeholder="Apenas números"
                inputMode="numeric"
                autoComplete="off"
              />
              {errors.documento && (
                <p className="mt-1 text-sm text-red-500">{errors.documento}</p>
              )}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">
                Data de Nascimento
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.dataNascimento ? "border-red-600" : ""
                }`}
                placeholder="DD/MM/AAAA"
                autoComplete="bday"
                min="1900-01-01"
                max={new Date().toISOString().slice(0,10)}
              />
              {errors.dataNascimento && (
                <p className="mt-1 text-sm text-red-500">{errors.dataNascimento}</p>
              )}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">
                Contato (opcional)
              </label>
              <input
                type="text"
                name="contato"
                value={form.contato}
                onChange={handlePhoneChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.contato ? "border-red-600" : ""
                }`}
                placeholder="(DD) 90000-0000"
                inputMode="tel"
                autoComplete="tel"
              />
              {errors.contato && (
                <p className="mt-1 text-sm text-red-500">{errors.contato}</p>
              )}
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-white mb-2">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.email ? "border-red-600" : ""
                }`}
                placeholder="seu@email.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Senha
              </label>
              <input
                type={showPass ? "text" : "password"}
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.senha ? "border-red-600" : ""
                }`}
                placeholder="Crie uma senha"
                autoComplete="new-password"
              />
              <StrengthBar />
              {errors.senha && (
                <p className="mt-1 text-sm text-red-500">{errors.senha}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirmar Senha
              </label>
              <input
                type={showPass ? "text" : "password"}
                name="confirmarSenha"
                value={form.confirmarSenha}
                onChange={handleChange}
                className={`input-field w-full px-4 py-3 rounded-lg ${
                  errors.confirmarSenha ? "border-red-600" : ""
                }`}
                placeholder="Confirme sua senha"
                autoComplete="new-password"
              />
              {errors.confirmarSenha && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmarSenha}
                </p>
              )}
            </div>

            {/* Mostrar/ocultar senha */}
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
            {submitError && (
              <div className="mt-2 text-sm text-red-400">{submitError}</div>
            )}
            {success && (
              <div className="mt-2 text-sm text-green-400">{success}</div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}