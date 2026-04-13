import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { Treino, TreinoSessao } from './Treino.interface';
import { TreinoService } from './treino.service';
import { TreinoSessaoService } from './treino-sessao.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../core/Constants/UserRole';
import { CurrentUser } from '../auth/decorators/current-user.decorator';


@Controller('treinos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreinoController {
  constructor(
    private treino: TreinoService,
    private sessaoService: TreinoSessaoService,
  ) { }

  @Get(':id/completo')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  getTreinoCompleto(@Param('id') id: number, @CurrentUser('empresa_id') empresa_id: string) {
    return this.sessaoService.getTreinoCompleto(id, empresa_id);
  }

  @Post('sessao')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  postSessao(@Body() body: Partial<TreinoSessao>, @CurrentUser('empresa_id') empresa_id: string) {
    body.empresa_id = empresa_id;
    return this.sessaoService.createSessao(body);
  }


  @Get()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR, UserRole.STUDENT)
  findAll(@Query() query: any, @Res() res: Response, @CurrentUser('empresa_id') empresa_id: string) {
    // Force filters by user's company
    const filters = { ...query, empresa_id: empresa_id };
    return this.treino.findAll(filters).then((_res) => {
      if (_res.error) {
        res.status(500).send(_res.error);
        throw new Error(JSON.stringify(_res.error));
      }

      return res.send(_res.data);
    });
  }

  @Post()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  create(@Body() body: Treino, @Res() res: Response, @CurrentUser('empresa_id') empresa_id: string) {
    // Inject empresa_id from token to ensure isolation
    body.empresa_id = empresa_id;
    return this.treino.create(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }


  @Put()
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  update(@Body() body: Treino, @Res() res: Response, @CurrentUser('empresa_id') empresa_id: string) {
    // Ensure the updated workout belongs to the user's company

    console.log('update Treino controller = ', body);

    body.empresa_id = empresa_id;
    return this.treino.update(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }


  @Delete(':id')
  @Roles(UserRole.GERENCIA, UserRole.INSTRUCTOR)
  delete(@Param('id') id: number, @Res() res: Response, @CurrentUser('empresa_id') empresa_id: string) {
    console.log("deleting treino: ", id);
    // Passing empresa_id to service to ensure ownership before deletion
    return this.treino.delete(id, empresa_id).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }
}
