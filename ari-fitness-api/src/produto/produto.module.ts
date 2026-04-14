import { Module } from '@nestjs/common';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';
import { DataBaseModule } from 'src/datasource/database.module';
import { EmpresaModule } from 'src/empresa/empresa.module';

@Module({
  imports: [
    DataBaseModule,
    EmpresaModule
  ],
  controllers: [ProdutoController],
  providers: [ProdutoService],
  exports: [ProdutoService],
})
export class ProdutoModule { }