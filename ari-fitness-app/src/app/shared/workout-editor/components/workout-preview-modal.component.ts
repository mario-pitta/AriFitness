
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Treino } from 'src/core/models/Treino';
import { TreinoService } from 'src/core/services/treino/treino.service';

@Component({
    selector: 'app-workout-preview-modal',
    templateUrl: './workout-preview-modal.component.html',
    styleUrls: ['./workout-preview-modal.component.scss']
})
export class WorkoutPreviewModalComponent implements OnInit {
    @Input() treinoId!: number;
    treino: Treino | null = null;
    loading: boolean = true;

    constructor(
        private modalController: ModalController,
        private treinoService: TreinoService
    ) { }

    ngOnInit() {
        this.treinoService.getTreinoCompleto(this.treinoId).subscribe(
            {
                next: (res: any) => {
                    this.treino = res.data;
                    this.loading = false;
                    console.log(' this.treino = ', this.treino)
                },
                error: err => {
                    console.error(err)
                }

            },
        );
    }

    confirm() {
        this.modalController.dismiss(true);
    }

    dismiss() {
        this.modalController.dismiss(false);
    }
}
