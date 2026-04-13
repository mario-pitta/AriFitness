import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root',
})
export class EvolutionService {

    constructor(private http: HttpClient, private auth: AuthService) { }

    /**
     * Cria uma nova instância para a empresa.
     * Note: O backend usa o empresaId como nome da instância.
     */
    createInstance(empresaId: string) {
        return this.http
            .post<any>(environment.apiUrl + '/evolution/create-instance', { empresaId })
            .pipe(take(1));
    }

    /**
     * Recupera o QR Code atual para conexão.
     */
    getQRCode() {
        return this.http
            .get<any>(environment.apiUrl + '/evolution/qr?empresa_id=' + this.auth.getUser.empresa_id)
            .pipe(take(1));
    }

    /**
     * Verifica o status da instância na Evolution Go.
     */
    getStatus() {

        return this.http
            .get<any>(environment.apiUrl + '/evolution/status?empresaId=' + this.auth.getUser.empresa_id)
            .pipe(take(1));
    }

    /**
     * Dispara uma mensagem de WhatsApp via backend (server-side numbers).
     */
    sendMessage(empresaId: string, usuarioId: string, text: string) {
        return this.http
            .post<any>(environment.apiUrl + '/evolution/send-message', { empresaId, usuarioId, text })
            .pipe(take(1));
    }


    /**
     * Desconecta a instância da Evolution Go.
     */
    disconnect() {
        return this.http
            .post<any>(environment.apiUrl + '/evolution/disconnect', {
                empresaId: this.auth.getUser.empresa_id
            })
            .pipe(take(1));
    }
}
