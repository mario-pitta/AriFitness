import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Treino } from 'src/core/models/Treino';
import { Usuario } from 'src/core/models/Usuario';
import { TreinoService } from 'src/core/services/treino/treino.service';

@Component({
  selector: 'app-treino-list-item',
  templateUrl: './treino-list-item.component.html',
  styleUrls: ['./treino-list-item.component.scss'],
})
export class TreinoListItemComponent implements OnInit {
  @Input() treino!: Treino | any;
  @Input() user!: Usuario | any;
  @Input() enableEdit!: boolean;
  @Input() enableSelect!: boolean;
  @Output() output: EventEmitter<any> = new EventEmitter();
  constructor(private treinoService: TreinoService, private alertController: AlertController) { }

  ngOnInit() {

    console.log('treino = ', this.treino)
    if (this.treino) this.customizeTreino(this.treino)

  }

  customizeTreino(treino: Treino) {
    const _treino = {
      ...treino,
      label: this.getTreinoLabel(treino.nivel_dificuldade),
      color: this.getTreinoColor(treino.nivel_dificuldade),
      class: this.getTreinoClass(treino.nivel_dificuldade)
    }
    this.treino = _treino;
  }

  getTreinoLabel(nivel: number) {
    switch (nivel) {
      case 1: return 'Iniciante';
      case 2: return 'Intermediário';
      case 3: return 'Avançado';
      case 4: return 'Elite';
      default: return '-';
    }
  }

  getTreinoColor(nivel: number) {
    switch (nivel) {
      case 1: return 'success';
      case 2: return 'info';
      case 3: return 'warning';
      case 4: return 'danger';
      default: return '-';
    }
  }

  getTreinoClass(nivel: number) {
    switch (nivel) {
      case 1: return ' bg-success text-light';
      case 2: return ' bg-info text-light';
      case 3: return ' bg-warning text-light';
      case 4: return ' bg-danger text-light';
      default: return '-';
    }
  }

  async deleteTreino(id: number) {

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
                this.output.emit({ action: 'reload', value: true });
              },
              error: (err) => console.error(err)
            });
          },
        },
      ],
    });

    await alert.present();



  }


}
