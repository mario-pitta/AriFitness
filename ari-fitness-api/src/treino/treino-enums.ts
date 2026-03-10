/* eslint-disable prettier/prettier */

/**
 * Define o tipo de execução de um exercício dentro de uma sessão.
 * 1 = NORMAL: exercício isolado
 * 2 = BI_SET: dois exercícios executados em sequência sem descanso
 * 3 = TRI_SET: três exercícios executados em sequência sem descanso
 */
export enum TipoExecucao {
    NORMAL = 1,
    BI_SET = 2,
    TRI_SET = 3,
}

/**
 * Define a progressão de carga ao longo das séries.
 * 1 = NORMAL: mesma carga em todas as séries
 * 2 = PIRAMIDE_CRESCENTE: carga aumenta a cada série
 * 3 = PIRAMIDE_DECRESCENTE: carga diminui a cada série
 */
export enum TipoProgressao {
    NORMAL = 1,
    PIRAMIDE_CRESCENTE = 2,
    PIRAMIDE_DECRESCENTE = 3,
}
