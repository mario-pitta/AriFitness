import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Empresa } from 'src/core/models/Empresa';

@Component({
  selector: 'app-ecommerce-footer',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <footer class="ecommerce-footer" *ngIf="empresa">
      <div class="footer-grid">
        
        <!-- Bloco de Identidade -->
        <div class="brand-panel">
          <div class="brand-wrapper">
            <div class="brand-logo" *ngIf="empresa.logo_url">
              <img [src]="empresa.logo_url" [alt]="empresa.nome_fantasia">
            </div>
            <div class="brand-text">
              <h2 class="academy-name">{{ empresa.nome_fantasia || empresa.nome }}</h2>
              <span class="academy-cnpj" *ngIf="empresa.cnpj">{{ empresa.cnpj }}</span>
            </div>
          </div>
          <div class="brand-tagline">Performance e Resultados de Elite</div>
        </div>

        <!-- Bloco de Comunicação -->
        <div class="nexus-panel">
          <div class="panel-header">CONTATO</div>
          <div class="contact-hub">
            <div class="contact-link" *ngIf="empresa.telefone" (click)="openWhatsapp()">
              <ion-icon name="logo-whatsapp"></ion-icon>
              <div class="contact-content">
                <span class="label">WHATSAPP</span>
                <span class="value">{{ empresa.telefone }}</span>
              </div>
            </div>
            <div class="contact-link" *ngIf="empresa.email">
              <ion-icon name="mail-outline"></ion-icon>
              <div class="contact-content">
                <span class="label">E-MAIL</span>
                <span class="value ellipsis">{{ empresa.email }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Bloco de Operação -->
        <div class="ops-panel">
          <div class="panel-header">OPERAÇÃO</div>
          
          <div class="operational-data" *ngIf="empresa.horarios && empresa.horarios.length > 0">
            <div class="data-item">
              <ion-icon name="time-outline"></ion-icon>
              <div class="horarios-stack">
                <span class="horario-slot" *ngFor="let h of empresa.horarios">
                  <ng-container *ngIf="h.fl_ativo">{{ h.hora_inicio }} — {{ h.hora_fim }}</ng-container>
                </span>
              </div>
            </div>
          </div>

          <div class="payment-systems">
            <div class="payment-grid">
              <div class="pay-item" [class.active]="empresa.accept_pix">PIX</div>
              <div class="pay-item" [class.active]="empresa.accept_credit_card">CRÉDITO</div>
              <div class="pay-item" [class.active]="empresa.accept_debit_card">DÉBITO</div>
              <div class="pay-item" [class.active]="empresa.accept_money_in_cash">DINHEIRO</div>
            </div>
          </div>
        </div>

      </div>

      <div class="footer-legal">
        <div class="legal-wrapper">
          <div class="security-protocol">
            <ion-icon name="shield-checkmark-outline"></ion-icon>
            <span>SECURITY PROTOCOL ACTIVE</span>
          </div>
          <div class="engine-branding">
            <span class="engine-label">Powered by:</span>
            <span class="engine-name">MvK Gym Manager </span>
            <span class="engine-copyright">© 2026</span>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host { --accent: #10B981; --border: rgba(255,255,255,0.08); }

    .ecommerce-footer {
      margin-top: 80px;
      padding: 0;
      background: #0A0C10;
      color: #F8FAFC;
      font-family: 'Inter', sans-serif;
      border-top: 2px solid #000;

      .footer-grid {
        max-width: 1200px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 1.2fr 1fr 1fr;
        border-left: 1px solid var(--border);
        border-right: 1px solid var(--border);

        > div { padding: 40px; border-bottom: 1px solid var(--border); }
      }

      .panel-header {
        font-size: 11px; font-weight: 800; letter-spacing: 0.2em;
        color: rgba(255,255,255,0.4); margin-bottom: 24px;
      }

      /* Brand Panel */
      .brand-panel {
        .brand-wrapper {
          display: flex; align-items: flex-start; gap: 20px; margin-bottom: 24px;
          .brand-logo {
            width: 64px; height: 64px; border: 1px solid var(--border); padding: 4px;
            img { width: 100%; height: 100%; object-fit: cover; }
          }
          .academy-name { font-size: 24px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -0.02em; }
          .academy-cnpj { font-size: 10px; opacity: 0.5; font-family: monospace; }
        }
        .brand-tagline { font-size: 12px; font-weight: 500; color: var(--accent); opacity: 0.8; letter-spacing: 0.1em; text-transform: uppercase; }
      }

      /* Nexus Panel (Contact) */
      .nexus-panel {
        border-left: 1px solid var(--border);
        .contact-hub { display: flex; flex-direction: column; gap: 16px; }
        .contact-link {
          display: flex; align-items: center; gap: 16px; padding: 12px;
          background: rgba(255,255,255,0.02); border: 1px solid var(--border);
          transition: all 0.2s ease; cursor: pointer;
          &:hover { background: rgba(255,255,255,0.05); border-color: var(--accent); transform: translateX(4px); }
          ion-icon { font-size: 20px; color: var(--accent); }
          .contact-content {
            display: flex; flex-direction: column;
            .label { font-size: 9px; font-weight: 700; opacity: 0.4; }
            .value { font-size: 14px; font-weight: 600; }
            .ellipsis { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
          }
        }
      }

      /* Ops Panel */
      .ops-panel {
        border-left: 1px solid var(--border);
        .data-item {
          display: flex; gap: 12px; margin-bottom: 24px;
          ion-icon { font-size: 18px; color: var(--accent); }
          .horarios-stack { display: flex; flex-direction: column; font-size: 13px; font-weight: 500; gap: 4px; }
        }
        .payment-systems {
          .payment-grid {
            display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
            .pay-item {
              padding: 8px; font-size: 10px; font-weight: 800; text-align: center;
              border: 1px solid var(--border); opacity: 0.3;
              &.active { opacity: 1; border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.05); }
            }
          }
        }
      }

      /* Legal Bottom */
      .footer-legal {
        background: #000; padding: 20px 40px;
        .legal-wrapper {
          max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center;
          font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
          .security-protocol { display: flex; align-items: center; gap: 8px; color: var(--accent); }
          .engine-branding { .engine-label { opacity: 0.4; margin-right: 8px; } .engine-name { color: #fff; } }
        }
      }
    }

    @media (max-width: 992px) {
      .ecommerce-footer .footer-grid {
        grid-template-columns: 1fr;
        > div { border-left: none !important; border-bottom: 1px solid var(--border); }
      }
      .ecommerce-footer .footer-legal .legal-wrapper { flex-direction: column; gap: 12px; text-align: center; }
    }
  `]
})
export class EcommerceFooterComponent {
  @Input() empresa: Empresa | null = null;
  @Input() isModal = false;

  openWhatsapp() {
    if (this.empresa?.telefone) {
      const tel = this.empresa.telefone.replace(/\D/g, '');
      window.open(`https://wa.me/55${tel}`, '_blank');
    }
  }
}
