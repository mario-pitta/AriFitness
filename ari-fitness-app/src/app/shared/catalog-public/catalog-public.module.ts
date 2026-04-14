import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CatalogPublicPage } from './catalog-public.page';
import { ProdutoDetailModalComponent } from './produto-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: CatalogPublicPage }])
  ],
  declarations: [CatalogPublicPage, ProdutoDetailModalComponent]
})
export class CatalogPublicPageModule {}