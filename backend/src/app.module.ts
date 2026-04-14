import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { SharedModule } from './shared/shared.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { DebtModule } from './modules/debt/debt.module.js';
import { PapeletaModule } from './modules/papeleta/papeleta.module.js';
import { MessageModule } from './modules/message/message.module.js';
import { TramiteModule } from './modules/tramite/tramite.module.js';
import { JwtAuthGuard } from './modules/auth/infrastructure/jwt-auth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),
    SharedModule,
    AuthModule,
    DebtModule,
    PapeletaModule,
    MessageModule,
    TramiteModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
