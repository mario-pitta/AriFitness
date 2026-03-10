import { TreinoExercicio } from './TreinoExercicio';

export interface TreinoSessao {
    id?: number;
    treino_id?: number;
    nome: string; // A, B, C, D, E, F
    ordem: number;
    exercicios?: TreinoExercicio[];
}
