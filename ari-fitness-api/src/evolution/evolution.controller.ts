import { Body, Controller, Get, Post, UseGuards, UnauthorizedException, Query } from "@nestjs/common";
import { EvolutionService } from "./evolution.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../core/Constants/UserRole";


@Controller('evolution')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvolutionController {
    constructor(private readonly evolutionService: EvolutionService) { }

    @Post('create-instance')
    @Roles(UserRole.GERENCIA)
    async createInstance(@Body('empresaId') empresaId: string) {
        return await this.evolutionService.createInstance(empresaId);
    }

    @Get('qr')
    @Roles(UserRole.GERENCIA)
    async getQRCode(@Query('empresa_id') empresa_id: string) {
        return await this.evolutionService.getQRCode(empresa_id);
    }

    @Get('status')
    @Roles(UserRole.GERENCIA)
    async getStatus(@Query('empresaId') empresaId: string) {
        return await this.evolutionService.getStatus(empresaId);
    }



    @Post('send-message')
    @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
    async sendMessage(
        @Body('empresaId') empresaId: string,
        @Body('usuarioId') usuarioId: string,
        @Body('text') text: string
    ) {
        return await this.evolutionService.sendMessageByUserId(empresaId, usuarioId, text);
    }

    @Post('disconnect')
    @Roles(UserRole.GERENCIA)
    async disconnect(@Body('empresaId') empresaId: string) {
        return await this.evolutionService.disconnect(empresaId);
    }
}
