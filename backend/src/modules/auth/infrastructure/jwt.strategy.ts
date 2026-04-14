import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '../../../shared/infrastructure/redis.provider.js';
import Redis from 'ioredis';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET'),
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedException();

        const token = authHeader.split(' ')[1];
        const exists = await this.redis.exists(`token:${token}`);

        if (!exists) {
            throw new UnauthorizedException('Token inválido o sesión expirada');
        }

        return { 
            id_usuario: payload.sub, 
            username: payload.username, 
            codigo: payload.codigo,
            dni: payload.dni
        };
    }
}
