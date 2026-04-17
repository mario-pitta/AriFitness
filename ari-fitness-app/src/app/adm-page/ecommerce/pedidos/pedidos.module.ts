import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PedidosPagePage } from './pedidos-page.page';
import { PedidoDetailModalComponent } from './pedido-detail-modal/pedido-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([{ path: '', component: PedidosPagePage }])
  ],
  declarations: [PedidosPagePage, PedidoDetailModalComponent]
})
export class PedidosPageModule { }