-- =============================================================================
-- Tabelas de E-commerce para Academias
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tabela de Produtos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS produtos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Multi-tenant
    empresa_id uuid NOT NULL REFERENCES empresa(id),
    
    -- Dados do produto
    nome text NOT NULL,
    descricao text,
    preco numeric(10,2) NOT NULL,
    estoque integer DEFAULT 0,
    estoque_minimo integer DEFAULT 5,
    imagem_url text,
    
    -- Controle
    ativo boolean DEFAULT true,
    categoria text,
    
    UNIQUE(empresa_id, nome)
);

-- -----------------------------------------------------------------------------
-- Tabela de Pedidos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    
    -- Multi-tenant
    empresa_id uuid NOT NULL REFERENCES empresa(id),
    
    -- Cliente (opcional - pode ser aluno ou não)
    cliente_id uuid REFERENCES usuarios(id),
    cliente_nome text,
    cliente_telefone text,
    cliente_email text,
    
    -- Totais
    valor_total numeric(10,2) NOT NULL,
    valor_desconto numeric(10,2) DEFAULT 0,
    
    -- Status
    status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado', 'entregue')),
    
    -- Pagamento
    forma_pagamento text,
    pago_em timestamp with time zone,
    
    -- Observações
    obs text,
    
    -- Ativo (soft delete)
    fl_ativo boolean DEFAULT true
);

-- -----------------------------------------------------------------------------
-- Tabela de Itens do Pedido
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedido_itens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    
    -- Relacionamentos
    pedido_id uuid NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id uuid NOT NULL REFERENCES produtos(id),
    
    -- Dados do item
    quantidade integer NOT NULL CHECK (quantidade > 0),
    preco_unitario numeric(10,2) NOT NULL,
    desconto numeric(10,2) DEFAULT 0,
    
    -- Subtotal calculado
    subtotal numeric(10,2) GENERATED ALWAYS AS (quantidade * preco_unitario - COALESCE(desconto, 0)) STORED
);

-- -----------------------------------------------------------------------------
-- Índices para performance
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_produtos_empresa ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_ativo ON produtos(ativo);
CREATE INDEX IF NOT EXISTS idx_produtos_estoque_baixo ON produtos(empresa_id, estoque) WHERE estoque <= estoque_minimo;

CREATE INDEX IF NOT EXISTS idx_pedidos_empresa ON pedidos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created ON pedidos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_produto ON pedido_itens(produto_id);

-- -----------------------------------------------------------------------------
-- Triggers para updated_at automático
-- -----------------------------------------------------------------------------
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON produtos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- View para produtos com estoque baixo
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_produtos_estoque_baixo AS
SELECT 
    p.id,
    p.empresa_id,
    p.nome,
    p.estoque,
    p.estoque_minimo,
    e.nome as empresa_nome
FROM produtos p
JOIN empresa e ON e.id = p.empresa_id
WHERE p.ativo = true AND p.estoque <= p.estoque_minimo;

-- -----------------------------------------------------------------------------
-- View para pedidos com itens
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_pedidos_com_itens AS
SELECT 
    ped.id,
    ped.empresa_id,
    ped.cliente_nome,
    ped.status,
    ped.valor_total,
    ped.created_at,
    json_agg(
        json_build_object(
            'nome', prod.nome,
            'quantidade', pi.quantidade,
            'preco_unitario', pi.preco_unitario,
            'subtotal', pi.subtotal
        )
    ) as itens
FROM pedidos ped
LEFT JOIN pedido_itens pi ON pi.pedido_id = ped.id
LEFT JOIN produtos prod ON prod.id = pi.produto_id
WHERE ped.fl_ativo = true
GROUP BY ped.id, ped.empresa_id, ped.cliente_nome, ped.status, ped.valor_total, ped.created_at
ORDER BY ped.created_at DESC;

-- -----------------------------------------------------------------------------
-- Função para criar pedido com validação de estoque
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_criar_pedido_com_estoque(
    p_empresa_id uuid,
    p_cliente_id uuid,
    p_cliente_nome text,
    p_cliente_telefone text,
    p_itens jsonb,
    p_forma_pagamento text
)
RETURNS uuid AS $$
DECLARE
    v_pedido_id uuid;
    v_item jsonb;
    v_produto_id uuid;
    v_estoque_atual integer;
    v_preco numeric(10,2);
    v_valor_total numeric(10,2) := 0;
BEGIN
    -- Validar estoque de todos os itens primeiro
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
        v_produto_id := (v_item->>'produto_id')::uuid;
        
        SELECT estoque, preco INTO v_estoque_atual, v_preco
        FROM produtos
        WHERE id = v_produto_id AND empresa_id = p_empresa_id AND ativo = true;
        
        IF v_estoque_atual IS NULL THEN
            RAISE EXCEPTION 'Produto não encontrado ou inativo';
        END IF;
        
        IF v_estoque_atual < (v_item->>'quantidade')::integer THEN
            RAISE EXCEPTION 'Estoque insuficiente para produto %', v_produto_id;
        END IF;
    END LOOP;
    
    -- Criar pedido
    INSERT INTO pedidos (empresa_id, cliente_id, cliente_nome, cliente_telefone, forma_pagamento, valor_total)
    VALUES (p_empresa_id, p_cliente_id, p_cliente_nome, p_cliente_telefone, p_forma_pagamento, 0)
    RETURNING id INTO v_pedido_id;
    
    -- Inserir itens e atualizar estoque
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_itens)
    LOOP
        v_produto_id := (v_item->>'produto_id')::uuid;
        
        SELECT estoque, preco INTO v_estoque_atual, v_preco
        FROM produtos
        WHERE id = v_produto_id;
        
        INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario)
        VALUES (v_pedido_id, v_produto_id, (v_item->>'quantidade')::integer, v_preco);
        
        v_valor_total := v_valor_total + ((v_item->>'quantidade')::integer * v_preco);
        
        -- Atualizar estoque
        UPDATE produtos SET estoque = estoque - (v_item->>'quantidade')::integer
        WHERE id = v_produto_id;
    END LOOP;
    
    -- Atualizar valor total
    UPDATE pedidos SET valor_total = v_valor_total WHERE id = v_pedido_id;
    
    RETURN v_pedido_id;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Função para atualizar status do pedido
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_atualizar_status_pedido(p_pedido_id uuid, p_status text)
RETURNS void AS $$
BEGIN
    UPDATE pedidos 
    SET status = p_status, 
        pago_em = CASE WHEN p_status = 'pago' THEN now() ELSE pago_em END
    WHERE id = p_pedido_id;
    
    -- Se cancelado, devolver ao estoque
    IF p_status = 'cancelado' THEN
        UPDATE produtos p
        SET p.estoque = p.estoque + pi.quantidade
        FROM pedido_itens pi
        WHERE pi.pedido_id = p_pedido_id AND pi.produto_id = p.id;
    END IF;
END;
$$ LANGUAGE plpgsql;