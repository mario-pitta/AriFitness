/* eslint-disable prettier/prettier */
export interface Plano {
  id: number;
  descricao: string;
  qtd_dias_semana: number;
  fl_ativo: boolean;
  preco_padrao: number;
  empresa_id?: string;
  caracteristicas?: string;
}
