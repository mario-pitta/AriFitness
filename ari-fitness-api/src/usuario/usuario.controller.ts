/* eslint-disable prettier/prettier */
import { Response, Request } from 'express';
import { Usuario } from './Usuario.interface';
import { UsuarioService } from './usuario.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('usuario')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private usuarioService: UsuarioService) { }

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
  // @Get()
  // findAll(@Res() res: Response) {
  //   console.log('getting all users...');
  //   return this.usuarioService.findAll().then((_res) => {
  //     if (_res.error) {
  //       console.error('erro no usuario/findAll', _res.error);
  //       res.status(500).send({
  //         status: 500,
  //         ..._res.error
  //       });
  //     }

  //     return res.send(_res.data);
  //   });
  // }


  /**
   * The function finds users by filters and sends the results or an error response.
   *
   * @param {Response} res
   * @param {(Partial<Usuario> | Usuario)} filters
   * @return {*} 
   * @memberof UsuarioController
   */
  @Get('/search')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  findByFilters(
    @Res() res: Response,
    @Query() filters: Partial<Usuario> | Usuario,
  ) {
    console.log('search users... byFilters', filters);
    return this.usuarioService.findByFilters(filters).then((_res) => {
      console.log('_res = ', _res)

      if (_res.error) {
        console.error('erro no usuario/findAll', _res.error);
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
  @Roles(UserRole.GERENCIA)
  create(@Body() body: Usuario, @Res() res: Response) {
    return this.usuarioService.create(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      res.status(201).send(_res.data);
    });
  }

  /**
   * The update function in TypeScript takes a partial Usuario object as input and calls the
   * usuarioService to update the corresponding record.
   * @param body - The `update` function takes a parameter `body` which is of type `Partial<Usuario>`.
   * This means that `body` is an object that can contain some or all of the properties of the
   * `Usuario` type. The function then calls the `update` method of the `usuarioService
   * @returns The `update` method is returning the result of calling the `update` method of the
   * `usuarioService` with the `body` parameter passed to it.
   */
  @Put()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  update(@Body() body: Partial<Usuario>, @Res() res: Response) {
    return this.usuarioService.update(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      res.status(201).send(_res.data);
    });
  }

  /**
   * Permite que o próprio usuário logado atualize seus dados de perfil (foto, peso, altura, contatos).
   * O userId é extraído do token JWT — nunca do body — garantindo que cada usuário só edite a si mesmo.
   *
   * @param req - Request com o payload JWT decodificado em `req.user`.
   * @param body - Dados permitidos: foto_url, peso, altura, whatsapp, email, instagram_username.
   * @param res - Response Express.
   * @returns {Promise} Dados atualizados do usuário ou erro 500.
   */
  @Put('meu-perfil')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  updateMeuPerfil(@Req() req: Request & { user: any }, @Body() body: Partial<Usuario>, @Res() res: Response) {
    const userId = req.user?.userId;
    return this.usuarioService.updateMeuPerfil(userId, body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      res.status(200).send(_res.data?.[0] ?? _res.data);
    });
  }


  //#region Instrutor
  @Get('instrutor/:empresaId')
  @Roles(UserRole.GERENCIA)
  findInstrutorByFilters(@Res() res: Response, @Param('empresaId') empresaId: number, @Query() filters: Partial<Usuario> | Usuario) {
    console.log('search instrutor... byFilters', filters);
    return this.usuarioService.findInstrutorByFilters(empresaId, filters).then((_res) => {
      if (_res.error) {
        console.error('erro no instrutor/findAll', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }

      return res.send(_res.data);
    });
  }

  //#endregion

  //#region Check-in
  @Post('check-in')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  registrarCheckIn(@Body() body: { cpf: string; nome: string, empresa_id: string }, @Res() res: Response) {
    console.log('registrando check-in para o CPF:', body.cpf, 'na empresa:', body.empresa_id);
    return this.usuarioService.registrarCheckin(body.cpf, body.nome, body.empresa_id).then((_res) => {
      if (_res.error) {
        console.error('erro no usuario/check-in', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }
      return res.send(_res.data);
    });
  }
  //#endregion


  /** Obter os registro de checkin dos alunos da empresa */
  @Get('check-in/empresa/:empresaId')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  getCheckinsByEmpresa(@Res() res: Response, @Param('empresaId') empresaId: string) {
    console.log('Obtendo check-ins para a empresa:', empresaId);
    return this.usuarioService.getCheckinsByEmpresa(empresaId).then((_res: any) => {
      if (_res.error) {
        console.error('erro no usuario/check-in/empresa', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }
      return res.send(_res.data);
    });
  }

  /** Excluir registro de chekin, apenas o admin da empresa pode fazer isso. */
  @Post('check-in/:checkinId/delete')
  @Roles(UserRole.GERENCIA)
  deleteCheckinById(@Res() res: Response, @Param('checkinId') checkinId: string) {
    console.log('Excluindo check-in com ID:', checkinId);
    return this.usuarioService.deleteCheckinById(checkinId).then((_res: any) => {
      if (_res.error) {
        console.error('erro no usuario/check-in/:checkinId/delete', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }
      return res.send(_res.data);
    });


  }


  /** Obter frequencia pelo CPF */
  @Get('frequency-by-cpf')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  async getFrequencyByCPF(@Res() res: Response, @Query('cpf') cpf: string, @Query('empresaId') empresaId: string) {
    console.log('Obtendo frequência para o CPF:', cpf);
    return this.usuarioService.getFrequencyByCPFandEmpresaId(cpf, empresaId).then((_res: any) => {
      if (_res.error) {
        console.error('erro no usuario/frequency-by-cpf', _res.error);
        res.status(500).send({
          status: 500,
          ..._res.error,
        });
      }
      return res.send(_res.data);
    });
  }

  @Post('import/:empresaId')
  @Roles(UserRole.GERENCIA)
  importStudents(@Res() res: Response, @Param('empresaId') empresaId: string, @Body() body: any[]) {
    console.log('importing students for empresa:', empresaId);
    return this.usuarioService.importStudents(empresaId, body).then((_res: any) => {
      if (_res.error) {
        console.error('erro no usuario/import', _res.error);
        res.status(500).send(_res.error);
      }
      return res.status(201).send(_res.data);
    });
  }

  @Get('treino-historico/:id')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  getTreinoHistorico(@Param('id') id: number, @Res() res: Response) {
    return this.usuarioService.getTreinoHistorico(id).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      return res.status(200).send(_res.data);
    });
  }

  @Post('treino-historico')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  registrarTreinoHistorico(@Body() body: any, @Res() res: Response) {
    return this.usuarioService.registrarTreinoHistorico(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      return res.status(200).send(_res.data);
    });
  }

}
