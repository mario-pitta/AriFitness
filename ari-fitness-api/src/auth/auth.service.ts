import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import md5 = require('md5');
import { EmailService } from 'src/email/email.service';
import { resetPasswordTemplate } from '../email/templates/reset-password.template';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/core/Constants/UserRole';
import * as dotenv from 'dotenv';
dotenv.config();


@Injectable()
export class AuthService {
  constructor(
    private supabase: DataBaseService,
    private emailService: EmailService,
    private jwtService: JwtService
  ) { }

  async login(cpf: string, senha: string, type: 'STUDENT' | 'TEAM' = 'STUDENT') {
    console.log(`logando (${type})...`, cpf, senha);

    let user = null;

    const buildJWT = (user: any): string => {
      const payload = {
        sub: user.id,
        nome: user.nome,
        empresa_id: user.empresa_id,
        tipo_usuario: user.tipo_usuario || user.function_id,
        expires_in: 60 * 60 * 24 * 7 // 1 week
      };

      const token = this.jwtService.sign(payload)


      console.log('token = ', token)

      // Sanitize
      if (user.senha) delete user.senha;
      if (user.password) delete user.password;

      return token;
    }

    // if (type === 'STUDENT') {
    console.log("buscando usuario...")
    const res = await this.supabase.supabase
      .from('usuario')
      .select(`
            *,
            tipo_usuario(*),
            empresa(*)
          `)
      .eq('cpf', cpf)
      .eq('senha', senha) // frontend already sends MD5
      .eq('fl_ativo', true)


    if (res.error) {
      console.log('res.error = ', res)

      return { error: { message: 'Erro ao fazer login. Contate o administrador da sua empresa ou tente mais tarde.' } };
    }

    user = res.data[0];

    if (user) {
      return {
        data: user,
        access_token: buildJWT(user)
      };
    } else {
      console.log("buscando team_member...")
      const teamRes = await this.supabase.supabase
        .from('team_member')
        .select(`
            *,
            tipo_usuario: function(id, nome),
            empresa:empresa_id(*)
          `)
        .eq('cpf', cpf)
        .eq('password', senha) // frontend already sends MD5
        .single();

      if (teamRes.error || !teamRes.data) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }

      if (teamRes.data.status !== 'ACTIVE') {
        return { error: { message: 'Usuário inativo. Solicite ao administrador da sua empresa para ativar sua conta.' } };
      }
      user = teamRes.data;
    }

    console.log('user logado = ', user);

    const userNormalized = {
      ...user,
      tipo_usuario: user.tipo_usuario.id,
      function_id: user.function?.id,
    }


    return {
      data: userNormalized,
      access_token: await buildJWT(userNormalized)
    };
  }



  async register(registrationData: { user: any; company: any; planId?: number }) {
    const { user, company, planId } = registrationData;

    // 1. Create Empresa
    const { data: companyData, error: companyError } = await this.supabase.supabase
      .from('empresa')
      .insert({
        nome: company.nome,
        cnpj: company.cnpj,
        email: company.email,
        telefone: company.telefone,
        flag_ativo: true,
      })
      .select()
      .single();

    if (companyError) throw companyError;

    // 2. Create Usuario (Admin for the company)
    const { data: userData, error: userError } = await this.supabase.supabase
      .from('usuario')
      .insert({
        nome: user.nome,
        cpf: user.cpf,
        email: user.email,
        senha: md5(user.senha),
        empresa_id: companyData.id,
        flagAdmin: true,
        fl_ativo: true,
        tipo_usuario: 1, // assuming 1 is Admin/Manager
      })
      .select()
      .single();

    if (userError) {
      // Rollback company if user creation fails (optional but good practice)
      await this.supabase.supabase.from('empresa').delete().eq('id', companyData.id);
      throw userError;
    }

    return { user: userData, company: companyData };
  }

  async requestPasswordReset(email: string, type: 'STUDENT' | 'TEAM' = 'STUDENT') {

    console.log(`inicianto solicitacao de reset de senha para (${type}) : `, email)

    let userId: number | null = null;
    let teamMemberId: string | null = null;
    let userName: string = '';

    if (type === 'STUDENT') {
      const { data: user, error } = await this.supabase.supabase
        .from('usuario')
        .select('id, nome, email')
        .eq('email', email)
        .single();

      if (error || !user) {
        console.error("usuário não encontrado")
        return { success: true };
      }
      userId = user.id;
      userName = user.nome;
    } else {
      const { data: teamMember, error } = await this.supabase.supabase
        .from('team_member')
        .select('id, nome, email, user_id')
        .eq('email', email)
        .single();

      if (error || !teamMember) {
        console.error("membro da equipe não encontrado com email: ", email)
        return { success: true };
      }
      teamMemberId = teamMember.id;
      userName = teamMember.nome;
    }

    // 2. Generate a temporary reset token (mocking for now, could be a UUID in a new table)
    const token = Math.random().toString(36).substring(2, 15);

    // 3. TODO: Store token in database with expiration
    const { data: tokenData, error: tokenError } = await this.supabase.supabase
      .from('reset_tokens')
      .insert({
        user_id: userId,
        team_member_id: teamMemberId,
        token: token,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
      })
      .select()
      .single();

    if (tokenError) {
      console.log('tokenError = ', tokenError)

      throw tokenError
    };

    // 3. Generate HTML content for email
    const isProdEnv = Boolean(process.env.PROD_ENV);
    console.log('isProdEnv = ', isProdEnv)

    const frontendUrl = isProdEnv ? 'https://mvkgymm.vercel.app' : 'http://localhost:8100';

    const html = resetPasswordTemplate({
      name: userName,
      redirectUrl: `${frontendUrl}/#/reset-password?token=${token}`,
    })

    console.log("html = ", html)

    // 4. Send email via EmailService
    await this.emailService.sendEmail({
      title: 'Recuperação de Senha',
      to_email: email,
      content: html,
      systemName: 'MvK Gym Manager'
    })

    console.log("email enviado com sucesso")
    return { success: true };
  }

  async resetPassword(token: string, novaSenha: string) {
    try {
      console.log("iniciando reset de senha")
      // 1. Verify token and get user (Mock logic)
      const { data: tokenData, error: tokenError } = await this.supabase.supabase
        .from('reset_tokens')
        .select('*')
        .eq('token', token)
        .single();

      if (tokenError || !tokenData) throw new Error('Token inválido');


      console.log("tokenData: ", tokenData)
      // 2. Update password
      if (tokenData.team_member_id) {
        const { error } = await this.supabase.supabase
          .from('team_member')
          .update({ password: md5(novaSenha) })
          .eq('id', tokenData.team_member_id);
        if (error) throw error;
      } else if (tokenData.user_id) {
        const { error } = await this.supabase.supabase
          .from('usuario')
          .update({ senha: md5(novaSenha) })
          .eq('id', tokenData.user_id);
        if (error) throw error;
      }
      // 3. Delete the token
      await this.supabase.supabase.from('reset_tokens').delete().eq('token', token);


      console.log("senha resetada com sucesso")
      return { success: true };
    } catch (error) {
      console.log("erro ao resetar senha: ", error)
      return { success: false, error: error.message };
    }
  }


}
