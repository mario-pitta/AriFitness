# ===============================================
# 🛡️ SKILL: SEGURANÇA, CONSTANTES E OPERAÇÃO SEGURA
# ===============================================

Esta skill define as diretrizes críticas para manipulação de código, segurança de endpoints e consistência de dados no ecossistema AriFitness.

---

# 🛡️ SEGURANÇA E ACESSO (ROLESGUARD)

### 1. Proteção de Endpoints
- **Obrigatório**: Todo endpoint que manipule dados sensíveis ou administrativos DEVE estar protegido pelo [RolesGuard](cci:2://file:///d:/DevExperiences/AriFitness/ari-fitness-api/src/auth/guards/roles.guard.ts:5:0-27:1).
- **Uso do Decorator**: Utilize `@Roles(UserRole.GESTOR, UserRole.INSTRUTOR)` conforme a necessidade.
- **Blindagem**: Nunca assumir que a autenticação JWT é suficiente; a validação de Role é o que evita o vazamento de dados entre perfis (ex: Aluno tentando acessar dados de faturamento).

### 2. Constantes de Usuário
- **Fidelidade ao Banco**: As constantes de `UserRole` e `tipo_usuario` devem corresponder EXATAMENTE aos valores no banco de dados Supabase:
  - `GESTOR`
  - `INSTRUTOR`
  - `ALUNO`
- **Sincronia**: Alterações em constantes devem ser aplicadas simultaneamente no Backend (`ari-fitness-api`) e Frontend (`ari-fitness-app`).

---

# 🛠️ OPERAÇÃO E MANIPULAÇÃO DE CÓDIGO (CRÍTICO)

### 1. Proibição de Comandos Globais Destrutivos
- **⚠️ REGRA DE OURO**: **NUNCA** utilize comandos de substituição global como `sed`, `grep -l` ou similares para remover padrões de texto (ex: `console.log`) em massa.
- **Risco**: Comandos de linha única podem corromper blocos de código multilinhas, quebrar a indentação e causar o colapso do projeto.
- **Ação Correta**: A remoção de logs ou refatoração deve ser feita de forma **cirúrgica e manual**, arquivo por arquivo, garantindo que o contexto ao redor não seja afetado.

### 2. Gerenciamento de Logs de Depuração
- **Logs Estratégicos**: Use logs detalhados durante a depuração para rastrear o fluxo de dados (especialmente entre Frontend e Backend).
- **Limpeza**: Após a validação da funcionalidade, remova os logs manualmente para manter o código limpo e seguro (evitando exposição de dados sensíveis em produção).

---

# 👤 CONSISTÊNCIA DE PERFIS

### 1. Mapeamento de Usuário vs Member
- Sempre considerar a dualidade entre a tabela `usuario` (`tipo_usuario`) e a tabela `team_member` (`function_id`).
- No fluxo de autenticação, garantir que o perfil seja normalizado para que o [RolesGuard](cci:2://file:///d:/DevExperiences/AriFitness/ari-fitness-api/src/auth/guards/roles.guard.ts:5:0-27:1) funcione corretamente, independente de onde o usuário esteja registrado.

### 2. Login e Permissões
- Ao modificar o [AuthService](cci:2://file:///d:/DevExperiences/AriFitness/ari-fitness-app/src/core/services/auth/auth.service.ts:9:0-117:1), certifique-se de que o objeto retornado no JWT contenha a role correta e normalizada, evitando falhas de "403 Forbidden" por incompatibilidade de strings.

---

### 🔥 DIRETRIZ FINAL DE SEGURANÇA
Em caso de dúvida entre praticidade e segurança:
👉 **Priorize a segurança e a integridade do código.** É melhor gastar mais tempo editando arquivos individualmente do que arriscar a estabilidade do sistema com comandos automatizados agressivos.
