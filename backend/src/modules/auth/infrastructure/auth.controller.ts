import { Controller, Put, Post, Body, UnauthorizedException, UsePipes, Inject, Req, UseGuards, UseInterceptors, UploadedFile, BadRequestException, UploadedFiles } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { z } from 'zod';
import { ZodValidationPipe } from 'nestjs-zod';
import type { AuthRepository } from '../domain/auth.entity.js';
import { REDIS_CLIENT } from '../../../shared/infrastructure/redis.provider.js';
import Redis from 'ioredis';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MailerService } from '../../../shared/infrastructure/mailer.service.js';
import { Public } from './public.decorator.js';

const LoginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

const ForgotPasswordSchema = z.object({
    email: z.string().email(),
});

const ResetPasswordSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
    newPassword: z.string().min(6),
});

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6),
});

type LoginDto = z.infer<typeof LoginSchema>;

@Controller('auth')
export class AuthController {
    constructor(
        private readonly jwtService: JwtService,
        @Inject('AuthRepository') private readonly authRepository: AuthRepository,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly mailerService: MailerService,
    ) { }

    @Public()
    @Post('login')
    @UsePipes(new ZodValidationPipe(LoginSchema))
    async login(@Body() body: LoginDto) {
        const user = await this.authRepository.validateUser(body.username, body.password);

        if (user) {
            //console.log('Login successful. DNI found:', user.dni);
            const payload = {
                username: user.nombre,
                sub: user.id_usuario,
                codigo: user.codigo,
                dni: user.dni
            };
            const token = this.jwtService.sign(payload);

            // Store token in Redis with 10m TTL (600s) for inactivity control
            await this.redis.set(`token:${token}`, `user:${JSON.stringify(user)}`, 'EX', 600);

            return {
                access_token: token,
                user: user
            };
        }
        throw new UnauthorizedException('Credenciales Inválidas');
    }

    @Post('logout')
    async logout(@Req() req: any) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            await this.redis.del(`token:${token}`);
        }
        return { message: 'Sesión cerrada correctamente' };
    }

    @Throttle({ default: { limit: 3, ttl: 900000 } })
    @Public()
    @Post('register')
    @UseInterceptors(FilesInterceptor('files', 3))
    async register(@Body() body: any, @UploadedFiles() files: Express.Multer.File[]) {
        console.log('Register request body:', body);
        console.log('Register request files count:', files?.length || 0);

        if (!files || files.length < 3) {
            throw new BadRequestException('Se requieren los 3 documentos obligatorios (2 Selfies y la Copia del DNI)');
        }
        await this.mailerService.sendRegistrationEmail(body, files);
        return { message: 'Solicitud de registro enviada correctamente' };
    }

    @Throttle({ default: { limit: 3, ttl: 900000 } })
    @Public()
    @Post('forgot-password')
    @UsePipes(new ZodValidationPipe(ForgotPasswordSchema))
    async forgotPassword(@Body() body: { email: string }) {
        const user = await this.authRepository.findByEmail(body.email);
        if (!user) {
            // Security: don't reveal if user exists, but here the user asked for validation
            throw new BadRequestException('No se encontró un usuario con ese correo electrónico');
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        // Store code in Redis for 15 minutes
        await this.redis.set(`reset:${body.email}`, code, 'EX', 900);

        await this.mailerService.sendResetCodeEmail(body.email, code);
        return { message: 'Código de recuperación enviado' };
    }

    @Public()
    @Post('reset-password')
    @UsePipes(new ZodValidationPipe(ResetPasswordSchema))
    async resetPassword(@Body() body: any) {
        const storedCode = await this.redis.get(`reset:${body.email}`);

        if (!storedCode || storedCode !== body.code) {
            throw new BadRequestException('Código inválido o expirado');
        }

        const user = await this.authRepository.findByEmail(body.email);
        if (!user) {
            throw new BadRequestException('Usuario no encontrado');
        }

        await this.authRepository.updatePassword(user.id_usuario, body.newPassword);
        await this.redis.del(`reset:${body.email}`);

        return { message: 'Contraseña actualizada correctamente' };
    }

    @Post('change-password')
    @UsePipes(new ZodValidationPipe(ChangePasswordSchema))
    async changePassword(@Req() req: any, @Body() body: any) {
        const { id_usuario, codigo } = req.user;
        const { currentPassword, newPassword } = body;

        // Verify current password
        const user = await this.authRepository.validateUser(codigo, currentPassword);
        if (!user) {
            throw new UnauthorizedException('La contraseña actual es incorrecta');
        }

        // Update to new password
        await this.authRepository.updatePassword(id_usuario, newPassword);

        return { message: 'Contraseña actualizada exitosamente' };
    }

    @Put('profile')
    async updateProfile(@Req() req: any, @Body() body: any) {
        const { codigo } = req.user;
        const { dni, correo, celular } = body;

        if (!dni || !correo || !celular) {
            throw new BadRequestException('Todos los campos son obligatorios (DNI, Correo, Celular)');
        }

        await this.authRepository.updateProfile(codigo, dni, correo, parseInt(celular));

        return { message: 'Perfil actualizado exitosamente' };
    }
}
