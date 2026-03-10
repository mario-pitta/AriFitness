import Constants from 'src/core/Constants';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { ItemReorderEventDetail, ModalController } from '@ionic/angular';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { TreinoExercicioFormPage } from '../treino-exercicio-form/treino-exercicio-form.page';
import { TreinosListPage } from '../treino-list/treino-list.page';
import { Treino } from 'src/core/models/Treino';
import { WorkoutPreviewModalComponent } from '../shared/workout-editor/components/workout-preview-modal.component';

import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { FichaAlunoService } from 'src/core/services/ficha-aluno/ficha-aluno.service';
import { FichaAluno } from 'src/core/models/FichaAluno';
import { forkJoin, Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

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
  instrutores: IUsuario[] = [];
  fichaAtual!: FichaAluno;
  loading: boolean = false;
  form: FormGroup = new FormGroup({});
  enableEdit: boolean = false;
  subs$: Subscription = new Subscription();
  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private modalController: ModalController,
    private aRoute: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private fichaService: FichaAlunoService,
    private toastr: ToastrService
  ) {
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
    const param = this.aRoute.snapshot.queryParams['userId'];

    console.log('qual param', param);
    if (param) {
      this.loadFichaData(
        Number(this.aRoute.snapshot.queryParamMap.get('userId'))
      );

      console.log('pathFromRoot', this.aRoute.snapshot.pathFromRoot);
    }
  }

  ngOnInit() {
    this.user = this.auth.getUser;
    console.log('init do ficha aluno!!!', this.aRoute.snapshot);
    this.createForm();
    this.checkUserParams();
    this.loadData();
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
  loadFichaData(userId: number) {
    console.log('vai carregar a ficha do aluno', userId);
    this.getAluno(userId);
    this.getFichaInfo();
  }

  loadData() {
    this.getInstrutores();
  }

  getInstrutores() {
    this.usuarioService
      .findByFilters({ tipo_usuario: Constants.INSTRUTOR_ID, fl_ativo: true, empresa_id: this.user?.empresa_id })
      .subscribe({
        next: (instrutores) => {
          this.instrutores = instrutores;
        },
      });
  }

  getFichaInfo() {
    this.fichaService
      .getByUser(Number(this.aRoute.snapshot.queryParamMap.get('userId')), {
        fl_ativo: true,
      })
      .subscribe({
        next: (data: FichaAluno[]) => {
          if (data.length) {
            this.fichaAtual = data[0];
            this.completeForm(this.fichaAtual);
          }
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

  createForm() {
    this.form = this.fb.group({
      id: [null, [Validators.nullValidator]],
      created_at: [new Date().toDateString(), [Validators.nullValidator]],
      usuario_id: [null, [Validators.nullValidator]],
      descricao: [null, [Validators.nullValidator]],
      ficha_data_inicio: [null, [Validators.nullValidator]],
      ficha_data_fim: [null, [Validators.nullValidator]],
      objetivo: [null, [Validators.nullValidator]],
      instrutor_id: [null, [Validators.nullValidator]],
      fl_ativo: [true, [Validators.nullValidator]],
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

  getAluno(id: number) {
    this.usuarioService.findByFilters({ id: id }).subscribe({
      next: (_usuario) => {
        this.aluno?.patchValue({
          id: _usuario[0].id,
          nome: _usuario[0].nome,
        });
      },
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
      peso_inicial: ficha.peso_inicial,
      peso_meta: ficha.peso_meta,
    });

    this.treinos.clear();
    ficha.treinos_cadastrados?.forEach((tr) => {
      this.treinos.setControl(this.treinos.value.length, this.fb.group(tr));
    });

    console.log('this.f: ', this.f);
  }

  openTreinoList() {
    this.modalController.create({
      component: TreinosListPage,
      componentProps: { enableEdit: false, gridMode: true, enableSelect: true }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(res => {
        if (res.data && res.data.treinos && res.data.treinos.length > 0) {
          const selectedTreino = res.data.treinos[0];
          this.previewAndApplyTemplate(selectedTreino.id);
        }
      });
    });
  }

  async previewAndApplyTemplate(treinoId: number) {
    const modal = await this.modalController.create({
      component: WorkoutPreviewModalComponent,
      componentProps: { treinoId }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data === true) {
      this.loading = true;
      this.fichaService.applyTemplate(this.fichaAtual.id!, treinoId).subscribe({
        next: () => {
          this.loading = false;
          this.toastr.success('Treino aplicado com sucesso!');
          this.getFichaInfo(); // Refetch to show new sessions/exercises
        },
        error: () => {
          this.loading = false;
          this.toastr.error('Erro ao aplicar treino.');
        }
      });
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

  openTreinoForm() {
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
    console.log('submitting ficha', this.f.value);
    this.loading = true;

    const body = {
      ...this.f.value,
      cadastrado_por: this.user.id,
      instrutor_id: this.instrutor?.value.id,
      usuario_id: this.aluno?.value.id,
      treinos: this.treinos.value.map((t: any) => {
        return {
          id: t.treino.id,
        };
      }),
    };

    delete body.aluno;
    delete body.instrutor;

    const req = !body.id
      ? this.fichaService.create(body)
      : this.fichaService.update(body);

    req.subscribe({
      next: (res) => {
        this.toastr.success('Operação bem sucedida');
        if (this.aluno?.value.id == this.user.id) {
          this.auth.login(this.user.cpf, this.user.data_nascimento).subscribe();
        }

        this.ngOnInit();
      },
      error: (err) => {
        console.error('erro', err);
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

  ngOnDestroy() {
    console.log('destruindo ficha-treino-aluno...');
    this.form.reset();
    this.aluno?.reset();
    this.instrutor?.reset();
    this.treinos.reset();
    this.cadastrado_por?.reset();
    this.subs$.unsubscribe();
  }
}
