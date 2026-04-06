/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { IFichaAluno } from './FichaAluno.interface';
import { TreinoSessaoService } from 'src/treino/treino-sessao.service';


@Injectable()
export class FichaAlunoService {
  constructor(
    private database: DataBaseService,
    private treinoSessaoService: TreinoSessaoService,
  ) { }

  async applyTemplateToStudent(treinoId: number, fichaId: number, empresa_id: string) {
    // 1. Buscar o template completo
    const { data: template, error: templateError } = await this.treinoSessaoService.getTreinoCompleto(treinoId, empresa_id);

    if (templateError || !template) {
      return { data: null, error: templateError || 'Template não encontrado' };
    }

    const { sessoes } = template;

    // 2. Para cada sessão do template, duplicar para a ficha
    for (const sessaoTemplate of (sessoes || [])) {
      const { data: novaSessaoData, error: sessaoError } = await this.database.supabase
        .from('ficha_sessao')
        .insert({
          ficha_id: fichaId,
          nome: sessaoTemplate.nome,
          ordem: sessaoTemplate.ordem,
          created_at: new Date()
        })
        .select('*')
        .single();

      if (sessaoError) {
        console.error('Erro ao criar ficha_sessao:', sessaoError);
        continue;
      }

      // 3. Criar os exercícios da sessão
      const exerciciosFicha = (sessaoTemplate.exercicios || []).map((exTemplate: any) => ({

        ficha_sessao_id: novaSessaoData.id,
        exercicio_id: exTemplate.exercicio_id,
        series: exTemplate.series,
        repeticoes: exTemplate.repeticoes,
        carga: exTemplate.carga,
        intervalo: exTemplate.intervalo,
        ordem: exTemplate.ordem,
        tipo_execucao: exTemplate.tipo_execucao,
        grupo_execucao: exTemplate.grupo_execucao,
        tipo_progressao: exTemplate.tipo_progressao,
        carga_series: exTemplate.carga_series,
        created_at: new Date()
      }));

      if (exerciciosFicha.length > 0) {
        const { error: exError } = await this.database.supabase
          .from('ficha_exercicio')
          .insert(exerciciosFicha);

        if (exError) console.error('Erro ao criar ficha_exercicio:', exError);
      }
    }

    return { data: 'Template aplicado com sucesso', error: null };
  }

  findAll(filters?: IFichaAluno | Partial<IFichaAluno>) {
    return this.database.supabase
      .from('ficha_aluno')
      .select(
        `
            *,
             cadastrado_por: usuario!ficha_aluno_cadastrado_por_fkey(id, nome),
           instrutor: team_member(id, nome),
             aluno: usuario!ficha_aluno_usuario_id_fkey(id, nome)
           
        `,
      )
      .match({ ...filters })
      .then((res) => {
        if (res.error) return res;

        return res;
      });
  }

  getById(id: number) {
    return this.database.supabase
      .from('ficha_aluno')
      .select(
        `
            *,
             cadastrado_por: usuario!ficha_aluno_cadastrado_por_fkey(id, nome),
            instrutor: team_member(id, nome),
             aluno: usuario!ficha_aluno_usuario_id_fkey(id, nome),
            treinos_cadastrados: ficha_aluno_treino(
                treino(
                    *,
                    exercicios: treino_exercicio(
                        *,
                        exercicio: exercicios(
                            *,
                            equipamento: equipamentos(*),
                            grupo_muscular(*)
                        )
                    )
                )
            ),
            sessoes: ficha_sessao(
                *,
                exercicios: ficha_exercicio(
                    *,
                    exercicio: exercicios(
                        *,
                        equipamento: equipamentos(*),
                        grupo_muscular(*)
                    )
                )
            )
        `,


      )
      .eq('id', id)
      .then((res) => {

        console.log('res = ', res)

        if (res.error) return res;

        return res;
      });
  }

