import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ImportacaoPage } from './importacao.page';

import { WorkoutEditorModule } from 'src/app/shared/workout-editor/workout-editor.module';

import { PendingChangesGuard } from 'src/core/guards/pending-changes.guard';

const routes: Routes = [
    {
        path: '',
        component: ImportacaoPage,
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        WorkoutEditorModule
    ],
    declarations: [ImportacaoPage]
})
export class ImportacaoPageModule { }
