import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TransacaoFinanceira } from 'src/core/models/TransacaoFInanceira';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransacaoFinanceiraDashService {
  constructor(private http: HttpClient) { }

  getByPeriod(
    data_inicio: string,
    data_fim: string,
    empresa_id: string,
    filters?: Partial<TransacaoFinanceira>
  ) {
    let params = { ...filters, data_inicio, data_fim, empresa_id };
    const query = Object.keys(params)
      .map((k) => k + '=' + params[k as keyof typeof params])
      .join('&');
    console.log('query: ', query);
    return this.http.get<TransacaoFinanceira[]>(
      `${environment.apiUrl}/transacao-financeira-dash?${query}`
    );
  }


  getFinancialResumeByEmpresaId(empresaId: string) {
    return this.http.get(`${environment.apiUrl}/transacao-financeira-dash/receitas-por-mes/${empresaId}`)
  }

  getTotalsByEmpresaId(empresaId: string) {
    return this.http.get(`${environment.apiUrl}/dashboard/totals/${empresaId}`)
  }

  // ─── NOVOS MÉTODOS DE DASHBOARD ────────────────────────────────────────────

  getCheckinsHoje(empresaId: string) {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/checkins-hoje/${empresaId}`);
  }

  getAlertasVencimento(empresaId: string, dias: number = 7) {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/alertas-vencimento/${empresaId}?dias=${dias}`);
  }

  getAlunosSemCheckin(empresaId: string, dias: number = 14) {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/alunos-sem-checkin/${empresaId}?dias=${dias}`);
  }

  getPicoCheckins(empresaId: string) {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/pico-checkins/${empresaId}`);
  }

  getReceitasPendentes(empresaId: string) {
    return this.http.get<any>(`${environment.apiUrl}/dashboard/receitas-pendentes/${empresaId}`);
  }
}
