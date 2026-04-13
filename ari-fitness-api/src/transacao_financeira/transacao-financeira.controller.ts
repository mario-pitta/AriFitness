/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Response } from 'express';
import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';
import { TransacaoFinanceiraService } from './transacao-financeira.service';
import { TransacaoFinanceira } from './TransacaoFinanceira.interface';

@Controller('transacao-financeira')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.GERENCIA)
export class TransacaoFinanceiraController {
  constructor(
    private TransacaoFinanceiraService: TransacaoFinanceiraService,

  ) { }

  /**
   * The function `findAll` retrieves all users and sends the data or an error response using the
   * Response object.
   * @param {Response} res - The `res` parameter in the code snippet is a decorator used in NestJS to
   * inject the Express Response object into the method. This allows you to send responses back to the
   * client using methods like `res.status()` and `res.send()`.
   * @returns The code snippet is returning a Promise that resolves to either an error response or a
   * success response. If there is an error in fetching all users from the `TransacaoFinanceiraService`, it will
   * log the error and send a 500 status response with the error details. If the operation is
   * successful, it will send a response with the data of all users.
   */
  @Get()
  findAll(
    @Res() res: Response,
    @Query()
    filter: {
      [key: string]: keyof TransacaoFinanceira | string | boolean;
      orderBy: string;
      asc: boolean;
    },
  ) {
    console.log('filter: ', filter);

    if (!filter.orderBy) {
      filter.orderBy = 'data_lancamento';
      filter.asc = false;
    }

    if (!filter.empresa_id)
      return res.status(HttpStatus.BAD_REQUEST).send(new HttpException(
        'Empresa não informada',
        HttpStatus.BAD_REQUEST,
        {
          cause: new Error('Empresa não informada'),
        },
      ));

    console.log('getting all TransacaoFinanceiras...');
    return this.TransacaoFinanceiraService.findAll(filter).then((_res) => {
      if (_res.error) {
        console.error('erro no TransacaoFinanceiraService/findAll', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }

  @Get('export/pdf')
  async exportPdf(
    @Res() res: Response,
    @Query() filter: any
  ) {
    if (!filter.empresa_id) {
      return res.status(HttpStatus.BAD_REQUEST).send(new HttpException('Empresa não informada', HttpStatus.BAD_REQUEST));
    }

    // Configura os filtros ordenando por data
    filter.orderBy = filter.orderBy || 'data_lancamento';
    filter.asc = filter.asc !== undefined ? filter.asc : false;

    return this.TransacaoFinanceiraService.generatePdfReport(filter, res);
  }

  @Get('/tipos')
  getTiposTransacaoFinanceira(
    @Res() res: Response,
    @Query() filter: { fl_ativo: boolean },
  ) {
    if (!!!filter.fl_ativo)
      return res
        .status(400)
        .send({ status: 400, message: 'Filtro não informado' });

    return this.TransacaoFinanceiraService.getTiposTransacaoFinanceira(
      filter,
    ).then((_res) => {
      if (_res.error) {
        console.error(
          'erro no TransacaoFinanceiraService/getTiposTransacaoFinanceira',
          _res.error,
        );
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }

  /**
   * The function creates a new user using the data provided in the request body.
   * @param {Plano} body - The `create` function takes a parameter `body` of type `Plano`. This
   * parameter is decorated with `@Body()`, which indicates that the value of `body` will be extracted
   * from the request body of the incoming HTTP request. The function then calls the `create` method of
   * `Plano
   * @returns The `create` method is returning the result of calling the `create` method of the
   * `TransacaoFinanceiraService` with the `body` parameter passed to it.
   */
  @Post()
  async create(@Body() body: TransacaoFinanceira) {
    return await this.TransacaoFinanceiraService.create(body)
    // .then(async (_res) => {
    //   console.log('_res: ', _res);

    //   if (_res.error) {
    //     console.error(
    //       'erro no TransacaoFinanceiraService/update',
    //       _res.error,
    //     );
    //     res.status(500).send({
    //       status: 500,
    //       ..._res.error,
    //     });
    //   }



    //   return res.send(_res.data);
    // });




  }


  /**
   * The update function in TypeScript takes a partial Plano object as input and calls the
   * TransacaoFinanceiraService to update the corresponding record.
   * @param body - The `update` function takes a parameter `body` which is of type `Partial<Plano>`.
   * This means that `body` is an object that can contain some or all of the properties of the
   * `Plano` type. The function then calls the `update` method of the `TransacaoFinanceiraService
   * @returns The `update` method is returning the result of calling the `update` method of the
   * `TransacaoFinanceiraService` with the `body` parameter passed to it.
   */
  @Put()
  update(@Body() body: Partial<TransacaoFinanceira>, @Res() res: Response) {
    return this.TransacaoFinanceiraService.update(body).then((_res) => {
      console.log('_res: ', _res);

      if (_res.error) {
        console.error('erro no TransacaoFinanceiraService/update', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }

  @Get('/categorias')
  getCategorias(
    @Res() res: Response,
    @Query() filter: { fl_ativo: boolean; tr_tipo_id: number },
  ) {
    return this.TransacaoFinanceiraService.getCategoriasTransacaoFinanceira(
      filter,
    ).then((_res) => {
      if (_res.error) {
        console.error(
          'erro no TransacaoFinanceiraService/getCategorias',
          _res.error,
        );
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }
  @Post('import/:empresaId')
  importFinances(@Res() res: Response, @Param('empresaId') empresaId: string, @Body() body: any[]) {
    console.log('importing finances for empresa:', empresaId);
    return this.TransacaoFinanceiraService.importFinances(empresaId, body).then((_res: any) => {
      if (_res.error) {
        console.error('erro no transacao-financeira/import', _res.error);
        res.status(500).send(_res.error);
      }
      return res.status(201).send(_res.data);
    });
  }
}
