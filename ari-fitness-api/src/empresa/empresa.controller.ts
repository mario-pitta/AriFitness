/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { Empresa } from './empresa.interface';

@Controller('empresa')
export class EmpresaController {
    constructor(
        private empresaService: EmpresaService
    ) { }


    @Get(':empresaId')
    async getEmpresa(@Param('empresaId') empresaId: string) {
        return await this.empresaService.getEmpresa(empresaId);
    }

    @Post()
    async createEmpresa(@Body() empresa: Empresa) {
        return await this.empresaService.createEmpresa(empresa);
    }

    @Put(':empresaId')
    async updateEmpresa(@Param('empresaId') empresaId: Empresa['id'], @Body() empresa: Empresa) {
        return await this.empresaService.updateEmpresa(empresa);
    }

}
