import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/auth.controller.js';
import { SqlServerAuthRepository } from './infrastructure/sql-server-auth.repository.js';
import { JwtStrategy } from './infrastructure/jwt.strategy.js';

@Module({
    imports: [
        PassportModule,
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1h' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [
        JwtStrategy,
        {
            provide: 'AuthRepository',
            useClass: SqlServerAuthRepository,
        },
    ],
    exports: [JwtModule, 'AuthRepository'],
})
export class AuthModule { }
