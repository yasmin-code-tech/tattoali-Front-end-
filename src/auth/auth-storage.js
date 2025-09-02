// src/auth/auth-storage.js
const STORAGE_KEY = 'tattooali.auth';
const DISABLE_PERSISTENCE = import.meta?.env?.VITE_DISABLE_PERSISTENCE === 'true';

export function saveAuth(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadAuth() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}
