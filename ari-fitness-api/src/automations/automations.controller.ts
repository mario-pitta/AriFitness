import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { AutomationsService } from "./automations.service";
import { N8NGuard } from "../auth/guards/n8n.guard";

@UseGuards(N8NGuard)
@Controller('automations')
export class AutomationsController {
    constructor(private readonly automationsService: AutomationsService) { }

    @Get('companies')
    @UseGuards(N8NGuard)
    async getCompanies() {
        return this.automationsService.getCompanies();
    }

    @Get('companies/:id/students')
    @UseGuards(N8NGuard)
    async getStudentsByCompanyId(@Param('id') id: string) {
        return this.automationsService.getAlunosByEmpresaId(id);
    }

}