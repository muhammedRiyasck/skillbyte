export interface IMessage {
    messageId: string;
    conversationId: string;
    senderId: string;
    senderRole: 'student' | 'instructor';
    content: string;
    type: 'text' | 'image' | 'document';
    fileUrl?: string | undefined;
    fileName?: string | undefined;
    isRead: boolean;
    createdAt: Date;
}
