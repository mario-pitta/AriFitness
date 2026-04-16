import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Empresa } from 'src/core/models/Empresa';
import { CarrinhoModalComponent } from '../../carrinho-modal/carrinho-modal';

@Component({
  selector: 'app-ecommerce-header',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <!-- 1. Header Reduzido (Sticky) -->
    <div class="sticky-header" [class.visible]="showHeaderReduced">
      <div class="sticky-content">
        <div class="logo-mini" *ngIf="empresa?.logo_url" (click)="goToCatalog()">
          <img [src]="empresa?.logo_url" [alt]="empresa?.nome_fantasia">
        </div>
        <h2 class="store-name-mini" (click)="goToCatalog()">{{ empresa?.nome_fantasia || empresa?.nome }}</h2>
        <div class="header-actions">
          <div class="action-btn share" (click)="shareProduct()">
            <ion-icon name="share-social-outline"></ion-icon>
          </div>
          <div class="action-btn cart" (click)="openCarrinho()">
            <ion-icon name="cart-outline"></ion-icon>
            <ion-badge *ngIf="carrinhoQuantidade > 0" color="success">{{ carrinhoQuantidade }}</ion-badge>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Header do Modal -->
    <div class="modal-header-actions" *ngIf="isModal">
      <div class="modal-btn share" (click)="shareProduct()">
        <ion-icon name="share-social-outline"></ion-icon>
      </div>
      <div class="modal-btn close" (click)="close()">
        <ion-icon name="close"></ion-icon>
      </div>
    </div>

    <!-- 3. Header Expandido -->
    <div class="expanded-header" *ngIf="!isModal" 
         [style.background-image]="empresa?.banner_url ? 'url(' + empresa?.banner_url + ')' : 'none'"
         [style.background-color]="!empresa?.banner_url ? (empresa?.primary_color_hex || '#2D8A5E') : ''">
      <div class="header-overlay"></div>
      <div class="expanded-content">
        <div class="logo-large" *ngIf="empresa?.logo_url" (click)="goToCatalog()">
          <img [src]="empresa?.logo_url" [alt]="empresa?.nome_fantasia">
        </div>
        <div class="logo-large fallback" *ngIf="!empresa?.logo_url" (click)="goToCatalog()">
          <ion-icon name="storefront-outline"></ion-icon>
        </div>
        <div class="store-info-expanded">
          <h1 class="store-name-large">{{ empresa?.nome_fantasia || empresa?.nome }}</h1>
          <p class="store-tagline" *ngIf="isCatalog">Tudo que você precisa em um só lugar</p>
        </div>
        <div class="cart-btn-large" (click)="openCarrinho()">
          <ion-icon name="cart-outline"></ion-icon>
          <ion-badge *ngIf="carrinhoQuantidade > 0" color="success">{{ carrinhoQuantidade }}</ion-badge>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sticky-header {
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 1000;
      height: 64px;
      background: rgba(var(--ion-background-color-rgb), 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(var(--ion-color-step-200-rgb), 0.5);
      transform: translateY(-101%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      padding: 0 16px;

      &.visible { transform: translateY(0); }

      .sticky-content {
        display: flex;
        align-items: center;
        width: 100%;
        gap: 12px;
        max-width: 1000px;
        margin: 0 auto;

        .logo-mini {
          width: 36px; height: 36px; border-radius: 8px; overflow: hidden;
          background: var(--ion-color-step-100);
          img { width: 100%; height: 100%; object-fit: cover; }
        }

        .store-name-mini {
          flex: 1; font-size: 17px; font-weight: 700;
          color: var(--ion-color-step-900);
          margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .header-actions {
          display: flex; gap: 10px;
          .action-btn {
            width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
            background: var(--ion-color-step-100); border-radius: 50%;
            color: var(--ion-color-step-700); font-size: 20px; position: relative;

            &.cart { 
              background: #2D8A5E; color: white; 
              ion-badge { position: absolute; top: -4px; right: -4px; font-size: 10px; }
            }
          }
        }
      }
    }

    .modal-header-actions {
      position: absolute; top: 12px; right: 12px; z-index: 100;
      display: flex; gap: 10px;

      .modal-btn {
        width: 40px; height: 40px; background: rgba(0,0,0,0.4);
        backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        border-radius: 50%; display: flex; align-items: center; justify-content: center;
        color: white; font-size: 22px;
      }
    }

    .expanded-header {
      height: 240px; background-size: cover; background-position: center;
      position: relative; display: flex; align-items: flex-end; padding: 32px 20px;

      .header-overlay {
        position: absolute; top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
      }

      .expanded-content {
        position: relative; z-index: 2; display: flex; align-items: center;
        width: 100%; gap: 16px; max-width: 1000px; margin: 0 auto;

        .logo-large {
          width: 72px; height: 72px; border-radius: 16px; border: 2.5px solid white;
          overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          background: white;
          img { width: 100%; height: 100%; object-fit: cover; }
          &.fallback {
            display: flex; align-items: center; justify-content: center;
            ion-icon { font-size: 32px; color: #2D8A5E; }
          }
        }

        .store-info-expanded {
          flex: 1;
          .store-name-large {
            color: white; font-size: 26px; font-weight: 800; margin: 0;
            text-shadow: 0 2px 10px rgba(0,0,0,0.4);
          }
          .store-tagline {
            color: rgba(255,255,255,0.9); font-size: 14px; margin: 4px 0 0;
            font-weight: 400;
          }
        }

        .cart-btn-large {
          width: 50px; height: 50px; background: #2D8A5E; color: white;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-size: 26px; box-shadow: 0 6px 16px rgba(45, 138, 94, 0.4);
          position: relative;
          ion-badge { position: absolute; top: -6px; right: -6px; font-size: 11px; }
        }
      }
    }

    @media (min-width: 768px) {
      .expanded-header { height: 320px; padding: 48px; }
      .store-name-large { font-size: 36px !important; }
    }
  `]
})
export class EcommerceHeaderComponent {
  @Input() empresa: Empresa | null = null;
  @Input() isModal = false;
  @Input() isCatalog = false;
  @Input() showHeaderReduced = false;
  @Input() carrinhoQuantidade = 0;
  @Input() produtoNome: string | null = null;

  @Output() onShare = new EventEmitter<void>();

  constructor(
    private modalController: ModalController,
    private router: Router
  ) { }

  goToCatalog() {
    if (this.isModal) {
      this.modalController.dismiss();
    }
    if (this.empresa?.id) {
      this.router.navigate(['/catalogo', this.empresa.id]);
    }
  }

  async openCarrinho() {
    const modal = await this.modalController.create({
      component: CarrinhoModalComponent,
      componentProps: {
        empresa: this.empresa
      },
      cssClass: 'carrinho-modal'
    });
    await modal.present();
  }

  shareProduct() {
    this.onShare.emit();
  }

  close() {
    this.modalController.dismiss();
  }
}
