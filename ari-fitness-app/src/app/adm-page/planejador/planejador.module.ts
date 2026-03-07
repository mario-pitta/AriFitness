import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanejadorPageRoutingModule } from './planejador-routing.module';

import { PlanejadorPage } from './planejador.page';
import { NgxEditorModule } from 'ngx-editor';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PlanejadorPageRoutingModule,
    NgxEditorModule,
    DragDropModule
  ],
  declarations: [PlanejadorPage]
})
export class PlanejadorPageModule { }
