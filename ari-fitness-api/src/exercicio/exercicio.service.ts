/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Exercicio } from './exercicio.interface';

const tableName = 'exercicios';

@Injectable()
export class ExercicioService {
  constructor(private database: DataBaseService) { }

  /**
   * The `findAll` function retrieves all records from a specified table in a database.
   * @returns An array of all records from the specified table in the database with all columns
   * selected.
   */
  async findAll(filter: Partial<Exercicio> | Exercicio | any, empresaId?: string) {
    const { limit, offset, ...otherFilters } = filter;

    let query = this.database.supabase.from(tableName).select(`
        id, 
        nome, 
        fl_ativo,
        empresa_id,
        midias_url,
        midia_url,
        nivel: exercicio_nivel (
          id, nome
        ),
        forca_tipo: exercicio_forca_tipo (
          id, nome
        ),
        categoria: exercicio_categoria (
          id, nome
        ),
        equipamento: equipamentos (
            id, nome
        ),
        musculo (
          id, nome,
          grupo_muscular: grupo_muscular (
            id, nome,
            parte_do_corpo: parte_do_corpo (
              id, nome
            )
          )
        ),         
        grupo_muscular (
          id, nome
        ),
        musculos: exercicio_musculo (
          id,
          tipo,
          grupo_muscular (
            id, nome
          )
        ),
        instrucoes
      `);

    // Tenant isolation & Specific Filters
    if (otherFilters.empresa_id === 'null' || otherFilters.empresa_id === 'oficial') {
      query = query.is('empresa_id', null);
      delete otherFilters.empresa_id;
    } else if (otherFilters.empresa_id) {
      query = query.eq('empresa_id', otherFilters.empresa_id);
      delete otherFilters.empresa_id;
    } else if (empresaId) {
      // Default: show global (empresa_id IS NULL) + tenant's own
      query = query.or(`empresa_id.is.null,empresa_id.eq.${empresaId}`);
    } else {
      query = query.is('empresa_id', null);
    }

    if (otherFilters.nivel_id) query = query.eq('nivel_id', otherFilters.nivel_id);
    if (otherFilters.equipamento_id) query = query.eq('equipamento_id', otherFilters.equipamento_id);
    if (otherFilters.grupo_muscular_id) query = query.eq('grupo_muscular_id', otherFilters.grupo_muscular_id);
    if (otherFilters.musculo_id) query = query.eq('musculo_id', otherFilters.musculo_id);
    if (otherFilters.parte_do_corpo_id) {
      query = query.eq('musculo.grupo_muscular.parte_do_corpo_id', otherFilters.parte_do_corpo_id);
    }
    if (otherFilters.nome) query = query.ilike('nome', `%${otherFilters.nome}%`);
    if (otherFilters.fl_ativo !== undefined) query = query.eq('fl_ativo', otherFilters.fl_ativo);

    const remainingFilters = { ...otherFilters };
    delete remainingFilters.nivel_id;
    delete remainingFilters.equipamento_id;
    delete remainingFilters.grupo_muscular_id;
    delete remainingFilters.musculo_id;
    delete remainingFilters.parte_do_corpo_id;
    delete remainingFilters.nome;
    delete remainingFilters.fl_ativo;

    if (Object.keys(remainingFilters).length > 0) {
      query = query.match(remainingFilters);
    }

    if (limit) {
      query = query.limit(Number(limit));
    }

    if (offset) {
      const from = Number(offset);
      const to = from + (Number(limit) || 10) - 1;
      query = query.range(from, to);
    }

    return await query.order('nome', {
      ascending: true,
    });
  }

  /**
   * The `create` function inserts a new record on database using the provided user data.
   * @param {Exercicio} body - The `body` parameter in the `create` function likely represents the data or
   * object of type `Exercicio` that you want to insert into a database table. It contains the information
   * or fields that you want to store in the database.
   * @returns The `create` function is returning the result of inserting the `body` object into the
   * specified table in the database.
   */
  async create(body: Exercicio) {


    return await this.database.supabase.from(tableName).insert(body, {}).select('*').single();
  }

  /**
   * The `update` function updates a record on database table with the provided partial user
   * data.
   * @param body - The `body` parameter in the `update` function is a partial object of type `Exercicio`.
   * It contains the data that needs to be updated in the database for a specific user.
   * @returns The `update` method is returning a promise that represents the result of updating the
   * record in the database table specified by `tableName` with the data provided in the `body` object.
   */
  async update(body: Partial<Exercicio>, empresaId?: string) {
    // Security: fetch the exercise first to verify tenant ownership
    const existing = await this.database.supabase
      .from(tableName)
      .select('empresa_id')
      .eq('id', body.id)
      .single();

    if (existing.error) return existing;

    const exEmpresaId = existing.data?.empresa_id;

    // Block modification of global exercises (empresa_id IS NULL) or those of other tenants
    if (!exEmpresaId || exEmpresaId !== empresaId) {
      return {
        data: null,
        error: { code: 'FORBIDDEN', message: 'Você não tem permissão para editar este exercício.' }
      };
    }

    return await this.database.supabase
      .from(tableName)
      .update(body)
      .eq('id', body.id)
      .eq('empresa_id', empresaId).select('*').single(); // Double safety: only update if same tenant
  }

  async findNiveis() {
    return await this.database.supabase.from('exercicio_nivel').select('*');
  }
}
