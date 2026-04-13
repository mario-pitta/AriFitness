# Documentação Geral - Mvk Gym Manager 🏋️

Esta documentação fornece uma visão clara e detalhada do sistema **Mvk Gym Manager**, uma plataforma completa para a gestão de studios de atividade física e academias.

---

## 1. Objetivo do Projeto
O **MvK Gym Manager** visa digitalizar e otimizar a relação entre alunos, professores e gestores. A plataforma permite que:
- **Alunos** acompanhem sua evolução, acessem fichas de treino personalizadas e realizem check-ins.
- **Professores** criem planos de treino inteligentes e monitorem o desempenho dos alunos.
- **Gestores** tenham controle total sobre o financeiro, cadastro de alunos e operação da academia.

---

## 2. Arquitetura do Sistema
O projeto utiliza uma arquitetura moderna e escalável, dividida em dois componentes principais:

### 2.1 Backend (API) - `ari-fitness-api`
- **Framework**: [NestJS](https://nestjs.com/) (Node.js).
- **Banco de Dados**: PostgreSQL, gerenciado via [Supabase](https://supabase.com/).
- **Integração de IA**: Utiliza o modelo **Gemini 1.5 Flash** da Google para tarefas complexas.
- **Padrão**: Modular, seguindo as melhores práticas do NestJS para separação de domínios (Usuários, Treinos, Financeiro, etc.).

### 2.2 Frontend (App) - `ari-fitness-app`
- **Framework**: [Ionic Framework](https://ionicframework.com/) com **Angular 18**.
- **Mobile**: Integrado com **Capacitor 6** para suporte a Android e iOS.
- **Estilização**: Uso de componentes nativos do Ionic e CSS personalizado.
- **Recursos**: Dashboards financeiros, editores de treino e interface intuitiva para alunos.

---

## 3. Tecnologias Utilizadas

### Backend
- **Core**: TypeScript, NestJS 10.
- **ORM/DB**: Supabase Client.
- **IA**: `@google/generative-ai` (Gemini).
- **Outros**: Axios, RxJS, Handlebars (para visualizações de servidor).

### Frontend
- **Core**: Angular 18, Ionic 8.
- **Gráficos**: `ngx-charts` para visualização de dados financeiros e de progresso.
- **Documentos**: `pdfmake` e `jspdf` para geração de relatórios e fichas em PDF.
- **Capacitor**: `@capacitor/camera`, `@capacitor/clipboard`, `@capacitor/keyboard`.

---

## 4. Funcionalidades Principais

### 🔹 Módulo de Alunos
- **Check-in**: Registro de presença em aulas e horários.
- **Fichas de Treino**: Acesso visual aos exercícios, séries, repetições e intervalos.
- **Evolução**: Gráficos de progresso e histórico de atividades.

### 🔹 Módulo de Gestão e Professores
- **Gestor de Treinos**: Ferramenta para montar treinos manualmente ou via IA.
- **Financeiro**: Controle de transações, mensalidades e análise de fluxo de caixa.
- **CRM**: Cadastro completo de alunos, filtros por situação e controle de acesso.

### 🔹 Inteligência Artificial (Gemini integration)
- **Geração de Treinos**: A IA analisa o perfil do aluno e os equipamentos disponíveis para sugerir um treino otimizado.
- **Relatórios Financeiros**: Analisa os dados de transações e gera relatórios estratégicos em Markdown/HTML, identificando problemas e sugerindo melhorias.

---

## 5. Estrutura de Pastas

```text
AriFitness/
├── ari-fitness-api/       # Código fonte do servidor (NestJS)
│   ├── src/               # Módulos, controllers e services
│   └── test/              # Testes unitários e e2e
├── ari-fitness-app/       # Código fonte do aplicativo (Ionic/Angular)
│   ├── src/app/           # Páginas, componentes e serviços do Angular
│   └── public/            # Ativos estáticos e ícones
└── docs/                  # Documentação adicional do projeto
```

---

## 6. Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js instalado.
- Ionic CLI instalado (`npm install -g @ionic/cli`).

### Configuração do Backend
1. Acesse a pasta `ari-fitness-api`.
2. Instale as dependências: `npm install`.
3. Configure o arquivo `.env` (use o `.env.example` como base).
4. Inicie o servidor: `npm run start:dev`.

### Configuração do Frontend
1. Acesse a pasta `ari-fitness-app`.
2. Instale as dependências: `npm install`.
3. Inicie o app: `ionic serve`.

> [!TIP]
> Use o comando `npm run start:full` na pasta do app para iniciar tanto o frontend quanto o backend em paralelo (requer configuração correta de caminhos).

---

## 7. Deploy
- O **Frontend** está configurado para deploy imediato via **Vercel**.
- O **Backend** pode ser hospedado em plataformas como **Heroku**, **Google Cloud Platform** ou **Vercel** (via Serverless Functions).
