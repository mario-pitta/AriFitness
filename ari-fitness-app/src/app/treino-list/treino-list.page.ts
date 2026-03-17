import { FichaAlunoService } from './../../core/services/ficha-aluno/ficha-aluno.service';
import { Router } from '@angular/router';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';

import { Treino } from 'src/core/models/Treino';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { forkJoin, Subscription } from 'rxjs';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-treinos-list',
  templateUrl: './treino-list.page.html',
  styleUrls: ['./treino-list.page.scss'],
})
export class TreinosListPage implements OnInit {
  @Input() selectedTreinos: any[] = [];
  filteredTreinos: Treino[] = [];
  user!: IUsuario;
  @Input() aluno!: IUsuario | any;
  loading: boolean = false;
  treinos: Treino[] = [];
  searchText: string = '';
  sub$: Subscription = new Subscription();
  @Input() enableEdit: boolean = true;
  @Input() enableSelect: boolean = false;
  isWorkoutValid$: Observable<boolean> = this.workoutState.isValid$;

  constructor(
    private aRoute: ActivatedRoute,
    private auth: AuthService,
    private modalController: ModalController,
    private treinoService: TreinoService,
    private toastr: ToastrService,
    private alertController: AlertController,
    private workoutState: WorkoutTemplateStateService,
    private router: Router
  ) { }


  ngOnInit() {
    this.user = this.auth.getUser;
    this.loadData();
  }

  loadData() {
    console.log('loading treinos, list page...');
    this.getTreinos();
  }

  getTreinos() {
    return this.treinoService.find({
      fl_ativo: true,
      empresa_id: this.user.empresa_id
    }).subscribe({
      next: (treinos: Treino[]) => {
        this.filteredTreinos = this.treinos = treinos;

        console.log(
          'treinos selecionados...',
          this.selectedTreinos,
          this.filteredTreinos
        );

        this.filteredTreinos = this.filteredTreinos.map((ftr: Treino) => {
          if (
            this.selectedTreinos.find((str: any) => str.treino.id === ftr.id)
          ) {
            ftr.checked = true;
            console.log('TEM QUE PRINTAR ISSO !!!');
          }
          return ftr;
        });

        console.log('depois de filtrados...', this.filteredTreinos);

        return this.filteredTreinos;
      },
    });
  }



  @Input({ required: true }) gridMode: boolean = true;
  openTreinoEditor(treino: Treino) {
    this.router.navigate(['admin/treinos/treino-editor', treino.id]);
  }

  addNewTreino() {
    this.router.navigate(['admin/treinos/treino-editor', 'new']);
  }

  goToImportacao() {
    this.router.navigate(['admin/treinos/importacao']);
  }


  listenItemEvents(event: { action: string; value: any }) {
    console.log(event);
    switch (event.action) {
      case 'check':
        console.log('checando treino: ', event.value.id);
        this.treinos.map((tr) => {
          if (tr.id == event.value.id) {
            tr = {
              ...tr,
              checked: !tr.checked || false,
            };
          }
          return tr;
        });
        this.filterList();
        break;
      case 'edit':
        console.log('💻🔍🪲 - edit', event);


        this.openTreinoEditor(event.value)
        break;
      case 'loading':
        this.loading = event.value;
        break;
      case 'reload':
        this.ngOnInit();
        break;

      default:
        break;
    }
  }









  onSelectTreino() { }

  associateToUser() {
    const body = {
      aluno_id: this.aRoute.snapshot.queryParams['userId'],
      treinos: this.filteredTreinos.filter((tr) => tr.checked),
    };
    this.modalController.dismiss(body);
  }





  async excluirTreino(id: number) {
    const alert = await this.alertController.create({
      header: 'Excluir Treino',
      message: 'Tem certeza que deseja excluir esse treino?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          },
        },
        {
          text: 'Excluir',
          handler: () => {
            console.log('Confirm Okay');
            this.treinoService.delete(id).subscribe({
              next: () => {
                this.getTreinos();
              },
            });
          },
        },
      ],
    });

    await alert.present();
  }

  filterList() {
    this.filteredTreinos = this.treinos.filter((tr) =>
      tr.nome.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  ngOnDestroy() {
    this.gridMode = false;
    this.sub$.unsubscribe();
  }
}
