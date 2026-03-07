import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, tap, throwError } from 'rxjs';
import {
  MaskitoOptions,
  MaskitoElementPredicate,
  maskitoTransform,
} from '@maskito/core';
import { Maskito } from '@maskito/core';

import Constants from 'src/core/Constants';

import { IUsuario } from 'src/core/models/Usuario';
import { TipoUsuario } from 'src/core/models/TipoUsuario';
import { Horario } from 'src/core/models/Horario';

import { TipoUsuarioService } from 'src/core/services/tipo-usuario/tipoUsuario.service';
import { PlanoService } from 'src/core/services/plano/plano.service';
import { HorarioService } from 'src/core/services/horario/horario.service';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/core/services/auth/auth.service';
import { Plano } from 'src/core/models/Empresa';

@Component({
  selector: 'app-pessoa-form',
  templateUrl: './pessoa-form.page.html',
  styleUrls: ['./pessoa-form.page.scss'],
})
export class PessoaFormPage implements OnInit {
  loading: boolean = false;
  Constants = Constants
  phoneMask: MaskitoOptions = Constants.phoneMask
  cpfMask: MaskitoOptions = Constants.cpfMask
  alturaMask: MaskitoOptions = Constants.alturaMask
  pesoMask: MaskitoOptions = Constants.pesoMask

  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as unknown as HTMLIonInputElement).getInputElement();
  planos: Plano[] = [];
  horarios: Horario[] = [];
  /** Tipo de usuario selecionado no form */
  @Input({ required: true }) tipoUsuarioForm!: TipoUsuario;

  tiposUsuario: TipoUsuario[] = [];

  onFormChange($event: Event) {
    // console.log($event);
    // console.log(this.form);
  }
  form: FormGroup = new FormGroup({});
  // temDoenca: boolean = false;
  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private tipoUsuarioService: TipoUsuarioService,
    private planoService: PlanoService,
    private horarioService: HorarioService,
    private aRoute: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) { }
  user!: IUsuario
  ngOnInit() {
    this.user = this.auth.getUser;
    console.log('this.user: ', this.user);


    console.log(
      'this.aRoute.snapshotdata : ',
      this.aRoute.snapshot.data
    );

    this.createForm();
    this.loadData();
    console.log('tiposUsuario = ', this.tiposUsuario)

    if (this.aRoute.snapshot.queryParams['userId']) {
      this.getUserInfo(this.aRoute.snapshot.queryParams['userId']);
    }


  }

  getUserInfo(id: any) {
    this.usuarioService.findByFilters({ id: id }).subscribe({
      next: (data: IUsuario[]) => {
        this.form.patchValue(data[0]);
        this.calcIMC()
        // console.log(this.form.value);
      },
    });
  }

  loadData() {
    forkJoin([
      this.getTipoUsuarioList(),
      this.getActiveHorarios(),
      this.getActivePlans(),
    ]).subscribe({
      next: (result) => {
        console.log('tipoUsuario, horarios, planos: ', result);

      },
      error: (err) => {
        this.loading = false;

        throwError(err);
      },
    });
  }

  getActivePlans() {
    return this.planoService.findByFilters({ fl_ativo: true, empresa_id: this.user?.empresa?.id }).subscribe({
      next: (planos: Plano[]) => {
        this.planos = planos;
      },
      error: (err) => {
        this.loading = false;

        console.error(err);
        throwError(err);
      },
    });
  }

  getActiveHorarios() {
    return this.horarioService.findByFilters({ fl_ativo: true, empresa_id: this.user?.empresa?.id }).subscribe({
      next: (horarios: Horario[]) => {
        this.horarios = horarios;
      },
      error: (err) => {
        this.loading = false;

        console.error(err);
        throwError(err);
      },
    });
  }

  getTipoUsuarioList() {
    this.loading = true;
    return this.tipoUsuarioService.findAll().subscribe({
      next: (res: TipoUsuario[]) => {
        if (res) this.tiposUsuario = res;
        this.tipoUsuarioForm = this.tiposUsuario.find(t => t.id == this.aRoute.snapshot.data['tipoUsuario']) as TipoUsuario;
        console.log(' this.tipoUsuarioForm = ', this.tipoUsuarioForm)
        this.form.get('tipo_usuario')?.setValue(this.tipoUsuarioForm.id)
        this.form.get('tipo_usuario')?.disable()
      },
      error: (err) => {
        this.loading = false;


        // this.aRoute.data.subscribe({
        //   next: (data: any) => {
        //     console.log('💻🔍🪲 - data', data);


        //     if (!data) return;
        //     this.tipoUsuarioForm = this.tiposUsuario.find(t => t.id == data.tipoUsuario) as TipoUsuario;
        //     console.log('💻🔍🪲 - this.tipoUsuarioForm ', this.tipoUsuarioForm);


        //     this.form.get('tipo_usuario')?.setValue(data.tipoUsuario)
        //     // this.form.get('tipo_usuario')?.disable()

        //     console.log(this.form)
        //   }
        // })
        throwError(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  imcIdeal = 0;
  rcqIdeal: number = 0;
  calcIMC() {
    // console.log(
    //   'calculando imc ideal',
    //   Number(this.form.value.peso),
    //   Number(this.form.value.altura)
    // );
    this.imcIdeal =
      Number(this.form.value.peso) /
      Math.pow(Number(this.form.value.altura), 2);
    this.imcIdeal = Number(this.imcIdeal.toFixed(2));
    // console.log(this.imcIdeal);
  }
  calcRCQ() {
    // console.log('calculando rcq ideal');
    this.imcIdeal = Number(
      (this.form.value.peso / Math.pow(this.form.value.peso, 2)).toFixed(2)
    );
    // console.log(this.imcIdeal);
  }

  createForm() {
    this.form = this.fb.group({
      id: [null, [Validators.nullValidator]],
      nome: ['', [Validators.required]],
      email: ['', [Validators.email]],
      data_nascimento: null,
      tipo_usuario: [
        null,
        [Validators.required],
      ],
      genero: ['', [Validators.required]],
      peso: [
        null,
        [
          Number(this.aRoute.snapshot.params['id']) == Constants.ALUNO_ID
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      altura: [
        null,
        [
          Number(this.aRoute.snapshot.params['id']) == Constants.ALUNO_ID
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      cpf: [null, [Validators.required]],
      plano: [
        null,
        [
          Number(this.aRoute.snapshot.params['id']) == Constants.ALUNO_ID
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      horario_id: [
        null,
        [
          Number(this.aRoute.snapshot.params['id']) == Constants.ALUNO_ID
            ? Validators.required
            : Validators.nullValidator,
        ],
      ],
      whatsapp: ['', [Validators.required]],
      doencas: ['', [Validators.nullValidator]],
      objetivo: [null, [Validators.nullValidator]],
      tipo_alimentacao: [null, [Validators.nullValidator]],
      senha: [null, [Validators.nullValidator]],
      rcq: [null, [Validators.nullValidator]],
      imc: [null, [Validators.nullValidator]],
      flagAdmin: [null, [Validators.required]],
      fl_ativo: [true, [Validators.required]],
      foto_url: ['', [Validators.nullValidator]],
      avc: [null, [Validators.nullValidator]],
      dac: [null, [Validators.nullValidator]],
      diabete: [null, [Validators.nullValidator]],
      pressao_arterial: [null, [Validators.nullValidator]],
      cardiopata: [null, [Validators.nullValidator]],
      cirurgia: [null, [Validators.nullValidator]],
      infarto: [null, [Validators.nullValidator]],
      fumante: [null, [Validators.nullValidator]],
      relato_dor: [null, [Validators.nullValidator]],
      medicacao_em_uso: [null, [Validators.nullValidator]],
      profissao: [null, [Validators.nullValidator]],
      fl_pratica_atividade_fisica: [null, [Validators.nullValidator]],
      data_vencimento: [null, [Validators.nullValidator]],
      created_at: [null, [Validators.nullValidator]],
      classificacao_risco: [1, [Validators.nullValidator]],
      observacoes: ['', [Validators.nullValidator]],
      empresa_id: [this.user.empresa_id, [Validators.nullValidator]],
      cref: [null, [Validators.nullValidator]],
      especialidade: [null, [Validators.nullValidator]],
      turno: [null, [Validators.nullValidator]],
      funcao: [null, [Validators.nullValidator]],
    });
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }

  onChangeTipoUser() {
    const newValue = this.form.value.tipo_usuario;
    this.form.patchValue({
      flagAdmin: this.tiposUsuario.find((tu) => tu.id == newValue)
        ?.adm_padrao,
    });

    if (newValue === Constants.ALUNO_ID) {
      this.form.controls['plano'].setValidators(Validators.required);
      this.form.controls['horario_id'].setValidators(Validators.required);
    } else {
      this.form.controls['plano'].clearValidators();
      this.form.controls['horario_id'].clearValidators();
    }

    if (newValue === Constants.INSTRUTOR_ID) {
      this.form.controls['cref'].setValidators(Validators.required);
      this.form.controls['especialidade'].setValidators(Validators.required);
    } else {
      this.form.controls['cref'].clearValidators();
      this.form.controls['especialidade'].clearValidators();
    }

    this.form.get('horario_id')?.updateValueAndValidity();
    this.form.get('plano')?.updateValueAndValidity();
    this.form.get('cref')?.updateValueAndValidity();
    this.form.get('especialidade')?.updateValueAndValidity();
  }

  submitForm() {
    // console.log('this.form: ', this.form);

    this.loading = true;

    const msg = !this.form.value.id ? 'cadastrado' : 'atualizado';
    const req = !this.form.value.id
      ? this.usuarioService.create(this.form.value)
      : this.usuarioService.update(this.form.value);

    this.form.disable();
    req.subscribe({
      next: (res: any) => {
        // console.log('ok');
        this.toastr.success(`Usuário ${msg} com sucesso!`);
        this.form.enable();
        if (!this.form.value.id) {
          this.createForm();
        } else {
          this.router.navigateByUrl('admin/membros')
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.form.enable();
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }


  ngOnDestroy() {
    console.log('destruindo pessoa-form...')
    this.form.reset();
  }
}
