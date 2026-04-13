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

export interface PlanoAssinaturaSystem {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  nome?: string;
  descricao?: string;
  preco?: number;
  intervalo_meses?: number;
  limite_alunos?: number;
  limite_instrutores?: number;
  limite_equipamentos?: number;
  permite_checkin?: boolean;
  permite_ficha?: boolean;
  permite_financeiro?: boolean;
  permite_relatorios?: boolean;
  suporta_whatsapp?: boolean;
  suporta_loja?: boolean;
  pagamento_integrado?: boolean;
  regra_cobranca?: boolean;
  suporte_prioritario?: boolean;
  fl_ativo?: boolean;
  is_destaque?: boolean;
  ordenar?: number;
}

export interface Assinatura {
  id?: string;
  created_at?: Date;
  updated_at?: Date;
  empresa_id?: string;
  plano_assinatura_id?: string;
  status?: 'trial' | 'ativa' | 'pausada' | 'cancelada' | 'vencida';
  data_inicio?: Date;
  data_vencimento?: Date;
  data_cancelamento?: Date;
  valor_pago?: number;
  forma_pagamento?: string;
  transacao_id?: string;
  auto_renovar?: boolean;
  ultima_renovacao?: Date;
  obs?: string;
  fl_ativo?: boolean;
}

export interface PlanoInfo {
  assinatura: {
    id: string;
    status: string;
    data_inicio: string;
    data_vencimento: string;
    valor_pago: number;
    forma_pagamento: string;
    auto_renovar: boolean;
  };
  plano: {
    id: string;
    nome: string;
    descricao: string;
    preco: number;
    intervalo_meses: number;
    limite_alunos: number;
    limite_instrutores: number;
    limite_equipamentos: number;
    permite_checkin: boolean;
    permite_ficha: boolean;
    permite_financeiro: boolean;
    Permite_relatorios: boolean;
    suporta_whatsapp: boolean;
    suporte_prioritario: boolean;
  };
  empresa: {
    id: string;
    nome: string;
  };
  alunos_count: number;
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
  created_at: Date;
  descricao: string;
  qtd_dias_semana: number;
  fl_ativo: boolean;
  preco_padrao: number;
  empresa_id?: string;
  caracteristicas?: string;
}