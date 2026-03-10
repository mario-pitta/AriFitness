
import { Component, OnInit } from '@angular/core';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { Treino } from 'src/core/models/Treino';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ParteDoCorpoService } from 'src/core/services/parte-do-corpo/parte-do-corpo.service';
import { GrupoMuscularService } from 'src/core/services/grupo-muscular/grupo-muscular.service';
import { ParteDoCorpo } from 'src/core/models/ParteDoCorpo';
import { GrupoMuscular } from 'src/core/models/GrupoMuscular';

@Component({
    selector: 'app-workout-header',
    templateUrl: './workout-header.component.html',
    styleUrls: ['./workout-header.component.scss']
})
export class WorkoutHeaderComponent implements OnInit {
    form: FormGroup;
    partesDoCorpo: ParteDoCorpo[] = [];
    gruposMusculares: GrupoMuscular[] = [];

    constructor(
        private fb: FormBuilder,
        private workoutState: WorkoutTemplateStateService,
        private parteDoCorpoService: ParteDoCorpoService,
        private grupoMuscularService: GrupoMuscularService
    ) {
        this.form = this.fb.group({
            nome: ['', [Validators.required]],
            descricao: [''],
            nivel_dificuldade: [''],
            grupo_muscular_id: [null],
            parte_do_corpo_id: [null],
            fl_publico: [true]
        });
    }

    ngOnInit() {
        this.workoutState.workout$.subscribe(workout => {
            if (workout) {
                this.form.patchValue(workout, { emitEvent: false });
            }
        });

        this.form.valueChanges.subscribe(value => {
            this.workoutState.updateWorkout(value);
        });

        this.loadMetadata();
    }

    loadMetadata() {
        this.parteDoCorpoService.findAll().subscribe(res => this.partesDoCorpo = res);
        this.grupoMuscularService.findAll().subscribe(res => this.gruposMusculares = res);
    }
}
