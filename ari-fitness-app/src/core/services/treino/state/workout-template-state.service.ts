import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Treino } from 'src/core/models/Treino';
import { TreinoSessao } from 'src/core/models/TreinoSessao';
import { ModalController } from '@ionic/angular';
import { ExercicioService } from 'src/core/services/exercicio/exercicio.service';
import { AuthService } from 'src/core/services/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class WorkoutTemplateStateService {
    private workoutSubject = new BehaviorSubject<Treino | null>(null);
    workout$ = this.workoutSubject.asObservable();

    private activeSessionSubject = new BehaviorSubject<TreinoSessao | null>(null);
    activeSession$ = this.activeSessionSubject.asObservable();

    isValid$ = this.workout$.pipe(
        map(workout => {
            if (!workout) return false;

            if (!workout.nome || workout.nome.trim() === '') {
                return false;
            }
            if (!workout.sessoes || workout.sessoes.length === 0) {
                return false;
            }

            const hasExercises = workout.sessoes.some(s => s.exercicios && s.exercicios.length > 0);
            if (!hasExercises) {
                return false;
            }

            const allExercisesValid = workout.sessoes.every(sessao => {
                if (!sessao.exercicios) return true;
                return sessao.exercicios.every((ex: any) => {
                    const hasValidName = ex.exercicio?.nome && ex.exercicio.nome.trim() !== '';
                    return hasValidName;
                });
            });

            return allExercisesValid;
        })
    );

    constructor(
        private modalController: ModalController,
        private exercicioService: ExercicioService,
        private auth: AuthService
    ) { }

    getOrphans(): any[] {
        const workout = this.getWorkoutValue();
        if (!workout || !workout.sessoes) return [];

        return workout.sessoes.flatMap(s =>
            (s.exercicios || []).filter((ex: any) =>
                (!ex.exercicio_id || ex.exercicio_id <= 0) && (ex.exercicio?.nome?.trim())
            )
        );
    }

    /**
     * Intercepts orphans, shows confirmation modal, creates them in DB, 
     * and updates the local state with new IDs.
     * @returns Promise<boolean> - True if ready to proceed with final save, false if cancelled.
     */
    async confirmAndCreateOrphans(): Promise<boolean> {
        const orphans = this.getOrphans();
        if (orphans.length === 0) return true;

        const { OrphanExercisesModalComponent } = await import('../../../../app/shared/workout-editor/components/orphan-exercises-modal.component');
        const user = this.auth.getUser;

        const modal = await this.modalController.create({
            component: OrphanExercisesModalComponent,
            componentProps: {
                orphans,
                academiaNome: user.empresa?.nome || 'sua academia'
            },
            cssClass: 'floating-modal-custom',
            backdropDismiss: false,
            keyboardClose: true,
            mode: 'ios' // iOS mode usually has better centered default feel for cards
        });
        await modal.present();

        const { data } = await modal.onWillDismiss();
        if (data !== true) return false;

        // User confirmed: Create exercises in background
        try {
            const creations = orphans.map(orphan =>
                this.exercicioService.save({
                    nome: orphan.exercicio.nome,
                    fl_ativo: true,
                    empresa_id: user.empresa_id,
                    usuario_id: user.id
                }).toPromise()
            );

            const results = await Promise.all(creations);

            // Update orphans with new IDs in the local state
            orphans.forEach((orphan, index) => {
                const response = results[index] as any;
                const createdEx = response.data || (Array.isArray(response) ? response[0] : response);

                if (createdEx && createdEx.id) {
                    orphan.exercicio_id = Number(createdEx.id);
                    orphan.exercicio = createdEx;
                }
            });

            // Update the whole workout subject to reflect new IDs
            this.workoutSubject.next({ ...this.getWorkoutValue()! });
            return true;
        } catch (error) {
            console.error('Error creating orphan exercises in state service:', error);
            throw error;
        }
    }

    setWorkout(workout: Treino | null) {
        if (!workout) {
            this.workoutSubject.next(null);
            return;
        }
        if (!workout.sessoes || workout.sessoes.length === 0) {
            workout.sessoes = [{
                nome: 'A',
                ordem: 1,
                exercicios: []
            }];
        }

        if (workout.sessoes) {
            workout.sessoes.forEach(s => {
                if (s.exercicios) {
                    s.exercicios = s.exercicios.filter((ex: any) =>
                        (ex.exercicio_id && ex.exercicio_id > 0) ||
                        (ex.exercicio?.nome && ex.exercicio.nome.trim() !== '')
                    ).map((ex: any) => {
                        if (ex.exercicio_id === 0) ex.exercicio_id = null;
                        return ex;
                    });
                }
            });
        }

        this.workoutSubject.next(workout);
        if (workout.sessoes && workout.sessoes.length > 0) {
            this.setActiveSession(workout.sessoes[0]);
        } else {
            this.setActiveSession(null);
        }
    }

    getWorkoutValue(): Treino | null {
        return this.workoutSubject.value;
    }

    getActiveSessionValue(): TreinoSessao | null {
        return this.activeSessionSubject.value;
    }

    setActiveSession(session: TreinoSessao | null) {
        this.activeSessionSubject.next(session);
    }

    updateWorkout(partialWorkout: Partial<Treino>) {
        const current = this.workoutSubject.value;
        if (current) {
            this.workoutSubject.next({ ...current, ...partialWorkout });
        }
    }

    addSession(session: TreinoSessao) {
        const current = this.workoutSubject.value;
        if (current) {
            const sessoes = [...(current.sessoes || []), session];
            this.workoutSubject.next({ ...current, sessoes });
            this.setActiveSession(session);
        }
    }

    updateSession(updatedSession: TreinoSessao) {
        const current = this.workoutSubject.value;
        if (current && current.sessoes) {
            const sessoes = current.sessoes.map(s => {
                const isMatch = s.id
                    ? s.id === updatedSession.id
                    : s.ordem === updatedSession.ordem && !updatedSession.id;

                return isMatch ? updatedSession : s;
            });
            this.workoutSubject.next({ ...current, sessoes });

            const activeIdMatch = this.activeSessionSubject.value?.id === updatedSession.id;
            const activeOrdemMatch = !this.activeSessionSubject.value?.id && this.activeSessionSubject.value?.ordem === updatedSession.ordem;
            if (activeIdMatch || activeOrdemMatch) {
                this.activeSessionSubject.next(updatedSession);
            }
        }
    }

    removeSession(sessionId: number | undefined, sessionOrdem: number) {
        const current = this.workoutSubject.value;
        if (current && current.sessoes) {
            const sessoes = current.sessoes.filter(s => {
                if (sessionId) return s.id !== sessionId;
                return s.ordem !== sessionOrdem;
            });
            this.workoutSubject.next({ ...current, sessoes });
            if (sessoes.length > 0) {
                this.setActiveSession(sessoes[0]);
            } else {
                this.setActiveSession(null);
            }
        }
    }
}
