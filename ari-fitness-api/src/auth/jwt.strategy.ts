import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'ARI_FITNESS_SECRET_KEY', // Em prod, usar variável de ambiente
        });
    }

    async validate(payload: any) {
        console.log('--- JWT CHEGOU NA STRATEGY ---');
        console.log('Payload JwtStrategy: ', payload);
        return {
            userId: payload.sub,
            nome: payload.nome,
            empresa_id: payload.empresa_id,
            tipo_usuario: payload.tipo_usuario
        };
    }
}
