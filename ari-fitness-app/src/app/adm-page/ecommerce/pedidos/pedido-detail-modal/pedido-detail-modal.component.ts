import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Pedido, PedidoService } from 'src/core/services/ecommerce/pedido.service';

@Component({
    selector: 'app-pedido-detail-modal',
    templateUrl: './pedido-detail-modal.component.html',
    styleUrls: ['./pedido-detail-modal.component.scss']
})
export class PedidoDetailModalComponent implements OnInit {
    @Input() pedido!: Pedido;

    public isLoadingItens = false;
    public statusChanging = false;

    constructor(
        private modalCtrl: ModalController,
        private pedidoService: PedidoService,
        private alertCtrl: AlertController
    ) { }

    ngOnInit() {
        if (this.pedido.id && !this.pedido.itens?.length) {
            this.isLoadingItens = true;
            this.pedidoService.getById(this.pedido.id).subscribe({
                next: (res) => {
                    this.pedido.itens = res.data.itens || [];
                    this.isLoadingItens = false;
                },
                error: () => {
                    this.isLoadingItens = false;
                }
            });
        }
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }

    async updateStatus(newStatus: string) {
        const statusLabel = this.getStatusLabel(newStatus);
        const alert = await this.alertCtrl.create({
            header: `Marcar como ${statusLabel}?`,
            message: `Deseja fechar o pedido após esta alteração?`,
            buttons: [
                {
                    text: 'Manter Aberto',
                    role: 'cancel',
                    handler: () => {
                        this.pedido.status = newStatus;
                    }
                },
                {
                    text: 'Fechar Pedido',
                    handler: () => {
                        this.closeWithStatus(newStatus);
                    }
                }
            ]
        });
        await alert.present();
    }

    private closeWithStatus(status: string) {
        this.statusChanging = true;
        setTimeout(() => {
            this.statusChanging = false;
            this.modalCtrl.dismiss({ status: status });
        }, 400);
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            pendente: 'Pendente',
            pago: 'Pago',
            entregue: 'Entregue',
            cancelado: 'Cancelado'
        };
        return labels[status] || status;
    }

    getStatusColor(status?: string): string {
        const safeStatus = status || '';
        switch (safeStatus) {
            case 'pendente': return 'status-pendente';
            case 'pago': return 'status-pago';
            case 'cancelado': return 'status-cancelado';
            case 'entregue': return 'status-entregue';
            default: return 'status-default';
        }
    }

    getInitials(name?: string): string {
        if (!name) return 'CL';
        return name.substring(0, 2).toUpperCase();
    }
}
