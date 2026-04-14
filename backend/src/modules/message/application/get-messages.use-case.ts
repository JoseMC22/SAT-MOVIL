import { Inject, Injectable } from '@nestjs/common';
import { Message } from '../domain/message.entity.js';
import type { MessageRepository } from '../domain/message.entity.js';

@Injectable()
export class GetMessagesUseCase {
    constructor(
        @Inject('MessageRepository')
        private readonly messageRepository: MessageRepository
    ) { }

    async execute(userId: string): Promise<Message[]> {
        return this.messageRepository.getMessagesByUserId(userId);
    }

    async executeUnreadCount(userId: string): Promise<number> {
        return this.messageRepository.getUnreadCount(userId);
    }

    async executeMarkAsRead(messageId: string): Promise<void> {
        return this.messageRepository.markAsRead(messageId);
    }
}
