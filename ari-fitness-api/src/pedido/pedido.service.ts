import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Pedido, PedidoInput, PedidoItemInput, PedidoFilters } from './pedido.interface';

/**
 * Service para gestão de pedidos do e-commerce
 */
@Injectable()
export class PedidoService {
  constructor(private readonly databaseService: DataBaseService) {}

  /**
   * Criar novo pedido (com validação de estoque)
   */
  async create(empresaId: string, input: PedidoInput): Promise<Pedido> {
    const { itens, ...pedidoData } = input;
    let valorTotal = 0;

    for (const item of itens) {
      const { data: produto } = await this.databaseService.supabase
        .from('produtos')
        .select('estoque, preco')
        .eq('id', item.produto_id)
        .eq('empresa_id', empresaId)
        .eq('ativo', true)
        .single();

      if (!produto || !produto.estoque || produto.estoque < item.quantidade) {
        throw new Error(`Estoque insuficiente para produto ${item.produto_id}`);
      }

      valorTotal += item.quantidade * (item.preco_unitario || produto.preco);

      await this.databaseService.supabase
        .from('produtos')
        .update({ estoque: produto.estoque - item.quantidade })
        .eq('id', item.produto_id);
    }

    const { data: pedido, error } = await this.databaseService.supabase
      .from('pedidos')
      .insert({
        empresa_id: empresaId,
        cliente_id: pedidoData.cliente_id || null,
        cliente_nome: pedidoData.cliente_nome || null,
        cliente_telefone: pedidoData.cliente_telefone || null,
        cliente_email: pedidoData.cliente_email || null,
        forma_pagamento: pedidoData.forma_pagamento || null,
        obs: pedidoData.obs || null,
        valor_total: valorTotal,
        status: 'pendente',
        fl_ativo: true,
      })
      .select()
      .single();

    if (error) throw error;

    for (const item of itens) {
      const { data: produto } = await this.databaseService.supabase
        .from('produtos')
        .select('preco')
        .eq('id', item.produto_id)
        .single();

      if (!produto) {
        throw new Error(`Produto ${item.produto_id} não encontrado`);
      }

      await this.databaseService.supabase
        .from('pedido_itens')
        .insert({
          pedido_id: pedido.id,
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario || produto.preco,
        });
    }

    const novoPedido = await this.findById(pedido.id, empresaId);
    if (!novoPedido) {
      throw new Error('Erro ao buscar pedido criado');
    }
    return novoPedido;
  }

  /**
   * Buscar pedido por ID com itens
   */
  async findById(id: string, empresaId: string): Promise<Pedido | null> {
    const { data: pedido, error } = await this.databaseService.supabase
      .from('pedidos')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    const pedidoData = pedido as Pedido | null;
    if (!pedidoData) return null;

    const { data: itens } = await this.databaseService.supabase
      .from('pedido_itens')
      .select('*, produtos:nome(nome)')
      .eq('pedido_id', id);

    return { ...pedidoData, itens: itens || [] };
  }

  /**
   * Listar pedidos com filtros
   */
  async findAll(filters: PedidoFilters): Promise<Pedido[]> {
    let query = this.databaseService.supabase
      .from('pedidos')
      .select('*')
      .eq('empresa_id', filters.empresa_id)
      .eq('fl_ativo', true);

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.cliente_nome) {
      query = query.ilike('cliente_nome', `%${filters.cliente_nome}%`);
    }

    if (filters.data_inicio) {
      query = query.gte('created_at', filters.data_inicio);
    }

    if (filters.data_fim) {
      query = query.lte('created_at', filters.data_fim);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Atualizar status do pedido
   */
  async updateStatus(id: string, empresaId: string, status: string): Promise<Pedido> {
    const updateData: any = { status };

    if (status === 'pago') {
      updateData.pago_em = new Date().toISOString();
    }

    if (status === 'cancelado') {
      const { data: itens } = await this.databaseService.supabase
        .from('pedido_itens')
        .select('produto_id, quantidade')
        .eq('pedido_id', id);

      for (const item of itens || []) {
        await this.databaseService.supabase.rpc('increment_estoque', {
          produto_id: item.produto_id,
          quantidade: item.quantidade,
        });
      }
    }

    const { data, error } = await this.databaseService.supabase
      .from('pedidos')
      .update(updateData)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Cancelar pedido
   */
  async cancel(id: string, empresaId: string): Promise<Pedido> {
    return this.updateStatus(id, empresaId, 'cancelado');
  }

  /**
   * Estatísticas de pedidos
   */
  async getEstatisticas(empresaId: string, dataInicio?: string, dataFim?: string) {
    let query = this.databaseService.supabase
      .from('pedidos')
      .select('status, valor_total, created_at')
      .eq('empresa_id', empresaId)
      .eq('fl_ativo', true);

    if (dataInicio) query = query.gte('created_at', dataInicio);
    if (dataFim) query = query.lte('created_at', dataFim);

    const { data, error } = await query;

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      pendentes: data?.filter((p: any) => p.status === 'pendente').length || 0,
      pagos: data?.filter((p: any) => p.status === 'pago').length || 0,
      cancelados: data?.filter((p: any) => p.status === 'cancelado').length || 0,
      valorTotal: data?.reduce((sum: number, p: any) => sum + (p.status === 'pago' ? Number(p.valor_total) : 0), 0) || 0,
    };

    return stats;
  }
}