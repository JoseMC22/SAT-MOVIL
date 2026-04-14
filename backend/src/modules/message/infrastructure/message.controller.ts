import { Controller, Patch, Get, Param, Response, UseGuards, Req } from '@nestjs/common';
import { GetMessagesUseCase } from '../application/get-messages.use-case.js';
import { GetFileStreamUseCase } from '../application/get-file-stream.use-case.js';
import { JwtAuthGuard } from '../../auth/infrastructure/jwt-auth.guard.js';

@Controller('messages')
export class MessageController {
    constructor(
        private readonly getMessagesUseCase: GetMessagesUseCase,
        private readonly getFileStreamUseCase: GetFileStreamUseCase
    ) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async getMyMessages(@Req() req: any) {
        // User ID usually comes from the JWT payload
        const userId = req.user.id_usuario;
        return this.getMessagesUseCase.execute(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('download/:attachmentId')
    async downloadAttachment(
        @Param('attachmentId') attachmentId: string,
        @Response({ passthrough: true }) res: any
    ) {
        console.log(`Download request received for attachment ID: ${attachmentId}`);
        const { file, fileName, mimeType } = await this.getFileStreamUseCase.execute(attachmentId);

        // Use encodeURIComponent to support filenames with special characters (common in Spanish)
        const encodedFileName = encodeURIComponent(fileName);

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        });

        return file;
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: any) {
        const userId = req.user.id_usuario;
        const count = await this.getMessagesUseCase.executeUnreadCount(userId);
        return { count };
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        await this.getMessagesUseCase.executeMarkAsRead(id);
        return { success: true };
    }
}
