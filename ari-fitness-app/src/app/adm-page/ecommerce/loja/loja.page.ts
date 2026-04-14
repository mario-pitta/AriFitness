import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutoService } from 'src/core/services/ecommerce/produto.service';
import { PedidoService } from 'src/core/services/ecommerce/pedido.service';

interface DashboardStats {
  totalProdutos: number;
  produtosAtivos: number;
  totalPedidos: number;
  pedidosHoje: number;
  totalVendas: number;
  vendasHoje: number;
}

@Component({
  selector: 'app-loja-page',
  templateUrl: './loja.page.html',
  styleUrls: ['./loja.page.scss']
})
export class LojaPage implements OnInit {
  stats: DashboardStats = {
    totalProdutos: 0,
    produtosAtivos: 0,
    totalPedidos: 0,
    pedidosHoje: 0,
    totalVendas: 0,
    vendasHoje: 0
  };
  loading = true;

  cards = [
    {
      title: 'Meus Produtos',
      subtitle: 'Gerenciar catálogo',
      icon: 'cube-outline',
      color: 'primary',
      route: '/admin/configuracoes/ecommerce/produtos'
    },
    {
      title: 'Meus Pedidos',
      subtitle: 'Ver pedidos',
      icon: 'receipt-outline',
      color: 'secondary',
      route: '/admin/configuracoes/ecommerce/pedidos'
    },
    {
      title: 'Compartilhar Loja',
      subtitle: 'Gerar link',
      icon: 'share-social-outline',
      color: 'tertiary',
      route: '/admin/configuracoes/ecommerce/catalogo'
    }
  ];

  constructor(
    private produtoService: ProdutoService,
    private pedidoService: PedidoService
  ) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.produtoService.getAll().subscribe({
      next: (res) => {
        const produtos = res.data || [];
        this.stats.totalProdutos = produtos.length;
        this.stats.produtosAtivos = produtos.filter((p: any) => p.ativo).length;
      },
      error: () => {}
    });

    this.pedidoService.getAll().subscribe({
      next: (res) => {
        const pedidos = res.data || [];
        this.stats.totalPedidos = pedidos.length;
        
        const hoje = new Date().toDateString();
        this.stats.pedidosHoje = pedidos.filter((p: any) => 
          new Date(p.created_at).toDateString() === hoje
        ).length;
        
        this.stats.totalVendas = pedidos.reduce((sum: number, p: any) => 
          sum + (p.valor_total || 0), 0
        );
        
        this.stats.vendasHoje = pedidos.filter((p: any) => 
          new Date(p.created_at).toDateString() === hoje
        ).reduce((sum: number, p: any) => sum + (p.valor_total || 0), 0);
        
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  navigateTo(route: string) {
    window.location.href = route;
  }
}