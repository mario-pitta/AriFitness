import { TestBed } from '@angular/core/testing';
import { CarrinhoService, ItemCarrinho, DadosCliente } from './carrinho.service';

describe('CarrinhoService', () => {
  let service: CarrinhoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CarrinhoService);
    service.clear();
  });

  afterEach(() => {
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addItem', () => {
    it('should add a new item to empty cart', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 100,
        quantidade: 1
      };

      service.addItem(item);
      expect(service.getQuantity()).toBe(1);
      expect(service.getTotal()).toBe(100);
    });

    it('should increase quantity when adding existing item', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 100,
        quantidade: 1
      };

      service.addItem(item);
      service.addItem(item);

      expect(service.getQuantity()).toBe(2);
      expect(service.getTotal()).toBe(200);
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 100,
        quantidade: 2
      };

      service.addItem(item);
      service.removeItem('prod-1');

      expect(service.getQuantity()).toBe(0);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 50,
        quantidade: 1
      };

      service.addItem(item);
      service.updateQuantity('prod-1', 5);

      expect(service.getQuantity()).toBe(5);
      expect(service.getTotal()).toBe(250);
    });

    it('should remove item when quantity is 0', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 50,
        quantidade: 1
      };

      service.addItem(item);
      service.updateQuantity('prod-1', 0);

      expect(service.getQuantity()).toBe(0);
    });
  });

  describe('clear', () => {
    it('should clear all items', () => {
      const item: ItemCarrinho = {
        produto_id: 'prod-1',
        nome: 'Produto Teste',
        preco: 100,
        quantidade: 3
      };

      service.addItem(item);
      service.clear();

      expect(service.getQuantity()).toBe(0);
      expect(service.getTotal()).toBe(0);
    });
  });

  describe('getTotal', () => {
    it('should calculate total correctly', () => {
      service.addItem({ produto_id: 'prod-1', nome: 'Item 1', preco: 50, quantidade: 2 });
      service.addItem({ produto_id: 'prod-2', nome: 'Item 2', preco: 30, quantidade: 1 });

      expect(service.getTotal()).toBe(130);
    });
  });

  describe('DadosCliente', () => {
    it('should save and retrieve dados cliente', () => {
      const dados: DadosCliente = {
        cpf: '12345678900',
        nome: 'João Silva',
        telefone: '11999999999',
        email: 'joao@teste.com'
      };

      service.setDadosCliente(dados);
      const retrieved = service.getDadosCliente();

      expect(retrieved).toBeTruthy();
      expect(retrieved?.cpf).toBe('12345678900');
      expect(retrieved?.nome).toBe('João Silva');
    });

    it('should clear dados cliente', () => {
      const dados: DadosCliente = {
        cpf: '12345678900',
        nome: 'João Silva',
        telefone: '11999999999',
        email: 'joao@teste.com'
      };

      service.setDadosCliente(dados);
      service.clearDadosCliente();

      expect(service.getDadosCliente()).toBeNull();
    });
  });
});