import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';

import { PedidoDetailModalComponent } from './pedido-detail-modal.component';

describe('PedidoDetailModalComponent', () => {
    let component: PedidoDetailModalComponent;
    let fixture: ComponentFixture<PedidoDetailModalComponent>;
    let modalCtrlSpy: jasmine.SpyObj<ModalController>;

    beforeEach(waitForAsync(() => {
        modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

        TestBed.configureTestingModule({
            declarations: [PedidoDetailModalComponent],
            imports: [IonicModule.forRoot()],
            providers: [
                { provide: ModalController, useValue: modalCtrlSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(PedidoDetailModalComponent);
        component = fixture.componentInstance;

        // mock do pedido
        component.pedido = {
            id: 'abc',
            valor_total: 100,
            itens: []
        } as any;

        fixture.detectChanges();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('closeModal should call modalController.dismiss()', () => {
        component.closeModal();
        expect(modalCtrlSpy.dismiss).toHaveBeenCalled();
    });

});
