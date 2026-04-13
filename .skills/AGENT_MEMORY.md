# Agent Memory - MvK Gym Manager (AriFitness)

> Última atualização: 13/04/2026
> Histórico de alterações no final do documento

---

## 📋 Visão Geral do Projeto

**Nome**: MvK Gym Manager (anteriormente AriFitness)
**Tipo**: SaaS Multi-tenant para gestão de academias
**Stack**: NestJS + Supabase + Ionic/Angular

### Características Principais
- Gestão de alunos, instrutores, treinos
- Sistema de check-in
- Fichas de treino com IA (Gemini)
- Dashboard financeiro
- E-commerce (em desenvolvimento)
- Sistema de assinaturas/planos
- Integração WhatsApp (Evolution API)

---

## 🏗️ Arquitetura

### Backend (NestJS)
```
ari-fitness-api/src/
├── app.module.ts              # Módulo principal
├── empresa/                   # Empresa + Assinaturas
│   ├── empresa.service.ts
│   ├── empresa.controller.ts
│   ├── empresa.interface.ts
│   ├── empresa.module.ts
│   ├── assinatura.service.ts   # Sistema de planos
│   └── assinatura.controller.ts
├── evolution/                 # Integração WhatsApp
│   ├── evolution.service.ts
│   ├── evolution.controller.ts
│   └── evolution.module.ts
├── gemini/                    # IA para fichas
├── dashboard/
├── usuario/
├── instructor/
├── treino/
├── exercicio/
├── ficha-usuario/
└── core/Constants/            # UserRole enum
```

### Frontend (Ionic/Angular)
```
ari-fitness-app/src/
├── app/
│   ├── adm-page/             # Área admin
│   │   ├── settings/         # Configurações
│   │   │   ├── empresa/     # Edição empresa
│   │   │   └── plano-page/   # Gestão de planos
│   │   ├── whatsapp-config/ # Config WhatsApp
│   │   ├── dashboard/
│   │   └── ...
│   ├── shared/
│   │   ├── unauthorized-page/    # Página 403
│   │   └── whatsapp-sender-modal/
│   └── meus-dados/
├── core/
│   ├── guards/               # RolesGuard
│   ├── services/
│   │   ├── whatsapp/
│   │   ├── evolution/
│   │   └── empresa/
│   ├── models/
│   │   └── Empresa.ts        # Interfaces
│   └── Constants.ts
└── global.scss
```

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais
- `empresa` - Dados das academias
- `usuarios` - Alunos, instrutores
- `instrutores`
- `ficha` - Fichas de treino
- `treino`
- `exercicio`
- `horarios`
- `planos` - Planos de assinatura da academia
- `service` - Serviços da academia
- `transacao_financeira`

### Tabelas de Assinatura (NOVO)
```sql
plano_assinatura_system  -- Planos do sistema (Starter, Professional, Enterprise)
assinatura               -- Assinaturas ativas por empresa
```

---

## 👥 Roles do Sistema

```typescript
enum UserRole {
  ADMIN = 1,
  INSTRUCTOR = 2,
  GERENCIA = 3,    // NOVO
  LIMPEZA = 4,
  STUDENT = 5,
  VISITANTE = 6
}
```

---

## ✨ Funcionalidades Implementadas

### 1. Sistema de Assinaturas (Planos)
- **Backend**: `assinatura.service.ts`, `assinatura.controller.ts`
- **Frontend**: `plano-page/` com:
  - Cards de métricas em grid 2x2
  - Cores dinâmicas (verde < 70%, amarelo 70-90%, vermelho > 90%)
  - Carrossel de planos
  - Mock de dados para teste
- **Features dos planos**:
  - Limite de Alunos/Instrutores/Equipamentos
  - Check-in
  - Relatórios Detalhados
  - Análise de Fichas com IA
  - Análise Financeira com IA
  - WhatsApp
  - **Loja da Academia** (NOVO)
  - **Pagamento Integrado** (NOVO)
  - **Regra de Cobrança Personalizada** (NOVO)
  - Suporte Prioritário

### 2. Integração WhatsApp (Evolution API)
- **Backend**: `evolution.module.ts` (service + controller)
- **Frontend**:
  - `whatsapp-config/` - Configuração na página admin
  - `whatsapp-sender-modal/` - Modal para envio de mensagens
  - `whatsapp-modal.service.ts` - Serviço de integração
  - `evolution.service.ts` - Serviço Evolution API

### 3. Controle de Acesso
- **Unauthorized Page**: `shared/unauthorized-page/`
  - Shield icon + mensagem divertida
- **RolesGuard**: `core/guards/roles.guard.ts`
  - Proteção de rotas por role

### 4. Avatares com Iniciais
- Sistema removido (dicebear)
- Placeholders com iniciais + cores dinâmicas
- Rosa para Feminino, Azul para Masculino
- Usando ngClass nos templates

### 5. Correções Importantes
- **Serviços da empresa**: Update agora deleta antigos antes de inserir novos
- **Role GERENCIA**: Adicionada nova role entre ADMIN e INSTRUCTOR

