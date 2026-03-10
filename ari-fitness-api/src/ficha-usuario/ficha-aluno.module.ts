/* eslint-disable prettier/prettier */
/*
https://docs.nestjs.com/modules
*/
import { FichaAlunoService } from './ficha-aluno.service';
import { DataBaseModule } from 'src/datasource/database.module';
import { FichaAlunoController } from './ficha-aluno.controller';
import { TreinoModule } from 'src/treino/treino.module';


import { Module } from '@nestjs/common';

@Module({
  imports: [DataBaseModule, TreinoModule],

  controllers: [FichaAlunoController],
  providers: [FichaAlunoService],
  exports: [FichaAlunoService],
})
export class FichaAlunoModule { }
