import { ConfettiService } from './../../core/services/confetti/confetti.service';
import { ToastrService } from './../../core/services/toastr/toastr.service';
import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { IUsuario, Usuario } from 'src/core/models/Usuario';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { AlertController, ModalController } from '@ionic/angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Clipboard } from '@capacitor/clipboard';

import { DashboardMembersService } from 'src/core/services/dashboard/members/members.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { FormTransacaoFinaceiraComponent } from '../shared/form-transacao-finaceira/form-transacao-finaceira.component';
import { TransacaoFinanceiraService } from 'src/core/services/transacao-financeira/transacao-financeira.service';
import { TransacaoFinanceiraDashService } from 'src/core/services/dashboard/transacao-financeira-dash/transacao-financeira-dash.service';
import Constants from 'src/core/Constants';

import { FormaDePagamento, TransacaoFinanceira } from 'src/core/models/TransacaoFInanceira';

const WHATSAPP_MESSAGE_TEMPLATE = `
    Olá, {{nome}}. Aqui é {{remetente}}, da *{{empresa}}*. Tudo bem? %0D
  Ainda não foi identificado o pagamento da sua mensalidade do mês de *{{mes}}* de *{{ano}}*.%0D
  Para informar o pagamento, favor enviar o comprovante de pagamento via WhatsApp. %0D%0D

  Caso ainda não tenha realizado o pagamento, segue os dados de transferência: 
  
  *Chave Pix*: {{chave_pix}} 


  Caso prefira utilizar o cartão de crédito, favor solicite um link de pagamento ou vá até a recepção. %0DSerá um prazer te atender!`;

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  showHistoricoModal: boolean = false;
  downloadRecibo() {
    throw new Error('Method not implemented.');
  }

  pagamentos: {
    checked: boolean;
    mes: number;
    ano: number;
    data: Date | string;
    nome_mes: {
      value: number;
      label: string;
    };
    pago: boolean;
    valor: number;
    transacao?: any;
  }[] = new Array(12).fill(0).map((_, index) => ({
    checked: false,
    mes: index + 1,
    ano: new Date().getFullYear(),
    data: new Date(new Date().getFullYear(), index, 1),
    nome_mes: Constants.meses[index],
    pago: false,
    valor: 0,
    transacao: null,
  }));
  meses = Constants.meses;
  anos: {
    value: number;
  }[] = new Array(5)
    .fill(0)
    .map((i, index) => ({ value: new Date().getFullYear() - index }));
  Constants = Constants;
  tipoSelected: number | string = Constants.ALUNO_ID;
  usuarioList: Usuario[] = [];
  usuarios: Usuario[] = [];
  showCobrancaModal: boolean = false;
  showReciboModal: boolean = false;
  showFormReciboModal: boolean = false;
  isOpen: boolean = false;
  selectedUsuario?: Usuario | null;
  @Input() onlyList: boolean = false;
  colorScheme = {
    domain: ['#5AA454', '#E44D25', '#CFC0BB', '#7aa3e5', '#a8385d', '#aae3f5'],
  };
  memberDataCard: {
    title: string;
    subtitle: string;
    size: number;
    data: {
      name: string;
      value?: number;
      series?: { name: string; value: number }[];
    }[];
    iconColor: string;
    chartType: string | null;
    value: number | string | null;
    cardIconName: string;
    tendency?: string;
    tendencyValue?: number | string | null;
    breakpoints?: {
      size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'auto';
      value: number;
    }[];
  }[] = [];
  discountType: string = '%';
  recibo: any;
  pagamentosLoading: boolean = false;
  searchText: string = '';
  alunosRiscoIds: number[] = [];
  selectedFilter: string = 'todos';
  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private modalController: ModalController,
    private toastr: ToastrService,
    private confetti: ConfettiService,
    private dashboardMembersService: DashboardMembersService,
    private authService: AuthService,
    private transacaoFinanceiraDashService: TransacaoFinanceiraDashService,
    private transacaoFinanceiraService: TransacaoFinanceiraService,
    private alertController: AlertController
  ) { }
  user: IUsuario | null = null;
  ngOnInit() {
    this.user = this.authService.getUser;
    this.getUsuarios();

    if (!this.onlyList) {
      this.getDashboardMembersData();
    }
  }

  getDashboardMembersData() {
    this.dashboardMembersService
      .getDashboardMembersData({
        fl_ativo: true,
        tipo_usuario: Constants.ALUNO_ID,
        empresa_id: this.user?.empresa_id,
      })
      .subscribe({
        next: (res: {
          totalMembers: {
            male: number;
            female: number;
            total: number;
          };
          newMembers: {
            total: number;
            tendency: number;
            male: number;
            female: number;
          };
          memberAtLastMonth: number;
          horarios: {
            [key: string]: number;
          };
        }) => {
          console.log('res: ', res);
          this.memberDataCard = []; // Clear current cards before rebuild
          this.buildTotalMembersChartCard(res);
          this.buildNovosMembrosChartCard(res);
          this.buildPaymentStatusChartCard(res);
          this.buildPlanDistChartCard(res);
          this.buildAgeDistChartCard(res);
          this.fetchAndBuildRiskCard();
        },
      });
  }

  fetchAndBuildRiskCard() {
    if (!this.user?.empresa_id) return;

    this.dashboardMembersService.getAlunosSemCheckin(this.user.empresa_id).subscribe({
      next: (res) => {
        this.alunosRiscoIds = res.alunos.map((a: any) => a.id);
        const cardData = {
          title: 'Alunos em Risco',
          subtitle: 'Sem check-in (+14 dias)',
          size: 4,
          iconColor: 'medium',
          chartType: null,
          value: res.total,
          cardIconName: 'trending-down-outline',
          filter: 'risco',
          data: []
        };
        this.memberDataCard.push(cardData);
      }
    });
  }

  buildAgeDistChartCard(res: any) {
    const cardData = {
      title: 'Faixa Etária',
      subtitle: 'Perfil de idade dos alunos',
      size: 4,
      iconColor: 'warning',
      chartType: 'bar',
      value: null,
      cardIconName: 'calendar-outline',
      data: Object.keys(res.ageDist).map(key => ({
        name: key,
        value: res.ageDist[key]
      }))
    };
    this.memberDataCard.push(cardData);
  }

  buildPlanDistChartCard(res: any) {
    const cardData = {
      title: 'Distribuição por Plano',
      subtitle: 'Popularidade das adesões',
      size: 4,
      iconColor: 'success',
      chartType: 'pie',
      value: null,
      cardIconName: 'card-outline',
      data: Object.keys(res.planDist).map(key => ({
        name: key,
        value: res.planDist[key]
      }))
    };
    this.memberDataCard.push(cardData);
  }

  buildPaymentStatusChartCard(res: any) {
    const cardData = {
      title: 'Status de Pagamento',
      subtitle: 'Saúde financeira (Mês Atual)',
      size: 4,
      iconColor: 'danger',
      chartType: 'pie',
      value: null,
      cardIconName: 'cash-outline',
      filter: 'inadimplentes',
      data: Object.keys(res.paymentStatusDist).map(key => ({
        name: key,
        value: res.paymentStatusDist[key]
      }))
    };
    this.memberDataCard.push(cardData);
  }

  onCardClick(card: any) {
    if (card.filter) {
      this.selectedFilter = card.filter;
      this.filterMember({ detail: { value: card.filter } });
      setTimeout(() => {
        const element = document.querySelector('.members-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  buildTotalMembersChartCard(res: any) {
    const cardData = {
      title: 'Total de Alunos',
      size: 4,
      iconColor: 'primary',
      chartType: 'pie',
      cardIconName: 'people',
      subtitle: 'Distribuição por gênero',
      value: res.totalMembers.total,
      tendency: res.totalMembers.total >= res.memberAtLastMonth ? 'up' : 'down',
      tendencyValue: (((res.totalMembers.total - res.memberAtLastMonth) / (res.memberAtLastMonth || 1)) * 100).toFixed(1),
      data: [
        {
          name: 'Mulheres',
          value: res.totalMembers.female || 0,
        },
        {
          name: 'Homens',
          value: res.totalMembers.male || 0,
        },
      ],
    };
    this.memberDataCard.push(cardData);
  }

  buildNovosMembrosChartCard(res: any) {
    const cardData = {
      title: 'Novos no Mês',
      subtitle: 'Entradas de ' + Constants.meses[new Date().getMonth()].label,
      size: 4,
      iconColor: 'success',
      chartType: 'pie',
      value: res.newMembers.total,
      cardIconName: 'person-add',
      tendency: 'up',
      filter: 'novos',
      tendencyValue: res.newMembers.tendency?.toFixed(1) || 0,
      data: [
        {
          name: 'Mulheres',
          value: res.newMembers.female || 0,
        },
        {
          name: 'Homens',
          value: res.newMembers.male || 0,
        },
      ],
    };

    this.memberDataCard.push(cardData);
  }

  buildDiariasChartCard(res: any) {
    this.transacaoFinanceiraDashService
      .getByPeriod(
        new Date().toISOString(),
        new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
        this.user?.empresa_id as string,
        {
          fl_ativo: true,
          tr_categoria_id: Constants.TR_CATEGORIA_DIARIA,
        }
      )
      .subscribe({
        next: (res) => {
          this.memberDataCard[2].value = res.length;
        },
      });
  }

  changeTipoUsuario(e: any) {
    this.tipoSelected = e.detail.value;
    this.getUsuarios(this.tipoSelected);
  }

  getUsuarios(tipoUsuario: number | string = Constants.ALUNO_ID) {
    const checkStatusPagamento = (u: Usuario) => {
      if (u.data_ultimo_pagamento !== null && u.data_vencimento !== null) {
        console.log('Checando pagamento: ', u.nome);

        const ultimoPagamento = new Date(u.data_ultimo_pagamento as string);
        console.log('ultimoPagamento', ultimoPagamento);

        const diaUltimoPagamento = ultimoPagamento.getDate();
        const mesUltimoPagamento = ultimoPagamento.getMonth();
        const anoUltimoPagamento = ultimoPagamento.getFullYear();

        const diaVencimento = u.data_vencimento;

        const hoje = new Date();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();

        // --- Lógica para o mês atual ---
        if (
          mesUltimoPagamento === mesAtual &&
          anoUltimoPagamento === anoAtual
        ) {
          // Pagamento feito no mês atual, deve ser no dia ou após o dia de vencimento
          return diaUltimoPagamento >= diaVencimento;
        }

        // --- Lógica para o mês anterior ---
        const mesAnterior = mesAtual === 0 ? 11 : mesAtual - 1;
        const anoAnterior = mesAtual === 0 ? anoAtual - 1 : anoAtual;

        if (
          mesUltimoPagamento === mesAnterior &&
          anoUltimoPagamento === anoAnterior
        ) {
          // Pagamento feito no mês anterior, deve ser no dia ou após o dia de vencimento do mês anterior
          const ultimoDiaMesAnterior = new Date(
            anoAnterior,
            mesAnterior + 1,
            0
          ).getDate();
          const dataVencimentoMesAnterior = new Date(
            anoAnterior,
            mesAnterior,
            diaVencimento
          );

          // Se o dia de vencimento for maior que o último dia do mês anterior,
          // consideramos o último dia do mês anterior como a data de vencimento.
          const dataVencimentoAnteriorAjustada =
            diaVencimento > ultimoDiaMesAnterior
              ? new Date(anoAnterior, mesAnterior, ultimoDiaMesAnterior)
              : dataVencimentoMesAnterior;

          return ultimoPagamento >= dataVencimentoAnteriorAjustada;
        }

        return false;
      }
      return false;
    };

    this.usuarioService
      .findByFilters({
        tipo_usuario: tipoUsuario,
        empresa_id: this.user?.empresa_id,
      })
      .subscribe({
        next: (res) => {
          this.usuarios = res.map((u: Usuario) => {
            return {
              ...u,
              idade:
                new Date().getFullYear() -
                new Date(u.data_nascimento).getFullYear(),
              fl_pago: u.status_pagamento === 'Em Dia',
              status_pagamento: u.status_pagamento,
            };
          });
          console.log('this.usuarioList: ', this.usuarioList);
          this.usuarioList = this.usuarios.filter((u: Usuario) => u.fl_ativo);
        },
      });
  }

  showNavigationOptions(usuario: Usuario) {
    this.isOpen = true;
    this.selectedUsuario = usuario;
  }

  navigate(path: string, user: Usuario | null = null) {
    if (!user) {
      return;
    }

    this.isOpen = false;
    setTimeout(() => {
      this.router.navigate([path], { queryParams: { userId: user.id } });
    }, 250);
  }

  cobrancaForm: FormGroup = new FormGroup({
    mes: new FormControl(null, [Validators.required]),
    ano: new FormControl(null, [Validators.required]),
  });

  get mes() {
    return this.cobrancaForm.get('mes');
  }

  get ano() {
    return this.cobrancaForm.get('ano');
  }

  get message(): string {
    return WHATSAPP_MESSAGE_TEMPLATE
      .replace('{{nome}}', this.selectedUsuario?.nome ?? '')
      .replace('{{remetente}}', this.user?.nome ?? '')
      .replace('{{empresa}}', this.user?.empresa?.nome ?? '')
      .replace('{{mes}}', this.mes?.value ?? '')
      .replace('{{ano}}', this.ano?.value ?? '')
      .replace('{{chave_pix}}', this.user?.empresa?.chave_pix ?? '');
  }

  sendMessage() {
    const mdMessage = encodeURIComponent(this.message.replace(/%0D/g, '\n'));

    const formatedNumber = this.selectedUsuario?.whatsapp?.replace(/\D/g, '');

    const whasappUrl = `https://wa.me/55${formatedNumber}?text=${mdMessage}`;

    console.log('whasappUrl = ', whasappUrl)

    const a = document.createElement('a');
    a.href = whasappUrl;
    a.target = '_blank';
    a.click();
    // this.showCobrancaModal = false;
    // this.selectedUsuario = null;
  }

  copyMessage() {
    const message = this.message.replace(/%0D/g, '\n');
    navigator.clipboard.writeText(message);
    Clipboard.write({
      string: message,
    }).then(() => {
      this.toastr.success(
        'Mensagem copiada para area de  transferência!',
        'bottom'
      );
    });
  }

  openCobrancaModal(member: Usuario) {
    if (!member.fl_ativo || member.fl_adimplente) {
      return;
    }
    this.selectedUsuario = member;
    this.showCobrancaModal = true;
  }

  openFormReciboModal(member: Usuario | null | undefined) {
    if (!member) return;

    const mesAtual = new Date().getMonth() + 1;
    const mesFormatado = mesAtual < 10 ? `0${mesAtual}` : `${mesAtual}`;
    this.selectedUsuario = member;

    this.modalController
      .create({
        component: FormTransacaoFinaceiraComponent,
        componentProps: {
          selectedMembro: member,
          categoriaTransacaoId: 1,
          mes: mesFormatado,
          ano: new Date().getFullYear(),
        },
      })
      .then((modal) => {
        modal.present();
        modal.onDidDismiss().then((res) => {
          console.log(res);
          if (res.data) {
            this.getUsuarios();
          }
        });
      });

    // this.reciboForm.patchValue({
    //   id: uuid(),
    //   member: {
    //     id: member.id,
    //     nome: member.nome,
    //   },
    //   plano: {
    //     id: member.planos.id,
    //     descricao: member.planos.descricao,
    //     valor: member.planos.preco_padrao,
    //   },
    //   dataPagamento: new Date().toISOString().split('T')[0],
    //   mes: null,
    //   ano: new Date().getFullYear(),
    //   desconto: '0',
    //   discountType: '%',
    //   valorPago: member.planos.preco_padrao,
    //   formaPagamento: 'pix',
    //   comprovante: null,
    // });

    // console.log('this.reciboForm: ', this.reciboForm);
  }

  async openHistoricoModal(member: Usuario | null | undefined, ano?: number) {
    if (!ano) ano = new Date().getFullYear();
    if (!member) return;
    this.selectedUsuario = member;
    this.showHistoricoModal = true;

    this.filterAno({ detail: { value: { value: ano } } });
  }

  async filterAno(event: any) {
    const ano = event.detail.value.value;
    if (!this.selectedUsuario) return;

    console.log('ano', ano);

    const data_inicio = new Date(ano, 0, 1).toISOString();

    //ultimo dia do ano
    const data_fim = new Date(ano, 11, 31).toISOString();

    await this.buildPagamentosArray(ano);
    this.getTransacoesByUser(this.selectedUsuario, ano);
  }

  getTransacoesByUser(aluno: Usuario, ano: number) {
    this.pagamentosLoading = true;
    this.transacaoFinanceiraService
      .getTrasacoes({
        pago_por: aluno.id,
        empresa_id: this.user?.empresa_id,
        ano,
        tr_categoria_id: 1,
        fl_ativo: true,
      })
      .subscribe({
        next: (res) => {
          console.log('res', res);
          this.pagamentos = this.pagamentos
            //filtrar pagamentos para pegar apenas a partir da data de criação do aluno
            .filter((p) => {
              const pagamentoDate = new Date(p.data);
              const alunoCreatedDate = new Date(aluno.created_at as string);

              // Só inclui pagamentos do ano de criação do aluno em diante
              if (
                pagamentoDate.getFullYear() < alunoCreatedDate.getFullYear() ||
                (pagamentoDate.getFullYear() ===
                  alunoCreatedDate.getFullYear() &&
                  pagamentoDate.getMonth() < alunoCreatedDate.getMonth())
              ) {
                return false;
              }
              return true;
            })
            //e mapear os pagamentos no array de pagamentos
            .map((p) => {
              p.pago = res.find((r: any) => {
                if (r.mes === p.mes && r.ano === p.ano)
                  p = {
                    ...p,
                    pago: true,
                    transacao: r,
                  };
              });

              return p;
            });

          this.pagamentosLoading = false;
        },
      });
  }

  buildPagamentosArray(ano: number = new Date().getFullYear()) {
    this.pagamentos = new Array(12).fill(0).map((_, index) => ({
      mes: index + 1,
      ano: ano,
      data: new Date(ano, index, 1).toISOString(),
      nome_mes: Constants.meses[index],
      pago: false,
      valor: 0,
      checked: false,
    }));
  }
  openReciboModal(member: Usuario | null | undefined) {
    if (!member) return;
    this.showReciboModal = true;
  }

  async registrarPagamentos(action: 'isentar' | 'registrar') {
    console.log('action', action);
    console.log('this.pagamentos', this.pagamentos);
    console.log('this.selectedUsuario', this.selectedUsuario);
    if (!this.selectedUsuario) return;

    if (this.pagamentos.filter((p) => p.checked).length === 0) {
      this.toastr.warning(
        'Selecione ao menos um pagamento para ' + action + '!'
      );
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: 'Deseja realmente ' + action + ' os pagamentos?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            const pagamentos = this.pagamentos.filter((p) => p.checked);

            pagamentos.forEach((p) => {
              console.log('Registrando pagamento: ', p);
              const transacao: Partial<TransacaoFinanceira> = {
                tr_categoria_id: 1,
                tr_tipo_id: 1,
                data_lancamento: p.data,
                valor_real: Number(this.selectedUsuario?.planos?.preco_padrao),
                desconto_real:
                  action === 'isentar'
                    ? Number(this.selectedUsuario?.planos?.preco_padrao)
                    : 0,
                valor_final:
                  action !== 'isentar'
                    ? Number(this.selectedUsuario?.planos?.preco_padrao)
                    : 0,
                pago_por: Number(this.selectedUsuario?.id),
                empresa_id: String(this.user?.empresa_id),
                fl_pago: true,
                mes: p.mes,
                ano: p.ano,
                descricao: `${action === 'isentar' ? 'Isenção de pagamento' : 'Pagamento'} do mês ${p.nome_mes.label} do ano ${p.ano} pelo Aluno: ${this.selectedUsuario?.nome}`,
                recebido_por: this.user?.id as number,
                forma_pagamento: FormaDePagamento.PIX,
              };

              this.transacaoFinanceiraService.save(transacao).subscribe({
                next: (res) => {
                  console.log('Pagamento registrado com sucesso: ', res); //TODO: mostrar mensagem de sucesso
                  this.toastr.success(
                    'Pagamento registrado com sucesso!',
                    'top'
                  );
                  this.confetti.showConfetti();
                  this.getUsuarios();
                  this.getTransacoesByUser(
                    this.selectedUsuario as Usuario,
                    this.pagamentos[0].ano
                  );
                },
              });
            });

            this.pagamentos = this.pagamentos.map((p) => ({
              ...p,
              checked: false,
            }));
            this.getTransacoesByUser(
              this.selectedUsuario as Usuario,
              this.pagamentos[0].ano
            );
          },
        },
      ],
    });
    alert.present();
  }

  filterMember(event: any) {
    const filter = event.detail.value;
    console.log('filter', filter);

    switch (filter) {
      case 'todos':
        this.usuarioList = this.usuarios;
        break;
      case 'ativos':
        this.usuarioList = this.usuarios.filter((u) => u.fl_ativo);
        break;
      case 'inativos':
        this.usuarioList = this.usuarios.filter((u) => !u.fl_ativo);
        break;
      case 'inadimplentes':
        this.usuarioList = this.usuarios.filter(
          (u) => u.status_pagamento.label !== 'Em Dia' && u.fl_ativo
        );
        break;
      case 'risco':
        this.usuarioList = this.usuarios.filter(
          (u) => u.id && this.alunosRiscoIds.includes(u.id)
        );
        break;
      case 'novos':
        this.usuarioList = this.usuarios.filter((u) => {
          const dataCadastro = new Date(u.created_at as string);
          const hoje = new Date();
          return dataCadastro.getMonth() === hoje.getMonth() &&
            dataCadastro.getFullYear() === hoje.getFullYear();
        });
        break;
      case 'input':
        this.usuarioList = this.usuarios.filter((u) => {
          const searchLower = this.searchText.toLowerCase();
          return (
            u.nome.toLowerCase().includes(searchLower) ||
            u.cpf?.toLowerCase().includes(searchLower) ||
            u.whatsapp?.toLowerCase().includes(searchLower) ||
            u.planos?.descricao.toLowerCase().includes(searchLower)
          );
        });
        break;
    }
  }

  async toggleAtivo(usuario: Usuario | null | undefined) {
    if (!usuario) return;

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `Deseja realmente ${usuario.fl_ativo ? 'desativar' : 'ativar'
        } o usuário ${usuario.nome}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          handler: () => {
            const fl_ativo = !usuario.fl_ativo;

            this.usuarioService
              .update({
                id: usuario.id,
                fl_ativo,
                data_desativacao: fl_ativo ? null : new Date().toISOString(),
              })
              .subscribe({
                next: (res) => {
                  if (res) {
                    this.toastr.success(
                      `Usuário ${usuario.fl_ativo ? 'desativado' : 'ativado'
                      } com sucesso!`,
                      'top'
                    );
                    this.getUsuarios();
                    this.isOpen = false;
                  }
                },
              });
          },
        },
      ],
    });
    alert.present();
  }


  async openTreinoHistoryModal(member: Usuario | null | undefined) {
    if (!member) return;
    this.isOpen = false;
    this.router.navigate(['/admin/membros/historico', member.id]);
  }

  getGlowColor(color: string): string {
    const colors: { [key: string]: string } = {
      primary: 'rgba(var(--ion-color-primary-rgb), 0.1)',
      success: 'rgba(var(--ion-color-success-rgb), 0.1)',
      warning: 'rgba(var(--ion-color-warning-rgb), 0.1)',
      danger: 'rgba(var(--ion-color-danger-rgb), 0.1)',
      medium: 'rgba(var(--ion-color-medium-rgb), 0.1)',
    };
    return colors[color] || colors['primary'];
  }
  exportStudents() {
    if (!this.user?.empresa_id) return;

    this.toastr.success('Gerando planilha...', 'top');
    this.usuarioService.exportStudents(this.user?.empresa_id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alunos_${new Date().toLocaleDateString()}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.toastr.success('Exportação concluída!', 'top');
      },
      error: (err) => {
        this.toastr.error('Erro ao exportar alunos: ' + err.message);
      }
    });
  }
}
