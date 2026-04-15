import { Injectable } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import { Produto, ProdutoInput, ProdutoFilters } from './produto.interface';
import { Empresa } from 'src/empresa/empresa.interface';

/**
 * Service para gestão de produtos do e-commerce
 */
@Injectable()
export class ProdutoService {
  constructor(private readonly databaseService: DataBaseService) { }

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

  async findByEmpresaId(empresaId: string): Promise<{ empresa: Empresa, produtos: Produto[] }> {
    const { data: empresa, error } = await this.databaseService.supabase
      .from('empresa')
      .select('*, produtos(*)')
      .eq('id', empresaId)
      .eq('produtos.ativo', true)
      .single();
    // .order('produtos.name', { ascending: true });

    if (error) throw error;

    console.log('empresa = ', empresa)


    const produtos = empresa?.produtos || [];

    console.log('produtos = ', produtos)

    produtos?.sort((a: any, b: any) => a.nome.localeCompare(b.nome));

    return {
      ...empresa,
      produtos: produtos
    };
  }

  /**
   * Buscar produto público por ID com dados públicos da empresa
   * Retorna produto ativo + dados públicos da empresa (nome, logo, banner, formas pagamento)
   */
  async findByIdPublico(empresaId: string, produtoId: string): Promise<{ produto: Produto; empresa: any } | null> {
    const { data: produto, error: produtoError } = await this.databaseService.supabase
      .from('produtos')
      .select('id, nome, descricao, preco, estoque, imagem_url, categoria, empresa_id, ativo')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .eq('ativo', true)
      .single();

    if (produtoError || !produto) {
      return null;
    }

    const { data: empresa, error: empresaError } = await this.databaseService.supabase
      .from('empresa')
      .select(`
        id,
        nome_fantasia,
        telefone,
        logo_url,
        banner_url,
        accept_pix,
        accept_credit_card,
        accept_debit_card,
        accept_money_in_cash,
        chave_pix
      `)
      .eq('id', empresaId)
      .single();

    if (empresaError || !empresa) {
      return null;
    }

    return {
      produto,
      empresa: {
        id: empresa.id,
        nome_fantasia: empresa.nome_fantasia,
        telefone: empresa.telefone,
        logo_url: empresa.logo_url,
        banner_url: empresa.banner_url,
        accept_pix: empresa.accept_pix,
        accept_credit_card: empresa.accept_credit_card,
        accept_debit_card: empresa.accept_debit_card,
        accept_money_in_cash: empresa.accept_money_in_cash,
        chave_pix: empresa.chave_pix
      }
    };
  }
}