import { Controller, Post, Body, Req, UseGuards, Delete } from '@nestjs/common';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('push-notification')
@UseGuards(JwtAuthGuard)
export class PushNotificationController {
    constructor(private readonly pushService: PushNotificationService) { }

    @Post('subscribe')
    async subscribe(
        @Req() req: Request & { user: any },
        @Body() subscription: any
    ) {
        return this.pushService.saveSubscription(req.user, subscription);
    }

    @Delete('unsubscribe')
    async unsubscribe(
        @Req() req: Request & { user: any },
        @Body('endpoint') endpoint: string
    ) {
        return this.pushService.removeSubscription(req.user, endpoint);
    }
}
