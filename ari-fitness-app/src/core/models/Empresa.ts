export interface IEmpresa {
  id?: string;
  cnpj?: string;
  nome?: string;
  nome_fantasia?: string;
  telefone?: string;
  subscription_plan_id?: number;
  email?: string;
  logo_url?: string;
  banner_url?: string;
  horarios?: Horario[];
  planos?: Plano[];
  servicos?: IService[];
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;

  default_theme?: string;
  primary_color_hex?: string;
  accept_pix?: boolean;
  accept_credit_card?: boolean;
  accept_debit_card?: boolean;
  accept_money_in_cash?: boolean;
  pgmto_credito_max_parcelas?: number;
  chave_pix?: string;
  openai_key?: string;
  meta_key?: string;
  
  // Propriedades do catálogo público
  produtos?: any[];
}

export interface IService {
  id?: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  empresa_id?: string;
  default_service_id?: string;
}

export class Empresa implements IEmpresa {
  id?: string;
  cnpj?: string;
  nome?: string;
  nome_fantasia?: string;
  telefone?: string;
  email?: string;
  subscription_plan_id?: number;
  logo_url?: string;
  banner_url?: string;
  horarios?: Horario[];
  planos?: Plano[];
  servicos?: IService[];

  updated_at?: Date;
  deleted_at?: Date;
  created_at?: Date | undefined;


  default_theme?: string;
  primary_color_hex?: string;
  accept_pix?: boolean;
  accept_credit_card?: boolean;
  accept_debit_card?: boolean;
  accept_money_in_cash?: boolean;
  pgmto_credito_max_parcelas?: number;
  chave_pix?: string;
  openai_key?: string;
  meta_key?: string;
  
  produtos?: any[];

  constructor(data?: Partial<IEmpresa>) {
    this.id = data?.id;
    this.cnpj = data?.cnpj;
    this.nome = data?.nome;
    this.nome_fantasia = data?.nome_fantasia;
    this.telefone = data?.telefone;
    this.email = data?.email;
    this.subscription_plan_id = data?.subscription_plan_id;
    this.logo_url = data?.logo_url;
    this.banner_url = data?.banner_url;
    this.horarios = data?.horarios;
    this.planos = data?.planos;
    this.servicos = data?.servicos;
    this.updated_at = data?.updated_at;
    this.deleted_at = data?.deleted_at;
    this.created_at = data?.created_at;
    this.default_theme = data?.default_theme || 'dark';
    this.primary_color_hex = data?.primary_color_hex || '#4d8dff';
    this.accept_pix = data?.accept_pix ?? true;
    this.accept_credit_card = data?.accept_credit_card ?? true;
    this.accept_debit_card = data?.accept_debit_card ?? true;
    this.accept_money_in_cash = data?.accept_money_in_cash ?? true;
    this.pgmto_credito_max_parcelas = data?.pgmto_credito_max_parcelas ?? 1;
    this.chave_pix = data?.chave_pix || '';
    this.openai_key = data?.openai_key || '';
    this.meta_key = data?.meta_key || '';

  }
}

export interface Horario {
  id: number;
  created_at: Date;
  hora_inicio: string;
  hora_fim: string;
  fl_ativo: boolean;
}

export interface Plano {
  id?: number;
  descricao: string;
  fl_ativo: boolean;
  created_at?: Date;
  qtd_dias_semana: number;
  preco_padrao: number;
  caracteristicas?: string;
  empresa_id: Empresa['id'];
}
