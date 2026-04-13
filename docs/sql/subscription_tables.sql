-- =============================================================================
-- Tabelas de Assinatura do Sistema (Planos de Subscription)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabela de Planos de Assinatura do Sistema
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS plano_assinatura_system (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    nome text NOT NULL,
    descricao text,
    preco numeric(10,2) DEFAULT 0,
    intervalo_meses integer DEFAULT 1,
    limite_alunos integer DEFAULT 50,
    limite_instrutores integer DEFAULT 5,
    limite_equipamentos integer DEFAULT 100,
    permite_checkin boolean DEFAULT true,
    permite_ficha boolean DEFAULT true,
    permite_financeiro boolean DEFAULT true,
    permite_relatorios boolean DEFAULT true,
    suporta_whatsapp boolean DEFAULT false,
    suporta_loja boolean DEFAULT false,
    pagamento_integrado boolean DEFAULT false,
    regra_cobranca boolean DEFAULT false,
    suporte_prioritario boolean DEFAULT false,
    fl_ativo boolean DEFAULT true,
    is_destaque boolean DEFAULT false,
    ordenar integer DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- Adicionar colunas se não existirem (para migração de bases existentes)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plano_assinatura_system' AND column_name = 'suporta_loja') THEN
        ALTER TABLE plano_assinatura_system ADD COLUMN suporta_loja boolean DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plano_assinatura_system' AND column_name = 'pagamento_integrado') THEN
        ALTER TABLE plano_assinatura_system ADD COLUMN pagamento_integrado boolean DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'plano_assinatura_system' AND column_name = 'regra_cobranca') THEN
        ALTER TABLE plano_assinatura_system ADD COLUMN regra_cobranca boolean DEFAULT false;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Tabela de Assinaturas
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assinatura (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Relacionamento com empresa
    empresa_id uuid NOT NULL REFERENCES empresa(id),
    
    -- Plano contratado
    plano_assinatura_id uuid NOT NULL REFERENCES plano_assinatura_system(id),
    
    -- Status da assinatura
    status text DEFAULT 'ativa' CHECK (status IN ('trial', 'ativa', 'pausada', 'cancelada', 'vencida')),
    
    -- Datas de vigência
    data_inicio date NOT NULL,
    data_vencimento date NOT NULL,
    data_cancelamento date,
    
    -- Informações de pagamento
    valor_pago numeric(10,2),
    forma_pagamento text,
    transacao_id text,
    
    -- Renovação
    auto_renovar boolean DEFAULT true,
    ultima_renovacao date,
    
    -- Observações
    obs text,
    
    -- Ativo
    fl_ativo boolean DEFAULT true,
    
    UNIQUE(empresa_id, fl_ativo)
);

-- -----------------------------------------------------------------------------
-- Índices para performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_assinatura_empresa ON assinatura(empresa_id);
CREATE INDEX IF NOT EXISTS idx_assinatura_status ON assinatura(status);
CREATE INDEX IF NOT EXISTS idx_assinatura_vencimento ON assinatura(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_plano_assinatura_fl_ativo ON plano_assinatura_system(fl_ativo);

-- -----------------------------------------------------------------------------
-- Triggers para updated_at automático
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plano_assinatura_updated_at BEFORE UPDATE ON plano_assinatura_system
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assinatura_updated_at BEFORE UPDATE ON assinatura
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- Inserir planos iniciais (seed data)
-- -----------------------------------------------------------------------------
INSERT INTO plano_assinatura_system (nome, descricao, preco, intervalo_meses, limite_alunos, permite_checkin, permite_ficha, permite_financeiro, permite_relatorios, suporta_whatsapp, suporta_loja, pagamento_integrado, regra_cobranca, suporte_prioritario, is_destaque, ordenar) VALUES
('Starter', 'Ideal para pequenas academias', 97, 1, 100, true, true, false, false, false, false, false, false, false, false, 0),
('Professional', 'Plano completo com análise de IA', 197, 1, 300, true, true, true, true, false, true, false, false, false, true, 1),
('Enterprise', 'Solução completa para grandes academias', 497, 1, 1000, true, true, true, true, true, true, true, true, true, false, 2)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- View para facilitar queries de planos das empresas
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_assinatura_empresa AS
SELECT 
    a.*,
    p.nome as plano_nome,
    p.descricao as plano_descricao,
    p.preco as plano_preco,
    e.nome as empresa_nome,
    e.cnpj as empresa_cnpj
FROM assinatura a
JOIN plano_assinatura_system p ON p.id = a.plano_assinatura_id
JOIN empresa e ON e.id = a.empresa_id
WHERE a.fl_ativo = true;

-- -----------------------------------------------------------------------------
-- Função para verificar se empresa tem assinatura ativa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_empresa_tem_assinatura_ativa(p_empresa_id uuid)
RETURNS boolean AS $$
DECLARE
    v_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM assinatura 
        WHERE empresa_id = p_empresa_id 
        AND status = 'ativa' 
        AND data_vencimento >= CURRENT_DATE
        AND fl_ativo = true
    ) INTO v_exists;
    
    RETURN COALESCE(v_exists, false);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- -----------------------------------------------------------------------------
-- Função para buscar assinatura ativa da empresa
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_assinatura_ativa(p_empresa_id uuid)
RETURNS TABLE (
    id uuid,
    status text,
    data_inicio date,
    data_vencimento date,
    plano_nome text,
    plano_preco numeric,
    limite_alunos integer
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.status,
        a.data_inicio,
        a.data_vencimento,
        p.nome,
        p.preco,
        p.limite_alunos
    FROM assinatura a
    JOIN plano_assinatura_system p ON p.id = a.plano_assinatura_id
    WHERE a.empresa_id = p_empresa_id
    AND a.status = 'ativa'
    AND a.fl_ativo = true
    ORDER BY a.data_vencimento DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;