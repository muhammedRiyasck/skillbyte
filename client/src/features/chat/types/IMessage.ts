export interface IMessage {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'instructor';
  content?: string;
  type: 'text' | 'image' | 'video' | 'document';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
  createdAt: Date;
}
