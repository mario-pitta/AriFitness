import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { Treino } from 'src/core/models/Treino';
import { Observable } from 'rxjs';
import { AuthService } from 'src/core/services/auth/auth.service';
import { CanComponentDeactivate } from 'src/core/guards/pending-changes.guard';

@Component({
    selector: 'app-treino-editor',
    templateUrl: './treino-editor.page.html',
    styleUrls: ['./treino-editor.page.scss'],
})
export class TreinoEditorPage implements OnInit, CanComponentDeactivate {
    loading: boolean = false;
    isWorkoutValid$: Observable<boolean> = this.workoutState.isValid$;
    private isSaved = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private workoutState: WorkoutTemplateStateService,
        private treinoService: TreinoService,
        private toastr: ToastrService,
        private auth: AuthService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') {
            this.loadTreino(parseInt(id));
        } else {
            // If we already have a workout in state (e.g. from import), don't reset it
            const current = this.workoutState.getWorkoutValue();
            if (current && (current as any).isImporting) {
                // Keep the imported data
            } else {
                this.initNewTreino();
            }
        }
    }

    loadTreino(id: number) {
        this.loading = true;
        this.treinoService.getTreinoCompleto(id).subscribe({
            next: (res: any) => {
                this.workoutState.setWorkout(res.data);
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Erro ao carregar treino');
                this.router.navigate(['/admin/treinos']);
            }
        });
    }

    initNewTreino() {
        const user = this.auth.getUser;
        const newWorkout: Treino = {
            id: 0,
            nome: '',
            descricao: '',
            exercicios: [],
            sessoes: [],
            nivel_dificuldade: 1,
            empresa_id: user.empresa_id || '',
            fl_ativo: true,
            fl_publico: true
        };
        this.workoutState.setWorkout(newWorkout);
    }

    submitForm() {
        const workout = this.workoutState.getWorkoutValue();
        if (!workout) return;

        const req = (!workout.id || workout.id === 0)
            ? this.treinoService.create(workout)
            : this.treinoService.update(workout);

        this.loading = true;
        req.subscribe({
            next: () => {
                this.isSaved = true;
                this.loading = false;
                this.toastr.success('Treino salvo com sucesso!');
                this.goBack();
            },
            error: () => {
                this.loading = false;
                this.toastr.error('Erro ao salvar treino');
            }
        });
    }

    goBack() {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/treinos';
        this.router.navigate([returnUrl]);
    }

    canDeactivate(): boolean {
        if (!this.isSaved) {
            return confirm('Você tem alterações não salvas. Deseja realmente sair?');
        }
        return true;
    }
}
