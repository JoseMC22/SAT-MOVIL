import { ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator.js';
import { REDIS_CLIENT } from '../../../shared/infrastructure/redis.provider.js';
import Redis from 'ioredis';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        private reflector: Reflector,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. Check if the route is marked as @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        // 2. Validate JWT signature and structure (Passport)
        // NOTE: AuthGuard.canActivate returns true/false or a Promise/Observable.
        // On success, it populates req.user.
        const canActivatePassport = await super.canActivate(context);
        if (!canActivatePassport) {
            return false;
        }

        // 3. Validate Token existence in Redis (Session Control)
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Formato de autenticación inválido');
        }

        const token = authHeader.split(' ')[1];
        const redisKey = `token:${token}`;
        
        const sessionData = await this.redis.get(redisKey);
        if (!sessionData) {
            throw new UnauthorizedException('Sesión expirada por inactividad. Por favor, inicie sesión nuevamente.');
        }

        // 4. Rolling Session: Refresh TTL (5 minutes = 300 seconds)
        await this.redis.expire(redisKey, 300);

        return true;
    }
}
