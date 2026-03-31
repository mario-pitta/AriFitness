import { Exercicio } from './Exercicio';

export interface TreinoExercicio {
    id?: number;
    created_at?: string | Date;
    sessao_id?: number;
    exercicio_id: number;
    exercicio?: Exercicio;
    series: number;
    repeticoes: string;
    carga: number;
    intervalo: number;
    ordem: number;
    tipo_execucao: number; // 1: NORMAL, 2: BI_SET, 3: TRI_SET
    grupo_execucao?: number;
    tipo_progressao: number; // 1: NORMAL, 2: PIRÁMIDE CRESCENTE, 3: DECRESCENTE
    carga_series?: any;
    sugestoes?: any[];
}
