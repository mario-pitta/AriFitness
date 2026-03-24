/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { Empresa } from './empresa.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('empresa')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresaController {
    constructor(
        private empresaService: EmpresaService
    ) { }


    @Get(':empresaId')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
    async getEmpresa(@Param('empresaId') empresaId: string) {
        return await this.empresaService.getEmpresa(empresaId);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    async createEmpresa(@Body() empresa: Empresa) {
        return await this.empresaService.createEmpresa(empresa);
    }

    @Put(':empresaId')
    @Roles(UserRole.ADMIN)
    async updateEmpresa(@Param('empresaId') empresaId: Empresa['id'], @Body() empresa: Empresa) {
        return await this.empresaService.updateEmpresa(empresa);
    }

}
