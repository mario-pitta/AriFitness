import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { PedidoService } from 'src/core/services/ecommerce/pedido.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { Produto } from 'src/core/models/Produto';
import { Empresa } from 'src/core/models/Empresa';
import { ItemCarrinho, DadosCliente } from 'src/core/models/Carrinho';

@Component({
  selector: 'app-carrinho-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './carrinho-modal.html',
  styleUrls: ['./carrinho-modal.scss']
})
export class CarrinhoModalComponent {
  @Input() empresaId: string | null = null;
  @Input() empresa: Empresa | null = null;

  itens: ItemCarrinho[] = [];
  cliente: DadosCliente = { cpf: '', nome: '', telefone: '', email: '' };

  get total(): number {
    return this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  }

  get podeFinalizar(): boolean {
    return !!(this.cliente.nome && this.cliente.telefone && this.itens.length > 0);
  }

  constructor(
    private modalController: ModalController,
    private carrinhoService: CarrinhoService,
    private pedidoService: PedidoService,
    private toastr: ToastrService
  ) {
    this.itens = this.carrinhoService.getAll();
    const dadosSalvos = this.carrinhoService.getDadosCliente();
    if (dadosSalvos) {
      this.cliente = dadosSalvos;
    }
  }

  incrementar(item: ItemCarrinho) {
    this.carrinhoService.updateQuantity(item.produto_id, item.quantidade + 1);
    this.itens = this.carrinhoService.getAll();
  }

  decrementar(item: ItemCarrinho) {
    if (item.quantidade > 1) {
      this.carrinhoService.updateQuantity(item.produto_id, item.quantidade - 1);
      this.itens = this.carrinhoService.getAll();
    }
  }

  remover(produtoId: string) {
    this.carrinhoService.removeItem(produtoId);
    this.itens = this.carrinhoService.getAll();
  }

  limparCarrinho() {
    this.carrinhoService.clear();
    this.itens = [];
  }

  finalizarPedido() {
    if (!this.empresaId || !this.podeFinalizar) return;

    this.carrinhoService.setDadosCliente(this.cliente);

    const valorTotal = this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    const pedido = {
      cliente_nome: this.cliente.nome,
      cliente_telefone: this.cliente.telefone,
      cliente_email: this.cliente.email,
      valor_total: valorTotal,
      status: 'pendente',
      itens: this.itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      }))
    };

    this.pedidoService.create(pedido).subscribe({
      next: () => {
        this.toastr.success('Pedido realizado com sucesso!');
        this.carrinhoService.clear();
        this.close();
      },
      error: (err) => {
        this.toastr.error('Erro ao criar pedido: ' + (err.message || 'Tente novamente'));
      }
    });
  }

  close() {
    this.modalController.dismiss();
  }
}

