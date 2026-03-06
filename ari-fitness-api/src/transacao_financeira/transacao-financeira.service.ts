/* eslint-disable prettier/prettier */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { TransacaoFinanceira } from './TransacaoFinanceira.interface';
import { UsuarioService } from 'src/usuario/usuario.service';

const tableName = 'transacao_financeira';

@Injectable()
export class TransacaoFinanceiraService {
  constructor(private database: DataBaseService, private usuarioService: UsuarioService) { }

  /**
   * The `findAll` function retrieves all records from a specified table in a database.
   * @returns An array of all records from the specified table in the database with all columns
   * selected.
   */
  findAll(filter: Partial<TransacaoFinanceira> | TransacaoFinanceira | any) {
    console.log('findAll: ', filter);
    const { data_inicio, data_fim, orderBy, asc } = filter;

    delete filter.data_inicio;
    delete filter.data_fim;
    delete filter.orderBy;
    delete filter.asc;

    return this.database.supabase
      .from(tableName)
      .select(
        `
        *,
        membro: usuario!transacao_financeira_pago_por_fkey(id, nome),
        categoria: categoria_transacao_financeira!transacao_financeira_tr_categoria_id_fkey(id, descricao),
        tipo: tipo_transacao_financeira!transacao_financeira_tr_tipo_id_fkey(id, descricao)
        `,
      )
      .match({ ...filter, fl_ativo: true })
      // filtrar por data de lancamento
      .gte(data_inicio ? 'created_at' : '', data_inicio ? data_inicio : '')
      .lte(data_fim ? 'created_at' : '', data_fim ? data_fim : '')
      // ordenar
      .order(orderBy, {
        ascending: asc,
      });
  }


  validateTransacaoFinanceira(transacaoFinanceira: TransacaoFinanceira) {
    if (!transacaoFinanceira.tr_categoria_id) {
      throw new HttpException('Categoria da transação financeira não informada', HttpStatus.BAD_REQUEST);
    }

    if (!transacaoFinanceira.tr_tipo_id) {
      throw new HttpException('Tipo da transação financeira não informado', HttpStatus.BAD_REQUEST);
    }

    if (!transacaoFinanceira.data_lancamento) {
      throw new HttpException('Data da transação financeira não informada', HttpStatus.BAD_REQUEST);
    }

    if (typeof transacaoFinanceira.pago_por === 'object') {
      transacaoFinanceira = {
        ...transacaoFinanceira,
        pago_por: (transacaoFinanceira.pago_por as any)?.id,
      }
    }

    switch (transacaoFinanceira.tr_categoria_id) {
      case 1 || 14: //MENSALIDADE
        if (!transacaoFinanceira.pago_por) {
          throw new HttpException('Membro da transação financeira não informado', HttpStatus.BAD_REQUEST);
        }
        break;

      default:
        break;
    }

    return transacaoFinanceira;
  }

  /**
   * The `create` function inserts a new record on database using the provided user data.
   * @param {Usuario} body - The `body` parameter in the `create` function likely represents the data or
   * object of type `Usuario` that you want to insert into a database table. It contains the information
   * or fields that you want to store in the database.
   * @returns The `create` function is returning the result of inserting the `body` object into the
   * specified table in the database.
   */
  async create(body: TransacaoFinanceira) {
    console.log('body: ', body);


    body = await this.validateTransacaoFinanceira(body);

    return this.database.supabase
      .from(tableName)
      .insert(body, {})
      .select('*')
      .single()
      .then(async _res => {


        if (_res.error) return new HttpException(_res.error, HttpStatus.INTERNAL_SERVER_ERROR, {
          cause: _res.error,
        });

        const newTransacaoFinanceira = _res.data as TransacaoFinanceira;
        if (newTransacaoFinanceira) {
          this.updateEntity(newTransacaoFinanceira);
        }
        return _res
      });
  }

  /**
   * The `update` function updates a record on database table with the provided partial user
   * data.
   * @param body - The `body` parameter in the `update` function is a partial object of type `Usuario`.
   * It contains the data that needs to be updated in the database for a specific user.
   * @returns The `update` method is returning a promise that represents the result of updating the
   * record in the database table specified by `tableName` with the data provided in the `body` object.
   */
  update(body: Partial<TransacaoFinanceira>) {
    return this.database.supabase
      .from(tableName)
      .update(body)
      .eq('id', body.id)
      .select('*');
  }

  /**
   * The function `getTiposTransacaoFinanceira` retrieves task types from a database based on a given filter.
   * @param filter - The filter parameter is an object that specifies the criteria for filtering the
   * results of the query. In this case, it filters the results based on the value of the "fl_ativo"
   * field being a boolean value.
   */
  getTiposTransacaoFinanceira(filter: { fl_ativo: boolean }) {
    return this.database.supabase
      .from('tipo_transacao_financeira')
      .select('*')
      .match(filter);
  }

  getCategoriasTransacaoFinanceira(filter: {
    fl_ativo: boolean;
    tr_tipo_id: number;
  }) {
    return this.database.supabase
      .from('categoria_transacao_financeira')
      .select(
        `
          *
        `,
      )
      .match(filter);
  }

  async updateEntity(transacaoFinanceira: TransacaoFinanceira) {
    console.log('updateEntity - transacaoFinanceira: ', transacaoFinanceira);

    switch (transacaoFinanceira.tr_categoria_id) {
      case 1: //MENSALIDADE
        console.log('MENSALIDADE: ');

        await this.usuarioService.update({
          id: transacaoFinanceira.pago_por,
          data_ultimo_pagamento: transacaoFinanceira.data_lancamento,
        });
        break;

      default:
        break;
    }
  }

  async importFinances(empresaId: string, transactions: any[]) {
    const transactionsToInsert = transactions.map((t) => ({
      ...t,
      empresa_id: empresaId,
      fl_ativo: true,
    }));

    return this.database.supabase
      .from(tableName)
      .insert(transactionsToInsert)
      .select();
  }
}
