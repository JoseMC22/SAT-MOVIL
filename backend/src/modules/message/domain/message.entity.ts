export class Message {
    constructor(
        public readonly id: string,
        public readonly subject: string,
        public readonly body: string,
        public readonly senderId: string,
        public readonly createdAt: Date,
        public readonly isRead: boolean,
        public readonly attachments: Attachment[] = []
    ) { }
}

export class Attachment {
    constructor(
        public readonly id: string,
        public readonly fileName: string,
        public readonly filePath: string,
        public readonly mimeType: string
    ) { }
}

export interface MessageRepository {
    getMessagesByUserId(userId: string): Promise<Message[]>;
    getMessageById(messageId: string): Promise<Message | null>;
    getAttachmentById(attachmentId: string): Promise<Attachment | null>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(messageId: string): Promise<void>;
}
