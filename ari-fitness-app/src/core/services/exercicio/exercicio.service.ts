import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, take, tap } from 'rxjs';
import { Exercicio } from 'src/core/models/Exercicio';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ExercicioService {
  private _exercicios$ = new BehaviorSubject<Exercicio[]>([]);
  public exercicios$ = this._exercicios$.asObservable();

  constructor(private http: HttpClient) { }

  save(exercicio: Exercicio) {
    if (!exercicio.id) delete exercicio.id;
    return this.http[exercicio.id ? 'put' : 'post'](
      environment.apiUrl + '/exercicios',
      exercicio
    ).pipe(
      take(1),
      tap(() => this.clearCache())
    );
  }

  find(filters?: any): Observable<Exercicio[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }

    return this.http
      .get<Exercicio[]>(environment.apiUrl + '/exercicios', { params })
      .pipe(
        take(1),
        tap((ex) => {
          if (!filters?.offset || filters.offset === 0) {
            this._exercicios$.next(ex);
          } else {
            const current = this._exercicios$.value;
            // Evitar duplicados se necessário, mas para paginação simples o spread resolve
            this._exercicios$.next([...current, ...ex]);
          }
        })
      );
  }

  clearCache() {
    this._exercicios$.next([]);
  }

  getCache(): Exercicio[] {
    return this._exercicios$.value;
  }

  getNiveis(): Observable<any[]> {
    return this.http.get<any[]>(environment.apiUrl + '/exercicios/niveis').pipe(take(1));
  }
}
