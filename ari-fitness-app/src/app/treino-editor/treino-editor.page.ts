import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingController, ModalController, NavController } from '@ionic/angular';
import { Treino } from 'src/core/models/Treino';
import { AuthService } from 'src/core/services/auth/auth.service';
import { TreinoService } from 'src/core/services/treino/treino.service';
import { WorkoutTemplateStateService } from 'src/core/services/treino/state/workout-template-state.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

@Component({
    selector: 'app-treino-editor',
    templateUrl: './treino-editor.page.html',
})
export class TreinoEditorPage implements OnInit, OnDestroy {
    loading = false;
    user: any;

    get isWorkoutValid$() {
        return this.workoutState.isValid$;
    }

    constructor(
        public workoutState: WorkoutTemplateStateService,
        private treinoService: TreinoService,
        private auth: AuthService,
        private navCtrl: NavController,
        private loadingCtrl: LoadingController,
        private route: ActivatedRoute,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.user = this.auth.getUser;
        const id = this.route.snapshot.paramMap.get('id');

        if (id && id !== '0') {
            this.loadTreino(Number(id));
        } else {
            this.initNewTreino();
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
                this.toastr.error('Erro ao carregar treino');
                this.loading = false;
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
            sessoes: [
                { nome: 'A', ordem: 1, exercicios: [] }
            ],
            fl_ativo: true,
            fl_publico: true,
            empresa_id: user.empresa_id as string,
            nivel_dificuldade: 1
        };
        this.workoutState.setWorkout(newWorkout);
    }

    async submitForm() {
        // 1. Centralized Orphan Handling (Check, Confirm, Create, Update Local IDs)
        try {
            const canProceed = await this.workoutState.confirmAndCreateOrphans();
            if (!canProceed) return;
        } catch (error) {
            console.error('Error handling orphan exercises:', error);
            this.toastr.error('Erro ao cadastrar novos exercícios. Tente novamente.');
            return;
        }

        // 2. Persist with updated workout data
        const workout = this.workoutState.getWorkoutValue();
        if (workout) {
            this.persistWorkout(workout);
        }
    }

    persistWorkout(workout: Treino) {
        this.loading = true;
        const req = workout.id && workout.id !== 0
            ? this.treinoService.update(workout)
            : this.treinoService.create(workout);

        req.subscribe({
            next: () => {
                this.toastr.success('Treino salvo com sucesso!');
                this.goBack();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error saving workout:', err);
                this.toastr.error('Erro ao salvar treino');
                this.loading = false;
            }
        });
    }

    goBack() {
        this.navCtrl.back();
    }

    ngOnDestroy() {
        this.workoutState.setWorkout(null);
    }
}
