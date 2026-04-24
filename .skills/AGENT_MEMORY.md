# Agent Memory - MvK Gym Manager (AriFitness)

> Última atualização: 23/04/2026
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

### 3. E-commerce Completo (NOVO)
- **Backend**:
  - `produto.controller.ts` - CRUD produtos
    - GET público: `/produtos/publico/:empresaId`
    - POST/PUT/DELETE protegidos
  - `pedido.controller.ts` - Gestão de pedidos
  - `produto.service.ts`, `pedido.service.ts`
- **Frontend**:
  - **PDV**: `/admin/pdv` - Ponto de venda com grid + carrinho lateral
  - **Minha Loja**: `/admin/configuracoes/ecommerce/loja` - Hub com 3 cards
  - **Produtos**: `/admin/configuracoes/ecommerce/produtos`
  - **Pedidos**: `/admin/configuracoes/ecommerce/pedidos`
  - **Catálogo Público**: `/catalogo/:empresaId`
    - Header com banner/logo
    - Filtros de busca, categoria, ordenação
    - Modal de detalhes do produto
    - Botão WhatsApp para contato
- **Melhorias UI**:
  - Cards de produto com hover effects
  - Estoque com badges semânticos (verde/amarelo/vermelho)
  - Título dinâmico da aba (Página | Empresa | MvK Gym Manager)

### 4. Controle de Acesso
- **Unauthorized Page**: `shared/unauthorized-page/`
  - Shield icon + mensagem divertida
- **RolesGuard**: `core/guards/roles.guard.ts`
  - Proteção de rotas por role

### 6. Push Notifications (NOVO)
- **Backend**: `push-notification/` no NestJS
  - Service para envio de alertas
  - Integração automática no fluxo de pedidos
- **Realtime**: `SupabaseRealtimeManagerService` no frontend
- **Campo cliente_cpf**: Adicionado ao Pedido (entity + service)

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
6. **Interfaces/Classes**: Toda declaração deve estar em `src/core/models/`. Nunca declarar interfaces em arquivos de componente. Se não existir, criar no local correto.

---

## 🚫 REGRAS DE ARQUITETURA (OBRIGATÓRIAS)

### Fluxo de Dados: FRONT -> BACK -> DB

```
FRONTEND (Angular/Ionic)
        ↓ (HTTP via Services)
BACKEND (NestJS)
        ↓ (Supabase Client)
BANCO (Supabase/PostgreSQL)
```

### Regras Críticas

1. **NUNCA chamar banco de dados diretamente do frontend**
   - ❌ Supabase client no Angular
   - ❌ Queries diretas no componente
   - ❌ chamadas externas (APIs) no componente

25. **Segurança**: Nunca exponha chaves ou URLs do Supabase no frontend. Utilize o pattern do Service Injetável.
6. **PRODUTO**: Sempre valide se o projeto está rodando (compilando) e sem erros após implementações/refatorações.

2. **SEMPRE usar services injetáveis no frontend**
   - ✅ Services Angular que chamam endpoints do backend
   - ✅ HttpClient através de services

3. **Backend é responsável por todas as interações com DB**
   - ✅ Supabase client apenas no NestJS
   - ✅ Serviços externos (Evolution API, Gemini, etc) apenas no backend

4. **Nunca fazer chamadas externas nos componentes**
   - ❌ `this.supabase.client.from(...).select()` no .ts do componente
   - ❌ `window.open()` para APIs externas
   - ✅ services que encapsulam a lógica

### Padrão de Implementação

```typescript
// ❌ ERRADO - Chamada direta no componente
async loadData() {
  const { data } = await this.supabase.client.from('produtos').select('*');
}

// ✅ CORRETO - Via service
// 1. Service (Angular)
getProdutos(): Observable<any> {
  return this.http.get(`${environment.apiUrl}/produtos`);
}

// 2. Component
async loadData() {
  this.produtoService.getProdutos().subscribe(res => {
    this.produtos = res.data;
  });
}
```

### Referências

- Regras detalhadas: [fullstack.md](./fullstack.md)
- Arquitetura: [.claude/agents/AGENT-FULLSTACK.md](./.claude/agents/AGENT-FULLSTACK.md)

---

## 🤖 USO DE SUBAGENTES (OBRIGATÓRIO)

Para tarefas complexas, usar a ferramenta `Task` com subagentes:

### Agent Explore
- Buscar arquivos, rotas, componentes
- Mapear estrutura do projeto
- Identificar dependências e imports
- **Exemplo**: "Encontre a página do PDV e me diga sua estrutura"

### Agent General
- Implementar funcionalidades completas
- Criar/modificar componentes
- Escrever specs e testes
- **Exemplo**: "Adicione um FAB na página do PDV para abrir o catálogo"

### Fluxo Recomendado
1. **Explore** primeiro - entender contexto
2. **General** para implementar
3. Verificar build após implementação
4. Atualizar memória com resultados

---

## 📝 Próximas Tarefas (TODO)

