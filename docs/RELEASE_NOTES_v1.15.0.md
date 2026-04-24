# Release Notes - v1.15.0

## Período de Desenvolvimento

- **Versão Anterior**: v1.14.0
- **Versão Atual**: v1.15.0
- **Data de Início**: 13/04/2026 19:08
- **Data de Conclusão**: 23/04/2026 15:34
- **Duração Total**: ~10 dias

---

## Métricas de Produtividade

| Métrica | Valor |
|--------|-------|
| Total de Commits | 89 |
| Arquivos Alterados | 184 |
| Linhas Adicionadas | +13.444 |
| Linhas Removidas | -471 |
| Linhas Líquidas | +12.973 |
| Dias de Desenvolvimento | 10 |
| Média Commits/Dia | 8.9 |

---

## Novas Funcionalidades

### 1. Módulo E-commerce Completo
- **Catálogo Público**: Página de produtos acessível sem login
- **Detalhes do Produto**: Modal com informações completas
- **Carrinho de Compras**: ReactiveForms com validações
- **Máscaras**: CPF, telefone e validação de email
- **Campo Observações**:自由 texto no formulário
- **PDV (Ponto de Venda)**: Interface administrativa completa
  - Lista de produtos com filtros
  - Carrinho com desconto (% ou valor fixo)
  - Forma de pagamento (PIX, dinheiro, cartão)
  - Dados do cliente (nome, telefone, CPF)
  - Expansão do carrinho

### 2. Gestão de Pedidos
- **Backend REST**: Endpoints completo (CRUD)
- **Frontend Admin**: Página de pedidos com skeleton loading
- **Modal de Detalhes**: Visualização completa do pedido
- **Alertas em Tempo Real**: Supabase Realtime integrado

### 3. Sistema de Notificações Push
- **Módulo Backend**: PushNotificationModule
- **Integração Firebase**: Envio de notificações push
- **Alertas em Tempo Real**: Para pedidos e eventos

### 4. Integração WhatsApp
- **Evolution API**: Conexão com API externa
- **Serviços Backend**: evolution.service.ts
- **Página de Configuração**: Painel admin para gerenciamento
- **Envio de Mensagens**: Modal para enviar mensagens
- **Templates**: Mensagens pré-definidas

### 5. Sistema de Planos e Assinaturas
- **AssinaturaController**: Gestão de planos
- **EmpresaInterface**: Model atualizado com campos de plano
- **Loja da Academia**: Flag habilitada por plano
- **Pagamento Integrado**:Flag habilitada por plano
- **Regra de Cobrança Personalizada**: Flag habilitada por plano
- **Página de Planos**: Interface com métricas
- **IA para funcionalidades**: Sugestões por IA

### 6. Controle de Permissões
- **RolesGuard**: Proteção de rotas por perfil
- **UnauthorizedPage**: Página de acesso negado
- **Perfis**: Usuário, Admin, Gerente

### 7. Melhorias no Backend
- **Decorator @Public**: Rotas públicas autenticadas
- **JWT Auth**: Guard ajustes e logging
- **TypeScript**: Configurações atualizadas
- **Testes**: Arquivos spec.ts adicionados

### 8. Documentação
- **AGENT_MEMORY.md**: Contexto do projeto
- **Regras de Commit**: fullstack.md
- **Arquivos SQL**: Tabelas de e-commerce e assinaturas

---

## Correções de Bugs

| Bug | Correção |
|-----|-----------|
| Altura inconsistente dos cards | Height fixo nos cards de produtos |
| Largura dos cards | Utilizado height fixo |
| Máscara Maskito Ionic | Adaptada para Ionic |
| CPF/telefone validação | Validadores adicionados |
| Skeleton loading | Correção para carregar apenas nos itens |
| JWT Guard | Lança UnauthorizedException |
| Filtro fl_pago Dashboard | Considera apenas transações pagas |

---

## Estrutura de Arquivos Criados/Alterados

### Backend (NestJS)
- `src/pedido/*` - Módulo de pedidos
- `src/produto/*` - Módulo de produtos
- `src/push-notification/*` - Push notifications
- `src/evolution/*` - Integração WhatsApp
- `src/empresa/assinatura/*` - Sistema de planos

### Frontend (Ionic)
- `src/app/adm-page/pdv/*` - PDV
- `src/app/adm-page/ecommerce/*` - E-commerce admin
- `src/app/catalog-public/*` - Catálogo público
- `src/app/carrinho-modal/*` - Carrinho
- `src/app/produto-detail-modal/*` - Detalhes do produto
- `src/app/whatsapp-config/*` - Configuração WhatsApp
- `src/app/plano-page/*` - Planos
- `src/app/unauthorized-page/*` - Acesso negado

### Services
- `pedido.service.ts`
- `produto.service.ts`
- `carrinho.service.ts`
- `evolution.service.ts`
- `supabase-realtime-manager.service.ts`

---

## Próximos Passos

### Alta Prioridade
1. **Integração de Pagamento** - Stripe/MercadoPago para checkout
2. **Webhook de Notificações** - Receber eventos de pagamento
3. **Relatórios de Vendas** - Dashboard de e-commerce
4. **Gestão de Estoque** - Controle de inventário

### Média Prioridade
5. **Cupons de Desconto** - Sistema de cupons
6. **Frete Entrega** - Cálculo de frete
7. **Rastreamento Pedido** - Status de entrega
8. **Avaliações de Produtos** - Sistema de reviews

### Baixa Prioridade
9. **Wishlist** - Lista de desejos
10. **Comparar Produtos** - Comparação lado a lado
11. **Histórico de Compras** - Cliente visualiza pedidos
12. **Newsletter** - Emails marketing

---

## Estatísticas por Categoria

| Categoria | Quantidade |
|-----------|------------|
| feat (Novas funcionalidades) | ~65 |
| fix (Correções) | ~8 |
| refactor (Refatorações) | ~10 |
| style (Estilos) | ~2 |
| chore (Manutenção) | ~4 |

---

## tecnologias Adotadas

- **Firebase Cloud Messaging** - Push notifications
- **Evolution API** - WhatsApp
- **Supabase Realtime** - Tempo real
- **Maskito** - Máscaras de input
- **ReactiveForms** - Formulários reativos

---

*Documento gerado automaticamente em 23/04/2026*