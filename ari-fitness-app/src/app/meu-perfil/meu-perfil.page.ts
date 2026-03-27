import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MaskitoOptions, MaskitoElementPredicate } from '@maskito/core';
import Constants from 'src/core/Constants';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
import { UsuarioService } from 'src/core/services/usuario/usuario.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

@Component({
    selector: 'app-meu-perfil',
    templateUrl: './meu-perfil.page.html',
    styleUrls: ['./meu-perfil.page.scss'],
})
export class MeuPerfilPage implements OnInit {
    loading = false;
    user!: IUsuario;
    form: FormGroup = new FormGroup({});
    Constants = Constants;

    phoneMask: MaskitoOptions = Constants.phoneMask;
    alturaMask: MaskitoOptions = Constants.alturaMask;
    pesoMask: MaskitoOptions = Constants.pesoMask;

    maskPredicate: MaskitoElementPredicate = async (el) =>
        (el as unknown as HTMLIonInputElement).getInputElement();

    imcIdeal: number = 0;

    constructor(
        private fb: FormBuilder,
        private auth: AuthService,
        private usuarioService: UsuarioService,
        private toastr: ToastrService,
    ) { }

    ngOnInit() {
        this.user = this.auth.getUser;
        this.createForm();
        this.form.patchValue(this.user);
        this.calcIMC();
    }

    createForm() {
        this.form = this.fb.group({
            foto_url: [''],
            peso: [null],
            altura: [null],
            whatsapp: [''],
            email: [''],
            instagram_username: [''],
        });
    }

    calcIMC() {
        const peso = Number(this.form.value.peso);
        const altura = Number(this.form.value.altura);
        if (peso && altura) {
            this.imcIdeal = Number((peso / Math.pow(altura, 2)).toFixed(2));
        }
    }

    /**
     * Envia apenas os campos editáveis do perfil para o endpoint seguro.
     * Após sucesso, atualiza o usuário no AuthService para refletir localmente.
     */
    submitForm() {
        this.loading = true;
        this.form.disable();

        this.usuarioService.updateMeuPerfil(this.form.getRawValue()).subscribe({
            next: (updated: any) => {
                this.loading = false;
                this.form.enable();
                this.toastr.success('Perfil atualizado com sucesso!');
                // Atualiza o usuário local para refletir as mudanças na sessão
                if (updated) {
                    this.auth.updateUser({ ...this.user, ...updated });
                }
            },
            error: (err) => {
                this.loading = false;
                this.form.enable();
                console.error(err);
                this.toastr.error('Erro ao atualizar o perfil.');
            },
        });
    }
}
