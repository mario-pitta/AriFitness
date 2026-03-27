import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class N8NGuard implements CanActivate {

    constructor(
        private readonly configService: ConfigService
    ) {

        console.log('N8NGuard constructor');
    }




    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        // Captura o Host ou Referer da requisição
        const origin = request.headers['origin'] || request.headers['referer'];
        const allowedDomain = this.configService.get<string>('N8N_ALLOWED_DOMAIN');

        // 1. Valida a API Key
        if (apiKey !== this.configService.get<string>('N8N_API_KEY')) {
            throw new UnauthorizedException('API Key inválida.');
        }

        // 2. Valida o Domínio (Opcional, mas adiciona uma camada)
        if (origin && !origin.startsWith(allowedDomain)) {
            throw new UnauthorizedException('Origem não autorizada.');
        }

        return true;
    }
}