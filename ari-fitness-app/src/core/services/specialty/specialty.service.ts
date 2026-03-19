import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SpecialtyService {
    private url = `${environment.apiUrl}/specialties`;

    constructor(private http: HttpClient) { }

    findAll(): Observable<any[]> {
        return this.http.get<any[]>(this.url);
    }

    create(data: any): Observable<any> {
        return this.http.post<any>(this.url, data);
    }
}
