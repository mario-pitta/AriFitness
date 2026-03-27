import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AutomationsService } from "./automations.service";
import { N8NGuard } from "src/auth/guards/n8n.guard";

@Controller('automations')
export class AutomationsController {
    constructor(private readonly automationsService: AutomationsService) { }

    @Get('companies')
    @UseGuards(N8NGuard)
    async getCompanies() {
        return this.automationsService.getCompanies();
    }




}