import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Exercicio } from 'src/core/models/Exercicio';

@Component({
    selector: 'app-exercicio-detail',
    templateUrl: './exercicio-detail.component.html',
    styleUrls: ['./exercicio-detail.component.scss'],
})
export class ExercicioDetailComponent implements OnInit {
    @Input() exercicio!: Exercicio;
    currentImageIndex = 0;

    constructor(private modalCtrl: ModalController) { }

    ngOnInit() {
        console.log('Exercício no detalhe:', this.exercicio);
    }

    dismiss() {
        this.modalCtrl.dismiss();
    }

    nextImage() {
        if (this.exercicio.midias_url && this.exercicio.midias_url.length > 1) {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.exercicio.midias_url.length;
        }
    }

    get currentMedia() {
        if (this.exercicio.midias_url && this.exercicio.midias_url.length > 0) {
            return this.exercicio.midias_url[this.currentImageIndex];
        }
        return this.exercicio.midia_url || 'assets/images/placeholder-exercise.png';
    }
}
