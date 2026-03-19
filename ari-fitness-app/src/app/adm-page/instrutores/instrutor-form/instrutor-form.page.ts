import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { TeamMemberService } from 'src/core/services/instructor/team-member.service';
import { SpecialtyService } from 'src/core/services/specialty/specialty.service';
import { GymServiceService } from 'src/core/services/service/service.service';
import { IUsuario, Usuario } from 'src/core/models/Usuario';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { TipoUsuarioService } from 'src/core/services/tipo-usuario/tipoUsuario.service';
import Constants from 'src/core/Constants';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';

@Component({
  selector: 'app-instrutor-form',
  templateUrl: './instrutor-form.page.html',
  styleUrls: ['./instrutor-form.page.scss'],
})
export class InstrutorFormPage implements OnInit {
  form!: FormGroup;
  loading = false;
  isEdit = false;
  instructorId: string | null = null;
  userId: string | null = null;
  user!: IUsuario;

  specialtiesList: any[] = [];
  servicesList: any[] = [];
  rolesList: any[] = [];

  phoneMask: MaskitoOptions = Constants.phoneMask;
  cpfMask: MaskitoOptions = Constants.cpfMask;
  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as unknown as HTMLIonInputElement).getInputElement();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private auth: AuthService,
    private teamMemberService: TeamMemberService,
    private specialtyService: SpecialtyService,
    private gymService: GymServiceService,
    private usuarioService: UsuarioService,
    private tipoUsuarioService: TipoUsuarioService
  ) { }

  ngOnInit() {
    this.user = this.auth.getUser;
    this.initForm();
    this.loadLists();

    this.route.queryParams.subscribe(params => {
      if (params['memberId']) {
        this.isEdit = true;
        this.instructorId = params['memberId'];
        if (this.instructorId) {
          this.loadInstructorData(this.instructorId);
        }
      }
    });
  }

  initForm() {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required]],
      whatsapp: ['', [Validators.required]],
      genero: ['', [Validators.required]],
      foto_url: [''],
      status: ['ACTIVE', [Validators.required]],
      function_id: [null, [Validators.required]],
      ctps: [''],
      cref: [''],
      password: [''],
      specialties: [[]],
      services: [[]],
      // Schedule & Salary
      dias_horas_trabalho: [[]],
      salario: [null]
    });

    // Toggle specialties validation based on function_id
    this.form.get('function_id')?.valueChanges.subscribe(val => {
      const specCtrl = this.form.get('specialties');
      if (val === Constants.INSTRUTOR_ID) {
        specCtrl?.setValidators([Validators.required]);
      } else {
        specCtrl?.clearValidators();
      }
      specCtrl?.updateValueAndValidity();
    });
  }

  loadLists() {
    this.specialtyService.findAll().subscribe(res => this.specialtiesList = res);
    if (this.user.empresa_id) {
      this.gymService.findAll(this.user.empresa_id).subscribe(res => this.servicesList = res);
    }
    this.tipoUsuarioService.findAll().subscribe(res => {
      // Filter out 'ALUNO' (id 5) as this is for team members
      this.rolesList = res.filter(r => r.id !== Constants.ALUNO_ID && r.id !== 6);
    });
  }

  loadInstructorData(memberId: string) {
    this.loading = true;
    this.teamMemberService.findOne(memberId, this.user.empresa_id as string).subscribe({
      next: (inst) => {
        if (inst) {
          this.instructorId = inst.id;
          this.form.patchValue({
            nome: inst.nome,
            cpf: inst.cpf,
            whatsapp: inst.telefone || inst.whatsapp,
            genero: inst.genero || inst.usuario?.genero,
            foto_url: inst.foto_url,
            status: inst.status,
            function_id: inst.function_id,
            ctps: inst.ctps,
            cref: inst.cref,
            password: inst.password,
            specialties: inst.specialties?.map((s: any) => s.id) || [],
            services: inst.services?.map((s: any) => s.id) || [],
            dias_horas_trabalho: inst.dias_horas_trabalho || [],
            salario: inst.salario ?? null
          });
        }
      },
      error: () => this.loading = false,
      complete: () => this.loading = false
    });
  }

  async submitForm() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Preencha os campos obrigatórios corretamente.');
      return;
    }

    this.loading = true;
    const val = this.form.value;

    const instData = {
      empresa_id: this.user.empresa_id,
      nome: val.nome,
      telefone: val.whatsapp,
      foto_url: val.foto_url,
      status: val.status,
      function_id: val.function_id,
      ctps: val.ctps,
      cref: val.cref,
      password: val.password,
      cpf: val.cpf,
      genero: val.genero,
      specialties: val.function_id === Constants.INSTRUTOR_ID ? val.specialties : [],
      services: val.function_id === Constants.INSTRUTOR_ID ? val.services : [],
      dias_horas_trabalho: val.dias_horas_trabalho || [],
      salario: val.salario ?? null
    };

    try {
      if (this.isEdit && this.instructorId) {
        await this.teamMemberService.update(this.instructorId, this.user.empresa_id as string, instData).toPromise();
      } else {
        await this.teamMemberService.create(instData).toPromise();
      }

      this.toastr.success(`Membro da equipe ${this.isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`);
      this.router.navigate(['/admin/equipe']);
    } catch (err) {
      console.error(err);
      this.toastr.error('Erro ao salvar o membro da equipe.');
    } finally {
      this.loading = false;
    }
  }

  async deleteInstructor() {
    if (!this.instructorId) return;
    if (!confirm('Deseja realmente excluir este membro da equipe?')) return;

    this.loading = true;
    try {
      await this.teamMemberService.remove(this.instructorId, this.user.empresa_id as string).toPromise();
      this.toastr.success('Membro removido com sucesso!');
      this.router.navigate(['/admin/equipe']);
    } catch (err) {
      console.error(err);
      this.toastr.error('Erro ao excluir o membro da equipe.');
    } finally {
      this.loading = false;
    }
  }

  get isInstructor(): boolean {
    return this.form.get('function_id')?.value === Constants.INSTRUTOR_ID;
  }

  // ─── Schedule helpers ───────────────────────────────────────────────
  readonly diasSemana = [
    { key: 'seg', label: 'Seg' }, { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' }, { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' }, { key: 'sab', label: 'Sáb' },
    { key: 'dom', label: 'Dom' },
  ];

  get turnos(): { dia: string; inicio: number; saida: number }[] {
    return this.form.get('dias_horas_trabalho')?.value || [];
  }

  addTurno() {
    const current = [...this.turnos];
    current.push({ dia: 'seg', inicio: 8, saida: 17 });
    this.form.get('dias_horas_trabalho')?.setValue(current);
  }

  removeTurno(index: number) {
    const current = [...this.turnos];
    current.splice(index, 1);
    this.form.get('dias_horas_trabalho')?.setValue(current);
  }

  updateTurno(index: number, field: 'dia' | 'inicio' | 'saida', value: any) {
    const current = [...this.turnos];
    current[index] = { ...current[index], [field]: field === 'dia' ? value : Number(value) };
    this.form.get('dias_horas_trabalho')?.setValue(current);
  }
}