  getByUser(userId: number, filters: Partial<IFichaAluno>) {
    return this.database.supabase
      .from('ficha_aluno')
      .select(
        `
            *, 
            cadastrado_por: usuario!ficha_aluno_cadastrado_por_fkey(id, nome),
           instrutor: team_member(id, nome),
            aluno: usuario!ficha_aluno_usuario_id_fkey(id, nome),
            treinos_cadastrados: ficha_aluno_treino(
                treino(
                    *,
                    exercicios: treino_exercicio(
                        *,
                        exercicio: exercicios(
                            *,
                            equipamento: equipamentos(*),
                            grupo_muscular(*)
                        )
                    )
                )
            ),
            sessoes: ficha_sessao(
                *,
                exercicios: ficha_exercicio(
                    *,
                    exercicio: exercicios(
                        *,
                        equipamento: equipamentos(*),
                        grupo_muscular(*)
                    )
                )
            )
        `,

      )
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })

      .match({ ...filters })
      .then(async (res) => {
        if (res.error) return res;

        return res;
      });
  }

  async create(body: IFichaAluno | any) {
    const sessoes = body.sessoes;
    delete body.sessoes;
    delete body.id;
    delete body.created_at;
    delete body.updated_at;
    delete body.treinos;
    delete body.treinos_cadastrados;


    console.log('body = ', body)

    try {
      // 1. Deactivate old records
      await this.database.supabase
        .from('ficha_aluno')
        .update({ fl_ativo: false })
        .eq('usuario_id', body.usuario_id)
        .eq('empresa_id', body.empresa_id);

      // 2. Insert main record
      const { data: ficha, error: fichaError } = await this.database.supabase
        .from('ficha_aluno')
        .insert(body)
        .select('id')
        .single();

      if (fichaError) throw fichaError;
      const fichaId = ficha.id;

      try {
        if (sessoes && sessoes.length > 0) {
          for (const sessao of sessoes) {
            const exerciciosSessao = sessao.exercicios;
            delete sessao.id;
            delete sessao.created_at;
            delete sessao.updated_at;
            delete sessao.treino_id;
            // Whitelist for ficha_sessao
            const sessaoData = {
              ficha_id: fichaId,
              nome: sessao.nome,
              ordem: sessao.ordem,
              created_at: new Date(),
            };

            const { data: novaSessao, error: sessaoError } = await this.database.supabase
              .from('ficha_sessao')
              .insert(sessaoData)
              .select('id')
              .single();

            console.log('novaSessao = ', novaSessao)

            if (sessaoError) throw sessaoError;

            if (exerciciosSessao && exerciciosSessao.length > 0) {
              const preparedExercicios = exerciciosSessao.map((ex: any) => {
                // Whitelist for ficha_exercicio (only valid columns)

                delete ex.id;
                delete ex.created_at;
                delete ex.updated_at;
                delete ex.exercicio;
                delete ex.grupo_muscular;
                delete ex.equipamento;
                delete ex.ficha_sessao;
                delete ex.ficha_id;
                delete ex.treino_id;

                return {
                  ficha_sessao_id: novaSessao.id,
                  exercicio_id: ex.exercicio_id,
                  series: ex.series,
                  repeticoes: ex.repeticoes,
                  carga: ex.carga,
                  intervalo: ex.intervalo,
                  ordem: ex.ordem,
                  tipo_execucao: ex.tipo_execucao,
                  grupo_execucao: ex.grupo_execucao,
                  tipo_progressao: ex.tipo_progressao,
                  carga_series: ex.carga_series,
                  created_at: new Date()
                };
              });


              console.log('preparedExercicios = ', preparedExercicios)

              const { error: exError } = await this.database.supabase
                .from('ficha_exercicio')
                .insert(preparedExercicios);

              if (exError) throw exError;
            }
          }
        }
        return { data: ficha, error: null };
      } catch (innerError) {
        // Rollback: delete the incomplete ficha
        await this.database.supabase.from('ficha_aluno').delete().eq('id', fichaId);
        throw innerError;
      }
    } catch (error) {
      console.error('Error creating FichaAluno:', error);
      return { data: null, error };
    }
  }

  async update(body: Partial<IFichaAluno> | any) {
    // Treat an update as a new creation to maintain history.
    // Clean up relational objects that might be sent from the frontend.
    delete body.aluno;
    delete body.instrutor;
    delete body.cadastrado_por;
    delete body.treinos;
    delete body.treinos_cadastrados;

    // The 'create' method handles deactivating old records, deleting the ID, and inserting the new ficha + sessions.
    return this.create(body);
  }
}
