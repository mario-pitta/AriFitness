import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { PagetitleService } from 'src/core/services/pagetitle.service';
import { ProdutoService } from 'src/core/services/ecommerce/produto.service';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { EcommerceHeaderComponent } from '../components/ecommerce-header/ecommerce-header';
import { EcommerceFooterComponent } from '../components/ecommerce-footer/ecommerce-footer';
import { ProdutoDetailPageComponent } from '../produto-detail-page/produto-detail-page';
import { CarrinhoModalComponent } from '../carrinho-modal/carrinho-modal';
import { FormsModule } from '@angular/forms';
import { Produto } from 'src/core/models/Produto';
import { Empresa } from 'src/core/models/Empresa';

@Component({
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, EcommerceHeaderComponent, EcommerceFooterComponent],
  selector: 'app-catalog-public-page',
  templateUrl: './catalog-page.html',
  styleUrls: ['./catalog-page.scss']
})
export class CatalogPublicPage implements OnInit {
  empresaId: string | null = null;
  empresa: Empresa = {};
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  categorias: string[] = [];

  busca = '';
  categoriaSelecionada = '';
  ordenacao = 'nome';

  loading = true;
  error = '';
  showHeaderReduced = false;

  get primaryColor(): string {
    return this.empresa?.primary_color_hex || '#4d8dff';
  }

  get carrinhoQuantidade(): number {
    return this.carrinhoService.getQuantity();
  }

  constructor(
    private route: ActivatedRoute,
    private titleService: PagetitleService,
    private produtoService: ProdutoService,
    private carrinhoService: CarrinhoService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.empresaId = this.route.snapshot.paramMap.get('empresaId');
    if (this.empresaId) {
      this.loadData();
    } else {
      this.error = 'Empresa não encontrada';
      this.loading = false;
    }
  }

  loadData() {
    this.produtoService.getAllByEmpresa(this.empresaId!).subscribe({
      next: (res) => {
        this.empresa = res.data;
        this.produtos = (this.empresa?.produtos || []).filter((p: Produto) => p.estoque > 0);
        this.extractCategorias();
        this.produtosFiltrados = [...this.produtos];
        this.titleService.setTitle('Loja');
        this.loading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar catálogo';
        this.loading = false;
      }
    });
  }

  extractCategorias() {
    const cats = new Set(this.produtos.map(p => p.categoria).filter((c): c is string => !!c));
    this.categorias = Array.from(cats);
  }

  filtrarProdutos() {
    let filtrados = [...this.produtos];

    if (this.busca) {
      const buscaLower = this.busca.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nome.toLowerCase().includes(buscaLower) ||
        p.descricao?.toLowerCase().includes(buscaLower)
      );
    }

    if (this.categoriaSelecionada) {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaSelecionada);
    }

    switch (this.ordenacao) {
      case 'nome':
        filtrados.sort((a, b) => a.nome.localeCompare(b.nome));
        break;
      case 'nome-desc':
        filtrados.sort((a, b) => b.nome.localeCompare(a.nome));
        break;
      case 'preco-asc':
        filtrados.sort((a, b) => a.preco - b.preco);
        break;
      case 'preco-desc':
        filtrados.sort((a, b) => b.preco - a.preco);
        break;
    }

    this.produtosFiltrados = filtrados;
  }

  formatPhone(): string {
    if (!this.empresa.telefone) return '';
    return this.empresa.telefone.replace(/\D/g, '');
  }

  openWhatsapp(): void {
    const phone = this.formatPhone();
    if (phone) {
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  }

  async openProdutoDetail(produto: Produto) {
    const modal = await this.modalController.create({
      component: ProdutoDetailPageComponent,
      componentProps: {
        isModal: true,
        produtoInput: produto,
        empresaInput: this.empresa
      },
      cssClass: 'produto-detail-modal'
    });
    await modal.present();
  }

  @HostListener('ionScroll', ['$event'])
  onContentScroll(event: any) {
    const scrollTop = event.detail.scrollTop;
    this.showHeaderReduced = scrollTop > 150;
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
  }
}