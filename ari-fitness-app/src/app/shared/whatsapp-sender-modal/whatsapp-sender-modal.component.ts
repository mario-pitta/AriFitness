



import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EvolutionService } from 'src/core/services/evolution/evolution.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { AuthService } from 'src/core/services/auth/auth.service';
@Component({
    selector: 'app-whatsapp-sender-modal',
    templateUrl: './whatsapp-sender-modal.component.html',
    styleUrls: ['./whatsapp-sender-modal.component.scss'],
})
export class WhatsAppSenderModalComponent implements OnInit {
    @Input() usuario: any;
    @Input() type: 'BILLING' | 'ENGAGEMENT' | 'RECEIPT' | 'UPCOMING' = 'BILLING';
    @Input() message: string = '';
    loading = false;
    user: any;
    constructor(
        private modalController: ModalController,
        private evolutionService: EvolutionService,
        private toastr: ToastrService,
        private authService: AuthService
    ) { }
    ngOnInit() {
        this.user = this.authService.getUser;
        console.log('this.usuario = ', this.usuario);
        console.log('type = ', this.type)

    }
    /***
     * Remove caracteres que possam quebrar a formatação do WhatsApp
     * (por exemplo, quebras de linha indevidas, caracteres de formatação
     *  Markdown ou símbolos especiais que o cliente WhatsApp interpreta).
     *
     * @param name nome a ser tratado
     * @returns nome sanitizado
     */
    private sanitizeName(name: string): string {
        if (!name) return '';
        // Remove caracteres de controle e símbolos de formatação comuns
        return name
            .replace(/%0D/g, ' ')               // evita quebra de linha explícita
            .replace(/[\r\n]+/g, ' ')           // converte quebras de linha reais em espaço
            .replace(/[\\*_~`]+/g, '')          // remove markdown (\, *, _, ~, `)
            .trim();
    }
    /***
     * Constrói a mensagem final garantindo:
     *  - quebras de linha corretas para WhatsApp
     *  - nome do aluno sanitizado
     *
     * @param rawMessage mensagem original (com placeholders)
     * @returns mensagem pronta para envio
     */
    private buildFinalMessage(rawMessage: string): string {
        // Substitui placeholder de nome, se existir, pelo nome tratado
        const namePlaceholder = '{{nome}}';
        const sanitized =
            this.usuario?.nome ? this.sanitizeName(this.usuario.nome) : '';
        const messageWithName = rawMessage.includes(namePlaceholder)
            ? rawMessage.replace(namePlaceholder, sanitized)
            : rawMessage;
        // Converte %0D em nova linha (formato aceito pelo WhatsApp)
        return messageWithName.replace(/%0D/g, '\n');
    }
    dismiss() {
        this.modalController.dismiss();
    }
    sendMessage() {
        console.log('this.usuario = ', this.usuario)
        console.log('this.user = ', this.user)
        if (!this.usuario?.id || !this.user?.empresa_id) {
            this.toastr.error('Erro ao enviar via API. Abrindo WhatsApp Web...');
            return;
        };
        this.loading = true;
        const finalMessage = this.buildFinalMessage(this.message);
        console.log('finalMessage = ', finalMessage)

        this.evolutionService
            .sendMessage(this.user.empresa_id, String(this.usuario.id), finalMessage)
            .subscribe({
                next: () => {
                    this.toastr.success('Mensagem enviada com sucesso!');
                    this.modalController.dismiss({ sent: true });
                    this.loading = false;
                },
                error: () => {
                    this.toastr.error('Erro ao enviar via API. Abrindo WhatsApp Web...');
                    this.loading = false;
                    // Fallback manual
                    const mdMessage = encodeURIComponent(finalMessage);
                    const formattedNumber = this.usuario?.whatsapp?.replace(/\D/g, '');
                    const whatsappUrl = `https://wa.me/55${formattedNumber}?text=${mdMessage}`;
                    window.open(whatsappUrl, '_blank');
                    this.modalController.dismiss({ sent: false, manual: true });
                },
            });
    }
    copyMessage() {
        const finalMessage = this.buildFinalMessage(this.message);
        navigator.clipboard.writeText(finalMessage).then(() => {
            this.toastr.success('Mensagem copiada para a área de transferência!');
        });
    }
    get modalTitle(): string {
        return this.type === 'BILLING' ? 'Enviar Cobrança' : 'Enviar Engajamento';
    }
    get buttonLabel(): string {
        return this.type === 'BILLING' ? 'Enviar Cobrança' : 'Enviar Mensagem de Saudades';
    }
    get buttonColor(): string {
        return this.type === 'BILLING' ? 'primary' : 'success';
    }
}