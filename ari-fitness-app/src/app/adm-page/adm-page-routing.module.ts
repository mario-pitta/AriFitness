import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdmPagePage } from './adm-page.page';
import Constants from 'src/core/Constants';
import { RolesGuard } from 'src/core/guards/roles.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: AdmPagePage,
    canActivate: [RolesGuard],
    data: { roles: [Constants.ADMIN_ID, Constants.INSTRUTOR_ID, Constants.GERENCIA_ID] },
    children: [
      {
        path: '',
        redirectTo: 'admin/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'membros',
        children: [
          {
            path: '',
            loadChildren: () => import('../usuarios/usuarios.module').then(m => m.UsuariosPageModule),
            data: { role: 'admin' }
          },
          {
            path: 'importar',
            loadChildren: () => import('../usuarios/importar/importar.module').then(m => m.ImportarPageModule),
            data: { role: 'admin' }
          },
          {
            path: 'cadastro-usuario',
            loadChildren: () => import('../pessoa-form/pessoa-form.module').then(m => m.PessoaFormPageModule),
            data: { role: ['admin', 'instrutor'], tipoUsuario: Constants.ALUNO_ID }
          },
          {
            path: 'ficha-de-treino',
            loadChildren: () => import('../ficha-treino-aluno/ficha-treino-aluno.module').then(m => m.FichaTreinoAlunoPageModule),
            data: { roles: [Constants.ADMIN_ID, Constants.INSTRUTOR_ID] }
          }
        ]
      },
      {
        path: 'financas',
        loadChildren: () => import('./financas/financas.module').then(m => m.FinancasModule)
      },
      {
        path: 'equipamentos',
        loadChildren: () => import('./equipamentos/equipamentos.module').then(m => m.EquipamentosPageModule)
      },
      {
        path: 'exercicios',
        loadChildren: () => import('./exercicios/exercicios.module').then(m => m.ExerciciosPageModule)
      },
      {
        path: 'treinos',
        loadChildren: () => import('./treinos/treinos.module').then(m => m.TreinosPageModule)
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardPageModule)
      },
      {
        path: 'calendario',
        loadChildren: () => import('./calendario/calendario.module').then(m => m.CalendarioPageModule)
      },
      {
        path: 'tarefas',
        loadChildren: () => import('./planejador/planejador.module').then(m => m.PlanejadorPageModule)
      },
      // todo: criar pagina de contatos
      // {
      //   path: 'contatos',
      //   loadChildren: () => import('./contatos/contatos.module').then(m => m.ContatosPageModule)
      // },


      {
        path: 'configuracoes',
        children: [
          {
            path: '',
            loadChildren: () => import('./settings/settings.module').then(m => m.SettingsPageModule)
          },
          {
            path: 'dados-cadastrais',
            loadChildren: () => import('../pessoa-form/pessoa-form.module').then(m => m.PessoaFormPageModule),
          },
          {
            path: 'whatsapp',
            loadChildren: () => import('./whatsapp-config/whatsapp-config.module').then(m => m.WhatsappConfigPageModule),
          },
          //minha-empresa
          //meus-planos
          //preferencias
        ]

      },
      {
        path: 'equipe',
        loadChildren: () => import('./instrutores/instrutores.module').then(m => m.InstrutoresPageModule)
      },
      {
        path: 'pdv',
        loadChildren: () => import('./pdv/pdv.module').then(m => m.PdvPageModule),
        data: { roles: [Constants.ADMIN_ID, Constants.GERENCIA_ID] }
      },
      {
        path: 'qrcode',
        loadChildren: () => import('../check-in/check-in.module').then(m => m.CheckInPageModule)
      },
      {
        path: 'unauthorized',
        loadChildren: () => import('../shared/unauthorized-page/unauthorized-page.module').then(m => m.UnauthorizedPageModule)
      },
    ]
  },




  // {
  //   path: 'equipamentos',
  //   loadChildren: () => import('./equipamentos/equipamentos.module').then( m => m.EquipamentosPageModule)
  // },
  // {
  //   path: 'exercicios',
  //   loadChildren: () => import('./exercicios/exercicios.module').then( m => m.ExerciciosPageModule)
  // },
  // {
  //   path: 'treinos',
  //   loadChildren: () => import('./treinos/treinos.module').then( m => m.TreinosPageModule)
  // },
  // {
  //   path: 'dashboard',
  //   loadChildren: () => import('./dashboard/dashboard.module').then( m => m.DashboardPageModule)
  // },
  // {
  //   path: 'calendario',
  //   loadChildren: () => import('./calendario/calendario.module').then( m => m.CalendarioPageModule)
  // },



];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdmPagePageRoutingModule { }
