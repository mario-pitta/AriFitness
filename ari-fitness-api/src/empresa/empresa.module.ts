/* eslint-disable prettier/prettier */
import { DataBaseModule } from 'src/datasource/database.module';
import { EmpresaController } from './empresa.controller';
import { EmpresaService } from './empresa.service';
import { AssinaturaController } from './assinatura.controller';
import { AssinaturaService } from './assinatura.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
  imports: [DataBaseModule],
  controllers: [EmpresaController, AssinaturaController],
  providers: [EmpresaService, AssinaturaService],
  exports: [EmpresaService, AssinaturaService],
})
export class EmpresaModule {}