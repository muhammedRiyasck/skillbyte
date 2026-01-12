export interface IMessage {
  messageId?: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'instructor';
  content: string;
  type: 'text' | 'image' | 'document';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
