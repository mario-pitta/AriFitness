import { IEmpresa, Plano } from './Empresa';
import { FichaAluno } from './FichaAluno';
import { Historico } from './Historico';
import { Horario } from './Horario';

import { Treino } from './Treino';

export interface IUsuario {
  idade?: any;
  id?: number;
  created_at?: Date | string;
  nome: string;
  peso: number;
  altura: number;
  cpf: string;
  whatsapp: string;
  plano: number;
  planos: Plano;
  horario_id: number;
  horarios: Horario;
  data_vencimento: number;
  senha: string;
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
  /** The `tipo_usuario` property in the `IUsuario` interface and `Usuario` class is defining the type
  of user. It can be either a string or a number, allowing flexibility in how the user type is
  represented in the data structure. This property can be used to categorize users based on
  // 1 - ADMIN 2 - INSTRUTOR 3- ALUNO
  different criteria or roles within the system.
  *
  */

  tipo_usuario: string | number;
  relato_dor: boolean;
  medicacao_em_uso: string;
  profissao: string;
  fl_pratica_atividade_fisica: boolean;
  objetivo: string | number;
  data_nascimento: Date | string;
  flagAdmin: boolean;
  ficha_aluno?: FichaAluno[];
  historico?: Historico[];
  empresa_id?: string;
  empresa?: Partial<IEmpresa>;
  data_ultimo_pagamento?: Date | string;
  fl_pago?: boolean;
  fl_adimplente?: boolean;
  status_pagamento?: {
    label: string;
    errors: string[];
  } | any;
  cref?: string;
  especialidade?: string;
  turno?: string;
  funcao?: string;
  email?: string;
}
export class Usuario implements IUsuario {
  idade?: any;
  id?: number;
  created_at?: Date | string;
  nome!: string;
  peso!: number;
  altura!: number;
  cpf!: string;
  whatsapp!: string;
  plano!: number;
  planos!: Plano;
  horario_id!: number;
  horarios!: Horario;
  data_vencimento!: number;
  senha!: string;
  fl_ativo!: boolean;
  foto_url!: string;
  avc!: boolean;
  dac!: boolean;
  diabete!: boolean;
  pressao_arterial!: string;
  cardiopata!: boolean;
  infarto!: boolean;
  genero!: string;
  fumante!: boolean;
  tipo_alimentacao!: string;
  tipo_usuario!: string | number;
  relato_dor!: boolean;
  medicacao_em_uso!: string;
  profissao!: string;
  fl_pratica_atividade_fisica!: boolean;
  objetivo!: string | number;
  data_nascimento!: Date | string;
  flagAdmin!: boolean;
  ficha_aluno?: FichaAluno[];
  historico?: Historico[];
  empresa_id?: string;
  empresa?: Partial<IEmpresa> | undefined;
  image_url?: string;
  data_ultimo_pagamento?: Date | string;
  fl_pago?: boolean;
  fl_adimplente?: boolean;
  status_pagamento?: {
    label: string;
    errors: string[];
  } | any;
  cref?: string;
  especialidade?: string;
  turno?: string;
  funcao?: string;

  constructor(obj: IUsuario) {
    Object.assign(this, obj);
  }
}

interface obj {
  report: '[CONTEÚDO DO RELATÓRIO DETALHADO EM FORMATO MARKDOWN CONFORME A ESTRUTURA DEFINIDA ACIMA, SEM INCLUIR NENHUM BLOCO JSON DENTRO DESTA STRING]';
  data: {
    fluxoDeCaixa: number;
    totalDescontos: number;
    problemas: [
      {
        name: 'string';
        probabilidade: number; // (em porcentagem, soma deve ser 100)
      }
      // ... mais problemas
    ];
    causas: [
      {
        name: 'string';
        probabilidade: number; // (em porcentagem, soma deve ser 100)
      }
      // ... mais causas
    ];
    melhorias: [
      {
        name: 'string';
        probabilidade: number; // (em porcentagem, soma deve ser 100)
      }
      // ... mais melhorias
    ];
    chartData: [
      {
        name: 'Receitas vs Despesas';
        type: 'barra';
        series: [
          { name: 'Receitas'; value: number },
          { name: 'Despesas'; value: number }
        ];
      },
      {
        name: 'Distribuição de Receitas';
        type: 'pizza';
        series: [
          { name: 'string'; value: number } // Ex: { "name": "Mensalidades", "value": 15000 }
          // ... mais categorias de receita
        ];
      },
      {
        name: 'Distribuição de Despesas';
        type: 'pizza';
        series: [
          { name: 'string'; value: number } // Ex: { "name": "Salários", "value": 8000 }
          // ... mais categorias de despesa
        ];
      }
    ];
  };
  orientacoes: '[TEXTO SIMPLES, SEM MARKDOWN, contendo orientações adicionais ou ressalvas importantes]';
}
