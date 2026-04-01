import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { ModalController } from '@ionic/angular';

import { Exercicio } from 'src/core/models/Exercicio';
import { Equipamento } from 'src/core/models/Equipamento';
import { GrupoMuscular } from 'src/core/models/GrupoMuscular';
import { Musculo } from 'src/core/models/Musculo';

import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { EquipamentoService } from 'src/core/services/equipamento/equipamento.service';
import { GrupoMuscularService } from 'src/core/services/grupo-muscular/grupo-muscular.service';
import { MusculoService } from 'src/core/services/musculo/musculo.service';
import { PagetitleService } from 'src/core/services/pagetitle.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

@Component({
  selector: 'app-exercicio-form',
  templateUrl: './exercicio-form.component.html',
  styleUrls: ['./exercicio-form.component.scss'],
})
export class ExercicioFormComponent implements OnInit, OnDestroy {
  @Input() exId: number | null = null; // ID for modal usage

  form!: FormGroup;
  loading: any = false;
  private aRoute = inject(ActivatedRoute);
  private subs$ = new Subscription();

  musculos$!: Observable<Musculo[]>;
  gruposMusculares$!: Observable<GrupoMuscular[]>;
  equipamentos$!: Observable<Equipamento[]>;

  constructor(
    private fb: FormBuilder,
    private musculoService: MusculoService,
    private gpMuscularService: GrupoMuscularService,
    private exerService: ExercicioService,
    private toastr: ToastrService,
    private equipamentoService: EquipamentoService,
    private page: PagetitleService,
    private router: Router,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.createForm();
    this.loadData();

    // Check for ID from Input (Modal) or ActiveRoute (Page)
    const id = this.exId || this.aRoute.snapshot.queryParams['exId'];
    if (id) {
      this.getById(Number(id));
    }
  }

  ngOnDestroy() {
    this.subs$.unsubscribe();
  }

  loadData() {
    this.getMusculos();
    this.getGruposMusculares();
    this.getEquipamentos();
  }

  createForm() {
    this.form = this.fb.group({
      id: [null],
      nome: [null, [Validators.required]],
      fl_ativo: [true, [Validators.required]],
      midia_url: [null],
      grupo_muscular_id: [null],
      musculo_id: [null],
      equipamento_id: [null],
    });
  }

  getMusculos() {
    this.musculos$ = this.musculoService.find({ fl_ativo: true });
  }

  getGruposMusculares() {
    this.gruposMusculares$ = this.gpMuscularService.findAll({ fl_ativo: true });
  }

  getEquipamentos() {
    this.equipamentos$ = this.equipamentoService.find({ fl_ativo: true });
  }


  filterMusculos() {
    const grupoId = this.form.get('grupo_muscular_id')?.value;
    if (!grupoId) {
      this.musculos$ = of([]);
      return;
    }
    this.musculos$ = this.musculoService.find({ grupo_muscular_id: grupoId, fl_ativo: true });
  }

  getById(id: number) {
    this.form.disable();
    this.loading = true;
    this.exerService.findById(id).subscribe({
      next: (ex: any) => {
        // FindById should return an array if coming from generic find with ID filter
        // Or a single object if updated to be more specific. Let's handle both.
        const data = Array.isArray(ex) ? ex[0] : ex;
        if (data) {
          this.form.patchValue(data);
        }
      },
      complete: () => {
        this.form.enable();
        this.loading = false;
      },
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (this.form.invalid) {
      this.toastr.warning('Preencha os campos obrigatórios');
      return;
    }

    this.loading = true;
    this.exerService.save(this.form.value).subscribe({
      next: (r: any) => {
        this.toastr.success('Salvo com sucesso');
        this.modalCtrl.dismiss(r);
      },
      error: (er: any) => {
        this.toastr.error('Erro ao salvar');
        console.error(er);
      },
      complete: () => (this.loading = false),
    });
  }
}
