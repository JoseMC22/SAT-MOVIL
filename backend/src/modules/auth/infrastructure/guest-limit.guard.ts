import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../../shared/infrastructure/redis.provider.js';
import Redis from 'ioredis';

@Injectable()
export class GuestLimitGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.isGuest) {
      // If it's a regular user, we don't apply the guest limit
      return true;
    }

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const guestKey = `guest:limit:${today}:${user.sub}`;

    const currentCount = await this.redis.get(guestKey);
    const count = currentCount ? parseInt(currentCount, 10) : 0;

    if (count >= 10) {
      throw new ForbiddenException('Has alcanzado el límite diario de 10 consultas para el modo invitado.');
    }

    // Increment and set expiry to 24h if it's the first one
    await this.redis.incr(guestKey);
    if (count === 0) {
      await this.redis.expire(guestKey, 86400); // 24 hours
    }

    return true;
  }
}
