-- =============================================
-- Script 11: Adicionar empresa_id à tabela exercicios
-- Arquitetura Single Table para Exercícios Customizados
--
-- NULL      = Exercício Global/Oficial (base do sistema)
-- UUID      = Exercício Customizado, vinculado a uma academia
-- =============================================

ALTER TABLE public.exercicios
  ADD COLUMN IF NOT EXISTS empresa_id uuid REFERENCES public.empresas(id) ON DELETE SET NULL;

-- Índice para acelerar a query de busca por tenant
CREATE INDEX IF NOT EXISTS idx_exercicios_empresa_id
  ON public.exercicios (empresa_id);

-- Verificação:
-- SELECT id, nome, empresa_id FROM exercicios ORDER BY empresa_id NULLS FIRST LIMIT 10;
