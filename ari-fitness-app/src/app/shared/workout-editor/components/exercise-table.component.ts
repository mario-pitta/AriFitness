import { Component, OnInit } from '@angular/core';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { ExerciseStateService } from 'src/core/services/treino/state/exercise-state.service';
import { TreinoSessao } from 'src/core/models/TreinoSessao';
import { TreinoExercicio } from 'src/core/models/TreinoExercicio';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalController } from '@ionic/angular';
import { ExerciseSelectorModalComponent } from './exercise-selector-modal.component';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Exercicio } from 'src/core/models/Exercicio';

@Component({
    selector: 'app-exercise-table',
    templateUrl: './exercise-table.component.html',
    styleUrls: ['./exercise-table.component.scss']
})
export class ExerciseTableComponent implements OnInit {
    activeSession: TreinoSessao | null = null;
    exercicios: TreinoExercicio[] = [];

    // Autocomplete State
    allExercises: Exercicio[] = [];
    filteredExercises: Exercicio[] = [];
    activeSearchRow: number | null = null;
    searchTerm: string = '';

    constructor(
        private workoutState: WorkoutTemplateStateService,
        private exerciseState: ExerciseStateService,
        private modalController: ModalController,
        private exercicioService: ExercicioService
    ) { }

    ngOnInit() {
        this.workoutState.activeSession$.subscribe(session => {
            this.activeSession = session;
            this.exercicios = session?.exercicios || [];
        });

        this.exercicioService.find().subscribe(res => {
            if (res) this.allExercises = res;
        });
    }

    drop(event: CdkDragDrop<TreinoExercicio[]>) {
        moveItemInArray(this.exercicios, event.previousIndex, event.currentIndex);
        // Update order based on new positions
        this.exercicios.forEach((ex, i) => ex.ordem = i + 1);
        this.exerciseState.reorderExercisesInActiveSession(this.exercicios);
    }

    async addExercise() {
        const newEx: TreinoExercicio | any = {
            exercicio_id: null,
            exercicio: null,
            sessao_id: this.activeSession?.id,
            series: 3,
            repeticoes: 12,
            carga: 0,
            intervalo: 60,
            ordem: this.exercicios.length + 1,
            tipo_execucao: 1, // Normal
            tipo_progressao: 1 // Normal
        };
        this.exerciseState.addExerciseToActiveSession(newEx);

        // Auto-focus immediately on the new exercise
        setTimeout(() => {
            this.onSearchFocus(this.exercicios.length - 1, '');
        }, 100);
    }

    removeExercise(index: number) {
        this.exerciseState.removeExerciseFromActiveSession(index);
    }

    updateExercise(index: number, updated: TreinoExercicio) {
        this.exerciseState.updateExerciseInActiveSession(index, updated);
    }

    // --- Autocomplete Methods ---

    isDropdownVisible = false;
    dropdownStyle: any = { display: 'none', zIndex: 99999 };

    onSearchFocus(index: number, currentName: string = '', event?: any) {
        this.activeSearchRow = index;
        this.searchTerm = currentName;
        this.filterExercises();

        if (event && event.target) {
            this.updateDropdownPosition(event.target);
        }
    }

    updateDropdownPosition(element: any) {
        const rect = element.getBoundingClientRect();
        this.dropdownStyle = {
            top: `${rect.bottom + 5}px`,
            left: `${rect.left}px`,
            width: `${Math.max(rect.width, 250)}px`
        };
        this.isDropdownVisible = true;
    }

    onSearchBlur() {
        // Delay to allow click on dropdown to be processed first
        setTimeout(() => {
            this.isDropdownVisible = false;
            this.activeSearchRow = null;
        }, 200);
    }

    onSearchChange(event: any, index: number) {
        this.activeSearchRow = index;
        this.searchTerm = event.target.value;
        this.filterExercises();

        if (event && event.target) {
            this.updateDropdownPosition(event.target);
        }
    }

    filterExercises() {
        if (!this.searchTerm) {
            this.filteredExercises = this.allExercises.slice(0, 50);
            return;
        }

        const term = this.searchTerm.toLowerCase();
        this.filteredExercises = this.allExercises.filter(ex =>
            ex.nome.toLowerCase().includes(term) ||
            ex.equipamento?.nome?.toLowerCase().includes(term)
        ).slice(0, 50);
    }

    selectExercise(index: number, ex: TreinoExercicio, selectedExercise: Exercicio) {
        ex.exercicio_id = selectedExercise.id || 0;
        ex.exercicio = selectedExercise;
        this.isDropdownVisible = false;
        this.activeSearchRow = null;
        this.updateExercise(index, ex);
    }
}
