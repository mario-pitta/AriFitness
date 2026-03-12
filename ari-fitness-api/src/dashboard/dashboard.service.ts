/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Usuario } from '../usuario/Usuario.interface';
import { DataBaseService } from 'src/datasource/database.service';

@Injectable()
export class DashboardService {
  constructor(private database: DataBaseService) { }

  getAllMembersDashboard(filters?: Partial<Usuario> | Usuario) {
    console.log('filters: ', filters);

    return this.database.supabase
      .from('usuario')
      .select(
        `*,
            plano: planos ( * ),
            horario: horarios ( * )
            `,
        { count: 'exact' },
      )
      .match({ ...filters })
      .then((res: any) => {
        if (res.error) return res;
        const genero = {
          male: 0,
          female: 0,
        };
        let memberAtLastMonth = 0;
        let newMembers = 0;
        let newMembersTendency = 0;
        const newMemberGender = {
          male: 0,
          female: 0,
        };
        const horarios = {} as any;
        const planDist: Record<string, number> = {};
        const ageDist = { 'Até 18': 0, '19-30': 0, '31-50': 0, '50+': 0 } as Record<string, number>;
        const paymentStatusDist: Record<string, number> = {};
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        res.data.forEach((user: Usuario) => {
          const dataCadastro = new Date(user.created_at);

          if (
            dataCadastro.getMonth() < new Date().getMonth() - 1 &&
            dataCadastro.getFullYear() <= new Date().getFullYear()
          )
            memberAtLastMonth++;
          if (user.genero === 'M') genero.male++;
          if (user.genero === 'F') genero.female++;
          if (dataCadastro.getMonth() == new Date().getMonth()) newMembers++;
          if (dataCadastro.getMonth() == new Date().getMonth() - 1)
            newMembersTendency++;

          if (dataCadastro.getMonth() == new Date().getMonth()) {
            if (user.genero === 'M') newMemberGender.male++;
            if (user.genero === 'F') newMemberGender.female++;
          }

          // Age calculation
          if (user.data_nascimento) {
            const birthDate = new Date(user.data_nascimento);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            if (age <= 18) ageDist['Até 18']++;
            else if (age <= 30) ageDist['19-30']++;
            else if (age <= 50) ageDist['31-50']++;
            else ageDist['50+']++;
          }

          // Plan distribution
          const planName = (user as any).plano?.descricao || 'Sem Plano';
          planDist[planName] = (planDist[planName] || 0) + 1;

          // Payment Status (using the virtual label or status if available)
          console.log("USER", user.nome)
          const dataUltimoPagamento = (user as any).data_ultimo_pagamento?.label || (user as any).data_ultimo_pagamento || 'N/A';
          console.log('thirtyDaysAgo: ', thirtyDaysAgo);

          let status = 'Inadimplente';
          if (dataUltimoPagamento && dataUltimoPagamento !== 'N/A') {
            const lastPayment = new Date(dataUltimoPagamento);
            console.log('lastPayment = ', lastPayment)

            if (!isNaN(lastPayment.getTime())) {
              status = lastPayment < thirtyDaysAgo ? 'Último Pagamento a mais de 30 dias' : 'Já pagou este mes';
            }
          }
          console.log('status: ', status);
          paymentStatusDist[status] = (paymentStatusDist[status] || 0) + 1;

          const hora = (user as any).horario?.hora_inicio?.slice(0, 5);
          if (hora) {
            if (!horarios[hora]) {
              horarios[hora] = 1;
            } else {
              horarios[hora]++;
            }
          }
        });

        return {
          totalMembers: {
            male: genero.male,
            female: genero.female,
            total: res.count,
          },
          newMembers: {
            total: newMembers,
            tendency: newMembersTendency,
            male: newMemberGender.male,
            female: newMemberGender.female,
          },
          memberAtLastMonth,
          horarios,
          planDist,
          ageDist,
          paymentStatusDist,
        };
      });
  }

