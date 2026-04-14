import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoInput, ProdutoFilters } from './produto.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../core/Constants/UserRole';
import { EmpresaService } from '../empresa/empresa.service';

/**
 * Controller para gestão de produtos do e-commerce
 */
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService, private readonly empresaService: EmpresaService) { }

  /**
   * Listar produtos públicos (sem autenticação)
   * GET /produtos/publico/:empresaId
   */
  @Get('publico/:empresaId')
  async findAllPublico(@Param('empresaId') empresaId: string) {


    const res = await this.produtoService.findByEmpresaId(empresaId);
    return { success: true, data: res };
  }

  /**
   * Criar novo produto
   * POST /produtos/:empresaId
   */
  @Post(':empresaId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async create(
    @Param('empresaId') empresaId: string,
    @Body() input: ProdutoInput,
  ) {
    const produto = await this.produtoService.create(empresaId, input);
    return { success: true, data: produto };
  }

  /**
   * Listar produtos
   * GET /produtos/:empresaId
   */
  @Get(':empresaId')
  async findAll(
    @Param('empresaId') empresaId: string,
  ) {
    const filters: ProdutoFilters = {
      empresa_id: empresaId,
    };

    const produtos = await this.produtoService.findAll(filters);
    return { success: true, data: produtos };
  }

  /**
   * Buscar produto por ID
   * GET /produtos/:empresaId/:id
   */
  @Get(':empresaId/:id')
  async findById(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
  ) {
    const produto = await this.produtoService.findById(id, empresaId);
    if (!produto) {
      return { success: false, message: 'Produto não encontrado' };
    }
    return { success: true, data: produto };
  }

  /**
   * Atualizar produto
   * PUT /produtos/:empresaId/:id
   */
  @Put(':empresaId/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async update(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
    @Body() input: Partial<ProdutoInput>,
  ) {
    const produto = await this.produtoService.update(id, empresaId, input);
    return { success: true, data: produto };
  }

  /**
   * Deletar produto
   * DELETE /produtos/:empresaId/:id
   */
  @Delete(':empresaId/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
  ) {
    await this.produtoService.delete(id, empresaId);
    return { success: true, message: 'Produto deletado com sucesso' };
  }

  /**
   * Listar produtos com estoque baixo
   * GET /produtos/:empresaId/estoque/baixo
   */
  @Get(':empresaId/estoque/baixo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async findEstoqueBaixo(@Param('empresaId') empresaId: string) {
    const produtos = await this.produtoService.findEstoqueBaixo(empresaId);
    return { success: true, data: produtos };
  }

  /**
   * Listar categorias
   * GET /produtos/:empresaId/lista/categorias
   */
  @Get(':empresaId/lista/categorias')
  async getCategorias(@Param('empresaId') empresaId: string) {
    const categorias = await this.produtoService.getCategorias(empresaId);
    return { success: true, data: categorias };
  }
}