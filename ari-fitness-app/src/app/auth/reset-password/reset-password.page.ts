import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/core/services/auth/auth.service';

@Component({
    selector: 'app-reset-password',
    templateUrl: './reset-password.page.html',
    styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
    form!: FormGroup;
    token: string | null = null;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private route: ActivatedRoute,
        private router: Router,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController
    ) { }

    ngOnInit() {
        this.token = this.route.snapshot.queryParamMap.get('token');

        if (!this.token) {
            this.presentToast('Token de recuperação inválido ou expirado.', 'danger');
            this.router.navigate(['/login']);
            return;
        }

        this.form = this.fb.group({
            senha: ['', [Validators.required, Validators.minLength(6)]],
            confirmSenha: ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('senha')?.value === g.get('confirmSenha')?.value
            ? null : { 'mismatch': true };
    }

    async resetPassword() {
        if (this.form.invalid || !this.token) return;

        const loading = await this.loadingCtrl.create({
            message: 'Redefinindo sua senha...'
        });
        await loading.present();

        const { senha } = this.form.value;

        this.auth.resetPassword(this.token, senha).subscribe({
            next: async (res: any) => {
                await loading.dismiss();
                if (res.success) {
                    this.presentToast('Senha redefinida com sucesso!', 'success');
                    this.router.navigate(['/login']);
                } else {
                    this.presentToast(res.error || 'Erro ao redefinir senha.', 'danger');
                }
            },
            error: async (err) => {
                await loading.dismiss();
                this.presentToast('Ocorreu um erro. Tente novamente.', 'danger');
            }
        });
    }

    async presentToast(message: string, color: string = 'warning') {
        const toast = await this.toastCtrl.create({
            message,
            duration: 3000,
            color,
            position: 'bottom'
        });
        await toast.present();
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
