import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Produto {
  id?: string;
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  estoque_minimo?: number;
  imagem_url?: string;
  ativo: boolean;
  categoria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private get empresaId(): string {
    return this.auth.getUser?.empresa_id || '';
  }

  getAll(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}`);
  }

  getAllByEmpresa(empresaId: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/publico/${empresaId}`);
  }

  getById(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${id}`);
  }

  create(produto: Partial<Produto>): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/produtos/${this.empresaId}`, produto);
  }

  update(id: string, produto: Partial<Produto>): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${id}`, produto);
  }

  delete(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/produtos/${this.empresaId}/${id}`);
  }

  getEstoqueBaixo(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}/estoque/baixo`);
  }

  getCategorias(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/produtos/${this.empresaId}/lista/categorias`);
  }
}