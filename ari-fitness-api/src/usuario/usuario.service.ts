/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Usuario } from './Usuario.interface';
import md5 = require('md5');
import { TransacaoFinanceira } from 'src/transacao_financeira/TransacaoFinanceira.interface';

const tableName = 'usuario';

@Injectable()
export class UsuarioService {



  constructor(private database: DataBaseService) { }


  /**
   * Analisa o status de pagamento do aluno com base nas transações de Matrícula (14) e Mensalidade (1).
   * Scenarios:
   * 1. Sem Matrícula: Falta transação 14. -> "Pendencias" (ou "Sem Matrícula")
   * 2. Em Atraso: Hoje > dia_vencimento AND sem pagamento no mês atual.
   * 3. Há Pendências: Faltam transações em meses anteriores desde o cadastro.
   * 4. Em Dia: Se tudo acima estiver ok.
   */
  checkStatusPagamento(user: Usuario, transacoes: TransacaoFinanceira[]): {
    label: string;
    errors: string[];
  } {
    const dataAtual = new Date();
    const dataCadastro = new Date(user.created_at as string);
    const diaVencimento = typeof user.data_vencimento === 'number'
      ? user.data_vencimento
      : parseInt(user.data_vencimento?.toString()) || 10;

    // 1. Verificar Matrícula (Categoria 14)
    // const temMatricula = transacoes.some(t => t.tr_categoria_id === 14 && t.fl_pago);
    // if (!temMatricula) return { label: 'Há Pendências', errors: ['Sem Matrícula'] }; // Matrícula é obrigatória

    // Criar lista de meses necessários desde o cadastro até hoje
    const mesesNecessarios: { ano: number; mes: number }[] = [];
    const anoCadastro = dataCadastro.getFullYear();
    const mesCadastro = dataCadastro.getMonth();
    const anoAtual = dataAtual.getFullYear();
    const mesAtual = dataAtual.getMonth();

    for (let ano = anoCadastro; ano <= anoAtual; ano++) {
      const start = (ano === anoCadastro) ? mesCadastro : 0;
      const end = (ano === anoAtual) ? mesAtual : 11;
      for (let mes = start; mes <= end; mes++) {
        mesesNecessarios.push({ ano, mes });
      }
    }

    // Mapear transações pagas (Matrícula ou Mensalidade)
    const pagamentosRealizados = transacoes
      .filter(t => t.fl_pago && (t.tr_categoria_id === 1 || t.tr_categoria_id === 14))
      .map(t => `${t.ano}-${t.mes - 1}`);

    // 2. Verificar atraso no mês ATUAL
    const jaPagouEsteMes = pagamentosRealizados.includes(`${anoAtual}-${mesAtual}`);
    const diaHoje = dataAtual.getDate();

    if (!jaPagouEsteMes && diaHoje > diaVencimento) {
      return { label: 'Em Atraso', errors: ['Sem pagamento no mês atual'] };
    }

    // 3. Verificar se há pendências em meses ANTERIORES
    // (Ignoramos o mês atual se hoje <= diaVencimento, pois ainda não "venceu")
    for (const m of mesesNecessarios) {
      if (m.ano === anoAtual && m.mes === mesAtual) continue;

      if (!pagamentosRealizados.includes(`${m.ano}-${m.mes}`)) {
        return { label: 'Há Pendências', errors: [`Sem pagamento em ${m.mes + 1}/${m.ano}`] };
      }
    }

    return { label: 'Em Dia', errors: [] };
  }

