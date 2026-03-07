/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Usuario } from 'src/usuario/Usuario.interface';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Get('login')
  async login(
    @Query() query: { cpf: string; senha: string },
    @Res() res: Response,
  ) {
    console.log(query);
    return await this.auth.login(query.cpf, query.senha).then((_res) => {
      if (_res.error)
        return res.status(400).send({ status: 500, ..._res.error }); //throw new Error(_res.error.message);

      if (!_res.data.length)
        return res
          .status(401)
          .send({ status: 401, message: 'Usuario/Senha inválidos' });


      if (_res.data[0].tipo_usuario !== 3)
        return res
          .status(401)
          .send({ status: 401, message: 'Você não tem permissão para acessar o sistema.' });

      console.log('vai retornar ok?: ', _res);
      _res.data.map(async (user: Usuario | any) => {
        if (user.senha) delete user.senha;
        return user;
      });

      return res.send(_res.data[0]);
    });
  }

  @Post('register')
  async register(@Body() body: { user: any; company: any; planId?: number }, @Res() res: Response) {
    try {
      const result = await this.auth.register(body);
      return res.status(201).send(result);
    } catch (error) {
      return res.status(400).send({ status: 400, message: error.message });
    }
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body() body: { email: string }, @Res() res: Response) {
    console.log('body = ', body)

    const result = await this.auth.requestPasswordReset(body.email);
    return res.send(result);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; novaSenha: string }, @Res() res: Response) {
    const result = await this.auth.resetPassword(body.token, body.novaSenha);
    return res.send(result);
  }


}
