import { Body, Controller, Get, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { EventoService } from './evento.service';
import { IEvento } from './Evento.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/core/Constants/UserRole';

@Controller('evento')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventoController {
  constructor(private eventoService: EventoService) { }

  sortByStartDay(eventos: IEvento[]) {
    return eventos.sort(
      (a, b) =>
        new Date(a.data_inicio).getTime() - new Date(b.data_inicio).getTime(),
    );
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR, UserRole.STUDENT)
  findAllByFilters(@Query() query: Partial<IEvento>, @Res() res: Response) {
    return this.eventoService.findAllByFilters(query).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      return res.send(this.sortByStartDay(_res.data as IEvento[]));
    });
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  create(@Body() body: IEvento, @Res() res: Response) {
    console.log('criando evento: ', body);
    return this.eventoService.create(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);
      return res.status(201).send(this.sortByStartDay(_res.data as IEvento[]));
    });
  }

  @Put()
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  update(@Body() body: Partial<IEvento>, @Res() res: Response) {
    console.log('atualizando evento: ', body);

    return this.eventoService.update(body).then((_res) => {
      console.log('_res: ', _res);

      //retorna os eventos ordenados por data
      if (_res.error) res.status(500).send(_res.error);
      return res.status(200).send(this.sortByStartDay(_res.data as IEvento[]));

      // res.send(_res.data?.sort((a, b) => a.data_inicio.localeCompare(b.data_inicio) ));
    });

    // .then((_res) => {
    //     if (_res.error) res.status(500).send(_res.error);
    //     return res.status(203).send(_res.data);
    //   });;
  }
}
