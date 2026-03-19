import { UsuarioService } from './../../core/services/usuario/usuario.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { MaskitoElementPredicate } from '@maskito/core';
import Constants from 'src/core/Constants';
import { Empresa } from 'src/core/models/Empresa';
import { AuthService } from 'src/core/services/auth/auth.service';
import { EmpresaService } from 'src/core/services/empresa/empresa.service';

import { ConfettiService } from 'src/core/services/confetti/confetti.service';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';
import { EmpresaStateService } from 'src/core/services/empresa/state/empresa-state.service';
import { Subscription } from 'rxjs';
import { ActionSheetController } from '@ionic/angular';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

@Component({
  selector: 'app-check-in',
  templateUrl: './check-in.page.html',
  styleUrls: ['./check-in.page.scss'],
})
export class CheckInPage implements OnInit {
  changeDate(event: any) {
    console.log('💻🔍🪲 - event', event);

  }
  cpfMask = Constants.cpfMask;
  cpf: string = '';
  nome: string = '';
  empresa!: Empresa;
  checkinUrl: any;
  empresaId!: string | null;
  isMobile!: boolean;
  isAdminPath: boolean = false;
  saveInfoOnDevice: boolean = false;
  checkinHistoric: any[] = []; // TODO: definir interface para o checkinHistoric
  subs$: Subscription = new Subscription();
  viewMode: 'list' | 'checkin' = 'list';
  maskPredicate: MaskitoElementPredicate = async (el: any) =>
    (el as HTMLIonInputElement).getInputElement();
  dataInicio: any;
  dataFim: any;
  filtroNome: string = '';
  loadingHistoric: boolean = false;

  constructor(
    private empresaService: EmpresaService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private confettiService: ConfettiService,
    private mobileService: PageSizeService,
    private userService: UsuarioService,
    private actionSheetCtrl: ActionSheetController,
    private toastService: ToastrService,
    private empresaState: EmpresaStateService
  ) {

    this.subs$.add(
      this.router.events.subscribe((ev) => {
        if (ev instanceof NavigationEnd) {
          console.log('💻🔍🪲 - ev.url', ev.url);
          this.isAdminPath = ev.url.includes('admin');

          this.empresaId =
            this.auth.getUser?.empresa_id ||
            this.route.snapshot.queryParamMap.get('empresa_id');
          this.checkinUrl =
            location.origin +
            '/#/check-in?empresa_id=' +
            this.auth.getUser?.empresa_id ||
            this.route.snapshot.queryParamMap.get('empresa_id')


          this.getEmpresaInfo();

          if (this.isAdminPath && this.empresaId) {
            this.getCheckinHistoric(this.empresaId)
          }


          this.checkLocalStorageCheckinData();

          this.viewMode = this.isAdminPath ? 'list' : 'checkin';
        }
      }))


    this.mobileService.screenSizeChange$.subscribe((ev) => {
      this.isMobile = ev.isMobile;
    });
  }

  ngOnInit() {
    console.log('💻🔍🪲 -ngOnInit this.empresaId', this.empresaId);
  }


  checkLocalStorageCheckinData() {
    const _storedCpf = localStorage.getItem('checkin_data');
    if (_storedCpf) {
      const storedData = JSON.parse(_storedCpf);


      this.cpf = storedData.cpf || '';
      this.nome = storedData.nome || '';
      this.saveInfoOnDevice = true;
    }
  }

