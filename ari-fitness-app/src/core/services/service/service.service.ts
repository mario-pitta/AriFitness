import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class GymServiceService {
    private url = `${environment.apiUrl}/services`;

    constructor(private http: HttpClient) { }

    findAll(empresaId: string): Observable<any[]> {
        return this.http.get<any[]>(`${this.url}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }

    create(data: any): Observable<any> {
        return this.http.post<any>(this.url, data);
    }

    update(id: string, data: any): Observable<any> {
        return this.http.patch<any>(`${this.url}/${id}`, data);
    }

    remove(id: string, empresaId: string): Observable<any> {
        return this.http.delete<any>(`${this.url}/${id}`, {
            params: new HttpParams().set('empresa_id', empresaId)
        });
    }
}
