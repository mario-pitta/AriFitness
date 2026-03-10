
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Treino } from 'src/core/models/Treino';
import { TreinoSessao } from 'src/core/models/TreinoSessao';

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
            if (!workout || !workout.nome || workout.nome.trim() === '') return false;
            if (!workout.sessoes || workout.sessoes.length === 0) return false;

            return workout.sessoes.every(sessao => {
                if (!sessao.exercicios || sessao.exercicios.length === 0) return false;
                return sessao.exercicios.every(ex => {
                    const hasId = !!(ex.exercicio_id || (ex as any).exercicios?.id || ex.exercicio?.id);
                    const positiveValues = (ex.series >= 0) && (ex.repeticoes >= 0) && (ex.carga >= 0) && (ex.intervalo >= 0);
                    return hasId && positiveValues;
                });
            });
        })
    );

    setWorkout(workout: Treino) {
        // Ensure at least one session for new workouts or empty templates
        if (!workout.sessoes || workout.sessoes.length === 0) {
            workout.sessoes = [{
                nome: 'A',
                ordem: 1,
                exercicios: []
            }];
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
            // Match exactly by id if it exists. If it's a new session without DB id, match strictly by `ordem` index.
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
