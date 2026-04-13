import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaskitoElementPredicate } from '@maskito/core';
import Constants from 'src/core/Constants';
import { Empresa, Horario, IService, Plano } from 'src/core/models/Empresa';
import { Horario as HorarioModel } from 'src/core/models/Horario';

import { AuthService } from 'src/core/services/auth/auth.service';
import { EmpresaService } from 'src/core/services/empresa/empresa.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

interface DefaultService {
  id: string;
  nome: string;
  checked: boolean;
}

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.page.html',
  styleUrls: ['./empresa.page.scss'],
})
export class EmpresaPage implements OnInit {
  DEFAULT_SERVICES: IService[] = [];
  cnpjMask = Constants.cnpjMask;
  telefoneMask = Constants.phoneMask;
  loading: boolean = false;
  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as unknown as HTMLIonInputElement).getInputElement();

  empresaForm!: FormGroup;

  get f() {
    return this.empresaForm;
  }
  get planos() {
    return this.f.get('planos') as FormArray;
  }

  get horarios() {
    return this.f.get('horarios') as FormArray;
  }

  get servicos() {
    return this.f.get('servicos') as FormArray;
  }

  defaultServices: DefaultService[] = [];
  customServices: IService[] = [];

  constructor(
    private empresaService: EmpresaService,
    private auth: AuthService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  isCustomService(index: number): boolean {
    const serviceControl = this.servicos.at(index);
    if (!serviceControl) return true;

    const nome = serviceControl.get('nome')?.value?.toLowerCase();
    if (!nome) return true;

    return !this.DEFAULT_SERVICES.some(ds => ds.nome?.toLowerCase() === nome);
  }

  ngOnInit() {
    console.log('iniciando empresa..');
    this.createForm();
    this.loadDefaultServices();
    const empresaId = this.auth.getUser?.empresa_id;
    if (!empresaId) return;
    this.getEmpresaData(empresaId);
  }

  loadDefaultServices() {
    this.empresaService.getDefaultServices().subscribe({
      next: (res) => {
        this.DEFAULT_SERVICES = res;
        this.defaultServices = res.map((s: any) => ({
          id: s.id,
          nome: s.nome,
          checked: false
        }));

        // Se os dados da empresa já foram carregados, sincroniza os serviços
        const servicosAtuais = this.servicos.getRawValue();
        if (servicosAtuais.length > 0) {
          this.syncServices(servicosAtuais);
        }
      }
    });
  }

  createForm() {
    this.empresaForm = this.fb.group({
      id: [null, Validators.nullValidator],
      cnpj: [null, Validators.required],
      nome: [null, Validators.required],
      nome_fantasia: [null, Validators.required],
      telefone: [null, Validators.required],
      email: [null, Validators.required],
      logo_url: [null, Validators.nullValidator],
      banner_url: [null, Validators.nullValidator],
      horarios: this.fb.array(
        [],
        [Validators.required, Validators.minLength(1)]
      ),
      planos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      servicos: this.fb.array([]),
      default_theme: ['dark', Validators.nullValidator],
      primary_color_hex: ['#4d8dff', Validators.nullValidator],
      created_at: [null, Validators.nullValidator],
      deleted_at: [null, Validators.nullValidator],
      updated_at: [null, Validators.nullValidator],
      accept_pix: [true, Validators.required],
      accept_credit_card: [true, Validators.required],
      accept_debit_card: [true, Validators.required],
      accept_money_in_cash: [true, Validators.required],
      pgmto_credito_max_parcelas: [
        1,
        [Validators.nullValidator, Validators.min(1)],
      ],
      chave_pix: [null, Validators.nullValidator],
      openai_key: [{ value: null, disabled: true }, Validators.nullValidator],
      meta_key: [{ value: null, disabled: true }, Validators.nullValidator],
    });
  }

  getEmpresaData(empresaId: string) {
    this.empresaService.getEmpresa(empresaId).subscribe({
      next: (res) => {
        console.log(res);
        this.completeForm(res);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  completeForm(empresa: Empresa) {
    this.empresaForm.patchValue(empresa);

    if (empresa.planos) {
      empresa.planos.forEach(plano => {
        this.addPlano(plano);
      });
    }

    if (empresa.horarios) {
      empresa.horarios.forEach(horario => {
        this.addHorario(horario);
      });
    }

    if (empresa.servicos) {
      this.syncServices(empresa.servicos);
    }
  }

  // #region Services
  syncServices(apiServices: IService[]) {
    console.log('apiServices = ', apiServices)

    // Marcar serviços default que já existem na API
    this.defaultServices.forEach(ds => {
      ds.checked = apiServices.some(as => as.nome.toLowerCase() === ds.nome.toLowerCase() && as.ativo);
    });

    // Identificar serviços customizados (que não estão na lista default)
    this.customServices = apiServices.filter(as =>
      !this.DEFAULT_SERVICES.some(ds => ds.nome.toLowerCase() === as.nome.toLowerCase())
    );

    // Adicionar todos os serviços ao FormArray
    this.servicos.clear();
    apiServices.forEach(s => this.addServiceToForm(s));
  }

  toggleDefaultService(serviceName: string, ev: any) {
    const checked = ev.detail.checked;
    const index = this.defaultServices.findIndex(ds => ds.nome === serviceName);
    if (index > -1) {
      this.defaultServices[index].checked = checked;
    }

    if (checked) {
      this.addServiceToForm({ default_service_id: this.defaultServices[index].id, nome: serviceName, ativo: true });
    } else {
      this.removeServiceByName(serviceName);
    }
  }

  addCustomService() {
    this.addServiceToForm({ nome: '', ativo: true });
  }

  addServiceToForm(service: Partial<IService>) {
    console.log('service = ', service)

    this.servicos.push(
      this.fb.group({
        default_service_id: [service.default_service_id || null],
        nome: [service.nome || '', Validators.required],
        descricao: [service.descricao || ''],
        ativo: [service.ativo ?? true],
        empresa_id: [this.auth.getUser?.empresa_id]
      })
    );
  }

  removeServiceByName(name: string) {
    const index = this.servicos.controls.findIndex(c => c.get('nome')?.value === name);
    if (index > -1) {
      this.servicos.removeAt(index);
    }
  }

  removeService(index: number) {
    const serviceName = this.servicos.at(index).get('nome')?.value;
    const dsIndex = this.defaultServices.findIndex(ds => ds.nome === serviceName);
    if (dsIndex > -1) {
      this.defaultServices[dsIndex].checked = false;
    }
    this.servicos.removeAt(index);
  }
  //#endregion

  //#region Planos
  addPlano(plano?: Plano) {
    console.log(this.f);
    console.log('this.planos: ', this.planos);

    // if(!this.planos) this.f.get('planos')?.setValue(this.fb.array([]));

    this.planos.push(
      new FormGroup({
        id: new FormControl(plano?.id || null, [Validators.nullValidator]),
        created_at: new FormControl(plano?.created_at || null, [
          Validators.nullValidator,
        ]),
        descricao: new FormControl(plano?.descricao || null, [Validators.required]),
        preco_padrao: new FormControl(plano?.preco_padrao || null, [
          Validators.required,
        ]),
        fl_ativo: new FormControl(plano?.fl_ativo || true, [
          Validators.required,
        ]),
        qtd_dias_semana: new FormControl(plano?.qtd_dias_semana || 7, [
          Validators.required,
        ]),
        caracteristicas: new FormControl(plano?.caracteristicas || null, [
          Validators.nullValidator,
        ]),
      })
    );
  }
  removePlano(index: number) {
    this.planos.removeAt(index);
  }

  //#endregion

  //#region Horarios
  addHorario(horario?: HorarioModel) {
    // if(!this.horarios) this.f.get('horarios')?.setValue(this.fb.array([]));

    this.horarios.push(
      new FormGroup({
        id: new FormControl(horario?.id || null, [Validators.nullValidator]),
        created_at: new FormControl(horario?.created_at || null, [
          Validators.nullValidator,
        ]),
        hora_inicio: new FormControl(horario?.hora_inicio || null, [
          Validators.required,
        ]),
        hora_fim: new FormControl(horario?.hora_fim || null, [
          Validators.required,
        ]),
        fl_ativo: new FormControl(horario?.fl_ativo || true, [
          Validators.required,
        ]),
        empresa_id: new FormControl(horario?.empresa_id || this.auth.getUser?.empresa_id, [
          Validators.required
        ])
      })
    );
  }
  removeHorario(index: number) {
    this.horarios.removeAt(index);
  }

  //#endregion


  //#region ImageHandler

  validateImage(file: File) {
    if (file.type.startsWith('image/')) {
      return true;
    } else {
      alert('Apenas imagens são permitidas');
      return false;
    }
  }
  onLogoChange($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];
    console.log('file: ', file);

    if (file && this.validateImage(file)) {
      const reader = new FileReader();

      reader.onload = (result) => {
        this.empresaForm
          .get('logo_url')
          ?.setValue(result.target?.result as string);
      };

      reader.readAsDataURL(file);
    } else {
      this.empresaForm.get('logo_url')?.setValue(null);
      return;
    }
  }

  onBannerChange($event: Event) {
    const file = ($event.target as HTMLInputElement).files?.[0];
    if (file && this.validateImage(file)) {
      const reader = new FileReader();

      reader.onload = (result) => {
        this.empresaForm
          .get('banner_url')
          ?.setValue(result.target?.result as string);
      };

      reader.readAsDataURL(file);
    } else {
      this.empresaForm.get('banner_url')?.setValue(null);
      return;
    }
  }
  //#endregion

  //#region submit handler
  onSaveButtonClick() {
    console.log(this.f);
    const req = this.f.value.id
      ? this.empresaService.updateEmpresa(this.f.value)
      : this.empresaService.createEmpresa(this.f.value);

    req.subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.toastr.success('Empresa salva com sucesso!');

      },
      error: (err) => {
        console.error(err);
      },
    });
  }
}
