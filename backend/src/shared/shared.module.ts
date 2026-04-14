import { Module, Global } from '@nestjs/common';
import { RedisProvider } from './infrastructure/redis.provider.js';
import { MailerService } from './infrastructure/mailer.service.js';

@Global()
@Module({
    providers: [RedisProvider, MailerService],
    exports: [RedisProvider, MailerService],
})
export class SharedModule { }
