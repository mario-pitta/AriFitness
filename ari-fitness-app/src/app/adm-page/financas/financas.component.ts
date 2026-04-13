import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
import { combineLatest, debounceTime, distinctUntilChanged, forkJoin, Subject, switchMap, takeUntil } from 'rxjs';
import { TransacaoFinanceira } from 'src/core/models/TransacaoFInanceira';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ConfettiService } from 'src/core/services/confetti/confetti.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { ReciboService } from 'src/core/services/recibo/recibo.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { TransacaoFinanceiraService } from 'src/core/services/transacao-financeira/transacao-financeira.service';
import { AnaliseIaModalComponent } from './analise-ia-modal/analise-ia-modal/analise-ia-modal.component';
import { FormTransacaoFinaceiraComponent } from 'src/app/shared/form-transacao-finaceira/form-transacao-finaceira.component';
import { ExportFinanceiroService } from 'src/core/services/export-financeiro/export-financeiro.service';
import { TransacaoFinanceiraDashService } from 'src/core/services/dashboard/transacao-financeira-dash/transacao-financeira-dash.service';
import { WhatsAppModalService } from 'src/core/services/whatsapp/whatsapp-modal.service';

declare interface CategoryChart {
  tr_categoria_id: number;
  valor_final: number;
  descricao: string;
}
@Component({
  selector: 'app-financas',
  templateUrl: './financas.component.html',
  styleUrls: ['./financas.component.scss'],
})
export class FinancasComponent implements OnInit {
  receitas: TransacaoFinanceira[] = [];
  despesas: TransacaoFinanceira[] = [];

  openModalTransacao: boolean = false;
  action!: string;
  tipo!: string;
  user!: IUsuario;
  selectedItem: TransacaoFinanceira | undefined;
  chartViewSize: [number, number] = [500, 500];

