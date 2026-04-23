import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ProdutoService, Produto } from 'src/core/services/ecommerce/produto.service';
import { PedidoService, PedidoItem } from 'src/core/services/ecommerce/pedido.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { AuthService } from 'src/core/services/auth/auth.service';

interface CarrinhoItem {
  produto: Produto;
  quantidade: number;
}

@Component({
  selector: 'app-pdv-page',
  templateUrl: './pdv-page.page.html',
  styleUrls: ['./pdv-page.page.scss'],
})
export class PdvPagePage implements OnInit {
  produtos: Produto[] = [];
  produtosFiltrados: Produto[] = [];
  loading = true;

  carrinho: CarrinhoItem[] = [];
  busca = '';
  categoriaSelecionada = '';
  categorias: string[] = [];

  // Desconto
  descontoTipo: 'percent' | 'valor' = 'percent';
  descontoValor = 0;

  // Pagamento
  formaPagamento = 'pix';
  nomeCliente = '';
  telefoneCliente = '';
  cpfCliente = '';
  carrinhoExpandido = false;

  toggleCarrinho() {
    this.carrinhoExpandido = !this.carrinhoExpandido;
  }

  get subtotal(): number {
    return this.carrinho.reduce((sum, item) => sum + (item.produto.preco * item.quantidade), 0);
  }

  get valorDesconto(): number {
    if (this.descontoTipo === 'percent') {
      return this.subtotal * (this.descontoValor / 100);
    }
    return this.descontoValor;
  }

  get total(): number {
    return this.subtotal - this.valorDesconto;
  }

  get carrinhoVazio(): boolean {
    return this.carrinho.length === 0;
  }

  constructor(
    private produtoService: ProdutoService,
    private pedidoService: PedidoService,
    private toastr: ToastrService,
    private alertController: AlertController,
    private navController: NavController,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.loadProdutos();
  }

  loadProdutos() {
    this.loading = true;
    this.produtoService.getAll().subscribe({
      next: (res) => {
        this.produtos = (res.data || []).filter((p: Produto) => p.ativo);
        this.produtosFiltrados = this.produtos;
        this.extractCategorias();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Erro ao carregar produtos');
      }
    });
  }

  extractCategorias() {
    const cats = new Set(this.produtos.map(p => p.categoria).filter(Boolean));
    this.categorias = Array.from(cats) as string[];
  }

  filtrarProdutos() {
    let filtrados = this.produtos;

    if (this.categoriaSelecionada) {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaSelecionada);
    }

    if (this.busca) {
      const busca = this.busca.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nome.toLowerCase().includes(busca) ||
        p.descricao?.toLowerCase().includes(busca)
      );
    }

    this.produtosFiltrados = filtrados;
  }

  adicionarAoCarrinho(produto: Produto) {
    const existente = this.carrinho.find(item => item.produto.id === produto.id);

    if (existente) {
      if (existente.quantidade < produto.estoque) {
        existente.quantidade++;
      } else {
        this.toastr.warning('Estoque máximo atingido!');
      }
    } else {
      this.carrinho.push({ produto, quantidade: 1 });
    }
  }

  removerDoCarrinho(index: number) {
    this.carrinho.splice(index, 1);
  }

  atualizarQuantidade(item: CarrinhoItem, delta: number) {
    const novaQtd = item.quantidade + delta;
    if (novaQtd > 0 && novaQtd <= item.produto.estoque) {
      item.quantidade = novaQtd;
    }
  }

  getEstoqueClass(estoque: number): string {
    if (estoque === 0) return 'estoque-zero';
    if (estoque <= 5) return 'estoque-baixo';
    return 'estoque-ok';
  }

  async finalizarVenda() {
    if (this.carrinhoVazio) {
      this.toastr.error('Carrinho vazio!');
      return;
    }

    if (!this.formaPagamento) {
      this.toastr.error('Selecione a forma de pagamento');
      return;
    }

    const itens: PedidoItem[] = this.carrinho.map(item => ({
      produto_id: item.produto.id!,
      quantidade: item.quantidade
    }));

    const pedido = {
      cliente_nome: this.nomeCliente || 'Cliente Balcão',
      cliente_telefone: this.telefoneCliente,
      cliente_cpf: this.cpfCliente,
      itens,
      forma_pagamento: this.formaPagamento,
      valor_desconto: this.valorDesconto
    };

    this.pedidoService.create(pedido).subscribe({
      next: () => {
        this.toastr.success('Venda finalizada com sucesso!');
        this.limparCarrinho();
      },
      error: (err) => {
        this.toastr.error(err?.error?.message || 'Erro ao finalizar venda');
      }
    });
  }

  limparCarrinho() {
    this.carrinho = [];
    this.descontoValor = 0;
    this.nomeCliente = '';
    this.telefoneCliente = '';
    this.cpfCliente = '';
    this.formaPagamento = 'pix';
  }

  async showResumoVenda() {
    const itensResumo = this.carrinho.map(item =>
      `${item.quantidade}x ${item.produto.nome}`
    ).join('\n');

    const alert = await this.alertController.create({
      header: 'Resumo da Venda',
      message: `
${itensResumo}

Subtotal: R$ ${this.subtotal.toFixed(2)}
Desconto: -R$ ${this.valorDesconto.toFixed(2)}
TOTAL: R$ ${this.total.toFixed(2)}

Pagamento: ${this.formaPagamento.toUpperCase()}
${this.nomeCliente ? `Cliente: ${this.nomeCliente}` : ''}
${this.cpfCliente ? `CPF: ${this.cpfCliente}` : ''}
      `,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Confirmar Venda', handler: () => this.finalizarVenda() }
      ]
    });
    await alert.present();
  }

  abrirCatalogo() {
    const empresaId = this.auth.getUser?.empresa_id;
    if (empresaId) {
      this.navController.navigateForward(`/catalogo/${empresaId}`);
    }
  }
}