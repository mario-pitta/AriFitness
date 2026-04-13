/* eslint-disable prettier/prettier */
import { Response, Request } from 'express';
import { Exercicio } from './exercicio.interface';
import { ExercicioService } from './exercicio.service';
import { Body, Controller, Get, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';



const controller = 'exercicios'
@Controller(controller)
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercicioController {
  constructor(private exercicioService: ExercicioService) { }

  /**
   * The function `findAll` retrieves all users and sends the data or an error response using the
   * Response object.
   * @param {Response} res - The `res` parameter in the code snippet is a decorator used in NestJS to
   * inject the Express Response object into the method. This allows you to send responses back to the
   * client using methods like `res.status()` and `res.send()`.
   * @returns The code snippet is returning a Promise that resolves to either an error response or a
   * success response. If there is an error in fetching all users from the `usuarioService`, it will
   * log the error and send a 500 status response with the error details. If the operation is
   * successful, it will send a response with the data of all users.
   */
  @Get()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  findAll(
    @Res() res: Response,
    @Req() req: Request,
    @Query() filter: Partial<Exercicio> | Exercicio,
  ) {
    const empresaId = (req as any).user?.empresa_id;

    return this.exercicioService.findAll(filter, empresaId).then((_res) => {
      if (_res.error) {
        console.error('erro no Exercicio/findAll', _res.error);
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
   * @param {Usuario} body - The `create` function takes a parameter `body` of type `Usuario`. This
   * parameter is decorated with `@Body()`, which indicates that the value of `body` will be extracted
   * from the request body of the incoming HTTP request. The function then calls the `create` method of
   * `usuario
   * @returns The `create` method is returning the result of calling the `create` method of the
   * `usuarioService` with the `body` parameter passed to it.
   */
  @Post()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  create(@Body() body: Exercicio, @Res() res: Response, @Req() req: Request) {
    const empresaId = (req as any).user?.empresa_id;
    const usuarioId = (req as any).user?.id;

    return this.exercicioService.create({
      ...body,
      nome: body.nome.toLocaleLowerCase(),
      empresa_id: empresaId,
      usuario_id: usuarioId, // Sempre vincula ao tenant do usuário
    }).then((_res) => {
      if (_res.error) {
        console.error('erro no Exercicio/create', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }

  /**
   * The update function in TypeScript takes a partial Exercicio object as input and calls the
   * ExercicioService to update the corresponding record.
   * @param body - The `update` function takes a parameter `body` which is of type `Partial<Usuario>`.
   * This means that `body` is an object that can contain some or all of the properties of the
   * `Usuario` type. The function then calls the `update` method of the `usuarioService
   * @returns The `update` method is returning the result of calling the `update` method of the
   * `usuarioService` with the `body` parameter passed to it.
   */
  @Put()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  update(@Body() body: Partial<Exercicio>, @Req() req: Request, @Res() res: Response) {
    const empresaId = (req as any).user?.empresa_id;
    return this.exercicioService.update(body, empresaId).then((_res) => {
      if (_res.error) {
        return res.status(_res.error.code === 'FORBIDDEN' ? 403 : 500).send(_res.error);
      }
      return res.send(_res.data);
    });
  }

  @Get('niveis')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  getNiveis(@Res() res: Response) {
    return this.exercicioService.findNiveis().then((_res) => {
      if (_res.error) {
        return res.status(500).send(_res.error);
      }
      return res.send(_res.data);
    });
  }
}
