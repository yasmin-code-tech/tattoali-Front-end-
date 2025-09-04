# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),  
e este projeto segue [Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added
- **auth**: integração do frontend com rotas reais do backend:
  - `POST /api/user/login` para autenticação com JWT
  - `POST /api/user/register` para criação de novos usuários
- **AuthProvider**:
  - Implementado método `login()` que persiste o token no `localStorage` e adiciona `Authorization` no axios
  - Implementado método `register()` para enviar dados de cadastro ao backend
  - Ajustado método `logout()` para limpar sessão
- **Cadastro.jsx**:
  - Integração com `register()` do AuthProvider
  - Validação de campos obrigatórios (nome, sobrenome, cpf, email, senha)
  - Redirecionamento automático para `/login` após cadastro bem-sucedido

### Changed
- Tela de cadastro ajustada para atender aos contratos esperados pelo backend

### Fixed
- Corrigido fluxo de autenticação: token agora é salvo corretamente após login
