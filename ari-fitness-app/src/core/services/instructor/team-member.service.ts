import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TeamMemberService {
    private url = `${environment.apiUrl}/team-member`;

    constructor(private http: HttpClient) { }

    findAll(empresaId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }


    findByFilters(filters: any, empresaId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}`, {
            params: new HttpParams().set('empresa_id', empresaId).set('filters', JSON.stringify(filters))
        });
    }

    findOne(id: string, empresaId: string): Observable<any> {
        return this.http.get<any>(`${this.url}/${id}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }

    findByUserId(userId: string, empresaId: string): Observable<any> {
        return this.http.get<any>(`${this.url}/user/${userId}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }

    create(data: any): Observable<any> {
        return this.http.post<any>(this.url, data);
    }

    update(id: string, empresaId: string, data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/${id}`, data, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }

    remove(id: string, empresaId: string): Observable<any> {
        return this.http.delete<any>(`${this.url}/${id}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }
}
