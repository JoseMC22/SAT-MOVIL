import * as common from '@nestjs/common';
import * as messageEntity from '../domain/message.entity.js';
import * as fs from 'fs';

@common.Injectable()
export class GetFileStreamUseCase {
    constructor(
        @common.Inject('MessageRepository')
        private readonly messageRepository: messageEntity.MessageRepository
    ) { }

    async execute(attachmentId: string): Promise<{ file: common.StreamableFile, fileName: string, mimeType: string }> {
        const attachment = await this.messageRepository.getAttachmentById(attachmentId);
        
        if (!attachment) {
            throw new common.NotFoundException('Adjunto no encontrado');
        }

        if (!fs.existsSync(attachment.filePath)) {
            console.error(`File not found on NAS: ${attachment.filePath}`);
            throw new common.NotFoundException('El archivo no existe en el servidor de almacenamiento (NAS)');
        }

        const fileStream = fs.createReadStream(attachment.filePath);
        return {
            file: new common.StreamableFile(fileStream),
            fileName: attachment.fileName,
            mimeType: attachment.mimeType
        };
    }
}
