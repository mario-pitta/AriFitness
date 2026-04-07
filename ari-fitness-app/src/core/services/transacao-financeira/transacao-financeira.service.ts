import { TransacaoFinanceira } from './../../models/TransacaoFInanceira';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TransacaoFinanceiraDashService } from '../dashboard/transacao-financeira-dash/transacao-financeira-dash.service';

@Injectable({
  providedIn: 'root'
})
export class TransacaoFinanceiraService {
  constructor(private http: HttpClient, private transacaoFinanceiraDashService: TransacaoFinanceiraDashService) { }


  getDashboard(data_inicio: string, data_fim: string, empresa_id: string) {
    console.log(' data_inicio, data_fim, empresa_id : ', data_inicio, data_fim, empresa_id);

    return this.transacaoFinanceiraDashService.getByPeriod(data_inicio, data_fim, empresa_id);
  }
  getTrasacoes(filters: Partial<TransacaoFinanceira> | any) {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });

    return this.http
      .get<any>(`${environment.apiUrl}/transacao-financeira?${params.toString()}`)
      .pipe(take(1));
  }

  exportPDFBackend(filter: TransacaoFinanceira | Partial<TransacaoFinanceira> | any) {
    const filters = { ...filter };
    if (filters.data_lancamento) delete filters.data_lancamento;
    if (filters.valor_final) delete filters.valor_final;

    let params = new HttpParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        params = params.append(key, String(filters[key]));
      }
    });

    return this.http.get(`${environment.apiUrl}/transacao-financeira/export/pdf?${params.toString()}`, {
      responseType: 'blob',
    });
  }
  save(transacao: any) {

    const req = transacao.id
      ? this.http.put<any>(`${environment.apiUrl}/transacao-financeira/`, transacao)
      : this.http.post<any>(`${environment.apiUrl}/transacao-financeira`, transacao);

    return req
  }


  getTiposTransacaoFinanceira() {
    return this.http.get<any>(`${environment.apiUrl}/transacao-financeira/tipos?fl_ativo=1`);
  }


  getCategoriasByTipoId(tipoId: number) {
    const query = `fl_ativo=1&tr_tipo_id=${tipoId}`;
    return this.http.get<any>(`${environment.apiUrl}/transacao-financeira/categorias?${query}`);
  }

}