  async getBestInstrutoresData(empresaId: string) {
    try {
      const { data, error } = await this.database.supabase
        .from('usuario')
        .select(
          `
          id,
          nome,
          genero,
          tipo_usuario (id, nome),
          ficha_aluno:ficha_aluno!ficha_aluno_instrutor_id_fkey(
            fl_ativo,
            ficha_data_fim,
            ficha_data_inicio,
            usuario:usuario!ficha_aluno_usuario_id_fkey(id, nome, genero),
            created_at
          )
        `,
        )
        .eq('empresa_id', empresaId)
        .eq('tipo_usuario', 2);

      if (error) {
        throw new Error(
          `Erro ao obter dados dos instrutores: ${JSON.stringify(error)}`,
        );
      }

      const bestInstrutores = data

        ?.slice(0, 3)
        ?.map((instrutor: any) => {
          const fichasAtivas = instrutor.ficha_aluno.filter(
            (ficha: any) => ficha.fl_ativo,
          ).length;
          const { fichasMesPassado, fichasMesAtual } = this.contarFichasPorMes(
            instrutor.ficha_aluno,
          );
          const percentualDiferenca = this.calcularPercentualDiferenca(
            fichasMesPassado,
            fichasMesAtual,
          );

          return {
            id: instrutor.id,
            nome: instrutor.nome,
            genero: instrutor.genero,
            fichasAtivas,
            fichasMesPassado,
            fichasMesAtual,
            percentualDiferenca,
          };
        })
        ?.sort((a: any, b: any) => b.fichasAtivas - a.fichasAtivas);

      return bestInstrutores;
    } catch (error) {
      console.error('Erro em getBestInstrutoresData:', error);
      throw error;
    }
  }

  private contarFichasPorMes(fichas: any[]) {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth();
    const anoAtual = dataAtual.getFullYear();

    const fichasMesPassado = fichas.filter((ficha) => {
      const dataFicha = new Date(ficha.created_at);
      const mesFicha = dataFicha.getMonth();
      const anoFicha = dataFicha.getFullYear();

      if (anoFicha < anoAtual) {
        return true;
      }

      if (anoFicha === anoAtual) {
        return mesFicha === mesAtual - 1;
      }

      return false;
    }).length;

    const fichasMesAtual = fichas.filter((ficha) => {
      const dataFicha = new Date(ficha.created_at);
      const mesFicha = dataFicha.getMonth();
      const anoFicha = dataFicha.getFullYear();

      return anoFicha === anoAtual && mesFicha === mesAtual;
    }).length;

    return { fichasMesPassado, fichasMesAtual };
  }

  private calcularPercentualDiferenca(
    mesPassado: number,
    mesAtual: number,
  ): string {
    let percentualDiferenca = 0;
    if (mesPassado !== 0) {
      percentualDiferenca = ((mesAtual - mesPassado) / mesPassado) * 100;
    }
    return parseInt(percentualDiferenca.toString()) + '%';
  }

