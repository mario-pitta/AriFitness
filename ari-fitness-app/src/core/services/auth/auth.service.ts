import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, map, take } from 'rxjs';
import { Usuario, IUsuario } from 'src/core/models/Usuario';
import { EmpresaService } from '../empresa/empresa.service';
import { EmpresaStateService } from '../empresa/state/empresa-state.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: WritableSignal<IUsuario | null> = signal(null);
  userValue: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(
    private http: HttpClient,
    private router: Router,
    private empresaService: EmpresaService,
    private empresaState: EmpresaStateService
  ) {
    this.userValue = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('user') as string)
    );
    this.user.set(this.userValue.value);

    // Auto-fetch empresa if missing but user exists
    if (this.userValue.value?.empresa_id && !this.empresaState.getEmpresaValue) {
      this.fetchAndSetEmpresa(this.userValue.value.empresa_id);
    }
  }

  get getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  get getUser(): IUsuario {
    return this.userValue.value;
  }

  updateUser(user: IUsuario) {
    this.setUser(user)
  }

  private setUser(user: IUsuario) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userValue.next(user as IUsuario);
    this.user.set(user);

    if (user?.empresa_id) {
      this.fetchAndSetEmpresa(user.empresa_id);
    }
  }

  private fetchAndSetEmpresa(empresaId: string) {
    this.empresaService.getEmpresa(empresaId).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.empresaState.setEmpresa(res.data);
        }
      }
    });
  }

  login(cpf: string, senha: string | Date, type: 'STUDENT' | 'TEAM' = 'STUDENT') {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { cpf, senha, type })
      .pipe(
        map((response: any) => {
          const user = response.user;
          const token = response.access_token;

          user.tipo_usuario = user.tipo_usuario.id;
          user.function_id = user.function?.id;

          if (token) {
            localStorage.setItem('access_token', token);
          }

          const u = {
            ...user,
            historico: user.historico || [],
          } as Usuario;

          this.setUser(u);
          return u;
        }),
        take(1)
      );
  }

  register(user: any, company: any, planId?: number) {
    return this.http.post(`${environment.apiUrl}/auth/register`, { user, company, planId });
  }

  requestPasswordReset(email: string, type: 'STUDENT' | 'TEAM' = 'STUDENT') {
    return this.http.post(`${environment.apiUrl}/auth/request-password-reset`, { email, type });
  }

  resetPassword(token: string, novaSenha: string) {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, novaSenha });
  }

  sendEmailTest() {
    return this.http.get(`${environment.apiUrl}/auth/teste-email`)
  }

  logout() {
    localStorage.clear();
    this.user.set(null);
    this.userValue.next(null);
    this.empresaState.clear();
    this.router.navigate(['/login']);
  }



}
