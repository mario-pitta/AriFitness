import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-orphan-exercises-modal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar color="warning">
        <ion-title>Atenção: Exercícios Novos</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="cancel()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center glass-modal-content">
      <div class="alert-icon-container">
        <ion-icon name="alert-circle" color="warning" class="main-alert-icon"></ion-icon>
      </div>

      <h2 class="alert-title">{{ orphans.length }} exercício(s) serão criados na base da sua academia</h2>
      
      <div class="warning-box">
        <h3 class="warning-header">AVISO DE RESPONSABILIDADE</h3>
        <p>Ao salvar, você criará novos registros. Cuidado para não poluir sua base de dados com nomes duplicados, gírias ou erros de digitação.</p>
        <p class="secondary-warning"><b>Isso afeta diretamente os gráficos de evolução e as estatísticas do seu aluno.</b></p>
      </div>

      <div class="footer-buttons">
        <ion-button expand="block" fill="clear" color="medium" (click)="cancel()">REVISAR TREINO</ion-button>
        <ion-button expand="block" color="warning" class="confirm-btn" (click)="confirm()">
          ESTOU CIENTE E DESEJO SALVAR
        </ion-button>
      </div>
    </ion-content>

    <style>
      :host {
        --background: var(--ion-background-color, #fff);
        color: var(--ion-text-color, #000);
      }
      .alert-icon-container {
        padding: 20px 0 10px;
      }
      .main-alert-icon {
        font-size: 80px;
      }
      .alert-title {
        font-weight: 800;
        margin-bottom: 5px;
      }
      .subtitle {
        color: var(--ion-color-step-600, #666);
        margin-bottom: 25px;
        font-size: 0.9em;
      }
      .warning-box {
        background: rgba(var(--ion-color-danger-rgb), 0.1);
        border: 1px solid rgba(var(--ion-color-danger-rgb), 0.3);
        padding: 15px;
        border-radius: 12px;
        text-align: left;
        margin-bottom: 30px;
      }
      .warning-header {
        color: var(--ion-color-danger);
        font-weight: bold;
        font-size: 0.8em;
        letter-spacing: 1px;
        margin-top: 0;
      }
      .secondary-warning {
        margin-top: 10px;
        font-size: 0.85em;
        color: var(--ion-text-color);
      }
      .footer-buttons ion-button {
        margin-top: 10px;
        font-weight: bold;
      }
      .confirm-btn {
        --box-shadow: 0 4px 15px rgba(var(--ion-color-warning-rgb), 0.4);
      }
    </style>
  `
})
export class OrphanExercisesModalComponent implements OnInit {
  @Input() orphans: any[] = [];
  @Input() academiaNome: string = 'Minha Academia';

  constructor(private modalController: ModalController) { }

  ngOnInit() { }




  cancel() {
    this.modalController.dismiss(false);
  }

  confirm() {
    this.modalController.dismiss(true);
  }
}