  today = new Date();
  data_inicio: string = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    -1
  )
    .toISOString()
    .split('T')[0];
  data_fim: string = new Date(
    this.today.getFullYear(),
    this.today.getMonth() + 1,
    0
  )
    .toISOString()
    .split('T')[0];

  totalReceitas: number | string = 0;
  totalDespesas: number | string = 0;
  saldo: number | string = 0;
  ticketMedio: number | string = 0;
  totalProjetado: number | string = 0;
  isSaldoPositivo: boolean = true;
  totalReceitasPorCategoria: any[] = [];
  totalDespesasPorCategoria: any[] = [];
  periodo = new FormControl(0, [Validators.required]);
  loading: boolean = true;
  isMobile = false;
  transacoes: TransacaoFinanceira[] = [];
  openOptions: boolean = false;
  confetti = inject(ConfettiService);

  categoriasControl = new FormControl<number[]>([]);
  statusExportControl = new FormControl<'pago' | 'pendente' | 'cancelado' | 'todos'>('pago');
  listaCategorias: any[] = [];
  isExportingPDF: boolean = false;
  isExportingExcel: boolean = false;

  pendenciasAReceber: number = 0;
  pendenciasAPagar: number = 0;

  constructor(
    private alertController: AlertController,
    private transFinService: TransacaoFinanceiraService,
    private auth: AuthService,
    private toastr: ToastrService,
    private pageSize: PageSizeService,
    private modalController: ModalController,
    private exportService: ExportFinanceiroService,
    private dashService: TransacaoFinanceiraDashService,
    private whatsappModalService: WhatsAppModalService
  ) {
    this.pageSize.screenSizeChange$.asObservable().subscribe({
      next: (e) => {
        console.log('e: ', e);
        this.buildChartViewSize(e);
        this.isMobile = e.isMobile;
      },
    });
  }

  private destroy$ = new Subject<void>();
  private refreshTransactions$ = new Subject<void>();

  ngOnInit() {
    this.user = this.auth.getUser;
    this.setupFiltersPipeline();
    // this.getReceitas();
    // this.getDespesas();
    this.refreshTransactions$.next();
    this.buildDashboard();
    this.listenPeriodoControlChanges();
    this.listenCategoriasChanges();
    this.buildChartViewSize(this.pageSize.getSize());
    this.loadCategorias();
    this.resetFilters();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Unifica a lógica de busca com cancelamento automático de requisições anteriores
   */
  private setupFiltersPipeline() {
    this.refreshTransactions$
      .pipe(
        debounceTime(100),
        switchMap(() => {
          this.loading = true;
          return this.transFinService.getTrasacoes({
            fl_ativo: true,
            empresa_id: this.user?.empresa_id,
            data_inicio: this.data_inicio,
            data_fim: this.data_fim,
            categorias: this.categoriasControl.value,
            status: this.statusExportControl.value
          });
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          console.log('res: ', res);
          this.transacoes = res.filter(
            (t: TransacaoFinanceira) => (t.valor_final as number) > 0
          ).sort((a: TransacaoFinanceira, b: TransacaoFinanceira) => {
            return new Date(b.data_lancamento as string).getTime() - new Date(a.data_lancamento as string).getTime();
          });
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  resetFilters() {
    this.periodo.setValue(0);
    this.categoriasControl.setValue([]);
    this.statusExportControl.setValue('pago');
    this.refreshTransactions$.next();
    this.buildDashboard();
  }

  getSelectedCategoriesText(): string {
    const selectedIds = this.categoriasControl.value || [];
    if (selectedIds.length === 0) return 'Todas Categorias';
    if (selectedIds.length === this.listaCategorias.length) return 'Todas Categorias';
    if (selectedIds.length === 1) {
      const cat = this.listaCategorias.find(c => c.id === selectedIds[0]);
      return cat ? (cat.descricao.charAt(0).toUpperCase() + cat.descricao.slice(1).toLowerCase()) : '1 Categoria';
    }
    return `${selectedIds.length} Categorias`;
  }

  listenCategoriasChanges() {
    combineLatest([
      this.categoriasControl.valueChanges,
      this.statusExportControl.valueChanges
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.refreshTransactions$.next();
        this.buildDashboard();
      });
  }

  buildChartViewSize(e: { screenSize: number; isMobile: boolean }) {
    if (e.screenSize < 769) {
      this.chartViewSize = [300, 150];
    } else if (e.screenSize < 845) {
      this.chartViewSize = [180, 125];
    } else if (e.screenSize < 936) {
      this.chartViewSize = [300, 130];
    } else if (e.screenSize < 1100) {
      this.chartViewSize = [400, 150];
    } else if (e.screenSize < 1598) {
      this.chartViewSize = [500, 200];
    } else if (e.screenSize > 1725) {
      this.chartViewSize = [550, 250];
    } else console.log('this.chartViewSize: ', this.chartViewSize);
  }

  listenPeriodoControlChanges() {
    const buildDates = (qtd: number) => {
      this.data_inicio = new Date(
        this.today.getFullYear(),
        this.today.getMonth() - qtd,
        1
      )
        .toISOString()
        .split('T')[0];
      this.data_fim = new Date(
        this.today.getFullYear(),
        this.today.getMonth() + 1,
        0
      )
        .toISOString()
        .split('T')[0];
    };

    this.periodo.events.subscribe((res: any) => {
      if (res.value === null) return;

      switch (res.value) {
        case null:
          break;

        default:
          buildDates(res.value);
          break;
      }
      // Exibindo os resultados no console
      console.log('Data início:', this.data_inicio);
      console.log('Data fim:', this.data_fim);
      this.onChangeDates();
    });
  }

  onChangeDates() {
    const validation = new Date(this.data_inicio) > new Date(this.data_fim);
    console.log('validation: ', validation);

    if (validation) {
      this.toastr.warning(
        'A data inicial não pode ser maior que a data final.'
      );
      return;
    }

    this.buildDashboard();
    this.refreshTransactions$.next();
  }

  buildDashboard() {
    this.totalReceitas = 0;
    this.totalDespesas = 0;
    this.saldo = 0;
    this.totalReceitasPorCategoria = [];
    this.totalDespesasPorCategoria = [];
    // this.loading = true; // Removido pois o setupFiltersPipeline já gerencia o loading da lista
    this.transFinService
      .getDashboard(
        this.data_inicio,
        this.data_fim,
        this.user?.empresa_id as string
      )
      .subscribe({
        next: (res: any) => {
          console.log(res);
          this.totalReceitas = res.totalReceitas.toFixed(2);
          this.totalDespesas = res.totalDespesas.toFixed(2);

          // New Metrics Calculation
          // Lucro Líquido: Receitas - Despesas
          this.saldo = (res.totalReceitas - res.totalDespesas).toFixed(2);
          this.isSaldoPositivo = (res.totalReceitas - res.totalDespesas) >= 0;
          this.ticketMedio = res.totalPagadores > 0 ? (res.totalReceitas / res.totalPagadores).toFixed(2) : 0;
          this.totalProjetado = res.totalProjetado.toFixed(2);

          this.totalReceitasPorCategoria = res.totalReceitasPorCategoria.map(
            (i: any) => {
              return {
                name: i.descricao.toUpperCase(),
                value: i.valor_final,
              };
            }
          );

          this.totalDespesasPorCategoria = res.totalDespesasPorCategoria
            .sort((a: any, b: any) => b.valor_final - a.valor_final)
            .slice(0, 5)
            .map(
              (i: any) => {
                return {
                  name: i.descricao.toUpperCase(),
                  value: i.valor_final,
                };
              }
            );
        },
        complete: () => {
          // this.loading = false;
        },
      });

    const empresaId = this.user?.empresa_id;
    if (empresaId) {
      this.dashService.getReceitasPendentes(empresaId).subscribe((res: any) => {
        this.pendenciasAReceber = res.totalValor || 0;
      });
      this.dashService.getDespesasPendentes(empresaId).subscribe((res: any) => {
        this.pendenciasAPagar = res.totalValor || 0;
      });
    }
  }

  getReceitas() {
    this.transFinService
      .getTrasacoes({
        tr_tipo_id: 1,
        empresa_id: this.user?.empresa_id,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.receitas = res.map((t: TransacaoFinanceira) => {
            return {
              ...t,
              data_lancamento: (t.data_lancamento as string).split('T')[0],
            };
          });
        },
      });
  }

  getDespesas() {
    this.transFinService
      .getTrasacoes({
        tr_tipo_id: 2,
        empresa_id: this.user?.empresa_id,
      })
      .subscribe({
        next: (res) => {
          console.log(res);
          this.despesas = res.map((t: TransacaoFinanceira) => {
            return {
              ...t,
              data_lancamento: (t.data_lancamento as string).split('T')[0],
            };
          });
        },
        error: (err) => { },
        complete: () => { },
      });
  }

  buildRandomItems() {
    return new Array(10).fill(1).map((i) => {
      return {
        valor: Math.round(Math.random() * 1000),
        data: new Date().toISOString(),
        descricao: 'Receita ' + Math.round(Math.random() * 1000),
      };
    });
  }

  delete(transacao: TransacaoFinanceira) {
    this.alertController
      .create({
        header: 'Atenção',
        message: 'Tem certeza que deseja excluir esse item?',
        buttons: [
          {
            text: 'Sim',
            handler: () => {
              this.transFinService
                .save({
                  id: transacao.id,
                  fl_ativo: false,
                })
                .subscribe({
                  complete: () => {
                    this.ngOnInit();
                  },
                });
            },
          },
          {
            text: 'Nao',
            role: 'cancel',
          },
        ],
      })
      .then((alert) => alert.present());
  }

  getTransacoes() {
    this.loading = true;
    this.transFinService
      .getTrasacoes({
        fl_ativo: true,
        empresa_id: this.user?.empresa_id,
        data_inicio: this.data_inicio,
        data_fim: this.data_fim,
        categorias: this.categoriasControl.value
      })
      .subscribe({
        next: (res) => {
          console.log('res: ', res);

          this.transacoes = res.filter(
            (t: TransacaoFinanceira) => (t.valor_final as number) > 0
          ).sort((a: TransacaoFinanceira, b: TransacaoFinanceira) => {
            return new Date(b.data_lancamento as string).getTime() - new Date(a.data_lancamento as string).getTime();
          });
          this.loading = false;
        },
      });
  }

  openTransacaoForm(
    tipo: string = '',
    action: string = 'nova',
    selectedTransacao?: any
  ) {
    this.action = action;
    this.tipo = tipo;
    this.modalController
      .create({
        component: FormTransacaoFinaceiraComponent,
        componentProps: {
          action,
          tipo,
          transacaoFinanceira: selectedTransacao,
        },
      })
      .then((m) => {
        m.present();
        m.onDidDismiss().then((res) => {
          console.log('res: ', res);

          if (res.data) {
            this.ngOnInit();
          }
        });
      });
  }

  gerarRecibo(transacao: TransacaoFinanceira) {
    const audio = new Audio('../../assets/audios/cash-register.mp3');

    audio.play();
    setTimeout(() => {
      this.confetti.showConfetti();
    }, 250);
    this.downloadRecibo(transacao);
    this.askSendReceipt(transacao);
  }

  async askSendReceipt(transacao: TransacaoFinanceira) {
    const usuario = {
      nome: (transacao.membro?.nome) as string,
      whatsapp: (transacao.membro?.whatsapp) as string
    };

    if (!usuario.whatsapp) return;

    const alert = await this.alertController.create({
      header: 'Enviar Comprovante',
      message: `Deseja enviar o comprovante de pagamento para ${usuario.nome} via WhatsApp?`,
      buttons: [
        { text: 'Não', role: 'cancel' },
        {
          text: 'Sim, enviar',
          handler: () => {
            const valor = transacao.valor_final ? `R$ ${Number(transacao.valor_final).toFixed(2)}` : '';
            const data = transacao.data_lancamento ? new Date(transacao.data_lancamento as string).toLocaleDateString('pt-BR') : '';
            const forma = transacao.forma_pagamento || 'PIX';

            this.whatsappModalService.openModal(usuario, 'RECEIPT', {
              valor,
              data,
              forma_pagamento: forma
            });
          }
        }
      ]
    });
    await alert.present();
  }
  downloadRecibo(transacao: TransacaoFinanceira) {
    this.buildReciboImage(transacao, (data) => {
      const url = URL.createObjectURL(data['blob']);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recibo - ${transacao.descricao} .png`;
      link.click();
    });
  }

  reciboService = inject(ReciboService);
  async buildReciboImage(
    transacao: TransacaoFinanceira,
    callback: (data: { blob: Blob; base64: string }) => any
  ) {
    this.reciboService.buildRecibo(
      transacao as TransacaoFinanceira,
      this.user as IUsuario,
      callback
    );
  }

  newAnaliseAI() {
    const data = {
      empresa_id: this.user?.empresa_id,
      data_inicio: this.data_inicio,
      data_fim: this.data_fim,
    };

    this.modalController
      .create({
        component: AnaliseIaModalComponent,
        componentProps: {
          data,
        },
      })
      .then((modal) => {
        modal.present();
        modal.onDidDismiss().then((res) => {
          console.log(res);
        });
      });
  }

  loadCategorias() {
    forkJoin({
      receitas: this.transFinService.getCategoriasByTipoId(1),
      despesas: this.transFinService.getCategoriasByTipoId(2)
    }).subscribe(res => {
      this.listaCategorias = [...res.receitas, ...res.despesas].sort((a, b) => a.descricao.localeCompare(b.descricao));
    });
  }

  exportar(formato: 'pdf' | 'excel') {
    if (formato === 'pdf') this.isExportingPDF = true;
    else this.isExportingExcel = true;

    const filters = {
      data_inicio: this.data_inicio,
      data_fim: this.data_fim,
      empresa_id: this.user?.empresa_id,
      empresa_nome: this.user?.empresa?.nome,
      categorias: this.categoriasControl.value,
      status: this.statusExportControl.value
    };

    if (formato === 'pdf') {
      this.transFinService.exportPDFBackend(filters).pipe(takeUntil(this.destroy$)).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Financeiro_${this.user?.empresa?.nome}_${new Date().toISOString().split('T')[0]}.pdf`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.isExportingPDF = false;
          this.toastr.success('Relatório gerado com sucesso!');
        },
        error: err => {
          console.error(err);
          this.toastr.error('Erro ao gerar relatório PDF no servidor.');
          this.isExportingPDF = false;
        }
      });
    } else {
      this.transFinService.getTrasacoes({ ...filters, endpoint: 'export' }).pipe(takeUntil(this.destroy$)).subscribe({
        next: async (data: any) => {
          try {
            await this.exportService.generateExcel({
              transacoes: data,
              empresaNome: this.user?.empresa?.nome as string,
              periodo: { inicio: this.data_inicio, fim: this.data_fim }
            });
            this.toastr.success('Relatório gerado com sucesso!');
          } catch (exportError) {
            console.error(exportError);
            this.toastr.error('Erro ao gerar a planilha.');
          } finally {
            this.isExportingExcel = false;
          }
        },
        error: err => {
          console.error(err);
          this.toastr.error('Erro ao buscar dados para exportação.');
          this.isExportingExcel = false;
        }
      });
    }
  }
}
