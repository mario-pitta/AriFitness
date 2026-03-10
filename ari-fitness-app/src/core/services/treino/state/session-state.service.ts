
import { Injectable } from '@angular/core';
import { WorkoutTemplateStateService } from './workout-template-state.service';
import { TreinoExercicio } from 'src/core/models/TreinoExercicio';
import { TreinoSessao } from 'src/core/models/TreinoSessao';

@Injectable({
    providedIn: 'root'
})
export class SessionStateService {
    constructor(private workoutState: WorkoutTemplateStateService) { }

    addExercise(exercise: TreinoExercicio) {
        const session = this.workoutState.activeSession$;
        // Logic to add exercise to the active session
        // This could also be handled by ExerciseStateService
    }

    duplicateSession(session: TreinoSessao) {
        const workout = this.workoutState.getWorkoutValue();
        if (workout) {
            const maxOrdem = workout.sessoes && workout.sessoes.length > 0
                ? Math.max(...workout.sessoes.map(s => s.ordem))
                : 0;

            const newSession: TreinoSessao = {
                ...session,
                id: undefined,
                nome: `${session.nome} (Cópia)`,
                ordem: maxOrdem + 1,
                exercicios: (session.exercicios || []).map(ex => ({ ...ex, id: undefined, sessao_id: undefined }))
            };
            this.workoutState.addSession(newSession);
        }
    }
}
