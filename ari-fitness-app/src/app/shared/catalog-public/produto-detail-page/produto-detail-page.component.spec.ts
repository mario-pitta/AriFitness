import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';
import { ProdutoDetailPageComponent } from './produto-detail-page';
import { ProdutoService } from 'src/core/services/ecommerce/produto.service';
import { CarrinhoService } from 'src/core/services/ecommerce/carrinho.service';
import { ToastrService } from 'src/core/services/toastr/toastr.service';

describe('ProdutoDetailPageComponent', () => {
  let component: ProdutoDetailPageComponent;
  let fixture: ComponentFixture<ProdutoDetailPageComponent>;

  const mockActivatedRoute = {
    params: of({ empresaId: 'empresa-1', produtoId: 'produto-1' })
  };

  const mockProdutoService = {
    getByIdPublic: jasmine.createSpy('getByIdPublic').and.returnValue(of({
      success: true,
      data: {
        produto: {
          id: 'produto-1',
          nome: 'Test Product',
          descricao: 'Test description',
          preco: 100,
          estoque: 10,
          imagem_url: 'http://example.com/image.jpg',
          categoria: 'Test Category',
          empresa_id: 'empresa-1'
        },
        empresa: {
          id: 'empresa-1',
          nome_fantasia: 'Test Store',
          telefone: '11999999999',
          accept_pix: true,
          accept_credit_card: true
        }
      }
    }))
  };

  const mockCarrinhoService = {
    addItem: jasmine.createSpy('addItem')
  };

  const mockToastr = {
    success: jasmine.createSpy('success')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ProdutoDetailPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ProdutoService, useValue: mockProdutoService },
        { provide: CarrinhoService, useValue: mockCarrinhoService },
        { provide: ToastrService, useValue: mockToastr }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProdutoDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load produto from route params', () => {
    expect(mockProdutoService.getByIdPublic).toHaveBeenCalledWith('empresa-1', 'produto-1');
  });

  it('should navigate to catalog when goToCatalog is called', () => {
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { href: '' }
    });

    component.goToCatalog();

    expect(window.location.href).toBe('/catalogo/empresa-1');

    Object.defineProperty(window, 'location', { writable: true, value: originalLocation });
  });
});