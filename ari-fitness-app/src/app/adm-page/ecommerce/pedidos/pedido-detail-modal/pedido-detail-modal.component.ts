import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Pedido, PedidoService } from 'src/core/services/ecommerce/pedido.service';

@Component({
    selector: 'app-pedido-detail-modal',
    templateUrl: './pedido-detail-modal.component.html',
    styleUrls: ['./pedido-detail-modal.component.scss']
})
export class PedidoDetailModalComponent implements OnInit {
    @Input() pedido!: Pedido;

    public isLoading = true;
    public statusChanging = false;

    constructor(private modalCtrl: ModalController, private pedidoService: PedidoService) { }

    ngOnInit() {
        if (this.pedido.id) {
            this.isLoading = true;
            this.pedidoService.getById(this.pedido.id).subscribe({
                next: (res) => {
                    this.pedido = res.data;
                    this.isLoading = false;
                },
                error: () => {
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    closeModal() {
        this.modalCtrl.dismiss();
    }

    updateStatus(newStatus: string) {
        this.statusChanging = true;
        setTimeout(() => {
            this.statusChanging = false;
            this.modalCtrl.dismiss({ status: newStatus });
        }, 400); // tempo da micro-animação
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