### E-commerce - Concluído ✅
- Carrinho de compras no catálogo público
- Checkout com botão comprar no modal
- Footer na página de detalhes
- Modal compartilhar catálogo
- Botão acessar catálogo no PDV
- Select de produtos no formulário de transação
- Integração vendas → módulo de finanças
- Push Notifications ao criar pedido
- **campo cliente_cpf**: Adicionado ao Pedido ✅
- **Expansão do carrinho no PDV**: Adicionado toggle ✅

### Pendente
- **Integração Pedido ↔ Transação Financeira** (PENDENTE - tratar amanhã)
  - Quando status do pedido muda para "pago", atualizar transação existente (fl_pago: true)
  - Atualmente cria duplicata ao atualizar status
  - Método criarTransacaoPorVenda precisa usar transacao_id do pedido, não auth_code
- **Integração com gateway de pagamento** - Stripe/MercadoPago para checkout
- **Webhook de notificações** - Receber eventos de pagamento
- **Relatórios de vendas** - Dashboard de e-commerce
- **Gestão de estoque** - Controle de inventário
- **Cupons de desconto** - Sistema de cupons
- **Frete e entrega** - Cálculo de frete
- **Rastreamento de pedido** - Status de entrega
- **Avaliações de produtos** - Sistema de reviews

## 🎯 Release Notes

### v1.15.0 (23/04/2026)
- **89 commits** desde v1.14.0
- **+12.973 linhas** líquido
- **184 arquivos** alterados
- **10 dias** de desenvolvimento

#### Destaques
- E-commerce completo (catálogo, carrinho, PDV, pedidos)
- Push Notifications com Firebase
- Integração WhatsApp (Evolution API)
- Sistema de planos e assinaturas
- Controle de permissões (RolesGuard)
- Campo CPF no Pedido

### 23/04/2026 - Release v1.15.0
- **Release Notes**: Criado `docs/RELEASE_NOTES_v1.15.0.md`
- **Métricas**: 89 commits, +12.973 linhas, 10 dias
- **campo cliente_cpf**: Adicionado ao Pedido (entity + service)
- **PDV Improvements**: Expansão do carrinho, toggle visual
- **Correções UI**: Altura fixas nos cards de produtos

### 17/04/2026 - Push Notifications + Correções
- **Módulo Push Notifications**: Novo módulo `push-notification/` no NestJS
  - Service + Controller + Testes unitários
  - Integração automática ao criar pedido
- **Correção Dashboard Financeiro**: Filtro `fl_pago` considera apenas transações pagas e ativas
- **Correção JWT**: Guard lança UnauthorizedException, adicionado logging
- **Melhorias Pedido**: Integração push notification ao criar pedido, melhorias na busca de itens
- **Rollback Custom JWT**: WebSocket usa Anon Key padrão do Supabase (problemas com secret dinâmico)
- **Realtime Service**: Implementado `SupabaseRealtimeManagerService` com Leader Election

### 15/04/2026 - Unificação e Header Dinâmico (Sessão Atual)
- **Unificação de Componentes**: `ProdutoDetailPageComponent` agora é o componente master para exibição de detalhes, eliminando a necessidade do `ProdutoDetailModalComponent`.
- **Header Dinâmico no Catálogo**: Replicado o padrão de design colapsável (Sticky) no `CatalogPublicPage` para consistência visual.
- **UI/UX**: Implementado header dinâmico (Collapsible Header) na página de detalhes.
  - Modo Expandido: Banner + Logo + Nome + Carrinho.
  - Modo Reduzido (Sticky): Logo Mini + Nome + Carrinho + Compartilhar (com Glassmorphism).
- **Correção**: Corrigido gap de 300px no header da página de detalhes.
- **Simplificação**: Removida pasta `produto-detail-modal` redundante.
- **Integração**: Catálogo público agora abre o componente unificado com `isModal: true`.

### 15/04/2026 - Subagentes + Funcionalidades PDV/Transação

### 14/04/2026 - Correções Arquitetura + E-commerce
- **Correção crítica**: Implementado padrão FRONT -> BACK -> DB
  - Removidas chamadas diretas ao Supabase dos componentes
  - Criado endpoint público `/produtos/publico/:empresaId/produto/:produtoId`
  - Backend retorna produto + dados públicos da empresa (nome, logo, formas pagamento)
  - Frontend: ProdutoService com método `getByIdPublic()`
  - produto-detail-page.component.ts agora usa service
- Carrinho de compras completo com localStorage
- Modal carrinho com dados do cliente
- Página detalhes do produto com rota compartilhável (`/catalogo/:empresaId/produto/:produtoId`)
- Botão compartilhar produto no modal
- Transação automática ao pagar pedido (módulo finanças)

### 14/04/2026 - E-commerce Completo
- Commit 8ea2b08
- PDV com layout side-by-side (produtos + carrinho)
- Catálogo público com header banner, filtros e ordenação
- Modal de detalhes do produto
- Título dinâmico da aba (Página | Empresa | MvK Gym Manager)
- Página "Minha Loja" com cards de navegação
- Sidebar atualizado (PDV, Catálogo Público)
- Rota GET /produtos/:empresaId pública (POST/PUT/DELETE protegidos)
- Header global escondido em rotas públicas
- Melhorias UI nos cards de produto (PDV e Gestão)
- Regra: sempre usar services injetáveis (nunca HttpClient direto)

### 13/04/2026 - Sessão Anterior
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