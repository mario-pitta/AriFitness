import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataBaseService } from 'src/datasource/database.service';
import * as webpush from 'web-push';

export interface PushSubscriptionData {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    }
}

@Injectable()
export class PushNotificationService implements OnModuleInit {
    private readonly logger = new Logger(PushNotificationService.name);
    // Para simplificar num MVP e como não sabemos a chave VAPID ainda, geraremos chaves temporárias 
    // ou leremos do .env
    private vapidKeys = {
        publicKey: process.env.VAPID_PUBLIC_KEY || '',
        privateKey: process.env.VAPID_PRIVATE_KEY || ''
    };

    constructor(private databaseService: DataBaseService) { }

    onModuleInit() {
        if (!this.vapidKeys.publicKey) {
            // Em dev, se não tiver, gera provisoriamente
            this.vapidKeys = webpush.generateVAPIDKeys();
            this.logger.warn(`Chaves VAPID criadas provisoriamente. Coloque no .env:
            VAPID_PUBLIC_KEY=${this.vapidKeys.publicKey}
            VAPID_PRIVATE_KEY=${this.vapidKeys.privateKey}`);
        }

        webpush.setVapidDetails(
            'mailto:admin@mvkgym.com', // Coloque o e-mail real da empresa
            this.vapidKeys.publicKey,
            this.vapidKeys.privateKey
        );
    }

    getPublicKey() {
        return this.vapidKeys.publicKey;
    }

    async saveSubscription(user: any, subscription: PushSubscriptionData) {
        const { data, error } = await this.databaseService.supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.userId,
                empresa_id: user.empresa_id,
                endpoint: subscription.endpoint,
                keys: subscription.keys
            }, { onConflict: 'endpoint' });

        if (error) {
            this.logger.error('Erro ao salvar subscription', error);
            throw new Error('Falha ao registrar push notification');
        }
        return { success: true };
    }

    async removeSubscription(user: any, endpoint: string) {
        const { error } = await this.databaseService.supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user.userId)
            .eq('endpoint', endpoint);

        if (error) {
            this.logger.error('Erro ao excluir subscription', error);
        }
        return { success: true };
    }

    /**
     * Tenta enviar um push notificando os inscritos de uma empresa.
     */
    async sendPushToEmpresa(empresaId: string, title: string, message: string) {
        // Busca inscricoes dos gestores logados pela empresa
        const { data: subs, error } = await this.databaseService.supabase
            .from('push_subscriptions')
            .select('*')
            .eq('empresa_id', empresaId);

        if (error || !subs) {
            this.logger.warn(`Nenhuma inscrição para a empresa ${empresaId} ou erro de DB`, error);
            return;
        }

        const payload = JSON.stringify({
            notification: {
                title,
                body: message,
                icon: 'assets/icons/icon-128x128.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: 1
                }
            }
        });

        const promises = subs.map(async sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys
            };
            try {
                await webpush.sendNotification(pushSubscription, payload);
            } catch (err) {
                // Se o endpoint estiver expirado (Gone 410), devemos limpar o DB
                if (err.statusCode === 410 || err.statusCode === 404) {
                    this.logger.log(`Removendo subscription obsoleta: ${sub.endpoint}`);
                    await this.removeSubscription({ userId: sub.user_id }, sub.endpoint);
                } else {
                    this.logger.error('Erro no web-push sendNotification', err);
                }
            }
        });

        await Promise.all(promises);
    }
}
