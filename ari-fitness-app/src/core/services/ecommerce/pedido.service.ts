import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

export interface PedidoItem {
  produto_id: string;
  quantidade: number;
  preco_unitario?: number;
}

export interface Pedido {
  id?: string;
  cliente_nome?: string;
  cliente_cpf?: string;
  cliente_telefone?: string;
  cliente_email?: string;
  valor_total?: number;
  status?: string;
  created_at?: string;
  forma_pagamento?: string;
  itens: PedidoItem[];
  obs?: string;
}

export interface Estatisticas {
  total: number;
  pendentes: number;
  pagos: number;
  cancelados: number;
  valorTotal: number;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  private get empresaId(): string {
    return this.auth.getUser?.empresa_id || '';
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/pedidos/${this.empresaId}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/${id}`);
  }

  create(pedido: Pedido): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedidos/${this.empresaId}`, pedido);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/${id}/status`, { status });
  }

  cancel(id: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/${id}/cancelar`, {});
  }

  getEstatisticas(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/pedidos/${this.empresaId}/lista/estatisticas`);
  }
}