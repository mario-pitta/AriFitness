import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, take } from 'rxjs';
import { FichaAluno } from 'src/core/models/FichaAluno';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FichaAlunoService {
  constructor(private http: HttpClient) { }

  getAll(filters?: Partial<FichaAluno> | FichaAluno) {
    const query = filters
      ? Object.keys(filters).map(
        (k: string) => `${k}=${filters[k as keyof FichaAluno]}`
      )
      : '';
    return this.http
      .get<FichaAluno[]>(environment.apiUrl + '/ficha-aluno?' + query)
      .pipe(take(1));
  }
  getByUser(userId: number, filters?: Partial<FichaAluno> | FichaAluno) {
    const query = filters
      ? Object.keys(filters).map(
        (k: string) => `${k}=${filters[k as keyof FichaAluno]}`
      )
      : '';
    return this.http
      .get<FichaAluno[]>(
        environment.apiUrl + '/ficha-aluno/aluno/' + userId + '?' + query
      )
      .pipe(take(1));
  }
  getById(id: number, filters?: Partial<FichaAluno> | FichaAluno) {
    const query = filters
      ? Object.keys(filters).map(
        (k: string) => `${k}=${filters[k as keyof FichaAluno]}`
      )
      : '';
    return this.http
      .get<FichaAluno[]>(
        environment.apiUrl + '/ficha-aluno/' + id + '?' + query
      )
      .pipe(take(1));
  }
  create(ficha: FichaAluno) {
    delete ficha.id;
    return this.http
      .post<FichaAluno[]>(environment.apiUrl + '/ficha-aluno', ficha)
      .pipe(take(1));
  }
  update(ficha: FichaAluno) {
    return this.http
      .put<FichaAluno[]>(environment.apiUrl + '/ficha-aluno/', ficha)
      .pipe(take(1));
  }

  applyTemplate(fichaId: number, treinoId: number) {
    return this.http
      .post(environment.apiUrl + `/ficha-aluno/${fichaId}/apply-template/${treinoId}`, {})
      .pipe(take(1));
  }
}

