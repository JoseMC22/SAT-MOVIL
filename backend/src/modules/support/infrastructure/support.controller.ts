import { Controller, Post, Get, Body, UseInterceptors, UploadedFiles, UseGuards, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { MailerService } from '../../../shared/infrastructure/mailer.service.js';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard.js';
import { Public } from '../../auth/infrastructure/public.decorator.js';

@Controller('support')
export class SupportController {
    constructor(private readonly mailerService: MailerService) { }

    @Public()
    @Get('verify-mail')
    async verifyMail() {
        return await this.mailerService.verifyConnection();
    }

    @UseGuards(JwtAuthGuard)
    @Post('contact')
    @UseInterceptors(FilesInterceptor('files'))
    async sendContact(
        @Body() body: any,
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: any
    ) {
        const user = req.user;
        await this.mailerService.sendSupportEmail(body, files, user);
        return { success: true, message: 'Mensaje enviado correctamente' };
    }
}
