import { Injectable } from '@angular/core';
import { ItemCarrinho, DadosCliente } from 'src/core/models/Carrinho';

export type { ItemCarrinho, DadosCliente };

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {
  private readonly STORAGE_KEY = 'mvk_carrinho';
  private readonly CLIENTE_KEY = 'mvk_carrinho_cliente';

  constructor() { }

  private getItems(): ItemCarrinho[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveItems(items: ItemCarrinho[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  addItem(item: ItemCarrinho): void {
    const items = this.getItems();
    const existingIndex = items.findIndex(i => i.produto_id === item.produto_id);

    if (existingIndex >= 0) {
      items[existingIndex].quantidade += item.quantidade;
    } else {
      items.push(item);
    }

    this.saveItems(items);
  }

  removeItem(produtoId: string): void {
    const items = this.getItems().filter(i => i.produto_id !== produtoId);
    this.saveItems(items);
  }

  updateQuantity(produtoId: string, quantidade: number): void {
    const items = this.getItems();
    const index = items.findIndex(i => i.produto_id === produtoId);

    if (index >= 0) {
      if (quantidade <= 0) {
        items.splice(index, 1);
      } else {
        items[index].quantidade = quantidade;
      }
      this.saveItems(items);
    }
  }


  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.CLIENTE_KEY);
  }

  getAll(): ItemCarrinho[] {
    return this.getItems();
  }

  getTotal(): number {
    return this.getItems().reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
  }

  getQuantity(): number {
    return this.getItems().reduce((sum, item) => sum + item.quantidade, 0);
  }

  setDadosCliente(dados: DadosCliente): void {
    localStorage.setItem(this.CLIENTE_KEY, JSON.stringify(dados));
  }

  getDadosCliente(): DadosCliente | null {
    const data = localStorage.getItem(this.CLIENTE_KEY);
    return data ? JSON.parse(data) : null;
  }

  clearDadosCliente(): void {
    localStorage.removeItem(this.CLIENTE_KEY);
  }
}