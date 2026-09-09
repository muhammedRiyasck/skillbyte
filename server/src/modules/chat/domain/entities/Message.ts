export interface IMessage {
  messageId?: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'instructor';
  content?: string;
  type: 'video' | 'image' | 'document' | 'text';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
