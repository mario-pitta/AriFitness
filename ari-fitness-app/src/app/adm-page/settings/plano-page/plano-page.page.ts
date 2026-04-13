import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { environment } from 'src/environments/environment';

interface Feature {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-plano-page',
  templateUrl: './plano-page.page.html',
  styleUrls: ['./plano-page.page.scss'],
})
export class PlanoPagePage implements OnInit {
  assinatura: any = null;
  loading = true;
  statusColor = 'medium';
  statusLabel = 'Desconhecido';
  usoAlunosPercent = 0;
  usoInstrutoresPercent = 0;
  usoEquipamentosPercent = 0;
  usoCreditosIAPercent = 0;
  planosDisponiveis: any[] = [];
  mostrarPlanos = false;
  planoAtualIndex = 0;

  featuresList: Feature[] = [
    { key: 'limite_alunos', label: 'Alunos', icon: 'people' },
    { key: 'limite_instrutores', label: 'Instrutores', icon: 'fitness' },
    { key: 'limite_equipamentos', label: 'Equipamentos', icon: 'barbell' },
    { key: 'permite_checkin', label: 'Check-in', icon: 'checkmark-circle' },
    { key: 'permite_relatorios', label: 'Export de Relatórios Detalhados', icon: 'stats-chart' },
    { key: 'permite_ficha', label: 'Análise e Criação de Fichas com IA', icon: 'document-text' },
    { key: 'permite_financeiro', label: 'Análise Financeira com IA', icon: 'wallet' },
    { key: 'suporta_whatsapp', label: 'WhatsApp', icon: 'logo-whatsapp' },
    { key: 'suporta_loja', label: 'Loja da Academia', icon: 'cart' },
    { key: 'pagamento_integrado', label: 'Pagamento Integrado', icon: 'card' },
    { key: 'regra_cobranca', label: 'Regra de Cobrança Personalizada', icon: 'settings' },
    { key: 'suporte_prioritario', label: 'Suporte Prioritário', icon: 'headset' },
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadAssinatura();
  }

  async loadAssinatura() {
    this.loading = true;
    this.mostrarPlanos = false;
    const empresaId = this.authService.getUser?.empresa_id;

    // SIMULAÇÃO: criar dados mock para testar visualização
    const mockAssinatura = {
      assinatura: {
        id: 'mock-id',
        status: 'ativa',
        data_inicio: new Date().toISOString(),
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        valor_pago: 197,
        forma_pagamento: 'PIX',
        auto_renovar: false
      },
      plano: {
        id: 'plano-pro',
        nome: 'Professional',
        descricao: 'Plano completo com relatórios',
        preco: 197,
        intervalo_meses: 1,
        limite_alunos: 300,
        limite_instrutores: 10,
        limite_equipamentos: 200,
        permite_checkin: true,
        permite_ficha: true,
        permite_financeiro: true,
        permite_relatorios: true,
        suporta_whatsapp: false,
        suporta_loja: true,
        pagamento_integrado: false,
        regra_cobranca: false,
        suporte_prioritario: false
      },
      empresa: {
        id: empresaId || 'empresa-mock',
        nome: 'Academia Teste'
      },
      alunos_count: 285,
      instrutores_count: 8,
      equipamentos_count: 150,
      creditos_ia_usados: 45,
      creditos_ia_limite: 100
    };

    // Aplicar mock (remover después de testar)
    this.assinatura = mockAssinatura;
    this.updateComputedValues();
    this.loadPlanosMock();
    this.loading = false;

    // Código real (descomentar después de testar)

    if (!empresaId) {
      this.toastr.error('Empresa não encontrada');
      this.loading = false;
      return;
    }

    this.http.get(`${environment.apiUrl}/assinatura/ativa/${empresaId}`).subscribe({
      next: (res: any) => {
        this.assinatura = res?.assinatura;
        if (this.assinatura) {
          this.updateComputedValues();
        } else {
          this.loadPlanosDisponiveis();
        }
        this.loading = false;
      },
      error: () => {
        this.mostrarPlanos = true;
        this.loading = false;
      }
    });

  }

  private loadPlanosDisponiveis() {
    this.http.get(`${environment.apiUrl}/assinatura/planos`).subscribe({
      next: (res: any) => {
        this.planosDisponiveis = res?.data || [];
        console.log('planosDisponiveis = ', this.planosDisponiveis)

        this.mostrarPlanos = true;
        this.planoAtualIndex = 0;
      }
    });
  }

  private loadPlanosMock() {
    this.planosDisponiveis = [
      {
        id: 'plano-starter',
        nome: 'Starter',
        descricao: 'Ideal para pequenas academias',
        preco: 97,
        intervalo_meses: 1,
        limite_alunos: 100,
        limite_instrutores: 3,
        limite_equipamentos: 50,
        limite_creditos_ia: 50,
        permite_checkin: true,
        permite_ficha: true,
        permite_financeiro: false,
        permite_relatorios: false,
        suporta_whatsapp: false,
        suporta_loja: false,
        pagamento_integrado: false,
        regra_cobranca: false,
        suporte_prioritario: false,
        is_destaque: false
      },
      {
        id: 'plano-pro',
        nome: 'Professional',
        descricao: 'Plano completo com análise de IA',
        preco: 197,
        intervalo_meses: 1,
        limite_alunos: 300,
        limite_instrutores: 10,
        limite_equipamentos: 200,
        limite_creditos_ia: 150,
        permite_checkin: true,
        permite_ficha: true,
        permite_financeiro: true,
        permite_relatorios: true,
        suporta_whatsapp: false,
        suporta_loja: true,
        pagamento_integrado: false,
        regra_cobranca: false,
        suporte_prioritario: false,
        is_destaque: true
      },
      {
        id: 'plano-enterprise',
        nome: 'Enterprise',
        descricao: 'Solução completa para grandes academias',
        preco: 497,
        intervalo_meses: 1,
        limite_alunos: 1000,
        limite_instrutores: 50,
        limite_equipamentos: 500,
        limite_creditos_ia: 500,
        permite_checkin: true,
        permite_ficha: true,
        permite_financeiro: true,
        permite_relatorios: true,
        suporta_whatsapp: true,
        suporta_loja: true,
        pagamento_integrado: true,
        regra_cobranca: true,
        suporte_prioritario: true,
        is_destaque: false
      }
    ];
  }

