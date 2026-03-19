import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FichaTreinoAlunoPageRoutingModule } from './ficha-treino-aluno-routing.module';

import { FichaTreinoAlunoPage } from './ficha-treino-aluno.page';
import { WorkoutEditorModule } from '../shared/workout-editor/workout-editor.module';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { HistoricoAlunoPageModule } from '../usuarios/historico-aluno/historico-aluno.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FichaTreinoAlunoPageRoutingModule,
    WorkoutEditorModule,
    NgxChartsModule,
    HistoricoAlunoPageModule
  ],

  declarations: [FichaTreinoAlunoPage]
})
export class FichaTreinoAlunoPageModule { }
