import React, { useState, useEffect } from "react";
import { notifySuccess, notifyError, notifyWarn } from "../services/notificationService";
import { cpfDigitos, cpfFormatoBasicoValido } from "../utils/cpf";
import {
  criarCliente,
  lookupClienteAppPorCpf,
  vincularClienteDoAppPorCpf,
} from "../services/clienteService";

/**
 * @param {boolean} [defaultClienteJaNoApp] — ao abrir (ex.: vindo do chat), já marca “cliente no app” e mostra busca por CPF.
 * @param {() => void} [onClienteVinculado] — após vincular pelo CPF com sucesso.
 */
const ModalCadastrarCliente = ({
  isOpen,
  onClose,
  onSave,
  defaultClienteJaNoApp = false,
  onClienteVinculado,
}) => {
  const [clienteJaNoApp, setClienteJaNoApp] = useState(false);
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buscandoCpf, setBuscandoCpf] = useState(false);
  const [previewApp, setPreviewApp] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setNome("");
      setCpf("");
      setTelefone("");
      setEndereco("");
      setObservacoes("");
      setIsSubmitting(false);
      setBuscandoCpf(false);
      setPreviewApp(null);
      setClienteJaNoApp(!!defaultClienteJaNoApp);
    }
  }, [isOpen, defaultClienteJaNoApp]);

  const cpfLimpoBusca = cpfDigitos(cpf);

  const handleBuscarNoApp = async () => {
    if (!cpfFormatoBasicoValido(cpfLimpoBusca)) {
      notifyWarn("Informe um CPF válido com 11 dígitos.");
      return;
    }
    setBuscandoCpf(true);
    setPreviewApp(null);
    try {
      const r = await lookupClienteAppPorCpf(cpfLimpoBusca);
      setPreviewApp(r);
      if (!r?.found) {
        if (r?.already_on_your_list) {
          notifyWarn(r.hint || "Este CPF já está na sua lista.");
        } else {
          notifyWarn("Nenhum usuário do app encontrado com este CPF. Use o cadastro manual.");
        }
      }
    } catch (e) {
      notifyError(e?.message || "Falha ao buscar.");
      setPreviewApp(null);
    } finally {
      setBuscandoCpf(false);
    }
  };

  const handleVincularDoApp = async () => {
    if (!cpfFormatoBasicoValido(cpfLimpoBusca)) {
      notifyWarn("CPF inválido.");
      return;
    }
    if (!previewApp?.found) {
      notifyWarn("Busque um CPF válido antes de adicionar.");
      return;
    }
    setIsSubmitting(true);
    try {
      await vincularClienteDoAppPorCpf(cpfLimpoBusca);
      notifySuccess("Cliente adicionado à sua lista com os dados do app.");
      onClienteVinculado?.();
      onClose();
    } catch (e) {
      notifyError(e?.message || "Não foi possível vincular o cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveManual = async () => {
    const nomeTrim = nome.trim();
    const foneDigitos = telefone.replace(/\D/g, "");

    if (!nomeTrim || !foneDigitos) {
      notifyWarn("Preencha nome e telefone (com DDD).");
      return;
    }
    if (nomeTrim.length < 5) {
      notifyWarn("O nome deve ter pelo menos 5 caracteres.");
      return;
    }
    if (foneDigitos.length < 10) {
      notifyWarn("Informe um telefone válido com DDD (ex.: (11) 98765-4321).");
      return;
    }

    if (!cpfFormatoBasicoValido(cpfLimpoBusca)) {
      notifyWarn("Informe um CPF válido com 11 dígitos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const novoCliente = {
        nome: nomeTrim,
        cpf: cpfLimpoBusca,
        telefone,
        endereco,
        observacoes,
      };

      if (onSave) {
        await onSave(novoCliente);
      }

      notifySuccess("Cliente cadastrado com sucesso!");
      onClose();
    } catch (error) {
      notifyError(error.message || "Falha ao cadastrar o cliente.");
      console.error("Erro ao cadastrar cliente:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const nomeExibicaoPreview =
    previewApp?.found &&
    `${previewApp.nome || ""} ${previewApp.sobrenome || ""}`.trim();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
      <div className="bg-black border border-gray-800 rounded-2xl p-8 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Cadastrar cliente</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <label className="flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-xl border border-gray-800 bg-[#111] hover:border-gray-600 transition-colors">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-gray-600 text-red-600 focus:ring-red-500"
            checked={clienteJaNoApp}
            onChange={(e) => {
              setClienteJaNoApp(e.target.checked);
              setPreviewApp(null);
            }}
          />
          <span>
            <span className="block text-white font-medium text-sm">Cliente já usa o app TattooAli</span>
            <span className="block text-gray-500 text-xs mt-1">
              Busque pelo CPF que o cliente informou: puxamos nome e telefone do cadastro dele e salvamos na sua lista.
            </span>
          </span>
        </label>

        {clienteJaNoApp ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">CPF do cliente</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                placeholder="000.000.000-00"
              />
              <p className="text-xs text-gray-500 mt-1">
                O cliente precisa ter conta no app com este CPF cadastrado.
              </p>
            </div>
            <button
              type="button"
              onClick={handleBuscarNoApp}
              disabled={buscandoCpf}
              className="w-full border border-gray-600 text-gray-200 hover:bg-gray-900 py-3 rounded-lg font-medium disabled:opacity-50"
            >
              {buscandoCpf ? "Buscando…" : "Buscar"}
            </button>

            {previewApp?.found ? (
              <div className="rounded-xl border border-green-900/50 bg-green-950/20 p-4 space-y-2">
                <p className="text-green-400 text-xs font-semibold uppercase tracking-wide">Encontrado no app</p>
                <p className="text-white font-medium">{nomeExibicaoPreview}</p>
                {previewApp.telefone ? (
                  <p className="text-gray-400 text-sm">Telefone: {previewApp.telefone}</p>
                ) : null}
                <button
                  type="button"
                  onClick={handleVincularDoApp}
                  disabled={isSubmitting}
                  className="w-full mt-2 btn-primary py-3 rounded-lg font-medium disabled:opacity-50"
                >
                  {isSubmitting ? "Salvando…" : "Adicionar à minha lista"}
                </button>
              </div>
            ) : null}

            {previewApp && previewApp.found === false ? (
              <p className="text-sm text-amber-200/90 bg-amber-950/30 border border-amber-900/40 rounded-lg p-3">
                {previewApp.already_on_your_list
                  ? previewApp.hint ||
                    "Este CPF já está na sua lista de clientes. Não é preciso vincular de novo pelo app."
                  : "Nenhum cadastro de cliente no app com este CPF. Desmarque a opção acima e preencha o formulário manualmente."}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nome do cliente</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                placeholder="Nome completo do cliente"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">CPF</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                placeholder="000.000.000-00"
              />
              <p className="text-xs text-gray-500 mt-1">Usado para identificar a mesma pessoa no app e na agenda.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Contato (Telefone/WhatsApp)</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                placeholder="(XX) 9XXXX-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Endereço (opcional)</label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className="input-field w-full px-4 py-3 rounded-lg"
                placeholder="Digite o endereço completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Observações (opcional)</label>
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações adicionais"
                rows="3"
                className="input-field w-full px-4 py-3 rounded-lg resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-600 text-gray-300 hover:text-white py-3 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          {!clienteJaNoApp ? (
            <button
              type="button"
              onClick={handleSaveManual}
              disabled={isSubmitting}
              className="flex-1 btn-primary py-3 rounded-lg font-medium cursor-pointer flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Salvando...
                </>
              ) : (
                "Cadastrar"
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ModalCadastrarCliente;
