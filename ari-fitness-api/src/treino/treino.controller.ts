import { Response } from 'express';
import { TreinoService } from './treino.service';
import { TreinoSessaoService } from './treino-sessao.service';
/*
https://docs.nestjs.com/controllers#controllers
*/

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Treino, TreinoSessao } from './Treino.interface';


@Controller('treinos')
export class TreinoController {
  constructor(
    private treino: TreinoService,
    private sessaoService: TreinoSessaoService,
  ) { }

  @Get(':id/completo')
  getTreinoCompleto(@Param('id') id: number) {
    return this.sessaoService.getTreinoCompleto(id);
  }

  @Post('sessao')
  postSessao(@Body() body: Partial<TreinoSessao>) {
    return this.sessaoService.createSessao(body);
  }


  @Get()
  findAll(@Query() query: any, @Res() res: Response) {
    return this.treino.findAll(query).then((_res) => {
      if (_res.error) {
        res.status(500).send(_res.error);
        throw new Error(JSON.stringify(_res.error));
      }

      return res.send(_res.data);
    });
  }

  @Post()
  /* The `create` method in the `TreinoController` class is a controller method that handles POST
    requests to create a new resource. However, there seems to be a mistake in the code provided. Both
    the `create` and `put` methods have the same method signature and name, which is incorrect. The
    `put` method should be used to update an existing resource, not to create a new one. */
  create(@Body() body: Treino, @Res() res: Response) {
    return this.treino.create(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }

  @Put()
  update(@Body() body: Treino, @Res() res: Response) {
    return this.treino.update(body).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }


  @Delete(':id')
  delete(@Param() params: { id: number }, @Res() res: Response) {
    console.log("deleting treino: ", params.id);


    return this.treino.delete(params.id).then((_res) => {
      if (_res.error) res.status(500).send(_res.error);

      return res.send(_res.data);
    });
  }
}
