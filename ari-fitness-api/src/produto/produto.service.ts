import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Produto, ProdutoInput, ProdutoFilters } from './produto.interface';

/**
 * Service para gestão de produtos do e-commerce
 */
@Injectable()
export class ProdutoService {
  constructor(private readonly databaseService: DataBaseService) {}

  /**
   * Criar novo produto
   */
  async create(empresaId: string, input: ProdutoInput): Promise<Produto> {
    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .insert({
        empresa_id: empresaId,
        nome: input.nome,
        descricao: input.descricao || null,
        preco: input.preco,
        estoque: input.estoque,
        estoque_minimo: input.estoque_minimo || 5,
        imagem_url: input.imagem_url || null,
        ativo: input.ativo !== false,
        categoria: input.categoria || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar produto por ID
   */
  async findById(id: string, empresaId: string): Promise<Produto | null> {
    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .select('*')
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }

  /**
   * Listar produtos com filtros
   */
  async findAll(filters: ProdutoFilters): Promise<Produto[]> {
    let query = this.databaseService.supabase
      .from('produtos')
      .select('*')
      .eq('empresa_id', filters.empresa_id);

    if (filters.ativo !== undefined) {
      query = query.eq('ativo', filters.ativo);
    }

    if (filters.categoria) {
      query = query.eq('categoria', filters.categoria);
    }

    if (filters.busca) {
      query = query.or(`nome.ilike.%${filters.busca}%,descricao.ilike.%${filters.busca}%`);
    }

    const { data, error } = await query.order('nome', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Atualizar produto
   */
  async update(id: string, empresaId: string, input: Partial<ProdutoInput>): Promise<Produto> {
    const updates: any = { ...input };

    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar produto (soft delete)
   */
  async delete(id: string, empresaId: string): Promise<void> {
    const { error } = await this.databaseService.supabase
      .from('produtos')
      .update({ ativo: false })
      .eq('id', id)
      .eq('empresa_id', empresaId);

    if (error) throw error;
  }

  /**
   * Buscar produtos com estoque baixo
   */
  async findEstoqueBaixo(empresaId: string): Promise<Produto[]> {
    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .select('*')
      .eq('empresa_id', empresaId)
      .eq('ativo', true);

    if (error) throw error;
    return (data || []).filter(p => p.estoque <= (p.estoque_minimo || 5));
  }

  /**
   * Atualizar estoque
   */
  async updateEstoque(id: string, empresaId: string, quantidade: number): Promise<Produto> {
    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .update({ estoque: quantidade })
      .eq('id', id)
      .eq('empresa_id', empresaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Listar categorias distintas
   */
  async getCategorias(empresaId: string): Promise<string[]> {
    const { data, error } = await this.databaseService.supabase
      .from('produtos')
      .select('categoria')
      .eq('empresa_id', empresaId)
      .not('categoria', 'is', null);

    if (error) throw error;
    const categorias = new Set<string>(data?.map((p: any) => p.categoria).filter(Boolean) as string[]);
    return Array.from(categorias);
  }
}