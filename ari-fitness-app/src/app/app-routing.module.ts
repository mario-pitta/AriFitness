import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./auth/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./auth/forgot-password/forgot-password.module').then(m => m.ForgotPasswordPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./auth/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'catalogo/:empresaId',
    loadChildren: () => import('./shared/catalog-public/catalog-page/catalog-page.module').then(m => m.CatalogPublicPageModule)
  },
  {
    path: 'catalogo/:empresaId/produto/:produtoId',
    loadComponent: () => import('./shared/catalog-public/produto-detail-page/produto-detail-page').then(m => m.ProdutoDetailPageComponent)
  },
  {
    path: 'check-in',
    loadChildren: () => import('./check-in/check-in.module').then(m => m.CheckInPageModule)
  },
  {
    path: '*/**/unauthorized',
    loadChildren: () => import('./shared/unauthorized-page/unauthorized-page.module').then(m => m.UnauthorizedPageModule)
  },
  {
    canActivate: [AuthGuard],
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
