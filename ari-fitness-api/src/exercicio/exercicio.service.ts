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
  async findAll(filter: Partial<Exercicio> | Exercicio | any) {
    const { limit, offset, ...otherFilters } = filter;

    let query = this.database.supabase.from(tableName).select(`
        id, 
        nome, 
        fl_ativo,
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

    if (otherFilters.nivel_id) query = query.eq('nivel_id', otherFilters.nivel_id);
    if (otherFilters.equipamento_id) query = query.eq('equipamento_id', otherFilters.equipamento_id);
    if (otherFilters.grupo_muscular_id) query = query.eq('grupo_muscular_id', otherFilters.grupo_muscular_id);
    if (otherFilters.musculo_id) query = query.eq('musculo_id', otherFilters.musculo_id);
    if (otherFilters.parte_do_corpo_id) {
      // Filtering through the legacy musculo -> grupo_muscular relationship
      query = query.eq('musculo.grupo_muscular.parte_do_corpo_id', otherFilters.parte_do_corpo_id);
    }
    if (otherFilters.nome) query = query.ilike('nome', `%${otherFilters.nome}%`);
    if (otherFilters.fl_ativo !== undefined) query = query.eq('fl_ativo', otherFilters.fl_ativo);

    // If other filters are generic, use match (caution: may conflict with specific ones above)
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


    return await this.database.supabase.from(tableName).insert(body, {});
    ;
  }

  /**
   * The `update` function updates a record on database table with the provided partial user
   * data.
   * @param body - The `body` parameter in the `update` function is a partial object of type `Exercicio`.
   * It contains the data that needs to be updated in the database for a specific user.
   * @returns The `update` method is returning a promise that represents the result of updating the
   * record in the database table specified by `tableName` with the data provided in the `body` object.
   */
  async update(body: Partial<Exercicio>) {


    return await this.database.supabase
      .from(tableName)
      .update(body)
      .eq('id', body.id);
  }

  async findNiveis() {
    return await this.database.supabase.from('exercicio_nivel').select('*');
  }
}
