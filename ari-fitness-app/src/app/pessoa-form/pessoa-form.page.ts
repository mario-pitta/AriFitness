import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MaskitoOptions,
  MaskitoElementPredicate,
} from '@maskito/core';

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
import { SpecialtyService } from 'src/core/services/specialty/specialty.service';
import { GymServiceService } from 'src/core/services/service/service.service';
import { TeamMemberService } from 'src/core/services/instructor/team-member.service';

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

  specialtiesList: any[] = [];
  servicesList: any[] = [];
  instructorId: string | null = null;

  onFormChange($event: Event) {
    console.log($event);
    console.log(this.form);
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
    private auth: AuthService,
    private specialtyService: SpecialtyService,
    private gymService: GymServiceService,
    private teamMemberService: TeamMemberService
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
        if (data && data[0]) {
          this.form.patchValue(data[0]);
          this.calcIMC()
        }
      },
    });
  }


  loadData() {
    this.getTipoUsuarioList();
    this.getActiveHorarios();
    this.getActivePlans();
    this.getSpecialties();
    this.getServices();
  }

  getSpecialties() {
    this.specialtyService.findAll().subscribe({
      next: (res) => this.specialtiesList = res,
    });
  }

  getServices() {
    const empresa_id = this.user?.empresa_id as string;
    if (empresa_id) {
      this.gymService.findAll(empresa_id).subscribe({
        next: (res) => this.servicesList = res,
      });
    }
  }

  getActivePlans() {
    this.planoService.findByFilters({ fl_ativo: true, empresa_id: this.user?.empresa_id }).subscribe({
      next: (planos: Plano[]) => {
        this.planos = planos;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      },
    });
  }

  getActiveHorarios() {
    this.horarioService.findByFilters({ fl_ativo: true, empresa_id: this.user?.empresa_id }).subscribe({
      next: (horarios: Horario[]) => {
        this.horarios = horarios;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      },
    });
  }

  getTipoUsuarioList() {
    this.loading = true;
    this.tipoUsuarioService.findAll().subscribe({
      next: (res: TipoUsuario[]) => {
        if (res) this.tiposUsuario = res;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  imcIdeal = 0;
  rcqIdeal: number = 0;
  calcIMC() {
    this.imcIdeal =
      Number(this.form.value.peso) /
      Math.pow(Number(this.form.value.altura), 2);
    this.imcIdeal = Number(this.imcIdeal.toFixed(2));
  }
  calcRCQ() {
    this.imcIdeal = Number(
      (this.form.value.peso / Math.pow(this.form.value.peso, 2)).toFixed(2)
    );
  }

  createForm() {
    this.form = this.fb.group({
      id: [null, [Validators.nullValidator]],
      nome: ['', [Validators.required]],
      email: ['', [Validators.email]],
      data_nascimento: null,
      tipo_usuario: [Constants.ALUNO_ID, [Validators.required]],
      genero: ['', [Validators.required]],
      peso: [null, [Validators.required]],
      altura: [null, [Validators.required]],
      cpf: [null, [Validators.required]],
      plano: [null, [Validators.required]],
      horario_id: [null, [Validators.required]],
      whatsapp: ['', [Validators.required]],
      doencas: ['', [Validators.nullValidator]],
      objetivo: [null, [Validators.nullValidator]],
      tipo_alimentacao: [null, [Validators.nullValidator]],
      senha: [null, [Validators.nullValidator]],
      rcq: [null, [Validators.nullValidator]],
      imc: [null, [Validators.nullValidator]],
      flagAdmin: [false, [Validators.required]],
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
      empresa_id: [this.user.empresa_id ?? null, [Validators.nullValidator]],
    });
  }

  customCounterFormatter(inputLength: number, maxLength: number) {
    return `${maxLength - inputLength} characters remaining`;
  }



  submitForm() {
    this.loading = true;
    const rawValue = this.form.getRawValue();
    const isNew = !rawValue.id && !this.instructorId;
    const msg = isNew ? 'cadastrado' : 'atualizado';
    const tipoId = this.tipoUsuarioForm?.id || rawValue.tipo_usuario;

    // Qualquer um que não seja Aluno é considerado Membro da Equipe para esse fluxo
    // Usamos Number() para garantir comparação numérica robusta
    const isTeamMember = Number(tipoId) !== Constants.ALUNO_ID;

    if (isTeamMember) {
      const teamMemberData = {
        empresa_id: this.user.empresa_id,
        nome: rawValue.nome,
        telefone: rawValue.whatsapp,
        foto_url: rawValue.foto_url,
        status: rawValue.status_instrutor || 'ACTIVE',
        specialties: rawValue.specialties,
        services: rawValue.services,
        function_id: tipoId,
        cpf: rawValue.cpf,
        genero: rawValue.genero,
        password: rawValue.senha
      };

      const request = this.instructorId ?
        this.teamMemberService.update(this.instructorId, this.user.empresa_id as string, teamMemberData) :
        this.teamMemberService.create(teamMemberData);

      this.form.disable();
      request.subscribe({
        next: () => this.finishSubmit(msg, isNew, tipoId),
        error: (err) => {
          this.loading = false;
          this.form.enable();
          console.error(err);
          this.toastr.error('Erro ao salvar dados do membro da equipe');
        }
      });
    } else {
      this.form.disable();
      const req = isNew ? this.usuarioService.create(rawValue) : this.usuarioService.update(rawValue);
      req.subscribe({
        next: () => this.finishSubmit(msg, isNew, tipoId),
        error: (err: any) => {
          this.loading = false;
          this.form.enable();
          console.error(err);
          this.toastr.error('Erro ao salvar usuário');
        }
      });
    }
  }

  finishSubmit(msg: string, isNew: boolean, tipoId: any) {
    this.toastr.success(`Usuário ${msg} com sucesso!`);
    this.form.enable();
    if (isNew) {
      this.createForm();
    } else {
      if (tipoId === Constants.ALUNO_ID) {
        this.router.navigateByUrl('admin/membros');
      } else {
        this.router.navigateByUrl('admin/equipe');
      }
    }
  }

  ngOnDestroy() {
    this.form.reset();
  }
}
