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
  {
    path: 'ecommerce/produtos',
    loadChildren: () => import('src/app/adm-page/ecommerce/produtos/produtos.module').then(m => m.ProdutosPageModule)
  },
  {
    path: 'ecommerce/pedidos',
    loadChildren: () => import('src/app/adm-page/ecommerce/pedidos/pedidos.module').then(m => m.PedidosPageModule)
  },
  {
    path: 'ecommerce/catalogo',
    loadChildren: () => import('src/app/adm-page/ecommerce/catalogo/catalogo.module').then(m => m.CatalogoPageModule)
  },
  {
    path: 'ecommerce/loja',
    loadChildren: () => import('src/app/adm-page/ecommerce/loja/loja.module').then(m => m.LojaPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsPageRoutingModule { }