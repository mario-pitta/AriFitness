import Constants from 'src/core/Constants';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { Treino } from 'src/core/models/Treino';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { FichaAlunoService } from 'src/core/services/ficha-aluno/ficha-aluno.service';
import { FichaAluno } from 'src/core/models/FichaAluno';
import { forkJoin, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { WorkoutExportService } from 'src/core/services/workout-export/workout-export.service';
import { IEmpresa } from 'src/core/models/Empresa';
import { TeamMemberService } from 'src/core/services/instructor/team-member.service';


@Component({
  selector: 'app-ficha-treino-aluno',
  templateUrl: './ficha-treino-aluno.page.html',
  styleUrls: ['./ficha-treino-aluno.page.scss'],
})
export class FichaTreinoAlunoPage implements OnInit {
  Constants = Constants;
  /** Esse atributo refere-se ao Usuario Logado no app */
  user!: IUsuario;
  selectedTreino: any;
  interval: number = 15;
  openModal: boolean = false;
  // treinos: Treino[] = [];
  /** Esse atributo refere-se ao Aluno que tera sua ficha gerenciada pelo adm ou instrutor  */
  // aluno!: Partial<Usuario> | Usuario;
  instrutores: any[] = [];
  fichaAtual!: FichaAluno;
  empresa: Partial<IEmpresa> | IEmpresa | null = null;
  loading: boolean = false;
  form: FormGroup = new FormGroup({});
  enableEdit: boolean = false;
  activeSegment: string = 'atual';
  historySegment: string = 'fichas';
  subs$: Subscription = new Subscription();

  // History Data removed - handled by component
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private modalController: ModalController,
    private aRoute: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private fichaService: FichaAlunoService,
    private treinoService: TreinoService,
    private toastr: ToastrService,
    public workoutState: WorkoutTemplateStateService,
    private exportService: WorkoutExportService,
    private teamMemberService: TeamMemberService,
  ) {
    this.subs$.add(
      this.aRoute.queryParams.subscribe(params => {
        if (params['segment']) {
          this.activeSegment = params['segment'];
        }
      })
    );
    this.subs$.add(
      this.router.events.subscribe({
        next: (ev) => {
          if (ev instanceof NavigationEnd) {
            console.log('entrou no navigationEnd');
            this.checkUserParams();
          }
        },
      })
    );
  }

  checkUserParams() {
    const userId = this.aRoute.snapshot.queryParams['userId'];
    const fichaId = this.aRoute.snapshot.queryParams['fichaId'];

    console.log('checkUserParams', { userId, fichaId });
    if (userId) {
      this.loading = true;
      this.loadFichaData(Number(userId), fichaId ? Number(fichaId) : undefined);
    }
  }

  ngOnInit() {
    this.user = this.auth.getUser;
    console.log('init do ficha aluno!!!', this.aRoute.snapshot);
    this.loading = true;
    this.createForm();
    this.checkUserParams();
    this.loadData();
    this.empresa = this.user.empresa as IEmpresa;
    // this.selectedTreino = this.user.treinos && this.user.treinos[0];
  }

  onTreinoSelected(event: any) {
    this.selectedTreino = event;
    console.log(this.selectedTreino);
    this.router.navigate(['treinar/treino'], {
      queryParams: {
        userId: this.user.id,
        treinoId: this.selectedTreino.id,
      },
    });
  }

  /**
   * The function `loadFichaData` in TypeScript uses `forkJoin` to make parallel requests to `getAluno`
   * and `getFichaInfo`.
   */
  loadFichaData(userId: number, fichaId?: number) {
    console.log('vai carregar a ficha do aluno', userId, fichaId);

    const alunoReq = this.usuarioService.findByFilters({ id: userId });
    const fichaReq = fichaId
      ? this.fichaService.getById(fichaId)
      : this.fichaService.getByUser(userId, { fl_ativo: true });

    forkJoin([alunoReq, fichaReq]).subscribe({
      next: ([usuarios, fichas]: [IUsuario[], FichaAluno[]]) => {
        // Process Aluno
        if (usuarios && usuarios.length > 0) {
          this.aluno?.patchValue({
            id: usuarios[0].id,
            nome: usuarios[0].nome,
          });
        }

        // Process Ficha
        if (fichas && fichas.length > 0) {
          this.fichaAtual = fichas[0];
          this.completeForm(this.fichaAtual);

          if (this.fichaAtual.sessoes) {
            this.workoutState.setWorkout({
              ...this.fichaAtual as any,
              nome: this.fichaAtual.descricao || 'Ficha do Aluno'
            });
          }
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.toastr.error('Erro ao carregar dados do aluno');
        this.loading = false;
      }
    });
  }

  loadData() {
    this.getInstrutores();
  }

  getInstrutores() {
    this.teamMemberService.findByFilters({ empresa_id: this.user.empresa_id as string, status: 'ACTIVE', function_id: Constants.INSTRUTOR_ID }, this.user.empresa_id as string).subscribe({
      next: (instrutores) => {
        this.instrutores = instrutores.map((instrutor) => {
          return {
            id: instrutor.id,
            nome: instrutor.nome,
            genero: instrutor.genero,
            foto_url: instrutor.foto_url,
            tipo_usuario: instrutor.tipo_usuario,
            specialties: instrutor.specialties,
            services: instrutor.services,
            status: instrutor.status,
          };
        }).filter((instrutor) => instrutor.status === 'ACTIVE' && instrutor.tipo_usuario.id === Constants.INSTRUTOR_ID);

        console.log('this.instrutores = ', this.instrutores)

      },
    });
  }


  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    console.log(ev);
    ev.detail.complete();
  }

  get f() {
    return this.form;
  }
  get treinos() {
    return this.f.get('treinos') as FormArray;
  }
  get aluno() {
    return this.f.get('aluno');
  }
  get instrutor() {
    return this.f.get('instrutor');
  }
  get cadastrado_por() {
    return this.f.get('cadastrado_por');
  }

  get isManagerOrInstructor(): boolean {
    return this.user?.tipo_usuario === 3 || this.user?.tipo_usuario === 2;
  }

  createForm() {
    this.form = this.fb.group({
      id: [null, [Validators.nullValidator]],
      created_at: [new Date().toDateString(), [Validators.nullValidator]],
      empresa_id: [this.user?.empresa_id, [Validators.required]],
      usuario_id: [null, [Validators.required]],
      descricao: [null, [Validators.required]],
      ficha_data_inicio: [null, [Validators.required]],
      ficha_data_fim: [null, [Validators.required]],
      objetivo: [null, [Validators.required]],
      team_member_id: [null, [Validators.required]],
      fl_ativo: [true, [Validators.required]],
      peso_inicial: [null, [Validators.nullValidator]],
      peso_meta: [null, [Validators.nullValidator]],
      cadastrado_por: this.fb.group({
        id: [null, [Validators.nullValidator]],
        nome: [null, [Validators.nullValidator]],
      }),
      instrutor: this.fb.group({
        id: [null, [Validators.nullValidator]],
        nome: [null, [Validators.nullValidator]],
      }),
      aluno: this.fb.group({
        id: [null, [Validators.nullValidator]],
        nome: [null, [Validators.nullValidator]],
      }),
      treinos: this.fb.array([]),
    });
  }


  completeForm(ficha: FichaAluno) {
    this.aluno?.patchValue({
      id: ficha.aluno.id,
      nome: ficha.aluno.nome,
    });

    this.instrutor?.patchValue({
      id: (ficha.instrutor as Partial<IUsuario>)?.id,
      nome: (ficha.instrutor as Partial<IUsuario>)?.nome,
    });

    this.cadastrado_por?.patchValue({
      id: (ficha.cadastrado_por as Partial<IUsuario>)?.id,
      nome: (ficha.cadastrado_por as Partial<IUsuario>)?.nome,
    });

    this.f.patchValue({
      id: ficha.id,
      descricao: ficha.descricao,
      ficha_data_inicio: ficha.ficha_data_inicio,
      ficha_data_fim: ficha.ficha_data_fim,
      objetivo: ficha.objetivo,
      instrutor_id: ficha.instrutor_id || (ficha.instrutor as any)?.id,
      peso_inicial: ficha.peso_inicial,
      peso_meta: ficha.peso_meta,
    });

    this.treinos.clear();
    ficha.treinos_cadastrados?.forEach((tr) => {
      this.treinos.setControl(this.treinos.value.length, this.fb.group(tr));
    });

    console.log('this.f: ', this.f);
  }

  async openTreinoList() {
    const { TemplateSelectorModalComponent } = await import('../shared/workout-editor/components/template-selector-modal.component');
    this.modalController.create({
      component: TemplateSelectorModalComponent,
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(res => {
        console.log('res = ', res)

        if (res.data) {
          const selectedTemplate = res.data;
          this.previewAndLoadTemplate(selectedTemplate.id);
        }
      });
    });
  }

  async openStudentImport() {
    const { StudentSelectorModalComponent } = await import('../shared/student-selector/student-selector-modal.component');
    this.modalController.create({
      component: StudentSelectorModalComponent,
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(res => {
        if (res.data) {
          const selectedFicha = res.data;
          // Load sessions/exercises from another student's ficha into the current editor
          this.workoutState.setWorkout({
            ...this.fichaAtual as any,
            nome: selectedFicha.descricao || 'Importado de Aluno',
            sessoes: selectedFicha.sessoes || []
          });
          this.toastr.success('Ficha clonada! Você pode personalizar agora.');
        }
      });
    });
  }

  async previewAndLoadTemplate(treinoId: number) {
    const { WorkoutPreviewModalComponent } = await import('../shared/workout-editor/components/workout-preview-modal.component');
    const modal = await this.modalController.create({
      component: WorkoutPreviewModalComponent,
      componentProps: {
        treinoId,
        aluno: this.aluno?.getRawValue() as unknown as IUsuario
      }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.loading = true;
      this.treinoService.getTreinoCompleto(treinoId).subscribe({
        next: (res: any) => {
          const template = res.data;
          // Load template data into the editor state instead of saving to DB
          this.workoutState.setWorkout({
            ...template,
            id: this.fichaAtual?.id || 0 // Keep current ficha ID if editing
          });
          this.loading = false;
          this.toastr.success('Modelo carregado! Agora você pode personalizar.');
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Erro ao carregar modelo.');
        }
      });
    }
  }


  exportPDF() {
    const workoutData = this.workoutState.getWorkoutValue();
    if (workoutData) {
      this.exportService.exportToPDF(
        workoutData,
        this.aluno?.getRawValue() as unknown as IUsuario,
        this.empresa,
        this.instrutor?.getRawValue() as unknown as IUsuario
      );
    } else {
      this.toastr.warning('Nenhum treino carregado para exportar.');
    }
  }

  exportExcel() {
    const workoutData = this.workoutState.getWorkoutValue();
    if (workoutData) {
      this.exportService.exportToExcel(workoutData);
    } else {
      this.toastr.warning('Nenhum treino carregado para exportar.');
    }
  }

  printThermal() {
    const workoutData = this.workoutState.getWorkoutValue();

    if (workoutData) {
      console.log('workoutData = ', workoutData)
      const activeSection = this.workoutState.getActiveSessionValue();
      console.log('activeSection = ', activeSection)
      this.exportService.printThermal(
        activeSection,
        this.aluno?.getRawValue() as unknown as IUsuario,
        this.empresa,
        this.instrutor?.getRawValue() as unknown as IUsuario
      );
    } else {
      this.toastr.warning('Nenhum treino carregado para exportar.');
    }
  }


  setInterval(e: any) {
    this.interval = e.value;
    console.log(this.interval);
    console.log(this.interval);
  }

  enableRotation(el: any) {
    el.target.style.setProperty('--rotation-duration', `${this.interval}s`);
    el.target.style.setProperty('--color', `warning`);
    el.target.classList.toggle('clock-animated');

    setTimeout(() => { }, this.interval);
  }

  openClock() {
    alert('vai abrir o cronometro!');
  }

  closeClock() { }

  async openTreinoForm() {
    const { TreinoExercicioFormPage } = await import('../treino-exercicio-form/treino-exercicio-form.page');
    this.modalController
      .create({
        component: TreinoExercicioFormPage,
      })
      .then((modal) => {
        modal.present();
      });
  }

  stringfy(_t99: any) {
    return JSON.stringify(_t99);
  }

  submitForm() {
    const workoutData = this.workoutState.getWorkoutValue();
    if (!workoutData) {
      this.toastr.error('Erro ao coletar dados do treino.');
      return;
    }

    console.log('submitting ficha', this.f.value, workoutData);

    if (this.f.value.id && !this.fichaAtual?.fl_ativo) {
      this.toastr.error('Apenas fichas ativas podem ser alteradas. Reative esta ficha para editá-la.');
      return;
    }

    this.loading = true;

    const body: any = {
      ...this.f.value,
      cadastrado_por: this.user.id,
      instrutor_id: this.f.get('instrutor_id')?.value || this.user.id,
      usuario_id: this.aluno?.value.id,
      sessoes: workoutData.sessoes
    };

    // Cleanup redundant fields
    delete body.aluno;
    delete body.instrutor;
    delete body.cadastrado_por;
    delete body.treinos;

    const req = !body.id
      ? this.fichaService.create(body)
      : this.fichaService.update(body);

    req.subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.error) {
          this.toastr.error('Erro ao salvar ficha: ' + (res.error.message || res.error));
          return;
        }

        this.toastr.success('Ficha personalizada salva com sucesso!');

        // If updating own ficha, refresh auth session
        if (this.aluno?.value.id == this.user.id) {
          this.auth.login(this.user.cpf, this.user.data_nascimento).subscribe();
        }

        this.checkUserParams(); // Refresh view
      },
      error: (err) => {
        this.loading = false;
        console.error('erro', err);
        this.toastr.error('Erro crítico ao salvar.');
      },
    });
  }

  removeTreino(id: number) {
    this.treinos.removeAt(
      this.treinos.value.indexOf(
        this.treinos.value.find(
          (tr: { treino: { id: number } }) => tr.treino.id == id
        )
      )
    );
  }

  // History Logic delegated to HistoricoAlunoComponent

  segmentChanged(ev: any) {
    this.activeSegment = ev.detail.value;
  }

  viewFicha(fichaId: number) {
    const userId = Number(this.aRoute.snapshot.queryParamMap.get('userId'));
    this.activeSegment = 'atual';
    this.router.navigate([], {
      relativeTo: this.aRoute,
      queryParams: { userId, fichaId },
      queryParamsHandling: 'merge'
    });
  }

  reactivateFicha(ficha: any) {
    if (!this.isManagerOrInstructor) return;

    // We basically do an "Update" on this ficha but as a new one
    // The current update logic in the service handles creating a new record
    const body = { ...ficha };
    delete body.id;
    delete body.created_at;
    delete body.updated_at;
    body.fl_ativo = true;

    this.fichaService.create(body).subscribe({
      next: (res: any) => {
        this.toastr.success('Ficha reativada como versão atual!');
        this.viewFicha(res.id);
      },
      error: () => this.toastr.error('Erro ao reativar ficha.')
    });
  }

  ngOnDestroy() {
    console.log('destruindo ficha-treino-aluno...');
    this.workoutState.setWorkout(null);
    this.form.reset();
    this.aluno?.reset();
    this.instrutor?.reset();
    this.treinos.reset();
    this.cadastrado_por?.reset();
    this.subs$.unsubscribe();
  }
}
