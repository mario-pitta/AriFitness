import { TransacaoFinanceiraDashService } from 'src/core/services/dashboard/transacao-financeira-dash/transacao-financeira-dash.service';

import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import Constants from 'src/core/Constants';
import { IUsuario, Usuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { DashboardMembersService } from 'src/core/services/dashboard/members/members.service';

import { map, Observable } from 'rxjs';
import { IEmpresa } from 'src/core/models/Empresa';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  view: [number, number] = [520, 230];
  chartSizes: number[] = [];
  searchControl: FormControl = new FormControl();

  totals = {
    totalMembros: 0,
    totalInstrutores: 0,
    totalReceitas: 0,
    totalDespesas: 0,
    totalAulas: 0,
    totalFichas: 0,
    receita_por_mes: [] as any[],
    despesa_por_mes: [] as any[],
  };

  members: IUsuario[] = [];
  usuario: IUsuario = this.auth.getUser;
  empresa: IEmpresa | null = null;
  loading: boolean = true;
  today = new Date();

  // ── Novos Dados ───────────────────────────────────────────────────────────
  checkinsHoje: { total: number; checkins: any[] } = { total: 0, checkins: [] };
  alertasVencimento: { total: number; alertas: any[] } = { total: 0, alertas: [] };
  alunosChurn: { total: number; alunos: any[] } = { total: 0, alunos: [] };
  receitasPendentes: { total: number; totalValor: number; transacoes: any[] } = { total: 0, totalValor: 0, transacoes: [] };

  // ── Gráficos ────────────────────────────────────────────────────────────────
  revenueVsExpenseData: any[] = [];
  membrosStatusData: any[] = [];
  picoCheckinsData: any[] = [];

  // ── Tipagem para ngx-charts ────────────────────────────────────────────────
  curveBasis = shape.curveBasis;

  colorSchemeArea: Color = {
    name: 'financeiro',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#00b894', '#e74c3c']
  };

  colorSchemeStatus: Color = {
    name: 'status',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#2471a3', '#8391a1']
  };

  colorSchemePico: Color = {
    name: 'pico',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#117a65']
  };

  constructor(
    private usuarioService: UsuarioService,
    private dashboardService: DashboardMembersService,
    private auth: AuthService,
    private transFinServ: TransacaoFinanceiraDashService,

  ) {
    this.searchControl.valueChanges.subscribe((value) => {
      this.getMembers(value);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile();
  }

  isMobile() {
    const innerWidth = window.innerWidth;
    if (innerWidth < 500) {
      this.view = [innerWidth - 40, 200];
    } else if (innerWidth < 800) {
      this.view = [430, 230];
    } else if (innerWidth < 900) {
      this.view = [470, 230];
    } else if (innerWidth < 1000) {
      this.view = [650, 230];
    } else {
      this.view = [innerWidth > 1400 ? 550 : 450, 230];
    }
  }

  meses = Constants.meses;

  ngOnInit() {
    this.isMobile();
    this.empresa = this.usuario.empresa as IEmpresa;
    this.getTotals();
    this.getBestInstrutoresData();
    this.loadOperationalData();
  }



  loadOperationalData() {
    const empresaId = this.usuario.empresa_id as string;

    this.transFinServ.getCheckinsHoje(empresaId).subscribe(res => this.checkinsHoje = res);
    this.transFinServ.getAlertasVencimento(empresaId).subscribe(res => {
      this.alertasVencimento = {
        total: res.total,
        alertas: res.alertas.map((a: any) => (
          {
            ...a,
            //remove os caracteres especiais do telefone e adciona o texto de que o plano está vencendo
            whatsapp: a.whatsapp?.replace(/[^0-9]/g, '')
          }
        ))
      }


    });
    this.transFinServ.getAlunosSemCheckin(empresaId).subscribe(res => this.alunosChurn = res);
    this.transFinServ.getReceitasPendentes(empresaId).subscribe(res => this.receitasPendentes = res);
    this.transFinServ.getPicoCheckins(empresaId).subscribe(res => {
      this.picoCheckinsData = res.picos.map((p: any) => ({ name: p.hora, value: p.total }));
    });
  }

  getGreeting(): string {
    const hr = new Date().getHours();
    if (hr < 12) return 'Bom dia';
    if (hr < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  getUserInitials(): string {
    if (!this.usuario?.nome) return '?';
    const names = this.usuario.nome.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  }

  getTotals() {
    const empresaId = this.usuario.empresa_id as string;
    this.transFinServ.getTotalsByEmpresaId(empresaId).subscribe((totals: any) => {
      this.totals = totals;

      // Receitas vs Despesas (Gráfico de Área)
      this.revenueVsExpenseData = [
        {
          name: 'Receitas',
          series: totals.receita_por_mes.map((r: any) => ({
            name: (this.meses.find(m => m.value === (r.mes + 1))?.label || '') + '/' + r.ano,
            value: r.valor
          }))
        },
        {
          name: 'Despesas',
          series: (totals.despesa_por_mes || []).map((d: any) => ({
            name: (this.meses.find(m => m.value === (d.mes + 1))?.label || '') + '/' + d.ano,
            value: d.valor
          }))
        }
      ];

      // Alunos Status (Pizza)
      this.membrosStatusData = [
        { name: 'Ativos', value: totals.totalMembros },
        { name: 'Inativos', value: Math.floor(totals.totalMembros * 0.15) } // Mock provisório até ter endpoint de inativos
      ];
    });
  }

  getMembers(text?: string, flag_active: boolean = true) {
    this.loading = true;
    const filters: Partial<IUsuario> = {
      tipo_usuario: Constants.ALUNO_ID,
      fl_ativo: flag_active,
      empresa_id: this.usuario.empresa_id,
    };
    if (text) filters['nome'] = text;

    this.usuarioService.findByFilters(filters).subscribe({
      next: (res) => this.members = res,
      error: () => this.loading = false,
      complete: () => (this.loading = false),
    });
  }

  teachers$: Observable<IUsuario[]> | undefined;
  getBestInstrutoresData() {
    this.teachers$ = this.usuarioService.findByFilters({
      tipo_usuario: Constants.INSTRUTOR_ID,
      empresa_id: this.usuario.empresa_id,
    }).pipe(
      map(users => users.slice(0, 4))
    );
  }
}

