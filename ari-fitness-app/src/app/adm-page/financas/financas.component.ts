import { Component, inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AlertController, ModalController } from '@ionic/angular';
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
    0
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
  isSaldoPositivo: boolean = true;
  totalReceitasPorCategoria: CategoryChart[] = [];
  totalDespesasPorCategoria: CategoryChart[] = [];
  periodo = new FormControl(0, [Validators.required]);
  loading: boolean = true;
  isMobile = false;
  transacoes: TransacaoFinanceira[] = [];
  openOptions: boolean = false;
  confetti = inject(ConfettiService);
  constructor(
    private alertController: AlertController,
    private transFinService: TransacaoFinanceiraService,
    private auth: AuthService,
    private toastr: ToastrService,
    private pageSize: PageSizeService,
    private modalController: ModalController
  ) {
    this.pageSize.screenSizeChange$.asObservable().subscribe({
      next: (e) => {
        console.log('e: ', e);
        this.buildChartViewSize(e);
        this.isMobile = e.isMobile;
      },
    });
  }

  ngOnInit() {
    this.user = this.auth.getUser;
    // this.getReceitas();
    // this.getDespesas();
    this.getTransacoes();
    this.buildDashboard();
    this.listenPeriodoControlChanges();
    this.buildChartViewSize(this.pageSize.getSize());
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
        0
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
    this.getTransacoes();
  }

  buildDashboard() {
    this.totalReceitas = 0;
    this.totalDespesas = 0;
    this.saldo = 0;
    this.totalReceitasPorCategoria = [];
    this.totalDespesasPorCategoria = [];
    this.loading = true;
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

          this.totalReceitasPorCategoria = res.totalReceitasPorCategoria.map(
            (i: any) => {
              return {
                name: i.descricao.toUpperCase(),
                value: i.valor_final,
              };
            }
          );

          this.totalDespesasPorCategoria = res.totalDespesasPorCategoria.map(
            (i: any) => {
              return {
                name: i.descricao.toUpperCase(),
                value: i.valor_final,
              };
            }
          );
        },
        complete: () => {
          this.loading = false;
        },
      });
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
      this.user,
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
}
