import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UsuariosPage } from './usuarios.page';
import Constants from 'src/core/Constants';

const routes: Routes = [
  {
    path: '',
    component: UsuariosPage
  },
  {
    path: 'importar',
    loadChildren: () => import('./importar/importar.module').then(m => m.ImportarPageModule)
  },

  {
    path: 'historico/:id',
    loadChildren: () => import('./historico-aluno/historico-aluno.module').then(m => m.HistoricoAlunoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsuariosPageRoutingModule { }
