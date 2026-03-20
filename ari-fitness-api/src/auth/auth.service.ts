import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import md5 = require('md5');
import { EmailService } from 'src/email/email.service';
import { resetPasswordTemplate } from '../email/templates/reset-password.template';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/core/Constants/UserRole';


@Injectable()
export class AuthService {
  constructor(
    private supabase: DataBaseService,
    private emailService: EmailService,
    private jwtService: JwtService
  ) { }

  async login(cpf: string, senha: string) {
    console.log('logando...', cpf, senha);

    // 1. Try "usuario" table first (Admins, Students)
    console.log("buscando usuario...")
    let res = await this.supabase.supabase
      .from('usuario')
      .select(`
          *,
          tipo_usuario(*),
          empresa(*)
        `)
      .eq('cpf', cpf)
      .eq('senha', senha) // frontend already sends MD5
      .eq('fl_ativo', true)
      .single();

    let userType = 'USUARIO';
    let user = res.data;

    console.log("user = ", user)

    // 2. If not found, try "team_member" table
    console.log("buscando team_member...")
    if (res.error || !user) {
      const teamRes = await this.supabase.supabase
        .from('team_member')
        .select(`
            *,
            tipo_usuario: function_id(*),
            empresa:empresa_id(*)
          `)
        .eq('cpf', cpf)
        .eq('password', senha) // frontend already sends MD5
        .single();


      console.log('teamRes = ', teamRes)

      if (teamRes.error || !teamRes.data) {
        return { error: { message: 'Usuário ou senha inválidos' } };
      }


      if (teamRes.data.status !== 'ACTIVE') {
        return { error: { message: 'Usuário inativo. Solicite ao administrador da sua empresa para ativar sua conta.' } };
      }


      user = teamRes.data;

    }

    console.log('user logado = ', user);

    const payload = {
      sub: user.id,
      nome: user.nome,
      empresa_id: user.empresa_id,
      tipo_usuario: user.tipo_usuario || user.function_id,
      expires_in: 60 * 60 * 24 * 7 // 1 week
    };

    const token = this.jwtService.sign(payload);

    // Sanitize
    if (user.senha) delete user.senha;
    if (user.password) delete user.password;



    return {
      data: user,
      access_token: token
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

  async requestPasswordReset(email: string) {

    console.log("inicianto solicitacao de reset de senha para : ", email)

    // 1. Check if user exists
    const { data: user, error } = await this.supabase.supabase
      .from('usuario')
      .select('id, nome, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      console.error("usuário não encontrado")
      // For security, don't reveal if user exists. Just return "success" message.
      return { success: true };
    }

    // 2. Generate a temporary reset token (mocking for now, could be a UUID in a new table)
    const token = Math.random().toString(36).substring(2, 15);

    // 3. TODO: Store token in database with expiration
    const { data: tokenData, error: tokenError } = await this.supabase.supabase
      .from('reset_tokens')
      .insert({
        user_id: user.id,
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
    const html = resetPasswordTemplate({
      name: user.nome,
      // resetLink: `https://mvkgym.vercel.app/#/reset-password?token=${token}`,
      resetLink: `http://localhost:8100/#/reset-password?token=${token}`,
    })

    console.log("html = ", html)

    // 4. Send email via EmailService
    await this.emailService.sendEmail({
      title: 'Recuperação de Senha',
      to_email: user.email,
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
      const { data: user, error: userError } = await this.supabase.supabase
        .from('usuario')
        .update({ senha: md5(novaSenha) })
        .eq('id', tokenData.user_id)
        .select()
        .single();

      if (userError) throw userError;

      console.log("user: ", user)
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
