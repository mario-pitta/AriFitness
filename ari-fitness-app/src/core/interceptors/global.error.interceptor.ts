import { ErrorHandler, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { getAnalytics, logEvent } from 'firebase/analytics';


/** 
 * Classe responsavel por interceptar e notificar as ferramentas de observabilidade 
 * sobre erros acontecidos em produção. Aqui conectamos o frontend 
 * com o firebase analytics para monitar os eventos críticos do sistema 
 * fora do ambiente controlado de desenvolvimento.
 * @export
 * @class GlobalErrorHandler
 * @implements {ErrorHandler}
 */
@Injectable({
    providedIn: 'root'
})

export class GlobalErrorHandler implements ErrorHandler {
    constructor(private router: Router) {

        console.log('globalErrorInterceptor constructor...')
    }
    handleError(error: any): void {
        console.log('globalErrorInterceptor handleError...', error)

        const analytics = getAnalytics();
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;

        if (chunkFailedMessage.test(error.message)) {
            const navigation = this.router.getCurrentNavigation();
            if (navigation) {
                this.router.navigate([navigation.finalUrl])
                location.href = navigation.finalUrl?.toString() || '';
                window.location.reload();
            }
        }
        console.error(error);
        console.log('analytics = ', analytics)

        logEvent(analytics, 'error', {
            message: error.message,
            stack: error.stack,
            url: this.router.url
        });


    }
}


