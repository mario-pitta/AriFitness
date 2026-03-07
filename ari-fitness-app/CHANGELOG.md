# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.6.0](https://github.com/mario-pitta/AriFitness/compare/v1.5.9...v1.6.0) (2026-03-07)


### Features

* Implement a new planner page featuring drag-and-drop task management and a task creation/editing modal. ([7307940](https://github.com/mario-pitta/AriFitness/commit/7307940d13d7eba945827b3bb4ebf9c0424f93d5))

### [1.5.9](https://github.com/mario-pitta/ari-fitness/compare/v1.5.8...v1.5.9) (2026-03-06)

### [1.5.8](https://github.com/mario-pitta/ari-fitness/compare/v1.5.7...v1.5.8) (2026-03-05)

### [1.5.7](https://github.com/mario-pitta/ari-fitness/compare/v1.5.6...v1.5.7) (2026-03-05)

### [1.5.6](https://github.com/mario-pitta/ari-fitness/compare/v1.5.5...v1.5.6) (2026-03-05)

### [1.5.5](https://github.com/mario-pitta/ari-fitness/compare/v1.5.4...v1.5.5) (2026-02-07)

### [1.5.4](https://github.com/mario-pitta/ari-fitness/compare/v1.5.3...v1.5.4) (2026-02-07)

### [1.5.3](https://github.com/mario-pitta/ari-fitness/compare/v1.5.2...v1.5.3) (2026-02-07)

### [1.5.2](https://github.com/mario-pitta/ari-fitness/compare/v1.5.1...v1.5.2) (2025-12-19)

### [1.5.1](https://github.com/mario-pitta/ari-fitness/compare/v1.5.0...v1.5.1) (2025-12-19)

## 1.5.0 (2025-12-18)


### Features

* enhance dashboard functionality with new endpoints for totals and members by plan, and improve data handling in services ([9ae23a3](https://github.com/mario-pitta/ari-fitness/commit/9ae23a366ae8291f3bb9ee1bf4672d46b5dff636))
* enhance findAll method to support ordering and ascending/descending filters and filtering conrrectly results ([a60fc4a](https://github.com/mario-pitta/ari-fitness/commit/a60fc4a73c33d629152317aba499459e3227d324))
* enhance treino display with improved layout and styling ([a168fdc](https://github.com/mario-pitta/ari-fitness/commit/a168fdc49a15982ea540907aab1ba66b888ea073))
* enhance user management with search functionality and improved user status handling ([7e2c666](https://github.com/mario-pitta/ari-fitness/commit/7e2c66615e99292f1ef7059f6978b73229fd3bab))
* filter transactions to include only those with positive final values and clean up modal dismissal logic ([fde81e9](https://github.com/mario-pitta/ari-fitness/commit/fde81e984ce75a4fd99a06e850b59f2d0caa4500))
* **financas:** enhance financial overview with date selection and loading states ([4684fe9](https://github.com/mario-pitta/ari-fitness/commit/4684fe9412278b68d125196db950adc752421f15))
* implement check-in functionality with user registration and history retrieval ([055e9b4](https://github.com/mario-pitta/ari-fitness/commit/055e9b460ac2d5177a9f005a6c2e6dc43edfc034))
* Refactor PessoaFormPage to improve user data handling and form initialization ([3c3945e](https://github.com/mario-pitta/ari-fitness/commit/3c3945e167a2564bfaed7f0782a03cbab77226ca))
* update getTreinos method to filter active treinos by empresa_id ([f58985c](https://github.com/mario-pitta/ari-fitness/commit/f58985c317895fc95f01c2df4e9e9423c5990fba))
* update package name to mvk-gym-manager, version to 1.3.9, and add @vercel/analytics dependency ([f1e13e1](https://github.com/mario-pitta/ari-fitness/commit/f1e13e177ac637627ef63750055eec691d06e407))
* update README to reflect project scope, functionalities, and technologies for the fitness app ([6eedc64](https://github.com/mario-pitta/ari-fitness/commit/6eedc64388694257b2367430f594a6941d1ecb7a))
* update user card data structure and improve message formatting with dynamic user information ([6b043e0](https://github.com/mario-pitta/ari-fitness/commit/6b043e0148aa2da29d4efd699e780c53099f0ef2))
* update user retrieval in ngOnInit and filter instrutores by empresa_id ([7a6ccac](https://github.com/mario-pitta/ari-fitness/commit/7a6ccac107ce19aad07112dbd2c445eaeea184fe))
* update version to 1.3.0 and add router link to instrutores page at 'Ver Todos' button chip in dashboard ([c42ad2b](https://github.com/mario-pitta/ari-fitness/commit/c42ad2b71718de463ccd9e793d7de7a2a47f4ed2))
* update version to 1.3.1, adjust meses and anos selectors in usuarios page, and fix conditional check in openCobrancaModal ([e45ddf6](https://github.com/mario-pitta/ari-fitness/commit/e45ddf6c6ff7d0b604e16cb484e0d5cc23850aaf))
* update version to 1.3.7 and add Check-in feature ([b64fdd0](https://github.com/mario-pitta/ari-fitness/commit/b64fdd0fd6889bccb41e4c0e687ac125faaed0e8))
* update version to 1.3.9 and integrate @vercel/analytics for production environment ([099daae](https://github.com/mario-pitta/ari-fitness/commit/099daaeb7be15f8cd35de706e2e463d2b674c057))


### Bug Fixes

* consolidate imports for FormaDePagamento and TransacaoFinanceira in usuarios.page.ts ([45c22af](https://github.com/mario-pitta/ari-fitness/commit/45c22af07b84423259877eca9ca3ffcf7f7eaf1a))
* remove unnecessary group clause in getMembersByPlan query and update version to 1.3.6 in package.json ([265122e](https://github.com/mario-pitta/ari-fitness/commit/265122e37a0f5a4249ee073f6cc55a7e63f33e4a))

## [1.3.9] - 2025-12-18

### Added
- Integração oficial com `@vercel/analytics` para monitoramento de performance e tráfego em produção.
- Adição da dependência `@vercel/analytics` ao projeto.


---

## [1.3.8] - 2025-12-18

### Added
- Implementação da funcionalidade de **Check-in** em tempo real.
- Sistema de registro de presença de usuários.
- Funcionalidade de recuperação e exibição de histórico de check-ins.

---

## [1.3.7] - 2025-09-18

### Added
- Módulo de Check-in com suporte a **QR Code**.
- Interface de usuário (UI) dedicada para check-in manual e via scanner.
- Sistema de roteamento interno para a página de Check-in (`adm-page-routing`).
- Adição de link de Check-in no Dashboard administrativo.

### Technical
- Implementação de testes unitários para o componente de Check-in.
- Adição de estilos específicos para a exibição e leitura de códigos QR.

---

## [1.3.6] - 2025-09-17

### Added
- Melhorias no Dashboard: Novos endpoints para contagem de totais e membros agrupados por plano.
- Refinamento no tratamento de dados dentro dos serviços de dashboard.

### Fixed
- Consolidação de imports redundantes de `FormaDePagamento` e `TransacaoFinanceira` em `usuarios.page.ts`.
- Correção de performance na query `getMembersByPlan` (remoção de cláusula de agrupamento desnecessária).

---

## [1.3.4] - 2025-09-06

### Added
- Filtro avançado em transações financeiras para exibir apenas valores finais que não sejam zero.
- Sistema de busca de usuários aprimorado com novos filtros de status.
- Implementação de formatação de mensagens dinâmicas com informações do usuário.

### Changed
- Atualização da estrutura de dados dos cartões de usuário (User Cards).
- Limpeza na lógica de fechamento de modais (Dismissal Logic).

---

## [1.3.3] - 2025-09-05

### Added (Módulo Financeiro)
- Seleção de período (data início/fim) via modal para relatórios financeiros.
- Gráficos visuais para distribuição de receitas e despesas.
- Implementação de *Loading Skeletons* para melhor experiência durante o carregamento de dados.

### Added (Módulo Usuários)
- Registro de pagamentos em massa (Bulk Payment) com alertas de confirmação.
- Histórico de pagamentos aprimorado com novos filtros de busca.

### Changed
- Terminologia atualizada: Alteração de **"Membros"** para **"Alunos"** em toda a interface.
- Lógica de pagamento: Migração do campo `fl_pago` para `fl_adimplente` para maior clareza semântica.

### Fixed
- Correção na lógica de ativação/desativação de alunos para evitar estados inconsistentes.
- Melhoria no feedback visual com notificações via Toastr para ações críticas.

---

## [1.3.0] - 2025-09-01

### Added
- Suporte completo a **PWA** (Progressive Web App):
  - Criação de `manifest.webmanifest`.
  - Configuração de ícones e branding.
  - Otimização do `index.html` para SEO e suporte offline.
- Sistema de listagem de treinos com interface aprimorada e foco em acessibilidade.
- Novo método de recuperação de resumo financeiro em `TransacaoFinanceiraDashService`.

### Technical
- Refatoração da página `PessoaFormPage` para otimizar o carregamento de formulários.
- Adição do script `stopDev.sh` para gerenciamento do ambiente local.
- Atualização do `vercel.json` para garantir builds e rotas corretas em produção.

---

## [0.0.3] - 2024-07-29

### Added
- **MVP Deployed**: Primeira versão estável da plataforma em produção.
- Gerenciamento básico de treinos e instrutores.
- Sistema de fichas de alunos e visualização de exercícios.
- Configurações iniciais de ambiente Vercel.

---
