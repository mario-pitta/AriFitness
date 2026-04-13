import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { PlanoPagePage } from './plano-page.page';
import { PlanoPagePageRoutingModule } from './plano-page-routing.module';

@NgModule({
  declarations: [PlanoPagePage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    PlanoPagePageRoutingModule
  ]
})
export class PlanoPageModule {}