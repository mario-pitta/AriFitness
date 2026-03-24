import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/core/services/auth/auth.service';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.page.html',
    styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
    form!: FormGroup;
    submitted = false;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController
    ) { }

    ngOnInit() {
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            tipo: ['STUDENT', [Validators.required]]
        });
    }

    async sendResetLink() {
        if (this.form.invalid) return;

        const loading = await this.loadingCtrl.create({
            message: 'Enviando link de recuperação...'
        });
        await loading.present();

        try {
            const { email, tipo } = this.form.value;
            this.auth.requestPasswordReset(email, tipo).subscribe({
                next: () => {
                    loading.dismiss();
                    this.submitted = true;
                    this.presentToast('Link enviado com sucesso! Verifique seu email.', 'success');
                },
                error: () => {
                    loading.dismiss();
                    this.presentToast('Ocorreu um erro ao enviar o email. Tente novamente.', 'danger');
                }
            });
        } catch (error) {
            await loading.dismiss();
            this.presentToast('Ocorreu um erro ao enviar o email. Tente novamente.', 'danger');
        }
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



    enviarEmailTest() {
        this.auth.sendEmailTest().subscribe({
            next: (res: any) => console.log('res = ', res),
            error: (err: any) => console.log('err = ', err)


        })
    }
    goToLogin() {
        this.router.navigate(['/login']);
    }
}
