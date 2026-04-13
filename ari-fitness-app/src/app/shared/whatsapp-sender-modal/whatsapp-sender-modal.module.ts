
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { WhatsAppSenderModalComponent } from './whatsapp-sender-modal.component';

@NgModule({
    declarations: [WhatsAppSenderModalComponent],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [WhatsAppSenderModalComponent]
})
export class WhatsAppSenderModalModule { }
