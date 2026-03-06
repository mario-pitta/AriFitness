# Documentação Técnica - Mvk Gym Manager 🛠️

Esta documentação detalha os aspectos técnicos, escolhas de arquitetura e integrações do sistema **Mvk Gym Manager**.

---

## 1. Arquitetura do Backend (API)

O backend é construído com **NestJS**, seguindo um padrão modular que favorece a escalabilidade e a manutenção.

### 1.1 Estrutura de Módulos
Cada domínio de negócio possui seu próprio módulo, encapsulando controllers, services e interfaces.
- **AuthModule**: Gerencia a autenticação e permissões.
- **UsuarioModule**: CRUD e lógica de perfis de alunos e professores.
- **TreinoModule / ExercicioModule**: Lógica de prescrição e execução de treinos.
- **GeminiModule**: Integração com serviços de inteligência artificial.

### 1.2 Injeção de Dependências
O sistema utiliza extensivamente o sistema de injeção de dependências do NestJS para desacoplar as camadas de serviço da camada de transporte (HTTP Controllers).

---

## 2. Camada de Dados e Persistência

### 2.1 Integração com Supabase
O sistema utiliza o **Supabase** como backend-as-a-service para o PostgreSQL.
- O `DataBaseService` (`src/datasource/database.service.ts`) inicializa o cliente Supabase utilizando as credenciais injetadas via variáveis de ambiente.
- A comunicação é feita principalmente através do `SupabaseClient`, permitindo operações diretas no banco de dados com tipagem forte.

---

## 3. Inteligência Artificial (Gemini Integration)

A integração com a IA é um dos diferenciais técnicos da plataforma.

### 3.1 Gemini Service
- **Modelo**: `gemini-1.5-flash`.
- **Funcionalidades**:
  - **Geração de Treinos**: O serviço recebe dados estruturados do aluno e equipamentos, enviando um prompt otimizado para que a IA retorne um JSON com a ficha de treino.
  - **Análise Financeira**: Processa arrays de transações financeiras para identificar padrões, calcular ROI e sugerir melhorias estratégicas.
- **Limpeza de Saída**: O serviço implementa uma lógica de limpeza de strings para garantir que o retorno da IA seja um JSON válido antes do `JSON.parse`.

---

## 4. Arquitetura do Frontend

O frontend é uma aplicação **Ionic/Angular** moderna.

### 4.1 Organização do Angular
- **Componentes**: Reutilizáveis (Custom Cards, Modals).
- **Páginas**: Divididas por funcionalidade (`adm-page`, `check-in`, `ficha-treino-aluno`).
- **Serviços**: Centralizam a comunicação com a API REST, garantindo que os componentes foquem apenas na lógica de interface.

### 4.2 Integração Nativa
Através do **Capacitor 6**, a aplicação acessa recursos nativos do hardware como câmera (para fotos de perfil) e teclado.

---

## 5. Variáveis de Ambiente e Configuração

O sistema depende de um arquivo `.env` para operar. As principais chaves são:

- `SUPABASE_URL`: Endpoint da sua instância Supabase.
- `SUPABASE_KEY`: Chave de acesso anônima ou de serviço.
- `GOOGLE_GEMINI_KEY`: Chave de API para acesso ao Google AI Studio.
- `GROC_API_KEY`: Chave de API para acesso ao Groc.

---

## 6. Scripts e Ciclo de Vida

### Desenvolvimento Local
- Backend: `npm run start:dev` (Watch mode).
- Frontend: `ionic serve`.

### Processo de Build
- O frontend possui um script customizado `copy:assets` que utiliza `robocopy` no Windows para mover ativos estáticos para a pasta pública da API, permitindo que a API sirva o frontend se necessário.

---

## 7. Segurança

- **Autenticação**: Baseada em tokens, gerenciada pelo módulo de Auth.
- **CORS**: Configurado dinamicamente no `main.ts` para permitir acesso controlado de diferentes origens.
- **Sanitização**: O backend valida as entradas via DTOs (Data Transfer Objects) para prevenir injeções maliciosas.
