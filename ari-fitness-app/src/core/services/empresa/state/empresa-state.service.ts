import { Injectable, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IEmpresa } from 'src/core/models/Empresa';

@Injectable({
    providedIn: 'root'
})
export class EmpresaStateService {
    private empresaSubject: BehaviorSubject<IEmpresa | null> = new BehaviorSubject<IEmpresa | null>(null);
    public empresa$: Observable<IEmpresa | null> = this.empresaSubject.asObservable();

    // Signal for more modern parts of the app if needed
    public empresaSignal: WritableSignal<IEmpresa | null> = signal(null);

    constructor() {
        const storedEmpresa = localStorage.getItem('empresa');
        if (storedEmpresa) {
            try {
                const parsed = JSON.parse(storedEmpresa);
                this.empresaSubject.next(parsed);
                this.empresaSignal.set(parsed);
            } catch (e) {
                console.error('Error parsing stored empresa', e);
                localStorage.removeItem('empresa');
            }
        }
    }

    setEmpresa(empresa: IEmpresa | null) {
        if (empresa) {
            localStorage.setItem('empresa', JSON.stringify(empresa));
        } else {
            localStorage.removeItem('empresa');
        }
        this.empresaSubject.next(empresa);
        this.empresaSignal.set(empresa);
    }

    get getEmpresaValue(): IEmpresa | null {
        return this.empresaSubject.value;
    }

    clear() {
        this.setEmpresa(null);
    }
}