  getEmpresaInfo() {
    console.log('💻🔍🪲 - this.empresaId', this.empresaId);


    if (!this.empresaId) {
      return;
    }
    this.empresaService.getEmpresa(this.empresaId).subscribe({
      next: (res: any) => {
        console.log(res);
        this.empresa = new Empresa(res.data || res);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  registrarCheckIn() {
    if (!this.empresaId) {
      return;
    }

    const payload = {
      cpf: this.cpf,
      nome: this.nome,
      empresaId: this.empresaId
    }
    this.userService.registrarCheckIn(this.cpf, this.nome, this.empresaId).subscribe({
      next: (res) => {
        console.log('Check-in registrado com sucesso:', res);
        if (this.saveInfoOnDevice) {
          localStorage.setItem('checkin_data', JSON.stringify(payload));
        }
        this.confettiService.showConfetti();
        this.toastService.success('Check-in registrado com sucesso!', 'top');
        this.cpf = '';
      },
      error: (err) => {
        console.error('Erro ao registrar check-in:', err);
        this.toastService.error('Erro ao registrar check-in!');
      },
    });
  }

  getCheckinHistoric(empresaId: string, dataInicio = new Date(), dataFim = new Date()) {
    // Data inicio e fim - padrão dia atual das 00:00 às 23:59
    const data_inicio = new Date(dataInicio);
    data_inicio.setHours(0, 0, 0, 0);
    const data_fim = new Date(dataFim);
    data_fim.setHours(23, 59, 59, 999);

    this.loadingHistoric = true;
    this.userService.getCheckinsByEmpresa(empresaId, data_inicio, data_fim).subscribe({
      next: (res) => {
        this.checkinHistoric = res;
        this.loadingHistoric = false;
      },
      error: (err) => {
        console.error('Erro ao buscar histórico de check-in:', err);
        this.loadingHistoric = false;
      }
    });
  }

  async openCheckinActions(checkin: any) {
    // 1. Defina as ações com base no tipo de usuário (Visitante ou Membro)
    const isVisitante = checkin.status_acesso === 'Visitante';

    // 2. Monta o array de botões
    const actionButtons = [
      {
        text: 'Histórico Completo do CPF',
        icon: 'reader-outline',
        handler: () => {
          this.viewFullCpfHistory(checkin.cpf_aluno); // Função a ser criada
        }
      },
      {
        text: isVisitante ? 'Cadastrar Novo Aluno' : 'Ver Perfil Completo',
        icon: isVisitante ? 'person-add-outline' : 'person-circle-outline',
        handler: () => {
          this.navigateToProfileOrRegistration(checkin.cpf_aluno, checkin.nome_completo, isVisitante); // Função a ser criada
        }
      },
      {
        text: 'Deletar Registro',
        role: 'destructive',
        icon: 'trash-outline',
        handler: () => {
          this.confirmAndDeleteCheckin(checkin.id, checkin.nome_completo); // Função a ser criada
        }
      },
      {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel'
      }
    ];

    // 3. Apresenta o menu de ações
    const actionSheet = await this.actionSheetCtrl.create({
      header: `Ações para ${checkin.nome_completo || checkin.cpf} `,
      buttons: actionButtons,
    });

    await actionSheet.present();
  }


  // --- Funções de Tratamento de Ações ---

  viewFullCpfHistory(cpf: string) {
    console.log(`Abrir histórico completo para CPF: ${cpf}`);
    // Implemente a navegação ou modal para a tela de histórico detalhado aqui.
    this.getUserFrequency(cpf);
  }

  navigateToProfileOrRegistration(cpf: string, nome: string, isVisitante: boolean) {
    if (isVisitante) {
      console.log(`Abrir formulário de cadastro para Visitante: ${nome}, CPF: ${cpf}`);
      // Redirecionar para a página de cadastro com CPF e nome pré-preenchidos.
    } else {
      console.log(`Navegar para o perfil do Aluno com CPF: ${cpf}`);
      // Redirecionar para a página de detalhes/perfil do aluno.
    }
  }

  confirmAndDeleteCheckin(checkinId: number, nome: string) {
    console.log(`Solicitação de exclusão para o Check-in ID ${checkinId} de ${nome}`);
    if (confirm(`Tem certeza que deseja deletar o registro de check-in de ${nome}?`)) {
      this.userService.deleteCheckinById(checkinId).subscribe({
        next: (res) => {
          console.log(`Check-in ID ${checkinId} deletado com sucesso.`);
          alert(`Registro de check-in de ${nome} deletado com sucesso.`);
          // Atualiza a lista de check-ins após a exclusão
          if (this.empresaId) {
            this.getCheckinHistoric(this.empresaId, this.dataInicio, this.dataFim);
          }
        },
        error: (err) => {
          console.error(`Erro ao deletar o Check-in ID ${checkinId}:`, err);
          alert(`Erro ao deletar o registro de check-in de ${nome}. Tente novamente.`);
        }
      });
    }

  }


  getUserFrequency(cpf: string) {
    this.userService.getFrequencyByCPF(cpf, this.empresaId as string).subscribe({
      next: (res: any) => {
        console.log('Frequência do usuário:', res);
      }
    });
  }

  ngOnDestroy() {
    this.subs$.unsubscribe();
  }
}
