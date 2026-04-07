import { Test, TestingModule } from '@nestjs/testing';
import { TransacaoFinanceiraService } from './transacao-financeira.service';
import { DataBaseService } from '../datasource/database.service';
import { UsuarioService } from '../usuario/usuario.service';

describe('TransacaoFinanceiraService', () => {
    let service: TransacaoFinanceiraService;
    let dbService: DataBaseService;

    const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransacaoFinanceiraService,
                {
                    provide: DataBaseService,
                    useValue: {
                        supabase: mockSupabase as any,
                    },
                },
                {
                    provide: UsuarioService,
                    useValue: {},
                },
            ],
        }).compile();

        service = module.get<TransacaoFinanceiraService>(TransacaoFinanceiraService);
        dbService = module.get<DataBaseService>(DataBaseService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should NOT apply status filter if status is not provided', async () => {
            const filter = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281' };
            await service.findAll(filter);

            expect(mockSupabase.match).toHaveBeenCalledWith(expect.objectContaining({
                empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281'
            }));
            expect(mockSupabase.match).not.toHaveBeenCalledWith(expect.objectContaining({
                fl_pago: expect.any(Boolean)
            }));
        });

        it('should apply fl_pago=true if status is "pago"', async () => {
            const filter = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281', status: 'pago' };
            await service.findAll(filter);

            expect(mockSupabase.match).toHaveBeenCalledWith(expect.objectContaining({
                fl_pago: true,
                fl_ativo: true
            }));
        });

        it('should NOT apply category filter if categories are empty', async () => {
            const filter = { empresa_id: '42897ea4-1709-4ce0-a657-047e32bde281' };
            await service.findAll(filter);

            expect(mockSupabase.in).not.toHaveBeenCalled();
        });

        it('should apply category filter if categories are provided as string', async () => {
            const filter = { empresa_id: 'emp-1', categorias: '1,2' };
            await service.findAll(filter);

            expect(mockSupabase.in).toHaveBeenCalledWith('tr_categoria_id', ['1', '2']);
        });

        it('should apply category filter if categories are provided as array', async () => {
            const filter = { empresa_id: 'emp-1', categorias: [1, 2] };
            await service.findAll(filter);

            expect(mockSupabase.in).toHaveBeenCalledWith('tr_categoria_id', [1, 2]);
        });

        it('should apply date filters correctly', async () => {
            const filter = { empresa_id: 'emp-1', data_inicio: '2023-01-01', data_fim: '2023-01-31' };
            await service.findAll(filter);

            expect(mockSupabase.gte).toHaveBeenCalledWith('data_lancamento', '2023-01-01');
            expect(mockSupabase.lte).toHaveBeenCalledWith('data_lancamento', '2023-01-31');
        });
    });
});
