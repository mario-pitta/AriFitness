import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationService } from './push-notification.service';
import { DataBaseService } from 'src/datasource/database.service';

jest.mock('web-push', () => ({
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue(true),
    generateVAPIDKeys: jest.fn().mockReturnValue({
        publicKey: 'mock-public-key',
        privateKey: 'mock-private-key'
    })
}));

describe('PushNotificationService', () => {
    let service: PushNotificationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PushNotificationService,
                {
                    provide: DataBaseService,
                    useValue: {
                        supabase: {
                            from: jest.fn().mockReturnThis(),
                            upsert: jest.fn().mockResolvedValue({ data: null, error: null }),
                            delete: jest.fn().mockReturnThis(),
                            eq: jest.fn().mockResolvedValue({ data: null, error: null }),
                            select: jest.fn().mockReturnThis()
                        }
                    }
                }
            ],
        }).compile();

        service = module.get<PushNotificationService>(PushNotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize vapid keys', () => {
        service.onModuleInit();
        expect(service.getPublicKey()).toBeDefined();
    });
});
