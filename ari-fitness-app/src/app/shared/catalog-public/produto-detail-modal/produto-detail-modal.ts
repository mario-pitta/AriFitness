import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { Produto } from 'src/core/models/Produto';
import { Empresa } from 'src/core/models/Empresa';
import { ItemCarrinho } from 'src/core/models/Carrinho';

@Component({
  selector: 'app-produto-detail-modal',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './produto-detail-modal.html',
  styleUrls: ['./produto-detail-modal.scss']
})
export class ProdutoDetailModalComponent {
  @Input() produto: Produto | null = null;
  @Input() empresa: Empresa | null = null;

  constructor(
    private modalController: ModalController,
    private carrinhoService: CarrinhoService,
    private toastr: ToastrService
  ) {}

  close() {
    this.modalController.dismiss();
  }

  comprar() {
    if (!this.produto) return;

    const item: ItemCarrinho = {
      produto_id: this.produto.id,
      nome: this.produto.nome,
      preco: this.produto.preco,
      quantidade: 1,
      imagem_url: this.produto.imagem_url
    };

    this.carrinhoService.addItem(item);
    this.toastr.success(`${this.produto.nome} adicionado ao carrinho!`);
    this.modalController.dismiss();
  }

  formatPhone(): string {
    if (!this.empresa?.telefone) return '';
    return this.empresa.telefone.replace(/\D/g, '');
  }

  falarWhatsapp() {
    const phone = this.formatPhone();
    if (phone) {
      const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto: ${this.produto?.nome}`);
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    }
    this.modalController.dismiss();
  }

  shareProduct() {
    if (this.produto) {
      const url = `${window.location.origin}/catalogo/${this.produto.empresa_id}/produto/${this.produto.id}`;
      if (navigator.share) {
        navigator.share({
          title: this.produto.nome,
          text: `Veja este produto: ${this.produto.nome}`,
          url: url
        }).catch(() => this.copyToClipboard(url));
      } else {
        this.copyToClipboard(url);
      }
    }
  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      this.toastr.success('Link copiado!');
    }).catch(() => {
      this.toastr.error('Erro ao copiar link');
    });
  }
}

