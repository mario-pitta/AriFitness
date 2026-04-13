import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UnauthorizedPageComponent } from './unauthorized-page.component';
import { UnauthorizedPageRoutes } from './unauthorazed-page.routing';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [UnauthorizedPageComponent],
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(UnauthorizedPageRoutes)
  ],
  exports: [UnauthorizedPageComponent]
})
export class UnauthorizedPageModule { }