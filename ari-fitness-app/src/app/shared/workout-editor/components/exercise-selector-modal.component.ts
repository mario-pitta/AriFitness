
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Exercicio } from 'src/core/models/Exercicio';

@Component({
    selector: 'app-exercise-selector-modal',
    templateUrl: './exercise-selector-modal.component.html',
    styleUrls: ['./exercise-selector-modal.component.scss']
})
export class ExerciseSelectorModalComponent implements OnInit {
    exerciciosLibrary: Exercicio[] = [];
    filteredExercises: Exercicio[] = [];
    searchText: string = '';
    loading: boolean = true;

    constructor(
        private modalController: ModalController,
        private exercicioService: ExercicioService
    ) { }

    ngOnInit() {
        this.exercicioService.find().subscribe(res => {
            this.exerciciosLibrary = res;
            this.filteredExercises = res;
            this.loading = false;
        });
    }

    filterExercises() {
        if (!this.searchText) {
            this.filteredExercises = this.exerciciosLibrary;
            return;
        }
        const text = this.searchText.toLowerCase();
        this.filteredExercises = this.exerciciosLibrary.filter(ex =>
            ex.nome?.toLowerCase().includes(text) ||
            ex.grupo_muscular?.nome?.toLowerCase().includes(text)
        );
    }

    selectExercise(exercicio: Exercicio) {
        this.modalController.dismiss(exercicio);
    }

    dismiss() {
        this.modalController.dismiss();
    }
}

