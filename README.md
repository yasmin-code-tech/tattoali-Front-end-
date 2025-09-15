# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Setup do projeto

1. Instalar Node v20.19.0 (use `nvm use` se tiver nvm)
2. Rodar `npm install`
3. Rodar `npm run dev`

## Ambiente de Desenvolvimento

Este projeto utiliza **Node.js v20.19.0**.

### Por que isso é importante?
- Algumas dependências (como Vite e Tailwind) exigem versões específicas do Node.
- Usar versões diferentes pode gerar erros de compatibilidade (ex: `EBADENGINE`).
- Padronizando a versão, garantimos que todos desenvolvedores terão o mesmo ambiente.

### Como manter a versão correta
- O arquivo `.nvmrc` define a versão esperada do Node.
- O campo `"engines"` no `package.json` reforça essa exigência.

#### Se você usa **nvm** (Linux/macOS)
```bash
nvm use

## Ambiente / Execução

Este projeto suporta **dois modos de execução**:
Este projeto usa cross-env para configurar variáveis de ambiente nos scripts.
O pacote já está listado no package.json, portanto todos os membros da equipe só precisam rodar após dar o pull
    `
    ``bash
    npm install 

---

### 🔹 1) Modo Mock (sem backend)
Utiliza respostas simuladas direto no front (útil para desenvolvimento rápido sem precisar do backend rodando).

- Variável de ambiente: `VITE_USE_MOCK_AUTH=true`
- Script:
  ```bash
  npm run dev:mock

### 🔹 2) Modo Mock (com backend)
    - Variável de ambiente: `VITE_API_URL=http://localhost:3000`
    - Script:
  ```bash
  npm run dev:real
