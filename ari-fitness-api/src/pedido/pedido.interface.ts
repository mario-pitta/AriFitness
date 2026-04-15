/**
 * Interface para Pedido do E-commerce
 */
export interface Pedido {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  empresa_id: string;
  cliente_id?: number;
  cliente_cpf?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  valor_total: number;
  valor_desconto?: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'entregue';
  forma_pagamento?: string;
  pago_em?: Date;
  obs?: string;
  fl_ativo: boolean;
  transacao_id?: number;
  itens?: PedidoItem[];
}

/**
 * Interface para Item do Pedido
 */
export interface PedidoItem {
  id?: string;
  pedido_id: string;
  produto_id: string;
  quantidade: number;
  preco_unitario: number;
  desconto?: number;
  subtotal?: number;
  produto_nome?: string;
}

/**
 * Interface para criar pedido
 */
export interface PedidoInput {
  cliente_id?: number;
  cliente_cpf?: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  cliente_obs?: string;
  itens: PedidoItemInput[];
  forma_pagamento?: string;
  obs?: string;
  valor_desconto?: number;
}

/**
 * Interface para item de pedido (input)
 */
export interface PedidoItemInput {
  produto_id: string;
  quantidade: number;
  preco_unitario?: number;
}

/**
 * Interface para filtros de pedido
 */
export interface PedidoFilters {
  empresa_id: string;
  status?: string;
  cliente_nome?: string;
  data_inicio?: string;
  data_fim?: string;
}