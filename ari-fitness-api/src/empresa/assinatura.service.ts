/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Assinatura, PlanoAssinaturaSystem, PlanoInfo } from './empresa.interface';

@Injectable()
export class AssinaturaService {
  constructor(private readonly databaseService: DataBaseService) {}

  async getAssinaturaAtiva(empresaId: string) {
    const { data: assinatura, error } = await this.databaseService.supabase
      .from('assinatura')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true)
      .in('status', ['ativa', 'trial'])
      .gte('data_vencimento', new Date().toISOString().split('T')[0])
      .order('data_vencimento', { ascending: false })
      .limit(1)
      .single();

    if (error || !assinatura) {
      return { error: { message: 'Nenhuma assinatura ativa encontrada' } };
    }

    const { data: plano } = await this.databaseService.supabase
      .from('plano_assinatura_system')
      .select('*')
      .eq('id', assinatura.plano_assinatura_id)
      .single();

    const { count: alunosCount } = await this.databaseService.supabase
      .from('usuario')
      .select('id', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);

    const { data: empresa } = await this.databaseService.supabase
      .from('empresa')
      .select('id, nome')
      .eq('id', empresaId)
      .single();

    const planoInfo: PlanoInfo = {
      assinatura: {
        id: assinatura.id,
        status: assinatura.status,
        data_inicio: assinatura.data_inicio,
        data_vencimento: assinatura.data_vencimento,
        valor_pago: assinatura.valor_pago,
        forma_pagamento: assinatura.forma_pagamento,
        auto_renovar: assinatura.auto_renovar,
      },
      plano: {
        id: plano?.id,
        nome: plano?.nome || 'Gratuito',
        descricao: plano?.descricao || '',
        preco: plano?.preco || 0,
        intervalo_meses: plano?.intervalo_meses || 1,
        limite_alunos: plano?.limite_alunos || 50,
        limite_instrutores: plano?.limite_instrutores || 5,
        limite_equipamentos: plano?.limite_equipamentos || 100,
        permite_checkin: plano?.permite_checkin ?? true,
        permite_ficha: plano?.permite_ficha ?? true,
        permite_financeiro: plano?.permite_financeiro ?? false,
        Permite_relatorios: plano?.permite_relatorios ?? false,
        suporta_whatsapp: plano?.suporta_whatsapp ?? false,
        suporte_prioritario: plano?.suporte_prioritario ?? false,
      },
      empresa: {
        id: empresa?.id,
        nome: empresa?.nome,
      },
      alunos_count: alunosCount || 0,
    };

    return { assinatura: planoInfo };
  }

  async getTodosPlanos() {
    return await this.databaseService.supabase
      .from('plano_assinatura_system')
      .select('*')
      .eq('fl_ativo', true)
      .order('ordenar', { ascending: true });
  }
}