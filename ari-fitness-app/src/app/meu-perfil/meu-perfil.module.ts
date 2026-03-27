import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaskitoDirective } from '@maskito/angular';
import { MeuPerfilPageRoutingModule } from './meu-perfil-routing.module';
import { MeuPerfilPage } from './meu-perfil.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        MaskitoDirective,
        MeuPerfilPageRoutingModule,
    ],
    declarations: [MeuPerfilPage],
})
export class MeuPerfilPageModule { }
