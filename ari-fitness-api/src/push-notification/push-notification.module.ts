import { Module } from '@nestjs/common';
import { PushNotificationController } from './push-notification.controller';
import { PushNotificationService } from './push-notification.service';
import { DataBaseModule } from 'src/datasource/database.module';

@Module({
    imports: [DataBaseModule],
    controllers: [PushNotificationController],
    providers: [PushNotificationService],
    exports: [PushNotificationService],
})
export class PushNotificationModule { }
