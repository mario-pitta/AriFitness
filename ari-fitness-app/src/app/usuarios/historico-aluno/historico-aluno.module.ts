import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { HistoricoAlunoPage } from './historico-aluno.page';
import { NgxChartsModule } from '@swimlane/ngx-charts';

const routes: Routes = [
    {
        path: '',
        component: HistoricoAlunoPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        NgxChartsModule,
        RouterModule.forChild(routes)
    ],
    declarations: [HistoricoAlunoPage]
})
export class HistoricoAlunoPageModule { }
