/**
 * Interface para Produto do E-commerce
 */
export interface Produto {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  empresa_id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  ativo: boolean;
  categoria?: string;
}

/**
 * Interface para criar/atualizar produto
 */
export interface ProdutoInput {
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  ativo?: boolean;
  categoria?: string;
}

/**
 * Interface para filtros de produto
 */
export interface ProdutoFilters {
  empresa_id: string;
  ativo?: boolean;
  categoria?: string;
  busca?: string;
}