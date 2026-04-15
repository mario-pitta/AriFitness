import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CatalogPublicPage } from './catalog-page';
import { CarrinhoModalComponent } from '../carrinho-modal/carrinho-modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CatalogPublicPage,
    RouterModule.forChild([{ path: '', component: CatalogPublicPage }])
  ]
})
export class CatalogPublicPageModule { }