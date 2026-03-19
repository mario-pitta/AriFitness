import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';

@Controller('team-member') // Keeping the route as 'instructor' for now to avoid breaking the frontend immediately, or I can change to 'team-member'
export class TeamMemberController {
    constructor(private readonly teamMemberService: TeamMemberService) { }

    @Get()
    findAll(@Query('empresa_id') empresa_id: string) {
        return this.teamMemberService.findAll(empresa_id);
    }

    @Get('user/:userId')
    findByUserId(@Param('userId') userId: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.findByUserId(userId, empresaId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.findOne(id, empresaId);
    }

    @Get('filters')
    findByFilters(@Query('filters') filters: string, @Query('empresa_id') empresaId: string) {
        console.log('findByFilters filters = ', filters)
        console.log('empresaId = ', empresaId)

        return this.teamMemberService.findByFilters(filters, empresaId);
    }

    @Post()
    create(@Body() body: any) {
        return this.teamMemberService.create(body);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Query('empresa_id') empresaId: string, @Body() body: any) {
        return this.teamMemberService.update(id, empresaId, body);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Query('empresa_id') empresaId: string) {
        return this.teamMemberService.remove(id, empresaId);
    }
}
