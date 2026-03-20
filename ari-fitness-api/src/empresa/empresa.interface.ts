/* eslint-disable prettier/prettier */
import { Service } from '../service/service.interface';

export interface Empresa {
  id?: string;
  created_at?: Date;
  nome_fantasia?: string;
  cnpj?: string;
  logo_url?: string;
  banner_url?: string;
  flag_ativo?: boolean;
  subscription_plan_id?: number;
  default_theme?: string;
  nome?: string;
  telefone?: string;
  email?: string;
  primary_color_hex?: string;
  accept_pix?: boolean;
  accept_credit_card?: boolean;
  accept_debit_card?: boolean;
  accept_money_in_cash?: boolean;
  pgmto_credito_max_parcelas?: number;
  chave_pix?: string;
  openai_key?: string;
  meta_key?: string;

  horarios?: Horario[];
  planos?: Plano[];
  servicos?: Service[];
  updated_at?: Date;
  deleted_at?: Date;
}

export interface Horario {
  id?: number;
  created_at: Date;
  hora_inicio: string;
  hora_fim: string;
  fl_ativo: boolean;
  empresa_id?: Empresa['id'];
}

export interface Plano {
  id?: number;
  created_at?: Date;
  descricao: string;
  qtd_dias_semana: number;
  fl_ativo: boolean;
  preco_padrao: number;
  empresa_id?: string;
  caracteristicas?: string;
}

