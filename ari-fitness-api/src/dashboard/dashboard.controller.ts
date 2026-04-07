/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }

  @Get('total-members-data')
  async getTotalMembers(@Query() query: any) {
    return this.dashboardService.getAllMembersDashboard(query);
  }

  @Get('best-instrutores-data/:empresaId')
  async getBestInstrutoresData(
    @Param('empresaId') empresaId: string,
    @Query() payload: any,
  ) {
    const { mes } = payload;
    return await this.dashboardService.getBestInstrutoresData(empresaId);
  }

  @Get('members-by-plan/:empresaId')
  async getMembersByPlan(@Param('empresaId') empresaId: string) {
    return await this.dashboardService.getMembersByPlan(empresaId);
  }

  @Get('totals/:empresaId')
  async getTotals(@Param('empresaId') empresaId: string) {
    return await this.dashboardService.getTotals(empresaId);
  }

  // ─── NOVOS ENDPOINTS ──────────────────────────────────────────────────────

  @Get('checkins-hoje/:empresaId')
  async getCheckinsHoje(@Param('empresaId') empresaId: string) {
    console.log(`[DashboardController] GET checkins-hoje | empresaId=${empresaId}`);
    return await this.dashboardService.getCheckinsHoje(empresaId);
  }

  @Get('alertas-vencimento/:empresaId')
  async getAlertasVencimento(
    @Param('empresaId') empresaId: string,
    @Query('dias') dias?: string,
  ) {
    console.log(`[DashboardController] GET alertas-vencimento | empresaId=${empresaId} | dias=${dias ?? 7}`);
    return await this.dashboardService.getAlertasVencimento(empresaId, dias ? parseInt(dias) : 7);
  }

  @Get('alunos-sem-checkin/:empresaId')
  async getAlunosSemCheckin(
    @Param('empresaId') empresaId: string,
    @Query('dias') dias?: string,
  ) {
    console.log(`[DashboardController] GET alunos-sem-checkin | empresaId=${empresaId} | dias=${dias ?? 14}`);
    return await this.dashboardService.getAlunosSemCheckin(empresaId, dias ? parseInt(dias) : 14);
  }

  @Get('pico-checkins/:empresaId')
  async getPicoCheckins(@Param('empresaId') empresaId: string) {
    console.log(`[DashboardController] GET pico-checkins | empresaId=${empresaId}`);
    return await this.dashboardService.getPicoCheckins(empresaId);
  }

  @Get('receitas-pendentes/:empresaId')
  async getReceitasPendentes(@Param('empresaId') empresaId: string) {
    console.log(`[DashboardController] GET receitas-pendentes | empresaId=${empresaId}`);
    return await this.dashboardService.getReceitasPendentes(empresaId);
  }

  @Get('despesas-pendentes/:empresaId')
  async getDespesasPendentes(@Param('empresaId') empresaId: string) {
    console.log(`[DashboardController] GET despesas-pendentes | empresaId=${empresaId}`);
    return await this.dashboardService.getDespesasPendentes(empresaId);
  }
}

