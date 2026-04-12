/** Apenas dígitos do CPF (11 caracteres esperados). */
export function cpfDigitos(v) {
  return String(v ?? "").replace(/\D/g, "").slice(0, 11);
}

/** Validação básica (tamanho + não é sequência repetida); o back valida dígitos verificadores. */
export function cpfFormatoBasicoValido(digitos) {
  if (!digitos || digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;
  return true;
}