  async findByFilters(filters: Partial<Usuario> | Usuario) {
    const res = await this.database.supabase
      .from(tableName)
      .select(
        `*,
        horarios ( 
         *
        ), 
        planos (
         *
        ), 
        transacao_financeira!transacao_financeira_pago_por_fkey ( 
          id, tr_categoria_id, fl_pago, ano, mes, data_lancamento
        )
        `,
      )
      .match({ ...filters })
      .order('nome', { ascending: true });

    console.log('res = ', res)


    const dataDezDiasAtras = new Date(new Date().setDate(new Date().getDate() - 10)).toISOString().split('T')[0];

    const { data: checkins, error: checkinError } = await this.database.supabase
      .from('checkin_acesso')
      .select('*')
      .eq('empresa_id', filters.empresa_id)
      //filtrar apenas os checkins dos ultimos 14 dias
      // .gte('data_hora', dataDezDiasAtras)
      .order('data_hora', { ascending: false });


    console.log('checkins = ', checkins)

    if (!res.error && res.data) {
      res.data = res.data.map(u => {
        delete u.senha;
        u.status_pagamento = this.checkStatusPagamento(u, u.transacao_financeira as TransacaoFinanceira[])
        delete u.transacao_financeira;
        u.data_ultimo_checkin = checkins?.filter(c => c.cpf_aluno === u.cpf)[0]?.data_hora || null;

        return u;
      });
    }

    return res;
  }

