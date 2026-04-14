import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { PagetitleService } from 'src/core/services/pagetitle.service';
import { ProdutoService } from 'src/core/services/ecommerce/produto.service';
import { ProdutoDetailModalComponent } from './produto-detail-modal.component';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  imagem_url?: string;
  categoria?: string;
}

interface Empresa {
  nome_fantasia?: string;
  nome?: string;
  logo_url?: string;
  banner_url?: string;
  telefone?: string;
  primary_color_hex?: string;
  produtos?: Produto[];
}

@Component({
  selector: 'app-catalog-public-page',
  templateUrl: './catalog-public.page.html',
  styleUrls: ['./catalog-public.page.scss']
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

  get primaryColor(): string {
    return this.empresa?.primary_color_hex || '#4d8dff';
  }

  constructor(
    private route: ActivatedRoute,
    private titleService: PagetitleService,
    private produtoService: ProdutoService,
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
    if (!this.empresaId) return;

    this.produtoService.getAllByEmpresa(this.empresaId).subscribe({
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
      component: ProdutoDetailModalComponent,
      componentProps: {
        produto: produto,
        empresa: this.empresa
      },
      cssClass: 'produto-detail-modal'
    });
    await modal.present();
  }
}