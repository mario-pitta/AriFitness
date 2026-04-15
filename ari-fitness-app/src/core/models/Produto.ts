export interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  imagem_url?: string;
  categoria?: string;
  empresa_id?: string;
}
