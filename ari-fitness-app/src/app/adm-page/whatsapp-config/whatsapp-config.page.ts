import { Component, OnInit, OnDestroy } from '@angular/core';
import { EvolutionService } from 'src/core/services/evolution/evolution.service';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';
import { interval, Subscription } from 'rxjs';

@Component({
    selector: 'app-whatsapp-config',
    templateUrl: './whatsapp-config.page.html',
    styleUrls: ['./whatsapp-config.page.scss'],
})
export class WhatsappConfigPage implements OnInit, OnDestroy {
    loading = false;
    qrCode: string | null = null;
    status!: {
        data: {
            Connected: boolean,
            LoggedIn: boolean,
            Name: string
        },
        message: string
    } | null;
    empresa: any = null;
    refreshSubscription?: Subscription;

    constructor(
        private evolutionService: EvolutionService,
        private authService: AuthService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        this.empresa = this.authService.getUser?.empresa;
        this.checkStatus();
    }

    ngOnDestroy() {
        this.stopPolling();
    }

    checkStatus() {
        this.loading = true;
        this.evolutionService.getStatus().subscribe({
            next: (res) => {
                this.status = res;
                this.loading = false;
                if (res && res.data.LoggedIn === true) {
                    this.stopPolling();
                    this.qrCode = null;
                } else {
                    this.getQRCode();
                    this.startPolling();
                }
            },
            error: () => {
                this.status = null;
                this.loading = false;
                this.stopPolling();
                this.toastr.error('Não foi possível obter o status da sua conexão. Crie uma instância para começar.');
            }
        });
    }

    createInstance() {
        if (!this.empresa?.id) return;
        this.loading = true;
        this.evolutionService.createInstance(this.empresa.id).subscribe({
            next: () => {
                this.toastr.success('Instância criada! Aguardando QR Code...');
                this.getQRCode();
            },
            error: (err) => {
                this.toastr.error('Erro ao criar instância: ' + err.message);
                this.loading = false;
            }
        });
    }

    getQRCode() {
        this.loading = true;
        this.evolutionService.getQRCode().subscribe({
            next: (res) => {
                this.qrCode = res.data.Qrcode; // Evolution Go retorna o base64
                this.loading = false;
                this.startPolling();
            },
            error: (err) => {
                this.toastr.error('Erro ao buscar QR Code. Verifique se a instância está pronta.');
                this.loading = false;
            }
        });
    }

    startPolling() {
        this.stopPolling();
        this.refreshSubscription = interval(5000).subscribe(() => {
            this.checkStatus();
        });
    }

    stopPolling() {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    disconnect() {
        this.loading = true;
        this.evolutionService.disconnect().subscribe({
            next: () => {
                this.toastr.success('Instância desconectada!');
                this.loading = false;
                this.checkStatus();
            },
            error: (err) => {
                this.toastr.error('Erro ao desconectar instância: ' + err.message);
                this.loading = false;
            }
        });
    }
}

