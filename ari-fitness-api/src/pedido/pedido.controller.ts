import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoInput, PedidoFilters } from './pedido.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../core/Constants/UserRole';

/**
 * Controller para gestão de pedidos do e-commerce
 */
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  /**
   * Criar novo pedido
   * POST /pedidos/:empresaId
   */
  @Post(':empresaId')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA, UserRole.INSTRUCTOR)
  async create(
    @Param('empresaId') empresaId: string,
    @Body() input: PedidoInput,
  ) {
    try {
      const pedido = await this.pedidoService.create(empresaId, input);
      return { success: true, data: pedido };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Listar pedidos
   * GET /pedidos/:empresaId
   */
  @Get(':empresaId')
  async findAll(@Param('empresaId') empresaId: string) {
    const filters: PedidoFilters = { empresa_id: empresaId };
    const pedidos = await this.pedidoService.findAll(filters);
    return { success: true, data: pedidos };
  }

  /**
   * Buscar pedido por ID
   * GET /pedidos/:empresaId/:id
   */
  @Get(':empresaId/:id')
  async findById(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
  ) {
    const pedido = await this.pedidoService.findById(id, empresaId);
    if (!pedido) {
      return { success: false, message: 'Pedido não encontrado' };
    }
    return { success: true, data: pedido };
  }

  /**
   * Atualizar status do pedido
   * PATCH /pedidos/:empresaId/:id/status
   */
  @Patch(':empresaId/:id/status')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async updateStatus(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    try {
      const pedido = await this.pedidoService.updateStatus(id, empresaId, status);
      return { success: true, data: pedido };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Cancelar pedido
   * POST /pedidos/:empresaId/:id/cancelar
   */
  @Post(':empresaId/:id/cancelar')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async cancel(
    @Param('empresaId') empresaId: string,
    @Param('id') id: string,
  ) {
    try {
      const pedido = await this.pedidoService.cancel(id, empresaId);
      return { success: true, data: pedido };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Estatísticas de pedidos
   * GET /pedidos/:empresaId/lista/estatisticas
   */
  @Get(':empresaId/lista/estatisticas')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async getEstatisticas(@Param('empresaId') empresaId: string) {
    const stats = await this.pedidoService.getEstatisticas(empresaId);
    return { success: true, data: stats };
  }
}