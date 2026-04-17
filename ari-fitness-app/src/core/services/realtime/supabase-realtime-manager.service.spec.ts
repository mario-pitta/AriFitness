import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SupabaseRealtimeManagerService } from './supabase-realtime-manager.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

describe('SupabaseRealtimeManagerService', () => {
    let service: SupabaseRealtimeManagerService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SupabaseRealtimeManagerService]
        });
        service = TestBed.inject(SupabaseRealtimeManagerService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
        service.destroy();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('private channel should be configured for broadcast', () => {
        expect((service as any).channel).toBeDefined();
        expect((service as any).channel.name).toBe('ari_fitness_realtime');
    });

    it('should fetch custom jwt on tryBecomeLeader via connectToSupabase (mocking election)', fakeAsync(() => {
        // Force leader election directly to bypass timers for unit test
        (service as any).tryBecomeLeader();

        // Fast forward intervals
        tick(2000);

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/supabase-token`);
        expect(req.request.method).toBe('GET');

        req.flush({ access_token: 'fake_jwt_token' });

        // Fast forward supabase async setup
        tick();

        expect((service as any).isLeader).toBeTrue();
    }));

});
