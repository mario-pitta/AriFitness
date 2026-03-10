import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TreinoEditorPageRoutingModule } from './treino-editor-routing.module';
import { TreinoEditorPage } from './treino-editor.page';
import { WorkoutEditorModule } from '../shared/workout-editor/workout-editor.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TreinoEditorPageRoutingModule,
        WorkoutEditorModule
    ],
    declarations: [TreinoEditorPage]
})
export class TreinoEditorPageModule { }
