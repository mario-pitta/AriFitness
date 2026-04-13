import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { InstructorService } from './instructor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../core/Constants/UserRole';
import { Instructor } from './entities/instructor.entity';

@Controller('instructors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstructorController {
    constructor(private readonly instructorService: InstructorService) { }

    @Get()
    @Roles(UserRole.GERENCIA)
    async findAll(@Query('empresa_id') empresa_id: string): Promise<any[]> {
        return this.instructorService.findAll(empresa_id);
    }

    @Get(':id')
    @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
    async findOne(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<any> {
        return this.instructorService.findOne(id, empresa_id);
    }

    @Get('user/:userId')
    @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
    async findByUserId(
        @Param('userId') userId: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<any | null> {
        return this.instructorService.findByUserId(userId, empresa_id);
    }

    @Post()
    @Roles(UserRole.GERENCIA)
    async create(@Body() data: any): Promise<any> {
        return this.instructorService.create(data);
    }

    @Patch(':id')
    @Roles(UserRole.GERENCIA)
    async update(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
        @Body() data: any,
    ): Promise<any> {
        return this.instructorService.update(id, empresa_id, data);
    }

    @Delete(':id')
    @Roles(UserRole.GERENCIA)
    async remove(
        @Param('id') id: string,
        @Query('empresa_id') empresa_id: string,
    ): Promise<boolean> {
        return this.instructorService.remove(id, empresa_id);
    }
}
