import { toast } from 'react-toastify';

const toastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

/**
 * Exibe uma notificação de sucesso (verde).
 * @param {string} message - A mensagem a ser exibida.
 */
export const notifySuccess = (message) => {
  toast.success(message, toastOptions);
};

/**
 * Exibe uma notificação de aviso (laranja).
 * @param {string} message - A mensagem a ser exibida.
 */
export const notifyWarn = (message) => {
  toast.warn(message, toastOptions);
};

/**
 * Exibe uma notificação de erro (vermelha).
 * @param {string} message - A mensagem a ser exibida.
 */
export const notifyError = (message) => {
  toast.error(message, toastOptions);
};

/**
 * Exibe uma notificação de informação (azul).
 * @param {string} message - A mensagem a ser exibida.
 */
export const notifyInfo = (message) => {
  toast.info(message, toastOptions);
};