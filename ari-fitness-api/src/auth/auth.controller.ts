/* eslint-disable prettier/prettier */

import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { Usuario } from 'src/usuario/Usuario.interface';
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Post('login')
  async login(
    @Body() body: { cpf: string; senha: string; type: 'STUDENT' | 'TEAM' },
    @Res() res: Response,
  ) {
    console.log('Login attempt for CPF:', body.cpf);
    const result = await this.auth.login(body.cpf, body.senha, body.type);

    if (result.error) {
      return res.status(401).send({ status: 401, message: result.error.message });
    }

    const { data: user, access_token } = result;

    console.log('user = ', user)


    // Based on user request: Only Admins can manage treinos.
    // If we want to allow only them to log in to the manager:
    const validUserProfiles = [3, 2];

    console.log('user.tipo_usuario = ', user.tipo_usuario)
    console.log('user.function_id = ', user.function_id)

    if (!validUserProfiles.includes(user.tipo_usuario.id) && !validUserProfiles.includes(user.function.id)) {
      return res.status(401).send({
        status: 401,
        message: 'Acesso restrito a Administradores e Instrutores.'
      });
    }

    return res.send({
      user,
      access_token
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
  async requestPasswordReset(@Body() body: { email: string, type: 'STUDENT' | 'TEAM' }, @Res() res: Response) {
    console.log('body = ', body)



    const result = await this.auth.requestPasswordReset(body.email, body.type);
    return res.send(result);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; novaSenha: string }, @Res() res: Response) {
    const result = await this.auth.resetPassword(body.token, body.novaSenha);
    return res.send(result);
  }


}
