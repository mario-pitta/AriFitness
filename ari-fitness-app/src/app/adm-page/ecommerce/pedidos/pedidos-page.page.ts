import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { environment } from 'src/environments/environment';

interface Pedido {
  id: string;
  cliente_nome?: string;
  cliente_telefone?: string;
  valor_total: number;
  status: 'pendente' | 'pago' | 'cancelado' | 'entregue';
  forma_pagamento?: string;
  created_at: string;
  itens?: any[];
}

interface Estatisticas {
  total: number;
  pendentes: number;
  pagos: number;
  cancelados: number;
  valorTotal: number;
}

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
    private http: HttpClient,
    private auth: AuthService,
    private toastr: ToastrService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadPedidos();
    this.loadEstatisticas();
  }

  get empresaId(): string {
    return this.auth.getUser?.empresa_id || '';
  }

  loadPedidos() {
    this.loading = true;
    this.http.get<any>(`${environment.apiUrl}/pedidos/${this.empresaId}`).subscribe({
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
    this.http.get<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/lista/estatisticas`).subscribe({
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

  async atualizarStatus(pedido: Pedido, novoStatus: string) {
    const alert = await this.alertController.create({
      header: 'Atualizar Status',
      message: `Mudar status para "${novoStatus}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.http.patch<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/${pedido.id}/status`, { status: novoStatus }).subscribe({
              next: () => {
                this.toastr.success('Status atualizado!');
                this.loadPedidos();
                this.loadEstatisticas();
              },
              error: () => this.toastr.error('Erro ao atualizar')
            });
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarOpcoesStatus(pedido: Pedido) {
    const alert = await this.alertController.create({
      header: 'Alterar Status',
      message: `Pedido: ${pedido.id.substring(0, 8)}...`,
      buttons: [
        { text: 'Pendente', handler: () => this.atualizarStatus(pedido, 'pendente') },
        { text: 'Pago', handler: () => this.atualizarStatus(pedido, 'pago') },
        { text: 'Entregue', handler: () => this.atualizarStatus(pedido, 'entregue') },
        { text: 'Cancelar Pedido', handler: () => this.atualizarStatus(pedido, 'cancelado') },
        { text: 'Fechar', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}