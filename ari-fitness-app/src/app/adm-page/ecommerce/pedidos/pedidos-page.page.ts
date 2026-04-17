import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { PedidoService, Pedido, Estatisticas } from 'src/core/services/ecommerce/pedido.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { PedidoDetailModalComponent } from './pedido-detail-modal/pedido-detail-modal.component';

@Component({
  selector: 'app-pedidos-page',
  templateUrl: './pedidos-page.page.html',
  styleUrls: ['./pedidos-page.page.scss'],
})
export class PedidosPagePage implements OnInit {
  pedidos: Pedido[] = [];
  loading = true;
  stats: Estatisticas = { total: 0, pendentes: 0, pagos: 0, cancelados: 0, valorTotal: 0 };

  constructor(
    private pedidoService: PedidoService,
    private toastr: ToastrService,
    private alertController: AlertController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.loadPedidos();
    this.loadEstatisticas();
  }

  loadPedidos() {
    this.loading = true;
    this.pedidoService.getAll().subscribe({
      next: (res) => {
        this.pedidos = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Erro ao carregar pedidos');
      }
    });
  }

  loadEstatisticas() {
    this.pedidoService.getEstatisticas().subscribe({
      next: (res) => {
        this.stats = res.data || this.stats;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pendente': return 'warning';
      case 'pago': return 'success';
      case 'cancelado': return 'danger';
      case 'entregue': return 'tertiary';
      default: return 'medium';
    }
  }

  atualizarStatus(pedido: Pedido, novoStatus: string) {
    this.pedidoService.updateStatus(pedido.id!, novoStatus).subscribe({
      next: () => {
        this.toastr.success('Status atualizado!');
        this.loadPedidos();
        this.loadEstatisticas();
      },
      error: () => this.toastr.error('Erro ao atualizar')
    });
  }

  async mostrarOpcoesStatus(pedido: Pedido) {
    // Agora busca o pedido completo com Itens do backend 
    this.loading = true;
    this.pedidoService.getById(pedido.id!).subscribe({
      next: async (res) => {
        this.loading = false;
        const pedidoCompleto = res.data;
        if (!pedidoCompleto) return;

        const modal = await this.modalCtrl.create({
          component: PedidoDetailModalComponent,
          componentProps: { pedido: pedidoCompleto },
          cssClass: 'premium-modal',
          backdropDismiss: true,
          mode: 'ios'
        });

        await modal.present();

        const { data } = await modal.onDidDismiss();

        if (data?.status) {
          this.atualizarStatus(pedido, data.status);
        }
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Erro ao buscar detalhes do pedido');
      }
    });

  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}