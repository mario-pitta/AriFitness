import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Exercicio } from 'src/core/models/Exercicio';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, IonInfiniteScroll } from '@ionic/angular';
import { ExercicioDetailComponent } from './components/exercicio-detail/exercicio-detail.component';
import { ExercicioFormComponent } from './exercicio-form/exercicio-form.component';
import { Subscription, forkJoin } from 'rxjs';
import { GrupoMuscularService } from 'src/core/services/grupo-muscular/grupo-muscular.service';
import { MusculoService } from 'src/core/services/musculo/musculo.service';
import { ParteDoCorpoService } from 'src/core/services/parte-do-corpo/parte-do-corpo.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ITeamMember, IUsuario } from 'src/core/models/Usuario';

@Component({
  selector: 'app-exercicios',
  templateUrl: './exercicios.page.html',
  styleUrls: ['./exercicios.page.scss'],
})
export class ExerciciosPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  searchText: string = '';
  loading: boolean = false;
  exercicios: Exercicio[] | any[] = [];

  offset = 0;
  limit = 20;
  canLoadMore = true;

  // Filter options
  niveis: any[] = [];
  gruposMusculares: any[] = [];
  musculos: any[] = [];
  partesDoCorpo: any[] = [];

  showFilters = false;
  selectedFilters: any = {
    nivel_id: null,
    grupo_muscular_id: null,
    musculo_id: null,
    parte_do_corpo_id: null,
    origem: 'todos' // 'todos' | 'meus' | 'globais'
  };

  user!: IUsuario | ITeamMember;

  private exerciseSub!: Subscription;
  public placeholderUrl = 'https://ionicframework.com/docs/img/demos/card-media.png'; // Fallback base

  constructor(
    private exercicioService: ExercicioService,
    private grupoMuscularService: GrupoMuscularService,
    private musculoService: MusculoService,
    private parteDoCorpoService: ParteDoCorpoService,
    private modalCtrl: ModalController,
    private aRoute: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  /** Exercícios podem ser editados pelo usuário logado se pertencerem à sua academia */
  canEdit(ex: Exercicio): boolean {
    const empresaId = this.authService.getUser?.empresa_id;
    return !!ex.empresa_id && ex.empresa_id === empresaId;
  }

  isOficial(ex: Exercicio): boolean {
    return !ex.empresa_id;
  }

  ngOnInit() {
    this.user = this.authService.getUser;
    this.exerciseSub = this.exercicioService.exercicios$.subscribe((ex) => {
      this.exercicios = ex;
    });


  }

  ngAfterViewInit() {
    this.loadFilterOptions();

    const queryParams = this.aRoute.snapshot.queryParams;

    // Se cache estiver vazio, busca do zero. Senão, mantém o que tem.
    if (this.exercicioService.getCache().length === 0) {
      this.getExercicios(queryParams, true);
    } else {
      this.offset = this.exercicioService.getCache().length;
    }
  }

  loadFilterOptions() {
    forkJoin({
      niveis: this.exercicioService.getNiveis(),
      grupos: this.grupoMuscularService.findAll(),
      musculos: this.musculoService.find(),
      partes: this.parteDoCorpoService.findAll()
    }).subscribe({
      next: (res: any) => {
        this.niveis = res.niveis;
        this.gruposMusculares = res.grupos;
        this.musculos = res.musculos;
        this.partesDoCorpo = res.partes;
      }
    });
  }

  applyFilters() {
    this.getExercicios({
      ...this.selectedFilters,
      nome: this.searchText
    }, true);
  }

  clearFilters() {
    this.selectedFilters = {
      nivel_id: null,
      grupo_muscular_id: null,
      musculo_id: null,
      parte_do_corpo_id: null,
      origem: 'todos'
    };
    this.searchText = '';
    this.applyFilters();
  }

  getExercicios(filters?: any, reset = false) {
    if (reset) {
      this.offset = 0;
      this.canLoadMore = true;
      this.loading = true;
      this.exercicioService.clearCache();
    }

    if (filters) {
      delete filters.origem;
    }

    const searchFilters: any = {
      ...filters,
      fl_ativo: true,
      limit: this.limit,
      offset: this.offset,
    };

    // Apply origin logic
    if (this.selectedFilters.origem === 'meus') {
      searchFilters.empresa_id = this.user.empresa_id;
    } else if (this.selectedFilters.origem === 'globais') {
      searchFilters.empresa_id = 'oficial'; // ou 'null', pois o backend agora trata ambos
    } else {
      delete searchFilters.empresa_id;
    }

    this.exercicioService.find(searchFilters).subscribe({
      next: (ex: Exercicio[]) => {
        if (ex.length < this.limit) {
          this.canLoadMore = false;
        }
        this.offset += ex.length;
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
      },
      error: () => {
        this.loading = false;
        if (this.infiniteScroll) {
          this.infiniteScroll.complete();
        }
      },
      complete: () => (this.loading = false),
    });
  }

  loadData(event: any) {
    if (this.canLoadMore) {
      this.getExercicios({
        ...this.selectedFilters,
        nome: this.searchText
      }, false);
    } else {
      event.target.complete();
    }
  }

  async openDetail(exercicio: Exercicio, editMode: boolean = false) {
    const modal = await this.modalCtrl.create({
      component: ExercicioDetailComponent,
      componentProps: {
        exercicio,
        editMode // Pass edit mode preference
      },
      cssClass: 'exercise-detail-modal'
    });
    return await modal.present();
  }

  async openEdit(event: Event, exercicio: Exercicio) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: ExercicioFormComponent,
      componentProps: { exId: exercicio.id },
      cssClass: 'exercise-form-modal'
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      console.log('this.selectedFilters = ', this.selectedFilters)

      this.getExercicios(this.selectedFilters, true);
    }
  }

  onImgError(event: any) {
    event.target.src = this.placeholderUrl;
  }

  toggleMedia(event: Event, exercicio: any) {
    event.stopPropagation(); // Evita abrir o modal ao clicar na imagem
    if (exercicio.midias_url && exercicio.midias_url.length > 1) {
      if (exercicio._currentIdx === undefined) exercicio._currentIdx = 0;
      exercicio._currentIdx = (exercicio._currentIdx + 1) % exercicio.midias_url.length;
    }
  }

  getDisplayMedia(ex: any) {
    if (ex.midias_url && ex.midias_url.length > 0) {
      return ex.midias_url[ex._currentIdx || 0];
    }
    return ex.midia_url || this.placeholderUrl;
  }

  ngOnDestroy(): void {
    if (this.exerciseSub) {
      this.exerciseSub.unsubscribe();
    }
  }
}
