import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/core/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  cards = [
    {
      title: 'Meu Usuário',
      subtitle: 'Edite seus dados pessoais',
      icon: 'person-outline',
      path: 'perfil',
      color: 'receita'
    },
    {
      title: 'Minha Empresa',
      subtitle: 'Edite seus dados da empresa',
      icon: 'business-outline',
      path: 'empresa',
      color: 'alunos'
    },
    {
      title: 'Configurações',
      subtitle: 'Preferências do sistema',
      icon: 'settings-outline',
      path: '',
      color: 'checkins'
    },
    {
      title: 'Ajuda',
      subtitle: 'Central de suporte',
      icon: 'help-circle-outline',
      path: 'faq',
      color: 'pendente'
    },
    {
      title: 'Sobre',
      subtitle: 'Informações da plataforma',
      icon: 'information-circle-outline',
      path: 'sobre',
      color: 'instrutores'
    },
    {
      title: 'Sair',
      subtitle: 'Encerrar sessão',
      icon: 'log-out-outline',
      path: '',
      color: 'despesa',
      callback: () => this.logout()
    }
  ];


  constructor(private authService: AuthService) { }

  ngOnInit() {
    console.log('SettingsPage Init');
  }

  handleCardClick(card: any) {
    if (card.callback) {
      card.callback();
    }
  }

  logout() {
    console.log('Logout acionado');
    this.authService.logout();
  }

}
