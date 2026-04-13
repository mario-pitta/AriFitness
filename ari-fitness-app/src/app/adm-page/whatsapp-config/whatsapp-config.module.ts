import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { WhatsappConfigPageRoutingModule } from './whatsapp-config-routing.module';
import { WhatsappConfigPage } from './whatsapp-config.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        WhatsappConfigPageRoutingModule
    ],
    declarations: [WhatsappConfigPage]
})
export class WhatsappConfigPageModule { }
