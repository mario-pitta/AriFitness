import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { CatalogoPage } from './catalogo.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: CatalogoPage }])
  ],
  declarations: [CatalogoPage]
})
export class CatalogoPageModule {}