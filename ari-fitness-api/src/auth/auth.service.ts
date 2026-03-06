import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import md5 = require('md5');
import * as emailjs from '@emailjs/nodejs';

@Injectable()
export class AuthService {
  constructor(private supabase: DataBaseService) { }

  login(cpf: string, senha: string) {
    console.log('logando...', cpf, senha);
    return this.supabase.supabase
      .from('usuario')
      .select(
        `
          *, 
          empresa: empresa(*),
          ficha_aluno: ficha_aluno!ficha_aluno_usuario_id_fkey(
            *, 
            treinos: ficha_aluno_treino!ficha_aluno_treino_ficha_id_fkey(
              *, 
              treino(
                *, 
                treino_exercicio(
                  *, 
                  exercicio: exercicios(
                    *
                  )
                )
              )
            )
          )
        `,
      )
      .eq('cpf', cpf)
      .eq('senha', senha);
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
    // 1. Check if user exists
    const { data: user, error } = await this.supabase.supabase
      .from('usuario')
      .select('id, nome, email')
      .eq('email', email)
      .single();

    if (error || !user) {
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

    if (tokenError) throw tokenError;

    // 4. Send email via EmailJS


    const templateParams = {
      to_email: email,
      to_name: user.nome,
      reset_link: `http://localhost:8100/auth/reset-password?token=${token}`,
    };

    try {
      await emailjs.send(
        process.env.EMAILJS_SERVICE_ID || '',
        process.env.EMAILJS_TEMPLATE_ID || '',
        templateParams,
      );
      console.log(`Email sent to ${email}`);
    } catch (err) {
      console.error('EmailJS Error:', err);
    }

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
