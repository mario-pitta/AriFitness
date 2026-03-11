import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, Subject, take, tap } from 'rxjs';
import { Usuario, IUsuario } from 'src/core/models/Usuario';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user: WritableSignal<IUsuario | null> = signal(null);
  userValue: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(private http: HttpClient, private router: Router) {
    this.userValue = new BehaviorSubject<any>(
      JSON.parse(localStorage.getItem('user') as string)
    );
    this.user.set(this.userValue.value);
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
  }

  login(cpf: string, senha: string | Date) {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { cpf, senha })
      .pipe(
        map((response: any) => {
          const user = response.user;
          const token = response.access_token;

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

  requestPasswordReset(email: string) {
    return this.http.post(`${environment.apiUrl}/auth/request-password-reset`, { email });
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
    this.router.navigate(['/login']);
  }



}
