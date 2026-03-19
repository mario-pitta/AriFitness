import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InstrutoresPage } from './instrutores.page';
import Constants from 'src/core/Constants';

const routes: Routes = [
  {
    path: '',
    component: InstrutoresPage
  },
  {
    path: 'formulario',
    loadChildren: () => import('./instrutor-form/instrutor-form.module').then(m => m.InstrutorFormPageModule),
    data: {
      tipoUsuario: Constants.INSTRUTOR_ID
    }
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstrutoresPageRoutingModule { }
