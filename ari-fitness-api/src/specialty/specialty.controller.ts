import { Controller, Get, Post, Body } from '@nestjs/common';
import { SpecialtyService } from './specialty.service';
import { Specialty } from './entities/specialty.entity';

@Controller('specialties')
export class SpecialtyController {
    constructor(private readonly specialtyService: SpecialtyService) { }

    @Get()
    async findAll(): Promise<any[]> {
        return this.specialtyService.findAll();
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.specialtyService.create(data);
    }
}
