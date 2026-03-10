
import { Injectable } from '@angular/core';
import { WorkoutTemplateStateService } from './workout-template-state.service';
import { TreinoExercicio } from 'src/core/models/TreinoExercicio';
import { TreinoSessao } from 'src/core/models/TreinoSessao';

@Injectable({
    providedIn: 'root'
})
export class ExerciseStateService {
    constructor(private workoutState: WorkoutTemplateStateService) { }

    addExerciseToActiveSession(exercise: TreinoExercicio) {
        const workout = this.workoutState.getWorkoutValue();
        let session: TreinoSessao | null = null;
        this.workoutState.activeSession$.subscribe(s => session = s).unsubscribe();

        if (workout && session) {
            const updatedSession: TreinoSessao = {
                ...(session as TreinoSessao),
                exercicios: [...((session as TreinoSessao).exercicios || []), exercise]
            };
            this.workoutState.updateSession(updatedSession);
        }
    }

    updateExerciseInActiveSession(index: number, updatedExercise: TreinoExercicio) {
        let session: TreinoSessao | null = null;
        this.workoutState.activeSession$.subscribe(s => session = s).unsubscribe();

        if (session && (session as TreinoSessao).exercicios) {
            const exercicios = [...((session as TreinoSessao).exercicios || [])];
            exercicios[index] = updatedExercise;
            this.workoutState.updateSession({ ...(session as TreinoSessao), exercicios });
        }
    }

    removeExerciseFromActiveSession(index: number) {
        let session: TreinoSessao | null = null;
        this.workoutState.activeSession$.subscribe(s => session = s).unsubscribe();

        if (session && (session as TreinoSessao).exercicios) {
            const exercicios = (session as TreinoSessao).exercicios?.filter((_, i) => i !== index);
            this.workoutState.updateSession({ ...(session as TreinoSessao), exercicios });
        }
    }

    reorderExercisesInActiveSession(exercicios: TreinoExercicio[]) {
        let session: TreinoSessao | null = null;
        this.workoutState.activeSession$.subscribe(s => session = s).unsubscribe();
        if (session) {
            this.workoutState.updateSession({ ...(session as TreinoSessao), exercicios });
        }
    }
}
