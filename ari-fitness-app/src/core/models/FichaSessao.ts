import { FichaExercicio } from './FichaExercicio';

export interface FichaSessao {
    id?: number;
    ficha_id: number;
    nome: string;
    ordem: number;
    exercicios?: FichaExercicio[];
}
