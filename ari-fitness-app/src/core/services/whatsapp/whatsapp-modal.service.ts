
import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { WhatsAppSenderModalComponent } from 'src/app/shared/whatsapp-sender-modal/whatsapp-sender-modal.component';
import { WHATSAPP_TEMPLATES } from '../../constants/whatsapp-templates.constants';
import { AuthService } from '../auth/auth.service';

export type WhatsAppTemplateType = 'BILLING' | 'ENGAGEMENT' | 'RECEIPT' | 'UPCOMING';

@Injectable({
    providedIn: 'root'
})
export class WhatsAppModalService {

    constructor(
        private modalController: ModalController,
        private authService: AuthService
    ) { }

    /**
     * Abre o modal de envio de mensagem de WhatsApp
     * 
     * @param usuario Usuário de destino
     * @param type Tipo de template (BILLING | ENGAGEMENT)
     * @param extraData Dados extras para substituição no template (ex: { mes: 'Janeiro', ano: 2026 })
     */
    async openModal(usuario: any, type: WhatsAppTemplateType, extraData: any = {}) {
        const modal = await this.modalController.create({
            component: WhatsAppSenderModalComponent,
            componentProps: {
                usuario,
                type,
                message: this.generateMessage(type, usuario, extraData)
            }
        });

        await modal.present();
        return modal.onDidDismiss();
    }

    /**
     * Gera a mensagem final substituindo as variáveis do template
     * 
     * @param type Tipo de template
     * @param usuario Dados do usuário
     * @param extraData Dados extras (mes, ano, etc)
     */
    private generateMessage(type: WhatsAppTemplateType, usuario: any, extraData: any): string {
        const user = this.authService.getUser;
        const template = WHATSAPP_TEMPLATES[type];

        if (!template) return '';

        let message = template
            .replace(/{{nome}}/g, usuario?.nome || '')
            .replace(/{{remetente}}/g, user?.nome || '')
            .replace(/{{empresa}}/g, user?.empresa?.nome || '')
            .replace(/{{chave_pix}}/g, user?.empresa?.chave_pix || '');

        // Substituir dados extras (mes, ano, etc)
        if (extraData) {
            Object.keys(extraData).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                message = message.replace(regex, extraData[key] || '');
            });
        }

        return message;
    }
}
