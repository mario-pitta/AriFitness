import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EmpresaStateService } from './empresa/state/empresa-state.service';

@Injectable({
  providedIn: 'root',
})
export class PagetitleService {
  title: BehaviorSubject<string> = new BehaviorSubject('MvK Gym Manager');
  currentPage: string = 'Home';

  private pageTitles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'membros': 'Alunos',
    'equipe': 'Equipe',
    'financas': 'Finanças',
    'pdv': 'Ponto de Venda',
    'treinos': 'Fichas / Treinos',
    'qrcode': 'Check-in',
    'tarefas': 'Tarefas',
    'calendario': 'Calendário',
    'contatos': 'Contatos',
    'equipamentos': 'Equipamentos',
    'produtos': 'Produtos',
    'catalogo': 'Catálogo Público',
    'pedidos': 'Pedidos',
    'ecommerce': 'E-commerce',
    'configuracoes': 'Configurações',
    'empresa': 'Empresa',
    'exercicios': 'Exercícios',
    'home': 'Home',
    'treinar': 'Treinar',
    'stats': 'Estatísticas',
    'cadastro-usuario': 'Perfil',
  };

  constructor(
    private router: Router,
    private empresaState: EmpresaStateService
  ) {
    this.initTitleSubscription();
  }

  private initTitleSubscription() {
    this.router.events.pipe(
      filter((ev): ev is NavigationEnd => ev instanceof NavigationEnd)
    ).subscribe({
      next: (ev) => {
        this.updateTitleFromUrl(ev.url);
      }
    });

    this.empresaState.empresa$.subscribe({
      next: (empresa) => {
        this.updateFullTitle(empresa?.nome_fantasia || empresa?.nome || '');
      }
    });
  }

  private updateTitleFromUrl(url: string) {
    const path = url.split('/').filter(Boolean);

    // Verificar se é catálogo público
    if (url.includes('/catalogo/')) {
      this.currentPage = 'Loja';
      this.updateDocumentTitle();
      return;
    }

    const lastPath = path[path.length - 1]?.split('?')[0] || '';
    const routeName = path.find(p => this.pageTitles[p]) || lastPath;
    this.currentPage = this.pageTitles[routeName] || this.formatRouteName(lastPath);
    this.updateDocumentTitle();
  }

  private formatRouteName(name: string): string {
    if (!name) return '';
    return name
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  private updateFullTitle(empresaNome: string) {
    this.updateDocumentTitle();
  }

  private updateDocumentTitle() {
    this.title.next(`MvK Gym Manager`);
    document.title = `${this.currentPage} | MvK Gym Manager`;

  }

  getTitle(): string {
    return this.title.value;
  }

  setTitle(title: string) {
    this.currentPage = title;
    this.updateDocumentTitle();
  }
}