import { Module } from '@nestjs/common';
import { MessageController } from './infrastructure/message.controller.js';
import { GetMessagesUseCase } from './application/get-messages.use-case.js';
import { GetFileStreamUseCase } from './application/get-file-stream.use-case.js';
import { SqlServerMessageRepository } from './infrastructure/sql-server-message.repository.js';

@Module({
    controllers: [MessageController],
    providers: [
        GetMessagesUseCase,
        GetFileStreamUseCase,
        {
            provide: 'MessageRepository',
            useClass: SqlServerMessageRepository,
        },
    ],
    exports: [GetMessagesUseCase, GetFileStreamUseCase],
})
export class MessageModule { }
