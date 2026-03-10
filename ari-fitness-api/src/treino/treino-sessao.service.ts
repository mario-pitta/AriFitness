/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { TreinoSessao, TreinoExercicioRelation } from './Treino.interface';

@Injectable()
export class TreinoSessaoService {
    constructor(private database: DataBaseService) { }

    async createSessao(body: Partial<TreinoSessao>) {
        return this.database.supabase
            .from('treino_sessao')
            .insert(body)
            .select('*');
    }

    async addExercicio(body: Partial<TreinoExercicioRelation>) {
        return this.database.supabase
            .from('treino_exercicio')
            .insert(body)
            .select('*');
    }

    async getTreinoCompleto(treinoId: number) {
        // Busca o treino básico
        const { data: treino, error } = await this.database.supabase
            .from('treino')
            .select('*, grupo_muscular(*), parte_do_corpo(*)')
            .eq('id', treinoId)
            .single();

        if (error || !treino) return { data: null, error };

        // Busca sessoes
        const { data: sessoes, error: sessoesError } = await this.database.supabase
            .from('treino_sessao')
            .select('*')
            .eq('treino_id', treinoId)
            .order('ordem', { ascending: true });

        if (sessoesError) return { data: null, error: sessoesError };

        // Busca exercícios vinculados a sessões
        const { data: exercicios, error: exError } = await this.database.supabase
            .from('treino_exercicio')
            .select('*, exercicios(*), equipamentos(*), grupo_muscular(*), parte_do_corpo(*)')
            .in('sessao_id', sessoes.map(s => s.id))
            .order('ordem', { ascending: true });

        if (exError) return { data: null, error: exError };

        // Agrupa exercícios por sessão
        const sessoesComExercicios = sessoes.map(sessao => ({
            ...sessao,
            exercicios: exercicios.filter(ex => ex.sessao_id === sessao.id)
        }));

        // Exercícios legados (sem sessao_id) vão para uma sessão "A" virtual se não houver sessões, 
        // ou simplesmente ficam avulsos. O requisito diz para atribuir sessao_id nulo à sessao "A" no fetch.
        const exerciciosSemSessao = exercicios.filter(ex => !ex.sessao_id);

        if (exerciciosSemSessao.length > 0 && sessoesComExercicios.length === 0) {
            sessoesComExercicios.push({
                id: 0,
                nome: 'A',
                ordem: 1,
                treino_id: treinoId,
                exercicios: exerciciosSemSessao
            } as any);
        } else if (exerciciosSemSessao.length > 0) {
            // Se já existem sessões mas tem exercícios órfãos, joga na primeira sessão
            sessoesComExercicios[0].exercicios.push(...exerciciosSemSessao);
        }

        return {
            data: {
                ...treino,
                sessoes: sessoesComExercicios
            },
            error: null
        };
    }
}
