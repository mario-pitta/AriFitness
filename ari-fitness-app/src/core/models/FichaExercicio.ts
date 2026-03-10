import { Exercicio } from './Exercicio';

export interface FichaExercicio {
    id?: number;
    created_at?: string | Date;
    ficha_sessao_id: number;
    exercicio_id: number;
    exercicio?: Exercicio;
    exercicios?: Exercicio;
    series: number;
    repeticoes: number;
    carga: number;
    intervalo: number;
    ordem: number;
    tipo_execucao: number;
    grupo_execucao?: number;
    tipo_progressao: number;
    carga_series?: any;
}
