import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { Usuario } from 'src/core/models/Usuario';
import { environment } from 'src/environments/environment';
// console.log(environment.apiUrl)
@Injectable({
  providedIn: 'root',
})
export class UsuarioService {

  constructor(private http: HttpClient) { }

  create(usuario: Usuario) {
    delete usuario.id;
    delete usuario.created_at;

    return this.http
      .post<Usuario>(environment.apiUrl + '/usuario', usuario)
      .pipe(take(1));
  }
  update(usuario: Usuario | Partial<Usuario> | any) {

    delete usuario.fl_adimplente;
    delete usuario.fl_pago;
    delete usuario.horarios;
    delete usuario.planos;
    delete usuario.empresa;
    delete usuario.ficha_aluno;
    delete usuario.historico;
    delete usuario.idade;
    delete usuario.image_url;
    delete usuario.transacao_financeira;


    return this.http
      .put<Usuario>(environment.apiUrl + '/usuario', usuario)
      .pipe(take(1));
  }

  findByFilters(filters: Partial<Usuario> | Usuario) {
    const query = Object.keys(filters).map(
      (k: string) => `${k}=${filters[k as keyof Usuario]}`
    ).join('&');

    return this.http
      .get<Usuario[]>(environment.apiUrl + '/usuario/search?' + query)
      .pipe(take(1));
  }


  registrarCheckIn(cpf: string, nome: string, empresa_id: string) {
    return this.http.post(environment.apiUrl + `/usuario/check-in`, { cpf, nome, empresa_id }).pipe(take(1));
  }
  getCheckinsByEmpresa(empresaId: string, data_inicio: Date, data_fim: Date) {
    return this.http
      .get<any[]>(environment.apiUrl + `/usuario/check-in/empresa/${empresaId}?data_inicio=${data_inicio.toISOString()}&data_fim=${data_fim.toISOString()}`)
      .pipe(take(1));
  }
  getFrequencyByCPF(cpf: string, empresaId: string) {
    return this.http.get<any>(environment.apiUrl + `/usuario/frequency-by-cpf?cpf=${cpf}&empresaId=${empresaId}`).pipe(take(1));
  }

  getTreinoHistorico(usuarioId: number) {
    return this.http.get<any[]>(environment.apiUrl + `/usuario/treino-historico/${usuarioId}`).pipe(take(1));
  }

  registrarTreinoHistorico(body: any) {
    return this.http.post(environment.apiUrl + `/usuario/treino-historico`, body).pipe(take(1));
  }

  deleteCheckinById(checkinId: number) {
    return this.http.post(environment.apiUrl + `/usuario/check-in/${checkinId}/delete`, {}).pipe(take(1));
  }

  importStudents(file: File, empresaId: string) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(environment.apiUrl + `/usuario/import?empresaId=${empresaId}`, formData).pipe(take(1));
  }

  getMappings(empresaId: string) {
    return this.http.get<{ plans: any[], schedules: any[] }>(environment.apiUrl + `/usuario/mappings?empresaId=${empresaId}`).pipe(take(1));
  }

  batchCreate(students: any[], empresaId: string) {
    return this.http.post(environment.apiUrl + `/usuario/batch-create?empresaId=${empresaId}`, { students }).pipe(take(1));
  }

  exportStudents(empresaId: string) {
    return this.http.get(environment.apiUrl + `/usuario/export?empresaId=${empresaId}`, { responseType: 'blob' as 'json' }).pipe(take(1));
  }
}
