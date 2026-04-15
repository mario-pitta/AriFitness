export interface ItemCarrinho {
  produto_id: string;
  nome: string;
  preco: number;
  quantidade: number;
  imagem_url?: string;
}

export interface DadosCliente {
  cpf: string;
  nome: string;
  telefone: string;
  email: string;
}
