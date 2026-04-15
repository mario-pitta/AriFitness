import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import { MaskitoDirective } from '@maskito/angular';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { PedidoService } from 'src/core/services/ecommerce/pedido.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { Produto } from 'src/core/models/Produto';
import { Empresa } from 'src/core/models/Empresa';
import { ItemCarrinho, DadosCliente } from 'src/core/models/Carrinho';
import Constants from 'src/core/Constants';

@Component({
  selector: 'app-carrinho-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, MaskitoDirective],
  templateUrl: './carrinho-modal.html',
  styleUrls: ['./carrinho-modal.scss']
})
export class CarrinhoModalComponent {
  @Input() empresaId: string | null = null;
  @Input() empresa: Empresa | null = null;

  itens: ItemCarrinho[] = [];
  cliente: DadosCliente = { cpf: '', nome: '', telefone: '', email: '' };

  cpfMask: MaskitoOptions = Constants.cpfMask;
  telefoneMask: MaskitoOptions = Constants.phoneMask;
  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as unknown as HTMLIonInputElement).getInputElement();

  get total(): number {
    return this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  }

  get podeFinalizar(): boolean {
    if (!this.cliente.nome?.trim()) return false;
    if (!this.isValidTelefone(this.cliente.telefone)) return false;
    if (this.cliente.cpf && !this.isValidCPF(this.cliente.cpf)) return false;
    if (this.cliente.email && !this.isValidEmail(this.cliente.email)) return false;
    if (this.itens.length === 0) return false;
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidCPF(cpf: string): boolean {
    const cpfDigits = cpf.replace(/\D/g, '');
    if (cpfDigits.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpfDigits)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpfDigits[i]) * (10 - i);
    }
    let digit1 = sum % 11;
    digit1 = digit1 < 2 ? 0 : 11 - digit1;
    if (parseInt(cpfDigits[9]) !== digit1) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpfDigits[i]) * (11 - i);
    }
    let digit2 = sum % 11;
    digit2 = digit2 < 2 ? 0 : 11 - digit2;
    return parseInt(cpfDigits[10]) === digit2;
  }

  isValidTelefone(telefone: string): boolean {
    const digits = telefone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 11;
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

    console.log(this.cliente);
    console.log(this.itens);
    console.log(this.empresaId);
    console.log(this.empresa);
    console.log(this.podeFinalizar);


    if (!this.empresa?.id || !this.podeFinalizar) return;

    this.carrinhoService.setDadosCliente(this.cliente);

    const valorTotal = this.itens.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);

    const pedido = {
      cliente_nome: this.cliente.nome,
      cliente_telefone: this.cliente.telefone,
      cliente_email: this.cliente.email,
      cliente_obs: this.cliente.observacoes,
      valor_total: valorTotal,
      status: 'pendente',
      itens: this.itens.map(item => ({
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco
      })),
      empresa_id: this.empresa.id,
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

