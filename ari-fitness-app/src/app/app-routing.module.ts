import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/core/guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.module').then(m => m.LoginPageModule)
  },
  {
    canActivate: [AuthGuard],
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),

  },
  {
    path: 'check-in',
    loadChildren: () => import('./check-in/check-in.module').then(m => m.CheckInPageModule)
  },




];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
