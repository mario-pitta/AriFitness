import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WhatsappConfigPage } from './whatsapp-config.page';

const routes: Routes = [
    {
        path: '',
        component: WhatsappConfigPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WhatsappConfigPageRoutingModule { }