  /**
   * The `create` function inserts a new record on database using the provided user data.
   * @param {Usuario} body - The `body` parameter in the `create` function likely represents the data or
   * object of type `Usuario` that you want to insert into a database table. It contains the information
   * or fields that you want to store in the database.
   * @returns The `create` function is returning the result of inserting the `body` object into the
   * specified table in the database.
   */
  create(body: Usuario) {
    console.log('creating new user: ', body);
    console.log(md5('message'));
    return this.database.supabase
      .from(tableName)
      .insert(
        {
          ...body,
          senha: md5('123456'),
        },
        {},
      )
      .then((res) => {
        // console.log('RES: ', res);

        return res;
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
  async update(body: Partial<Usuario>) {
    console.log('updateUsuario body: ', body);

    return await this.database.supabase
      .from(tableName)
      .update(body)
      .eq('id', body.id)
      .select('*');
  }

  /**
   * Atualiza apenas os campos de perfil que o próprio usuário logado tem permissão de editar.
   * Campos sensíveis como cpf, tipo_usuario, plano e empresa_id são ignorados por whitelist.
   *
   * @param {number} userId - ID do usuário autenticado (extraído do JWT, nunca do body).
   * @param {Partial<Usuario>} data - Dados enviados pelo usuário (somente campos permitidos serão salvos).
   * @returns {Promise} Resultado da atualização no Supabase.
   */
  async updateMeuPerfil(userId: number, data: Partial<Usuario>) {
    const camposPermitidos: (keyof Usuario)[] = [
      'foto_url',
      'peso',
      'altura',
      'whatsapp',
      'email',
      'instagram_username',
    ];

    const dadosFiltrados: Partial<Usuario> = {};
    for (const campo of camposPermitidos) {
      if (data[campo] !== undefined) {
        (dadosFiltrados as any)[campo] = data[campo];
      }
    }

    return await this.database.supabase
      .from(tableName)
      .update(dadosFiltrados)
      .eq('id', userId)
      .select('*');
  }

  /**
   * This TypeScript function retrieves instructors based on specified filters for a given company ID
   * from a Supabase database.
   * @param {number} empresaId - The `empresaId` parameter is a number that represents the ID of the
   * company or organization for which you want to find instructors.
   * @param {any} filters - The `filters` parameter in the `findInstrutorByFilters` function is an
   * object that contains specific criteria for filtering the instructors. These criteria can be used to
   * narrow down the search results based on various attributes or properties of the instructors. The
   * function will apply these filters to the database query to retrieve
   * @returns This function is returning a query to the database to find instructors based on the
   * provided filters and the company ID. The query selects all columns from a table named `tableName`
   * where the `tipo_usuario` is 2 and the `empresa_id` matches the provided `empresaId`. It also
   * includes a nested query to fetch related data about the instructor's students and their user
   * information. The filters provided are
   */
  findInstrutorByFilters(empresaId: number, filters: any) {
    return this.database.supabase
      .from(tableName)
      .select(
        `*,
        alunos: ficha_aluno!ficha_aluno_instrutor_id_fkey(
          *,
          usuario: usuario!ficha_aluno_usuario_id_fkey(
            id, 
            nome, 
            data_nascimento,

            genero,
            *
          )
        )
        `,
      )
      .eq('tipo_usuario', 2)
      .eq('empresa_id', empresaId)
      .match({
        ...filters,
      });
  }

  /**
   * Registra um novo check-in na tabela 'checkin_acesso'.
   *
   * @param {string} cpf - CPF do aluno ou visitante.
   * @param {string} nome - Nome do aluno ou visitante.
   * @param {string} empresaId - ID da academia onde o check-in ocorreu.
   * @param {string} [localizacao=''] - Coordenada GPS para validação de proximidade.
   * @returns {object} O registro inserido ou um erro.
   */
  async registrarCheckin(cpf: string, nome: string, empresaId: string) {
    // 1. **VALOR AGREGADO:** Lógica de Pré-Check-in (Implementar no Backend)

    // a) Verificar Status do Usuário: 
    // Esta consulta deve verificar se o CPF existe na 'usuario', se está ativo, se é aluno, etc.
    const { data: usuario, error: erroUsuario } = await this.database.supabase
      .from('usuario')
      .select('id, fl_ativo, tipo_usuario')
      .eq('cpf', cpf)
      .single();

    if (erroUsuario && erroUsuario.code !== 'PGRST116') { // PGRST116 = Não encontrou linha (Visitante)
      console.error("Erro ao verificar status do usuário:", erroUsuario);

      return { success: false, message: "Falha na comunicação com a base de usuários.", error: { message: "Falha na comunicação com a base de usuários." } };
    }

    const isVisitante = !usuario;
    if (!isVisitante && !usuario.fl_ativo) {
      // Exemplo de regra: impedir acesso se o aluno estiver inativo/inadimplente
      return { success: false, error: { message: 'Acesso negado: Matrícula inativa.' }, message: "Acesso negado: Matrícula inativa." };
    }

    // b) Prevenção de Abuso / Múltiplos Check-ins:
    // Verifica se houve um check-in recente na mesma empresa
    const { data: ultimoCheckin, error: erroUltimoCheckin } = await this.database.supabase
      .from('checkin_acesso')
      .select('data_hora')
      .eq('cpf_aluno', cpf)
      .eq('empresa_id', empresaId)
      .order('data_hora', { ascending: false })
      .limit(1)
      .single();

    console.log('💻🔍🪲 - cpf', cpf);


    console.log('💻🔍🪲 - ultimoCheckin', ultimoCheckin);
    console.error('💻🔍🪲 - erroUltimoCheckin', erroUltimoCheckin);





    if (ultimoCheckin) {
      const ultimaCheckinHora = new Date(ultimoCheckin.data_hora).getTime();
      const horaAtual = new Date().getTime();
      const tempoDecorridoMinutos = (horaAtual - ultimaCheckinHora) / (1000 * 60);
      console.log('💻🔍🪲 - tempoDecorridoMinutos', tempoDecorridoMinutos);


      if (tempoDecorridoMinutos < (12 * 60)) { // Ex: Intervalo de 12 horas
        const message = `Check-in já realizado recentemente. Próximo check-in liberado em ${12 - Math.floor(tempoDecorridoMinutos / 60)} horas.`;
        return { success: false, message, error: { message } };
      }
    }

    // 2. REGISTRO DO CHECK-IN
    try {
      const objCheckin = {
        cpf_aluno: cpf,
        empresa_id: empresaId,
        nome
        // A coluna 'data_hora' usará o valor padrão (CURRENT_TIMESTAMP) do banco de dados
      };

      const { data: novoRegistro, error: erroRegistro } = await this.database.supabase
        .from("checkin_acesso")
        .insert([objCheckin])
        .select('*'); // Solicita o retorno do registro inserido

      if (erroRegistro) {
        console.error("Erro ao inserir check-in:", erroRegistro);
        return { success: false, message: "Erro interno ao registrar acesso.", error: { message: "Erro interno ao registrar acesso." } };
      }

      // 3. PÓS-CHECK-IN: Lógica de Gamificação e Notificações (Assíncrono)
      // Aqui você dispararia a lógica para atualizar o streak ou dar um badge.
      // O ID do novo check-in é: novoRegistro[0].id
      // await atualizarStreak(cpf, novoRegistro[0].data_checkin);

      await this.database.supabase
        .from('usuario')
        .update({ data_ultimo_checkin: novoRegistro[0].data_hora })
        .eq('cpf', cpf);


      return { success: true, data: novoRegistro[0], message: "Acesso Liberado!", error: null };

    } catch (error) {
      console.error("Erro fatal durante o registro do check-in:", error);
      return { success: false, message: "Ocorreu um erro inesperado no sistema.", error: null };
    }
  }

  /**
   * This TypeScript function retrieves check-ins with user status for a specific empresa (company)
   * using a UUID as a parameter.
   * @param {string} empresaId - The `getCheckinsByEmpresa` function is an asynchronous function that
   * retrieves check-ins based on the `empresaId` provided. The `empresaId` parameter is expected to be
   * a string representing a UUID.
   * @returns The `getCheckinsByEmpresa` function is returning the result of calling a Supabase RPC
   * named 'get_checkins_with_user_status' with the provided `empresaId`. If there is an error during
   * the RPC call, it will log the error and return an object with the error details. Otherwise, it will
   * return the response from the RPC call.
   */
  async getCheckinsByEmpresa(empresaId: string) {
    // Não precisa de parseInt(), o UUID é passado como string
    return this.database.supabase
      .rpc('get_checkins_with_user_status', {
        // O parâmetro 'empresa_id_param' espera uma string UUID
        empresa_id_param: empresaId
      })
      .then((res) => {
        console.log('💻🔍🪲 - res', res);


        if (res.error) {
          console.error("Erro ao chamar RPC get_checkins_with_user_status:", res.error);
          return { error: res.error, message: res.error.message };
        }
        return res;
      });
  }

  /**
   * The function `deleteCheckinById` deletes a check-in record from a database based on the provided
   * check-in ID.
   * @param {string} checkinId - The `checkinId` parameter is a string that represents the unique
   * identifier of a check-in record in the `checkin_acesso` table of the Supabase database. This
   * `deleteCheckinById` function is designed to delete a check-in record from the database based on the
   * provided `
   * @returns The `deleteCheckinById` function is returning a Supabase query that deletes a check-in
   * record from the 'checkin_acesso' table based on the provided `checkinId`.
   */
  async deleteCheckinById(checkinId: string) {
    return await this.database.supabase
      .from('checkin_acesso')
      .delete()
      .eq('id', checkinId);
  }

  async getFrequencyByCPFandEmpresaId(cpf: string, empresaId: string) {

    console.log('💻🔍🪲 - cpf', cpf);
    return await this.database.supabase
      .from('checkin_acesso')
      .select('*')
      .eq('cpf_aluno', cpf)
      .eq('empresa_id', empresaId)
      .order('data_hora', { ascending: false });
  }

  async getTreinoHistorico(usuarioId: number) {
    return await this.database.supabase
      .from('historico_treino')
      .select('*, exercicio:exercicios(*)')
      .eq('usuario_id', usuarioId)
      .order('data', { ascending: false });
  }

  async registrarTreinoHistorico(body: any) {
    // Sanitize body for DB
    const insertData = {
      usuario_id: body.usuario_id,
      treino_id: body.treino_id,
      exercicio_id: body.exercicio_id,
      series: body.series,
      repeticao: body.repeticao,
      carga: body.carga,
      intervalo: body.intervalo,
      nivel_dificuldade: body.nivel_dificuldade,
      empresa_id: body.empresa_id,
      data: new Date()
    };
    return await this.database.supabase
      .from('historico_treino')
      .insert(insertData)
      .select('*');
  }

  async importStudents(empresaId: string, students: any[]) {
    const studentsToInsert = students.map(s => ({
      ...s,
      empresa_id: empresaId,
      senha: md5('123456'), // Default password
      fl_ativo: true,
      tipo_usuario: 3
    }));

    return this.database.supabase
      .from(tableName)
      .insert(studentsToInsert)
      .select();
  }
}
