import { Component, Input } from '@angular/core';
import { ModalController, IonModal } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

interface Produto {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  imagem_url?: string;
  categoria?: string;
}

interface Empresa {
  nome_fantasia?: string;
  telefone?: string;
}

@Component({
  selector: 'app-produto-detail-modal',
  template: `
    <div class="detail-modal">
      <div class="modal-header">
        <ion-button fill="clear" class="close-btn" (click)="close()">
          <ion-icon name="close"></ion-icon>
        </ion-button>
      </div>
      
      <div class="modal-image">
        <img *ngIf="produto?.imagem_url" [src]="produto?.imagem_url" [alt]="produto?.nome">
        <ion-icon *ngIf="!produto?.imagem_url" name="cube-outline"></ion-icon>
      </div>
      
      <div class="modal-content">
        <span class="category" *ngIf="produto?.categoria">{{ produto?.categoria }}</span>
        <h1 class="name">{{ produto?.nome }}</h1>
        
        <div class="price-section">
          <span class="price">{{ produto?.preco | currency:'BRL' }}</span>
          <span class="stock">{{ produto?.estoque }} disponíveis</span>
        </div>
        
        <div class="description" *ngIf="produto?.descricao">
          <h3>Descrição</h3>
          <p>{{ produto?.descricao }}</p>
        </div>
        
        <div class="actions">
          <ion-button expand="block" color="success" class="buy-btn" (click)="comprar()">
            <ion-icon name="cart-outline" slot="start"></ion-icon>
            Adicionar ao Carrinho
          </ion-button>
          <ion-button expand="block" fill="outline" class="whatsapp-btn" (click)="falarWhatsapp()">
            <ion-icon name="logo-whatsapp" slot="start"></ion-icon>
            Tirar dúvidas
          </ion-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-modal {
      height: 100%;
      display: flex;
      flex-direction: column;
      background: var(--ion-background-color);
    }

    .modal-header {
      position: absolute;
      top: 8px;
      right: 8px;
      z-index: 10;

      .close-btn {
        --color: white;
        --background: rgba(0,0,0,0.5);
        --border-radius: 50%;
        width: 36px;
        height: 36px;
      }
    }

    .modal-image {
      width: 100%;
      height: 300px;
      background: var(--ion-color-step-100);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      ion-icon {
        font-size: 64px;
        color: var(--ion-color-step-400);
      }
    }

    .modal-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      .category {
        font-size: 12px;
        color: var(--ion-color-step-500);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .name {
        font-size: 24px;
        font-weight: 700;
        color: var(--ion-color-step-1000);
        margin: 8px 0 16px;
      }

      .price-section {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;

        .price {
          font-size: 28px;
          font-weight: 700;
          color: #10b981;
        }

        .stock {
          font-size: 13px;
          color: var(--ion-color-step-500);
        }
      }

      .description {
        margin-bottom: 20px;

        h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--ion-color-step-900);
          margin: 0 0 8px;
        }

        p {
          font-size: 14px;
          color: var(--ion-color-step-600);
          line-height: 1.5;
          white-space: pre-line;
        }
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: auto;

        .buy-btn {
          --border-radius: 12px;
          height: 52px;
          font-size: 16px;
          font-weight: 600;
        }

        .whatsapp-btn {
          --border-radius: 12px;
          --background: #25D366;
          --color: white;
          height: 48px;
          font-weight: 600;
        }
      }
    }
  `]
})
export class ProdutoDetailModalComponent {
  @Input() produto: Produto | null = null;
  @Input() empresa: Empresa | null = null;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }

  comprar() {
    // TODO: Implementar carrinho
    this.modalController.dismiss();
  }

  formatPhone(): string {
    if (!this.empresa?.telefone) return '';
    return this.empresa.telefone.replace(/\D/g, '');
  }

  falarWhatsapp() {
    const phone = this.formatPhone();
    if (phone) {
      const message = encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto: ${this.produto?.nome}`);
      window.open(`https://wa.me/55${phone}?text=${message}`, '_blank');
    }
    this.modalController.dismiss();
  }
}