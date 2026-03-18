import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AiService {

  constructor(private http: HttpClient) { }




  getAnaliseFinanceira(data: {
    empresa_id: string;
    data_inicio: string;
    data_fim: string;
  }) {
    return this.http.get(
      `${environment.apiUrl}/ai/gemini/relatorio-financas/${data.empresa_id}?data_inicio=${data.data_inicio}&data_fim=${data.data_fim}`
    );
  }


  buildTreinoPersonalizado(data: {
    empresa_id: string;
    aluno_id: string;
    observações: string;
    objetivo: string;
  }) {
    return this.http.post(
      `${environment.apiUrl}/ai/gemini/treino-personalizado`, data
    );
  }

}