  /**
   * Gets the total number of members, instructors, and other data for the given company.
   * @param {string} empresaId The id of the company.
   * @returns {Promise<number[]>} A promise that resolves with an array of numbers containing the total number of members, instructors, financial reports, and other data.
   */
  async getTotals(empresaId: string) {
    let totals = {
      totalMembros: 0,
      totalInstrutores: 0,
      totalReceitas: 0,
      totalDespesas: 0,
      totalAulas: 0,
      totalFichas: 0,
      receita_por_mes: [] as {
        mes: number;
        ano: number;
        mesAno: string;
        valor: number;
      }[],
      despesa_por_mes: [] as {
        mes: number;
        ano: number;
        mesAno: string;
        valor: number;
      }[],
    };

    const totalMembros = await this.database.supabase
      .from('usuario')
      .select('id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('tipo_usuario', 5); //tipo_usuario 5 = aluno/membro
    if (totalMembros.error) {
      throw new Error(
        `Erro ao obter total de membros: ${JSON.stringify(totalMembros.error)}`,
      );
    }

    console.log('totalMembros', totalMembros);

    totals.totalMembros = totalMembros.count || 0;

    const totalInstrutores = await this.database.supabase
      .from('usuario')
      .select('id', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('tipo_usuario', 2); //tipo_usuario 2 = instrutor
    if (totalInstrutores.error) {
      throw new Error(
        `Erro ao obter total de instrutores: ${JSON.stringify(
          totalInstrutores.error,
        )}`,
      );
    }
    totals.totalInstrutores = totalInstrutores.count || 0;

    const transacoes = await this.database.supabase
      .from('transacao_financeira')
      .select('id, valor_final, tr_tipo_id, data_lancamento')
      .eq('fl_ativo', true)
      .eq('empresa_id', empresaId);

    if (transacoes.error) {
      throw new Error(
        `Erro ao obter transações: ${JSON.stringify(transacoes.error)}`,
      );
    }

    //obtem os 12 ultimos meses 
    const dataAtual = new Date();
    const initial_date = new Date();
    initial_date.setMonth(dataAtual.getMonth() - 11);


    const processTransactionByDateAndType = (data_lancamento: string, tr_tipo_id: number, valor_final: number) => {
      const transacaoDate = new Date(data_lancamento);
      if (transacaoDate >= initial_date && transacaoDate <= dataAtual) {
        const mes = new Date(data_lancamento).getMonth();
        const ano = new Date(data_lancamento).getFullYear();
        const mesAno = `${mes + 1}/${ano}`;
        const payload = { mes, ano, mesAno };

        const propertyName: 'receita_por_mes' | 'despesa_por_mes' = tr_tipo_id === 1 ? 'receita_por_mes' : 'despesa_por_mes';

        if (!totals[propertyName].find((r) => r.mesAno === mesAno)) {
          totals[propertyName].push({ ...payload, valor: valor_final });
        } else {
          const index = totals[propertyName].findIndex(
            (r) => r.mesAno === mesAno,
          );
          totals[propertyName][index].valor += valor_final;
        }
      }
    };

    transacoes.data?.forEach((transacao) => {
      const { valor_final, tr_tipo_id, data_lancamento } = transacao;

      switch (tr_tipo_id) {
        case 1:
          totals.totalReceitas += valor_final;
          break;
        case 2:
          totals.totalDespesas += valor_final;
          break;

        default:
          break;
      }

      processTransactionByDateAndType(data_lancamento as string, tr_tipo_id, valor_final);


    });

    totals.receita_por_mes = totals.receita_por_mes.sort((a, b) => {
      if (a.ano === b.ano) {
        return a.mes - b.mes;
      }
      return a.ano - b.ano;
    });
    totals.despesa_por_mes = totals.despesa_por_mes.sort((a, b) => {
      if (a.ano === b.ano) {
        return a.mes - b.mes;
      }
      return a.ano - b.ano;
    });
    return totals;
  }

  async getMembersByPlan(empresaId: string) {
    const { data, error } = await this.database.supabase
      .from('usuario')
      .select('plano_id, planos(nome), count:id')
      .eq('empresa_id', empresaId)
      .eq('tipo_usuario', 5)


    if (error) {
      throw new Error(`Erro ao obter membros por plano: ${JSON.stringify(error)}`);
    }

    // Map result to a more readable format
    return data?.map((item: any) => ({
      planoId: item.plano_id,
      planoNome: item.planos?.nome,
      totalMembros: item.count
    })) || [];
  }

  // ─── NOVOS MÉTODOS DE DASHBOARD ────────────────────────────────────────────

  /**
   * Retorna check-ins realizados hoje para a empresa informada.
   */
  async getCheckinsHoje(empresaId: string) {
    const hoje = new Date().toISOString().split('T')[0];
    console.log(`[DashboardService] getCheckinsHoje | empresaId=${empresaId} | data=${hoje}`);

    const { data, error, count } = await this.database.supabase
      .from('checkin_acesso')
      .select('id, cpf_aluno, nome, hora_checkin', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('data_checkin', hoje)
      .order('hora_checkin', { ascending: true });

    if (error) {
      console.error(`[DashboardService] getCheckinsHoje ERROR:`, error);
      throw new Error(`Erro ao obter check-ins de hoje: ${JSON.stringify(error)}`);
    }

    console.log(`[DashboardService] getCheckinsHoje | total=${count}`);
    return { total: count ?? 0, checkins: data ?? [] };
  }

  /**
   * Retorna alunos cujo plano vence nos próximos N dias (default 7).
   * Usa o campo data_vencimento (dia do mês) para calcular.
   */
  async getAlertasVencimento(empresaId: string, dias = 7) {
    console.log(`[DashboardService] getAlertasVencimento | empresaId=${empresaId} | dias=${dias}`);

    const { data, error } = await this.database.supabase
      .from('usuario')
      .select('id, nome, cpf, whatsapp, data_vencimento, data_ultimo_pagamento, plano:planos(descricao, preco_padrao)')
      .eq('empresa_id', empresaId)
      .eq('tipo_usuario', 5)
      .eq('fl_ativo', true)
      .not('data_vencimento', 'is', null);

    if (error) {
      console.error(`[DashboardService] getAlertasVencimento ERROR:`, error);
      throw new Error(`Erro ao obter alertas de vencimento: ${JSON.stringify(error)}`);
    }

    const hoje = new Date();
    const alertas = (data ?? [])
      .filter((usuario: any) => {
        const diaVencimento = usuario.data_vencimento as number;
        const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
        if (vencimento < hoje) vencimento.setMonth(vencimento.getMonth() + 1);
        const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return diffDias >= 0 && diffDias <= dias;
      })
      .map((usuario: any) => {
        const diaVencimento = usuario.data_vencimento as number;
        const vencimento = new Date(hoje.getFullYear(), hoje.getMonth(), diaVencimento);
        if (vencimento < hoje) vencimento.setMonth(vencimento.getMonth() + 1);
        const diffDias = Math.ceil((vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        return { ...usuario, dias_para_vencer: diffDias, data_vencimento_calculada: vencimento.toISOString().split('T')[0] };
      })
      .sort((a: any, b: any) => a.dias_para_vencer - b.dias_para_vencer);

    console.log(`[DashboardService] getAlertasVencimento | alertas encontrados=${alertas.length}`);
    return { total: alertas.length, alertas };
  }

  /**
   * Retorna alunos ativos sem check-in há N dias (risco de churn, default 14).
   */
  async getAlunosSemCheckin(empresaId: string, dias = 14) {
    console.log(`[DashboardService] getAlunosSemCheckin | empresaId=${empresaId} | dias=${dias}`);

    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() - dias);
    const dataLimiteStr = dataLimite.toISOString().split('T')[0];

    const { data: checkinsRecentes, error: erroCheckin } = await this.database.supabase
      .from('checkin_acesso')
      .select('cpf_aluno')
      .eq('empresa_id', empresaId)
      .gte('data_checkin', dataLimiteStr);

    if (erroCheckin) {
      console.error(`[DashboardService] getAlunosSemCheckin ERROR (checkins):`, erroCheckin);
      throw new Error(`Erro ao buscar check-ins recentes: ${JSON.stringify(erroCheckin)}`);
    }

    const cpfsAtivos = new Set((checkinsRecentes ?? []).map((c: any) => c.cpf_aluno));

    const { data: alunos, error: erroAlunos } = await this.database.supabase
      .from('usuario')
      .select('id, nome, cpf, whatsapp, data_ultimo_pagamento')
      .eq('empresa_id', empresaId)
      .eq('tipo_usuario', 5)
      .eq('fl_ativo', true);

    if (erroAlunos) {
      console.error(`[DashboardService] getAlunosSemCheckin ERROR (alunos):`, erroAlunos);
      throw new Error(`Erro ao buscar alunos: ${JSON.stringify(erroAlunos)}`);
    }

    const alunosSemCheckin = (alunos ?? []).filter((a: any) => !cpfsAtivos.has(a.cpf));

    console.log(`[DashboardService] getAlunosSemCheckin | em risco=${alunosSemCheckin.length}`);
    return { total: alunosSemCheckin.length, alunos: alunosSemCheckin };
  }

  /**
   * Retorna distribuição de check-ins por hora do dia nos últimos 30 dias.
   */
  async getPicoCheckins(empresaId: string) {
    console.log(`[DashboardService] getPicoCheckins | empresaId=${empresaId}`);

    const dataInicio = new Date();
    dataInicio.setDate(dataInicio.getDate() - 30);
    const dataInicioStr = dataInicio.toISOString().split('T')[0];

    const { data, error } = await this.database.supabase
      .from('checkin_acesso')
      .select('hora_checkin')
      .eq('empresa_id', empresaId)
      .gte('data_checkin', dataInicioStr);

    if (error) {
      console.error(`[DashboardService] getPicoCheckins ERROR:`, error);
      throw new Error(`Erro ao obter pico de check-ins: ${JSON.stringify(error)}`);
    }

    const horaCount: Record<string, number> = {};
    (data ?? []).forEach((c: any) => {
      const hora = (Number(((c.hora_checkin as string)?.slice(0, 2)) ?? 'ND') - 3) + 'h';
      horaCount[hora] = (horaCount[hora] || 0) + 1;
    });

    const picos = Object.entries(horaCount)
      .map(([hora, total]) => ({ hora, total }))
      .sort((a, b) => a.hora.localeCompare(b.hora));

    console.log(`[DashboardService] getPicoCheckins | horas mapeadas=${picos.length}`);
    return { picos };
  }

  /**
   * Retorna total e lista de receitas pendentes (fl_pago = false, tr_tipo_id = 1).
   */
  async getReceitasPendentes(empresaId: string) {
    console.log(`[DashboardService] getReceitasPendentes | empresaId=${empresaId}`);

    const { data, error, count } = await this.database.supabase
      .from('transacao_financeira')
      .select('id, descricao, valor_final, data_lancamento, forma_pagamento', { count: 'exact' })
      .eq('empresa_id', empresaId)
      .eq('fl_pago', false)
      .eq('fl_ativo', true)
      .eq('tr_tipo_id', 1)
      .order('data_lancamento', { ascending: false });

    if (error) {
      console.error(`[DashboardService] getReceitasPendentes ERROR:`, error);
      throw new Error(`Erro ao obter receitas pendentes: ${JSON.stringify(error)}`);
    }

    const totalValor = (data ?? []).reduce((acc: number, t: any) => acc + (t.valor_final ?? 0), 0);

    console.log(`[DashboardService] getReceitasPendentes | qtd=${count} | total=R$${totalValor.toFixed(2)}`);
    return { total: count ?? 0, totalValor, transacoes: data ?? [] };
  }
}

