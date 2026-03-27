/* eslint-disable prettier/prettier */
export interface Usuario {
  id: number;
  created_at: Date | string;
  nome: string;
  peso: number;
  altura: number;
  cpf: string;
  whatsapp: string;
  horario_id: number;
  horario: any;
  empresa_id: string;
  plano: number;
  data_vencimento: Date | string;
  senha?: string;
  instagram_username?: string
  fl_ativo: boolean;
  foto_url: string;
  avc: boolean;
  dac: boolean;
  diabete: boolean;
  pressao_arterial: string;
  cardiopata: boolean;
  infarto: boolean;
  genero: string;
  fumante: boolean;
  tipo_alimentacao: string;
  tipo_usuario: number | string;
  relato_dor: boolean;
  medicacao_em_uso: string;
  profissao: string;
  fl_pratica_atividade_fisica: boolean;
  objetivo: string | number;
  data_nascimento: Date | string;
  flagAdmin: boolean;
  especialidade?: string;
  email?: string;
  data_ultimo_pagamento?: Date | string;
}
