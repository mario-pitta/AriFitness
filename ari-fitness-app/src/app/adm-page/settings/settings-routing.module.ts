import { FaqPageModule } from './faq/faq.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SettingsPage } from './settings.page';

const routes: Routes = [
  {
    path: '',
    component: SettingsPage,
  },
  {
    path: 'empresa',
    loadChildren: () =>
      import('./empresa/empresa.module').then((m) => m.EmpresaPageModule),
  },
  {
    path: 'sobre',
    loadChildren: () => import('./about/about.module').then(m => m.AboutPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./faq/faq.module').then(m => m.FaqPageModule)
  },
  {
    path: 'meu-perfil',
    loadChildren: () => import('../../meu-perfil/meu-perfil.module').then(m => m.MeuPerfilPageModule)
  },
  {
    path: 'plano',
    loadChildren: () => import('./plano-page/plano-page.module').then(m => m.PlanoPageModule)
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule { }
