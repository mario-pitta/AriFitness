Expandir a recuperação de senha para contemplar membros da equipe (instrutores e gestores). Atualmente, o fluxo é restrito a alunos.
Impacto: Segurança e autonomia para todos os níveis de acesso.
Impedimentos: Filtros de consulta no backend que restringem a busca de e-mail por tipo de usuário.
Mitigação: Unificar o serviço de busca de e-mail no backend para a tabela usuario global, validando o tipo_usuario apenas no envio do link.
Caminho Dinâmico: Implementar variáveis de ambiente (env) para que o link no e-mail mude automaticamente entre localhost:8100 e o dominio oficial da plataforma