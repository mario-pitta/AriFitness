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
  async findAll(filter: Partial<Exercicio> | Exercicio) {
    console.log('findAll = ', filter)

    return await this.database.supabase
      .from(tableName)
      .select(`
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
        )
      `)
      .match({ ...filter })
      .order('nome', {
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
}
