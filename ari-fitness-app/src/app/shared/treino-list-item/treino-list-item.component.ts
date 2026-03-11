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

  ngOnInit() { }


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
