import { TransacaoFinanceiraDashService } from 'src/core/services/dashboard/transacao-financeira-dash/transacao-financeira-dash.service';

import { Component, HostListener, OnInit, signal, WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import Constants from 'src/core/Constants';
import { ITeamMember, ITipoUsuario, IUsuario, Usuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { DashboardMembersService } from 'src/core/services/dashboard/members/members.service';

import { forkJoin, map, Observable } from 'rxjs';
import { IEmpresa } from 'src/core/models/Empresa';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import * as shape from 'd3-shape';
import { TeamMemberService } from 'src/core/services/instructor/team-member.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {
  view: [number, number] = [520, 230];
  chartSizes: number[] = [];
  searchControl: FormControl = new FormControl();
  members$: Observable<IUsuario[] | any[]> | undefined;
  getGreeting: WritableSignal<string> = this._getGreeting();


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
  planosVencidos: { total: number; vencidos: any[] } = { total: 0, vencidos: [] };
  alunosChurn: { total: number; alunos: any[] } = { total: 0, alunos: [] };
  receitasPendentes: { total: number; totalValor: number; transacoes: any[] } = { total: 0, totalValor: 0, transacoes: [] };
  despesasPendentes: { total: number; totalValor: number; transacoes: any[] } = { total: 0, totalValor: 0, transacoes: [] };

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
    private teamMemberService: TeamMemberService,

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
    this.loadAllDashboardData();
  }

  loadAllDashboardData() {
    this.loading = true;
    const empresaId = this.usuario.empresa_id as string;

    forkJoin({
      totals: this.transFinServ.getTotalsByEmpresaId(empresaId),
      checkins: this.transFinServ.getCheckinsHoje(empresaId),
      alertas: this.transFinServ.getAlertasVencimento(empresaId),
      churn: this.transFinServ.getAlunosSemCheckin(empresaId, 7),
      pendentes: this.transFinServ.getReceitasPendentes(empresaId),
      despesasP: this.transFinServ.getDespesasPendentes(empresaId),
      picos: this.transFinServ.getPicoCheckins(empresaId),
      instrutores: this.teamMemberService.findAll(empresaId)
    }).subscribe({
      next: (res: any) => {
        // Process Totals
        this.totals = res.totals;
        this.processTotalsChart(res.totals);

        // Process Operational
        this.checkinsHoje = res.checkins;
        this.alertasVencimento = {
          total: res.alertas.total,
          alertas: res.alertas.alertas.map((a: any) => ({
            ...a,
            whatsapp: a.whatsapp?.replace(/[^0-9]/g, '')
          }))
        };
        this.planosVencidos = {
          total: res.alertas.totalVencidos || 0,
          vencidos: (res.alertas.vencidos || []).map((a: any) => ({
            ...a,
            whatsapp: a.whatsapp?.replace(/[^0-9]/g, '')
          }))
        };
        this.alunosChurn = res.churn;
        this.receitasPendentes = res.pendentes;
        this.despesasPendentes = res.despesasP;
        this.picoCheckinsData = res.picos.picos.map((p: any) => ({ name: p.hora, value: p.total }));

        // Process Instrutores
        this.members$ = new Observable(subscriber => {
          subscriber.next(res.instrutores.slice(0, 4).map((i: any) => {
            return {
              ...i,
              tipo_usuario: i.tipo_usuario as ITipoUsuario
            }
          }));
          subscriber.complete();
        });

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dashboard:', err);
        this.loading = false;
      }
    });

    // Sidebar Alunos still loads independently on search, but initial load can be empty or separate
    // For now, only the search triggers getMembers which has its own loading
  }

  processTotalsChart(totals: any) {
    // Receitas vs Despesas (Gráfico de Barras Agrupado por Mês)
    const groupedData = new Map<string, any>();

    // Obter os últimos 12 meses em ordem
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mes = d.getMonth();
      const ano = d.getFullYear();
      const mesNome = this.meses.find(m => m.value === (mes + 1))?.label || '';
      const key = `${mesNome}/${ano}`;
      groupedData.set(`${mes}-${ano}`, {
        name: key,
        series: [
          { name: 'Receitas', value: 0 },
          { name: 'Despesas', value: 0 }
        ],
        mes, // para fins de ordenação extra, se necessário
        ano
      });
    }

    totals.receita_por_mes.forEach((r: any) => {
      const key = `${r.mes}-${r.ano}`;
      if (groupedData.has(key)) {
        groupedData.get(key).series[0].value = r.valor;
      }
    });

    (totals.despesa_por_mes || []).forEach((d: any) => {
      const key = `${d.mes}-${d.ano}`;
      if (groupedData.has(key)) {
        groupedData.get(key).series[1].value = d.valor;
      }
    });

    this.revenueVsExpenseData = Array.from(groupedData.values()).map(item => ({
      name: item.name,
      series: item.series
    }));

    // Alunos Status (Pizza)
    this.membrosStatusData = [
      { name: 'Ativos', value: totals.totalMembros },
      { name: 'Inativos', value: Math.floor(totals.totalMembros * 0.15) }
    ];
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

  sendWhatsAppMessage(alerta: any) {
    console.log('alerta = ', alerta)
  }


  _getGreeting() {
    let greeting = '';
    const greetingSingnal = signal<string>('');
    const hour = new Date().getHours();
    console.log('hour = ', hour)

    switch (true) {
      case hour >= 5 && hour < 12:
        greeting = 'Bom dia';
        break;
      case hour >= 12 && hour < 18:
        greeting = 'Boa tarde';
        break;
      default:
        greeting = 'Boa noite';
        break;
    }

    greetingSingnal.set(greeting);
    return greetingSingnal;
  }
}

