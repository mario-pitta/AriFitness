import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TransacaoFinanceiraService } from './transacao-financeira.service';
import { TransacaoFinanceiraDashService } from '../dashboard/transacao-financeira-dash/transacao-financeira-dash.service';
import { environment } from 'src/environments/environment';

describe('TransacaoFinanceiraService', () => {
  let service: TransacaoFinanceiraService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TransacaoFinanceiraService,
        {
          provide: TransacaoFinanceiraDashService,
          useValue: {}
        }
      ]
    });
    service = TestBed.inject(TransacaoFinanceiraService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTrasacoes', () => {
    it('should generate correct query string for simple filters', () => {
      const filters = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281', fl_ativo: true };
      service.getTrasacoes(filters).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes('/transacao-financeira') &&
        request.params.get('empresa_id') === '42897ea4-1709-4ce0-a657-047e32bde281' &&
        request.params.get('fl_ativo') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should generate comma-separated string for array filters', () => {
      const filters = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281', categorias: [1, 2, 3] };
      service.getTrasacoes(filters).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes('/transacao-financeira') &&
        request.params.get('categorias') === '1,2,3'
      );
      req.flush([]);
    });

    it('should handle null/undefined filters by ignoring them', () => {
      const filters = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281', nullField: null, undefinedField: undefined };
      service.getTrasacoes(filters).subscribe();

      const req = httpMock.expectOne(request =>
        request.url.includes('/transacao-financeira') &&
        !request.params.has('nullField') &&
        !request.params.has('undefinedField')
      );
      req.flush([]);
    });
  });
});
