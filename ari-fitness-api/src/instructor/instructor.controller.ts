import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { Instructor } from './entities/instructor.entity';

@Controller('instructors')
export class InstructorController {
    constructor(private readonly instructorService: InstructorService) { }

    @Get()
    async findAll(@Query('empresa_id') empresa_id: string): Promise<any[]> {
        return this.instructorService.findAll(empresa_id);
    }

    @Get(':id')
    async findOne(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<any> {
        return this.instructorService.findOne(id, empresa_id);
    }

    @Get('user/:userId')
    async findByUserId(
        @Param('userId') userId: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<any | null> {
        return this.instructorService.findByUserId(userId, empresa_id);
    }

    @Post()
    async create(@Body() data: any): Promise<any> {
        return this.instructorService.create(data);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
        @Body() data: any,
    ): Promise<any> {
        return this.instructorService.update(id, empresa_id, data);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<boolean> {
        return this.instructorService.remove(id, empresa_id);
    }
}
