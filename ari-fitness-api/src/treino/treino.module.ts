import { DataBaseModule } from 'src/datasource/database.module';
import { TreinoController } from './treino.controller';
import { TreinoService } from './treino.service';
import { TreinoSessaoService } from './treino-sessao.service';

/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [DataBaseModule],
  controllers: [TreinoController],
  providers: [TreinoService, TreinoSessaoService],
  exports: [TreinoService, TreinoSessaoService],

})
export class TreinoModule { }
