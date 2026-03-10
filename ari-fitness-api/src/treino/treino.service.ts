/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/providers#services
*/
import { DataBaseService } from 'src/datasource/database.service';

import { Injectable } from '@nestjs/common';
import { Treino, TreinoExercicioRelation } from './Treino.interface';

@Injectable()
export class TreinoService {
  constructor(private database: DataBaseService) { }

  private buidTreinoExercicioBody(
    ex: TreinoExercicioRelation,
    treino_id: number,
  ) {
    return {
      series: ex.series,
      repeticoes: ex.repeticoes,
      intervalo: ex.intervalo,
      carga: ex.carga,
      exercicio_id: (ex.exercicio?.id || (ex as any).exercicios?.id || 0) as number,
      equipamento_id: ex.equipamento?.id,
      treino_id: treino_id,
      sessao_id: ex.sessao_id,
      ordem: ex.ordem,
      tipo_execucao: ex.tipo_execucao,
      grupo_execucao: ex.grupo_execucao,
      tipo_progressao: ex.tipo_progressao,
      carga_series: ex.carga_series,
    };
  }


  findAll(filters: Treino) {
    return this.database.supabase
      .from('treino')
      .select(
        `
        *,
        grupo_muscular(*),
        parte_do_corpo(*),
        sessoes:treino_sessao(
          *,
          exercicios:treino_exercicio(
            *,
            exercicios(*),
            equipamentos(*)
          )
        )`,
      )
      .match({ ...filters })
      .order('nome', {
        ascending: true,
      });
  }
  create(body: Treino) {
    let exercicios = body.exercicios;
    delete body.exercicios;
    delete body.grupo_muscular;
    delete body.parte_do_corpo;
    delete body.id;

    const sessions = body.sessoes;
    delete body.sessoes;


    console.log('body after exercicios delete....', body);
    console.log('exercicios extracted....', exercicios);

    return this.database.supabase
      .from('treino')
      .insert(body)
      .select('*')
      .then(async (res) => {
        if (res.error) {
          console.error(res.error);
          return res;
        }

        const treino_id = res.data[0].id;
        console.log('saved TREINO', res.data);

        let allExercicios = exercicios || [];

        if (sessions) {
          const sessionsToInsert = sessions.map((s: any) => {
            const { exercicios, ...rest } = s;
            return { ...rest, treino_id };
          });

          const { data: sessionsData, error: sessionsError } = await this.database.supabase
            .from('treino_sessao')
            .insert(sessionsToInsert)
            .select('*')
            .then((e) => e);

          if (sessionsError) {
            console.error('Error inserting sessions, rolling back treino...', sessionsError);
            await this.database.supabase.from('treino').delete().eq('id', treino_id);
            return { data: null, error: sessionsError };
          }

          if (sessionsData) {
            sessions.forEach((s: any) => {
              const dbSession = sessionsData.find(sd => sd.nome === s.nome);
              if (s.exercicios && s.exercicios.length > 0) {
                s.exercicios.forEach((ex: any) => {
                  ex.sessao_id = dbSession?.id;
                  allExercicios.push(ex);
                });
              }
            });
          }
        }

        if (allExercicios && allExercicios.length > 0) {
          const exerciciosToInsert = allExercicios.map((ex: TreinoExercicioRelation) => {
            return this.buidTreinoExercicioBody(ex, treino_id);
          });

          console.log('associating exercicios', exerciciosToInsert);

          const { data, error } = await this.database.supabase
            .from('treino_exercicio')
            .insert(exerciciosToInsert)
            .select('*')
            .then((e) => e);

          if (error) {
            console.error('Error inserting exercises, rolling back treino...', error);
            await this.database.supabase.from('treino').delete().eq('id', treino_id);
            return { data: null, error: error };
          }

          return {
            ...res,
            data: {
              ...(res.data as unknown as Treino[]),
              exercicios: data,
            },
          } as any;
        }

        return res;
      });
  }

  /**
   * The function `update` in TypeScript updates a training record in a database, including handling
   * related exercises.
   * @param {Treino} body - The `update` function you provided seems to be updating a training plan in a
   * database. It first extracts the exercises from the body, deletes them from the body object, and
   * then updates the training plan in the 'treino' table. After updating the training plan, it deletes
   * existing exercises associated with
   * @returns The `update` method is returning a Promise that resolves to an object containing the
   * updated `treino` data along with the newly inserted `exercicios` data. The structure of the
   * returned object is as follows:
   */
  update(body: Treino) {
    let exercicios: TreinoExercicioRelation[] = (body.exercicios as any[]) || [];
    const sessions = body.sessoes;

    delete body.sessoes;
    delete body.exercicios;
    delete body.grupo_muscular;
    delete body.parte_do_corpo;



    return this.database.supabase
      .from('treino')
      .update(body)
      .eq('id', body.id)
      .select('*')
      .then(async (res) => {
        if (res.error) return res;

        // Fetch existing sessions if we need to clear exercicios properly
        const { data: existingSessions } = await this.database.supabase
          .from('treino_sessao')
          .select('id')
          .eq('treino_id', body.id);

        const existingSessionIds = existingSessions?.map(s => s.id) || [];

        if (existingSessionIds.length > 0) {
          const { error } = await this.database.supabase
            .from('treino_exercicio')
            .delete()
            .in('sessao_id', existingSessionIds)
            .then((e) => e);

          if (error) {
            console.error(error);
            return res;
          }
        }


        if (sessions) {

          console.log('sessions = ', sessions)

          const sessionsToUpsert = sessions.map((s: any) => {
            const { exercicios, ...rest } = s;
            return { ...rest, treino_id: body.id };
          });

          const { data: sessionsData, error: sessionsError } = await this.database.supabase
            .from('treino_sessao')
            .upsert(sessionsToUpsert)
            .select('*')
            .then((e) => {


              return e

            });

          if (sessionsError) {
            console.error(sessionsError);
            return res;
          }

          if (sessionsData) {
            sessions.forEach((s: any) => {
              const dbSession = sessionsData.find(sd => sd.nome === s.nome);
              if (s.exercicios && s.exercicios.length > 0) {
                s.exercicios.forEach((ex: any) => {
                  ex.sessao_id = dbSession?.id;
                  exercicios.push(ex);
                });
              }
            });
          }
        }

        if (exercicios && exercicios.length > 0) {
          const { data: _data, error: _error } = await this.database.supabase
            .from('treino_exercicio')
            .insert(
              exercicios.map((ex: TreinoExercicioRelation) => {
                return this.buidTreinoExercicioBody(ex, body.id as number);
              }),
            );

          if (_error) {
            console.error(_error);

            return {
              ...res,
              error: _error,
            };
          }

          return {
            ...res,
            data: {
              ...res.data,
              exercicios: _data,
            },
          };
        }

        return res;
      });
  }

  async delete(id: number) {
    // Delete exercises corresponding to the sessions of this treino
    const { data: existingSessions } = await this.database.supabase
      .from('treino_sessao')
      .select('id')
      .eq('treino_id', id);

    const existingSessionIds = existingSessions?.map(s => s.id) || [];

    if (existingSessionIds.length > 0) {
      await this.database.supabase
        .from('treino_exercicio')
        .delete()
        .in('sessao_id', existingSessionIds);
    }

    return this.database.supabase
      .from('treino')
      .delete()
      .eq('id', id)
      .select('*');
  }
}