  private updateComputedValues() {
    const status = this.assinatura?.assinatura?.status;
    if (status === 'ativa') {
      this.statusColor = 'success';
      this.statusLabel = 'Ativo';
    } else if (status === 'trial') {
      this.statusColor = 'warning';
      this.statusLabel = 'Período Trial';
    } else if (status === 'vencida') {
      this.statusColor = 'danger';
      this.statusLabel = 'Vencido';
    } else if (status === 'cancelada') {
      this.statusColor = 'medium';
      this.statusLabel = 'Cancelado';
    } else {
      this.statusColor = 'medium';
      this.statusLabel = 'Desconhecido';
    }

    const limiteAlunos = this.assinatura?.plano?.limite_alunos;
    const alunosCount = this.assinatura?.alunos_count;
    if (limiteAlunos && alunosCount !== undefined) {
      this.usoAlunosPercent = Math.round((alunosCount / limiteAlunos) * 100);
    }

    const limiteInstrutores = this.assinatura?.plano?.limite_instrutores;
    const instrutoresCount = this.assinatura?.instrutores_count;
    if (limiteInstrutores && instrutoresCount !== undefined) {
      this.usoInstrutoresPercent = Math.round((instrutoresCount / limiteInstrutores) * 100);
    }

    const limiteEquipamentos = this.assinatura?.plano?.limite_equipamentos;
    const equipamentosCount = this.assinatura?.equipamentos_count;
    if (limiteEquipamentos && equipamentosCount !== undefined) {
      this.usoEquipamentosPercent = Math.round((equipamentosCount / limiteEquipamentos) * 100);
    }

    const limiteCreditosIA = this.assinatura?.creditos_ia_limite;
    const creditosUsados = this.assinatura?.creditos_ia_usados;
    if (limiteCreditosIA && creditosUsados !== undefined) {
      this.usoCreditosIAPercent = Math.round((creditosUsados / limiteCreditosIA) * 100);
    }
  }

  isPlanoMaisCaro(): boolean {
    if (!this.assinatura?.plano?.preco) return false;
    const precoAtual = this.assinatura.plano.preco;
    return precoAtual >= 497;
  }

  toggleMostrarPlanos() {
    if (!this.mostrarPlanos) {
      this.loadPlanosDisponiveis();
    }
    this.mostrarPlanos = !this.mostrarPlanos;
  }

  getMetricClass(percent: number): string {
    if (percent >= 90) return 'metric-critical';
    if (percent >= 70) return 'metric-warning';
    return 'metric-safe';
  }

  goToSlide(index: number) {
    if (this.planoAtualIndex > 0) {
      this.planoAtualIndex--;
    }
  }

  nextSlide() {
    if (this.planoAtualIndex < this.planosDisponiveis.length - 1) {
      this.planoAtualIndex++;
    }
  }

  formatFeatureValue(plano: any, key: string): string {
    const value = plano[key];
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }
    if (typeof value === 'number' || value == null) {
      if (key === 'limite_alunos' || key === 'limite_instrutores' || key === 'limite_equipamentos') {
        return value == null ? 'Ilimitados' : value?.toString();
      }
      return value?.toString();
    }
    return value?.toString() || 'Não';
  }

  isFeatureIncluded(plano: any, key: string): boolean {
    const value = plano[key];
    if (typeof value === 'boolean') {
      return value;
    }
    return value > 0;
  }

  isPlanoAtual(plano: any): boolean {
    return this.assinatura?.plano?.nome === plano.nome;
  }

  isPlanoGratuito(plano: any): boolean {
    return plano.nome === 'Gratuito' || plano.preco === 0;
  }

  async assinarPlano(plano: any) {
    const alert = await this.alertController.create({
      header: 'Assinar Plano',
      message: `Deseja mudar para o plano ${plano.nome} por ${plano.preco === 0 ? 'Grátis' : plano.preco + '/mês'}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            this.assinatura = {
              assinatura: {
                id: 'assinatura-' + Date.now(),
                status: 'ativa',
                data_inicio: new Date().toISOString(),
                data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                valor_pago: plano.preco,
                forma_pagamento: 'PIX',
                auto_renovar: true
              },
              plano: plano,
              empresa: this.assinatura?.empresa || { id: 'empresa-mock', nome: 'Minha Academia' },
              alunos_count: this.assinatura?.alunos_count || 0,
              instrutores_count: this.assinatura?.instrutores_count || 0,
              equipamentos_count: this.assinatura?.equipamentos_count || 0,
              creditos_ia_usados: this.assinatura?.creditos_ia_usados || 0,
              creditos_ia_limite: plano.limite_creditos_ia || 0
            };
            this.updateComputedValues();
            this.mostrarPlanos = false;
            this.toastr.success(`Plano ${plano.nome} ativado com sucesso!`);
          }
        }
      ]
    });
    await alert.present();
  }
}