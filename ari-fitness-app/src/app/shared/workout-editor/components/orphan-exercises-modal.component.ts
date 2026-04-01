import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-orphan-exercises-modal',
  template: `
    <div class="floating-card-wrapper">
      <div class="header-section">
        <div class="icon-pulse warning">
          <ion-icon name="alert-circle"></ion-icon>
        </div>
        <h2 class="alert-title">{{ orphans.length }} Novos Exercícios</h2>
        <p class="main-info">
          Exercícios não cadastrados foram detectados. Eles serão criados agora para permitir a conclusão deste treino. Mas cuidado, 
          verifique se os nomes estão corretos e se não são exercícios duplicados.
        </p>
      </div>

      <div class="content-section">
        <div class="info-details">
          <ion-icon name="analytics-outline" slot="start"></ion-icon>
          <p>Os novos exercícios serão criados com o nome que você digitou. Isso continuará permitindo a rastreabilidade dos novos nomes enquanto mantém a integridade dos dados na sua academia.</p>
        </div>

        <div class="warning-box">
          <h3 class="warning-header">⚠️ AVISO DE RESPONSABILIDADE:</h3>
          <p class="warning-text">
            Ao continuar, você assume a responsabilidade por estes novos cadastros, garantindo que não são nomes duplicados ou incorretos.
          </p>
          <p class="agreement-text"><b>Ao salvar, você confirma que está de acordo.</b></p>
        </div>
      </div>

      <div class="footer-actions">
        <ion-button color="warning" class="confirm-btn" (click)="confirm()">
           SALVAR E CADASTRAR
        </ion-button>
        <ion-button fill="clear" color="medium" class="cancel-btn" (click)="cancel()">
          REVISAR LISTA
        </ion-button>
      </div>
    </div>

    <style>
      :host {
        --width: auto;
        --max-width: 420px;
        --height: auto;
        --border-radius: 28px;
        --background: transparent; /* Force transparent parent to avoid "ghost elements" */
        display: flex;
        align-items: center;
        justify-content: center;
        contain: content;
      }

      .floating-card-wrapper {
        padding: 32px 24px;
        width: 100%;
        color: var(--ion-text-color, #000);
        text-align: center;
        background: var(--ion-background-color, #fff); /* Background is here, not in host */
        border: 1px solid rgba(var(--ion-color-step-200-rgb, 200,200,200), 0.3);
        box-shadow: 0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1);
        border-radius: 28px;
        position: relative;
        overflow: hidden;
        margin: 20px;
      }

      .header-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 24px;
      }

      .icon-pulse {
        width: 64px;
        height: 64px;
        background: rgba(var(--ion-color-warning-rgb), 0.1);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        animation: pulse 3s infinite;
      }

      .icon-pulse ion-icon {
        font-size: 36px;
        color: var(--ion-color-warning);
      }

      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--ion-color-warning-rgb), 0.3); }
        70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(var(--ion-color-warning-rgb), 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(var(--ion-color-warning-rgb), 0); }
      }

      .alert-title {
        font-size: 1.4rem;
        font-weight: 800;
        margin: 0 0 8px 0;
        letter-spacing: -0.6px;
      }

      .main-info {
        font-size: 0.85rem;
        color: var(--ion-color-step-500);
        margin: 0;
        line-height: 1.4;
      }

      .content-section {
        margin-bottom: 30px;
      }

      .info-details {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: rgba(var(--ion-color-primary-rgb), 0.05);
        padding: 12px;
        border-radius: 14px;
        margin-bottom: 16px;
        text-align: left;
      }

      .info-details p {
        margin: 0;
        font-size: 0.8rem;
        color: var(--ion-color-step-600);
        line-height: 1.3;
      }

      .warning-box {
        background: rgba(var(--ion-color-warning-rgb), 0.04) !important; /* Subtle glow in Light mode */
        border: 1px solid rgba(var(--ion-color-warning-rgb), 0.2) !important;
        padding: 16px;
        border-radius: 18px;
        text-align: left;
      }

      /* Dark Theme subtle refinements */
      @media (prefers-color-scheme: dark) {
        .warning-box {
          background: rgba(253, 184, 19, 0.03); /* Minimal opacity for Dark Mode */
          border-color: rgba(253, 184, 19, 0.1);
        }
        .info-details {
          background: rgba(var(--ion-color-primary-rgb), 0.03);
        }
      }

      /* Light Theme Contrast Specifics */
      :host-context(body:not(.dark-theme)) .warning-box {
        background: #fffdf5;
        border-color: #ffe082;
      }

      .warning-header {
        color: var(--ion-color-danger);
        font-weight: 800;
        font-size: 0.7rem;
        letter-spacing: 1px;
        margin: 0 0 8px 0;
        text-transform: uppercase;
        opacity: 0.8;
      }

      .warning-text {
        margin: 0;
        font-size: 0.88rem;
        line-height: 1.4;
        color: var(--ion-color-step-700);
      }

      .agreement-text {
        margin-top: 10px !important;
        font-size: 0.75rem !important;
        color: var(--ion-color-danger);
        opacity: 0.7;
        display: block;
      }

      .footer-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
      }

      .confirm-btn {
        --border-radius: 16px;
        font-weight: 800;
        height: 54px;
        margin: 0;
        --box-shadow: 0 8px 25px rgba(var(--ion-color-warning-rgb), 0.3);
      }

      .cancel-btn {
        font-weight: 700;
        --color: var(--ion-color-step-400);
        margin: 0;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 1px;
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
