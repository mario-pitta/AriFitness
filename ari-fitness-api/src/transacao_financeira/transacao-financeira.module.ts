/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TransacaoFinanceiraController } from './transacao-financeira.controller';
import { TransacaoFinanceiraService } from './transacao-financeira.service';
import { DataBaseModule } from 'src/datasource/database.module';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { EmpresaModule } from 'src/empresa/empresa.module';

@Module({
  controllers: [TransacaoFinanceiraController],
  providers: [TransacaoFinanceiraService],
  imports: [DataBaseModule, UsuarioModule, EmpresaModule],
  exports: [TransacaoFinanceiraService],
})
export class TransacaoFinanceiraModule { }
