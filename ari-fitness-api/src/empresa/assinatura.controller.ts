/* eslint-disable prettier/prettier */
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AssinaturaService } from './assinatura.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('assinatura')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssinaturaController {
  constructor(private assinaturaService: AssinaturaService) {}

  @Get('ativa/:empresaId')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async getAssinaturaAtiva(@Param('empresaId') empresaId: string) {
    return await this.assinaturaService.getAssinaturaAtiva(empresaId);
  }

  @Get('planos')
  @Roles(UserRole.ADMIN, UserRole.GERENCIA)
  async getTodosPlanos() {
    return await this.assinaturaService.getTodosPlanos();
  }
}