import { Component, OnInit, OnDestroy, Input, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject, takeUntil } from 'rxjs';

import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { ProdutoService } from 'src/core/services/ecommerce/produto.service';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { Produto } from 'src/core/models/Produto';
import { Empresa } from 'src/core/models/Empresa';
import { ItemCarrinho } from 'src/core/models/Carrinho';
import { ModalController } from '@ionic/angular';
import { CarrinhoModalComponent } from '../carrinho-modal/carrinho-modal';
import { EcommerceHeaderComponent } from '../components/ecommerce-header/ecommerce-header';
import { EcommerceFooterComponent } from '../components/ecommerce-footer/ecommerce-footer';

@Component({
  selector: 'app-produto-detail-page',
  standalone: true,
  imports: [CommonModule, IonicModule, EcommerceHeaderComponent, EcommerceFooterComponent],
  templateUrl: './produto-detail-page.html',
  styleUrls: ['./produto-detail-page.scss']
})
export class ProdutoDetailPageComponent implements OnInit, OnDestroy {
  @Input() isModal = false;
  @Input() produtoInput: Produto | null = null;
  @Input() empresaInput: Empresa | null = null;

  produto: Produto | null = null;
  empresa: Empresa | null = null;
  loading = true;
  error: string | null = null;
  quantidade = 1;
  showHeaderReduced = false;

  private destroy$ = new Subject<void>();
  empresaId: string | null = null;
  produtoId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private toastr: ToastrService,
    private modalController: ModalController
  ) { }

  get carrinhoQuantidade(): number {
    return this.carrinhoService.getQuantity();
  }

  ngOnInit() {
    if (this.isModal && this.produtoInput && this.empresaInput) {
      this.produto = this.produtoInput;
      this.empresa = this.empresaInput;
      this.empresaId = this.empresa.id?.toString() || null;
      this.produtoId = this.produto.id?.toString() || null;
      this.loading = false;
    } else {
      this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
        this.empresaId = params['empresaId'];
        this.produtoId = params['produtoId'];
        if (this.empresaId && this.produtoId) {
          this.loadProduto();
        }
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadProduto() {
    try {
      this.loading = true;
      this.error = null;

      if (!this.empresaId || !this.produtoId) {
        throw new Error('IDs inválidos');
      }

      this.produtoService.getByIdPublic(this.empresaId, this.produtoId).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.produto = res.data.produto;
            this.empresa = res.data.empresa;
          } else {
            this.error = res.message || 'Produto não encontrado';
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erro ao carregar produto';
          console.error('Erro ao carregar produto:', err);
          this.loading = false;
        }
      });

    } catch (err: any) {
      this.error = 'Produto não encontrado';
      console.error('Erro ao carregar produto:', err);
      this.loading = false;
    }
  }

  incrementQuantity() {
    if (this.produto && this.quantidade < this.produto.estoque) {
      this.quantidade++;
    }
  }

  decrementQuantity() {
    if (this.quantidade > 1) {
      this.quantidade--;
    }
  }

  adicionarAoCarrinho() {
    if (!this.produto) return;

    const item: ItemCarrinho = {
      produto_id: this.produto.id,
      nome: this.produto.nome,
      preco: this.produto.preco,
      quantidade: this.quantidade,
      imagem_url: this.produto.imagem_url
    };

    this.carrinhoService.addItem(item);
    this.toastr.success(`${this.produto.nome} adicionado ao carrinho!`);
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
  }

  goToCatalog() {
    if (this.empresaId) {
      window.location.href = `/catalogo/${this.empresaId}`;
    }
  }

  shareProduct() {
    if (this.empresaId && this.produto) {
      const url = `${window.location.origin}/catalogo/${this.empresaId}/produto/${this.produto.id}`;
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

  async openCarrinho() {
    const modal = await this.modalController.create({
      component: CarrinhoModalComponent,
      componentProps: {
        empresaId: this.empresaId,
        empresa: this.empresa
      },
      cssClass: 'carrinho-modal'
    });
    await modal.present();
    if (this.isModal) {
      this.close();
    }
  }

  close() {
    if (this.isModal) {
      this.modalController.dismiss();
    }
  }

  @HostListener('ionScroll', ['$event'])
  onContentScroll(event: any) {
    if (this.isModal) return;
    const scrollTop = event.detail.scrollTop;
    this.showHeaderReduced = scrollTop > 150;
  }
}

