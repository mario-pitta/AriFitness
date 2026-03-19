import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ServiceService } from './service.service';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServiceController {
    constructor(private readonly serviceService: ServiceService) { }

    @Get()
    async findAll(@Query('empresa_id') empresa_id: string): Promise<any[]> {
        return this.serviceService.findAll(empresa_id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.serviceService.create(data);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: any,
    ): Promise<any> {
        return this.serviceService.update(id, data.empresa_id as string, data);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<boolean> {
        return this.serviceService.remove(id, empresa_id);
    }
}
