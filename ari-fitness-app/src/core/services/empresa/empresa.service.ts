import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Empresa } from 'src/core/models/Empresa';
import { environment } from 'src/environments/environment';
import { EmpresaStateService } from './state/empresa-state.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {

  constructor(
    private http: HttpClient,
    private empresaState: EmpresaStateService
  ) { }

  getEmpresa(empresaId: string) {
    return this.http.get(environment.apiUrl + '/empresa/' + empresaId).pipe(
      tap((res: any) => {
        if (res.data) {
          this.empresaState.setEmpresa(res.data);
        }
      })
    );
  }

  createEmpresa(empresa: Empresa) {
    return this.http.post(environment.apiUrl + '/empresa', empresa);
  }

  updateEmpresa(empresa: Empresa) {
    return this.http.put(environment.apiUrl + '/empresa/' + empresa.id, empresa).pipe(
      tap((res: any) => {
        if (res.data) {
          this.empresaState.setEmpresa(res.data);
        }
      })
    );
  }
}
