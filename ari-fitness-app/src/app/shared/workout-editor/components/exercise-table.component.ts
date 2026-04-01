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
import { PageSizeService } from 'src/core/services/page-size/page-size.service';

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
    hoveredEx: any = null;

    constructor(
        private workoutState: WorkoutTemplateStateService,
        private exerciseState: ExerciseStateService,
        private modalController: ModalController,
        private exercicioService: ExercicioService,
        public pageSize: PageSizeService
    ) { }

    ngOnInit() {
        this.workoutState.activeSession$.subscribe(session => {
            this.activeSession = session;
            this.exercicios = (session?.exercicios || []).map(ex => {
                if (ex.exercicio) {
                    let midias = ex.exercicio.midias_url;
                    if (typeof midias === 'string') {
                        try { midias = JSON.parse(midias); } catch { midias = []; }
                    }
                    const midiasArray = Array.isArray(midias) ? midias : [];
                    ex.exercicio.img_url = ex.exercicio.img_url || ex.exercicio.midia_url || (midiasArray.length ? midiasArray[0] : undefined);
                    ex.exercicio.midias_url = midiasArray;
                }
                return ex;
            });
        });

        this.exercicioService.find().subscribe(res => {
            if (res) {
                this.allExercises = res.map(ex => {
                    let midias = ex.midias_url;
                    if (typeof midias === 'string') {
                        try { midias = JSON.parse(midias); } catch { midias = []; }
                    }
                    const midiasArray = Array.isArray(midias) ? midias : [];
                    return {
                        ...ex,
                        midias_url: midiasArray,
                        img_url: ex.img_url || ex.midia_url || (midiasArray.length ? midiasArray[0] : undefined)
                    };
                });
            }
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
    isAbove = false;

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
        const dropdownMaxHeight = 300;
        const padding = 5;
        const windowHeight = window.innerHeight;

        const spaceBelow = windowHeight - rect.bottom - padding;
        const spaceAbove = rect.top - padding;

        // If there isn't enough space below, and there's more space above, open upwards
        this.isAbove = spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

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

    private slideshowInterval: any;
    private touchTimeout: any;
    hoveredStyles: { [key: string]: any } = {};

    handleTouchStart(event: any, ex: any) {
        if (!this.pageSize.getSize().isMobile) return;

        this.touchTimeout = setTimeout(() => {
            this.startSlideshow(event, ex, true);
        }, 450);
    }

    handleTouchEnd(ex: any) {
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
        this.stopSlideshow(ex);
    }

    startSlideshow(event: any, ex: any, isLongPress: boolean = false) {
        if (!isLongPress && this.pageSize.getSize().isMobile) return;

        this.hoveredEx = ex;
        console.log('ex = ', ex)

        if (!ex.midias_url || ex.midias_url.length <= 1) {
            this.setHoverPosition(event);
        }

        let currentIndex = 0;
        this.slideshowInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % ex.midias_url.length;
            ex.img_url = ex.midias_url[currentIndex];
        }, 1200);

        this.setHoverPosition(event);
    }

    private setHoverPosition(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();

        this.hoveredStyles = {
            'position': 'fixed',
            'top': `${rect.top}px`,
            'left': `${rect.left}px`,
            'width': `${rect.width}px`,
            'height': `${rect.height}px`,
            'z-index': '9999999',
            'pointer-events': 'none',
            'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            'transform-origin': 'center center'
        };
    }

    stopSlideshow(ex?: any) {
        this.hoveredEx = null;
        this.hoveredStyles = {};
        if (this.slideshowInterval) {
            clearInterval(this.slideshowInterval);
            this.slideshowInterval = null;
        }
        // Restaurar para a imagem original
        ex.img_url = ex.midia_url || (ex.midias_url?.length ? ex.midias_url[0] : null) || ex.img_url;
    }

    ngOnDestroy() {
        if (this.slideshowInterval) clearInterval(this.slideshowInterval);
    }
}
