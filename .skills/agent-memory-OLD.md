# Agent Memory - Notificações e Realtime (Sistema Ecommerce)

## Progresso Atual (Sessão Atualizada)
- **UI Premium Concluída (`PedidoDetailModalComponent`):** Modal construído com design Glassmorphism e suporte completo ao Ionic Dark Mode (SCSS refatorado para usar variáveis semânticas e classes dinâmicas).
- **Correção de Precisão Financeira:** Relatórios (PDF/Excel) e Dashboards agora consideram apenas transações `pagas` e `ativas` para o cálculo de totais e saldos.
- **Integração Web-Push (PWA):** Backend em NestJS agora dispõe de suporte `web-push`. Módulos atrelados à criação de pedidos disparam nativamente os alertas.
- **Gerenciador WebSocket Otimizado:** Implementado no Core do Angular o service `SupabaseRealtimeManagerService` com estratégia de **Leader Election**.

## Rollback Arquitetural (RLS e Custom JWT)
- Tentamos implementar bloqueios RLS rigorosos para o canal WebSockets do Supabase, com o roteamento emitindo *Custom JWTs*.
- **Problema Encontrado:** O ecossistema de *Guards* e `JwtService` nativo do NestJS entrou em colapso devido ao uso dinâmico de `SecretKeys` e regras rígidas de Typescript (`noImplicitAny`), causando erro **401 Unauthorized** em rotas convencionais do App.
- **Solução Descartada por Hora:** Fizemos Rollback de toda a camada de emissão JWT Customizada. O WebSocket agora varre o banco Supabase usando a assinatura padrão de **Anon Key** da API. 

## Para Fazer Amanhã (Next Steps)
1. Validar os novos cálculos financeiros com o usuário final em um cenário de produção/homologação.
2. Monitorar a performance da geração de relatórios com grandes volumes de dados após a adição dos filtros de status.
3. Avançar para a próxima prioridade de Features definidas do MvK Gym.
