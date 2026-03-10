import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TreinoEditorPage } from './treino-editor.page';


const routes: Routes = [
    {
        path: '',
        component: TreinoEditorPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TreinoEditorPageRoutingModule { }
