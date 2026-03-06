import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  MaskitoOptions,
  MaskitoElementPredicate,
  maskitoTransform,
} from '@maskito/core';
import { Maskito } from '@maskito/core';
import Constants from 'src/core/Constants';
import { IUsuario } from 'src/core/models/Usuario';
import { AuthService } from 'src/core/services/auth/auth.service';
const md5 = require('md5');
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form!: FormGroup;
  cpfMask = Constants.cpfMask;
  maskPredicate: MaskitoElementPredicate = async (el) =>
    (el as HTMLIonInputElement).getInputElement();

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.form = this.fb.group({
      cpf: ['', [Validators.required]],
      senha: ['', [Validators.required]],
    });
  }

  logar() {
    console.log('this.form.value.senha: ', this.form.value.senha);

    this.auth.login(this.form.value.cpf, md5(this.form.value.senha)).subscribe({
      next: (user: IUsuario) => {
        if (!user.flagAdmin) {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/admin']);
        }
      },
    });
  }
}
