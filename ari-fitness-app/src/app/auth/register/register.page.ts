import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import Constants from 'src/core/Constants';
import { AuthService } from 'src/core/services/auth/auth.service';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
    selector: 'app-register',
    templateUrl: './register.page.html',
    styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
    currentStep = 1;
    totalSteps = 4;

    userForm!: FormGroup;
    companyForm!: FormGroup;

    cpfMask = Constants.cpfMask;
    phoneMask = { mask: ['(', /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/] };
    cnpjMask = { mask: [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/] };

    maskPredicate: MaskitoElementPredicate = async (el) =>
        (el as unknown as HTMLIonInputElement).getInputElement();

    plans = [
        { id: 1, name: 'Basic', price: 99.90, description: 'Até 50 alunos' },
        { id: 2, name: 'Pro', price: 199.90, description: 'Até 200 alunos' },
        { id: 3, name: 'Business', price: 399.90, description: 'Alunos ilimitados' }
    ];

    selectedPlan: any = null;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private router: Router,
        private toastCtrl: ToastController,
        private loadingCtrl: LoadingController
    ) { }

    ngOnInit() {
        this.initForms();
    }

    initForms() {
        this.userForm = this.fb.group({
            nome: ['', [Validators.required]],
            cpf: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            senha: ['', [Validators.required, Validators.minLength(6)]],
            confirmSenha: ['', [Validators.required]]
        }, { validator: this.passwordMatchValidator });

        this.companyForm = this.fb.group({
            nome: ['', [Validators.required]],
            cnpj: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            telefone: ['', [Validators.required]]
        });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('senha')?.value === g.get('confirmSenha')?.value
            ? null : { 'mismatch': true };
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            if (this.canGoNext()) {
                this.currentStep++;
            } else {
                this.presentToast('Por favor, preencha todos os campos obrigatórios.');
            }
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }

    canGoNext() {
        if (this.currentStep === 1) return this.userForm.valid;
        if (this.currentStep === 2) return this.companyForm.valid;
        if (this.currentStep === 3) return this.selectedPlan !== null;
        return true;
    }

    selectPlan(plan: any) {
        this.selectedPlan = plan;
    }

    async finish() {
        const loading = await this.loadingCtrl.create({
            message: 'Criando sua conta...'
        });
        await loading.present();

        try {
            const user = { ...this.userForm.value };
            delete user.confirmSenha;

            const company = this.companyForm.value;
            const planId = this.selectedPlan?.id;

            this.auth.register(user, company, planId).subscribe({
                next: async () => {
                    await loading.dismiss();
                    this.presentToast('Conta criada com sucesso! Faça login para continuar.', 'success');
                    this.router.navigate(['/login']);
                },
                error: async (err) => {
                    await loading.dismiss();
                    this.presentToast(err.error?.message || 'Erro ao criar conta. Tente novamente.', 'danger');
                }
            });
        } catch (error) {
            await loading.dismiss();
            this.presentToast('Erro ao criar conta. Tente novamente.', 'danger');
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

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
