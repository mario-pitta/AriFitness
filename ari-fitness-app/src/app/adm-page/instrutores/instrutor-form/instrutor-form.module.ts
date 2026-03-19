import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InstrutorFormPageRoutingModule } from './instrutor-form-routing.module';

import { InstrutorFormPage } from './instrutor-form.page';
import { MaskitoDirective } from '@maskito/angular';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    InstrutorFormPageRoutingModule,
    MaskitoDirective
  ],
  declarations: [InstrutorFormPage]
})
export class InstrutorFormPageModule { }
