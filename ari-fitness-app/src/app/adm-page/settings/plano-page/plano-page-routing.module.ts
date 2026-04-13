import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlanoPagePage } from './plano-page.page';

const routes: Routes = [
  {
    path: '',
    component: PlanoPagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PlanoPagePageRoutingModule {}