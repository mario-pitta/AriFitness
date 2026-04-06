import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';
import { Empresa } from 'src/empresa/empresa.interface';

@Controller('team-member') // Keeping the route as 'instructor' for now to avoid breaking the frontend immediately, or I can change to 'team-member'
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamMemberController {
    constructor(private readonly teamMemberService: TeamMemberService) { }

    @Get()
    @Roles(UserRole.ADMIN)
    findAll(@Query('empresa_id') empresa_id: string, @Query('filters') filters: string) {
        let filtersParsed = {};
        if (filters) {
            filtersParsed = JSON.parse(filters);
        }
        console.log('findAll filters = ', filtersParsed)
        console.log('empresaId = ', empresa_id)

        return this.teamMemberService.findAll(empresa_id, filtersParsed);
    }

    @Get('user/:userId')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    findByUserId(@Param('userId') userId: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.findByUserId(userId, empresaId);
    }

    @Get(':id')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    findOne(@Param('id') id: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.findOne(id, empresaId);
    }

    @Get('filters')
    @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
    findByFilters(@Query('filters') filters: string, @Query('empresa_id') empresaId: string) {
        console.log('findByFilters filters = ', filters)
        console.log('empresaId = ', empresaId)

        return this.teamMemberService.findByFilters(filters, empresaId);
    }

    @Post()
    @Roles(UserRole.ADMIN)
    create(@Body() body: any) {
        return this.teamMemberService.create(body);
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Query('empresa_id') empresaId: string, @Body() body: any) {
        return this.teamMemberService.update(id, empresaId, body);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.remove(id, empresaId);
    }
}
