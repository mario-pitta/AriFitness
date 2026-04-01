
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { Exercicio } from 'src/core/models/Exercicio';
import { PageSizeService } from 'src/core/services/page-size/page-size.service';

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
    hoveredEx: any = null;

    constructor(
        private modalController: ModalController,
        private exercicioService: ExercicioService,
        public pageSize: PageSizeService
    ) { }

    ngOnInit() {
        this.exercicioService.find().subscribe(res => {
            this.exerciciosLibrary = res?.map(ex => {
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
            }) || [];
            this.filteredExercises = this.exerciciosLibrary;
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

    private slideshowInterval: any;
    private touchTimeout: any;
    hoveredStyles: { [key: string]: any } = {};

    handleTouchStart(event: any, ex: any) {
        if (!this.pageSize.getSize().isMobile) return;

        this.touchTimeout = setTimeout(() => {
            this.startSlideshow(event, ex, true);
        }, 450);
    }

    handleTouchEnd() {
        if (this.touchTimeout) {
            clearTimeout(this.touchTimeout);
            this.touchTimeout = null;
        }
        this.stopSlideshow();
    }

    startSlideshow(event: any, ex: any, isLongPress: boolean = false) {
        if (!isLongPress && this.pageSize.getSize().isMobile) return;

        this.hoveredEx = ex;
        if (!ex.midias_url || ex.midias_url.length <= 1) {
            // Se não houver slideshow, ainda calculamos a posição para o zoom fixo
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

    dismiss() {
        if (this.slideshowInterval) clearInterval(this.slideshowInterval);
        this.modalController.dismiss();
    }
}

