
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { WorkoutHeaderComponent } from './components/workout-header.component';
import { SessionTabsComponent } from './components/session-tabs.component';
import { ExerciseTableComponent } from './components/exercise-table.component';
import { ExerciseSelectorModalComponent } from './components/exercise-selector-modal.component';
import { WorkoutPreviewModalComponent } from './components/workout-preview-modal.component';
import { StudentSessionViewComponent } from './components/student-session-view.component';
import { TemplateSelectorModalComponent } from './components/template-selector-modal.component';
import { StudentSelectorModalComponent } from '../student-selector/student-selector-modal.component';
import { OrphanExercisesModalComponent } from './components/orphan-exercises-modal.component';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        DragDropModule
    ],
    declarations: [
        WorkoutHeaderComponent,
        SessionTabsComponent,
        ExerciseTableComponent,
        ExerciseSelectorModalComponent,
        WorkoutPreviewModalComponent,
        StudentSessionViewComponent,
        TemplateSelectorModalComponent,
        StudentSelectorModalComponent,
        OrphanExercisesModalComponent
    ],

    exports: [
        WorkoutHeaderComponent,
        SessionTabsComponent,
        ExerciseTableComponent,
        ExerciseSelectorModalComponent,
        WorkoutPreviewModalComponent,
        StudentSessionViewComponent,
        TemplateSelectorModalComponent,
        StudentSelectorModalComponent,
        OrphanExercisesModalComponent
    ]

})
export class WorkoutEditorModule { }