---

## 📄 SQL Scripts

### `docs/sql/subscription_tables.sql`
```sql
-- Planos do sistema
plano_assinatura_system (
  nome, preco, limite_alunos, limite_instrutores,
  suporta_loja, pagamento_integrado, regra_cobranca, etc
)

-- Assinaturas
assinatura (
  empresa_id, plano_assinatura_id, status,
  data_inicio, data_vencimento, valor_pago
)
```

---

## 🎨 UI/UX

### Padrões Utilizados
- Ionic components (ion-card, ion-button, etc)
- Cores via variáveis Ionic (ion-color-primary, etc)
- CSS customizado em arquivos .scss
- Suporte completo a dark mode
- Avatares com iniciais dinâmicas

### Componentes Criados
- `plano-page` - Página de gestão de planos
- `whatsapp-config` - Configuração WhatsApp
- `unauthorized-page` - Página de acesso negado
- `whatsapp-sender-modal` - Modal de envio

---

## 🔧 Configurações

### App
- Nome: "MvK Gym Manager" (alterado de AriFitness)
- ionic.config.json atualizado

### Routes (App)
- `/admin/configuracoes/plano` - Página de planos
- `/admin/whatsapp-config` - Config WhatsApp
- `/unauthorized` - Acesso negado

---

## ⚠️ Observações Importantes

1. **Modo Plan**: Sistema pode entrar em modo apenas leitura
2. **Commits**: Sempre separar por funcionalidade (segundo padrão do projeto)
3. **Build**: Verificar se compila após alterações (`ionic build` + `npm run build`)
4. **Multi-tenant**: Sempre filtrar por `empresa_id`
5. **Supabase**: Queries diretas via client (NÃO TypeORM para queries)

---

## 📝 Próximos Passos

1. Implementar módulo de E-commerce:
   - Tabelas: produtos, pedidos, pedido_itens
   - Backend: produto.service.ts, pedido.service.ts
   - Frontend: gestão de produtos, listagem de pedidos
   - Cardápio público para alunos

---

## 📜 Histórico de Alterações

### 13/04/2026 - Sessão Atual
- Commitados 19 changesets
- Adicionados 3 novos recursos aos planos (Loja, Pagamento, Cobrança)
- Corrigido update de serviços da empresa
- Implementado sistema de avatares com iniciais
- Adicionada role GERENCIA
- Renomeado app para MvK Gym Manager
- Removida branch órfã tropical-hippodraco
- Criado arquivo AGENT_MEMORY.md para contexto

---

## 📂 Estrutura de Arquivos Importantes

### Backend Interfaces (empresa.interface.ts)
```typescript
interface Empresa {
  id, nome, cnpj, logo_url, telefone, email,
  horarios[], planos[], servicos[]
}

interface PlanoAssinaturaSystem {
  id, nome, preco, limite_alunos, limite_instrutores,
  permite_checkin, permite_ficha, permite_financeiro,
  suporta_loja, pagamento_integrado, regra_cobranca,
  suporta_whatsapp, suporte_prioritario
}

interface Assinatura {
  empresa_id, plano_assinatura_id, status,
  data_inicio, data_vencimento, valor_pago
}
```

### Frontend Models (Empresa.ts)
```typescript
interface IService {
  id, nome, descricao, ativo, empresa_id, default_service_id
}

interface IEmpresa {
  id, cnpj, nome, telefone, email, logo_url, horarios, planos, servicos
}
```

### Features List (plano-page)
```typescript
featuresList = [
  { key: 'limite_alunos', label: 'Alunos', icon: 'people' },
  { key: 'limite_instrutores', label: 'Instrutores', icon: 'fitness' },
  { key: 'permite_checkin', label: 'Check-in', icon: 'checkmark-circle' },
  { key: 'permite_relatorios', label: 'Export de Relatórios Detalhados', icon: 'stats-chart' },
  { key: 'permite_ficha', label: 'Análise e Criação de Fichas com IA', icon: 'document-text' },
  { key: 'permite_financeiro', label: 'Análise Financeira com IA', icon: 'wallet' },
  { key: 'suporta_whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
  { key: 'suporta_loja', label: 'Loja da Academia', icon: 'cart' },
  { key: 'pagamento_integrado', label: 'Pagamento Integrado', icon: 'card' },
  { key: 'regra_cobranca', label: 'Regra de Cobrança Personalizada', icon: 'settings' },
  { key: 'suporte_prioritario', label: 'Suporte Prioritário', icon: 'headset' }
]
```

---

## 🔗 URLs e Endpoints

### API
- Base: `environment.apiUrl` (configurado em environments)
- Endpoints de assinatura: `/assinatura/*`
- Endpoints de empresa: `/empresa/*`
- Endpoints Evolution: `/evolution/*`

### Frontend Routes
- `/admin/configuracoes` - Configurações
- `/admin/configuracoes/plano` - Planos de assinatura
- `/admin/whatsapp-config` - Config WhatsApp
- `/unauthorized` - Acesso negado
- `/admin/ecommerce/*` - E-commerce (futuro)