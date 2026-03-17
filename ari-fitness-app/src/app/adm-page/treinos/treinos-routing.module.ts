import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreinosPage } from './treinos.page';

import { PendingChangesGuard } from 'src/core/guards/pending-changes.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./list/list.module').then(m => m.ListPageModule)
  }, {
    path: 'treino-editor/:id',
    loadChildren: () => import('../../treino-editor/treino-editor.module').then(m => m.TreinoEditorPageModule)
  },
  {
    path: 'importacao',
    loadChildren: () => import('./importacao/importacao.module').then(m => m.ImportacaoPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreinosPageRoutingModule { }
