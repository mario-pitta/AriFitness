import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreinoEditorPage } from './treino-editor.page';


import { PendingChangesGuard } from 'src/core/guards/pending-changes.guard';

const routes: Routes = [
    {
        path: '',
        component: TreinoEditorPage,
        canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TreinoEditorPageRoutingModule { }
