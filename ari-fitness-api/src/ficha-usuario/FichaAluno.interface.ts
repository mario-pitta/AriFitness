/* eslint-disable prettier/prettier */
import { Treino } from 'src/treino/Treino.interface';

export interface IFichaAluno {
  id: number | string;
  usuario_id: number;
  cadastrado_por: number;
  descricao: string;
  ficha_data_inicio: Date;
  ficha_data_fim: Date;
  objetivo: string;
  instrutor_id: number;
  treinos?: Partial<Treino>[];
  empresa_id: string;
}
