/* eslint-disable prettier/prettier  */
import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { TransacaoFinanceira } from 'src/transacao_financeira/TransacaoFinanceira.interface';

@Injectable()
export class TransacaoFinanceiraDashService {
    constructor(private database: DataBaseService) { }

    async buildDashboardData(query: { data_inicio: string, data_fim: string, empresa_id: string }) {
        console.log('query: ', query);

        // Projeção de Receita
        const { data: activeUsers } = await this.database.supabase
            .from('usuario')
            .select('plano:planos(preco_padrao)')
            .eq('empresa_id', query.empresa_id)
            .eq('tipo_usuario', 5)
            .eq('fl_ativo', true)
            .not('tr_plano_id', 'is', null);

        const totalProjetado = (activeUsers ?? []).reduce((acc: number, u: any) => acc + (u.plano?.preco_padrao ?? 0), 0);

        return this.database.supabase
            .from('transacao_financeira')
            .select(
                `
                *, 
                tipo_transacao_financeira(*),
                categoria_transacao_financeira(*)
                
            `,
            )
            .eq('empresa_id', query.empresa_id)
            .eq('fl_ativo', true)
            .gte('valor_final', 0)
            .gte('data_lancamento', query.data_inicio)
            .lte('data_lancamento', query.data_fim)
            .then((_res) => {
                if (_res.error) {
                    console.error('erro no TransacaoFinanceira/findAll', _res.error);
                    return _res.error;
                }

                const dashboardData: any = {
                    totalReceitas: 0,
                    totalDespesas: 0,
                    saldo: 0,
                    totalPagadores: 0,
                    totalProjetado: totalProjetado || 0,
                    totalReceitasPorCategoria: [],
                    totalDespesasPorCategoria: [],
                };

                if (!_res.data) return dashboardData;
                const payingMembers = new Set();
                _res.data.forEach((item: TransacaoFinanceira) => {
                    //receitas
                    if (item.tr_tipo_id === 1) {
                        dashboardData.totalReceitas += item.valor_final || 0;
                        dashboardData.saldo += item.valor_final || 0;

                        if (item.pago_por) payingMembers.add(item.pago_por);

                        const found = dashboardData.totalReceitasPorCategoria.find(
                            (i: any) => i.tr_categoria_id === item.tr_categoria_id,
                        );
                        if (!found) {
                            dashboardData.totalReceitasPorCategoria.push({
                                tr_categoria_id: item.tr_categoria_id,
                                valor_final: item.valor_final || 0,
                                descricao: item.categoria_transacao_financeira?.descricao || '',
                            });
                        } else {
                            found.valor_final += item.valor_final || 0;
                        }
                    }

                    //despesas
                    if (item.tr_tipo_id === 2) {
                        dashboardData.totalDespesas += item.valor_final || 0;
                        dashboardData.saldo -= item.valor_final || 0;
                        const found = dashboardData.totalDespesasPorCategoria.find(
                            (i: any) => i.tr_categoria_id === item.tr_categoria_id,
                        );
                        if (!found) {
                            dashboardData.totalDespesasPorCategoria.push({
                                tr_categoria_id: item.tr_categoria_id,
                                valor_final: item.valor_final || 0,
                                descricao: item.categoria_transacao_financeira?.descricao || '',
                            });
                        } else {
                            found.valor_final += item.valor_final || 0;
                        }
                    }
                });

                dashboardData.totalPagadores = payingMembers.size;

                return dashboardData;
            });
    }

    async obterAnaliseReceitasMensal(ano: number, empresaId: string) {

        console.log('💻🔍🪲 - obterAnaliseReceitasMensal');
        const dataInicio = new Date(ano, 0, 1).toISOString(); // Primeiro dia do ano
        const dataFim = new Date(ano, 11, 31).toISOString();


        const { data, error } = await this.database.supabase
            .from('transacao_financeira')
            .select(`
        data_lancamento,
        tr_tipo_id,
        valor_final
      `)
            .eq('empresa_id', empresaId)
            .lte('data_lancamento', dataFim)
            .gte('data_lancamento', dataInicio)

        const nomesMeses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

        const meses = Array.from({ length: 12 }, (_, index) => ({
            mes: nomesMeses[index],
            receitas: 0,
            despesas: 0,
        }));

        data?.forEach(d => {
            const mesIndex = new Date(d.data_lancamento).getMonth();

            if (mesIndex >= 0 && mesIndex < 12) {
                if (d.tr_tipo_id === 1) {
                    meses[mesIndex].receitas += d.valor_final;
                } else {
                    meses[mesIndex].despesas += d.valor_final;
                }
            }
        });

        if (error) {
            console.error('💻🔍🪲 - error', error);
            throw new Error('Erro ao buscar análise de receitas.');
        }

        return meses;
    }

    async getExportData(query: {
        data_inicio: string,
        data_fim: string,
        empresa_id: string,
        categorias?: number[],
        status?: 'pago' | 'pendente' | 'cancelado'
    }) {
        let supabaseQuery = this.database.supabase
            .from('transacao_financeira')
            .select(`
                *,
                tipo:tipo_transacao_financeira(descricao),
                categoria:categoria_transacao_financeira(descricao),
                membro:usuario!pago_por(nome)
            `)
            .eq('empresa_id', query.empresa_id)
            .gte('data_lancamento', query.data_inicio)
            .lte('data_lancamento', query.data_fim)
            .order('data_lancamento', { ascending: true });

        if (query.categorias && query.categorias.length > 0) {
            supabaseQuery = supabaseQuery.in('tr_categoria_id', [query.categorias]);
        }

        if (query.status) {
            if (query.status === 'pago') {
                supabaseQuery = supabaseQuery.eq('fl_pago', true).eq('fl_ativo', true);
            } else if (query.status === 'pendente') {
                supabaseQuery = supabaseQuery.eq('fl_pago', false).eq('fl_ativo', true);
            } else if (query.status === 'cancelado') {
                supabaseQuery = supabaseQuery.eq('fl_ativo', false);
            }
        }

        const { data: transacoes, error: txError } = await supabaseQuery;

        if (txError) {
            console.error('Error fetching transactions for export:', txError);
            throw txError;
        }

        const { data: empresa, error: empError } = await this.database.supabase
            .from('empresa')
            .select('nome')
            .eq('id', query.empresa_id)
            .single();

        if (empError) {
            console.error('Error fetching empresa name:', empError);
        }

        return {
            transacoes,
            empresaNome: empresa?.nome || 'AriFitness',
            periodo: {
                inicio: query.data_inicio,
                fim: query.data_fim
            },
            dataGeracao: new Date().toISOString()
        };
    }
}
