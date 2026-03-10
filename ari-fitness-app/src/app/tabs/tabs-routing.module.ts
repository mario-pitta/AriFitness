import { TreinosListPage } from './../treino-list/treino-list.page';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () =>
          import('../tab1/tab1.module').then((m) => m.Tab1PageModule),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../tab2/tab2.module').then((m) => m.Tab2PageModule),
      },
      {
        path: 'cadastro-usuario',
        loadChildren: () =>
          import('../tab3/tab3.module').then((m) => m.Tab3PageModule),
      },
      {
        path: 'cadastro-usuario/:id',
        loadChildren: () =>
          import('../tab3/tab3.module').then((m) => m.Tab3PageModule),
      },
      {
        path: 'pessoa-form',
        loadChildren: () =>
          import('../pessoa-form/pessoa-form.module').then(
            (m) => m.PessoaFormPageModule
          ),
      },
      {
        path: 'exercicios',
        loadChildren: () =>
          import('../adm-page/exercicios/exercicios.module').then(
            (m) => m.ExerciciosPageModule
          ),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('../usuarios/usuarios.module').then(
            (m) => m.UsuariosPageModule
          ),
      },
      {
        path: 'treinar',
        loadChildren: () =>
          import('../ficha-treino-aluno/ficha-treino-aluno.module').then(
            (m) => m.FichaTreinoAlunoPageModule
          ),
      },
      {
        path: 'ficha-treino',
        loadChildren: () =>
          import('../ficha-treino-aluno/ficha-treino-aluno.module').then(
            (m) => m.FichaTreinoAlunoPageModule
          ),
      },
      {
        path: 'treinos',
        loadChildren: () =>
          import('../treinos/treinos.module').then((m) => m.TreinosPageModule),
      },
      {
        path: 'treino-form',
        loadChildren: () =>
          import('../treino-exercicio-form/treino-exercicio-form.module').then(
            (m) => m.TreinoFormPageModule
          ),
      },
      {
        path: 'treino-form',
        loadChildren: () =>
          import('../treino-exercicio-form/treino-exercicio-form.module').then(
            (m) => m.TreinoFormPageModule
          ),
      },

      {
        path: 'treino-list',
        loadChildren: () =>
          import('../treino-list/treino-list.module').then(
            (m) => m.TreinoListPageModule
          ),
      },
      {
        path: 'stats',
        loadChildren: () => import('../stats/stats.module').then(m => m.StatsPageModule)
      },
      {
        path: 'admin',
        loadChildren: () => import('../adm-page/adm-page.module').then(m => m.AdmPagePageModule)
      },
      {
        path: '',
        redirectTo: 'admin',
        pathMatch: 'full',
      },

    ],
  },
  {
    path: '',
    redirectTo: 'admin',
    pathMatch: 'full',
  }, {
    path: '**',
    redirectTo: 'admin',
    pathMatch: 'full',

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule { }
