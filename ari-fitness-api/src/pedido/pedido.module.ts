import { Module } from '@nestjs/common';
import { PedidoController } from './pedido.controller';
import { PedidoService } from './pedido.service';
import { DataBaseModule } from 'src/datasource/database.module';
import { TransacaoFinanceiraModule } from 'src/transacao_financeira/transacao-financeira.module';
import { PushNotificationModule } from 'src/push-notification/push-notification.module';

@Module({
  imports: [DataBaseModule, TransacaoFinanceiraModule, PushNotificationModule],
  controllers: [PedidoController],
  providers: [PedidoService],
  exports: [PedidoService],
})
export class PedidoModule { }