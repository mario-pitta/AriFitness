/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FichaAlunoService } from './ficha-aluno.service';
import { IFichaAluno } from './FichaAluno.interface';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('/ficha-aluno')
@UseGuards(JwtAuthGuard)
export class FichaAlunoController {
  constructor(private fichaAlunoService: FichaAlunoService) { }

  /**
   * The function `findAll` in TypeScript takes a query and response object, calls a service method, and
   * sends the result back in the response.
   * @param {IFichaAluno} query - The `query` parameter in the `findAll` method is of type `IFichaAluno`
   * and is annotated with `@Query()`. This means that it is expected to contain query parameters that
   * are passed in the request URL. These query parameters can be accessed within the method to filter or
   * customize
   * @param {Response} res - The `res` parameter in the code snippet refers to the response object that
   * will be used to send the HTTP response back to the client. In this case, it is of type `Response`,
   * which is likely from a web framework like Express in Node.js. The `res` object is used to
   * @returns The `findAll` method is returning a Promise that resolves to either an error response with
   * status code 500 and error details, or a success response with status code 200 and data from the
   * `fichaAlunoService.findAll` method.
   */
  @Get()
  findAll(@Query() query: IFichaAluno, @Res() res: Response) {
    return this.fichaAlunoService.findAll(query).then((_res) => {
      if (_res.error)
        res.status(500).send({
          ..._res,
          status: 500,
        });
      return res.status(200).send(_res.data);
    });
  }

  /**
   * This TypeScript function retrieves a specific record by ID and sends the data in the response.
   * @param param - The `param` parameter is an object with a property `id` of type number. It is being
   * used to retrieve a specific record by its ID from the `fichaAlunoService`.
   * @param {Response} res - The `res` parameter in the code snippet is used to send a response back to
   * the client. It is of type `Response`, which is likely an object representing the HTTP response that
   * will be sent back to the client. In this code snippet, the response is being sent with a status
   * code and
   * @returns a Promise that resolves to either a 500 status response with an error object or a 200
   * status response with the data object fetched by calling `this.fichaAlunoService.getById(param.id)`.
   */
  @Get(':id')
  getById(@Param() param: { id: number }, @Res() res: Response) {
    return this.fichaAlunoService.getById(param.id).then((_res) => {
      if (_res.error)
        if (_res.error)
          res.status(500).send({
            ..._res,
            status: 500,
          });
      return res.status(200).send(_res.data);
    });
  }

  /**
   * This TypeScript function retrieves a user's information by their ID and sends the response back.
   * @param param - The `param` parameter is an object with a single property `id` of type number. It is
   * used to retrieve a specific user's information from the `fichaAlunoService` by passing the `id` to
   * the `getByUser` method.
   * @param {Response} res - The `res` parameter in the code snippet is used to send a response back to
   * the client. It is of type `Response`, which is likely an object representing the HTTP response that
   * will be sent back to the client. In this function, the response is being used to send either an
   * error response
   * @returns a Promise that resolves to either a success response with status code 200 and the data
   * fetched by `this.fichaAlunoService.getByUser(param.id)`, or an error response with status code 500
   * and the error message from `_res.error`.
   */
  @Get('aluno/:id')

  getByUser(@Param() param: { id: number }, @Query() query: Partial<IFichaAluno>, @Res() res: Response) {
    console.log('getting ficha by user...', param.id);
    return this.fichaAlunoService.getByUser(param.id, query).then((_res) => {
      if (_res.error)
        if (_res.error)
          res.status(500).send({
            ..._res,
            status: 500,
          });

      return res.status(200).send(_res.data);
    });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() body: IFichaAluno, @Res() res: Response) {
    console.log(body);
    return this.fichaAlunoService.create(body).then((_res) => {
      if (_res) {
        if (_res.error)
          res.status(500).send({
            ..._res,
            status: 500,
          });

        return res.status(200).send(_res.data);
      } else {
        return res.status(400)
      }
    });
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(@Body() body: Partial<IFichaAluno>, @Res() res: Response) {
    console.log(body);
    return this.fichaAlunoService.update(body).then((_res) => {
      if (_res.error)
        res.status(500).send({
          ..._res,
          status: 500,
        });

      return res.status(200).send(_res.data);
    });
  }

  @Post(':fichaId/apply-template/:treinoId')
  applyTemplate(
    @Param('fichaId') fichaId: number,
    @Param('treinoId') treinoId: number,
    @Res() res: Response,
    @CurrentUser('empresa_id') empresa_id: string
  ) {
    return this.fichaAlunoService.applyTemplateToStudent(treinoId, fichaId, empresa_id).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      return res.status(200).send(_res.data);
    });
  }
}

