/* eslint-disable prettier/prettier */
import { Equipamento } from 'src/equipamento/equipamento.interface';
import { Exercicio } from 'src/exercicio/exercicio.interface';
import { GrupoMuscular } from 'src/grupoMuscular/GrupoMuscular.interface';
import { ParteDoCorpo } from 'src/parte-do-corpo/parte-do-corpo.interface';

export interface Treino {
  id?: number;
  nome: string;
  descricao: string;
  exercicios?: TreinoExercicioRelation[] | Partial<TreinoExercicioRelation>[];
  sessoes?: TreinoSessao[];
  nivel_dificuldade: number;
  fl_ativo: boolean;
  fl_publico: boolean;

  grupo_muscular_id: number;
  grupo_muscular?: GrupoMuscular;
  parte_do_corpo_id: number;
  parte_do_corpo?: ParteDoCorpo;
  cadastrado_por: number;
  carga: number;
}

export interface TreinoExercicioRelation {
  id: number;
  treino_id: number;
  sessao_id?: number;
  exercicio_id: number;
  exercicios?: any;
  exercicio?: Exercicio;
  equipamento_id?: number;
  equipamentos?: Equipamento;
  equipamento?: Equipamento;
  series: number;
  repeticoes: number;
  intervalo: number;
  carga: number;
  ordem: number;
  tipo_execucao: number;
  grupo_execucao?: number;
  tipo_progressao: number;
  carga_series?: any;
}

export interface TreinoSessao {
  id: number;
  treino_id: number;
  nome: string; // A, B, C...
  ordem: number;
  exercicios?: TreinoExercicioRelation[];
}

